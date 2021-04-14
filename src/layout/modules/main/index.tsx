import React, { FC, useState, useEffect } from 'react';
import { Layout, Menu, Badge, Popover } from 'antd';
import Breadcrumb, { BreadcrumbPath } from '@/components/breadcrumb';
import IconFont from '@/utils/iconfont';
import { RouterMain } from '@/router';
import css from './index.module.less';
import msgIcon from './imgs/msg.png';
import logoIcon from './imgs/logo.png';
const { Header, Sider, Content, Footer } = Layout;
const { SubMenu } = Menu;

const LayoutMain: FC = (props: any) => {
  const [breadcrumbList, setBreadcrumbList] = useState<BreadcrumbPath[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string[]>([]);

  useEffect(() => {
    getOpenMenu();
    writeBreadcrumb();
  }, []);
  useEffect(() => {
    writeBreadcrumb();
  }, [props]);

  // 面包屑导航
  const writeBreadcrumb = () => {
    let pathname = props.location.pathname;
    let arr: any[] = [];
    let menu = [];
    // 遍历一级导航
    RouterMain?.forEach((item: any) => {
      // 遍历二级导航
      if (pathname.includes(item.path)) {
        arr.push({
          link: item.path,
          text: item.name,
          key: item.path
        });

        item?.child &&
          item?.child.forEach((it: any) => {
            if (it.path === pathname) {
              arr.push({
                link: undefined,
                text: it.name
              });
            }
          });
      }
      const bucketName = '/admin/dashboard/:bucketName';
      if (pathname.includes('dashboard') && item.path === bucketName) {
        const text = pathname.split('/')[3];
        arr.push({
          link: undefined,
          key: item.path,
          text: text
        });
      }
    });
    // 遍历完后赋值
    setBreadcrumbList(arr ? arr : []);
  };

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
    const temp = currentPath.split('/');
    if (temp.length > 3) {
      const ret = temp.slice(0, 3).join('/');
      setOpenMenu([ret]);
    } else {
      return [];
    }
  };
  const content = (
    <ul>
      <li>
        <a>Hi,xxx</a>
      </li>
      <li>
        <a>退出登陆</a>
      </li>
    </ul>
  );
  return (
    <Layout className={css['layout-main']}>
      <Header className={css['header']}>
        <a href="/admin/dashboard">
          <img width="25px" src={logoIcon} />
          <span>Ceph存储</span>
        </a>
        <div className={css['user-info']}>
          <Badge size="small" count={2}>
            <img width="15px" src={msgIcon} />
          </Badge>
          <Popover
            getPopupContainer={(triggerNode: any) => triggerNode.parentNode}
            // visible={true}
            content={content}
            title={null}
            trigger="hover"
          >
            <span className={css['username']}>用户名XXX</span>
          </Popover>
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
