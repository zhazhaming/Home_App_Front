<template>
  <div class="bookmark-collection">
    <h2 class="section-title">预约/收藏</h2>
    
    <el-tabs v-model="activeTab" class="bookmark-tabs">
      <el-tab-pane label="电影预约" name="reservation">
        <div class="tab-content">
          <!-- 状态筛选器 -->
          <div class="filter-section">
            <el-radio-group v-model="reservationFilter" @change="handleReservationFilterChange" class="status-filter">
              <el-radio-button label="all">全部数据</el-radio-button>
              <el-radio-button label="PENDING">已预约</el-radio-button>
              <el-radio-button label="NOTIFIED">已通知</el-radio-button>
              <el-radio-button label="CANCELLED">已取消</el-radio-button>
            </el-radio-group>
          </div>
          
          <el-empty v-if="filteredReservations.length === 0" description="暂无预约电影"></el-empty>
          
          <!-- 筛选结果统计信息 -->
          <div v-if="filteredReservations.length > 0" class="filter-info">
            <span class="filter-count">
              当前筛选结果：{{ filteredReservationTotal }} 条
              <span v-if="reservationFilter !== 'all'">（共 {{ reservationTotal }} 条数据）</span>
            </span>
          </div>
          
          <div v-if="filteredReservations.length > 0" class="movie-grid">
            <div v-for="item in filteredReservations" :key="item.id" class="movie-card">
              <div class="card-poster">
                <el-image :src="item.poster || '/default-movie-poster.jpg'" fit="cover">
                  <template #error>
                    <div class="image-placeholder">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </template>
                </el-image>
                <div class="status-badge" :class="getStatusClass(item.status)">
                  {{ getStatusText(item.status) }}
                </div>
              </div>
              
              <div class="card-info">
                <h3 class="movie-title">{{ item.title }}</h3>
                <p class="reservation-info">预约邮箱: {{ item.notifyEmail }}</p>
                <p class="reservation-date">预约时间: {{ formatDate(item.createdAt) }}</p>
                <p class="user-info">用户: {{ item.username }}</p>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click="viewReservationDetail(item)">查看详情</el-button>
                  <el-button 
                    v-if="item.status === 'PENDING'" 
                    type="danger" 
                    size="small" 
                    @click="cancelReservation(item.id)"
                  >
                    取消预约
                  </el-button>
                  <el-tag v-else-if="item.status === 'NOTIFIED'" type="success" size="small">已通知</el-tag>
                  <el-tag v-else-if="item.status === 'CANCELLED'" type="info" size="small">已取消</el-tag>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pagination-container" v-if="filteredReservationTotal > 0">
            <el-pagination
              background
              layout="prev, pager, next, total"
              :total="filteredReservationTotal"
              :page-size="pageSize"
              :current-page="reservationPage"
              @current-change="(page) => handlePageChange(page, 'reservation')"
            ></el-pagination>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="收藏电影" name="collection">
        <div class="tab-content">
          <el-empty v-if="collections.length === 0" description="暂无收藏电影"></el-empty>
          
          <div v-else class="movie-grid">
            <div v-for="item in collections" :key="item.id" class="movie-card">
              <div class="card-poster">
                <el-image :src="item.poster" fit="cover">
                  <template #error>
                    <div class="image-placeholder">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </template>
                </el-image>
                <div class="rating-badge" v-if="item.rating">
                  {{ item.rating }}
                </div>
              </div>
              
              <div class="card-info">
                <h3 class="movie-title" @click="goToMovieDetail(item.movieId)">{{ item.title }}</h3>
                <p class="collection-date">收藏时间: {{ formatSimpleDate(item.collectionDate) }}</p>
                <p class="movie-type">类型: {{ item.type || '未知' }}</p>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click="goToMovieDetail(item.movieId)">查看详情</el-button>
                  <el-button type="danger" size="small" @click="removeCollection(item.id)">取消收藏</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pagination-container" v-if="collections.length > 0">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="collectionTotal"
              :page-size="pageSize"
              :current-page="collectionPage"
              @current-change="(page) => handlePageChange(page, 'collection')"
            ></el-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { ENV_CONFIG } from '../../config/env';
import { useUserStore } from '../../stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref('reservation');

// 分页相关
const pageSize = ref(12);
const reservationPage = ref(1);
const collectionPage = ref(1);
const reservationTotal = ref(0);
const collectionTotal = ref(0);

// 数据列表
const reservations = ref([]);
const collections = ref([]);

// 筛选相关
const reservationFilter = ref('all');
const filteredReservations = ref([]);
const filteredReservationTotal = ref(0);

