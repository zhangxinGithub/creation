import React, { useContext, useEffect, forwardRef, useState } from 'react';
import { Button, Form, Input, Space, Table, Select } from 'antd';
import { red } from '@ant-design/colors';

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  //console.log('restProps', restProps);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (dataIndex) {
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    }
  }, []);
  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `必填项`,
          },
        ]}
      >
        <Input onPressEnter={save} onBlur={save} />
      </Form.Item>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const App = (props) => {
  const handleDelete = (key) => {
    const newData = props.dataSource.filter((item) => item.key !== key);
    props.setDataSource(newData);
  };
  const defaultColumns = [
    {
      title: '验收产品代号',
      dataIndex: 'model',
      editable: true,
    },
    {
      title: '产品代号',
      dataIndex: 'code',
      editable: true,
    },
    {
      title: '传感器批次号',
      dataIndex: 'batch',
      editable: true,
    },
    {
      title: '产品编码',
      dataIndex: 'number',
      editable: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <a
            style={{
              color: red[5],
            }}
            onClick={() => {
              handleDelete(record.key);
            }}
          >
            删除
          </a>
        </Space>
      ),
    },
  ];
  const handleAdd = () => {
    const newData = {
      //key是时间戳
      key: Date.now(),
      model: '',
      code: '',
      batch: '',
      number: '',
    };
    props.setDataSource([...props.dataSource, newData]);
  };
  const handleSave = (row) => {
    const newData = [...props.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    props.setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  return (
    <div>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        新增
      </Button>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={props.dataSource}
        columns={columns}
        pagination={false}
        scroll={{ y: 240 }}
      />
    </div>
  );
};
export default App;
