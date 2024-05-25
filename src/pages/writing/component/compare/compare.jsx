import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Input, Form, Button, Upload } from 'antd';
import './compare.less';
import mammoth from 'mammoth';

const { Search } = Input;
const config = {
  name: 'file',
  multiple: false,
  maxCount: 1,
  showUploadList: false,
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};
const Robot = (props, ref) => {
  const [form] = Form.useForm();
  //文件选择事件
  const fileChange = async (info) => {
    const value = await analysisWord(info.file.originFileObj); //解析word
    console.log('value', value);
    props.setHtml(value);
    props.setPreHtmlCopy(value);
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
    <div className="compare">
      <Form
        autoComplete="off"
        form={form}
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 18,
        }}
        layout="horizontal"
      >
        <Form.Item label="关键词" name="pageType">
          <Search
            allowClear
            enterButton="检验"
            onSearch={(value) => {
              props.search(value);
            }}
            style={{ width: 300 }}
          />
        </Form.Item>
      </Form>
      <Upload {...config} className="upload" onChange={fileChange}>
        <Button>上传</Button>
      </Upload>
      <div className="doc-page">
        <div dangerouslySetInnerHTML={{ __html: props.html }}></div>
      </div>
    </div>
  );
};

export default Robot;
