<template>
  <aside class="sidebar">
    <div class="logo">HOME VIDEO</div>
    <ul>
      <li v-for="item in menuItems" :key="item.name" @click="navigate(item.route)">
        {{ item.name }}
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [
        { name: '首页', route: '/index' },
        { name: '电影', route: '/movie' },
        { name: '连续剧', route: '/series' },
        { name: '动漫', route: '/anime' },
        { name: '综艺节目', route: '/shows' },
        { name: '今日更新', route: '/updates' },
        { name: '明星库', route: '/stars' },
        { name: '热搜榜', route: '/trending' }
      ]
    };
  },
  methods: {
    navigate(route) {
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
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
  cursor: pointer;
  transition: color 0.3s;
}

li:hover {
  color: #007bff;
}
</style> 