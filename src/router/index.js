// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 导入需要的组件
import LoginView  from '../views/LoginRegister.vue';
import RegisterView  from '../views/Regist.vue';
import IndexView from '../views/Index.vue';
import MovieView from '../views/Movie.vue';

// 定义路由
const routes = [
  { path: '/login', component: LoginView  },
  { path: '/regist', component: RegisterView  },
  { path: '/index', component: IndexView },
  { path: '/movie', component: MovieView },
];

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导出路由器
export default router;