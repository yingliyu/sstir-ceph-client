import React, { FC, useState, useEffect } from 'react';
import { Layout, Menu, Badge } from 'antd';
import Breadcrumb, { BreadcrumbPath } from '@/components/breadcrumb';
import IconFont from '@/utils/iconfont';
import { RouterMain } from '@/router';
import css from './index.module.less';
import msgIcon from './imgs/msg.png';
const { Header, Sider, Content, Footer } = Layout;
const { SubMenu } = Menu;

const LayoutMain: FC = (props: any) => {
  console.log(props);
  const [breadcrumbList, setBreadcrumbList] = useState<BreadcrumbPath[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string[]>([]);

  useEffect(() => {
    getOpenMenu();
    setBreadcrumbList([
      { text: '存储桶', link: '/admin/dashboard' }
      // { text: '文件列表', link: '' }
    ]);
    // /* eslint-disable */
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (e: any) => {
    props.history.push(e.key);
  };

  const handleOpenChange = (openKeys: any) => {
    setOpenMenu(openKeys);
  };

  const getOpenMenu = () => {
    const currentPath = props.location.pathname;
    console.log(props.location.pathname);

    const temp = currentPath.split('/');
    if (temp.length > 3) {
      const ret = temp.slice(0, 3).join('/');
      setOpenMenu([ret]);
    } else {
      return [];
    }
  };

  return (
    <Layout className={css['layout-main']}>
      <Header className={css['header']}>
        {/* <div className="logo" /> */}
        <b>存储项目</b>
        <div className={css['user-info']}>
          <Badge count={2}>
            <img width="20px" src={msgIcon} />
          </Badge>
          <span className={css['username']}>用户名XXX</span>
        </div>
      </Header>
      <Layout>
        <Sider>
          <Menu
            theme="light"
            mode="inline"
            onClick={handleMenuClick}
            openKeys={openMenu}
            selectedKeys={props.location.pathname}
            onOpenChange={handleOpenChange}
          >
            {RouterMain.filter((item) => !item.noMenu).map((router: any) =>
              router?.child ? (
                <SubMenu
                  key={router.path}
                  title={
                    <span>
                      {router?.iconType ? (
                        <IconFont type={router.iconType} />
                      ) : router.icon ? (
                        <router.icon />
                      ) : null}
                      <span>{router.name}</span>
                    </span>
                  }
                >
                  {router.child
                    .filter((item: any) => !item.noMenu)
                    .map((item: any) => (
                      <Menu.Item key={item.path}>
                        {item?.iconType ? (
                          <IconFont type={item.iconType} />
                        ) : item.icon ? (
                          <item.icon />
                        ) : null}
                        <span>{item.name}</span>
                      </Menu.Item>
                    ))}
                </SubMenu>
              ) : (
                <Menu.Item key={router.path}>
                  {router?.iconType ? (
                    <IconFont type={router.iconType} />
                  ) : router.icon ? (
                    <router.icon />
                  ) : null}
                  <span>{router.name}</span>
                </Menu.Item>
              )
            )}
          </Menu>
        </Sider>
        <Content className={css['content']}>
          <div className={css['breadcrumb-wrapper']}>
            <span className={css['icon-left']} />
            <Breadcrumb path={breadcrumbList} />
          </div>
          <div className={css['container']}>{props.children}</div>
        </Content>
      </Layout>
      {/* <Footer>footer</Footer> */}
    </Layout>
  );
};

export default LayoutMain;
