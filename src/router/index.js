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
import CategoryMovies from '../components/movie/CategoryMovies.vue';
import TypeMovies from '../views/movie/TypeMovies.vue';
import MyAIChat from '../views/chat/AIChat.vue';
import Notification from '../views/user/Notification.vue';


// 定义路由
const routes = [
  { path: '/login', name:'Login', component: LoginView  },
  { path: '/regist', name:'Regist', component: RegisterView  },
  { path: '/', name:'Index', component: IndexView },
  { path: '/movie',  name:'MovieIndex', component: MovieView },
  { path: '/search', name: 'SearchPage', component: SearchPage },
  { path: '/movie/:id', name: 'MovieDetail', component: MovieDetail },
  { path: '/movie/category/:category', name: 'CategoryMovies', component: CategoryMovies },
  { path: '/series', name: 'Series', component: TypeMovies, props: { type: 'tv', title: '连续剧' } },
  { path: '/anime', name: 'Anime', component: TypeMovies, props: { type: 'anime', title: '动漫' } },
  { path: '/shows', name: 'Shows', component: TypeMovies, props: { type: 'variety', title: '综艺节目' } },
  { path: '/ai-chat', name: 'MyAIChat', component: MyAIChat },
  { path: '/notification', name: 'Notification', component: Notification },
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