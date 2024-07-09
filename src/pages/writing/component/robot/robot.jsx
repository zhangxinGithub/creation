import React, { useState, useEffect, useImperativeHandle } from 'react';
import logo from '@/assets/img/xiaozhilogo.png';
import {
  Input,
  message,
  Upload,
  Button,
  Popover,
  Dropdown,
  Modal,
  Tag,
} from 'antd';
import './robot.less';
import palm from '@/assets/img/palm.png';
import send from '@/assets/img/send.png';
import {
  CloseCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { cloneDeep, find } from 'lodash';
import { writingAssistant } from '../step-model/data';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

const { TextArea } = Input;
const config = {
  name: 'documentList',
  action: 'http://ais.fxincen.top:8030/aikb/v1/doc/upload',
  multiple: true,
  maxCount: 30,
  showUploadList: false,
};
let timer = null;
//流式定时器
let streamTimer = null;
//loading状态
let loading = false;
let typeArr = ['汇报类', '调研类', '规划类', '方案类', '讲话类', '演讲类'];
const Robot = (props, ref) => {
  const [open, setOpen] = useState(false);
  //已经上传文件的列表
  const [fileList, setFileList] = useState([]);

  const [writingOptions, setWritingOptions] = useState(0);
  //聊天记录
  const [chatList, setChatList] = useState([]);
  //输入框信息
  const [inputValue, setInputValue] = useState('');
  //文件上传状态
  const [fileStatus, setFileStatus] = useState(false);
  //创作助手类型
  const [writingType, setWritingType] = useState('');
  //发送消息
  const sendMessage = () => {
    //如果没有上传文件禁止使用rag
    if (writingOptions === 2 && fileList.length === 0) {
      message.error('请先上传文件');
      return;
    }
    let list = chatList.concat();
    list.push({
      type: 'USER',
      value: inputValue,
    });
    console.log('list', list);
    setChatList(list);
  };
  //选择option
  const selectOption = (value) => {
    const okCallback = () => {
      setChatList([]);
      if (value === writingOptions) {
        setWritingOptions(0);
        return;
      }
      setWritingOptions(value);
    };
    if (chatList.length > 0) {
      Modal.confirm({
        title: '提示',
        content: '切换状态会清空聊天记录，是否继续？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          okCallback();
        },
        onCancel() {},
      });
    } else {
      okCallback();
    }
  };
  //复制text到剪切板
  const copyText = (text) => {
    var input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
    message.success('复制成功');
  };
  //将文本插入到编辑器中
  const insertText = (text) => {
    if (props.html !== '<p><br></p>') {
      props.setHtml(props.html + `<p>${text}</p>`);
    } else {
      props.setHtml(`<p>${text}</p>`);
    }
  };
  let items = [];
  items = typeArr.map((item, index) => {
    return {
      key: item,
      label: (
        <a
          style={{ color: writingType === item ? '#5c8bf7' : '#666' }}
          onClick={() => {
            selectOption(1);
            setWritingType(item);
          }}
        >
          {item}
        </a>
      ),
    };
  });
  //请求数据
  const getChatData = async (text) => {
    let el = document.getElementById('middle-scroll');

    let postData = {
      messages: [
        {
          role: 'SYSTEM',
          content: { text: '你现在是一名经验丰富的公文写作专家，精通中文。' },
        },
      ],
      modelConfig: {
        stream: true,
      },
    };
    if (writingOptions === 1) {
      postData.messages.push({
        role: 'USER',
        content: { text: writingAssistant.type[writingType] },
      });
    }
    chatList.map((item) => {
      postData.messages.push({
        role: item.type,
        content: { text: item.value },
      });
    });
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    let res = '';
    let copyChatList = cloneDeep(chatList);
    copyChatList.push({
      type: 'ASSISTANT',
      value: '',
    });
    setChatList(copyChatList);
    const response = await fetch(
      'http://ais.fxincen.top:8030/aikb/v1/chat/sessionless',
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postData),
      }
    );
    //流式输出
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }
      res += new TextDecoder().decode(value);
      //删除res中'data:'
      res = res.replace(/data:/g, '');
      //删除res中的换行符
      res = res.replace(/\n/g, '');
      let obj = cloneDeep(copyChatList);
      obj[obj.length - 1].value = res;
      setChatList(obj);
      el.scrollTop = el.scrollHeight;
    }
  };
  function canParseJSON(str) {
    try {
      JSON.parse(str);
      return true; // 字符串可以解析成JSON
    } catch (e) {
      return false; // 字符串不能解析成JSON
    }
  }
  //RAG检索
  const getRagData = async (text) => {
    console.log('text', text);
    let el = document.getElementById('middle-scroll');
    let postData = {
      documentIds: [],
      text: text,
      modelConfig: {
        stream: true,
      },
    };
    postData.documentIds = fileList.map((item) => {
      return item.response.payload[0].id;
    });
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    let globalRes = '';
    let reference = '';
    let copyChatList = cloneDeep(chatList);
    copyChatList.push({
      type: 'ASSISTANT',
      value: '',
      reference: '',
    });
    setChatList(copyChatList);
    const response = await fetch('http://ais.fxincen.top:8030/aikb/v1/search', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData),
    });
    //流式输出
    const reader = response.body.getReader();
    loading = true;
    //开启定时器
    streamTimer = setInterval(() => {
      console.log('streamBody', globalRes);
      let obj = cloneDeep(copyChatList);
      obj[obj.length - 1] = {
        type: 'ASSISTANT',
        value: globalRes,
        reference: cloneDeep(reference),
      };
      setChatList(obj);
      el.scrollTop = el.scrollHeight;
      //查看globalRes最后一个字符是不是特殊字符
      if (globalRes.indexOf('⁠⁣ ') > -1) {
        //console.log('停止');
        clearInterval(streamTimer);
        streamTimer = null;
        loading = false;
        //funcAction();
        //结束
      }
    }, 500);
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        globalRes += '⁠⁣ ';
        break;
      }

      //解析对象
      let res = await new TextDecoder().decode(value);
      if (res && res !== ' ') {
        res = res.replace(/data:/g, '');
        //只去掉尾部双换行符
        res = res.replace(/\n\n$/, '');
        //如果res中有双换行符则拆分成数组
        if (res.indexOf('\n\n') > -1) {
          let arr = res.split('\n\n');
          console.log('多段一起返回了', arr);
          res = {
            type: 'MESSAGE',
            body: arr
              .filter((item) => item !== '')
              .map((item) => {
                item = JSON.parse(item);
                return item.body;
              })
              .join(''),
          };
          res = JSON.stringify(res);
        }
        if (res) {
          console.log('res', res);
          if (canParseJSON(res)) {
            let resObj = JSON.parse(res);
            if (resObj.type === 'REFERENCE') {
              if (resObj.body !== '[]') {
                reference = resObj.body;
              }
            }
            if (resObj.type === 'MESSAGE') {
              globalRes += resObj.body;
            }
          }
        }
      }
    }
  };
  //文档上传
  const upLoadChange = (info) => {
    //如果上传成功,则保存到fileList中
    if (info.file.status === 'done') {
      console.log('info', info);
      let list = fileList.concat();
      list.push(info.file);
      //只保留最后5个文件
      if (list.length > config.maxCount) {
        list = list.slice(-config.maxCount);
      }
      list.map((item) => {
        item.sectionType = '切片中';
        return item;
      });
      setFileList(list);
    }
  };
  //删除已经上传的文件
  const deleteFile = async (id, index) => {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const response = await fetch(
      `http://ais.fxincen.top:8030/aikb/v1/doc?id=${id}`,
      {
        method: 'delete',
        headers: headers,
      }
    );
    let res = await response.json();
    console.log('res', res);

    let list = fileList.concat();
    list.splice(index, 1);
    setFileList(list);
    return res;
  };
  const content = (
    <div className="page-list">
      <div className="table-hr">
        <div style={{ width: '80px' }}>名称</div>
        <div style={{ width: '40px', paddingLeft: '4px' }}>状态</div>
        <div>删除</div>
      </div>
      {fileList.map((item, index) => {
        return (
          <div key={index} className="table-th">
            <div style={{ width: '80px' }}>{item.name}</div>
            <div style={{ width: '40px', paddingLeft: '4px' }}>
              {item.sectionType}
            </div>
            <div>
              <CloseOutlined
                style={{ color: 'red', cursor: 'pointer' }}
                onClick={() => {
                  deleteFile(item.response.payload[0].id, index);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
  //传入文本id数组检测文章是否切片完成
  const checkFileStatus = async (idList) => {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    let str = idList.map((item) => `id=${item}`).join('&');
    const response = await fetch(
      `http://ais.fxincen.top:8030/aikb/v1/doc?${str}`,
      {
        method: 'get',
        headers: headers,
      }
    );
    let res = await response.json();
    //更新fileList中的sectionType
    let cloneList = cloneDeep(fileList);
    cloneList.map((item) => {
      if (item.sectionType === '切片中') {
        let doc = find(res.payload, { id: item.response.payload[0].id });
        if (doc && doc.splitStatus === 'SPLIT_COMPLETED') {
          item.sectionType = '已完成';
        }
      }
      return item;
    });
    setFileList(cloneList);
    return res;
  };
  //调用检测文章是否切片完成
  const checkFile = () => {
    checkFileStatus(
      fileList
        .filter((item) => item.sectionType === '切片中')
        .map((item) => item.response.payload[0].id)
    ).then((res) => {
      console.log('res111111', res);
    });
  };
  //使用modal展示命中片段
  const showReference = (reference) => {
    let arr = [];
    console.log('reference', reference);
    if (reference) {
      arr = JSON.parse(reference);
    } else {
      message.error('未命中片段');
      return;
    }

    Modal.info({
      title: '命中片段',
      width: '800px',
      content: (
        <div>
          {arr
            .filter((item, index) => {
              //score相同的只展示一个
              return (
                arr.findIndex((item2) => item2.score === item.score) === index
              );
            })
            .map((item, index) => {
              return (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ color: '#5c8bf7' }}>
                    {item.title}
                    <Tag style={{ marginLeft: '10px' }} color="processing">
                      相似度:{item.score}
                    </Tag>
                  </div>
                  <pre
                    style={{
                      marginBottom: '10px',
                      width: '100%',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {item.content}
                  </pre>
                </div>
              );
            })}
        </div>
      ),
    });
  };
  //重新生成
  const reGenerate = () => {
    let list = chatList.concat();
    //将最后一个user对话记录下来
    // let lastValue = list.filter((item) => item.type === 'USER')[list.length - 1]
    //   .value;
    let lastItem = list.filter((item) => item.type === 'USER');
    let lastValue = lastItem[lastItem.length - 1].value;

    setInputValue(lastValue);
    list.pop();
    setChatList(list);
  };

  //监听chatList
  useEffect(() => {
    if (chatList.length > 0) {
      let last = chatList[chatList.length - 1];
      if (last.type === 'USER') {
        //请求数据
        if (writingOptions === 2) {
          getRagData(inputValue);
        } else {
          getChatData(inputValue);
        }
        //删除输入框内容
        setInputValue('');
      }
    }
  }, [chatList]);
  useEffect(() => {
    if (writingOptions === 2) {
      setFileStatus(true);
    } else {
      setFileStatus(false);
    }
  }, [writingOptions]);
  useEffect(() => {
    if (open) {
      checkFile();
      //创建定时器
      timer = setInterval(() => {
        checkFile();
      }, 5000);
    }
    if (!open) {
      console.log('clear');
      //清除定时器
      clearInterval(timer);
      timer = null;
    }
  }, [open]);

  return (
    <div className="robot">
      <div className="header">
        <div className="robot-logo">
          <img src={logo} />
          小智AI
        </div>
        <CloseCircleOutlined
          onClick={() => {
            props.toggleRightMenu(0);
          }}
          style={{ color: '#666', cursor: 'pointer' }}
        />
      </div>
      <div className="middle" id="middle-scroll">
        <div className="info">
          <div className="info-title">
            <img src={palm} />
            Hi，我是小智AI
          </div>
          <div className="info-body">
            嗨，很高兴为您服务！
            <br /> 如果创作需要AI助手引导，请点击“AI创作助手”
            如果基于本地知识库检索问题和答案，请点击“AI知识检索”。
          </div>
        </div>
        {chatList.map((item, index) => {
          if (item.type === 'USER') {
            return (
              <div className="user" key={index}>
                <div className="user-text">{item.value}</div>
              </div>
            );
          }
          if (item.type === 'ASSISTANT' && item.value === '') {
            return (
              <div className="robot" key={index}>
                <div className="robot-text">加载中...</div>
              </div>
            ); //加载状态
          }
          if (item.type === 'ASSISTANT' && item.value !== '') {
            return (
              <div className="robot" key={index}>
                <div className="robot-text">
                  <ReactMarkdown remarkPlugins={[gfm]}>
                    {item.value}
                  </ReactMarkdown>
                </div>
                <div className="robot-btns">
                  <div
                    className="robot-btn"
                    onClick={() => {
                      insertText(item.value);
                    }}
                  >
                    插入左侧
                  </div>
                  <div
                    className="robot-btn"
                    onClick={() => {
                      copyText(item.value);
                    }}
                  >
                    复制
                  </div>
                  {chatList.length === index + 1 && (
                    <div
                      className="robot-btn"
                      onClick={() => {
                        reGenerate();
                      }}
                    >
                      重新生成
                    </div>
                  )}
                  {writingOptions === 2 && (
                    <div
                      className="robot-btn"
                      onClick={() => {
                        showReference(item.reference);
                      }}
                    >
                      查看命中片段
                    </div>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>
      <div className="footer">
        <div className="writing-options">
          <div className="options-left">
            <Dropdown
              menu={{
                items,
              }}
              placement="topLeft"
              arrow
            >
              <div
                className={
                  writingOptions === 1 ? 'option-btn action' : 'option-btn'
                }
              >
                AI创作助手
              </div>
            </Dropdown>
            <div
              className={
                writingOptions === 2 ? 'option-btn action' : 'option-btn'
              }
              onClick={() => {
                selectOption(2);
              }}
            >
              AI知识检索
            </div>
          </div>
          {fileStatus && (
            <div className="document-upload">
              <Upload {...config} onChange={upLoadChange}>
                <Button type="text" size="small" icon={<UploadOutlined />}>
                  文件上传
                </Button>
              </Upload>
              <Popover
                content={content}
                trigger="click"
                open={open}
                onOpenChange={setOpen}
              >
                <FileTextOutlined
                  style={{
                    color: '#5c8bf7',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                />
              </Popover>
            </div>
          )}
        </div>
        <div className="textArea-body">
          <TextArea
            maxLength={400}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault();

              //如果是shift+enter换行
              console.log('e.shiftKey', e);
              if (e.shiftKey) {
                setInputValue(inputValue + '\n');
              } else {
                if (inputValue === '') {
                  return;
                }
                sendMessage();
              }
            }}
            className="textArea"
            style={{ fontSize: '12px', resize: 'none', border: 'none' }}
            placeholder="帮我把以下文字内容进行丰富，写到200字，内容如下：
[尽管 AI 技术在理论和实验室环境中取得了显著进展，但在实际产业应用中，仍然缺乏成熟的解决方案。](shift+enter)"
            rows={5}
          />
          <div className="textArea-footer">
            <div className="footer-left">
              <div className="count">{inputValue.length}/400</div>
            </div>
            <img src={send} onClick={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Robot;
