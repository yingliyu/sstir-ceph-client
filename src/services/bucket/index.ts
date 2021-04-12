import { AppPost, AppGet } from '@/utils/request';

import { IBucketsResponse, IGetUserInfoResponse } from './types';

// 获取存储桶列表
export function getBuckets() {
  return AppGet<IBucketsResponse[]>('/client/bucket');
}

// 获取存储桶详情
export function getBucketInfo(bucketName: string) {
  return AppGet<IGetUserInfoResponse>(`/client/bucket/${bucketName}`);
}
