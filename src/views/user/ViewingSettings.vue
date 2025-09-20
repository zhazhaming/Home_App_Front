<template>
  <div class="viewing-settings">
    <h2 class="section-title">观影设置</h2>
    
    <!-- 观影设置内容 -->
    <div class="settings-content">
      <el-card class="main-card">
        <template #header>
          <div class="card-header">
            <span>观看记录与收藏</span>
          </div>
        </template>
        
        <el-tabs v-model="activeTab" class="viewing-tabs">
          <el-tab-pane label="播放设置" name="settings">
            <div class="tab-content">
              <div class="settings-form">
                <el-form :model="settingsForm" label-width="120px">
                  <el-form-item label="默认清晰度">
                    <el-select v-model="settingsForm.defaultQuality" placeholder="请选择默认清晰度">
                      <el-option label="自动" value="auto"></el-option>
                      <el-option label="1080P" value="1080p"></el-option>
                      <el-option label="720P" value="720p"></el-option>
                      <el-option label="480P" value="480p"></el-option>
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="播放速度">
                    <el-select v-model="settingsForm.playbackSpeed" placeholder="请选择播放速度">
                      <el-option label="0.5x" value="0.5"></el-option>
                      <el-option label="0.75x" value="0.75"></el-option>
                      <el-option label="1.0x" value="1.0"></el-option>
                      <el-option label="1.25x" value="1.25"></el-option>
                      <el-option label="1.5x" value="1.5"></el-option>
                      <el-option label="2.0x" value="2.0"></el-option>
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="自动播放">
                    <el-switch v-model="settingsForm.autoPlay"></el-switch>
                  </el-form-item>
                  
                  <el-form-item label="记住播放位置">
                    <el-switch v-model="settingsForm.rememberPosition"></el-switch>
                  </el-form-item>
                  
                  <el-form-item label="弹幕设置">
                    <el-switch v-model="settingsForm.showDanmaku"></el-switch>
                  </el-form-item>
                  
                  <el-form-item label="音量">
                    <el-slider v-model="settingsForm.volume" :min="0" :max="100" show-input></el-slider>
                  </el-form-item>
                </el-form>
                
                <div class="settings-actions">
                  <el-button type="primary" @click="saveSettings">保存设置</el-button>
                  <el-button @click="resetSettings">重置设置</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="观看历史" name="history">
            <div class="tab-content">
              <div class="history-header">
                <div class="time-filter">
                  <el-radio-group v-model="selectedTimeRange" @change="handleTimeRangeChange">
                    <el-radio-button label="week">一周内</el-radio-button>
                    <el-radio-button label="earlier">更早</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              
              <div class="history-content">
                <el-empty v-if="historyList.length === 0" description="暂无观看记录"></el-empty>
                
                <div v-else class="history-list">
                  <div v-for="(group, date) in groupedHistory" :key="date" class="history-group">
                    <div class="date-header">{{ formatDate(date) }}</div>
                    
                    <div class="history-items">
                      <div v-for="item in group" :key="item.id" class="history-item" @click="goToMovieDetail(item.movieId)">
                        <div class="movie-poster">
                          <el-image :src="item.poster" fit="cover">
                            <template #error>
                              <div class="image-placeholder">
                                <i class="el-icon-picture-outline"></i>
                              </div>
                            </template>
                          </el-image>
                        </div>
                        
                        <div class="movie-info">
                          <h3 class="movie-title">{{ item.title }}</h3>
                          <p class="watch-time">观看时间: {{ formatTime(item.watchTime) }}</p>
                          <p class="progress">观看进度: {{ item.progress }}%</p>
                          <div class="progress-bar">
                            <div class="progress-inner" :style="{ width: item.progress + '%' }"></div>
                          </div>
                        </div>
                        
                        <div class="actions">
                          <el-button type="primary" size="small" @click.stop="continueWatch(item)">继续观看</el-button>
                          <el-button type="danger" size="small" @click.stop="removeHistory(item.id)">删除记录</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="pagination-container" v-if="historyList.length > 0">
                  <el-pagination
                    background
                    layout="prev, pager, next"
                    :total="totalItems"
                    :page-size="pageSize"
                    :current-page="currentPage"
                    @current-change="handlePageChange"
                  ></el-pagination>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="预约/收藏" name="bookmark">
            <div class="tab-content">
              <el-tabs v-model="bookmarkActiveTab" class="bookmark-sub-tabs">
                <el-tab-pane label="电影预约" name="reservation">
                  <div class="sub-tab-content">
                    <!-- 状态筛选器 -->
                    <div class="filter-section">
                      <el-radio-group v-model="reservationFilter" @change="handleReservationFilterChange" class="status-filter">
                        <el-radio-button label="all">全部数据</el-radio-button>
                        <el-radio-button label="PENDING">已预约</el-radio-button>
                        <el-radio-button label="NOTIFIED">已通知</el-radio-button>
                        <el-radio-button label="CANCELLED">已取消</el-radio-button>
                      </el-radio-group>
                    </div>
                    
                    <!-- 筛选结果统计信息 -->
                    <div v-if="filteredReservations.length > 0" class="filter-info">
                      <span class="filter-count">
                        当前筛选结果：{{ filteredReservations.length }} 条
                        <span v-if="reservationFilter !== 'all'">（共 {{ allReservations.length }} 条数据）</span>
                      </span>
                    </div>
                    
                    <el-empty v-if="filteredReservations.length === 0" description="暂无预约电影"></el-empty>
                    
                    <div v-else class="reservation-list">
                      <el-table :data="paginatedReservations" style="width: 100%" stripe>
                        <el-table-column prop="title" label="电影名称" min-width="200">
                          <template #default="scope">
                            <span class="movie-title">{{ scope.row.title }}</span>
                          </template>
                        </el-table-column>
                        
                        <el-table-column prop="status" label="状态" width="120" align="center">
                          <template #default="scope">
                            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                              {{ getStatusText(scope.row.status) }}
                            </el-tag>
                          </template>
                        </el-table-column>
                        
                        <el-table-column prop="createdAt" label="预约时间" width="180" align="center">
                          <template #default="scope">
                            <span class="reservation-time">{{ formatDate(scope.row.createdAt) }}</span>
                          </template>
                        </el-table-column>
                        
                        <el-table-column label="操作" width="120" align="center">
                          <template #default="scope">
                            <el-button 
                              v-if="scope.row.status === 'PENDING'"
                              type="danger" 
                              size="small" 
                              @click="cancelReservation(scope.row.id)"
                              :loading="scope.row.cancelling"
                            >
                              取消预约
                            </el-button>
                            <el-tag v-else-if="scope.row.status === 'NOTIFIED'" type="success" size="small">已通知</el-tag>
                            <el-tag v-else-if="scope.row.status === 'CANCELLED'" type="info" size="small">已取消</el-tag>
                          </template>
                        </el-table-column>
                      </el-table>
                      
                      <div class="pagination-container" v-if="filteredReservations.length > 0">
                        <el-pagination
                          background
                          layout="prev, pager, next, total"
                          :total="filteredReservations.length"
                          :page-size="pageSize"
                          :current-page="reservationPage"
                          @current-change="(page) => handlePageChange(page, 'reservation')"
                        ></el-pagination>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="收藏电影" name="collection">
                  <div class="sub-tab-content">
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
                          <p class="collection-date">收藏时间: {{ formatDate(item.collectionDate) }}</p>
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
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { ENV_CONFIG } from '../../config/env';
import { useUserStore } from '../../stores/userStore';

