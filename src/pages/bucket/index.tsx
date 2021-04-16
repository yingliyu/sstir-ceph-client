import React, { useState, useEffect ,} from 'react';
import {
  useParams
} from "react-router-dom";
import { Table, Button, Space,message, Input, Tooltip, Modal, Select, Switch,Steps, Upload } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, RetweetOutlined,UploadOutlined  } from '@ant-design/icons';
import { bucketApi } from '@/services';
import {IUploadRqt} from '@/services/bucket'
import SparkMD5 from 'spark-md5';
import css from './index.module.less';

const data: any[] = [];
for (let i = 0; i < 3; i++) {
  data.push({
    key: i,
    name: `file${i}`,
    age: 32,
    address: `2021-03-${i}2`
  });
}
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const Bucket = (props: any) => {

  const [curBucketName, setCurBucketName] = useState<string>();
  const [fileLists, setFileLists] = useState([]);
  const {bucketName} = useParams<any>()
  
  useEffect(() => {
    setCurBucketName(bucketName);
    getFilesInBucket();
  }, []);

  const getFilesInBucket = async () => {
    try {
      const param = {
        bucketName: curBucketName!
      };
      const res = await bucketApi.getFilesInBucket(param);
      console.log(res);
    } catch (error) {}
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
      sorter: true // 服务端排序
    },
    {
      title: '大小',
      dataIndex: 'age',
      sorter: true // 服务端排序
    },
    {
      title: '标签数',
      dataIndex: 'age',
      sorter: true // 服务端排序
    },
    {
      title: 'MD5',
      dataIndex: 'age'
    },
    {
      title: '所属存储池',
      dataIndex: 'age'
    },
    {
      title: '拥有者',
      dataIndex: 'address'
    },
    {
      title: '创建时间',
      dataIndex: 'address',
      sorter: true
    },

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

  const showCreateModal = () => {
    setVisible(true);
  };

  const handleCreateOk = () => {
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

  interface IFileProps extends Blob{
    lastModified: string;
    lastModifiedDate:string;
    name: string;
    size: number
    type: string;
    uid: string;
    webkitRelativePath: string;
  }
 // 文件上传功能
  const [uploading,setUploading] = useState<boolean>()
  const [fileList,setFileList] = useState<IFileProps[]>([])
 
  // upload
  const handleUpload = async() => {
    console.log(fileList);
    // slice start
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
    file = fileList[0],
    chunkSize = 2097152,                             // Read in chunks of 2MB
    chunks = Math.ceil(file.size / chunkSize),
    currentChunk = 0,
    spark = new SparkMD5.ArrayBuffer(),
    fileReader = new FileReader();
    
    fileReader.onload = function (e:any) {
      console.log('read chunk nr', currentChunk + 1, 'of', chunks);
      spark.append(e.target.result);                   // Append array buffer
      currentChunk++;

      if (currentChunk < chunks) {
          loadNext();
      } else {
          console.log('finished loading');
          console.info('computed hash', spark.end());  // Compute hash
      }
  };

  fileReader.onerror = function () {
      console.warn('oops, something went wrong.');
  };

  function loadNext() {
      var start = currentChunk * chunkSize,
          end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
  }

  loadNext();
  // slice end
  
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files[]', file);
    });
    setUploading(true)
    
    const param:IUploadRqt = {
      version: '1.0',
      clientType: '1',
      function: 100,// 100:上传 | 300 获取下载对象信息 | 400:上传进度 | 200:下载
      fileName: 'string',
      fileSize: 10,
      fileMd5: 'string',
      filePieceMd5: 'string',
      filePieceNum: 10,
      filePieceData: 'string', // 当前分片数据base64
      filePieceDataLen: 0, // base64 大小
      fileChunckSize:20, // 分片大小，分片大小不能超过50M，建议值20M
    }
    try {
      // const res = await bucketApi.uploadFilePiece(param)
      setUploading(false)
      setFileList([])
      message.success('upload successfully.');
    } catch (error) {
      console.log(error);
      
    }
  };
  const uploadProps:any = {
    onRemove: (file:IFileProps) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList)
    },
    beforeUpload: (file:IFileProps) => {
      console.log('beforeUpload===',file);
      
      setFileList([...fileList,file])
      return false;
    },
    fileList,
  };
  const [curStep, setCurStep] = useState<number>(0)
  const nextStepHandle = ()=>{
    setCurStep(curStep<3?curStep+1:3)
  }
  const prevStepHandle = ()=>{
    setCurStep(curStep>0?curStep-1:1)
  }
  // 选中的存储池
  const [storagePool,setStoragePool]=useState<string>()
  const onStoragePoolChange = (val:string)=>{
    setStoragePool(val)
  }
  const onBlur = ()=>{}
  const onFocus = ()=>{}
  return (
    <div className={css['bucket-wrapper']}>
      <Space className={css['form-wrapper']}>
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={showCreateModal}>
          上传
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
        dataSource={data}
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
        <p>删除文件后无法恢复，您确定删除吗？</p>
      </Modal>
      <Modal
        title="上传文件"
        visible={visible}
        forceRender={true}
        onOk={handleCreateOk}
        confirmLoading={confirmLoading}
        onCancel={handleCreateCancel}
        footer={null}
      >
         <Steps size="small" current={curStep}>
            <Steps.Step title="选择文件" />
            <Steps.Step title="选择存储池" />
            <Steps.Step title="加密" />
        </Steps>
       {
         curStep===0? <div className={css['upload-step']}>
         <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>添加文件</Button>
        </Upload>
        </div>:null
       }
        {
          curStep===1?<div className={css['upload-step']}>
          <label>存储池：</label>
          <Select
              showSearch
              style={{ width: 200 }}
              placeholder="选择一个存储池"
              optionFilterProp="children"
              onChange={onStoragePoolChange}
              onFocus={onFocus}
              onBlur={onBlur}
              onSearch={onSearch}
              filterOption={(input, option:any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Select.Option value="default">default</Select.Option>
            </Select>
          </div>:null
        }
        {curStep===2?<div className={css['upload-step']}>
          <label>加密：</label>
          <Switch checked={false}  />
        </div>
        :null}
       <div className={css['upload-btn-group']}>
          <Space>
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={fileList.length === 0}
              loading={uploading}
            >
              {uploading ? 'Uploading' : '上传'}
            </Button>
            {curStep>0?<Button
              onClick={prevStepHandle}
            >
              上一步
            </Button>:null}
            {curStep<2?<Button
              onClick={nextStepHandle}
            >
              下一步
            </Button>:null}
          </Space>
       </div>
      </Modal>
    </div>
  );
};

export default Bucket;
