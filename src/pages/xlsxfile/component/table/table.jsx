import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import { Button, Form, Input, Space, Table, Select } from 'antd';
import { find } from 'lodash';
import { red } from '@ant-design/colors';

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  //将form放到dataSource中
  console.log('form11111', form);
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
  select,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const form = useContext(EditableContext);
  useEffect(() => {
    if (dataIndex) {
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    }
  }, []);
  // const toggleEdit = () => {
  //   setEditing(!editing);
  //   form.setFieldsValue({
  //     [dataIndex]: record[dataIndex],
  //   });
  //   console.log('form', form.getFieldsValue(dataIndex));
  // };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
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
  if (select) {
    childNode = (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title}不能为空`,
          },
        ]}
      >
        <Select
          style={{
            width: 140,
          }}
          // onBlur={save}
          // onChange={save}
          options={[
            {
              value: '压力传感器',
              label: '压力传感器',
            },
            {
              value: '脉动压力传感器',
              label: '脉动压力传感器',
            },
          ]}
        />
      </Form.Item>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const App = (props, ref) => {
  const [dataSource, setDataSource] = useState([
    // {
    //   key: '0',
    //   name: 'Edward King 0',
    //   age: '32',
    //   address: 'London, Park Lane no. 0',
    // },
  ]);
  useImperativeHandle(ref, () => ({
    dataSource,
  }));
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    // setDataSource(newData);
  };
  const onloadFile = (info, record) => {
    console.log('info', info);
    console.log('record', record);
    if (info.file.status === 'done') {
      console.log('info', info);
      find(dataSource, { key: record.key }).filename =
        info.file.response.payload[0].name;
      dataSource[record.key].filename = info.file.response.payload[0].name;
      find(dataSource, { key: record.key }).fileId =
        info.file.response.payload[0].id;
      setDataSource([...dataSource]);
    }
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
            onClick={handleDelete(record.key)}
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
      code: ``,
      batch: '',
      number: '',
      filename: '',
    };
    setDataSource([...dataSource, newData]);
  };
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable && !col.select) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        select: col.select,
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
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ y: 240 }}
      />
    </div>
  );
};
export default forwardRef(App);
