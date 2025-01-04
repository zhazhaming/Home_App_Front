<!-- src/components/Navbar.vue -->
<template>
    <nav class="navbar">
      <div class="nav-items">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/movie" class="nav-item">电影影厅</router-link>
        <router-link to="/ai-chat" class="nav-item">AI Chat</router-link>
        <router-link to="/smart-home" class="nav-item">智能家庭</router-link>
        <router-link to="/more" class="nav-item">更多</router-link>
      </div>
      <!-- 使按钮水平对齐 -->
      <button class="go-button" @click="goToLogin">Go to My Home</button>
    </nav>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const name = "Navbar";
  const goToLogin = () => {
      // 跳转到登录页面的逻辑
      router.push('/login'); 
    };

  </script>
  
  <style scoped>
    .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f5f5f5;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    min-width: 310px; /* 确保最小宽度 */
    margin-top: 20px;
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
  </style>
  