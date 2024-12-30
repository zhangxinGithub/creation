import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Modal,
  Form,
  Button,
  Steps,
  Radio,
  Divider,
  Space,
  Upload,
  message,
} from 'antd';

import './xlsxfile.less';
import { SyncOutlined, InboxOutlined } from '@ant-design/icons';
import EditTable from './component/table/table';

const { Dragger } = Upload;

const App = (props, ref) => {
  //loading状态
  const [firstLoading, setFirstLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableForm] = Form.useForm();
  const [configForm] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [editForm] = Form.useForm();
  const [preHtml, setPreHtml] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [fileList, setFileList] = useState([]);

  const onChange = (value) => {
    console.log('onChange:', value);
    setCurrent(value);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const hideModal = () => {
    setIsModalOpen(false);
  };

  const uploadProps = {
    name: 'documentList',
    multiple: true,
    fileList: fileList,
    action: 'http://ais.fxincen.top:8030/aikb/v1/biz/doc/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败.`);
      }
      setFileList(info.fileList);
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  useImperativeHandle(ref, () => ({
    showModal,
    hideModal,
  }));

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const getGenerate = async () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    let postData = {};
    postData.tableType = configForm.getFieldValue('tableType');
    postData.fileIdList = fileList.map(
      (item) => item.response.payload[0].fileId
    );
    console.log('dataSource:', dataSource);
    postData.acceptingDataList = dataSource.map((item) => {
      return {
        itemList: [item],
      };
    });
    console.log('postData:', postData);
    let res = '';
    try {
      const response = await fetch(
        'http://ais.fxincen.top:8030/aikb/v1/biz/table/generate',
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(postData),
        }
      );

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }
        res = JSON.parse(new TextDecoder().decode(value));
      }
    } catch (e) {
      console.error(e);
    }
    console.log('res:', res);
    if (!res.succeed && res.code === 'SYSTEM_INTERNAL_ERROR') {
      message.error({
        content: res.message,
        duration: 4,
      });
    }
    if (!res.succeed && res.code === 'CONSTRUCT_RENDER_DATA_NOT_SUPPORTED') {
      message.error({
        content: res.code,
        duration: 4,
      });
    }
    return res;
  };

  //下一步
  const nextStep = async () => {
    console.log('nextStep:', current);
    if (current === 0) {
      console.log('dataSource:', dataSource);
      setCurrent(1);
    }

    if (current === 1) {
      setCurrent(2);
    }
    if (current === 2) {
      //开始生成表格
      let res = await getGenerate();
      if (res.succeed) {
        await setPreHtml(res.payload.tableList[0]);
        await setCurrent(3);
      }
    }
    if (current === 3) {
      //插入文档
      console.log('插入文档');
      props.setHtml(props.html + preHtml);
      setIsModalOpen(false);
    }
  };

  //上一步
  const prevStep0 = () => {
    setCurrent(0);
  };
  //上一步
  const prevStep1 = () => {
    setCurrent(current - 1);
  };
  useEffect(() => {
    if (isModalOpen) {
      //重置
      tableForm.resetFields();
      configForm.resetFields();
      editForm.resetFields();
      setDataSource([]);
      setFileList([]);
      setCurrent(0);
    }
  }, [isModalOpen]);

  return (
    <Modal
      title="AI数据加工"
      open={isModalOpen}
      // onOk={configForm.submit}
      width={1200}
      onCancel={handleCancel}
      footer={null}
      className="step-model"
    >
      <Steps
        style={{ marginBottom: '20px' }}
        type="navigation"
        size="small"
        current={current}
        onChange={onChange}
        className="site-navigation-steps"
        items={[
          {
            disabled: true,
            title: '数据上传',
          },
          {
            disabled: true,
            title: '参数配置',
          },
          {
            disabled: true,
            title: '文件上传',
          },
          {
            disabled: true,
            title: '数据计算',
          },
        ]}
      />
      {loading && (
        <div
          className="model-loading"
          onClick={(e) => {
            //禁止冒泡
            e.stopPropagation();
          }}
        >
          <div className="loading-body">
            <SyncOutlined
              style={{ color: '#165dff', marginRight: '8px' }}
              spin
            />
            生成中...
          </div>
        </div>
      )}
      {current === 0 ? (
        <div className="edit-container">
          <EditTable
            editForm={editForm}
            setFirstLoading={setFirstLoading}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />
        </div>
      ) : null}
      {current === 1 ? (
        <div style={{ height: '45vh' }}>
          <Form
            autoComplete="off"
            initialValues={{
              tableType: 'ANALYSIS',
            }}
            form={configForm}
            labelCol={{
              span: 3,
            }}
            wrapperCol={{
              span: 20,
            }}
            layout="horizontal"
            size="small"
          >
            <Form.Item
              label="表格分类"
              name="tableType"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Radio.Group>
                <Radio value="ANALYSIS">汇总表</Radio>
                <Radio value="SUMMARY">分析表</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      ) : null}
      {current === 2 ? (
        <div className="upload-files" style={{ height: '45vh' }}>
          <div style={{ width: '800px' }}>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或者拖拽文件上传</p>
              <p className="ant-upload-hint">
                支持单个或批量上传，支持格式：.xls .xlsx
              </p>
            </Dragger>
          </div>
        </div>
      ) : null}
      {current === 3 ? (
        <div className="upload-files">
          <div dangerouslySetInnerHTML={{ __html: preHtml }}></div>
        </div>
      ) : null}
      <Divider />
      <div className="btn-group">
        {current === 0 ? (
          <Button type="primary" loading={firstLoading} onClick={nextStep}>
            下一步
          </Button>
        ) : null}
        {current === 1 ? (
          <Space>
            <Button onClick={prevStep1}>上一步</Button>
            <Button type="primary" loading={loading} onClick={nextStep}>
              下一步
            </Button>
          </Space>
        ) : null}
        {current === 2 ? (
          <Space>
            <Button onClick={prevStep0}>上一步</Button>
            <Button type="primary" loading={loading} onClick={nextStep}>
              下一步
            </Button>
          </Space>
        ) : null}
        {current === 3 ? (
          <Space>
            <Button onClick={prevStep0}>上一步</Button>
            <Button type="primary" loading={loading} onClick={nextStep}>
              插入文档
            </Button>
          </Space>
        ) : null}
      </div>
    </Modal>
  );
};

export default forwardRef(App);
