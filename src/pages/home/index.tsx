import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  checkLogin,
  getUserInfo,
  selectToken,
  selectErrMsg,
  selectUserInfo
} from '@/store/modules/app';
import { Button, Radio, Input, message, Form } from 'antd';
import css from './index.module.less';
import sideImg from './imgs/1.png';

const Home = (props: any) => {
  const token = useSelector(selectToken);
  const errMsg = useSelector(selectErrMsg);
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) {
      dispatch(checkLogin({ username: '1', password: '2', verifyCode: 'c' }));
    }
  }, []);

  useEffect(() => {
    if (token) {
      // 根据token获取用户信息
      dispatch(getUserInfo(token));
    }
  }, [token]);

  const onGetClick = () => {
    if (token) {
      dispatch(getUserInfo(token));
    }
  };
  // tab栏
  const [val, setVal] = useState('account');
  const handleChange = (e: any) => {
    setVal(e.target.value);
    console.log(e);
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
    if (values.username === 'admin' && values.password === '123456') {
      message.success(`${values.username}恭喜你，登录成功！！！`);
      setTimeout(() => props.history.push('/admin/dashboard'), 1000);
    }
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
        <span>HI~</span>
        <Radio.Group value={val} onChange={handleChange}>
          <Radio.Button value="account">账号登陆</Radio.Button>
          <Radio.Button value="phone">短信登陆</Radio.Button>
        </Radio.Group>
        <p>欢迎登陆Ceph企业版</p>
        <Form
          {...layout}
          form={form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          {val === 'account' ? (
            // 账号登陆
            <>
              <Form.Item
                label=""
                name="username"
                rules={[{ required: true, message: '请输入注册邮箱!' }]}
              >
                <Input placeholder="请输入注册邮箱" />
              </Form.Item>
              <Form.Item
                label=""
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </>
          ) : (
            // 短信登陆
            <>
              <Form.Item
                label=""
                name="phone"
                rules={[{ required: true, message: '请输入手机号!' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
              <Form.Item
                label=""
                name="checkCode"
                rules={[{ required: true, message: '请输入验证码!' }]}
              >
                <Input placeholder="请输入验证码" />
              </Form.Item>
            </>
          )}
          <Form.Item {...tailLayout}>
            <Button shape="round" block type="primary" htmlType="submit">
              登陆
            </Button>
          </Form.Item>
        </Form>

        <div className={css['home-tips']}>
          <a href="">忘记密码</a>
          <span>
            还没账户？<a href="">去注册</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
