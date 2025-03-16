<template>
  <div class="my-theater">
    <div class="theater-header">
      <h2 class="section-title">我的影厅</h2>
    </div>
    
    <div class="theater-content">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="观看历史" name="history">
          <div class="history-container" v-if="activeTab === 'history'">
            <div class="time-filter">
              <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
                <el-radio-button label="week">一周内</el-radio-button>
                <el-radio-button label="earlier">更早</el-radio-button>
              </el-radio-group>
            </div>
            
            <WatchHistory :timeRange="timeRange" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="预约/收藏" name="bookmark">
          <BookmarkCollection v-if="activeTab === 'bookmark'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import WatchHistory from './WatchHistory.vue';
import BookmarkCollection from './BookmarkCollection.vue';

const props = defineProps({
  subMenu: {
    type: String,
    default: 'history'
  }
});

const emit = defineEmits(['sub-menu-change']);

const activeTab = ref('history');
const timeRange = ref('week');

// 监听 props 变化
watch(() => props.subMenu, (newVal) => {
  if (newVal === 'history') {
    activeTab.value = 'history';
  } else if (newVal === 'bookmark') {
    activeTab.value = 'bookmark';
  } else if (newVal === 'week' || newVal === 'earlier') {
    activeTab.value = 'history';
    timeRange.value = newVal;
  }
}, { immediate: true });

const handleTabClick = (tab) => {
  emit('sub-menu-change', tab.props.name);
};

const handleTimeRangeChange = (value) => {
  emit('sub-menu-change', value);
};
</script>

<style scoped>
.my-theater {
  animation: fadeIn 0.5s ease;
}

.theater-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(to right, #409eff, #a0cfff);
}

.theater-content {
  margin-top: 20px;
}

.time-filter {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.history-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .time-filter {
    justify-content: flex-start;
  }
}
</style> 