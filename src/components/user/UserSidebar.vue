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
      :unique-opened="false"
      :default-openeds="['viewing']"
    >
      <!-- 账号设置 -->
      <el-menu-item index="account">
        <i class="el-icon-user"></i>
        <span>账号设置</span>
      </el-menu-item>
      
      <!-- 观影设置 -->
      <el-menu-item index="viewing">
        <i class="el-icon-film"></i>
        <span>观影设置</span>
      </el-menu-item>
      
      <!-- AI聊天设置 -->
      <el-menu-item index="ai-chat">
        <i class="el-icon-chat-dot-round"></i>
        <span>AI聊天设置</span>
      </el-menu-item>
      
      <!-- 智能家庭设置 -->
      <el-menu-item index="home">
        <i class="el-icon-house"></i>
        <span>智能家庭设置</span>
      </el-menu-item>
      
      <!-- 积分设置 -->
      <el-menu-item index="points">
        <i class="el-icon-coin"></i>
        <span>积分设置</span>
      </el-menu-item>
      
      <!-- 会员中心 -->
      <el-menu-item index="member">
        <i class="el-icon-medal"></i>
        <span>会员中心</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  flex-shrink: 0;
  margin-left: 0;
  margin-top: 0; /* 确保顶部对齐 */
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
  padding: 10px 0;
}

.sidebar-menu .el-menu-item {
  height: 45px;
  line-height: 45px;
  margin: 2px 0;
  border-radius: 6px;
  transition: all 0.3s ease;
  padding-left: 20px !important;
  display: flex;
  align-items: center;
}

.sidebar-menu .el-menu-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}

.sidebar-menu .el-menu-item span {
  flex: 1;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f5f7fa;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.sidebar-menu .el-submenu {
  margin: 2px 0;
}

.sidebar-menu .el-submenu .el-submenu__title {
  height: 45px;
  line-height: 45px;
  border-radius: 6px;
  transition: all 0.3s ease;
  padding-left: 20px !important;
  display: flex;
  align-items: center;
}

.sidebar-menu .el-submenu .el-submenu__title i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}

.sidebar-menu .el-submenu .el-submenu__title span {
  flex: 1;
}

.sidebar-menu .el-submenu .el-submenu__title:hover {
  background-color: #f5f7fa;
}

.sidebar-menu .el-submenu .el-menu-item {
  height: 40px;
  line-height: 40px;
  padding-left: 50px !important;
  margin: 1px 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.sidebar-menu .el-submenu .el-menu-item span {
  flex: 1;
}

.sidebar-menu .el-submenu .el-menu-item:hover {
  background-color: #f0f9ff;
}

.sidebar-menu .el-submenu .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 确保子菜单正确显示 */
.sidebar-menu .el-submenu .el-menu {
  background-color: transparent;
  border: none;
}

.sidebar-menu .el-submenu .el-menu .el-menu-item {
  background-color: transparent;
  border: none;
}

/* 子菜单展开箭头样式 */
.sidebar-menu .el-submenu .el-submenu__title .el-submenu__icon-arrow {
  margin-left: auto;
  margin-right: 10px;
  transition: transform 0.3s ease;
}

.sidebar-menu .el-submenu.is-opened .el-submenu__title .el-submenu__icon-arrow {
  transform: rotate(180deg);
}

/* 确保子菜单项有正确的缩进 */
.sidebar-menu .el-submenu .el-menu {
  padding-left: 0;
}

.sidebar-menu .el-submenu .el-menu .el-menu-item {
  padding-left: 50px !important;
}

/* 强制显示子菜单 */
.sidebar-menu .el-submenu .el-menu {
  display: block !important;
}

.sidebar-menu .el-submenu .el-menu .el-menu-item {
  display: block !important;
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