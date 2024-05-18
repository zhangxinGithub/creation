import React, { useRef, useEffect, useState } from 'react';
import { Radio, Button } from 'antd';
import Editor from './component/editor/editor';
import RightBlock from './component/right-block/right-block';
import stepIcon from '@/assets/img/step.png';
import aiIcon from '@/assets/img/xiaozhi.png';
import './index.less';
import StepModel from './component/step-model/step-model';
import Robot from './component/robot/robot';
import essayIcon from '@/assets/img/essay.png';
import homeIcon from '@/assets/img/home.png';
import checkIcon from '@/assets/img/check.png';
import '@/common/html-docx';
import FileSaver from 'file-saver';
import Upload from './component/upload/upload';
import { docList } from '@/doc/docx';

const Main = () => {
  // editor 实例
  const [editor, setEditor] = useState(null); // JS 语法
  //左侧菜单展示状态
  const [leftMenuState, setLeftMenuState] = useState(true);
  //右侧菜单展示状态
  const [rightMenuState, setRightMenuState] = useState(false);
  // 编辑器内容
  const [html, setHtml] = useState();
  //左侧菜单radio选中值
  const [radioValue, setRadioValue] = useState('0');
  const stepModelRef = useRef({});
  const showStepModel = (params) => {
    if (stepModelRef.current) {
      console.log(stepModelRef.current);
      stepModelRef.current.showModal(params);
    }
  };
  //切换左侧菜单
  const toggleLeftMenu = () => {
    setLeftMenuState(!leftMenuState);
  };
  //切换右侧菜单
  const toggleRightMenu = () => {
    setRightMenuState(!rightMenuState);
  };
  const [editList, setEditList] = useState([
    {
      title: '步骤写作',
      icon: stepIcon,
      callBack: showStepModel,
    },
    {
      title: 'AI校对',
      icon: checkIcon,
      callBack: showStepModel,
    },
    {
      title: '妙笔AI',
      icon: aiIcon,
      callBack: toggleRightMenu,
    },
  ]);
  //导出文章
  const exportArticle = () => {
    console.log(html);
    exportToDocx(html);
  };

  const exportToDocx = (htmlContent, fileName = 'exported-document.docx') => {
    // 构建包含 HTML 内容的完整 HTML 文档字符串
    const fullHtmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

    // 使用 html-docx-js 将 HTML 转换为 Word 文档的 Blob 对象
    const converted = window.htmlDocx.asBlob(fullHtmlContent);

    // 使用 file-saver 保存 Blob 对象为 Word 文档文件
    FileSaver.saveAs(converted, fileName);
  };
  return (
    <div className="writing">
      <div className="left-menu">
        <div>
          <img src={homeIcon} />
          <div>主页</div>
        </div>
        <div>
          <img src={essayIcon} onClick={toggleLeftMenu} />
          <div>范文</div>
        </div>
      </div>
      <div className="container">
        <div className="top-bar">
          <div>编辑文档</div>
          <Button type="primary" onClick={exportArticle}>
            文章导出
          </Button>
        </div>
        <div className="content">
          <div
            className="left-body"
            style={{
              width: leftMenuState ? '200px' : '0px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <Radio.Group
                value={radioValue}
                onChange={() => {
                  if (radioValue === '0') {
                    setRadioValue('1');
                  } else {
                    setRadioValue('0');
                  }
                }}
                style={{ margin: 'auto' }}
              >
                <Radio.Button value="0">模板库</Radio.Button>
                <Radio.Button value="1">上传范文</Radio.Button>
              </Radio.Group>
            </div>
            {radioValue !== '0' ? (
              <div>
                <Upload editor={editor} setHtml={setHtml} />
              </div>
            ) : (
              <div className="doc-list">
                {docList.map((item, index) => {
                  return (
                    <div
                      className="doc-item"
                      key={index}
                      onClick={() => {
                        setHtml(item.data);
                      }}
                    >
                      <div className="doc-title">{item.name}</div>
                      <div className="doc-content">{item.fragment}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="center-body">
            <Editor
              editor={editor}
              setEditor={setEditor}
              html={html}
              setHtml={setHtml}
            />
          </div>
          <div
            className="right-body"
            style={{
              width: rightMenuState ? '300px' : '0px',
            }}
          >
            <Robot />
          </div>
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
            <div>{item.title}</div>
          </div>
        ))}
      </div>
      {/* <RightBlock /> */}
      <StepModel ref={stepModelRef} />
    </div>
  );
};

export default Main;