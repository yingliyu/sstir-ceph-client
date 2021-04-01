import React from 'react';

import css from './index.module.less';

import loadingImg from './img/loading.gif';

export default function LoadingPage() {
  return (
    <div className={css['loading-mask']}>
      <img src={loadingImg} className={css['loading-icon']} alt="loading..." />
    </div>
  );
}
