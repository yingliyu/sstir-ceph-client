import React from 'react';
import loadable from '@loadable/component';

import Loading from '@/components/loading';

export default (path: any) => {
  return loadable(() => path, {
    fallback: Loading()
  });
};
