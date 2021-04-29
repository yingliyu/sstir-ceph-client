import { AppPostUpload, AppGet, AppPost, AppPut, AppDelete } from '@/utils/request';

import { IBucketsResponse, ICreateBucketRqt, IDelBucketRqt, IGetUserInfoResponse } from './types';

// 获取存储桶列表
export function getBuckets() {
  return AppGet<IBucketsResponse[]>('/client/bucket');
}

// 创建存储桶
export function addBucket(param: ICreateBucketRqt) {
  return AppPut<IGetUserInfoResponse>(`/client/bucket/${param.bucketName}`, param);
}

// 删除存储桶
export function deleteBuckets(param: IDelBucketRqt) {
  return AppDelete<IGetUserInfoResponse>(`/client/bucket`, param);
}

// 获取存储桶详情
export function getFilesInBucket(param: ICreateBucketRqt) {
  return AppGet<any>(`/client/bucket/${param.bucketName}`, param);
}
export type FuncType = 100 | 200 | 300 | 400;
export interface IUploadRqt {
  version?: string;
  clientType?: string;
  function?: FuncType; // 100:上传 | 300 获取下载对象信息 | 400:上传进度 | 200:下载
  fileName: string;
  fileSize: number;
  fileMd5: string;
  filePieceMd5?: string;
  filePieceNum?: number; // 分片序列号，从1开始
  filePieceData?: string; // 当前分片数据base64
  filePieceDataLen?: number; // base64 大小
  fileChunckSize?: number; // 分片大小，分片大小不能超过50M，建议值20M
}
export interface IUploadProgressRqt {
  version: string;
  clientType: string;
  function: FuncType;
  fileName: string;
  fileMd5: string;
}
// 文件上传
export function uploadFilePiece(param: IUploadRqt[] | IUploadProgressRqt[]) {
  return AppPostUpload(`/fastcgi`, param, 'upload');
}
export function uploadFileCtrl(param: IUploadRqt[] | IUploadProgressRqt[]) {
  return AppPostUpload(`/fastcgi`, param, 'ctrl');
}
// 获取文件列表
export function getFileListInBucket(param: ICreateBucketRqt) {
  return AppGet<any>(`/client/object/${param.bucketName}`, param);
}
