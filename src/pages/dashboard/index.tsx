import React, { useState } from 'react';
import { Table, Button, Space, Input, Tooltip } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import css from './index.module.less';

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    render: (text: string) => <a href={`/admin/dashboard/${text}`}>{text}</a>
  },
  {
    title: '历史版本保护',
    dataIndex: 'age'
  },
  {
    title: '创建时间',
    dataIndex: 'address'
  },
  {
    title: '锁定状态',
    dataIndex: 'address'
  }
];

const data: any[] = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `EdwardKing${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`
  });
}

function Dashboard() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (selectedRowKeys: any) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(selectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const onSearch = (value: string) => console.log(value);
  return (
    <div className={css['bucket-wrapper']}>
      <Space className={css['form-wrapper']}>
        <Button type="primary" icon={<PlusCircleOutlined />}>
          创建
        </Button>
        <Button type="primary" danger icon={<CloseCircleOutlined />}>
          删除
        </Button>
        <Tooltip title="refresh">
          <Button icon={<RetweetOutlined />} />
        </Tooltip>
        <Input.Search placeholder="input search text" onSearch={onSearch} enterButton />
      </Space>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        pagination={{ position: ['topRight'], showSizeChanger: true }}
      />
    </div>
  );
}

export default Dashboard;
