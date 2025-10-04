<template>
  <header class="header">
    <div class="search-bar">
      <el-input v-model="query" placeholder="搜索电影、电视剧、综艺、动漫"></el-input>
      <el-button type="primary" @click="search">搜索</el-button>
    </div>
    <div class="header-right">
      <!-- 通知图标 -->
      <div v-if="userStore.isLoggedIn" class="notification-icon" @click="goToNotification">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
          <el-icon :size="24" class="notification-bell">
            <Bell />
          </el-icon>
        </el-badge>
      </div>
      <!-- 用户信息 -->
      <div class="user-info">
        <el-dropdown v-if="userStore.isLoggedIn">
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
        <el-button v-else type="primary" @click="goToLogin">登录</el-button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Bell } from '@element-plus/icons-vue';
import { ENV_CONFIG } from '../../config/env';
import { useMovieStore } from '../../stores/movieStore';
import { useUserStore } from '../../stores/userStore';
import { getUnreadCount } from '../../services/notificationApi';

const query = ref('');
const router = useRouter();
const search_url = ref(`${ENV_CONFIG.API_BASE_URL}/movice/`);
const movieStore = useMovieStore();
const userStore = useUserStore();
const unreadCount = ref(0);
let pollingInterval = null;

const search = async () => {
  if (query.value.trim()) {
    try {
      console.log(search_url.value + 'getByName?name=' + query.value);
      const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/movice/getByName?name=${query.value}`);
      if (response.data.code === 200) {
        console.log('Movies data:', response.data.data);
        movieStore.setMovies(response.data.data);
        router.push({ name: 'SearchPage', query: { q: query.value } });
      } else {
        console.error('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }
};

// 获取未读通知数量
const fetchUnreadCount = async () => {
  if (!userStore.isLoggedIn || !userStore.user_id) return;
  
  try {
    const response = await getUnreadCount(userStore.user_id);
    if (response.data.code === 200) {
      unreadCount.value = response.data.data || 0;
    }
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
  }
};

// 跳转到通知页面
const goToNotification = () => {
  router.push('/notification');
};

const goToLogin = () => {
  router.push('/login');
};

const handleLogout = () => {
  userStore.logout();
  router.push('/');
};

const goToUserCenter = () => {
  router.push('/user/center');
};

onMounted(() => {
  userStore.checkLoginStatus();
  
  // 首次加载获取未读数量
  if (userStore.isLoggedIn) {
    fetchUnreadCount();
    
    // 每30秒轮询一次未读数量
    pollingInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
  }
});

onUnmounted(() => {
  // 清除轮询
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 20px;
}

.notification-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.notification-icon:hover {
  background-color: #e6f7ff;
}

.notification-bell {
  color: #606266;
  transition: all 0.3s ease;
}

.notification-icon:hover .notification-bell {
  color: #409EFF;
  transform: rotate(20deg);
}

.user-info {
  display: flex;
  align-items: center;
}

.el-input {
  flex: 1;
}

.el-button {
  min-width: 80px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

:deep(.el-badge__content) {
  background-color: #f56c6c;
  border: 2px solid #fff;
}
</style>