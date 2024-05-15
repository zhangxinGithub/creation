import '@wangeditor/editor/dist/css/style.css'; // 引入 css

import React, { useState, useEffect } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';

function MyEditor() {
  // editor 实例
  const [editor, setEditor] = useState(null); // JS 语法

  // 编辑器内容
  const [html, setHtml] = useState('123');

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
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <>
      <div>
        <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" />
        <Editor
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={(editor) => setHtml(editor.getHtml())}
          mode="default"
          style={{ height: 'calc(100vh - 142px)', overflowY: 'hidden' }}
        />
      </div>
    </>
  );
}

export default MyEditor;
