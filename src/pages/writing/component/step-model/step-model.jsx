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
  Select,
  Divider,
  Input,
  Space,
} from 'antd';
import { articleType, prompt, prompt1, prompt2 } from './data';
import './step-model.less';
import OverviewTable from '../overview-table/overview-table';
import { RedoOutlined, SyncOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const App = (props, ref) => {
  //loading状态
  const [loading, setLoading] = useState(false);
  //表单str存储
  const [formStr, setFormStr] = useState('');
  //大纲信息
  const [outlineData, setOutlineData] = useState({});
  //基本信息表单
  const [baseForm] = Form.useForm();
  //摘要信息表单
  const [summaryForm] = Form.useForm();
  //summaryForm信息存储
  const [summaryStr, setSummaryStr] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  //稿件类型当前list
  const [articleClassList, setArticleClassList] = useState([]);
  //写作场景当前list
  const [sceneList, setSceneList] = useState([]);
  //当前补充信息
  const [infoList, setInfoList] = useState([]);

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

  useImperativeHandle(ref, () => ({
    showModal,
    hideModal,
    submitModal: props.submitModal,
  }));

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    //bindArea();
  };
  //稿件分类变化
  const typeChange = (e) => {
    console.log('typeChange:', e.target.value);
    const type = e.target.value;
    const list = articleType.find((item) => item.id === type);
    console.log('articleClass:', list);
    setArticleClassList(list.articleClass);
    baseForm.setFieldValue('pageClass', list.articleClass[0].id);
  };
  //稿件类型变化
  const classChange = (e) => {
    console.log('classChange:', e.target.value);
    const type = e.target.value;
    const list = articleClassList.find((item) => item.id === type);
    console.log('sceneList:', list);
    setSceneList(list.scene);
    setInfoList(list.info);
  };
  //获取baseForm信息返回字符串
  const getBaseFormInfo = async () => {
    let str = '';
    await baseForm.validateFields().then((values) => {
      console.log('values:', values);
      console.log('infoList:', infoList);
      //提取infoList中的label
      const obj = [];
      infoList.map((item) => {
        obj.push(`【${item.label}】=${values[item.label]}`);
      });
      str = `###用户输入内容 【稿件分类】=${values.pageType} 【稿件类型】=${
        values.pageClass
      } 【写作场景】=${values.scene} 【字数】=${values.count} ${obj.join(
        '\n'
      )}`;
    });
    await setFormStr(str);
    return str;
  };
  //下一步
  const nextStep = async () => {
    console.log('nextStep:', current);
    if (current === 0) {
      let str = await getBaseFormInfo();
      await generateSummary(prompt, str, (result) => {
        console.log('result:', result);
        let text = result[0].content.text;
        setFormStr(str);
        setCurrent(1);
        summaryForm.setFieldsValue({ summary: text });
      });
    }
    if (current === 1) {
      summaryForm.validateFields().then((values) => {
        console.log('values:', values);
        let str = formStr + `【主体信息描述】=${values.summary}`;
        setSummaryStr(str);
        generateSummary(prompt1, str, (result) => {
          console.log('result:', result);
          setOutlineData(result[0].content.text);
          setCurrent(2);
        });
      });
    }
  };
  //换一批
  const redoOutline = () => {
    generateSummary(prompt1, summaryStr, (result) => {
      console.log('result:', result);
      setOutlineData(result[0].content.text);
    });
  };
  //模型生成摘要信息
  const generateSummary = async (promptObj, data, callBack) => {
    setLoading(true);
    console.log('data:', data);
    let postData = {
      messages: [
        {
          role: 'SYSTEM',
          content: {
            text: promptObj.system,
          },
        },
        {
          role: 'USER',
          content: {
            text: promptObj.user + data,
          },
        },
      ],
      modelConfig: {
        stream: false,
      },
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
    console.log('response:', response);
    //解析非流式返回体
    const res = await response.json();
    console.log('res:', res);
    let { succeed, result } = res;
    if (succeed) {
      callBack(result);
    }
    setLoading(false);
  };
  //上一步
  const prevStep0 = () => {
    console.log('prevStep:', current);
    //如果是1返回到0,则提醒摘要信息会被清空
    if (current === 1) {
      Modal.confirm({
        title: '提示',
        content: '摘要信息会被清空,是否继续?',
        onOk() {
          setCurrent(0);
        },
      });
    } else {
      setCurrent(0);
    }
  };
  //上一步
  const prevStep1 = () => {
    console.log('prevStep:', current);
    //如果是1返回到0,则提醒摘要信息会被清空
    if (current === 1) {
      Modal.confirm({
        title: '提示',
        content: '摘要信息会被清空,是否继续?',
        onOk() {
          setCurrent(1);
        },
      });
    } else {
      setCurrent(1);
    }
  };
  useEffect(() => {
    setArticleClassList(articleType[0].articleClass);
    setSceneList(articleType[0].articleClass[0].scene);
    setInfoList(articleType[0].articleClass[0].info);
    //给表单中补充信息赋值
    const obj = {};
    articleType[0].articleClass[0].info.forEach((item) => {
      obj[item.label] = item.value;
    });
    baseForm.setFieldsValue(obj);
  }, []);
  useEffect(() => {
    console.log('infoList:', infoList);
  }, [infoList]);

  return (
    <Modal
      title="AI步骤式写作"
      open={isModalOpen}
      onOk={form.submit}
      width={900}
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
            title: '基础信息',
          },
          {
            disabled: true,
            title: '摘要信息',
          },
          {
            disabled: true,
            title: '大纲信息',
          },
          {
            disabled: true,
            title: '开始写作',
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
        <div>
          <Form
            autoComplete="off"
            form={baseForm}
            labelCol={{
              span: 3,
            }}
            wrapperCol={{
              span: 20,
            }}
            initialValues={{
              pageType: '汇报类',
              pageClass: '答复上级批示',
              scene: ['工作进展情况'],
              count: '短篇（500字以内）',
            }}
            layout="horizontal"
            size="small"
          >
            <Form.Item
              label="稿件分类"
              name="pageType"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
            >
              <Radio.Group onChange={typeChange}>
                {articleType.map((item) => {
                  return (
                    <Radio key={item.id} value={item.name}>
                      {item.name}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="稿件类型"
              name="pageClass"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
            >
              <Radio.Group onChange={classChange}>
                {articleClassList.map((item) => {
                  return (
                    <Radio key={item.id} value={item.name}>
                      {item.name}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="写作场景"
              name="scene"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
            >
              <Select
                maxCount="1"
                mode="tags"
                style={{ width: '300px' }}
                allowClear
                options={sceneList}
              />
            </Form.Item>
            <Form.Item
              label="写作篇幅"
              name="count"
              rules={[
                {
                  required: true,
                  message: '请选择',
                },
              ]}
            >
              <Radio.Group>
                <Radio key={0} value={'短篇（500字以内）'}>
                  短(500字以内)
                </Radio>
                <Radio key={1} value={'中篇（500-1000字）'}>
                  中(500-1000字)
                </Radio>
                <Radio key={2} value={'长篇（1000-2000字）'}>
                  长(1000-2000字)
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Divider />
            <div className="step-info">补充信息</div>
            {infoList &&
              infoList.map((item) => {
                return (
                  <Form.Item
                    key={item.label}
                    label={item.label}
                    name={item.label}
                  >
                    <TextArea rows={2} />
                  </Form.Item>
                );
              })}
          </Form>
        </div>
      ) : null}
      {current === 1 ? (
        <Form
          autoComplete="off"
          form={summaryForm}
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
            label="摘要内容"
            name="summary"
            rules={[
              {
                required: true,
                message: '请输入',
              },
            ]}
          >
            <TextArea rows={14} />
          </Form.Item>
        </Form>
      ) : null}
      {current === 2 ? (
        <Form
          autoComplete="off"
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
            label="大纲内容"
            name="summary"
            rules={[
              {
                required: true,
                message: '请输入',
              },
            ]}
          >
            <div>
              <OverviewTable data={outlineData} />
              <div className="redoOut" onClick={redoOutline}>
                <RedoOutlined style={{ marginRight: '4px' }} />
                换一批
              </div>
            </div>
          </Form.Item>
        </Form>
      ) : null}
      <Divider />
      <div className="btn-group">
        {current === 0 ? (
          <Button type="primary" loading={loading} onClick={nextStep}>
            下一步
          </Button>
        ) : null}
        {current === 1 ? (
          <Space>
            <Button onClick={prevStep0}>返回:1基础信息</Button>
            <Button type="primary" loading={loading} onClick={nextStep}>
              下一步
            </Button>
          </Space>
        ) : null}
        {current === 2 ? (
          <Space>
            <Button onClick={prevStep0}>返回:1基础信息</Button>
            <Button onClick={prevStep1}>返回:2摘要信息</Button>
            <Button type="primary" loading={loading} onClick={nextStep}>
              开始写作
            </Button>
          </Space>
        ) : null}
      </div>
    </Modal>
  );
};

export default forwardRef(App);
