# MY HOME 项目部署指南

## 📋 目录
- [环境要求](#环境要求)
- [本地构建](#本地构建)
- [服务器配置](#服务器配置)
- [部署方法](#部署方法)
- [常见问题](#常见问题)
- [维护指南](#维护指南)

## 🔧 环境要求

### 本地开发环境
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### 服务器环境
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Nginx >= 1.18
- 至少 1GB RAM
- 至少 10GB 存储空间

## 🏗️ 本地构建

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建环境配置文件：
```bash
# 开发环境
cp .env.example .env.local

# 生产环境
cp .env.example .env.production
```

编辑 `.env.production` 文件：
```env
VITE_APP_TITLE=MY HOME
VITE_API_BASE_URL=https://your-domain.com/api
VITE_UPLOAD_URL=https://your-domain.com/api/files/uploadPic
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
```

### 3. 构建项目
```bash
# 生产环境构建
npm run build:prod

# 普通构建
npm run build

# 构建并分析包大小
npm run build:analyze
```

### 4. 本地预览
```bash
npm run preview
```

## 🖥️ 服务器配置

### 1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
# 或者
sudo dnf install nginx
```

### 2. 配置防火墙
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 创建项目目录
```bash
sudo mkdir -p /var/www/home-web
sudo chown -R $USER:$USER /var/www/home-web
```

## 🚀 部署方法

### 方法一：使用自动化脚本（推荐）

1. **准备部署脚本**
```bash
chmod +x deploy.sh
```

2. **执行部署**
```bash
./deploy.sh production user@your-server.com
```

### 方法二：手动部署

1. **上传构建文件**
```bash
# 构建项目
npm run build:prod

# 上传到服务器
scp -r dist/* user@your-server.com:/var/www/home-web/
```

2. **配置 Nginx**
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/home-web

# 启用站点
sudo ln -s /etc/nginx/sites-available/home-web /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

3. **设置权限**
```bash
sudo chown -R www-data:www-data /var/www/home-web
sudo chmod -R 755 /var/www/home-web
```

### 方法三：使用 Docker（可选）

1. **构建 Docker 镜像**
```bash
docker build -t home-web:latest .
```

2. **运行容器**
```bash
docker run -d \
  --name home-web \
  -p 80:80 \
  -p 443:443 \
  home-web:latest
```

3. **使用 Docker Compose**
```bash
docker-compose up -d
```

## 🔒 HTTPS 配置（可选）

### 使用 Let's Encrypt
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

### 手动配置 SSL
1. 将证书文件放在 `/etc/nginx/ssl/` 目录
2. 更新 `nginx.conf` 中的 SSL 配置
3. 重启 Nginx

## 📊 性能优化

### 1. 启用 Gzip 压缩
已在 `nginx.conf` 中配置

### 2. 设置缓存策略
已在 `nginx.conf` 中配置静态资源缓存

### 3. CDN 配置（可选）
```javascript
// 在 vite.config.js 中配置 CDN
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'element-plus': 'ElementPlus'
        }
      }
    }
  }
})
```

## 🔍 监控和日志

### 1. 查看访问日志
```bash
sudo tail -f /var/log/nginx/home-web.access.log
```

### 2. 查看错误日志
```bash
sudo tail -f /var/log/nginx/home-web.error.log
```

### 3. 监控系统资源
```bash
# 查看 Nginx 状态
sudo systemctl status nginx

# 查看端口占用
sudo netstat -tlnp | grep :80
```

## ❗ 常见问题

### 1. 404 错误（Vue Router History 模式）
**问题**: 刷新页面或直接访问路由时出现 404
**解决**: 确保 Nginx 配置中有 `try_files $uri $uri/ /index.html;`

### 2. API 请求跨域问题
**问题**: 前端无法请求后端 API
**解决**: 检查 Nginx 配置中的代理设置和 CORS 配置

### 3. 静态资源加载失败
**问题**: CSS、JS 文件 404
**解决**: 检查 Nginx 根目录配置和文件权限

### 4. 上传文件大小限制
**问题**: 文件上传失败
**解决**: 在 Nginx 配置中添加 `client_max_body_size 10M;`

### 5. 内存不足
**问题**: 构建过程中内存不足
**解决**: 增加 Node.js 内存限制
```bash
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build:prod
```

## 🔄 维护指南

### 1. 定期备份
```bash
# 备份网站文件
sudo tar -czf /backup/home-web-$(date +%Y%m%d).tar.gz /var/www/home-web

# 备份 Nginx 配置
sudo cp /etc/nginx/sites-available/home-web /backup/
```

### 2. 更新部署
```bash
# 使用脚本更新
./deploy.sh production user@your-server.com

# 或者手动更新
npm run build:prod
scp -r dist/* user@your-server.com:/var/www/home-web/
```

### 3. 回滚版本
```bash
# 在服务器上
sudo cp -r /var/www/home-web/backup/backup_YYYYMMDD_HHMMSS/* /var/www/home-web/current/
sudo systemctl reload nginx
```

### 4. 清理旧版本
```bash
# 保留最近5个版本
cd /var/www/home-web/backup
ls -t | tail -n +6 | xargs -d '\n' rm -rf --
```

## 📞 技术支持

如果遇到部署问题，请检查：
1. 服务器日志：`/var/log/nginx/home-web.error.log`
2. 系统日志：`sudo journalctl -u nginx`
3. 网络连接：`curl -I http://your-domain.com`
4. DNS 解析：`nslookup your-domain.com`

---

## 🎉 部署完成检查清单

- [ ] 项目成功构建
- [ ] 文件上传到服务器
- [ ] Nginx 配置正确
- [ ] 网站可以访问
- [ ] API 代理工作正常
- [ ] 静态资源加载正常
- [ ] Vue Router 路由正常
- [ ] HTTPS 配置（如果需要）
- [ ] 监控和日志配置
- [ ] 备份策略设置

恭喜！你的 MY HOME 项目已成功部署！ 🎊
