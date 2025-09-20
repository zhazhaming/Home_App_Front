<template>
  <div class="settings-container">
    <!-- 侧边栏 -->
    <UserSidebar :activeMenu="activeMenu" @menu-change="handleMenuChange" />
    
    <!-- 主内容区域 -->
    <div class="settings-content">
      <div class="top-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
      <!-- 账号设置 -->
      <AccountSettings v-if="activeMenu === 'account'" />
      
      <!-- 观影设置 -->
      <ViewingSettings v-if="activeMenu === 'viewing'" :subMenu="subMenu" />
      
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
import AccountSettings from './AccountSettings.vue';
import ViewingSettings from './ViewingSettings.vue';
import WatchHistory from './WatchHistory.vue';
import BookmarkCollection from './BookmarkCollection.vue';
import MyAIChat from './MyAIChat.vue';
// import MyHome from './MyHome.vue';
// import PointsSettings from './PointsSettings.vue';
// import MemberCenter from './MemberCenter.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 当前激活的菜单项
const activeMenu = ref('account'); // 默认显示账号设置
const subMenu = ref('week'); // 默认显示一周内的历史

// 处理菜单切换
const handleMenuChange = (menu) => {
  activeMenu.value = menu;
  if (menu === 'viewing') {
    subMenu.value = 'week'; // 默认显示一周内的历史
  }
};

// 处理子菜单切换（保留用于其他可能的子菜单功能）
const handleSubMenuChange = (menu) => {
  // 观影设置现在作为主菜单，不需要子菜单切换逻辑
  if (menu === 'week' || menu === 'earlier') {
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

// 返回首页
const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.settings-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 20px; /* 大幅减少顶部留白 */
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
  margin: 0;
  padding-left: 0;
  padding-right: 0;
}

.settings-content {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin: 15px 15px 15px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  animation: fadeIn 0.5s ease;
  width: calc(100vw - 230px);
  max-width: none;
  box-sizing: border-box;
  margin-top: 0; /* 与侧边栏顶部对齐 */
}

.top-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.top-actions .el-button {
  border-radius: 20px;
  padding: 10px 18px;
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
    padding-top: 80px; /* 为移动端增加更多顶部空间 */
    width: 100vw;
  }
  
  .settings-content {
    margin: 10px;
    padding: 15px;
    width: calc(100vw - 20px);
  }
}

@media (max-width: 480px) {
  .settings-content {
    margin: 5px;
    padding: 10px;
    width: calc(100vw - 10px);
  }
}
</style>
