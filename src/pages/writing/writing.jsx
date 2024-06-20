import React, { useEffect, useRef, useState } from 'react';
import { Radio, Button, Space, message } from 'antd';
import Editor from './component/editor/editor';
import stepIcon from '@/assets/img/step.png';
import aiIcon from '@/assets/img/xiaozhi.png';
import './index.less';
import StepModel from './component/step-model/step-model';
import Robot from './component/robot/robot';
import Compare from './component/compare/compare';
import essayIcon from '@/assets/img/essay.png';
import groupIcon from '@/assets/img/group.png';
import homeIcon from '@/assets/img/home.png';
import checkIcon from '@/assets/img/check.png';
import '@/common/html-docx';
import FileSaver from 'file-saver';
import Upload from './component/upload/upload';
import { docList } from '@/doc/docx';
import GroupDrawer from './component/group-drawer/group-drawer';

let compareWidth = 450;
//保存高亮前的html
let htmlCopy = '';
const Main = () => {
  const drawerRef = useRef({});
  // editor 实例
  const [editor, setEditor] = useState(null); // JS 语法
  //左侧菜单展示状态
  const [leftMenuState, setLeftMenuState] = useState(false);
  //右侧菜单展示状态
  const [rightMenuWidth, setRightMenuState] = useState(0);
  // 编辑器内容
  const [html, setHtml] = useState();
  //左侧菜单radio选中值
  const [radioValue, setRadioValue] = useState('0');
  //预览html
  const [preHtml, setPreHtml] = useState('');
  const stepModelRef = useRef({});
  //全局loading
  const [globalLoading, setGlobalLoading] = useState(false);

  const [preHtmlCopy, setPreHtmlCopy] = useState('');

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
  const toggleRightMenu = (width) => {
    if (width === rightMenuWidth) {
      setRightMenuState(0);
    } else {
      setRightMenuState(width);
    }
  };
  const editList = [
    {
      title: '步骤写作',
      icon: stepIcon,
      callBack: showStepModel,
    },
    {
      title: 'AI校对',
      icon: checkIcon,
      callBack: () => {
        console.log('AI校对', html);
        if (html === '<p><br></p>') {
          message.info('校对前请先编写文章');
          return;
        }
        htmlCopy = html;
        toggleRightMenu(compareWidth);
      },
    },
    {
      title: '妙笔AI',
      icon: aiIcon,
      callBack: () => {
        toggleRightMenu(300);
      },
    },
  ];

  //导出文章
  const exportArticle = () => {
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
  const highLight = (text, keyword) => {
    //在text中高亮显示keyword
    const reg = new RegExp(keyword, 'g');
    return text.replace(reg, `<b   style="color:red">${keyword}</b>`);
  };
  const onSearch = (value) => {
    console.log(value);
    if (!value) {
      setHtml(htmlCopy);
      setPreHtml(preHtmlCopy);
      return;
    }
    let str = htmlCopy;
    let str1 = preHtmlCopy;
    setHtml(highLight(str, value));
    setPreHtml(highLight(str1, value));
  };

  return (
    <div className="writing">
      {globalLoading && (
        <div
          className="global-loading"
          onClick={(e) => {
            //禁止冒泡
            e.stopPropagation();
          }}
        >
          <div
            className="virtual-btn"
            onClick={() => {
              setGlobalLoading(false);
            }}
          ></div>
        </div>
      )}
      <div className="left-menu">
        <div>
          <img src={homeIcon} />
          <div>主页</div>
        </div>
        <div>
          <img src={essayIcon} onClick={toggleLeftMenu} />
          <div>范文</div>
        </div>
        <div>
          <img
            src={groupIcon}
            onClick={() => {
              drawerRef.current.showDrawer();
            }}
          />
          <div>组装</div>
        </div>
      </div>
      <div className="container">
        <div className="top-bar">
          <div>编辑文档</div>
          <Space>
            {globalLoading && <Button danger>放弃生成</Button>}
            <Button type="primary" onClick={exportArticle}>
              文章导出
            </Button>
          </Space>
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
              rightMenuState={rightMenuWidth}
              editor={editor}
              setEditor={setEditor}
              html={html}
              setHtml={setHtml}
            />
          </div>
          <div
            className="right-body"
            style={{
              width: `${rightMenuWidth}px`,
            }}
          >
            {rightMenuWidth === 300 ? (
              <Robot
                html={html}
                setHtml={setHtml}
                toggleRightMenu={toggleRightMenu}
              />
            ) : rightMenuWidth === compareWidth ? (
              <Compare
                html={preHtml}
                preHtmlCopy={preHtmlCopy}
                setPreHtmlCopy={setPreHtmlCopy}
                setHtml={setPreHtml}
                search={onSearch}
              />
            ) : null}
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
      <StepModel
        ref={stepModelRef}
        html={html}
        setHtml={setHtml}
        setGlobalLoading={setGlobalLoading}
        globalLoading={globalLoading}
      />
      <GroupDrawer ref={drawerRef} setHtml={setHtml} />
    </div>
  );
};

export default Main;
