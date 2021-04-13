import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  checkLogin,
  getUserInfo,
  selectToken,
  selectErrMsg,
  selectUserInfo
} from '@/store/modules/app';
import { Button, Input, message, Form } from 'antd';
import css from './index.module.less';
import sideImg from './imgs/1.png';

const Home = (props: any) => {
  const token = useSelector(selectToken);
  const errMsg = useSelector(selectErrMsg);
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) {
      // dispatch(checkLogin({ accessKey: 'KZSD2SLM3QJ5TJD8KCHZ', secretKey: '0tAwZ2Jld5mxTyZ3Xk0uysDDlBhuKA8BdyVoIAej' }));
    }
  }, []);

  useEffect(() => {
    if (token) {
      // 根据token获取用户信息
      // dispatch(getUserInfo(token));
    }
  }, [token]);

  const onGetClick = () => {
    if (token) {
      dispatch(getUserInfo(token));
    }
  };

  // 表单信息
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
  };
  const tailLayout = {
    wrapperCol: { offset: 0, span: 24 }
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
    // dispatch(checkLogin({ accessKey: 'KZSD2SLM3QJ5TJD8KCHZ', secretKey: '0tAwZ2Jld5mxTyZ3Xk0uysDDlBhuKA8BdyVoIAej' }));
    dispatch(checkLogin(values));
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    // form.resetFields();
  };
  return (
    <div className={css['home']}>
      {/* {token}
      {errMsg}
      {JSON.stringify(userInfo)}
      <Button onClick={onGetClick}>get userinfo</Button>
      <Input /> */}
      <img src={sideImg} alt="" />
      <div className={css['login-wrapper']}>
        <h1>HI~欢迎登陆Ceph企业版</h1>
        <Form
          {...layout}
          form={form}
          name="basic"
          initialValues={{
            accessKey: 'ISGSGCRIXDOCRFQTO2WY',
            secretKey: 'TQ3WcDy3zltMZ36oawy8VMKep7rzff0kqAsLoI5y'
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label=""
            name="accessKey"
            rules={[{ required: true, message: '请输入Access Key!' }]}
          >
            <Input placeholder="Access Key" />
          </Form.Item>
          <Form.Item
            label=""
            name="secretKey"
            rules={[{ required: true, message: '请输入Secret Key!' }]}
          >
            <Input.Password placeholder="Secret Key" />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button shape="round" block type="primary" htmlType="submit">
              登陆
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Home;
