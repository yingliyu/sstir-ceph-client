export interface ICheckLoginRequest {
  accessKey: string;
  secretKey: string;
}

export interface ICheckLoginResponse {
  data: string;
}

export interface IGetUserInfoResponse {
  username: string;
  age: number;
  gender: string;
}
