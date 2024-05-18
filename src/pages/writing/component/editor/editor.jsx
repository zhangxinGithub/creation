import '@wangeditor/editor/dist/css/style.css'; // 引入 css

import React, { useState, useEffect } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { Boot } from '@wangeditor/editor';
import ctrlEnterModule from '@wangeditor/plugin-ctrl-enter';

//Boot.registerModule(ctrlEnterModule);
function MyEditor(props) {
  // 模拟 ajax 请求，异步设置 html
  // useEffect(() => {
  //   setTimeout(() => {
  //     setHtml('<p>hello world</p>');
  //   }, 1500);
  // }, []);

  const toolbarConfig = {
    excludeKeys: ['headerSelect', '|'],
  }; // JS 语法

  // 编辑器配置
  const editorConfig = {
    // JS 语法
    placeholder: '请在此输入内容,选择右侧AI功能可辅助您快速写作',
  };

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (props.editor == null) return;
      props.editor.destroy();
      props.setEditor(null);
    };
  }, [props.editor]);

  return (
    <>
      <div>
        <Toolbar
          editor={props.editor}
          defaultConfig={toolbarConfig}
          mode="default"
        />
        <Editor
          defaultConfig={editorConfig}
          value={props.html}
          onCreated={props.setEditor}
          onChange={(editor) => props.setHtml(editor.getHtml())}
          mode="default"
          style={{ height: 'calc(100vh - 142px)', overflowY: 'hidden' }}
        />
      </div>
    </>
  );
}

export default MyEditor;
