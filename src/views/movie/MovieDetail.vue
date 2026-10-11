<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <HeaderBar />
      <section class="content">
        <div class="movie-detail">
          <div class="movie-header">
            <img :src="movie.img_url" alt="Movie Poster" class="movie-poster">
            <div class="movie-info">
              <h1>{{ movie.name }}</h1>
              <div class="tags">
                <span v-for="tag in movie.tags" :key="tag">{{ tag }}</span>
              </div>
              <p>{{ movie.director ? `导演: ${movie.director}` : '' }}</p>
              <p>{{ movie.actors && movie.actors !== 'NULL' ? `主演: ${movie.actors}` : '' }}</p>
              <p>{{ movie.category ? `类别: ${movie.category}` : '' }}</p>
              <p>{{ movie.date ? `更新: ${new Date(movie.date).toLocaleString()}` : '' }}</p>
              <p>{{ movie.duration ? `片长: ${movie.duration}分钟` : '' }}</p>
              <p v-if="movie.episode">{{ `集数: ${movie.episode}` }}</p>
              <p>{{ movie.language ? `语言: ${movie.language}` : '' }}</p>
              <p>{{ movie.origin ? `产地: ${movie.origin}` : '' }}</p>
              <p>{{ movie.douban_rating ? `评分: ${movie.douban_rating}` : '' }}</p>
              <p class="desc-text">{{ movie.description ? `简介: ${movie.description}` : '' }}</p>
              <div class="watch-actions">
                <el-button v-if="playSources.length" type="success" icon="el-icon-video-play" @click="openPlayer">在线观看</el-button>
                <el-button v-if="panLinks.length" v-for="(pan, index) in panLinks" :key="index"
                           type="warning" @click="openLink(pan.url)">{{ pan.label }}</el-button>
                <el-button v-if="movie.magnet_url" type="danger" @click="download(movie.magnet_url)">磁力下载</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 在线播放器 -->
        <div v-if="playSources.length" ref="playerSection" class="online-player" :class="{ playing: isPlaying }">
          <h2>在线观看</h2>
          <div v-if="isPlaying" class="player-shell">
            <video
              ref="videoEl"
              class="player-video"
              controls
              autoplay
              playsinline
              @error="onVideoError"
            ></video>
            <p v-if="playerError" class="player-error">{{ playerError }}</p>
          </div>
          <div v-else class="player-cover" @click="startPlay(currentSourceIndex)">
            <img :src="movie.img_url" alt="播放封面" class="cover-img">
            <div class="cover-mask">
              <div class="play-btn">▶</div>
              <p>点击开始播放</p>
            </div>
          </div>

          <!-- 多线路/多集切换 -->
          <div v-if="playSources.length > 1" class="source-list">
            <el-button
              v-for="(s, i) in playSources"
              :key="i"
              size="small"
              :type="i === currentSourceIndex ? 'primary' : 'default'"
              @click="switchSource(i)"
            >{{ s.label }}</el-button>
          </div>
        </div>

        <div class="recommendations">
          <h2>相关推荐</h2>
          <div class="movie-grid">
            <div class="movie-card" v-for="related in relatedMovies" :key="related.id" @click="goToMovieDetail(related.id)">
              <img :src="related.img_url" alt="Related Movie Poster" class="clickable">
              <p class="clickable">{{ related.name }}</p>
            </div>
          </div>
        </div>

        <div class="now-showing">
          <h2>正在热映</h2>
          <div class="movie-grid">
            <div class="movie-card" v-for="showing in nowShowingMovies" :key="showing.id" @click="goToMovieDetail(showing.id)">
              <img :src="showing.img_url" alt="Now Showing Movie Poster" class="clickable">
              <p class="clickable">{{ showing.name }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import Hls from 'hls.js';
import { ENV_CONFIG } from '../../config/env';
import Sidebar from '../../components/movie/Sidebar.vue';
import HeaderBar from '../../components/movie/HeaderBar.vue';

const request_url = ref(`${ENV_CONFIG.API_BASE_URL}/movice/`);
const route = useRoute();
const router = useRouter();
const movie = ref({});
const relatedMovies = ref([]);
const nowShowingMovies = ref([]);

// 把 pan_url（多条换行分隔）解析成带名称的按钮数据，点击可直接打开对应网盘在线观看
const panLinks = computed(() => {
  const raw = movie.value.pan_url || '';
  return raw.split('\n').map((url) => url.trim()).filter(Boolean).map((url) => {
    let label = '网盘打开';
    if (url.includes('pan.xunlei.com')) label = '迅雷云盘观看';
    else if (url.includes('pan.quark.cn')) label = '夸克网盘观看';
    else if (url.includes('pan.baidu.com')) label = '百度网盘观看';
    return { url, label };
  });
});

const fetchMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${ENV_CONFIG.API_BASE_URL}/movice/detail/getById?id=${movieId}`);
    movie.value = response.data.data;
    console.log(movie.value);

    // 获取相关推荐
    const relatedResponse = await axios.get(request_url.value + 'getWellReceive?pageNum=1&pageSize=12');
    relatedMovies.value = relatedResponse.data.data;

    // 获取正在热映
    const nowShowingResponse = await axios.get(request_url.value + 'getMoviesRecent?pageNum=1&pageSize=12');
    nowShowingMovies.value = nowShowingResponse.data.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
};

onMounted(() => {
  fetchMovieDetails(route.params.id);
});

watch(() => route.params.id, (newId) => {
  // 切换电影时停止播放并复位播放器
  isPlaying.value = false;
  playerError.value = '';
  currentSourceIndex.value = 0;
  destroyHls();
  fetchMovieDetails(newId);
});

const download = (magnetUrl) => {
  window.open(magnetUrl, '_blank');
};

// 打开网盘链接，保存到自己的云盘后即可在线观看
const openLink = (url) => {
  window.open(url, '_blank');
};

// ==================== 在线观看 ====================
// play_url 每行一个片源，格式：名称|地址 或 仅地址；支持 mp4 / m3u8(HLS)
const playSources = computed(() => {
  const raw = movie.value.play_url || '';
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    let label = '';
    let url = line;
    if (line.includes('|')) {
      const idx = line.indexOf('|');
      label = line.slice(0, idx).trim();
      url = line.slice(idx + 1).trim();
    }
    if (!label) {
      label = lines.length > 1 ? `线路${i + 1}` : '在线观看';
    }
    return { label, url, type: url.includes('.m3u8') ? 'hls' : 'mp4' };
  });
});

const playerSection = ref(null);
const videoEl = ref(null);
const isPlaying = ref(false);
const currentSourceIndex = ref(0);
const playerError = ref('');
let hls = null;

const destroyHls = () => {
  if (hls) {
    hls.destroy();
    hls = null;
  }
};

const loadSource = (source) => {
  const video = videoEl.value;
  if (!video) return;
  destroyHls();
  playerError.value = '';

  if (source.type === 'hls') {
    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 30 });
      hls.loadSource(source.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          playerError.value = '视频线路加载失败（可能是片源失效或跨域限制），请切换其他线路';
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 原生支持 HLS
      video.src = source.url;
      video.play().catch(() => {});
    } else {
      playerError.value = '当前浏览器不支持HLS播放，请切换其他线路或更换浏览器';
    }
  } else {
    video.src = source.url;
    video.play().catch(() => {});
  }
};

const startPlay = (index) => {
  if (!playSources.value.length) return;
  currentSourceIndex.value = index;
  isPlaying.value = true;
  nextTick(() => loadSource(playSources.value[index]));
};

const switchSource = (index) => {
  if (index === currentSourceIndex.value && isPlaying.value) return;
  startPlay(index);
};

const openPlayer = () => {
  if (!isPlaying.value) {
    startPlay(currentSourceIndex.value);
  }
  nextTick(() => {
    playerSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

const onVideoError = () => {
  if (playSources.value[currentSourceIndex.value]?.type === 'mp4') {
    playerError.value = '视频加载失败（可能是片源失效），请切换其他线路';
  }
};

onBeforeUnmount(destroyHls);

const goToMovieDetail = (id) => {
  router.push({ name: 'MovieDetail', params: { id } });
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: hidden;
  height: 100vh;
  width: 100vw;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-content {
  flex: 1;
  padding: 10px;
  min-width: 0;
  overflow-y: auto;
  width: calc(100vw - 200px);
  max-width: none;
  box-sizing: border-box;
}

.content {
  margin-top: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.movie-detail {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.movie-header {
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.movie-poster {
  width: 450px;
  height: auto;
  margin-right: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.movie-info {
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.movie-info h1 {
  margin-bottom: 20px;
  font-size: 2rem;
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.movie-info p {
  margin: 10px 0;
  font-size: 1rem;
  color: #555;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
  max-width: 100%;
}

/* 简介保留源站的换行格式（◎信息逐行显示） */
.movie-info p.desc-text {
  white-space: pre-line;
  margin-top: 16px;
}

/* 网盘观看 / 磁力下载按钮区 */
.watch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

/* ==================== 在线播放器 ==================== */
.online-player {
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 24px 30px;
  margin-bottom: 40px;
}

.online-player h2 {
  margin: 0 0 16px;
  font-size: 1.4rem;
  color: #333;
}

.player-shell {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.player-video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.player-error {
  margin: 10px 0 0;
  color: #f56c6c;
  font-size: 14px;
}

/* 播放封面（未开始播放时） */
.player-cover {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.55;
  display: block;
}

.cover-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
}

.play-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  padding-left: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s;
}

.player-cover:hover .play-btn {
  transform: scale(1.1);
}

.cover-mask p {
  margin: 0;
  font-size: 14px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

/* 线路切换按钮 */
.source-list {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.tags span {
  background-color: #e0e0e0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.9rem;
  white-space: nowrap;
  word-wrap: break-word;
}

.recommendations, .now-showing {
  margin-top: 40px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
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
  aspect-ratio: 2 / 3;      /* 海报统一 2:3 比例，裁切填满，保证所有图片大小一致 */
  object-fit: cover;
  display: block;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.movie-card p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  /* 标题最多两行且占满两行高度，保证每行卡片对齐 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
}

.clickable {
  color: black;
  text-decoration: none;
}

.clickable:hover {
  text-decoration: underline;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .movie-poster {
    width: 400px;
    margin-right: 30px;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 15px;
  }
  
  .movie-detail {
    padding: 20px;
  }
  
  .movie-poster {
    width: 350px;
    margin-right: 25px;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .movie-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .movie-poster {
    width: 300px;
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .movie-info {
    width: 100%;
    max-width: 100%;
  }
  
  .movie-info h1 {
    font-size: 1.8rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }
  
  .movie-detail {
    padding: 15px;
  }
  
  .movie-poster {
    width: 250px;
  }
  
  .movie-info h1 {
    font-size: 1.5rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.2;
  }
  
  .movie-info p {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
}
</style> 