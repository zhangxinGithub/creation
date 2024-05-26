import React, { useState, useEffect, useImperativeHandle } from 'react';
import logo from '@/assets/img/xiaozhilogo.png';
import { Input, message, Upload, Button } from 'antd';
import './robot.less';
import palm from '@/assets/img/palm.png';
import send from '@/assets/img/send.png';
import axios from 'axios';
import { CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const Robot = (props, ref) => {
  const [writingOptions, setWritingOptions] = useState(0);
  //聊天记录
  const [chatList, setChatList] = useState([]);
  //输入框信息
  const [inputValue, setInputValue] = useState('');
  //loading
  const [loading, setLoading] = useState(false);
  //定时器
  let timer = null;
  //发送消息
  const sendMessage = () => {
    console.log('sendMessage');
    let list = chatList.concat();
    list.push({
      type: 'user',
      value: inputValue,
    });
    setChatList(list);
    getChatData(inputValue);
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
  //请求数据
  const getChatData = async (text) => {
    let postData = {
      messages: [
        {
          role: 'system',
          content: { text: '你现在是一名经验丰富的公文写作专家，精通中文。' },
        },
        {
          role: 'user',
          content: { text: text },
        },
      ],
    };
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
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
    let res = '';
    let copyChatList = chatList.concat();
    copyChatList.push({
      type: 'robot',
      value: '',
    });
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }
      res += new TextDecoder().decode(value);
      console.log('res', res);
      copyChatList[copyChatList.length - 1].value = res;
      setChatList(copyChatList);
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
      <div className="middle">
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
          if (item.type === 'user') {
            return (
              <div className="user" key={index}>
                <div className="user-text">{item.value}</div>
              </div>
            );
          }
          if (item.type === 'robot') {
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
          <div
            className={writingOptions === 1 ? 'action' : ''}
            onClick={() => {
              selectOption(1);
            }}
          >
            AI创作助手
          </div>
          <div
            className={writingOptions === 2 ? 'action' : ''}
            onClick={() => {
              selectOption(2);
            }}
          >
            AI知识检索
          </div>
        </div>
        <div className="textArea-body">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="textArea"
            style={{ fontSize: '12px', resize: 'none', border: 'none' }}
            placeholder="请输入你的问题,例如:写一篇乡镇基层工作周报(shift+enter)"
            rows={5}
          />
          <div className="textArea-footer">
            <div className="footer-left">
              <div className="count">{inputValue.length}/400</div>
              <div className="document-upload">
                <Upload>
                  <Button type="text" size="small" icon={<UploadOutlined />}>
                    文件上传
                  </Button>
                </Upload>
              </div>
            </div>
            <img src={send} onClick={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Robot;
