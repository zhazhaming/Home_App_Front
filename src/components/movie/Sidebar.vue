<template>
  <aside class="sidebar">
    <div class="logo">HOME VIDEO</div>
    <ul>
      <li v-for="item in menuItems" :key="item.name" @click="navigate(item.route)" class="menu-item">
        {{ item.name }}
      </li>
    </ul>
  </aside>
</template>

<script>
import { ElMessage } from 'element-plus';
export default {
  data() {
    return {
      menuItems: [
        { name: '首页', route: '/' },
        { name: '电影', route: '/movie' },
        { name: '连续剧', route: '/series' },
        { name: '动漫', route: '/anime' },
        { name: '综艺节目', route: '/shows' },
        { name: '今日更新', route: '/updates' },
        { name: '明星库', route: '/stars' },
        { name: '热搜榜', route: '/trending' }
      ],
      comingSoonRoutes: ['/series', '/anime', '/shows', '/updates', '/stars', '/trending']
    };
  },
  methods: {
    navigate(route) {
      // 对未开发的页面给出提示并拦截跳转
      if (this.comingSoonRoutes.includes(route)) {
        ElMessage.info('该功能尚未开发，敬请期待');
        return;
      }
      this.$router.push(route);
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #f4f4f4;
  padding: 20px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
}

.menu-item {
  margin: 10px 0;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

.menu-item:hover {
  background-color: #007bff;
  color: white;
}
</style> 