const props = defineProps({
  subMenu: {
    type: String,
    default: 'week'
  }
});

const router = useRouter();
const userStore = useUserStore();

// 主标签页 - 默认显示观影设置
const activeTab = ref('settings');
const bookmarkActiveTab = ref('reservation');

// 观影设置表单
const settingsForm = ref({
  defaultQuality: 'auto',
  playbackSpeed: '1.0',
  autoPlay: true,
  rememberPosition: true,
  showDanmaku: false,
  volume: 80
});

// 观看历史相关
const selectedTimeRange = ref(props.subMenu);
const historyList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// 预约/收藏相关
const reservationPage = ref(1);
const collectionPage = ref(1);
const reservationTotal = ref(0);
const collectionTotal = ref(0);
const reservations = ref([]);
const collections = ref([]);

// 预约筛选相关
const reservationFilter = ref('all');
const allReservations = ref([]);
const filteredReservations = computed(() => {
  if (reservationFilter.value === 'all') {
    return allReservations.value;
  }
  return allReservations.value.filter(item => item.status === reservationFilter.value);
});

// 预约分页相关
const paginatedReservations = computed(() => {
  const startIndex = (reservationPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredReservations.value.slice(startIndex, endIndex);
});

// 监听 props 变化
watch(() => props.subMenu, (newVal) => {
  selectedTimeRange.value = newVal;
  if (activeTab.value === 'history') {
    fetchWatchHistory();
  }
}, { immediate: true });

// 按日期分组的历史记录
const groupedHistory = computed(() => {
  const grouped = {};
  
  historyList.value.forEach(item => {
    const date = new Date(item.watchTime).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });
  
  // 按日期降序排序
  return Object.keys(grouped)
    .sort((a, b) => new Date(b) - new Date(a))
    .reduce((result, key) => {
      result[key] = grouped[key];
      return result;
    }, {});
});

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateString === today.toISOString().split('T')[0]) {
    return '今天';
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return '昨天';
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
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

// 获取观看历史
const fetchWatchHistory = async () => {
  try {
    const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/user/watch-history`, {
      params: {
        timeRange: selectedTimeRange.value,
        page: currentPage.value,
        pageSize: pageSize.value
      },
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      historyList.value = response.data.data.items;
      totalItems.value = response.data.data.total;
    } else {
      ElMessage.error(response.data.message || '获取观看历史失败');
    }
  } catch (error) {
    console.error('获取观看历史失败:', error);
    ElMessage.error('获取观看历史失败');
  }
};

// 获取预约列表
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
      allReservations.value = response.data.data || [];
      reservations.value = response.data.data || []; // 保持兼容性
      reservationTotal.value = allReservations.value.length;
      console.log('✅ 预约列表获取成功:', allReservations.value);
      console.log('📊 分页计算: 总数', allReservations.value.length, '每页', pageSize.value, '页数', Math.ceil(allReservations.value.length / pageSize.value));
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
    // 临时显示空数据
    collections.value = [];
    collectionTotal.value = 0;
    console.log('收藏列表功能暂未实现');
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    ElMessage.error('获取收藏列表失败');
  }
};

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  currentPage.value = 1; // 重置页码
  fetchWatchHistory();
};

// 处理预约筛选变化
const handleReservationFilterChange = () => {
  console.log('🔍 筛选条件变化:', reservationFilter.value);
  // 筛选变化时重置到第一页
  reservationPage.value = 1;
};

// 处理页码变化
const handlePageChange = (page, type) => {
  if (type === 'reservation') {
    reservationPage.value = page;
    // 不需要重新获取数据，只需要重新计算分页显示
    console.log('📄 预约列表页码变化到:', page);
  } else if (type === 'collection') {
    collectionPage.value = page;
    fetchCollections();
  } else {
    currentPage.value = page;
    fetchWatchHistory();
  }
};

// 跳转到电影详情
const goToMovieDetail = (movieId) => {
  router.push({ name: 'MovieDetail', params: { id: movieId } });
};

// 继续观看
const continueWatch = (item) => {
  router.push({ 
    name: 'MoviePlay', 
    params: { id: item.movieId },
    query: { time: item.watchPosition }
  });
};

// 删除观看记录
const removeHistory = (historyId) => {
  ElMessageBox.confirm('确定要删除这条观看记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`${ENV_CONFIG.API_BASE_URL}/user/watch-history/${historyId}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      
      if (response.data.code === 200) {
        ElMessage.success('删除成功');
        fetchWatchHistory(); // 重新获取列表
      } else {
        ElMessage.error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除观看记录失败:', error);
      ElMessage.error('删除观看记录失败');
    }
  }).catch(() => {});
};

