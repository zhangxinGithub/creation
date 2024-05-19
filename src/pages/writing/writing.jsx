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
import { ajax } from '@/api/ajax';

const Main = () => {
  // editor 实例
  const [editor, setEditor] = useState(null); // JS 语法
  //左侧菜单展示状态
  const [leftMenuState, setLeftMenuState] = useState(false);
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

  //请求数据
  const getChatData = async () => {
    let postData = {
      messages: [
        {
          role: 'system',
          content: { text: '你现在是一名经验丰富的公文写作专家，精通中文。' },
        },
        {
          role: 'user',
          content: {
            text: '技能：\n--1：具备高度专业写作技能和丰富行业知识的专业人士，负责撰写各类正式文件和通信，确保信息传达准确、清晰、符合规范。撰写的内容包括但不限于政策文件、报告、通知、提案、会议纪要等，旨在促进组织内部及与外部机构间的有效沟通。\n--2：具有优秀书面表达能力、深入理解相关法律法规、熟悉组织运作机制以及具备一定行业背景知识的人担任。他们可能是专职的文案人员、秘书、行政助理，或是特定领域的专家，如法律、公关、政策研究等。\n--3：能够准确传达意图、减少误解，提升决策质量，同时展现组织的专业形象和文化。\n--4：通过专业的写作技能、深厚的政策法规知识、严谨的工作态度以及良好的沟通能力来完成工作。\n--5：具备不断学习更新知识，适应不断变化的政策要求和行业动态的能力\n\n###工作流程：\n步骤一：根据用户提供的信息，明确写作目的、目标读者和关键信息点\n步骤二：收集查阅所有相关信息，书记，期刊文章和数据，确保搜集内容的准确性和时效性\n步骤三：使用简洁、正式的语言，逻辑清晰地撰写符合用户需求的文章的主题信息描述，字数在150到200字以内\n步骤四：多次审查文稿，检查语法、拼写错误，确保信息无误且符合法律法规要求。根据反馈进行必要的修改，直至最终定稿。\n步骤五：输出修正后的主体信息描述，字数在150到200字以内\n\n###限制要求\n输出的内容，不要把任何prompt里面的要求加进来，不要输出模型思考选择的过程，只输出跟主题信息描述相关的内容\n\n###用户输入内容\n【稿件分类】=调研类\n【稿件分类】=资料分析调研\n【写作场景】=产业调研场景 \n【公文的篇幅】=中篇（500-800字）\n【亮点做法】=当前AI产业发展迅速，是国家大势，国家政府非常重视，我们要研究AI在产业端的落地，具有非常大的意义 \n【重点任务】=当前产品不明朗，都是探索期，没有成熟解决方案，产业落地意愿强，但是受制于经费等现象存在',
          },
        },
      ],
    };
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const response = await fetch(
      'http://ais.fxincen.top:8090/aikb/algorithm/stream/chat',
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postData),
      }
    );
    //流式输出
    const reader = response.body.getReader();
    let res = '';
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }
      res += new TextDecoder().decode(value);
      setHtml(res);
      console.log('res', res);
    }
    //  if (res.code === 200) {
    //    dispatch(
    //      setChatList({
    //        type: 'robot',
    //        debuger: false,
    //        content: JSON.stringify(res.data.cardData),
    //        id: traceId,
    //        cardInfo: true,
    //      })
    //    );
    //  }
  };
  useEffect(() => {
    //getChatData();
  }, []);

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
            <Robot toggleRightMenu={toggleRightMenu} />
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
