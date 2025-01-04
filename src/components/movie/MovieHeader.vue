<template>
    <header class="header">
      <div class="logo" @click="back_home">MYHome</div>
      <nav>
        <ul>
          <li v-for="(link_item, index) in links_list" :key="index" @click="toggleActive(index)" :class="{ active: activeIndex === index }">
            <a :href="link_item.url">{{ link_item.text }}</a>
          </li>
        </ul>
      </nav>
      <div>
      <div class="icon">
        <el-avatar
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
      </div>
    </div>
    </header>
  </template>

  <script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const links_list = reactive([
    {text:'电影', url:'#'},
    {text:'电视剧', url:'#'},
    {text:'动漫', url:'#'},
    {text:'综艺', url:'#'},
  ]);

  const activeIndex = ref(null);

  const toggleActive = (index) => {
    activeIndex.value = index;
  };

  const back_home = () => {
    router.push('/index');
  };



  </script>




  <style scoped>
  .header {
    display: flex;    
    align-items: center;
    background-color: #B3C0D1;
    color: black;
    padding-top: auto;
    padding: 0;
    height: 60px;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    line-height: 60px;
    text-align: center;
    letter-spacing: 2px;
    padding-left: 2%;
  }
  
  .logo {
    display: flex;    
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;
    height: 70%;
    
  }
  
  nav ul {
    list-style: none;
    display: flex;
    gap: 0.5rem;
    width: auto;
    height: 20%;
    margin: 0;
    padding: 0;
  }

  nav ul li {
    list-style-type: none;
    padding: 0px;
    margin: 0;
    height: 50%;
  }
    
  nav ul li a {
    color: black;
    text-decoration: none;
    font-weight: bold;
    font-size: 1rem;
    padding: 15px;
  }

  nav ul li.active {
    color: lightgray; /* 浅色文字 */
  }

  .icon {
  display: flex; 
}
.icon > div {
  flex: 1;
  text-align: center;
  float: right;  
}

.icon > div:not(:last-child) {
  border-right: 1px solid var(--el-border-color);
}
  </style>