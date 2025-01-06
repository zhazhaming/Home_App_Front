<template>
  <header class="header">
    <div class="search-bar">
      <el-input v-model="query" placeholder="搜索电影、电视剧、综艺、动漫"></el-input>
      <el-button type="primary" @click="search">搜索</el-button>
    </div>
    <div class="user-info">
      <el-avatar src="https://example.com/avatar.jpg"></el-avatar>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useMovieStore } from '../../stores/movieStore';

const query = ref('');
const router = useRouter();
const search_url = ref('http://localhost:8100/movice/');
const movieStore = useMovieStore();

const search = async () => {
  if (query.value.trim()) {
    try {
      console.log(search_url.value + 'getByName?name=' + query.value);
      const response = await axios.get(`http://localhost:8100/movice/getByName?name=${query.value}`);
      if (response.data.code === 200) {
        console.log('Movies data:', response.data.data);
        movieStore.setMovies(response.data.data);
        router.push({ name: 'SearchPage', query: { q: query.value } });
      } else {
        console.error('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  margin-left: 20px;
}

.el-input {
  flex: 1;
}

.el-button {
  min-width: 80px;
}
</style>