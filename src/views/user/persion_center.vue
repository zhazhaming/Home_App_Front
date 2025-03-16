<template>
  <div class="settings-container">
    <!-- 侧边栏 -->
    <UserSidebar :activeMenu="activeMenu" @menu-change="handleMenuChange" />
    
    <!-- 主内容区域 -->
    <div class="settings-content">
      <!-- 账号设置 -->
      <AccountSettings v-if="activeMenu === 'account'" />
      
      <!-- 我的影厅 -->
      <MyTheater v-if="activeMenu === 'theater'" :subMenu="subMenu" @sub-menu-change="handleSubMenuChange" />
      
      <!-- 观看历史 -->
      <WatchHistory v-if="activeMenu === 'history'" :timeRange="subMenu" />
      
      <!-- 预约/收藏 -->
      <BookmarkCollection v-if="activeMenu === 'bookmark'" />
      
      <!-- 我的AI Chat -->
      <MyAIChat v-if="activeMenu === 'ai-chat'" />
      
      <!-- 我的家庭 -->
      <MyHome v-if="activeMenu === 'home'" />
      
      <!-- 积分设置 -->
      <PointsSettings v-if="activeMenu === 'points'" />
      
      <!-- 会员中心 -->
      <MemberCenter v-if="activeMenu === 'member'" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';

// 导入组件
import UserSidebar from '../../components/user/UserSidebar.vue';
import AccountSettings from '../../components/user/AccountSettings.vue';
import MyTheater from '../../components/user/MyTheater.vue';
import WatchHistory from '../../components/user/WatchHistory.vue';
import BookmarkCollection from '../../components/user/BookmarkCollection.vue';
// import MyAIChat from '../../components/user/MyAIChat.vue';
// import MyHome from '../../components/user/MyHome.vue';
// import PointsSettings from '../../components/user/PointsSettings.vue';
// import MemberCenter from '../../components/user/MemberCenter.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 当前激活的菜单项
const activeMenu = ref('account'); // 默认显示账号设置
const subMenu = ref('week'); // 默认显示一周内的历史

// 处理菜单切换
const handleMenuChange = (menu) => {
  if (menu === 'theater') {
    activeMenu.value = 'history'; // 默认显示观看历史
    subMenu.value = 'week'; // 默认显示一周内
  } else if (menu === 'history') {
    activeMenu.value = menu;
    subMenu.value = 'week'; // 默认显示一周内
  } else {
    activeMenu.value = menu;
  }
};

// 处理子菜单切换
const handleSubMenuChange = (menu) => {
  if (menu === 'history') {
    activeMenu.value = 'history';
    subMenu.value = 'week'; // 默认显示一周内
  } else if (menu === 'bookmark') {
    activeMenu.value = 'bookmark';
  } else if (menu === 'week' || menu === 'earlier') {
    activeMenu.value = 'history';
    subMenu.value = menu;
  }
};

onMounted(() => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  // 从路由参数获取初始菜单（如果有）
  if (route.query.menu) {
    handleMenuChange(route.query.menu);
  }
  if (route.query.submenu) {
    subMenu.value = route.query.submenu;
  }
});
</script>

<style scoped>
.settings-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 60px; /* 为顶部导航栏留出空间 */
}

.settings-content {
  flex: 1;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }
  
  .settings-content {
    margin: 10px;
    padding: 15px;
  }
}
</style>
