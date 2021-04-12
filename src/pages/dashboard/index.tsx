import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Tooltip, Modal, Form } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import {bucketApi} from '@/services'
import {IBucketsResponse} from '@/services/bucket/types'
import css from './index.module.less';

const data: any[] = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `EdwardKing${i}`,
    age: 32,
    address: `2021-03-${i}2`
  });
}
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const Dashboard = ()=> {
  const [bucketList,setBucketLists] = useState<IBucketsResponse[]>([])
  useEffect(()=>{
    getBucketLists()
  },[])
  const getBucketLists= async()=>{
    try {
      const res = await bucketApi.getBuckets()
      const list:any = res.map((item:IBucketsResponse,index:number)=>({
        key:index+"_"+item.name.toString(),
        name:item.name,
        creationDate:item.creationDate,
        owner:item.owner.displayName
      }))
      console.log(res);
      setBucketLists(list)
    } catch (error) {
      
    }
  }
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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      sorter: true, // 服务端排序
      render: (text: string) => <a href={`/admin/dashboard/${text}`}>{text}</a>
    },
    // {
    //   title: '历史版本保护',
    //   dataIndex: 'age'
    // },
    {
      title: '创建时间',
      dataIndex: 'creationDate',
      sorter: true
    },
    {
      title: '所有者',
      dataIndex: 'creationDate',
      sorter: true
    },
    // {
    //   title: '锁定状态',
    //   dataIndex: 'address'
    // },
    {
      title: '操作',
      dataIndex: '',
      key: 'x',
      render: () => (
        <a onClick={showModal} style={{ fontSize: '14px', color: 'red' }}>
          删除{/* <CloseCircleOutlined /> */}
        </a>
      )
    }
  ];
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('存储桶名称');

  const showCreateModal = () => {
    setVisible(true);
  };

  const handleCreateOk = () => {
    setModalText('The modal will be closed after two seconds');
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCreateCancel = () => {
    console.log('Clicked cancel button');
    setVisible(false);
  };
  const [form] = Form.useForm();

  useEffect(() => {
    form.validateFields(['nickname']);
  }, []);

  return (
    <div className={css['bucket-wrapper']}>
      <p className={css['bucket-tips']}>
        存储桶列表显示当前用户所拥有的存储信息，可点击存储桶名称进入存储桶进行文件操作。
      </p>
      <Space className={css['form-wrapper']}>
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={showCreateModal}>
          创建
        </Button>
        <Button
          type="primary"
          disabled={selectedRowKeys.length ? false : true}
          danger
          icon={<CloseCircleOutlined />}
          onClick={showModal}
        >
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
        dataSource={bucketList}
        scroll={{ y: '600px' }}
        pagination={{
          position: ['topRight'],
          showSizeChanger: true,
          total: 40,
          current: 1,
          pageSize: 10
          // onChange: null
        }}
      />
      <Modal title="提示" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>删除存储桶后无法恢复，您确定删除吗？</p>
      </Modal>
      <Modal
        title="创建存储桶"
        visible={visible}
        forceRender={true}
        onOk={handleCreateOk}
        confirmLoading={confirmLoading}
        onCancel={handleCreateCancel}
      >
        <Form form={form} name="dynamic_rule">
          <Form.Item
            {...formItemLayout}
            name="bucketName"
            label="存储桶名称"
            rules={[
              {
                required: true,
                message: '请输入存储桶名称'
              }
            ]}
          >
            <Input placeholder="请输入存储桶名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Dashboard;
