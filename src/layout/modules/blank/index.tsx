import React, { FC } from 'react';
import { Layout } from 'antd';

import css from './index.module.less';

const { Header, Footer, Content } = Layout;

const LayoutBlank: FC = (props) => {
  return (
    <Layout className={css['layout-blank']}>
      {/* <Header className={css['header']}>blank header</Header> */}
      <Content className={css['content']}>{props.children}</Content>
      {/* <Footer className={css['footer']}>footer</Footer> */}
    </Layout>
  );
};

export default LayoutBlank;
