<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <HeaderBar />
      <section class="content">
        <h2>{{ categoryName }} 电影</h2>
        <div class="movie-grid">
          <div class="movie-card" v-for="movie in movies" :key="movie.id">
            <img :src="movie.img_url" alt="Movie Poster" @click="goToMovieDetail(movie.id)" class="clickable">
            <p @click="goToMovieDetail(movie.id)" class="clickable">{{ movie.name }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Sidebar from '@/components/Sidebar.vue';
import HeaderBar from '@/components/HeaderBar.vue';

const route = useRoute();
const router = useRouter();
const movies = ref([]);
const categoryName = ref('');

const fetchMoviesByCategory = async (category) => {
  try {
    const response = await axios.get(`http://localhost:8100/movice/getByCategory?category=${category}`);
    movies.value = response.data.data;
  } catch (error) {
    console.error('Error fetching movies by category:', error);
  }
};

onMounted(() => {
  const category = route.params.category; // 从路由参数获取类别
  categoryName.value = category === 'newMovies' ? '新片上映' : '重磅热播'; // 根据类别设置名称
  fetchMoviesByCategory(category);
});

const goToMovieDetail = (id) => {
  router.push({ name: 'MovieIndex', params: { id } });
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

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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

.clickable {
  color: #007bff;
  text-decoration: none;
}

.clickable:hover {
  text-decoration: underline;
}
</style> 