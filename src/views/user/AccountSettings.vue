<template>
  <div class="account-settings">
    <h2 class="section-title">账号设置</h2>
    
    <div class="settings-content">
      <div class="avatar-section">
        <h3>头像设置</h3>
        <div class="avatar-container">
          <el-avatar :size="100" :src="avatar" class="current-avatar"></el-avatar>
          <div class="avatar-actions">
            <el-upload
              class="avatar-uploader"
              :action="ENV_CONFIG.UPLOAD_URL || `${ENV_CONFIG.API_BASE_URL}/api/files/uploadPic`"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"
              :before-upload="beforeAvatarUpload"
              :on-progress="handleAvatarProgress"
              name="file"
              accept="image/jpeg,image/png"
            >
              <el-button type="primary">更换头像</el-button>
            </el-upload>
            <p class="upload-tip">支持 JPG、PNG 格式，文件小于 2MB</p>
          </div>
        </div>
      </div>
      
      <el-divider></el-divider>
      
      <div class="info-section">
        <h3>个人信息</h3>
        <el-form 
          :model="userForm" 
          :rules="rules" 
          ref="userFormRef" 
          label-width="80px"
          class="user-form"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
          
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="userForm.gender">
              <el-radio label="1">男</el-radio>
              <el-radio label="2">女</el-radio>
              <el-radio label="0">其他</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-divider></el-divider>
          
          <h3>修改密码</h3>
          <el-form-item label="原密码" prop="oldPassword">
            <el-input 
              v-model="userForm.oldPassword" 
              type="password" 
              placeholder="请输入原密码"
              show-password
            ></el-input>
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input 
              v-model="userForm.newPassword" 
              type="password" 
              placeholder="请输入新密码"
              show-password
            ></el-input>
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="userForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码"
              show-password
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitForm">保存修改</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../../stores/userStore';
import request from '../../services/request';
import { ENV_CONFIG } from '../../config/env';

const userStore = useUserStore();
const avatar = ref('');
const userFormRef = ref(null);

// 上传头像的请求头
const uploadHeaders = computed(() => {
  const token = userStore.token || localStorage.getItem('user_token');
  console.log('当前使用的token:', token); // 调试用
  return {
    Authorization: `Bearer ${token}`,
    // 可能需要添加其他头信息
    'X-Token': token, // 有些后端可能使用不同的头名称
    'token': token // 简单的token头
  };
});

