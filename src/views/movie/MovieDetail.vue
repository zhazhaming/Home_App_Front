<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <HeaderBar />
      <section class="content">
        <div class="movie-detail">
          <div class="movie-header">
            <img :src="movie.img_url" alt="Movie Poster" class="movie-poster">
            <div class="movie-info">
              <h1>{{ movie.name }}</h1>
              <div class="tags">
                <span v-for="tag in movie.tags" :key="tag">{{ tag }}</span>
              </div>
              <p>{{ movie.director ? `导演: ${movie.director}` : '' }}</p>
              <p>{{ movie.actors && movie.actors !== 'NULL' ? `主演: ${movie.actors}` : '' }}</p>
              <p>{{ movie.category ? `类别: ${movie.category}` : '' }}</p>
              <p>{{ movie.date ? `更新: ${new Date(movie.date).toLocaleString()}` : '' }}</p>
              <p>{{ movie.duration ? `片长: ${movie.duration}分钟` : '' }}</p>
              <p>{{ movie.language ? `语言: ${movie.language}` : '' }}</p>
              <p>{{ movie.origin ? `产地: ${movie.origin}` : '' }}</p>
              <p>{{ movie.douban_rating ? `评分: ${movie.douban_rating}` : '' }}</p>
              <p>{{ movie.description ? `简介: ${movie.description}` : '' }}</p>
              <el-button type="danger" @click="download(movie.magnet_url)">立即下载</el-button>
            </div>
          </div>
        </div>

        <div class="recommendations">
          <h2>相关推荐</h2>
          <div class="movie-grid">
            <div class="movie-card" v-for="related in relatedMovies" :key="related.id" @click="goToMovieDetail(related.id)">
              <img :src="related.img_url" alt="Related Movie Poster" class="clickable">
              <p class="clickable">{{ related.name }}</p>
            </div>
          </div>
        </div>

        <div class="now-showing">
          <h2>正在热映</h2>
          <div class="movie-grid">
            <div class="movie-card" v-for="showing in nowShowingMovies" :key="showing.id" @click="goToMovieDetail(showing.id)">
              <img :src="showing.img_url" alt="Now Showing Movie Poster" class="clickable">
              <p class="clickable">{{ showing.name }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ENV_CONFIG } from '../../config/env';
import Sidebar from '../../components/movie/Sidebar.vue';
import HeaderBar from '../../components/movie/HeaderBar.vue';

const request_url = ref(`${ENV_CONFIG.API_BASE_URL}/movice/`);
const route = useRoute();
const router = useRouter();
const movie = ref({});
const relatedMovies = ref([]);
const nowShowingMovies = ref([]);

const fetchMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/movice/detail/getById?id=${movieId}`);
    movie.value = response.data.data;
    console.log(movie.value);

    // 获取相关推荐
    const relatedResponse = await axios.get(request_url.value + 'getWellReceive?pageNum=1&pageSize=12');
    relatedMovies.value = relatedResponse.data.data;

    // 获取正在热映
    const nowShowingResponse = await axios.get(request_url.value + 'getMoviesRecent?pageNum=1&pageSize=12');
    nowShowingMovies.value = nowShowingResponse.data.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
};

onMounted(() => {
  fetchMovieDetails(route.params.id);
});

watch(() => route.params.id, (newId) => {
  fetchMovieDetails(newId);
});

const download = (magnetUrl) => {
  window.open(magnetUrl, '_blank');
};

const goToMovieDetail = (id) => {
  router.push({ name: 'MovieDetail', params: { id } });
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: hidden;
  height: 100vh;
  width: 100vw;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-content {
  flex: 1;
  padding: 10px;
  min-width: 0;
  overflow-y: auto;
  width: calc(100vw - 200px);
  max-width: none;
  box-sizing: border-box;
}

.content {
  margin-top: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.movie-detail {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.movie-header {
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.movie-poster {
  width: 450px;
  height: auto;
  margin-right: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.movie-info {
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.movie-info h1 {
  margin-bottom: 20px;
  font-size: 2rem;
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.movie-info p {
  margin: 10px 0;
  font-size: 1rem;
  color: #555;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
  max-width: 100%;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.tags span {
  background-color: #e0e0e0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.9rem;
  white-space: nowrap;
  word-wrap: break-word;
}

.recommendations, .now-showing {
  margin-top: 40px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
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

.clickable {
  color: black;
  text-decoration: none;
}

.clickable:hover {
  text-decoration: underline;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .movie-poster {
    width: 400px;
    margin-right: 30px;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 15px;
  }
  
  .movie-detail {
    padding: 20px;
  }
  
  .movie-poster {
    width: 350px;
    margin-right: 25px;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .movie-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .movie-poster {
    width: 300px;
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .movie-info {
    width: 100%;
    max-width: 100%;
  }
  
  .movie-info h1 {
    font-size: 1.8rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }
  
  .movie-detail {
    padding: 15px;
  }
  
  .movie-poster {
    width: 250px;
  }
  
  .movie-info h1 {
    font-size: 1.5rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.2;
  }
  
  .movie-info p {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
}
</style> 