<template>
    <!-- <Header/>
    <Carousel/>
    <MovieList/>
    <Footer/> -->
    <MovieIndex/>
</template>
  
  <script setup>
    import MovieIndex from '../components/movie/MovieIndex.vue';
  </script>
  
  <style scoped>
  .app-container {
    display: flex;
  }
  
  .sidebar {
    width: 200px;
    background-color: #333;
    color: white;
    padding: 20px;
  }
  
  .sidebar ul {
    list-style-type: none;
    padding: 0;
  }
  
  .sidebar ul li {
    padding: 10px;
    cursor: pointer;
  }
  
  .sidebar ul li.active {
    background-color: #444;
  }
  
  .main-content {
    flex-grow: 1;
    padding: 20px;
  }
  
  .carousel {
    width: 100%;
    height: 300px;
    background-color: #eee;
    position: relative;
  }
  
  .carousel-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  
  .carousel img {
    max-width: 100%;
    height: auto;
  }
  
  .carousel-caption {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
  }
  
  .movie-categories {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
  }
  
  .category-btn {
    background-color: #444;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
  }
  
  .movie-list {
    display: flex;
    gap: 20px;
  }
  
  .movie-item {
    width: 150px;
  }
  
  .movie-item img {
    width: 100%;
  }
  </style>
  