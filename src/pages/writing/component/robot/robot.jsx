import React, { useState, useEffect, useImperativeHandle } from 'react';
import logo from '@/assets/img/xiaozhilogo.png';
import { Input } from 'antd';
import './robot.less';
import palm from '@/assets/img/palm.png';
import send from '@/assets/img/send.png';
import { CloseCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const Robot = (props, ref) => {
  const [writingOptions, setWritingOptions] = useState(0);
  //聊天记录
  const [chatList, setChatList] = useState([
    {
      type: 'user',
      value: '123123123123',
    },
    {
      type: 'robot',
      value: '1111111111',
    },
  ]);
  //输入框信息
  const [inputValue, setInputValue] = useState('');
  //发送消息
  const sendMessage = () => {
    console.log('sendMessage');
    let list = chatList.push({
      type: 'user',
      value: inputValue,
    });
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
  //

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
                <div className="robot-text">123</div>
                <div className="robot-btns">
                  <div className="robot-btn">插入左侧</div>
                  <div className="robot-btn">复制</div>
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
            <div className="count">0/400</div>
            <img src={send} onClick={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Robot;
