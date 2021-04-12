const { REACT_APP_AUTH_TOKEN, REACT_APP_URL_TYPE } = process.env;

const getUrl = () => {
  switch (REACT_APP_URL_TYPE) {
    case 'dev':
      return {
        baseUrl: 'http://10.12.0.123:9009',
        uploadUrl: 'http://rap2api.taobao.org/app/mock/249164'
      };
    case 'qa':
      return {
        baseUrl: 'http://10.12.0.123:9009',
        uploadUrl: 'http://rap2api.taobao.org/app/mock/249164'
      };
    case 'prod':
      return {
        baseUrl: 'http://10.12.0.123:9009',
        uploadUrl: 'http://rap2api.taobao.org/app/mock/249164'
      };
    default:
      return {
        baseUrl: 'http://10.12.0.123:9009',
        uploadUrl: 'http://rap2api.taobao.org/app/mock/249164'
      };
  }
};

export default {
  token: REACT_APP_AUTH_TOKEN,
  ...getUrl()
};