// 取消预约
const cancelReservation = (reservationId) => {
  ElMessageBox.confirm('确定要取消这个预约吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 设置加载状态
    const reservation = reservations.value.find(item => item.id === reservationId);
    if (reservation) {
      reservation.cancelling = true;
    }
    
    try {
      const response = await axios.delete(`${ENV_CONFIG.API_BASE_URL}/movice/reservation/${reservationId}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      
      if (response.data.code === 200) {
        ElMessage.success('取消预约成功');
        fetchReservations(); // 重新获取列表
      } else {
        ElMessage.error(response.data.msg || '取消预约失败');
      }
    } catch (error) {
      console.error('取消预约失败:', error);
      ElMessage.error('取消预约失败');
    } finally {
      // 清除加载状态
      if (reservation) {
        reservation.cancelling = false;
      }
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

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    'NOTIFIED': 'success',
    'PENDING': 'warning',
    'CANCELLED': 'danger'
  };
  return typeMap[status] || 'info';
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

// 保存设置
const saveSettings = async () => {
  try {
    const response = await axios.post(`${ENV_CONFIG.API_BASE_URL}/user/settings`, settingsForm.value, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      ElMessage.success('设置保存成功');
    } else {
      ElMessage.error(response.data.message || '保存设置失败');
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    ElMessage.error('保存设置失败');
  }
};

// 重置设置
const resetSettings = () => {
  ElMessageBox.confirm('确定要重置所有设置吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    settingsForm.value = {
      defaultQuality: 'auto',
      playbackSpeed: '1.0',
      autoPlay: true,
      rememberPosition: true,
      showDanmaku: false,
      volume: 80
    };
    ElMessage.success('设置已重置');
  }).catch(() => {});
};

// 获取用户设置
const fetchUserSettings = async () => {
  try {
    const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/user/settings`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      settingsForm.value = { ...settingsForm.value, ...response.data.data };
    }
  } catch (error) {
    console.error('获取用户设置失败:', error);
  }
};

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'settings') {
    // 设置标签页，不需要额外操作
  } else if (newTab === 'history') {
    fetchWatchHistory();
  } else if (newTab === 'bookmark') {
    fetchReservations();
    fetchCollections();
  }
});

