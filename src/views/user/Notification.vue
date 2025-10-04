<template>
  <div class="notification-container">
    <div class="notification-header">
      <div class="header-left">
        <h2>站内通知</h2>
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="unread-badge">
          <span class="unread-text">{{ unreadCount }} 条未读</span>
        </el-badge>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="goBack">
          <i class="el-icon-back"></i> 返回
        </el-button>
        <el-button type="primary" size="small" @click="handleMarkAllRead" :disabled="unreadCount === 0">
          <i class="el-icon-check"></i> 全部已读
        </el-button>
      </div>
    </div>

    <div class="filter-tabs">
      <el-radio-group v-model="activeFilter" @change="handleFilterChange">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button :label="0">未读</el-radio-button>
        <el-radio-button :label="1">已读</el-radio-button>
      </el-radio-group>
    </div>

    <div class="notification-content" v-loading="loading">
      <div v-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>{{ activeFilter === 0 ? '暂无未读通知' : '暂无通知' }}</p>
      </div>

      <div v-else class="notification-list">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="notification-item"
          :class="{ unread: item.isRead === 0 }"
          @click="handleNotificationClick(item)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(item.type)" :style="{ color: getNotificationColor(item.type) }"></i>
          </div>
          <div class="notification-body">
            <div class="notification-header-info">
              <h4 class="notification-title">{{ item.title }}</h4>
              <span v-if="item.isRead === 0" class="unread-dot"></span>
            </div>
            <p class="notification-message">{{ item.content }}</p>
            <div class="notification-footer">
              <span class="notification-time">{{ formatTime(item.createTime) }}</span>
              <span v-if="item.type" class="notification-type">{{ getTypeName(item.type) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="total > pageSize" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '../../stores/userStore';
import {
  getNotificationList,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../../services/notificationApi';

const router = useRouter();
const userStore = useUserStore();

const notifications = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const unreadCount = ref(0);
const activeFilter = ref(null); // null-全部, 0-未读, 1-已读

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true;
  
  try {
    const response = await getNotificationList({
      userId: userStore.user_id,
      page: currentPage.value,
      pageSize: pageSize.value,
      isRead: activeFilter.value
    });

    if (response.data.code === 200) {
      // 处理后端数据格式，转换为前端期望的格式
      const rawData = response.data.data?.messages || [];
      
      notifications.value = rawData.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.messageType, // 后端字段名是 messageType
        isRead: item.isRead ? 1 : 0, // 后端返回布尔值，转换为数字
        createTime: item.createdAt, // 后端字段名是 createdAt
        movieId: item.movieId,
        movieTitle: item.movieTitle,
        readAt: item.readAt
      }));
      total.value = response.data.data?.total || 0;
    } else {
      ElMessage.error(response.message || '获取通知列表失败');
    }
  } catch (error) {
    ElMessage.error('获取通知列表失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 获取未读数量
const fetchUnreadCount = async () => {
  try {
    const response = await getUnreadCount(userStore.user_id);
    if (response.code === 200) {
      unreadCount.value = response.data || 0;
    }
  } catch (error) {
    // 静默处理错误
  }
};

// 点击通知
const handleNotificationClick = async (item) => {
  // 如果是未读，标记为已读
  if (item.isRead === 0) {
    try {
      const response = await markAsRead(item.id, userStore.user_id);
      if (response.code === 200) {
        item.isRead = 1;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
        ElMessage.success('已标记为已读');
      }
    } catch (error) {
      ElMessage.error('标记已读失败');
    }
  }
};

// 一键全部已读
const handleMarkAllRead = async () => {
  if (unreadCount.value === 0) return;

  try {
    await ElMessageBox.confirm('确定将所有未读通知标记为已读吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await markAllAsRead(userStore.user_id);
    if (response.code === 200) {
      ElMessage.success('已全部标记为已读');
      unreadCount.value = 0;
      fetchNotifications();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

// 筛选切换
const handleFilterChange = () => {
  currentPage.value = 1;
  fetchNotifications();
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchNotifications();
};


// 返回
const goBack = () => {
  router.back();
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  // 其他
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 获取通知图标
const getNotificationIcon = (type) => {
  const iconMap = {
    system: 'el-icon-bell',
    message: 'el-icon-message',
    order: 'el-icon-shopping-cart-2',
    update: 'el-icon-refresh',
    warning: 'el-icon-warning',
    success: 'el-icon-success',
    // 后端返回的类型
    MOVIE_ONLINE: 'el-icon-video-play',
    MOVIE_UPDATE: 'el-icon-refresh',
    USER_MESSAGE: 'el-icon-message',
    SYSTEM_NOTICE: 'el-icon-bell'
  };
  return iconMap[type] || 'el-icon-bell';
};

// 获取通知颜色
const getNotificationColor = (type) => {
  const colorMap = {
    system: '#409EFF',
    message: '#67C23A',
    order: '#E6A23C',
    update: '#909399',
    warning: '#F56C6C',
    success: '#67C23A',
    // 后端返回的类型
    MOVIE_ONLINE: '#E6A23C',
    MOVIE_UPDATE: '#909399',
    USER_MESSAGE: '#67C23A',
    SYSTEM_NOTICE: '#409EFF'
  };
  return colorMap[type] || '#409EFF';
};

// 获取类型名称
const getTypeName = (type) => {
  const nameMap = {
    system: '系统通知',
    message: '消息通知',
    order: '订单通知',
    update: '更新通知',
    warning: '警告',
    success: '成功',
    // 后端返回的类型
    MOVIE_ONLINE: '电影上线',
    MOVIE_UPDATE: '电影更新',
    USER_MESSAGE: '用户消息',
    SYSTEM_NOTICE: '系统公告'
  };
  return nameMap[type] || '通知';
};

onMounted(() => {
  // 首先检查并恢复登录状态
  userStore.checkLoginStatus();
  
  // 等待一下让 checkLoginStatus 完成
  setTimeout(() => {
    // 检查用户状态
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      return;
    }
    
    if (!userStore.user_id) {
      ElMessage.warning('用户信息异常，请重新登录');
      return;
    }
    
    // 获取数据
    fetchNotifications();
    fetchUnreadCount();
  }, 100);
});
</script>

<style scoped>
.notification-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.notification-header {
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
}

.unread-badge {
  margin-right: 0;
}

.unread-text {
  font-size: 14px;
  color: #606266;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-tabs {
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.notification-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.notification-list {
  padding: 12px;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  margin-bottom: 8px;
}

.notification-item:hover {
  background: #f5f7fa;
  border-color: #e5e7eb;
  transform: translateX(4px);
}

.notification-item.unread {
  background: #ecf5ff;
  border-color: #d9ecff;
}

.notification-item.unread:hover {
  background: #d9ecff;
}

.notification-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
  font-size: 24px;
}

.notification-item.unread .notification-icon {
  background: #fff;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.notification-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-type {
  font-size: 12px;
  color: #409EFF;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .notification-container {
    padding: 12px;
  }

  .notification-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .notification-item {
    flex-direction: column;
  }
}
</style>

