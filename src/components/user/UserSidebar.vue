<template>
  <div class="user-sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <h2>个人中心</h2>
      <el-button type="text" @click="toggleCollapse" class="collapse-btn">
        <i :class="isCollapsed ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"></i>
      </el-button>
    </div>
    
    <div class="user-profile">
      <el-avatar :size="64" :src="userStore.avatar"></el-avatar>
      <h3 v-if="!isCollapsed">{{ userStore.username }}</h3>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapsed"
      @select="handleSelect"
    >
      <el-menu-item index="account">
        <i class="el-icon-user"></i>
        <span>账号设置</span>
      </el-menu-item>
      
      <el-submenu index="theater">
        <template #title>
          <i class="el-icon-film"></i>
          <span>我的影厅</span>
        </template>
        <el-menu-item index="history">观看历史</el-menu-item>
        <el-menu-item index="bookmark">预约/收藏</el-menu-item>
      </el-submenu>
      
      <el-menu-item index="ai-chat">
        <i class="el-icon-chat-dot-round"></i>
        <span>我的AI Chat</span>
      </el-menu-item>
      
      <el-menu-item index="home">
        <i class="el-icon-house"></i>
        <span>我的家庭</span>
      </el-menu-item>
      
      <el-menu-item index="points">
        <i class="el-icon-coin"></i>
        <span>积分设置</span>
      </el-menu-item>
      
      <el-menu-item index="member">
        <i class="el-icon-medal"></i>
        <span>会员中心</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useUserStore } from '../../stores/userStore';

const props = defineProps({
  activeMenu: {
    type: String,
    default: 'account'
  }
});

const emit = defineEmits(['menu-change']);
const userStore = useUserStore();
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleSelect = (index) => {
  emit('menu-change', index);
};
</script>

<style scoped>
.user-sidebar {
  width: 250px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

.user-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e6e6e6;
}

.user-profile h3 {
  margin: 10px 0 0;
  font-size: 16px;
  color: #333;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
}

.collapse-btn {
  padding: 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .user-sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .user-sidebar.collapsed {
    width: 100%;
  }
}
</style> 