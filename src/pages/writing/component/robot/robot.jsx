import React, { useState, useEffect, useImperativeHandle } from 'react';
import logo from '@/assets/img/xiaozhilogo.png';
import { Input, message, Upload, Button, Popover, Dropdown, Modal } from 'antd';
import './robot.less';
import palm from '@/assets/img/palm.png';
import send from '@/assets/img/send.png';
import {
  CloseCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { cloneDeep } from 'lodash';
import { writingAssistant } from '../step-model/data';

const { TextArea } = Input;
const config = {
  name: 'documentList',
  action: 'http://ais.fxincen.top:8030/aikb/v1/doc/upload',
  multiple: true,
  maxCount: 5,
  showUploadList: false,
};
let timer = null;
//流式定时器
let streamTimer = null;
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
    let resList = [];
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        let obj = cloneDeep(copyChatList);
        resList.map((item) => {
          let resObj = JSON.parse(item);
          globalRes += resObj.body;
        });
        obj[obj.length - 1] = {
          type: 'ASSISTANT',
          value: globalRes,
          reference: cloneDeep(reference),
        };
        setChatList(obj);
        el.scrollTop = el.scrollHeight;
        break;
      }

      //解析对象
      let res = new TextDecoder().decode(value);
      if (res && res !== ' ') {
        res = res.replace(/data:/g, '');
        // res = res.replace(/\n\n$/, '!@&');
        // globalRes += res;
        // //将尾部双换行符改成\n\n
        // console.log('globalRes', globalRes);
        // //切分globalRes成数组
        // let arr = globalRes.split('');
        // resList.concat(arr);
        // console.log('resList', resList);
        // console.log('resList', resList);
        //只去掉尾部双换行符
        res = res.replace(/\n\n$/, '');
        if (res) {
          resList.push(res);
          console.log('resList', resList);

          //消费resList中的第一条数据
          if (resList.length > 0) {
            let last = resList[0];
            //如果last是字符串中有双换行符则拆分成数组
            if (last.indexOf('\n\n') > -1) {
              console.log('????????????');
              let arr = last.split('\n\n');
              console.log('arr11111111', arr);
              //删除resList中的第一条数据
              resList.shift();
              //将arr中的数据插入到resList最前面
              resList = arr.concat(resList);
              console.log('resList2222222', resList);
            }
            let resObj = JSON.parse(resList[0]);
            let obj = cloneDeep(copyChatList);
            if (resObj.type === 'MESSAGE') {
              globalRes += resObj.body;
              obj[obj.length - 1].value = globalRes;
              el.scrollTop = el.scrollHeight;
              setChatList(obj);
            }
            if (resObj.type === 'REFERENCE') {
              if (resObj.body !== '[]') {
                reference = resObj.body;
              }
            }
            //删除resList中的第一条数据
            await resList.shift();
          }
        }
      }
    }
  };
  //文档上传
  const upLoadChange = (info) => {
    console.log('info', info);
    //如果上传成功,则保存到fileList中
    if (info.file.status === 'done') {
      let list = fileList.concat();
      list.push(info.file);
      //只保留最后5个文件
      if (list.length > 5) {
        list = list.slice(-5);
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
    const response = await fetch(
      `http://ais.fxincen.top:8030/aikb/v1/doc?id=${idList.join('&')}`,
      {
        method: 'get',
        headers: headers,
      }
    );
    let res = await response.json();
    console.log('res', res);
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
          {arr.map((item, index) => {
            return (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div style={{ color: '#5c8bf7' }}>{item.title}</div>
                <div>{item.content}</div>
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
    console.log('inputValue', inputValue);
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
      }, 3000);
    }
    if (!open) {
      console.log('clear');
      //清除定时器
      clearInterval(timer);
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
                <div className="robot-text">{item.value}</div>
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
