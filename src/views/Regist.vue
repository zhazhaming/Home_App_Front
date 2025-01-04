<template>
  <div class="container">
    <div class="left-section">
      <h1>MY HOME</h1>
      <p>你想要的我都有~<br>加入我们吧</p>
      <img src="../../public/images/regist_index_pic.jpg" alt="Family Image">
    </div>
    <div class="right-section">
      <h2>注册</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" v-model="form.username" id="username" required>
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" v-model="form.password" id="password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input type="password" v-model="confirmPassword" id="confirmPassword" required>
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input type="email" v-model="form.email" id="email" required>
        </div>
        <div class="button-group">
          <button type="submit">注册</button>
          <button @click="goToLogin">返回登录</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
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
        alert('密码和确认密码不一致');
        return;
      }
      // 这里可以进行后端 API 调用
      try {
          const response = await axios.post(`${url}/user/regist`,form);
          console.log(response.data);
          if(response.data.code == 200) {
            alert('注册成功');
            router.push('/login'); // 注册成功后跳转到登录页面
          }
          else if(response.data.code >=400 && response.data.code < 500){
            alert("客户端请求错误");
          }
          else if (response.data.code >= 500) {
            alert('请求服务器错误，请联系管理员！！');
          }
          else {
            alert('注册失败');
          }
        } catch (error) {
          console.error("请求失败:", error);
        }
    };

    const goToLogin = () => {
      // 跳转到登录页面的逻辑
      router.push('/login'); // 使用 Vue Router 跳转
    };

    const validateEmail = () => {
      if (!emailRegex.test(form.email)) {
        alert('请输入有效的邮箱地址');
      }
    };

</script>

<style scoped>
/* 你的样式代码 */
.container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70vh;
    padding: 20px;
    background-color: #f5f5f5;
  }
  
  .left-section {
    flex: 1;
    max-width: 50%;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  }

  .right-section {
    flex: 1;
    max-width: 50%;
    text-align: left;
    padding: 20px;
    box-sizing: border-box;
  }
  
  .left-section h1 {
    font-size: 36px;
    margin-bottom: 10px;
  }
  
  .left-section p {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .left-section img {
    width: 100%;
    max-width: 300px;
    border-radius: 10px;
  }
  
  .right-section h2 {
    font-size: 28px;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: inline-block;
    font-size: 14px;
    margin-bottom: 5px;
    text-align: left;
    font-weight: bold;
  }
  
  .form-group input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  a {
    display: block;
    margin-top: 10px;
    color: #333;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
</style>