// 获取预约数据总数
const fetchReservationSize = async () => {
  try {
    console.log('🔍 开始获取预约数据总数...');
    
    const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/movice/getReservationSize`, {
      params: {
        userId: userStore.user_id
      },
      headers: { 
        Authorization: `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📦 预约数据总数响应:', response);
    
    if (response.data && response.data.code === 200) {
      reservationTotal.value = response.data.data || 0;
      console.log('✅ 预约数据总数获取成功:', reservationTotal.value);
      console.log('📊 分页计算: 总数', reservationTotal.value, '每页', pageSize.value, '页数', Math.ceil(reservationTotal.value / pageSize.value));
      return reservationTotal.value;
    } else {
      console.error('❌ 预约数据总数响应错误:', response.data);
      ElMessage.error(response.data?.msg || '获取预约数据总数失败');
      return 0;
    }
  } catch (error) {
    console.error('❌ 获取预约数据总数失败:', error);
    ElMessage.error('获取预约数据总数失败');
    return 0;
  }
};

// 获取预约列表（获取所有数据，前端筛选和分页）
const fetchReservations = async () => {
  try {
    console.log('🔍 开始获取预约列表...');
    console.log('用户信息:', {
      userId: userStore.user_id,
      token: userStore.token ? '已设置' : '未设置',
      isLoggedIn: userStore.isLoggedIn
    });
    
    // 检查用户是否已登录
    if (!userStore.isLoggedIn || !userStore.user_id) {
      ElMessage.warning('请先登录');
      return;
    }
    
    // 先获取数据总数
    await fetchReservationSize();
    
    // 获取所有数据，不传分页参数
    const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/movice/getReservation`, {
      params: {
        userId: userStore.user_id
        // 移除 page 和 pageSize 参数，获取所有数据
      },
      headers: { 
        Authorization: `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📦 预约列表响应:', response);
    
    if (response.data && response.data.code === 200) {
      reservations.value = response.data.data || [];
      // 应用筛选
      applyReservationFilter();
      console.log('✅ 预约列表获取成功:', reservations.value);
    } else {
      console.error('❌ 预约列表响应错误:', response.data);
      ElMessage.error(response.data?.msg || '获取预约列表失败');
    }
  } catch (error) {
    console.error('❌ 获取预约列表失败:', error);
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    // 尝试备用请求方法
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.log('🔄 尝试备用请求方法...');
      try {
        const backupResponse = await fetch(`${ENV_CONFIG.API_BASE_URL}/movice/getReservation?userId=${userStore.user_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userStore.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (backupResponse.ok) {
          const data = await backupResponse.json();
        if (data.code === 200) {
          reservations.value = data.data || [];
          // 应用筛选
          applyReservationFilter();
          console.log('✅ 备用请求成功:', reservations.value);
          return;
        }
        }
      } catch (backupError) {
        console.error('❌ 备用请求也失败:', backupError);
      }
    }
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问预约列表');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络');
    } else {
      ElMessage.error(`获取预约列表失败: ${error.response?.data?.msg || error.message}`);
    }
  }
};

// 获取收藏列表
const fetchCollections = async () => {
  try {
    const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/user/collections`, {
      params: {
        page: collectionPage.value,
        pageSize: pageSize.value
      },
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      collections.value = response.data.data.items;
      collectionTotal.value = response.data.data.total;
    } else {
      ElMessage.error(response.data.message || '获取收藏列表失败');
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    ElMessage.error('获取收藏列表失败');
  }
};

// 应用预约筛选和分页
const applyReservationFilter = () => {
  console.log('🔍 应用筛选，当前筛选条件:', reservationFilter.value);
  console.log('🔍 原始数据:', reservations.value);
  
  let filteredData = [];
  
  if (reservationFilter.value === 'all') {
    filteredData = reservations.value;
  } else {
    filteredData = reservations.value.filter(item => {
      console.log('🔍 检查项目状态:', item.status, '筛选条件:', reservationFilter.value);
      return item.status === reservationFilter.value;
    });
  }
  
  // 计算分页
  const startIndex = (reservationPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  
  // 应用分页
  filteredReservations.value = filteredData.slice(startIndex, endIndex);
  
  // 筛选后的总数用于显示当前页面的筛选结果数量
  filteredReservationTotal.value = filteredData.length;
  
  console.log('🔍 筛选结果:', filteredReservations.value);
  console.log('🔍 筛选后总数:', filteredReservationTotal.value);
  console.log('🔍 当前页:', reservationPage.value, '每页:', pageSize.value, '总页数:', Math.ceil(filteredReservationTotal.value / pageSize.value));
};

// 处理预约筛选变化
const handleReservationFilterChange = () => {
  // 筛选变化时重置到第一页
  reservationPage.value = 1;
  applyReservationFilter();
};

// 处理页码变化
const handlePageChange = (page, type) => {
  if (type === 'reservation') {
    reservationPage.value = page;
    // 不需要重新获取数据，只需要重新应用筛选和分页
    applyReservationFilter();
  } else if (type === 'collection') {
    collectionPage.value = page;
    fetchCollections();
  }
};

// 格式化日期（简单版本）
const formatSimpleDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 格式化上映日期
const formatReleaseDate = (dateString) => {
  const releaseDate = new Date(dateString);
  const now = new Date();
  
  // 计算天数差异
  const diffTime = releaseDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `还有${diffDays}天上映`;
  } else if (diffDays === 0) {
    return '今日上映';
  } else {
    return '已上映';
  }
};

// 跳转到电影详情
const goToMovieDetail = (movieId) => {
  router.push({ name: 'MovieDetail', params: { id: movieId } });
};

// 取消预约
const cancelReservation = (reservationId) => {
  ElMessageBox.confirm('确定要取消这个预约吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`${ENV_CONFIG.API_BASE_URL}/user/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      
      if (response.data.code === 200) {
        ElMessage.success('取消预约成功');
        fetchReservations(); // 重新获取列表
      } else {
        ElMessage.error(response.data.message || '取消预约失败');
      }
    } catch (error) {
      console.error('取消预约失败:', error);
      ElMessage.error('取消预约失败');
    }
  }).catch(() => {});
};

// 取消收藏
const removeCollection = (collectionId) => {
  ElMessageBox.confirm('确定要取消收藏这部电影吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`${ENV_CONFIG.API_BASE_URL}/user/collections/${collectionId}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      
      if (response.data.code === 200) {
        ElMessage.success('取消收藏成功');
        fetchCollections(); // 重新获取列表
      } else {
        ElMessage.error(response.data.message || '取消收藏失败');
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      ElMessage.error('取消收藏失败');
    }
  }).catch(() => {});
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'NOTIFIED': '已通知',
    'PENDING': '待通知',
    'CANCELLED': '已取消'
  };
  return statusMap[status] || status;
};

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'NOTIFIED': 'status-notified',
    'PENDING': 'status-pending',
    'CANCELLED': 'status-cancelled'
  };
  return classMap[status] || 'status-default';
};

