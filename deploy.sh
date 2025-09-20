#!/bin/bash

# MY HOME 项目部署脚本
# 使用方法: ./deploy.sh [环境] [服务器地址]
# 例如: ./deploy.sh production user@your-server.com

set -e  # 遇到错误立即退出

# 配置变量
PROJECT_NAME="home-web"
BUILD_DIR="dist"
REMOTE_DIR="/var/www/home-web"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/home-web"
NGINX_ENABLED_PATH="/etc/nginx/sites-enabled/home-web"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查参数
if [ $# -lt 2 ]; then
    print_message $RED "使用方法: $0 [环境] [服务器地址]"
    print_message $YELLOW "例如: $0 production user@your-server.com"
    exit 1
fi

ENVIRONMENT=$1
SERVER=$2

print_message $BLUE "🚀 开始部署 $PROJECT_NAME 到 $ENVIRONMENT 环境..."
print_message $BLUE "目标服务器: $SERVER"

# 步骤1: 安装依赖
print_message $YELLOW "📦 安装依赖..."
npm install

# 步骤2: 构建项目
print_message $YELLOW "🔨 构建项目..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build:prod
else
    npm run build
fi

# 检查构建是否成功
if [ ! -d "$BUILD_DIR" ]; then
    print_message $RED "❌ 构建失败，未找到 $BUILD_DIR 目录"
    exit 1
fi

print_message $GREEN "✅ 构建完成"

# 步骤3: 创建部署包
print_message $YELLOW "📦 创建部署包..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_PACKAGE="${PROJECT_NAME}_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"

tar -czf "$DEPLOY_PACKAGE" -C "$BUILD_DIR" .
print_message $GREEN "✅ 部署包创建完成: $DEPLOY_PACKAGE"

# 步骤4: 上传到服务器
print_message $YELLOW "🚀 上传文件到服务器..."
scp "$DEPLOY_PACKAGE" "$SERVER:/tmp/"
scp "nginx.conf" "$SERVER:/tmp/home-web-nginx.conf"

# 步骤5: 在服务器上执行部署
print_message $YELLOW "🔧 在服务器上执行部署..."
ssh "$SERVER" << EOF
    set -e
    
    echo "创建项目目录..."
    sudo mkdir -p $REMOTE_DIR
    sudo mkdir -p $REMOTE_DIR/backup
    
    echo "备份现有文件..."
    if [ -d "$REMOTE_DIR/current" ]; then
        sudo mv $REMOTE_DIR/current $REMOTE_DIR/backup/backup_$TIMESTAMP
    fi
    
    echo "解压新文件..."
    sudo mkdir -p $REMOTE_DIR/current
    sudo tar -xzf /tmp/$DEPLOY_PACKAGE -C $REMOTE_DIR/current
    
    echo "设置文件权限..."
    sudo chown -R www-data:www-data $REMOTE_DIR
    sudo chmod -R 755 $REMOTE_DIR
    
    echo "更新Nginx配置..."
    sudo cp /tmp/home-web-nginx.conf $NGINX_CONFIG_PATH
    
    # 启用站点
    if [ ! -L "$NGINX_ENABLED_PATH" ]; then
        sudo ln -s $NGINX_CONFIG_PATH $NGINX_ENABLED_PATH
    fi
    
    echo "测试Nginx配置..."
    sudo nginx -t
    
    echo "重载Nginx..."
    sudo systemctl reload nginx
    
    echo "清理临时文件..."
    rm -f /tmp/$DEPLOY_PACKAGE
    rm -f /tmp/home-web-nginx.conf
    
    echo "✅ 部署完成!"
EOF

# 步骤6: 清理本地文件
print_message $YELLOW "🧹 清理本地临时文件..."
rm -f "$DEPLOY_PACKAGE"

# 步骤7: 健康检查
print_message $YELLOW "🏥 执行健康检查..."
DOMAIN=$(echo "$SERVER" | cut -d'@' -f2)
if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" | grep -q "200"; then
    print_message $GREEN "✅ 网站访问正常"
else
    print_message $YELLOW "⚠️  网站可能需要一些时间来启动，请稍后检查"
fi

print_message $GREEN "🎉 部署完成!"
print_message $BLUE "访问地址: http://$DOMAIN"
print_message $YELLOW "如果使用了自定义域名，请确保DNS已正确配置"
