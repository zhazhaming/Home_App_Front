<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <HeaderBar />
      <section class="content">
        <div class="section-header">
          <h2>{{ title }}</h2>
        </div>
        <div class="movie-list" v-if="movies.length > 0">
          <div class="movie-card" v-for="item in movies" :key="item.id">
            <img :src="item.img_url || placeholderImg" alt="海报" @click="goToDetail(item.id)" class="clickable poster">
            <p @click="goToDetail(item.id)" class="clickable name">{{ item.name }}</p>
            <p class="desc" v-if="item.description">{{ item.description }}</p>
            <div class="resource-tags">
              <el-tag v-if="item.magnet_url" size="small" type="success" @click="goToDetail(item.id)" class="clickable">磁力</el-tag>
              <el-tag v-if="item.pan_url" size="small" type="warning" @click="goToDetail(item.id)" class="clickable">网盘</el-tag>
            </div>
          </div>
        </div>
        <el-empty v-else-if="!loading" description="暂无内容，等爬虫下一批数据入库"></el-empty>
        <div class="pagination-wrapper" v-if="total > pageSize">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="pageNum"
            @current-change="handlePageChange">
          </el-pagination>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Sidebar from '../../components/movie/Sidebar.vue';
import HeaderBar from '../../components/movie/HeaderBar.vue';
import { ENV_CONFIG } from '../../config/env';

export default {
  components: {
    Sidebar,
    HeaderBar
  },
  props: {
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      movies: [],
      pageNum: 1,
      pageSize: 24,
      total: 0,
      loading: false,
      placeholderImg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="210"><rect width="100%" height="100%" fill="%23e0e0e0"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="14">暂无封面</text></svg>'
    };
  },
  mounted() {
    this.fetchList();
  },
  watch: {
    type() {
      // 复用组件切换类型时重新拉取
      this.pageNum = 1;
      this.fetchList();
    }
  },
  methods: {
    async fetchList() {
      this.loading = true;
      try {
        const url = `${ENV_CONFIG.API_BASE_URL}/movice/getByType`
          + `?type=${this.type}&pageNum=${this.pageNum}&pageSize=${this.pageSize}`;
        const response = await fetch(url);
        const body = await response.json();
        // 后端返回结构：{ code, data: [...] }，无总数，满页则假定还有下一页
        const data = body.data || [];
        this.movies = data;
        this.total = data.length === this.pageSize
          ? this.pageNum * this.pageSize + 1
          : (this.pageNum - 1) * this.pageSize + data.length;
      } catch (error) {
        console.error('获取类型资源列表失败:', error);
        this.movies = [];
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(page) {
      this.pageNum = page;
      this.fetchList();
      this.scrollTop();
    },
    goToDetail(id) {
      this.$router.push(`/movie/${id}`);
    },
    scrollTop() {
      const main = document.querySelector('.main-content');
      if (main) main.scrollTop = 0;
    }
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
}

.content {
  margin-top: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.movie-card {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
  padding-bottom: 8px;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.poster {
  width: 100%;
  height: 210px;
  object-fit: cover;
  display: block;
}

.name {
  margin: 8px 8px 4px;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  /* 最多两行，超出省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  margin: 0 8px 6px;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
  /* 简介最多两行，超出省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.clickable {
  cursor: pointer;
}

.resource-tags {
  padding: 0 8px;
  display: flex;
  gap: 6px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
