import '@wangeditor/editor/dist/css/style.css'; // 引入 css

import React, { useState, useEffect, useRef } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import WrapperComponent from '@/common/wrapperComponent';
function MyEditor(props) {
  const toolbarRef = useRef(null);
  // 工具栏高度
  const [toolbarHeight, setToolbarHeight] = useState(80);
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
  useEffect(() => {
    if (toolbarRef.current) {
      const childDOMNode = toolbarRef.current.getDOMNode();
      //获取高度
      const height = childDOMNode.offsetHeight;
      console.log(height); // 打印子组件的DOM节点
      setToolbarHeight(height);
    }
    //获取toolbar高度
  }, [props.rightMenuState]);

  return (
    <>
      <div style={{ height: 'calc(100vh - 150px)' }}>
        <WrapperComponent ref={toolbarRef}>
          <Toolbar
            editor={props.editor}
            defaultConfig={toolbarConfig}
            mode="default"
          />
        </WrapperComponent>

        <Editor
          defaultConfig={editorConfig}
          value={props.html}
          onCreated={props.setEditor}
          onChange={(editor) => props.setHtml(editor.getHtml())}
          mode="default"
          style={{
            height: `calc(100% - ${toolbarHeight * 0.3}px)`,
          }}
        />
      </div>
    </>
  );
}

export default MyEditor;
