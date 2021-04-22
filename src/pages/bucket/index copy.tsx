import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  message,
  Input,
  Tooltip,
  Modal,
  Select,
  Switch,
  Steps,
  Upload
} from 'antd';
import {
  PlusCircleOutlined,
  CloseCircleOutlined,
  RetweetOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { bucketApi } from '@/services';
import { IUploadRqt } from '@/services/bucket';
import SparkMD5 from 'spark-md5';
import axios from 'axios';
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
  const { bucketName } = useParams<any>();

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

  interface IFileProps extends Blob {
    lastModified: string;
    lastModifiedDate: string;
    name: string;
    size: number;
    type: string;
    uid: string;
    webkitRelativePath: string;
  }
  // 文件上传功能
  const [uploading, setUploading] = useState<boolean>();
  const [fileList, setFileList] = useState<IFileProps[]>([]);

  // upload
  // let blobSlice = File.prototype.slice || File.prototype?.mozSlice || File.prototype?.webkitSlice;
  let blobSlice = File.prototype.slice;
  // let blobSlice = File.prototype.slice;
  // let chunkSize = 1024 * 1024 * 7; // Read in chunks of 7MB: 1024*1024*7
  const handleUpload = async () => {
    console.log(fileList);
    console.log(fileList[0]);
    const file = fileList[0];
    if (!file) {
      message.warning('请先选择文件！');
      return;
    }
    let chunkSize = 1024 * 1024 * 25; // Read in chunks of 7MB: 1024*1024*7
    const blockCount: number = Math.ceil(file.size / chunkSize); // 分片总数
    const axiosPromiseArray = []; // axiosPromise数组
    const hash = await handleFileSlice(fileList[0]); // 文件 hash
    for (let i = 0; i < blockCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      // 构建表单
      // const form: any = new FormData();
      // form.append('file', blobSlice.call(file, start, end));
      // form.append('name', file.name);
      // form.append('total', blockCount);
      // form.append('index', i);
      // form.append('size', file.size);
      // form.append('hash', hash);
      // ajax提交 分片，此时 content-type 为 multipart/form-data
      const param: IUploadRqt = {
        version: '1.0',
        clientType: '1',
        function: 100, // 100:上传 | 300 获取下载对象信息 | 400:上传进度 | 200:下载
        fileName: 'string',
        fileSize: 10,
        fileMd5: 'string',
        filePieceMd5: 'string',
        filePieceNum: 10,
        filePieceData: 'string', // 当前分片数据base64
        filePieceDataLen: 0, // base64 大小
        fileChunckSize: 20 // 分片大小，分片大小不能超过50M，建议值20M
      };
      const axiosOptions = {
        onUploadProgress: (e: any) => {
          // 处理上传的进度
          console.log(blockCount, i, e, file);
        }
      };
      // 加入到 Promise 数组中
      // axiosPromiseArray.push(bucketApi.uploadFilePiece(param));
    }
    // 所有分片上传后，请求合并分片文件
    // await axios.all(axiosPromiseArray).then(() => {
    //   // 合并chunks
    //   const data = {
    //     size: file.size,
    //     name: file.name,
    //     total: blockCount,
    //     hash
    //   };
    // });
    // const param: IUploadRqt = {
    //   version: '1.0',
    //   clientType: '1',
    //   function: 100, // 100:上传 | 300 获取下载对象信息 | 400:上传进度 | 200:下载
    //   fileName: 'string',
    //   fileSize: 10,
    //   fileMd5: 'string',
    //   filePieceMd5: 'string',
    //   filePieceNum: 10,
    //   filePieceData: 'string', // 当前分片数据base64
    //   filePieceDataLen: 0, // base64 大小
    //   fileChunckSize: 20 // 分片大小，分片大小不能超过50M，建议值20M
    // };
    // setUploading(true);

    // try {
    //   const res = await bucketApi.uploadFilePiece(param);
    //   console.log(res);

    //   setUploading(false);
    //   setFileList([]);
    //   message.success('upload successfully.');
    // } catch (error) {
    //   console.log(error);
    // }
  };

  // file slice
  const handleFileSlice = (blob: any) => {
    return new Promise((resolve, reject) => {
      // slice start
      const { name, size } = blob;
      // let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      // // let blobSlice = File.prototype.slice;
      let file = fileList[0];
      let chunkSize = 1024 * 1024 * 25; // Read in chunks of 7MB: 1024*1024*7
      let chunks = Math.ceil(size / chunkSize); // 获取切片的个数
      let currentChunk = 0;
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();

      fileReader.onload = function (e: any) {
        const result = e.target?.result;
        spark.append(result); // Append array buffer
        currentChunk++;
        // console.log('reading...', currentChunk, fileMd5, filePieceMd5);
        const base64 = result.split(';base64,')[1];
        console.log(`第${currentChunk}分片解析完成，开始解析${currentChunk + 1}分片`);

        if (currentChunk < chunks) {
          loadNext();
        } else {
          console.log('finished');
          const fileMd5 = spark.end();

          console.log('解析完成');
          console.log(fileMd5);
          resolve(fileMd5);
        }
      };
      fileReader.onabort = () => {
        console.log('fileReader被中断');
      };
      fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
      };

      const loadNext = () => {
        let start = currentChunk * chunkSize;
        let end = start + chunkSize >= size ? size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      };

      loadNext();
      // slice end
    }).catch((err) => {
      console.log(err);
    });
  };

  const uploadPieces = (blob: File) => {
    return new Promise((resolve, reject) => {
      // slice start
      const { name, size } = blob;
      // let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      // // let blobSlice = File.prototype.slice;
      let file = fileList[0];
      let chunkSize = 1024 * 1024 * 25; // Read in chunks of 7MB: 1024*1024*7
      let chunks = Math.ceil(size / chunkSize); // 获取切片的个数
      let currentChunk = 0;
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();

      fileReader.onload = function (e: any) {
        const result = e.target?.result;
        spark.append(result); // Append array buffer
        currentChunk++;
        const filePieceSpark = new SparkMD5(); // 文件md5
        filePieceSpark.append(result);
        const filePieceMd5 = filePieceSpark.end();
        // console.log('reading...', currentChunk, fileMd5, filePieceMd5);
        const base64 = result.split(';base64,')[1];
        console.log(`第${currentChunk}分片解析完成，开始解析${currentChunk + 1}分片`);
        // const param = {
        //   version: '1.0',
        //   clientType: '1',
        //   function: 100,
        //   fileName: name,
        //   fileSize: size,
        //   fileMd5: fileMd5,
        //   filePieceMd5: '',
        //   filePieceNum: currentChunk,
        //   filePieceData: 0, // 当前分片数据base64
        //   filePieceDataLen: 0, // base64 大小
        //   fileChunckSize: chunkSize // 分片大小，分片大小不能超过50M，建议值20M
        // };
        if (currentChunk < chunks) {
          loadNext();
        } else {
          console.log('finished');
          const fileMd5 = spark.end();

          console.log('解析完成');
          console.log(fileMd5);
          resolve(fileMd5);
        }
      };
      fileReader.onabort = () => {
        console.log('fileReader被中断');
      };
      fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
      };

      const loadNext = () => {
        let start = currentChunk * chunkSize;
        let end = start + chunkSize >= size ? size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      };

      loadNext();
      // slice end
    }).catch((err) => {
      console.log(err);
    });
  };
  // 上传组件相关属性
  const uploadProps: any = {
    onRemove: (file: IFileProps) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: IFileProps) => {
      console.log('beforeUpload===', file);
      // 是否重复选择
      const hasFile = fileList.find((item) => item.name === file.name) || '';
      console.log(hasFile);
      if (hasFile) {
        message.warning('已经添加过此文件');
        return;
      }
      if (fileList.length) {
        message.warning('不支持选多个文件');
        return;
      }
      handleFileSlice(file);
      setFileList([...fileList, file]);
      return false;
    },
    onChange: () => {},
    fileList
  };

  const [curStep, setCurStep] = useState<number>(0);
  const nextStepHandle = () => {
    setCurStep(curStep < 3 ? curStep + 1 : 3);
  };
  const prevStepHandle = () => {
    setCurStep(curStep > 0 ? curStep - 1 : 1);
  };
  // 选中的存储池
  const [storagePool, setStoragePool] = useState<string>();
  const onStoragePoolChange = (val: string) => {
    setStoragePool(val);
  };
  const onBlur = () => {};
  const onFocus = () => {};

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
        {curStep === 0 ? (
          <div className={css['upload-step']}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>添加文件</Button>
            </Upload>
          </div>
        ) : null}
        {curStep === 1 ? (
          <div className={css['upload-step']}>
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
              filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Select.Option value="default">default</Select.Option>
            </Select>
          </div>
        ) : null}
        {curStep === 2 ? (
          <div className={css['upload-step']}>
            <label>加密：</label>
            <Switch checked={false} />
          </div>
        ) : null}
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
            {curStep > 0 ? <Button onClick={prevStepHandle}>上一步</Button> : null}
            {curStep < 2 ? <Button onClick={nextStepHandle}>下一步</Button> : null}
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default Bucket;
