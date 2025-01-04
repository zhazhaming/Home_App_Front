<template>
    <div class="movie-list">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <img :src="movie.poster" :alt="movie.title" />
        <h3>{{ movie.title }}</h3>
        <p>{{ movie.description }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        movies: [
          { id: 1, title: '飞驰人生2', description: '描述1', poster: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2903066285.jpg' },
          { id: 2, title: '城市猎人', description: '描述2', poster: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2906647021.jpg' },
          { id: 3, title: '血爱成河/爱的谎言在流血', description: '描述3', poster: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2902183869.jpg' },
          { id: 4, title: '第二十条', description: '描述4', poster: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2903145026.jpg' },
          { id: 5, title: '蟹群大比拼', description: '描述5', poster: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2904915169.jpg' },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .movie-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
  }
  
  .movie-card {
    width: 200px;
    background-color: #f9f9f9;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .movie-card img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
  
  .movie-card h3 {
    font-size: 1rem;
    padding: 0.5rem;
  }
  
  .movie-card p {
    font-size: 0.8rem;
    padding: 0.5rem;
    color: #666;
  }
  </style>