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
  const [fileList, setFileList] = useState<File[]>([]);
  const [fileInfo, setFileInfo] = useState<IFileItemProps & any>();
  const [chunkInfo, setChunkInfo] = useState<any>();
  // upload
  const handleUpload = async () => {
    console.log(fileList);
    console.log(fileInfo);
    md5File(fileList[0]);
    // continueUpload(fileInfo);
  };
  // 获取文件MD5
  const md5File = (file: any) => {
    return new Promise((resolve, reject) => {
      let blobSlice =
        File.prototype.slice ||
        (File.prototype as any).mozSlice ||
        (File.prototype as any).webkitSlice;
      const fileSize = file.size;
      const fileName = file.name;
      const chunkSize = 1024 * 1024 * 20; // 每个文件切片大小定为20MB: 1024*1024*20
      const chunks = Math.ceil(fileSize / chunkSize); // 计算文件切片总数
      let filePieceNum = 0;
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();

      fileReader.onload = function (e: any) {
        const result = e.target?.result as string;
        console.log('read chunk nr', filePieceNum + 1, 'of', chunks);
        spark.append(e.target.result); // Append array buffer
        filePieceNum++;
        const filePieceSpark = new SparkMD5(); // 文件md5
        filePieceSpark.append(result);
        const filePieceMd5 = filePieceSpark.end();

        const base64 = result?.split(';base64,')[1];

        setChunkInfo({
          ...chunkInfo,
          [filePieceNum]: {
            filePieceMd5,
            filePieceNum,
            filePieceData: base64,
            filePieceDataLen: base64?.length,
            fileChunckSize: chunkSize
          }
        });
        console.log({
          ...chunkInfo,
          [filePieceNum]: {
            filePieceMd5,
            filePieceNum,
            filePieceData: base64,
            filePieceDataLen: base64?.length,
            fileChunckSize: chunkSize
          }
        });

        if (filePieceNum < chunks) {
          loadNext();
        } else {
          // let cur = +new Date();
          console.log('finished loading');
          // alert(spark.end() + '---' + (cur - pre)); // Compute hash
          let result = spark.end();
          setFileInfo({ fileMd5: result, ...fileInfo });
          console.log(result);
          resolve(result);
        }
      };
      fileReader.onerror = function (err) {
        console.warn('oops, something went wrong.');
        reject(err);
      };
      function loadNext() {
        let start = filePieceNum * chunkSize;
        let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsDataURL(blobSlice.call(file, start, end));
      }
      loadNext();
    });
  };
  // 分片上传
  // const uploadChunk = async (file: any, fileMd5Value: string, chunkList: any[]) => {
  //   const requestList = [];
  //   const { fileSize, chunkSize } = file;
  //   let chunks = Math.ceil(fileSize / chunkSize); // 获取切片的个数
  //   for (let i = 0; i < chunks; i++) {
  //     let exit = chunkList.indexOf(i + '') > -1;
  //     // 如果已经存在, 则不用再上传当前块
  //     if (!exit) {
  //       requestList.push(uploadHandle(i, fileMd5Value, file));
  //     }
  //   }
  //   console.log({ requestList });
  //   const result =
  //     requestList.length > 0
  //       ? await Promise.all(requestList)
  //           .then((result) => {
  //             console.log({ result });
  //             return result.every((i) => (i as any).ok);
  //           })
  //           .catch((err) => {
  //             return err;
  //           })
  //       : true;
  //   console.log({ result });
  //   return result === true;
  // };

  const uploadHandle = (i: number, filePieceMd5: string, fileInfo: any) => {
    return new Promise((resolve, reject) => {
      const { file, fileName, fileSize, chunkSize, fileMd5 } = fileInfo;
      let end = (i + 1) * chunkSize >= file.size ? file.size : (i + 1) * chunkSize;
      const param: IUploadRqt = {
        version: '1.0',
        clientType: '1',
        function: 100,
        fileName: fileName,
        fileSize,
        fileMd5,
        filePieceMd5,
        filePieceNum: i,
        // filePieceData: base64, // 当前分片数据base64
        // filePieceDataLen: base64?.length, // base64 大小
        fileChunckSize: chunkSize // 分片大小，分片大小不能超过50M，建议值20M
      };
      const data = bucketApi.uploadFilePiece(param);
    });
  };

  const creatFileInfo = (file: File) => {
    const currentChunk = 0;
    const fileSize = file.size;
    const fileName = file.name;
    const chunkSize = 1024 * 1024 * 20; // 每个文件切片大小定为20MB: 1024*1024*20
    const chunks = Math.ceil(fileSize / chunkSize); // 计算文件切片总数
    setFileInfo({
      file,
      fileMd5: `${new Date().valueOf()}`,
      fileName,
      fileSize,
      chunkSize,
      chunks,
      filePieceNum: currentChunk
    });
  };
  // 上传组件相关属性
  const uploadProps: any = {
    onRemove: (file: File) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: File) => {
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
      creatFileInfo(file);
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
