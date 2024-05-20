import React from 'react';
import './check.less';
import { Input, Form, Row, Col, Upload, Button, ConfigProvider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
const { Search } = Input;
import { TinyColor } from '@ctrl/tinycolor';
const colors1 = ['#6253E1', '#04BEFE'];
const colors2 = ['#fc6076', '#ff9a44', '#ef9d43', '#e75516'];
const colors3 = ['#40e495', '#30dd8a', '#2bb673'];
const getHoverColors = (colors) =>
  colors.map((color) => new TinyColor(color).lighten(5).toString());
const getActiveColors = (colors) =>
  colors.map((color) => new TinyColor(color).darken(5).toString());

const Check = (props) => {
  const [form] = Form.useForm();
  return (
    <div className="check-page">
      <h1 style={{ margin: '10px', marginBottom: '20px' }}>妙笔公文写作平台</h1>
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
            style={{ width: 1000 }}
          />
        </Form.Item>
      </Form>
      <Row gutter={16} className="check-body">
        <Col span={12}>
          <div className="check-title">
            <Upload>
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimary: `linear-gradient(135deg, ${colors1.join(
                        ', '
                      )})`,
                      colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(
                        colors1
                      ).join(', ')})`,
                      colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(
                        colors1
                      ).join(', ')})`,
                      lineWidth: 0,
                    },
                  },
                }}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  上传被校验文档
                </Button>
              </ConfigProvider>
            </Upload>
          </div>
        </Col>
        <Col span={12}>
          <div className="check-title">
            <ConfigProvider
              theme={{
                components: {
                  Button: {
                    colorPrimary: `linear-gradient(90deg,  ${colors2.join(
                      ', '
                    )})`,
                    colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(
                      colors2
                    ).join(', ')})`,
                    colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(
                      colors2
                    ).join(', ')})`,
                    lineWidth: 0,
                  },
                },
              }}
            >
              <Upload>
                <Button type="primary" icon={<UploadOutlined />}>
                  上传参考文档
                </Button>
              </Upload>
            </ConfigProvider>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default Check;
