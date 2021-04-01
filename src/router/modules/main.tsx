import React from 'react';
import {
  DashboardOutlined,
  SettingOutlined,
  ToolOutlined,
  TeamOutlined,
  CompassOutlined,
  RocketOutlined
} from '@ant-design/icons';
import loadable from '@loadable/component';

import Loading from '@/components/loading';

const PersonCenter = loadable(() => import('@/pages/person-center'), {
  fallback: <Loading />
});

const DashBoard = loadable(() => import('@/pages/dashboard'), {
  fallback: <Loading />
});

const Setting = loadable(() => import('@/pages/setting'), {
  fallback: <Loading />
});

const UserList = loadable(() => import('@/pages/user-list'), {
  fallback: <Loading />
});

const routerMain = [
  {
    path: '/admin/dashboard',
    name: '首页',
    component: DashBoard,
    icon: DashboardOutlined,
    exact: true,
    noMenu: false
  },
  {
    path: '/admin/user',
    name: '对象存储',
    icon: ToolOutlined,
    noMenu: false,
    child: [
      {
        path: '/admin/user/list',
        name: '用户',
        component: UserList,
        icon: TeamOutlined,
        exact: true,
        noMenu: false,
        state: { name: '用户' }
      }
    ]
  },
  {
    path: '/admin/mgt',
    name: '系统管理',
    icon: RocketOutlined,
    noMenu: false,
    child: [
      {
        path: '/admin/mgt/setting',
        name: '设置',
        component: Setting,
        icon: SettingOutlined,
        exact: true,
        noMenu: false
      },
      {
        path: '/admin/mgt/my',
        name: '个人中心',
        component: PersonCenter,
        icon: CompassOutlined,
        exact: true,
        noMenu: false
      }
    ]
  }
];

export default routerMain;
