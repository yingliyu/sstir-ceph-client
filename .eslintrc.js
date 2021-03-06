module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
    test: false,
    expect: false
  },
  rules: {
    // 自定义你的规则
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    "no-debugger":process.env!=='dev'?'off':'on',
    "@typescript-eslint/no-this-alias":['off']
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