// 查看预约详情
const viewReservationDetail = (item) => {
  ElMessageBox.alert(`
    <div style="text-align: left;">
      <p><strong>电影名称:</strong> ${item.title}</p>
      <p><strong>通知邮箱:</strong> ${item.notifyEmail}</p>
      <p><strong>预约时间:</strong> ${formatDate(item.createdAt)}</p>
      <p><strong>用户:</strong> ${item.username}</p>
      <p><strong>状态:</strong> ${getStatusText(item.status)}</p>
    </div>
  `, '预约详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定'
  });
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  // 确保用户状态正确
  userStore.checkLoginStatus();
  
  console.log('🚀 组件挂载，用户状态:', {
    isLoggedIn: userStore.isLoggedIn,
    userId: userStore.user_id,
    token: userStore.token ? '已设置' : '未设置'
  });
  
  console.log('🚀 初始化筛选状态:', {
    reservationFilter: reservationFilter.value,
    pageSize: pageSize.value,
    reservationPage: reservationPage.value
  });
  
  // 强制刷新数据
  setTimeout(() => {
    console.log('🔄 延迟执行数据获取...');
    fetchReservations();
    fetchCollections();
  }, 100);
});
</script>

<style scoped>
.bookmark-collection {
  animation: fadeIn 0.5s ease;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 10px;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(to right, #409eff, #a0cfff);
}

.bookmark-tabs {
  margin-top: 20px;
}

.tab-content {
  margin-top: 20px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.status-filter {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.status-filter .el-radio-button {
  flex: 1;
  max-width: 120px;
}

.status-filter .el-radio-button__inner {
  width: 100%;
  text-align: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-filter .el-radio-button__inner:hover {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.status-filter .el-radio-button.is-active .el-radio-button__inner {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.filter-info {
  margin: 15px 0;
  padding: 10px 15px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  text-align: center;
}

.filter-count {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.movie-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-poster {
  position: relative;
  height: 200px;
}

.card-poster .el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #909399;
}

.release-badge, .rating-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.release-badge {
  background-color: #e6a23c;
  color: #fff;
}

.rating-badge {
  background-color: #f56c6c;
  color: #fff;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.status-notified {
  background: rgba(103, 194, 58, 0.9);
}

.status-pending {
  background: rgba(230, 162, 60, 0.9);
}

.status-cancelled {
  background: rgba(245, 108, 108, 0.9);
}

.status-default {
  background: rgba(144, 147, 153, 0.9);
}

.card-info {
  padding: 15px;
}

.movie-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 10px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.movie-title:hover {
  color: #409eff;
}

.reservation-date, .collection-date, .movie-type {
  font-size: 14px;
  color: #606266;
  margin: 5px 0;
}

.reservation-info, .user-info {
  font-size: 14px;
  color: #606266;
  margin: 5px 0;
}

.reservation-info {
  color: #409eff;
  font-weight: 500;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
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
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .card-actions .el-button {
    width: 100%;
  }
  
  .status-filter {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-filter .el-radio-button {
    max-width: none;
  }
  
  .filter-section {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .status-filter .el-radio-button__inner {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style> 