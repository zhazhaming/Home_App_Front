<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="nav-logo">
        <router-link to="/">MY HOME</router-link>
      </div>
      <div class="nav-items">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/movie" class="nav-item">电影影厅</router-link>
        <router-link to="/ai-chat" class="nav-item">AI Chat</router-link>
        <router-link to="/smart-home" class="nav-item">智能家庭</router-link>
        <router-link to="/more" class="nav-item">更多</router-link>
      </div>
      
      <!-- 根据登录状态显示不同内容 -->
      <div v-if="userStore.isLoggedIn" class="user-profile">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-avatar :src="userStore.avatar"></el-avatar>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToUserCenter">个人中心</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <button v-else class="go-button" @click="goToLogin">Go to My Home</button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { onMounted } from 'vue';

const router = useRouter();
const userStore = useUserStore();

const goToUserCenter = () => {
  router.push('/user/center');
};

const goToLogin = () => {
  router.push('/login'); 
};

const handleLogout = () => {
  userStore.logout();
  router.push('/');
};

onMounted(() => {
  userStore.checkLoginStatus();
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0;
  margin: 0;
  height: auto; /* 确保高度自适应内容 */
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px 5%; /* 稍微减小内边距 */
  width: 100%;
  box-sizing: border-box;
}

.nav-logo a {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  text-decoration: none;
  letter-spacing: 1px;
}

.nav-items {
  display: flex;
  gap: 25px;
}

.nav-item {
  text-decoration: none;
  font-size: 16px;
  color: #555;
  font-weight: 500;
  position: relative;
  padding: 5px 0;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #4285f4;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #4285f4;
  transition: width 0.3s ease;
}

.nav-item:hover::after {
  width: 100%;
}

.go-button {
  background-color: #4285f4;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
}

.go-button:hover {
  background-color: #357ae8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-items {
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }
  
  .go-button {
    margin-top: 10px;
  }
}

/* 添加用户头像样式 */
.user-profile {
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
}
</style>
  