import React, { useState, useEffect,useRef } from 'react';
import { Table, Button, Space, Input, Tooltip, Modal, Form, message } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import { bucketApi } from '@/services';
import { IBucketsResponse,ICreateBucketRqt } from '@/services/bucket/types';
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

const Dashboard = () => {
  const [bucketList, setBucketLists] = useState([]);
  useEffect(() => {
    getBucketLists();
  }, []);
  let clickFlag = true // 交互锁
  const getBucketLists = async () => {
    if(!clickFlag) return
    clickFlag = false
    try {
      const res:IBucketsResponse[] = await bucketApi.getBuckets();
      const list: any = res.map((item: IBucketsResponse) => ({
        key:  item.name,
        name: item.name,
        creationDate: item.creationDate,
        owner: item.owner.displayName
      }));
      setBucketLists(list);
      clickFlag = true
    } catch (error) {
      message.error(error)
      clickFlag = true
    }
  };
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
  const [form] = Form.useForm();

  const showCreateModal = () => {
    setVisible(true);
  };
// 创建存储桶
  const createBucket = async (val:ICreateBucketRqt)=>{
    try {
      setConfirmLoading(true);
      await bucketApi.addBucket(val)
      setVisible(false);
      setConfirmLoading(false);
      message.success('创建成功',1.5)
      getBucketLists()
      form.resetFields(); // 表单重置
    } catch (error) {
      message.error(error)
      setConfirmLoading(false);
    }
  }

  const deleteBucket = async (val:ICreateBucketRqt)=>{
    try {
      await bucketApi.deleteBucket(val)
      message.success('删除成功',1.5)
      getBucketLists()
    } catch (error) {
      message.error(error)
    }
  }
  const handleCreateOk = () => {
    form.validateFields(['bucketName']).then((val:ICreateBucketRqt|any)=>{
      createBucket(val)
    }).catch(e=>{
      console.log(e.errorFields[0].errors[0]);
    })
   
  };

  const handleCreateCancel = () => {
    console.log('Clicked cancel button');
    setVisible(false);
  };
  
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
          <Button icon={<RetweetOutlined />} onClick={()=>getBucketLists()} />
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
        <Form form={form} name="dynamic_rule" >
          <Form.Item
            {...formItemLayout}
            name="bucketName"
            label="存储桶名称"
            rules={[
              {
                required: true,
                message: '请输入存储桶名称'
              },
              {
                pattern:/^[a-z0-9]\d{3,63}|\-/g,
                message: '存储桶名称必须是小写字母、数字或“-”，并以小写字母开头;',
              },
              {
                max: 63,
                min: 3,
                message: '存储桶名称在3到63个字符之间;'
               },
               {
                whitespace:true,
                message: '不能输入空格;'
               }
            ]}
          >
            <Input placeholder="请输入存储桶名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
