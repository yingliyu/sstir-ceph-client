import { AppPost, AppGet, AppPut, AppDelete } from '@/utils/request';

import { IBucketsResponse, ICreateBucketRqt, IGetUserInfoResponse } from './types';

// 获取存储桶列表
export function getBuckets() {
  return AppGet<IBucketsResponse[]>('/client/bucket');
}

// 创建存储桶
export function addBucket(param: ICreateBucketRqt) {
  return AppPut<IGetUserInfoResponse>(`/client/bucket/${param.bucketName}`, param);
}

// 删除存储桶
export function deleteBucket(param: ICreateBucketRqt) {
  return AppDelete<IGetUserInfoResponse>(`/client/bucket/${param.bucketName}`, param);
}
