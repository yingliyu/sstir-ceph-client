import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Input, Tooltip, Modal, Form, message } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import { bucketApi } from '@/services';
import { IBucketsResponse ,IBucketInfo, ICreateBucketRqt } from '@/services/bucket/types';
import css from './index.module.less';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const Dashboard = () => {

  const [bucketList, setBucketLists] = useState<IBucketInfo[]>([]);
  const [currentPage,setCurrentPage] = useState<number>(1)
  const [pageSize,setPageSize] = useState<number>(10)
  const [currentPageList,setCurrentPageList] = useState<IBucketInfo[]>([])

  useEffect(() => {
    getBucketLists();
  }, []);
  let clickFlag = true; // 交互锁
  const getBucketLists = async () => {
    if (!clickFlag) return;
    clickFlag = false;
    try {
      const res: IBucketsResponse[] = await bucketApi.getBuckets();
      const list: any = res.map((item: IBucketsResponse) => ({
        key: item.name,
        name: item.name,
        creationDate: item.creationDate,
        owner: item.owner.displayName
      }));
      setBucketLists(list);
      setCurrentPageList(list.slice(0,currentPage*pageSize))
      clickFlag = true;
    } catch (error) {
      message.error(error);
      clickFlag = true;
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
  const [currentSelBucketName, setCurrentSelBucketName] = useState<string>();

  const showModal = (val?:string) => {
    setCurrentSelBucketName(val)
    setIsModalVisible(true);
  };

  const delHandleOk = () => {
    currentSelBucketName?deleteBuckets([currentSelBucketName]):deleteBuckets(selectedRowKeys)
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      sorter: (a:any, b:any) => a.name.localeCompare(b.name),
      render: (text: string) => <a href={`/admin/dashboard/${text}`}>{text}</a>
    },
    // {
    //   title: '历史版本保护',
    //   dataIndex: 'age'
    // },
    {
      title: '创建时间',
      dataIndex: 'creationDate',
      sorter: (a:any, b:any) => a.creationDate.localeCompare(b.creationDate)
    },
    {
      title: '所有者',
      dataIndex: 'owner',
      sorter: (a:any, b:any) => a.owner.localeCompare(b.owner)
    },
    // {
    //   title: '锁定状态',
    //   dataIndex: 'address'
    // },
    {
      title: '操作',
      dataIndex: '',
      key: 'x',
      render: (text:any, record:IBucketInfo, index:number) => {
        return <a onClick={()=>showModal(record.name)} style={{ fontSize: '14px', color: 'red' }}>
        删除
        {/* <CloseCircleOutlined /> */}
      </a>
      }
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
  const createBucket = async (val: ICreateBucketRqt) => {
    try {
      setConfirmLoading(true);
      await bucketApi.addBucket(val);
      setVisible(false);
      setConfirmLoading(false);
      message.success('创建成功', 1.5);
      getBucketLists();
      form.resetFields(); // 表单重置
    } catch (error) {
      message.error(error);
      setConfirmLoading(false);
    }
  };

  const deleteBuckets = async (val: string[]) => {
    try {
      await bucketApi.deleteBuckets({bucketNames:val});
      setCurrentSelBucketName('')
      message.success('删除成功', 1.5);
      getBucketLists();
    } catch (error) {
      message.error(error);
    }
  };
  const handleCreateOk = () => {
    form
      .validateFields(['bucketName'])
      .then((val: ICreateBucketRqt | any) => {
        createBucket(val);
      })
      .catch((e) => {
        console.log(e.errorFields[0].errors[0]);
      });
  };

  const handleCreateCancel = () => {
    console.log('Clicked cancel button');
    setVisible(false);
  };
  // 表格前端分页
  const changePageNum = (page:number)=>{
    console.log(page);
    setCurrentPage(page)
    setCurrentPageList(bucketList.slice(pageSize*(page-1),currentPage*pageSize))

  }
  const changePageSize = (current:number,size:number)=>{
    // console.log(current,size);
    setPageSize(size)
  }
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
          onClick={()=>showModal()}
        >
          删除
        </Button>
        <Tooltip title="refresh">
          <Button icon={<RetweetOutlined />} onClick={() => getBucketLists()} />
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
          total: bucketList.length,
          current: currentPage,
          pageSize: pageSize,
          onChange: changePageNum,
          onShowSizeChange:changePageSize
        }}
      />
      <Modal title="提示" visible={isModalVisible} onOk={delHandleOk} onCancel={handleCancel}>
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
              },
              {
                pattern: /^[0-9a-z]{1}[0-9a-z-]{1,61}[0-9a-z]{1}$/,
                message: '存储桶名称必须是小写字母、数字或“-”，并以小写字母开头;'
              },
              {
                max: 63,
                min: 3,
                message: '存储桶名称在3到63个字符之间;'
              },
              {
                whitespace: true,
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
