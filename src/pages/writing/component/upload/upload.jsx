import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import mammoth from 'mammoth';

const { Dragger } = Upload;
const config = {
  name: 'file',
  multiple: false,
  maxCount: 1,
  showUploadList: false,
  // onChange(info) {
  //   console.log('info', info);
  //   fileChange(info.file);
  //   // const { status } = info.file;
  //   // if (status !== 'uploading') {
  //   //   console.log(info.file, info.fileList);
  //   // }
  //   // if (status === 'done') {
  //   //   message.success(`${info.file.name} file uploaded successfully.`);
  //   // } else if (status === 'error') {
  //   //   message.error(`${info.file.name} file upload failed.`);
  //   // }
  // },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const App = (props) => {
  //文件选择事件
  const fileChange = async (info) => {
    console.log('file', info.file);
    const value = await analysisWord(info.file.originFileObj); //解析word
    console.log('value', value);
    props.setHtml(value);
  };

  //解析word
  const analysisWord = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (evt) {
        //当文件读取完毕后
        mammoth //调用mammoth组件的方法进行解析文件
          .convertToHtml({ arrayBuffer: evt.target.result })
          .then(function (resultObject) {
            resolve(resultObject.value); //将处理好的html数据返回
          });
      };
      reader.readAsArrayBuffer(file); // 启动读取指定的 Blob 或 File 内容 ：https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsArrayBuffer
    });
  };

  return (
    <Dragger {...config} onChange={fileChange}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">单击或拖动文件到此区域进行上传</p>
      <p className="ant-upload-hint">支持上传doc,docx等文件格式。</p>
    </Dragger>
  );
};
export default App;
