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
  Upload,
  Progress,
  List
} from 'antd';
import {
  PlusCircleOutlined,
  CloseCircleOutlined,
  RetweetOutlined,
  UploadOutlined,
  ReloadOutlined,
  CloseOutlined,
  PauseOutlined,
  CaretRightOutlined
} from '@ant-design/icons';
import { bucketApi } from '@/services';
import { IUploadRqt, IUploadProgressRqt } from '@/services/bucket';
import SparkMD5 from 'spark-md5';
import { showLoading, hideLoading } from '@/utils/loading';
import css from './index.module.less';
export interface FileItemType {
  fileMd5: string; // 取文件uuid
  fileSize: number;
  fileName: string;
  file: File;
  chunkSize: number; // 分片大小
  chunks: number; // 总片数
  filePieceNum: number; // 已上传片数
  // paused: boolean;
  uuid?: string; // 文件id
  sampleUuid?: string; // 文件所属样本id
  status?: number; // 当前文件上传状态, -1: error; 0: uploading; 1: finished; 2: paused; 3: waitting;
  createTime?: Date; // 创建时间
  succeedTime?: Date; // 成功时间（实则每次上传停止都会更新该时间）
  retryPiece?: Record<number, number>; // 记录每片重传次数，该片上传失败三次以上则状态变更为上传失败
  uploadSpeed?: number; // 上传速度，根据已上传文件大小及创建至今持续时间获取
  uploadFileName?: string;
}
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const Bucket = (props: any) => {
  const [curBucketName, setCurBucketName] = useState<string>();
  const { bucketName } = useParams<any>();
  const [list, setList] = useState([]);

  useEffect(() => {
    setCurBucketName(bucketName);
    getFilesInBucket();
    getFileList();
  }, []);

  
  const getFilesInBucket = async () => {
    try {
      const param = {
        bucketName: bucketName!
      };
      const res = await bucketApi.getFilesInBucket(param);
      console.log(res);
    } catch (error) {}
  };

  const getFileList = async () => {
    try {
      const param = {
        bucketName: bucketName!
      };
      const res = await bucketApi.getFileListInBucket(param);
      const result: any = res.map((item: any) => {
        item.key = item.filename;
        return item;
      });
      setList(result);
    } catch (error) {
      console.log(error);
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
      dataIndex: 'filename',
      sorter: true // 服务端排序
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      sorter: true // 服务端排序
    },
    {
      title: '标签数',
      dataIndex: 'tagsNum',
      sorter: true // 服务端排序
    },
    // {
    //   title: 'MD5',
    //   dataIndex: 'age'
    // },
    {
      title: '所属存储池',
      dataIndex: 'pool'
    },
    {
      title: '拥有者',
      dataIndex: 'owner'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
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
  const closeUploadModal = () => {
    if (uploading) {
      message.warning('文件上传中，确定关闭吗？');
    }
    setUploadProgressVisible(false);
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
  const [chunkList, setChunkList] = useState<any[]>([]); // 上传成功的文件片
  const [progressData, setProgressData] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<any>();
 
  let uploadTimer: any = null;
  let chunkInfo: any = {};
  let uploadProgressNum = 0;
  const getUploadProgress = async (fileMd5: any) => {
    clearTimeout(uploadTimer);
    const { fileSize } = fileInfo;
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
      console.log('进度入参：', param);
      const res: any = await bucketApi.uploadFilePiece(param);
      console.log('上传进度===', res);
      const { result, resultdes, fileUploadedDataLen } = res;
      if (result === 1) {
        uploadProgressNum++;
      }

      if (uploadProgressNum < 5) {
        uploadTimer = setTimeout(() => {
          getUploadProgress(fileMd5);
        }, 500);
      } else {
        if (result === 1) {
          message.error('服务器忙，请稍后再试');
          setUploadStatus('exception');
        }
        clearTimeout(uploadTimer);
      }
      if (result === 0) {
        setProgressData(Math.ceil(fileUploadedDataLen / fileSize) * 100);
        clearTimeout(uploadTimer);
      }
      if (resultdes.includes('success')) {
        // 上传成功
        hideLoading();
        setUploadStatus('');
        setUploading(false);
        getFileList()
        setProgressData(100); // 进度100%
        // message.success(resultdes);
      }
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
    setUploadStatus('active');
    setUploading(true);
    const fileMD5Value: any = await md5File(fileList[0]); // 第一步：按照 修改时间+文件名称+最后修改时间-->MD5
    setFileInfo({ ...fileInfo, fileMd5: fileMD5Value });

    await uploadChunk(fileInfo, fileMD5Value); // 分片上传
    // 获取文件上传进度
    uploadTimer = setTimeout(() => {
      getUploadProgress(fileMD5Value);
    }, 100);
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
  const uploadChunk = (file: any, fileMD5Value: string) => {
    const requestList: any = [];
    const { fileSize, chunkSize } = file;
    let chunks = Math.ceil(fileSize / chunkSize); // 获取切片的个数
    Object.keys(chunkInfo).forEach(async (key: any) => {
      console.log('*****', key);
      let exit = chunkList.indexOf(key) > -1;
      if (!exit) {
        await upload(key, fileMD5Value);
      }
    });
  };
  // 上传API
  const upload = async (i: number, fileMd5: string) => {
    console.log(chunkInfo);
    const { file, fileName, fileSize, chunkSize } = fileInfo;
    const { filePieceMd5, filePieceData, fileChunckSize } = chunkInfo[i];
    let end = (i + 1) * chunkSize >= file.size ? file.size : (i + 1) * chunkSize;
    const param: IUploadRqt[] = [
      {
        version: '1.0',
        clientType: '1',
        function: 100,
        fileName: fileName,
        fileSize,
        fileMd5,
        filePieceMd5,
        filePieceNum: Number(i),
        filePieceData, // 当前分片数据base64
        filePieceDataLen: filePieceData?.length, // base64 大小
        fileChunckSize // 分片大小，分片大小不能超过50M，建议值20M
      }
    ];
    console.log('第', i, '片文件--入参：', param);
    try {
      const res: any = await bucketApi.uploadFilePiece(param);
      const { result } = res;
      console.log('第', i, '片文件--返回结果：', res);
      setChunkList([...chunkList, i]);
      if (result === 1) {
        // "添加数据到缓存失败"再重新请求一次
        upload(i, fileMd5);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const creatFileInfo = (file: File) => {
    const currentChunk = 0;
    const fileSize = file.size;
    const fileName = file.name;
    const chunkSize = 1024 * 1024 * 7; // 每个文件切片大小定为7MB: 1024*1024*7
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
  const pauseUpload = ()=>{
    console.log('pause')
  }
  const cancleUpload = ()=>{
    console.log('cancleUpload')
  }
  const continueUpload = ()=>{
    console.log('continueUpload')
  }

  // 控制文件上传
  const actionRender = (status:Number)=>{
    let actionEle = [] as React.ReactNode[];
    let rateText = '';
    switch (status) {
      case 0:
        actionEle = [
          <PauseOutlined key="pause" onClick={pauseUpload} />,
          <CloseOutlined key="close" onClick={cancleUpload} />,
        ];
        // rateText = `${progressRatio}(${handleFileSize(uploadSpeed || 0)}/s)`;
        break;
      case -1:
        actionEle = [
          <ReloadOutlined key="pause" onClick={continueUpload} />,
          <CloseOutlined key="close" onClick={cancleUpload} />,
        ];
        rateText = 'Fail';
        break;
      case 2:
        actionEle = [
          <CaretRightOutlined key="continue" onClick={continueUpload} />,
          <CloseOutlined key="close" onClick={cancleUpload} />,
        ];
        rateText = 'Pause';
        break;
      case 1:
        // rateText = `Completed(${moment(succeedTime).format('YY/MM/DD HH:mm')})`;
        break;
      case 3:
      default:
        rateText = 'Waitting...';
        break;
    }
  }

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
        dataSource={list}
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
        title="上传文件"
        style={{ top: 10, right: 0 }}
        mask={false}
        visible={uploadProgressVisible}
        footer={null}
        onOk={() => setUploadProgressVisible(false)}
        onCancel={closeUploadModal}
      >
        <List
      header={<div>Header</div>}
      footer={<div>Footer</div>}
      bordered
      dataSource={[fileInfo]}
      renderItem={item => (
        <List.Item>
          <b> {item.fileName}</b>  
          <Progress percent={progressData} size="small" status={uploadStatus} />
          {actionRender}
        </List.Item>
      )}
    />
        {/* <p>{fileInfo?.fileName + ':'}</p>
        <Progress percent={progressData} size="small" status={uploadStatus} /> */}
      </Modal>
    </div>
  );
};

export default Bucket;
