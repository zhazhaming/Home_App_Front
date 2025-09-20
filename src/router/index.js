// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 导入需要的组件
import LoginView  from '../views/LoginRegister.vue';
import RegisterView  from '../views/Regist.vue';
import IndexView from '../views/Index.vue';
import MovieView from '../views/movie/Movie.vue';
import SearchPage from '../views/movie/SearchPage.vue';
import MovieDetail from '../views/movie/MovieDetail.vue';
import UserCenter from '../views/user/personal_center.vue';
import AccountSettings from '../views/user/AccountSettings.vue';
import MyTheater from '../views/user/MyTheater.vue';


// 定义路由
const routes = [
  { path: '/login', name:'Login', component: LoginView  },
  { path: '/regist', name:'Regist', component: RegisterView  },
  { path: '/', name:'Index', component: IndexView },
  { path: '/movie',  name:'MovieIndex', component: MovieView },
  { path: '/search', name: 'SearchPage', component: SearchPage },
  { path: '/movie/:id', name: 'MovieDetail', component: MovieDetail },
  { path: '/user/center', name: 'UserCenter', component: UserCenter },
  { path: '/user/account-settings', name: 'AccountSettings', component: AccountSettings },
  { path: '/user/my-theater', name: 'MyTheater', component: MyTheater },
];

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导出路由器
export default router;