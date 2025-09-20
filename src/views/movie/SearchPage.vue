<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <HeaderBar />
      <section class="content">
        <div v-if="movies.length === 0" class="no-movies">
          <p>没有找到相关电影。</p>
          <el-button type="primary" @click="goBack">返回电影页</el-button>
        </div>
        <div v-else class="movie-grid">
          <div class="movie-card" v-for="movie in movies" :key="movie.id" @click="goToMovieDetail(movie.id)">
            <img :src="movie.img_url" alt="Movie Poster">
            <div class="movie-info">
              <h3>{{ movie.name }}</h3>
              <p>发布日期: {{ new Date(movie.date).toLocaleDateString() }}</p>
              <p><a :href="movie.url" target="_blank">详情链接</a></p>
              <el-button type="danger" @click="download(movie.magnet_url)">下载</el-button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieStore } from '../../stores/movieStore';
import Sidebar from '../../components/movie/Sidebar.vue';
import HeaderBar from '../../components/movie/HeaderBar.vue';

const router = useRouter();
const movieStore = useMovieStore();
const movies = computed(() => movieStore.movies || []);
console.log("get_movies:"+movies.value);
const goToMovieDetail = (id) => {
  router.push({ name: 'MovieDetail', params: { id } });
};

const download = (magnetUrl) => {
  window.open(magnetUrl, '_blank');
};

const goBack = () => {
  router.push({ name: 'MovieIndex' });
};
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

.no-movies {
  text-align: center;
  margin-top: 50px;
}

.no-movies p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.movie-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.movie-card img {
  width: 100%;
  height: auto;
}

.movie-info {
  padding: 10px;
}

.movie-info h3 {
  margin: 10px 0;
}
</style> 