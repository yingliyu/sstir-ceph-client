export interface IBucketsResponse {
  name: string;
  owner: { displayName: string; id: string };
  creationDate: string;
}

export interface IGetUserInfoResponse {
  username: string;
  age: number;
  gender: string;
}
