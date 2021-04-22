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
  const { bucketName } = useParams<any>();

  useEffect(() => {
    setCurBucketName(bucketName);
    getFilesInBucket();
  }, []);
  // 获取存储桶中的文件列表
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

  interface IFileItemProps {
    fileMd5: string; // 取文件uuid
    fileSize: number;
    fileName: string;
    file: File;
    chunkSize: number; // 分片大小
    chunks: number; // 总片数
    filePieceNum: number; // 已上传片数
    uuid?: string; // 文件id
    sampleUuid?: string; // 文件所属样本id
    status?: number; // 当前文件上传状态, -1: error; 0: uploading; 1: finished; 2: paused; 3: waitting;
    createTime?: Date; // 创建时间
    succeedTime?: Date; // 成功时间（实则每次上传停止都会更新该时间）
    retryPiece?: Record<number, number>; // 记录每片重传次数，该片上传失败三次以上则状态变更为上传失败
    uploadSpeed?: number; // 上传速度，根据已上传文件大小及创建至今持续时间获取
  }
  // 文件上传功能
  const [uploading, setUploading] = useState<boolean>();
  const [fileList, setFileList] = useState<Blob[]>([]);
  const [fileInfo, setFileInfo] = useState<IFileItemProps[]>([]);

  // handle upload
  let blobSlice = File.prototype.slice;
  const handleUpload = async () => {
    console.log(fileList);
  };

  // file slice
  const handleFileSlice = (blob: any) => {
    return new Promise((resolve, reject) => {
      // slice start
      const { name, size } = blob;
      // let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      let blobSlice = File.prototype.slice;
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

  // 分片上传
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
  const creatFileInfo = (file: Blob) => {
    console.log(file);

    // const currentChunk = 0;
    // const fileSize = file.size;
    // const fileName = file.name;
    // const chunkSize = 1024 * 1024 * 20; // 每个文件切片大小定为20MB: 1024*1024*20
    // const chunks = Math.ceil(fileSize / chunkSize); // 计算文件切片总数
    // setFileList([
    //   ...fileList,
    //   {
    //     file,
    //     fileMd5: `${new Date().valueOf()}`,
    //     fileName,
    //     fileSize,
    //     chunkSize,
    //     chunks,
    //     filePieceNum: currentChunk
    //   }
    // ]);
  };
  // 上传组件相关属性
  const uploadProps: any = {
    onRemove: (file: any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: File) => {
      console.log('beforeUpload===', file);
      // 是否重复选择
      // const hasFile = fileList.find((item) => item.fileName === file.name) || '';
      // if (hasFile) {
      //   message.warning('已经添加过此文件');
      //   return;
      // }
      // if (fileList.length) {
      //   message.warning('不支持选多个文件');
      //   return;
      // }
      // setUploading(true);
      // creatFileInfo(file)
      return false;
    },
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
            <UploadOutlined {...uploadProps}>
              <Button icon={<UploadOutlined />}>添加文件</Button>
            </UploadOutlined>
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
              disabled={!fileList.length}
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
