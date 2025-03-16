<template>
  <div class="bookmark-collection">
    <h2 class="section-title">预约/收藏</h2>
    
    <el-tabs v-model="activeTab" class="bookmark-tabs">
      <el-tab-pane label="电影预约" name="reservation">
        <div class="tab-content">
          <el-empty v-if="reservations.length === 0" description="暂无预约电影"></el-empty>
          
          <div v-else class="movie-grid">
            <div v-for="item in reservations" :key="item.id" class="movie-card">
              <div class="card-poster">
                <el-image :src="item.poster" fit="cover">
                  <template #error>
                    <div class="image-placeholder">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </template>
                </el-image>
                <div class="release-badge" v-if="item.releaseDate">
                  {{ formatReleaseDate(item.releaseDate) }}
                </div>
              </div>
              
              <div class="card-info">
                <h3 class="movie-title" @click="goToMovieDetail(item.movieId)">{{ item.title }}</h3>
                <p class="reservation-date">预约时间: {{ formatDate(item.reservationDate) }}</p>
                <p class="movie-type">类型: {{ item.type || '未知' }}</p>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click="goToMovieDetail(item.movieId)">查看详情</el-button>
                  <el-button type="danger" size="small" @click="cancelReservation(item.id)">取消预约</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pagination-container" v-if="reservations.length > 0">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="reservationTotal"
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
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

// 获取预约列表
const fetchReservations = async () => {
  try {
    const response = await axios.get('http://localhost:8100/user/reservations', {
      params: {
        page: reservationPage.value,
        pageSize: pageSize.value
      },
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      reservations.value = response.data.data.items;
      reservationTotal.value = response.data.data.total;
    } else {
      ElMessage.error(response.data.message || '获取预约列表失败');
    }
  } catch (error) {
    console.error('获取预约列表失败:', error);
    ElMessage.error('获取预约列表失败');
  }
};

// 获取收藏列表
const fetchCollections = async () => {
  try {
    const response = await axios.get('http://localhost:8100/user/collections', {
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

// 处理页码变化
const handlePageChange = (page, type) => {
  if (type === 'reservation') {
    reservationPage.value = page;
    fetchReservations();
  } else if (type === 'collection') {
    collectionPage.value = page;
    fetchCollections();
  }
};

// 格式化日期
const formatDate = (dateString) => {
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
      const response = await axios.delete(`http://localhost:8100/user/reservations/${reservationId}`, {
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
      const response = await axios.delete(`http://localhost:8100/user/collections/${collectionId}`, {
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

onMounted(() => {
  fetchReservations();
  fetchCollections();
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
}
</style> 