<template>
  <div class="watch-history">
    <div class="history-header">
      <h2 class="section-title">观看历史</h2>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { useUserStore } from '../../stores/userStore';

const props = defineProps({
  timeRange: {
    type: String,
    default: 'week'
  }
});

const router = useRouter();
const userStore = useUserStore();
const selectedTimeRange = ref(props.timeRange);
const historyList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// 监听 props 变化
watch(() => props.timeRange, (newVal) => {
  selectedTimeRange.value = newVal;
  fetchWatchHistory();
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

// 获取观看历史
const fetchWatchHistory = async () => {
  try {
    const response = await axios.get('http://localhost:8100/user/watch-history', {
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

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  currentPage.value = 1; // 重置页码
  fetchWatchHistory();
};

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchWatchHistory();
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
      const response = await axios.delete(`http://localhost:8100/user/watch-history/${historyId}`, {
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

onMounted(() => {
  fetchWatchHistory();
});
</script>

<style scoped>
.watch-history {
  animation: fadeIn 0.5s ease;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  color: #333;
  position: relative;
  padding-bottom: 10px;
  margin: 0;
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
  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-filter {
    margin-top: 15px;
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
}
</style> 