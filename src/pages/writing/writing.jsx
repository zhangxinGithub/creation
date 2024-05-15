import React, { useRef, useEffect, useState } from 'react';
import { Button } from 'antd';
import { ajax } from '@/api/ajax';
import Editor from './component/editor/editor';
import RightBlock from './component/right-block/right-block';
import stepIcon from '@/assets/img/step.png';
import aiIcon from '@/assets/img/xiaozhi.png';
import './index.less';
import StepModel from './component/step-model/step-model';

const Main = () => {
  const stepModelRef = useRef({});
  const showStepModel = (params) => {
    if (stepModelRef.current) {
      console.log(stepModelRef.current);
      stepModelRef.current.showModal(params);
    }
  };
  const [editList, setEditList] = useState([
    {
      title: '步骤写作',
      icon: stepIcon,
      callBack: showStepModel,
    },
    {
      title: '妙笔AI',
      icon: aiIcon,
    },
  ]);

  return (
    <div className="writing">
      <div className="left-menu">123</div>
      <div className="container">
        <div className="top-bar">编辑文档</div>
        <div className="content">
          <div className="left-body"></div>
          <div className="center-body">
            <Editor />
          </div>
          <div className="right-body"></div>
        </div>
      </div>
      <div className="right-menu">
        {editList.map((item, index) => (
          <div
            key={index}
            className="menu-item"
            onClick={() => {
              item.callBack();
            }}
          >
            <img src={item.icon} alt="" />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
      {/* <RightBlock /> */}
      <StepModel ref={stepModelRef} />
    </div>
  );
};

export default Main;
