<template>
  <div class="container">
    <div class="left-section">
      <h1>MY HOME</h1>
      <p>欢迎回家~</p>
      <img src="../../public/images/home_index.jpg" alt="Donut" />
    </div>
    <div class="right-section">
      <h2>登录/注册</h2>
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label for="username">用户名</label>
          <input v-model="use_data.username" type="text" id="username" name="username" />
        </div>
        <div class="input-group">
          <label for="password">密码</label>
          <input v-model="use_data.password" type="password" id="password" name="password" />
        </div>
        <div class="button-group">
          <button type="submit">确认</button>
          <button type="button" @click="handleRegister">注册</button>
        </div>
        <div class="other-login">
          <p>其他登录</p>
          <img src="../../public/images/weixin.png" alt="WeChat" />
          <img src="../../public/images/qq.png" alt="QQ" />
          <img src="../../public/images/zhifubao.png" alt="Alipay" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>

  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';

  const url = 'http://localhost:8100';

  const router = reactive(useRouter());
  const use_data = reactive({username: '', password: '', token: '',});
  
  // 登录/注册表单提交
  const handleSubmit = async () => {
    console.log('用户名:', use_data.username);
    console.log('密码:', use_data.password);
    try {
        const response = await axios.post(`${url}/user/login`,{
        nameoremail: use_data.username,
        password: use_data.password,
      });
      if(response.data.code == 200) {
        use_data.token = response.data.data.token;
        localStorage.setItem('user_token', use_data.token);
        console.log(use_data.token)
      }
      else if(response.data.code >=400 && response.data.code < 500){
          alert("客户端请求错误");
        }
      else if (response.data.code >= 500) {
        alert('请求服务器错误，请联系管理员！！');
      }
    } catch (error) {
      console.error("请求失败:", error);
    }
    };

  const handleRegister = () => {
    console.log('注册');
    router.push('/regist');
    console.log('跳转到/regist')
  };

</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
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
  width: 80px;
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
