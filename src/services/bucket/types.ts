export interface IBucketsResponse {
  name: string;
  owner: { displayName: string; id: string };
  creationDate: string;
}
export interface IBucketInfo {
  key:string
  name: string
  creationDate: string
  owner:string
}
export interface ICreateBucketRqt {
  bucketName: string;
}

export interface IDelBucketRqt{
  bucketNames: string[];
}

export interface IGetUserInfoResponse {
  username: string;
  age: number;
  gender: string;
}
