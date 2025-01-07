// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 导入需要的组件
import LoginView  from '../views/LoginRegister.vue';
import RegisterView  from '../views/Regist.vue';
import IndexView from '../views/Index.vue';
import MovieView from '../views/Movie.vue';
import SearchPage from '../components/movie/SearchPage.vue';
import MovieIndex from '../components/movie/movie_index.vue';


// 定义路由
const routes = [
  { path: '/login', name:'Login', component: LoginView  },
  { path: '/regist', name:'Regist', component: RegisterView  },
  { path: '/index', name:'Index', component: IndexView },
  { path: '/movie',  name:'MovieIndex', component: MovieView },
  { path: '/search', name: 'SearchPage', component: SearchPage },
  { path: '/movie/:id', name: 'MovieDetail', component: MovieIndex },
];

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导出路由器
export default router;