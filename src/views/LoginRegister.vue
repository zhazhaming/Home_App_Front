<template>
  <div class="login-container">
    <div class="login-card">
      <div class="left-section">
        <h1>MY HOME</h1>
        <p>欢迎回家~</p>
        <img src="../../public/images/home_index.jpg" alt="Home" />
      </div>
      <div class="right-section">
        <h2>登录/注册</h2>
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label for="username">用户名</label>
            <input v-model="use_data.username" type="text" id="username" name="username" placeholder="请输入用户名" />
          </div>
          <div class="input-group">
            <label for="password">密码</label>
            <input v-model="use_data.password" type="password" id="password" name="password" placeholder="请输入密码" />
          </div>
          <div class="button-group">
            <button type="submit" class="primary-btn">登录</button>
            <button type="button" @click="handleRegister" class="secondary-btn">注册</button>
          </div>
          <div class="other-login">
            <p>其他登录方式</p>
            <div class="social-icons">
              <img src="../../public/images/weixin.png" alt="WeChat" />
              <img src="../../public/images/qq.png" alt="QQ" />
              <img src="../../public/images/zhifubao.png" alt="Alipay" />
            </div>
          </div>
        </form>
      </div>
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
        router.push('/'); // 登录成功后跳转到首页
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
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: linear-gradient(to right, #667eea, #764ba2);
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.input-group input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
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
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
}

.secondary-btn {
  background-color: #f5f7fa;
  color: #555;
  border: 1px solid #ddd;
}

.primary-btn:hover {
  background: linear-gradient(to right, #5a6fd9, #6a3f9c);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.secondary-btn:hover {
  background-color: #eef0f5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.other-login {
  margin-top: 30px;
  text-align: center;
}

.other-login p {
  font-size: 14px;
  color: #777;
  margin-bottom: 15px;
  position: relative;
}

.other-login p:before, .other-login p:after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #ddd;
}

.other-login p:before {
  left: 0;
}

.other-login p:after {
  right: 0;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-icons img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 8px;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-icons img:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .login-card {
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
