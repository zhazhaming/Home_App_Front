<template>
  <div class="common-layout">
    <el-container>
      <!-- 电影首页导航栏 -->
      <MovieHeader/>
      <div class="main">
        <div class="carousel-container">
          <div class="carousel">
            <div class="carousel-inner" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
              <div v-for="(image, index) in images_list" :key="image.id" class="carousel-item">
                <img :src="image.url" :alt="image.name" />
              </div>
            </div>
          </div>
          <div class="carousel-controls">
            <button @click="prevSlide" class="control-button prev">&#10094;</button>
            <button @click="nextSlide" class="control-button next">&#10095;</button>
        
          </div>
          <div class="carousel-indicators">
            <span v-for="(image, index) in images_list" :key="image.id" @click="goToSlide(index)"></span>
          </div>
        </div>
      </div>
      
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import MovieHeader from './MovieHeader.vue';


const images_list = reactive([
  {id:'', name:'图片1', url:'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2903066285.jpg'},
  {id:'', name:'图片2', url:'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2906647021.jpg'},
  {id:'', name:'图片3', url:'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2902183869.jpg'},
  {id:'', name:'图片4', url:'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2903145026.jpg'},
  {id:'', name:'图片5', url:'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2904915169.jpg'},
  {id:'', name:'图片6', url:'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2892062454.jpg'},
  ]);

  const currentIndex = ref(0);

let intervalId = null;

const startAutoPlay = () => {
  intervalId = setInterval(() => {
    nextSlide();
  }, 3000);
};

const stopAutoPlay = () => {
  clearInterval(intervalId);
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images_list.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + images_list.length) % images_list.length;
};

const goToSlide = (index) => {
  currentIndex.value = index;
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});

</script>

<style scoped>

.main {
  height: 50%;
  width: 100%;
  padding: 0;
}

/* 轮播图 */
.carousel-container {
  width: 50%;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  
}

.carousel {
  width: 100%;
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-inner {
  display: flex;
  width: 100%;
  margin: 0%;
}

.carousel-item {
  flex: 0 0 100%;
  width: 100%;
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.carousel-item img {
  width: 50%;
  height: 100%;
  object-fit: cover;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 21% 21%;
}

.carousel-controls 


.carousel-indicators {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}



.carousel-indicators span {
  width: 10px;
  height: 10px;
  background-color: rgba(20, 1, 1, 0.5);
  border-radius: 50%;
  cursor: pointer;
}

.carousel-indicators span.active {
  background-color: rgba(255, 255, 255, 1);
}

</style>
