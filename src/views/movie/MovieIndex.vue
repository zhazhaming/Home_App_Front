<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content" @scroll="handleScroll">
      <HeaderBar />
      <section class="content">
        <div class="reservation-cta">
          <div class="cta-text">
            <h3>预约上映提醒</h3>
            <p>关注你想看的电影，上线第一时间推送给你。</p>
          </div>
          <div class="cta-actions">
            <el-button type="primary" @click="openReservation">立即预约</el-button>
          </div>
        </div>
        <div class="section-header">
          <h2>电影排行榜</h2>
          <button @click="viewMore('movies')">更多</button>
        </div>
        <div class="movie-list">
          <div class="movie-card" v-for="(movie, index) in movies" :key="movie.id">
            <img :src="movie.img_url" alt="Movie Poster" @click="goToMovieDetail(movie.id)" class="clickable">
            <p @click="goToMovieDetail(movie.id)" class="clickable">{{ movie.name }}</p>
          </div>
        </div>
        <div class="section-header">
          <h2>新片上映</h2>
          <button @click="viewMore('newMovies')">更多</button>
        </div>
        <div class="movie-list">
          <div class="movie-card" v-for="(newMovie, index) in newMovies" :key="newMovie.id">
            <img :src="newMovie.img_url" alt="New Movie Poster" @click="goToMovieDetail(newMovie.id)" class="clickable">
            <p @click="goToMovieDetail(newMovie.id)" class="clickable">{{ newMovie.name }}</p>
          </div>
        </div>
        <div class="section-header">
          <h2>重磅热播</h2>
          <button @click="viewMore('hotMovies')">更多</button>
        </div>
        <div class="movie-list">
          <div class="movie-card" v-for="(hotMovie, index) in hotMovies" :key="hotMovie.id">
            <img :src="hotMovie.img_url" alt="Hot Movie Poster" @click="goToMovieDetail(hotMovie.id)" class="clickable">
            <p @click="goToMovieDetail(hotMovie.id)" class="clickable">{{ hotMovie.name }}</p>
          </div>
        </div>
      </section>
    </main>
    <el-dialog v-model="showReservation" title="预约上映提醒" width="480px">
      <el-form :model="reservationForm" :rules="reservationRules" label-width="100px">
        <el-form-item label="电影名称" prop="movieName">
          <el-input v-model="reservationForm.movieName" placeholder="请输入电影名称"></el-input>
        </el-form-item>
        <el-form-item label="通知邮箱" prop="contactEmail">
          <el-input v-model="reservationForm.contactEmail" placeholder="example@mail.com"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReservation = false">取 消</el-button>
        <el-button type="primary" @click="submitReservation">提 交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import Sidebar from '../../components/movie/Sidebar.vue';
import HeaderBar from '../../components/movie/HeaderBar.vue';
import { useUserStore } from '../../stores/userStore';
import { ENV_CONFIG } from '../../config/env';

export default {
  components: {
    Sidebar,
    HeaderBar
  },
  setup() {
const router = useRouter();
    const request_url = ref(`${ENV_CONFIG.API_BASE_URL}/movice/`);
    const userStore = useUserStore();
const movies = ref([]);
    const newMovies = ref([]);
    const hotMovies = ref([]);

    const fetchMovies = async () => {
  try {
        const response = await axios.get(request_url.value + 'getPopular?pageNum=1&pageSize=12');
        movies.value = response.data.data;
        console.log(movies.value);
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
    };

    const fetchNewMovies = async () => {
      try {
        const response = await axios.get(request_url.value + 'getHotMovie?pageNum=1&pageSize=12');
        newMovies.value = response.data.data;
      } catch (error) {
        console.error('Error fetching new movies:', error);
      }
    };

    const fetchHotMovies = async () => {
      try {
        const response = await axios.get(request_url.value + 'getMoviesRecent?pageNum=1&pageSize=12');
        hotMovies.value = response.data.data;
      } catch (error) {
        console.error('Error fetching hot movies:', error);
      }
    };

    const viewMore = (category) => {
      console.log(`View more ${category}`);
      // 在这里实现跳转逻辑
    };

    const handleScroll = (event) => {
      const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
      if (bottom) {
        console.log('Load more content');
      }
    };

    const search = () => {
      console.log('Search clicked');
      // 在这里实现搜索逻辑
    };

    // 预约表单
    const showReservation = ref(false);
    const reservationForm = ref({
      movieName: '',
      contactEmail: ''
    });
    const reservationRules = {
      movieName: [{ required: true, message: '请输入电影名称', trigger: 'blur' }],
      contactEmail: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
      ]
    };

    const openReservation = () => {
      // 打开对话框时再次尝试自动填充邮箱
      if (userStore.isLoggedIn && userStore.email) {
        reservationForm.value.contactEmail = userStore.email;
      } else if (!reservationForm.value.contactEmail) {
        try {
          const stored = JSON.parse(localStorage.getItem('user_info') || '{}');
          if (stored && stored.email) {
            reservationForm.value.contactEmail = stored.email;
          }
        } catch {}
      }
      showReservation.value = true;
    };

    const submitReservation = async () => {
      try {
        if (!reservationForm.value.movieName || !reservationForm.value.contactEmail) {
          return;
        }
        // 提交到后端
        const response = await axios.post(`${ENV_CONFIG.API_BASE_URL}/movice/reservation`, {
          title: reservationForm.value.movieName,
          notifyEmail: reservationForm.value.contactEmail,
          userId: userStore?.user_id || '',
          username: userStore?.username || ''
        });
        
        // 显示成功消息
        if (response.data && response.data.code === 200) {
          ElMessage.success(response.data.data);
        } else {
          ElMessage.error('服务器错误，预约失败');
        }
        
        showReservation.value = false;
        reservationForm.value = { movieName: '', contactEmail: '' };
      } catch (e) {
        console.error('预约失败', e);
        ElMessage.error('预约失败，请稍后重试');
      }
    };

const goToMovieDetail = (id) => {
      router.push({ name: 'MovieDetail', params: { id } });
    };

    onMounted(() => {
      fetchMovies();
      fetchNewMovies();
      fetchHotMovies();

      // 预填充邮箱（优先从 userStore 获取）
      if (userStore.isLoggedIn && userStore.email) {
        reservationForm.value.contactEmail = userStore.email;
      } else {
        try {
          const stored = JSON.parse(localStorage.getItem('user_info') || '{}');
          if (stored && stored.email) {
            reservationForm.value.contactEmail = stored.email;
          }
        } catch {}
      }
    });

    return {
      movies,
      newMovies,
      hotMovies,
      viewMore,
      handleScroll,
      search,
      goToMovieDetail,
      showReservation,
      reservationForm,
      reservationRules,
      openReservation,
      submitReservation
    };
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: hidden;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  padding: 20px;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar .logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar ul li {
  margin: 10px 0;
}

.main-content {
  flex: 1;
  padding: 20px;
  min-width: 0;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
}

.content {
  margin-top: 20px;
}

.reservation-cta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #ecf5ff 0%, #f7fbff 100%);
  border: 1px solid #d9ecff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.reservation-cta .cta-text h3 {
  margin: 0 0 6px 0;
}

.reservation-cta .cta-text p {
  margin: 0;
  color: #606266;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
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

button {
  padding: 5px 10px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    order: 1;
  }
  .main-content {
    order: 2;
  }
}

.clickable {
  color: black;
  text-decoration: none;
}

.clickable:hover {
  text-decoration: underline;
}

/* 预约弹窗覆盖默认宽度 */
:deep(.el-dialog__header) {
  margin-right: 0;
}
</style>