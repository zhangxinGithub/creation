const columns = [
  {
    title: '产品类别',
    dataIndex: 'name',
    key: 'name',
    render: (_, record, index) => {
      return (
        <Form.Item name="username" noStyle rules={[{ required: true }]}>
          <Select
            defaultValue="lucy"
            style={{
              width: 140,
            }}
            options={[
              {
                value: 'jack',
                label: '压力传感器',
              },
              {
                value: 'lucy',
                label: '脉动压力传感器',
              },
            ]}
          />
        </Form.Item>
      );
    },
  },
  {
    title: '验收产品代号',
    dataIndex: 'age',
    key: 'age',
    render: (text) => <Input placeholder="Basic usage" />,
  },
  {
    title: '产品代号',
    dataIndex: 'address',
    key: 'address',
    render: (text) => <Input placeholder="Basic usage" />,
  },
  {
    title: '传感器批次号',
    key: 'tags',
    dataIndex: 'tags',
    render: (text) => <Input placeholder="Basic usage" />,
  },
  {
    title: '产品编码',
    key: 'tags',
    dataIndex: 'tags',
    render: (text) => <Input placeholder="Basic usage" />,
  },
  {
    title: '文件名称',
    key: 'tags',
    dataIndex: 'tags',
    width: 120,
    render: (_, { tags }) => <>123</>,
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    render: (_, record) => (
      <Space size="middle">
        <a>数据上传</a>
        <a>删除</a>
      </Space>
    ),
  },
];
const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];
