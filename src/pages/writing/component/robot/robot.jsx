import React, { useState, useEffect, useImperativeHandle } from 'react';
import logo from '@/assets/img/xiaozhilogo.png';
import { Input, message, Upload, Button, Popover, Dropdown } from 'antd';
import './robot.less';
import palm from '@/assets/img/palm.png';
import send from '@/assets/img/send.png';
import axios from 'axios';
import {
  CloseCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { cloneDeep, set } from 'lodash';
import { writingAssistant } from '../step-model/data';

const { TextArea } = Input;
const config = {
  name: 'documentList',
  action: 'http://ais.fxincen.top:8030/aikb/v1/doc/upload',
  multiple: true,
  maxCount: 5,
  showUploadList: false,
};

let typeArr = ['汇报类', '调研类', '规划类', '方案类', '讲话类', '演讲类'];
const Robot = (props, ref) => {
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
    let list = chatList.concat();
    list.push({
      type: 'USER',
      value: inputValue,
    });
    console.log('list', list);
    setChatList(list);
    setInputValue('');
  };
  //选择option
  const selectOption = (value) => {
    if (value === writingOptions) {
      setWritingOptions(0);
      return;
    }
    setWritingOptions(value);
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
    postData.messages.push({
      role: 'USER',
      content: { text: text },
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
  //文档上传
  const handleUpload = async (file) => {
    let formData = new FormData();
    formData.append('documentList', file);
    try {
      const res = await axios.post('/nbi/crm/sub/attachFile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('res', res);
    } catch (error) {
      s;
      console.log('error', error);
    }
  };
  const content = (
    <div className="page-list">
      <div className="table-hr">
        <div>名称</div>
        <div>切换是否完成</div>
        <div>删除</div>
      </div>
      <div className="table-th">
        <div>文件1</div>
        <div>文件1</div>
        <div>文件1</div>
      </div>
    </div>
  );
  //监听chatList
  useEffect(() => {
    if (chatList.length > 0) {
      let last = chatList[chatList.length - 1];
      if (last.type === 'USER') {
        //请求数据
        getChatData(inputValue);
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
  useEffect(() => {}, []);

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
            如果基于本地知识库检索问题和答案，请点击“AI知识检索”
            如果创作只需AI大模型能力支持，请点击“AI对话”。
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
                    <div className="robot-btn">重新生成</div>
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
              <Upload {...config}>
                <Button type="text" size="small" icon={<UploadOutlined />}>
                  文件上传
                </Button>
              </Upload>
              <Popover content={content} trigger="click">
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
            placeholder="请输入你的问题,例如:写一篇乡镇基层工作周报(shift+enter)"
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
