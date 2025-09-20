<template>
  <div class="register-container">
    <div class="register-card">
      <div class="left-section">
        <h1>MY HOME</h1>
        <p>你想要的我都有~<br>加入我们吧</p>
        <img src="../../public/images/regist_index_pic.jpg" alt="Family Image">
      </div>
      <div class="right-section">
        <h2>创建账户</h2>
        <form @submit.prevent="register">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" v-model="form.username" id="username" placeholder="请输入用户名" required>
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" v-model="form.password" id="password" placeholder="请输入密码" required>
          </div>
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input type="password" v-model="confirmPassword" id="confirmPassword" placeholder="请再次输入密码" required>
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" v-model="form.email" id="email" placeholder="请输入邮箱地址" required>
          </div>
          <div class="button-group">
            <button type="submit" class="primary-btn">注册</button>
            <button @click="goToLogin" type="button" class="secondary-btn">返回登录</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const url = 'http://localhost:8100'
const router = useRouter();
const confirmPassword = ref('');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const form = reactive({
  username: '',
  password: '',
  email: ''
});

const register = async() => {
  // 注册逻辑，例如表单验证和提交
  if (form.password !== confirmPassword.value) {
    ElMessage.error('密码和确认密码不一致');
    return;
  }
  
  if (!emailRegex.test(form.email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }
  
  // 这里可以进行后端 API 调用
  try {
    const response = await axios.post(`${url}/user/regist`, form);
    console.log(response.data);
    if(response.data.code == 200) {
      ElMessage.success('注册成功');
      router.push('/login'); // 注册成功后跳转到登录页面
    }
    else {
      // 使用 ElMessage 显示服务器返回的错误信息
      ElMessage.error(response.data.msg || '注册失败，请稍后再试');
    }
  } catch (error) {
    console.error("请求失败:", error);
    ElMessage.error('网络错误，请检查您的网络连接');
  }
};

const goToLogin = () => {
  // 跳转到登录页面的逻辑
  router.push('/login'); // 使用 Vue Router 跳转
};
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.register-card {
  display: flex;
  width: 900px;
  max-width: 95%;
  background-color: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.left-section {
  flex: 1;
  padding: 40px;
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-section h1 {
  font-size: 36px;
  margin-bottom: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}

.left-section p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
}

.left-section img {
  width: 80%;
  max-width: 250px;
  border-radius: 15px;
  margin: 0 auto;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.left-section img:hover {
  transform: scale(1.05);
}

.right-section {
  flex: 1;
  padding: 40px;
  background-color: white;
}

.right-section h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.right-section h2:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(to right, #43cea2, #185a9d);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #43cea2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(67, 206, 162, 0.2);
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.primary-btn, .secondary-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(to right, #43cea2, #185a9d);
  color: white;
}

.secondary-btn {
  background-color: #f5f7fa;
  color: #555;
  border: 1px solid #ddd;
}

.primary-btn:hover {
  background: linear-gradient(to right, #3ab795, #14508c);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(67, 206, 162, 0.4);
}

.secondary-btn:hover {
  background-color: #eef0f5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .register-card {
    flex-direction: column;
  }
  
  .left-section, .right-section {
    padding: 30px;
  }
  
  .left-section img {
    max-width: 200px;
    margin-bottom: 20px;
  }
}
</style>