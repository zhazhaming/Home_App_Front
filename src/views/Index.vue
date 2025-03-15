<template>
    <div class="home-container">
      <!-- 顶部导航栏 -->
      <Navbar />
      
      <!-- 主要内容区域 -->
      <div class="content-wrapper">
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
    
        <!-- 轮播图或其他内容 -->
        <section class="scroll-section">
          <h2>More Features</h2>
          <div class="feature-images">
            <div
              v-for="(image, index) in scrollImages"
              :key="index"
              class="feature-image-item"
            >
              <img :src="image" alt="Smart Home Feature" />
            </div>
          </div>
        </section>
      </div>
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
  /* 页面整体布局 */
  .home-container {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    background-color: #fafafa;
    overflow-x: hidden;
  }
  
  .content-wrapper {
    flex: 1;
    padding: 0 5%;
    max-width: 100%;
    margin: 0 auto;
    width: 100%;
    padding-top: 120px; /* 增加顶部内边距，防止内容被导航栏覆盖 */
    box-sizing: border-box;
  }
  
  /* 顶部内容样式 */
  .header {
    margin: 20px 0 40px;
    text-align: center;
    width: 100%;
  }
  
  .header h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 15px;
    color: #333;
    letter-spacing: 1px;
  }
  
  .header p {
    font-size: 1.3rem;
    color: #666;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.5;
  }
  
  /* 图片和文字展示区域 */
  .main-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 30px 0 60px;
    gap: 5%;
    flex-wrap: wrap;
    width: 100%;
  }
  
  .image-section {
    flex: 1;
    min-width: 300px;
    max-width: 600px;
  }
  
  .image-section img {
    width: 100%;
    height: auto;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    object-fit: cover;
  }
  
  .image-section img:hover {
    transform: scale(1.02);
  }
  
  .text-section {
    flex: 1;
    min-width: 300px;
    padding: 20px;
  }
  
  .text-section h2 {
    font-size: 2.2rem;
    margin-bottom: 25px;
    color: #333;
    position: relative;
  }
  
  .text-section h2:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: #4285f4;
  }
  
  .text-section p {
    font-size: 1.1rem;
    color: #555;
    line-height: 1.8;
  }
  
  /* 底部特性图片展示 */
  .scroll-section {
    margin: 30px 0 60px;
    text-align: center;
    width: 100%;
  }
  
  .scroll-section h2 {
    font-size: 2.2rem;
    margin-bottom: 30px;
    color: #333;
    position: relative;
    display: inline-block;
  }
  
  .scroll-section h2:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: #4285f4;
  }
  
  /* 替换滚动区域为网格布局 */
  .feature-images {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin: 40px auto;
    flex-wrap: wrap;
    width: 100%;
  }
  
  .feature-image-item {
    flex: 0 0 auto;
    width: 30%;
    min-width: 280px;
    margin-bottom: 20px;
  }
  
  .feature-image-item img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .feature-image-item img:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .content-wrapper {
      padding-top: 100px; /* 为小屏幕增加更多顶部内边距 */
    }
    
    .main-content {
      flex-direction: column;
      text-align: center;
    }
    
    .text-section h2:after {
      left: 50%;
      transform: translateX(-50%);
    }
    
    .header h1 {
      font-size: 2.5rem;
    }
    
    .header p {
      font-size: 1.1rem;
    }
    
    .feature-image-item {
      width: 100%;
    }
  }
  
  /* 确保在各种屏幕尺寸下都能正常显示 */
  @media (min-width: 1400px) {
    .content-wrapper {
      max-width: 1400px;
    }
  }
  </style>