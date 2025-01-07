<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content" @scroll="handleScroll">
      <HeaderBar />
      <section class="content">
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Sidebar from './Sidebar.vue';
import HeaderBar from './HeaderBar.vue';

export default {
  components: {
    Sidebar,
    HeaderBar
  },
  setup() {
    const router = useRouter();
    const request_url = ref('http://localhost:8100/movice/');
    const movies = ref([]);
    const newMovies = ref([]);
    const hotMovies = ref([]);

    const fetchMovies = async () => {
      try {
        const response = await axios.get(request_url.value + 'getWellReceive?pageNum=1&pageSize=12');
        movies.value = response.data.data;
        console.log(movies.value);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    const fetchNewMovies = async () => {
      try {
        const response = await axios.get(request_url.value + 'getMoviesRecent?pageNum=1&pageSize=12');
        newMovies.value = response.data.data;
      } catch (error) {
        console.error('Error fetching new movies:', error);
      }
    };

    const fetchHotMovies = async () => {
      try {
        const response = await axios.get(`${request_url.value}hot-movies`);
        hotMovies.value = response.data;
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

    const goToMovieDetail = (id) => {
      router.push({ name: 'MovieDetail', params: { id } });
    };

    onMounted(() => {
      fetchMovies();
      fetchNewMovies();
      fetchHotMovies();
    });

    return {
      movies,
      newMovies,
      hotMovies,
      viewMore,
      handleScroll,
      search,
      goToMovieDetail
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.movie-list {
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
</style>