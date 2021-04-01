export interface ICheckLoginRequest {
  username: string;
  password: string;
  verifyCode: string;
}

export interface ICheckLoginResponse {
  token: string;
}

export interface IGetUserInfoResponse {
  username: string;
  age: number;
  gender: string;
}