onMounted(() => {
  fetchUserSettings();
  // 默认显示设置标签页，不需要立即获取观看历史
});
</script>

<style scoped>
.viewing-settings {
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

.viewing-tabs {
  margin-top: 20px;
}

.tab-content {
  margin-top: 20px;
}

/* 筛选器样式 */
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

/* 观看历史样式 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.time-filter {
  margin-left: auto;
}

.history-content {
  margin-top: 20px;
}

.history-group {
  margin-bottom: 30px;
}

.date-header {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.history-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.movie-poster {
  width: 120px;
  height: 180px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 20px;
  flex-shrink: 0;
}

.movie-poster .el-image {
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

.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.movie-title {
  font-size: 18px;
  color: #303133;
  margin: 0 0 10px 0;
}

.watch-time, .progress {
  font-size: 14px;
  color: #606266;
  margin: 5px 0;
}

.progress-bar {
  height: 6px;
  background-color: #e4e7ed;
  border-radius: 3px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(to right, #409eff, #a0cfff);
  border-radius: 3px;
}

.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  margin-left: 20px;
}

/* 主卡片样式 */
.main-card {
  margin-top: 20px;
}

/* 预约/收藏样式 */
.bookmark-sub-tabs {
  margin-top: 20px;
}

.sub-tab-content {
  margin-top: 20px;
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

/* 预约列表样式 */
.reservation-list {
  margin-top: 20px;
}

.movie-title {
  font-weight: 500;
  color: #303133;
}

.reservation-time {
  color: #606266;
  font-size: 14px;
}

/* 表格样式优化 */
.reservation-list .el-table {
  border-radius: 8px;
  overflow: hidden;
}

.reservation-list .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.reservation-list .el-table td {
  padding: 12px 0;
}

.reservation-list .el-table .el-button {
  margin: 0;
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
  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-filter {
    margin-top: 15px;
    margin-left: 0;
  }
  
  .history-item {
    flex-direction: column;
  }
  
  .movie-poster {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .actions {
    margin-left: 0;
    margin-top: 15px;
    flex-direction: row;
  }
  
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
}
</style>
