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
              action="http://localhost:8100/user/upload-avatar"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../../stores/userStore';
import request from '../../utils/request';

const userStore = useUserStore();
const avatar = ref(userStore.avatar);
const userFormRef = ref(null);

// 上传头像的请求头
const uploadHeaders = {
  Authorization: `Bearer ${userStore.token}`
};

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
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败: ' + (error.response?.data?.msg || error.message));
  }
};

// 头像上传成功处理
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    avatar.value = response.data.avatarUrl;
    userForm.avatar = response.data.avatarUrl; // 更新表单中的头像
    userStore.setUserInfo({
      ...userStore,
      avatar: response.data.avatarUrl
    });
    ElMessage.success('头像上传成功');
  } else {
    ElMessage.error(response.message || '头像上传失败');
  }
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
            ...userStore.$state,
            username: userForm.username,
            avatar: userForm.avatar,
            phone: userForm.phone,
            email: userForm.email,
            gender: parseInt(userForm.gender)
          };
          userStore.setUserInfo(updatedUserInfo);
          
          // 同时更新localStorage中的用户信息
          localStorage.setItem('user_info', JSON.stringify(updatedUserInfo));
          
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

onMounted(() => {
  // 确保用户信息已加载
  userStore.checkLoginStatus();
  fetchUserInfo();
});
</script>

<style scoped>
.account-settings {
  animation: fadeIn 0.5s ease;
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
  max-width: 800px;
}

.avatar-section {
  margin-bottom: 30px;
}

.avatar-container {
  display: flex;
  align-items: center;
  margin-top: 20px;
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
  margin-top: 30px;
}

.info-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.user-form {
  max-width: 500px;
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
</style> 