// 表单数据
const userForm = reactive({
  id: '',
  username: userStore.username || '',
  email: '',
  phone: '',
  gender: '1',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  avatar: userStore.avatar // 初始化为当前头像
});

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  newPassword: [
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { 
      validator: (rule, value, callback) => {
        if (value !== userForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 检查用户是否已登录
    if (!userStore.isLoggedIn || !userStore.user_id) {
      // 尝试从localStorage恢复用户信息
      const userData = JSON.parse(localStorage.getItem('user_info') || '{}');
      if (userData.user_id) {
        userStore.setUserInfo(userData);
        console.log(userData);
        userForm.id = parseInt(userData.user_id);
        userForm.username = userData.username;
        userForm.email = userData.email || '';
        userForm.phone = userData.phone || '';
        userForm.gender = userData.gender ? userData.gender.toString() : '1';
        userForm.avatar = userData.avatar || avatar.value;
      } else {
        ElMessage.warning('请先登录');
        return;
      }
    } else {
      // 如果已登录，从store中获取id
      userForm.id = parseInt(userStore.user_id);
    }

    console.log(`发送请求id：${userStore.user_id}`);
    const response = await request({
      url: '/user/info',
      method: 'post',
      params: { id: parseInt(userStore.user_id) }
    });
    
    if (response.code === 200) {
      const userData = response.data;
      userForm.id = parseInt(userData.user_id || userStore.user_id);
      userForm.username = userData.username || userForm.username;
      userForm.email = userData.email || '';
      // 确保显示手机号和性别
      userForm.phone = userData.phone || '';
      userForm.gender = userData.gender !== undefined ? userData.gender.toString() : '1';
      // 更新头像
      if (userData.avatar) {
        userForm.avatar = userData.avatar;
        avatar.value = userData.avatar;
        // 同时更新 userStore 中的头像
        userStore.setUserInfo({
          user_id: userStore.user_id,
          username: userStore.username,
          email: userStore.email,
          token: userStore.token,
          refresh_token: userStore.refresh_token,
          avatar: userData.avatar
        });
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败: ' + (error.response?.data?.msg || error.message));
  }
};

// 头像上传成功处理
const handleAvatarSuccess = (response) => {
  console.log('头像上传响应:', response); // 调试用
  
  if (response.code === 200) {
    // 从后端响应中获取头像URL
    // 根据实际后端返回的数据结构调整
    let avatarUrl = '';
    
    if (response.data) {
      // 如果后端直接返回URL字符串
      if (typeof response.data === 'string') {
        avatarUrl = response.data;
      }
      // 如果后端返回对象，包含url字段
      else if (response.data.url) {
        avatarUrl = response.data.url;
      }
      // 如果后端返回对象，包含avatarUrl字段
      else if (response.data.avatarUrl) {
        avatarUrl = response.data.avatarUrl;
      }
      // 如果后端返回对象，包含avatar字段
      else if (response.data.avatar) {
        avatarUrl = response.data.avatar;
      }
    }
    
    // 如果从响应中获取不到URL，尝试构建URL
    if (!avatarUrl && response.data && response.data.fileName) {
      avatarUrl = `${ENV_CONFIG.API_BASE_URL}/uploads/${response.data.fileName}`;
    }
    
    // 如果仍然没有URL，使用当前头像
    if (!avatarUrl) {
      avatarUrl = userStore.avatar || '';
    }
    
    console.log('更新头像URL:', avatarUrl); // 调试用
    
    // 更新头像显示
    avatar.value = avatarUrl;
    userForm.avatar = avatarUrl; // 更新表单中的头像
    
    // 更新用户存储中的头像
    userStore.setUserInfo({
      user_id: userStore.user_id,
      username: userStore.username,
      email: userStore.email,
      token: userStore.token,
      refresh_token: userStore.refresh_token,
      avatar: avatarUrl
    });
    
    ElMessage.success('头像上传成功');
  } else {
    ElMessage.error(response.msg || response.message || '头像上传失败');
  }
};

// 头像上传失败处理
const handleAvatarError = (error) => {
  console.error('头像上传失败:', error);
  ElMessage.error('头像上传失败，请重试');
};

// 头像上传进度处理
const handleAvatarProgress = (event) => {
  console.log('上传进度:', Math.round(event.percent) + '%');
};

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 构建要提交的数据
        const updateData = {
          id: parseInt(userForm.id),
          username: userForm.username,
          email: userForm.email,
          phone: userForm.phone,
          gender: parseInt(userForm.gender),
          avatar: userForm.avatar // 添加头像字段
        };
        
        // 如果填写了密码，则添加密码相关字段
        if (userForm.oldPassword && userForm.newPassword) {
          updateData.oldPassword = userForm.oldPassword;
          updateData.newPassword = userForm.newPassword;
        }
        
        const response = await request({
          url: '/user/update',
          method: 'post',
          data: updateData
        });
        
        if (response.code === 200) {
          ElMessage.success('个人信息更新成功');
          
          // 更新 store 中的用户信息
          const updatedUserInfo = {
            user_id: userStore.user_id,
            username: userForm.username,
            email: userForm.email,
            phone: userForm.phone,
            gender: parseInt(userForm.gender),
            token: userStore.token,
            refresh_token: userStore.refresh_token,
            avatar: userForm.avatar
          };
          userStore.setUserInfo(updatedUserInfo);
          
          // 清空密码字段
          userForm.oldPassword = '';
          userForm.newPassword = '';
          userForm.confirmPassword = '';
        } else {
          // 显示后端返回的错误信息
          ElMessage.error(response.msg || response.message || '更新失败');
        }
      } catch (error) {
        console.error('更新用户信息失败:', error);
        // 显示详细的错误信息
        if (error.response && error.response.data) {
          ElMessage.error(error.response.data.msg || '更新用户信息失败');
        } else {
          ElMessage.error('更新用户信息失败: ' + error.message);
        }
      }
    } else {
      ElMessage.warning('请正确填写表单');
      return false;
    }
  });
};

// 重置表单
const resetForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields();
    fetchUserInfo(); // 重新获取用户信息
  }
};

// 监听 userStore.avatar 的变化，确保头像同步
watch(() => userStore.avatar, (newAvatar) => {
  if (newAvatar) {
    avatar.value = newAvatar;
    userForm.avatar = newAvatar;
  }
}, { immediate: true });

onMounted(() => {
  userStore.checkLoginStatus(); // 检查用户登录状态
  fetchUserInfo(); // 获取用户信息
});
</script>

<style scoped>
.account-settings {
  animation: fadeIn 0.5s ease;
  width: 100%;
  max-width: none;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
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

.settings-content {
  width: 100%;
  max-width: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.avatar-section {
  margin-bottom: 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.avatar-container {
  display: flex;
  align-items: center;
  margin-top: 0;
}

.current-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.current-avatar:hover {
  transform: scale(1.05);
}

.avatar-actions {
  margin-left: 30px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

.info-section {
  margin-top: 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.user-form {
  width: 100%;
  max-width: none;
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

/* 响应式优化 */
@media (max-width: 768px) {
  .avatar-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .avatar-actions {
    margin-left: 0;
    margin-top: 20px;
  }
  
  .user-form {
    max-width: 100%;
  }
  
  .section-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .avatar-section {
    margin-bottom: 20px;
  }
  
  .info-section {
    margin-top: 20px;
  }
  
  .info-section h3 {
    font-size: 16px;
    margin-bottom: 15px;
  }
}
</style> 