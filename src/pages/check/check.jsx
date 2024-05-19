import React from 'react';
import './check.less';
import { Input, Form, Row, Col } from 'antd';
const { Search } = Input;

const Check = (props) => {
  const [form] = Form.useForm();
  return (
    <div className="check-page">
      <Form
        autoComplete="off"
        form={form}
        labelCol={{
          span: 3,
        }}
        wrapperCol={{
          span: 20,
        }}
        layout="horizontal"
      >
        <Form.Item label="输入检验关键词" name="pageType">
          <Search
            allowClear
            enterButton="检验"
            //onSearch={onSearch}
          />
        </Form.Item>
      </Form>
      <Row gutter={16} className="check-body">
        <Col className="gutter-row" span={12}>
          1
        </Col>
        <Col className="gutter-row" span={12}>
          2
        </Col>
      </Row>
    </div>
  );
};
export default Check;
