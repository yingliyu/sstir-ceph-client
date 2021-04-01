import React from 'react';

import loadable from '@loadable/component';

import Loading from '@/components/loading';

const Home = loadable(() => import(/* webpackChunkname: home */ '@/pages/home'), {
  fallback: <Loading />
});

const About = loadable(() => import('@/pages/about'), {
  fallback: <Loading />
});

const Login = loadable(() => import('@/pages/login'), {
  fallback: <Loading />
});

const NotFound = loadable(() => import('@/pages/error/404'), {
  fallback: <Loading />
});

const RouterBlank = [
  {
    name: '首页',
    path: '/home',
    component: Home,
    exact: true,
    nomenu: true,
    child: []
  },
  {
    path: '/about',
    component: About,
    exact: true,
    nomenu: true,
    child: []
  },
  { name: '登陆', path: '/login', component: Login, exact: true, nomenu: true, child: [] },
  {
    path: '/404',
    component: NotFound,
    exact: true,
    nomenu: true,
    child: []
  }
];

export default RouterBlank;
