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
  message,
} from 'antd';
import { articleType, prompt, prompt1, prompt2 } from './data';
import './step-model.less';
import OverviewTable from '../overview-table/overview-table';
import { RedoOutlined, SyncOutlined } from '@ant-design/icons';
import { find } from 'lodash';

const { TextArea } = Input;
let stop = false;

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

  //稿件分类变化
  const typeChange = (e) => {
    console.log('typeChange:', e.target.value);
    const type = e.target.value;
    const list = articleType.find((item) => item.name === type);
    console.log('articleClass:', list);
    setArticleClassList(list.articleClass);
    baseForm.setFieldValue('pageClass', list.articleClass[0].name);
    //写作场景赋值
    setSceneList(list.articleClass[0].scene);
    baseForm.setFieldValue('scene', [list.articleClass[0].scene[0].value]);
    //补充信息赋值
    const obj = {};
    list.articleClass[0].info.forEach((item) => {
      obj[item.label] = item.value;
    });
    setInfoList(list.articleClass[0].info);
    baseForm.setFieldsValue(obj);
  };
  //稿件类型变化
  const classChange = (e) => {
    console.log('classChange:', e.target.value);
    const type = e.target.value;
    const list = find(articleClassList, { name: type });
    console.log('sceneList:', list);
    setSceneList(list.scene);
    setInfoList(list.info);
    //给表单中补充信息赋值
    const obj = {};
    list.info.forEach((item) => {
      obj[item.label] = item.value;
    });
    baseForm.setFieldsValue({ ...obj, scene: [list.scene[0].value] });
  };
  //获取baseForm信息返回字符串
  const getBaseFormInfo = async () => {
    let str = '';
    await baseForm.validateFields().then((values) => {
      console.log('values:', values);
      console.log('values.scene:', values.scene);
      //提取infoList中的label
      const obj = [];
      infoList.map((item) => {
        obj.push(`【${item.label}】=${values[item.label]}`);
      });
      str = `###用户输入内容 【稿件分类】=${values.pageType} 【稿件类型】=${
        values.pageClass
      } 【写作场景】=${values.scene.join('，')} 【字数】=${
        values.count
      } ${obj.join('\n')}`;
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
          formatOutlineData(result[0].content.text);
          setCurrent(2);
        });
      });
    }
    if (current === 2) {
      //开始写作
      props.setGlobalLoading(true);
      //关闭弹窗
      hideModal();
      //清空编辑器内容
      props.setHtml('');
    }
  };
  useEffect(() => {
    stop = props.globalLoading;
    if (props.globalLoading) {
      startWriting();
    }
  }, [props.globalLoading]);
  //格式化大纲信息
  const formatOutlineData = (data) => {
    let jsonStr = '';
    //如果没有正则出json```则跳过后面方法
    if (!data.match(/```json/)) {
      jsonStr = data;
    } else {
      //正则出json```主题内容```格式的数据
      let reg = /```([\s\S]*?)```/g;
      let json = data.match(reg);
      //删除'json```'和'```'字符
      jsonStr = json[0].replace(/```json/g, '').replace(/```/g, '');
      //删除开头的换行符
      jsonStr = jsonStr.replace(/^\n/, '');
      //将json字符串转换为json对象
    }
    let jsonObj = {};
    try {
      jsonObj = JSON.parse(jsonStr);
    } catch (e) {
      // message.error('json格式错误');
      redoOutline();
      return;
    }
    //title是大纲的标题,sub是大纲的小节,subTitle是小节的标题,jsonObj
    let tableData = [];
    jsonObj.sub.map((item) => {
      let title = item.subTitle;
      let children = [];
      item.subSub.map((subItem) => {
        children.push(subItem);
      });
      tableData.push({ title, children });
    });
    setOutlineData(tableData);
  };
  //换一批
  const redoOutline = () => {
    generateSummary(prompt1, summaryStr, (result) => {
      console.log('result:', result);
      formatOutlineData(result[0].content.text);
    });
  };
  //模型生成摘要信息&&大纲
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
            text: promptObj.user + data + promptObj.end,
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
    try {
      const response = await fetch(
        'http://ais.fxincen.top:8030/aikb/v1/chat/sessionless',
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
    } catch (e) {
      message.error('接口报错');
      setLoading(false);
    }
  };
  //解析大纲信息json章节改成**章节**格式,小节改成 - 小节 格式
  const outlineDataToStr = (data) => {
    let str = '';
    data.map((item) => {
      str += `**${item.title}**\n`;
      item.children.map((child) => {
        str += ` - ${child}\n`;
      });
    });
    return str;
  };
  //开始写作接口
  const startWriting = async () => {
    let pageType = baseForm.getFieldValue('pageType');
    let postData = {
      messages: [
        {
          role: 'SYSTEM',
          content: {
            text: prompt2.system,
          },
        },
        {
          role: 'USER',
          content: {
            text:
              prompt2.user[pageType] +
              summaryStr +
              '【大纲信息】=' +
              outlineDataToStr(outlineData),
          },
        },
      ],
      modelConfig: {
        stream: true,
      },
    };
    console.log('postData:', postData);
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    try {
      const response = await fetch(
        'http://ais.fxincen.top:8030/aikb/v1/chat/sessionless',
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(postData),
        }
      );
      //流式输出
      const reader = response.body.getReader();
      let res = '';
      //let el = document.getElementById('w-e-textarea-1');
      while (true) {
        const { done, value } = await reader.read();
        console.log('done', done);
        if (done) {
          props.setGlobalLoading(false);
          break;
        }
        if (!stop) {
          break;
        }
        res += new TextDecoder().decode(value);
        console.log('res', res);
        //删除res中'data:'
        res = res.replace(/data:/g, '');
        //删除res中的换行符
        res = res.replace(/\n/g, '');
        props.setHtml(res);
      }
    } catch (e) {
      message.error('接口报错');
      props.setGlobalLoading(false);
    }
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
              <OverviewTable
                data={outlineData}
                setOutlineData={setOutlineData}
                prevStep1={prevStep1}
              />
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
