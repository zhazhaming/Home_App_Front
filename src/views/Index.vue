<template>
    <div class="home-container">
      <!-- 顶部导航栏 -->
      <Navbar />
      <!-- 顶部内容 -->
      <header class="header">
        <h1>MY HOME</h1>
        <p>幸福，从家开始；爱家，更爱生活</p>
      </header>
  
      <!-- 图片和描述部分 -->
      <section class="main-content">
        <div class="image-section">
          <img src="/images/family1.jpg" alt="Family" />
        </div>
        <div class="text-section">
          <h2>欢迎回到My Home</h2>
          <p>
            从生活娱乐到智能家居，My Home致力于您最喜欢的品牌的服务，打造个性化，私有化服务
            智能家居帮助您完成任务。
          </p>
        </div>
      </section>
  
      <!-- 轮播图或其他内容，可以继续添加 -->
      <section class="scroll-section">
        <h2>More Features</h2>
        <div class="scroll-images">
          <div
            v-for="(image, index) in scrollImages"
            :key="index"
            class="scroll-image-item"
          >
            <img :src="image" alt="Smart Home Feature" />
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue';
import Navbar from '../components/Navbar.vue';
  const scrollImages = reactive([
    '/images/family2.jpg',
    '/images/family3.jpg',
    '/images/family4.jpg',
  ]);
  </script>
  
  <style scoped>
  /* 导航栏样式 */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f5f5f5;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    min-width: 320px; /* 确保最小宽度 */
  }
  
  .nav-items {
    display: flex;
    gap: 15px;
  }
  
  .nav-item {
    text-decoration: none;
    font-size: 18px;
    color: #333;
    font-weight: bold;
  }
  
  .nav-item:hover {
    color: #4285f4;
  }
  
  .go-button {
    background-color: #4285f4;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-size: 18px;
  }
  
  .go-button:hover {
    background-color: #357ae8;
  }
  
  /* 页面整体布局 */
  .home-container {
    font-family: Arial, sans-serif;
    padding: 20px;
    text-align: center;
    min-height: 100vh; /* 确保最小高度为视口高度 */
    display: flex;
    flex-direction: column;
  }
  
  .header {
    margin-bottom: 50px;
  }
  
  .header h1 {
    font-size: 48px;
    font-weight: bold;
  }
  
  .header p {
    font-size: 24px;
    color: #666;
  }
  
  /* 图片和文字展示区域 */
  .main-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 60px;
    flex: 1; /* 确保内容区域占据剩余空间 */
  }
  
  .image-section img {
    width: 400px;
    height: auto;
    border-radius: 20px;
  }
  
  .text-section {
    max-width: 500px;
    text-align: left;
  }
  
  .text-section h2 {
    font-size: 36px;
    margin-bottom: 20px;
  }
  
  .text-section p {
    font-size: 18px;
    color: #555;
  }
  
  /* 向下滑动时的图片展示 */
  .scroll-section {
    margin-top: 60px;
  }
  
  .scroll-section h2 {
    font-size: 28px;
    margin-bottom: 20px;
  }
  
  .scroll-images {
    display: flex;
    overflow-x: auto;
    gap: 20px;
  }
  
  .scroll-image-item img {
    width: 300px;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
  }
  </style>