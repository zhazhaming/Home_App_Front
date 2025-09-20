# home-web

工程级前端项目结构（Vite + Vue3 + Pinia + Vue Router + Element Plus）。

## 开发

```
npm install
npm run dev
```

## 构建

```
npm run build
npm run preview
```

## 环境变量

在项目根目录创建环境文件：

```
.env.development
VITE_API_BASE_URL=http://localhost:8100
VITE_API_TIMEOUT=15000

.env.production
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=15000
```

## 目录结构（关键）

```
src/
  assets/               # 静态资源、全局样式
    styles/
  components/           # 纯展示或可复用组件
  composables/          # 组合式函数（useXxx）
  constants/            # 常量（API 路径、配置、枚举）
  config/               # 运行时配置（env）
  router/               # 路由
  services/             # API 封装和请求实例
  stores/               # Pinia 状态管理
  utils/                # 工具函数
  views/                # 页面级组件
```

## 代码规范

- 所有网络请求统一走 `src/services/request.js` 实例。
- 不在组件中硬编码后端地址，统一使用 `ENV_CONFIG.API_BASE_URL`。
