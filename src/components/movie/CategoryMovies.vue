<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <HeaderBar />
      <section class="content">
        <div class="category-header">
          <h2>{{ categoryName }} 电影</h2>
          <el-button @click="goBack" type="default">返回首页</el-button>
        </div>
        <div class="movie-grid" v-loading="loading">
          <div class="movie-card" v-for="movie in movies" :key="movie.id">
            <img :src="movie.img_url" alt="Movie Poster" @click="goToMovieDetail(movie.id)" class="clickable">
            <p @click="goToMovieDetail(movie.id)" class="clickable">{{ movie.name }}</p>
          </div>
        </div>
        <div class="pagination-container" v-if="movies.length > 0">
          <el-config-provider :locale="zhCn">
            <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="total, prev, pager, next"
              @current-change="handleCurrentChange"
            />
          </el-config-provider>
          <div class="custom-jumper">
            <span>前往</span>
            <el-input-number 
              v-model="jumpPage" 
              :min="1" 
              :controls="false"
              size="small"
              @keyup.enter="handleJump"
            />
            <span>页</span>
            <el-button type="primary" size="small" @click="handleJump">跳转</el-button>
          </div>
        </div>
        <div v-if="movies.length === 0 && !loading" class="no-movies">
          <p>暂无电影数据</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import Sidebar from './Sidebar.vue';
import HeaderBar from './HeaderBar.vue';
import { ENV_CONFIG } from '../../config/env';

const route = useRoute();
const router = useRouter();
const movies = ref([]);
const categoryName = ref('');
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(24);
const total = ref(0);
const hasExactTotal = ref(false); // 后端是否返回了精确 total
const jumpPage = ref(1);

const fetchMoviesByCategory = async (category, pageNum = 1, pageSizeParam = 24) => {
  loading.value = true;
  try {
    let apiUrl = '';
    switch (category) {
      case 'newMovies':
        apiUrl = `${ENV_CONFIG.API_BASE_URL}/movice/getMoviesRecent?pageNum=${pageNum}&pageSize=${pageSizeParam}`;
        break;
      case 'movies':
        apiUrl = `${ENV_CONFIG.API_BASE_URL}/movice/getPopular?pageNum=${pageNum}&pageSize=${pageSizeParam}`;
        break;
      case 'hotMovies':
        apiUrl = `${ENV_CONFIG.API_BASE_URL}/movice/getHotMovie?pageNum=${pageNum}&pageSize=${pageSizeParam}`;
        break;
      default:
        apiUrl = `${ENV_CONFIG.API_BASE_URL}/movice/getByCategory?category=${category}&pageNum=${pageNum}&pageSize=${pageSizeParam}`;
    }
    
    const response = await axios.get(apiUrl);
    movies.value = response.data.data || [];
    
    // 设置总数：优先使用后端 total（含 0 也视为有效），否则不做估算，仅用于分页跳转时放开限制
    if (Object.prototype.hasOwnProperty.call(response.data, 'total')) {
      total.value = Number(response.data.total) || 0;
      hasExactTotal.value = true;
    } else {
      hasExactTotal.value = false;
      // 不可靠时，仅在需要时给一个保守的下限，避免分页器失效。
      total.value = Math.max(total.value, (pageNum - 1) * pageSizeParam + movies.value.length);
    }
  } catch (error) {
    console.error('Error fetching movies by category:', error);
    movies.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 统一的跳页函数，供分页与自定义跳转共用
const goToPage = (targetPage) => {
  // 页码校验：如果 total 精确，限制在 1..pageCount；否则仅要求 >=1
  const pageCount = hasExactTotal.value ? Math.max(1, Math.ceil(total.value / pageSize.value)) : Infinity;
  const validTarget = Math.max(1, Math.min(targetPage, pageCount));
  
  if (currentPage.value === validTarget) return;
  
  currentPage.value = validTarget;
  jumpPage.value = validTarget; // 同步输入框
  const category = route.params.category;
  fetchMoviesByCategory(category, currentPage.value, pageSize.value);

  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// 分页组件回调
const handleCurrentChange = (newPage) => {
  goToPage(newPage);
};

// 跳转按钮处理函数
const handleJump = () => {
  if (!jumpPage.value) return;
  goToPage(Number(jumpPage.value));
};

const goBack = () => {
  router.push({ name: 'MovieIndex' });
};

const goToMovieDetail = (id) => {
  router.push({ name: 'MovieDetail', params: { id } });
};

onMounted(() => {
  const category = route.params.category; // 从路由参数获取类别
  // 根据类别设置名称
  switch (category) {
    case 'newMovies':
      categoryName.value = '新片上映';
      break;
    case 'movies':
      categoryName.value = '电影排行榜';
      break;
    case 'hotMovies':
      categoryName.value = '重磅热播';
      break;
    default:
      categoryName.value = '电影分类';
  }
  // 初始化跳转页码为当前页
  jumpPage.value = currentPage.value;
  fetchMoviesByCategory(category, currentPage.value, pageSize.value);
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: hidden;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  min-width: 0;
  overflow-y: auto;
}

.content {
  margin-top: 20px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.category-header h2 {
  margin: 0;
  color: #333;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.movie-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.movie-card:hover {
  transform: scale(1.05);
}

.movie-card img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.movie-card p {
  margin-top: 8px;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.clickable {
  color: black;
  text-decoration: none;
}

.clickable:hover {
  text-decoration: underline;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 20px;
}

.custom-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-jumper span {
  font-size: 14px;
  color: #606266;
}

.custom-jumper :deep(.el-input-number) {
  width: 80px;
}

.custom-jumper :deep(.el-input-number .el-input__inner) {
  text-align: center;
}

.no-movies {
  text-align: center;
  padding: 50px;
  color: #999;
  font-size: 16px;
  text-decoration: none;
}

.clickable:hover {
  text-decoration: underline;
}
</style> 