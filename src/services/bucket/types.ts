export interface IBucketsResponse {
  bucketName: string;
  createTime: string;
  owner: string;
}
export interface IBucketInfo extends IBucketsResponse{
  key: string;
}

export interface ICreateBucketRqt {
  bucketName: string;
}

export interface IDelBucketRqt {
  bucketNames: string[];
}

export interface IGetUserInfoResponse {
  username: string;
  age: number;
  gender: string;
}
