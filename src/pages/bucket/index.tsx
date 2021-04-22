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
import { IUploadRqt, IUploadProgressRqt } from '@/services/bucket';
import SparkMD5 from 'spark-md5';
import css from './index.module.less';
import Axios from 'axios';

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
  // 上传文件步骤Modal
  const [uploadVisible, setUploadModalVisible] = useState(false);
  // 上传文件进度状态Modal
  const [uploadProgressVisible, setUploadProgressVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showCreateModal = () => {
    setUploadModalVisible(true);
  };

  const handleCreateOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setUploadModalVisible(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCreateCancel = () => {
    console.log('Clicked cancel button');
    setUploadModalVisible(false);
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
  interface IChunkProps {
    filePieceMd5?: string;
    filePieceNum?: number; // 分片序列号，从1开始
    filePieceData?: string; // 当前分片数据base64
    filePieceDataLen?: number; // base64 大小
    fileChunckSize?: number; // 分片大小，分片大小不能超过50M，建议值20M
  }
  // 文件上传功能
  const [uploading, setUploading] = useState<boolean>(); // 加载状态
  const [fileList, setFileList] = useState<File[]>([]); // 文件列表
  const [fileInfo, setFileInfo] = useState<IFileItemProps & any>(); // 文件信息
  const [curChunk, setCurChunk] = useState<IChunkProps | null>(null); // 分片文件信息
  // const [chunkList, setChunkList] = useState<any[]>([]);
  let uploadTimer: any = null;
  let chunkInfo: any = {};

  const getUploadProgress = async (fileMd5: any) => {
    clearTimeout(uploadTimer);
    try {
      const param: IUploadProgressRqt[] = [
        {
          version: '1.0', // 版本号
          clientType: 'Brower', // 来自浏览器端还是PC端
          function: 400, // 400获取文件上传进度
          fileName: fileInfo.fileName, // 文件名
          fileMd5: fileMd5 // 文件MD5
        }
      ];
      const res = await bucketApi.uploadFilePiece(param);
      console.log('上传进度===', res);
    } catch (error) {
      message.error(error);
    }
  };
  // upload
  const handleUpload = async () => {
    console.log(fileList);
    console.log(fileInfo);
    setUploadModalVisible(false);
    setUploadProgressVisible(true);
    const fileMD5Value = await md5File(fileList[0]); // 第一步：按照 修改时间+文件名称+最后修改时间-->MD5
    setFileInfo({ ...fileInfo, fileMd5: fileMD5Value });
    // try {
    //   const param:IUploadRqt[] = [{
    //     "version":"1.0",
    //     "clientType":"Brower",
    //     "function":100,
    //     "fileName":"asdgasdg",
    //     "fileSize":333333,
    //     "fileMd5":"asdgasdg",
    //     "filePieceMd5":"asdgasdg",
    //     "filePieceNum":1,
    //     "filePieceData":"asdgasdg",
    //     "filePieceDataLen":346346,
    //     "fileChunckSize":346346
    //     }]
    //   const res = await bucketApi.uploadFilePiece(param)
    // } catch (error) {

    // }
    await uploadChunk(fileInfo); // 分片上传
    // 获取文件上传进度
    // uploadTimer = setTimeout(() => {
    //   getUploadProgress(fileMD5Value)
    // }, 3000);
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
      let filePieceNum = 0; // 分片序列号，从1开始
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
        const filePieceData = result?.split(';base64,')[1];
        // 构造分片文件信息
        const curChunkInfo: IChunkProps = {
          filePieceNum,
          filePieceMd5,
          filePieceData,
          filePieceDataLen: filePieceData?.length,
          fileChunckSize: chunkSize
        };
        chunkInfo[filePieceNum] = curChunkInfo;
        // setCurChunk(curChunkInfo);
        // chunkList.push(curChunkInfo)

        if (filePieceNum < chunks) {
          loadNext();
        } else {
          // let cur = +new Date();
          console.log('finished loading');
          // alert(spark.end() + '---' + (cur - pre)); // Compute hash
          let result = spark.end();
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
        fileReader.readAsDataURL(blobSlice.call(file, start, end)); // 分片文件转Base64
      }
      loadNext();
    });
  };

  // 分片上传
  const uploadChunk = async (file: any) => {
    const requestList: any = [];
    const { fileSize, chunkSize } = file;
    let chunks = Math.ceil(fileSize / chunkSize); // 获取切片的个数
    Object.keys(chunkInfo).forEach((key: any) => {
      // requestList.push(upload(key));
      upload(key);
    });

    // console.log({ requestList });
    // const result =
    //   requestList.length > 0
    //     ? await Promise.all(requestList)
    //         .then((result) => {
    //           console.log({ result });
    //           return result.every((i) => (i as any).ok);
    //         })
    //         .catch((err) => {
    //           return err;
    //         })
    //     : true;
    // console.log({ result });
    // return result === true;
  };

  const upload = async (i: number) => {
    console.log(chunkInfo);

    // return new Promise((resolve, reject) => {
    const { file, fileName, fileSize, chunkSize, fileMd5 } = fileInfo;
    const { filePieceMd5, filePieceData, fileChunckSize } = chunkInfo[i];
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
      filePieceData, // 当前分片数据base64
      filePieceDataLen: filePieceData?.length, // base64 大小
      fileChunckSize // 分片大小，分片大小不能超过50M，建议值20M
    };
    try {
      const res = await bucketApi.uploadFilePiece([param]);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
    // });
  };

  const creatFileInfo = (file: File) => {
    const currentChunk = 0;
    const fileSize = file.size;
    const fileName = file.name;
    const chunkSize = 1024 * 1024 * 20; // 每个文件切片大小定为20MB: 1024*1024*20
    const chunks = Math.ceil(fileSize / chunkSize); // 计算文件切片总数
    setFileInfo({
      file,
      // fileMd5: `${new Date().valueOf()}`,
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
        visible={uploadVisible}
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

      <Modal
        title="20px to Top"
        style={{ top: 20 }}
        visible={uploadProgressVisible}
        onOk={() => setUploadProgressVisible(false)}
        onCancel={() => setUploadProgressVisible(false)}
      >
        <p>some contents...</p>
        <p>some contents...</p>
        <p>some contents...</p>
      </Modal>
    </div>
  );
};

export default Bucket;
