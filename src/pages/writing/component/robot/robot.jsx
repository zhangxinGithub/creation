import React, { useState, useEffect, useImperativeHandle } from 'react';
import logo from '@/assets/img/xiaozhilogo.png';
import { Input } from 'antd';
import './robot.less';

const { TextArea } = Input;
const Robot = (props, ref) => {
  return (
    <div className="robot">
      <div className="header">
        <img src={logo} />
        小智AI
      </div>
      <div className="middle">1</div>
      <div className="footer">
        <div className="textArea-body">
          <TextArea rows={5} />
          123
        </div>
      </div>
    </div>
  );
};

export default Robot;
