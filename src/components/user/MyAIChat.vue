<template>
    <div class="ai-chat">
      <h2 class="section-title">我的AI Chat</h2>
      
      <div class="chat-container">
        <div class="chat-history">
          <div class="history-header">
            <h3>历史对话</h3>
            <el-button type="primary" size="small" @click="createNewChat">新建对话</el-button>
          </div>
          
          <div class="history-list">
            <el-empty v-if="chatHistory.length === 0" description="暂无对话历史"></el-empty>
            
            <div 
              v-for="chat in chatHistory" 
              :key="chat.id" 
              class="history-item"
              :class="{ 'active': selectedChatId === chat.id }"
              @click="selectChat(chat.id)"
            >
              <div class="history-title">
                <span>{{ chat.title || '新对话' }}</span>
                <span class="history-date">{{ formatDate(chat.createdAt) }}</span>
              </div>
              <div class="history-preview">{{ chat.preview }}</div>
              <div class="history-actions">
                <el-button 
                  type="text" 
                  size="small" 
                  @click.stop="renameChat(chat)"
                  class="action-btn"
                >
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button 
                  type="text" 
                  size="small" 
                  @click.stop="deleteChat(chat.id)"
                  class="action-btn delete-btn"
                >
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-main">
          <div v-if="!selectedChatId" class="empty-chat">
            <el-empty description="选择一个对话或创建新对话">
              <el-button type="primary" @click="createNewChat">新建对话</el-button>
            </el-empty>
          </div>
          
          <template v-else>
            <div class="chat-messages" ref="messagesContainer">
              <div v-for="(message, index) in currentMessages" :key="index" class="message-item" :class="message.role">
                <div class="message-avatar">
                  <el-avatar :size="40" :src="message.role === 'user' ? userStore.avatar : aiAvatar"></el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-text" v-html="formatMessage(message.content)"></div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
              
              <div v-if="isLoading" class="message-item ai">
                <div class="message-avatar">
                  <el-avatar :size="40" :src="aiAvatar"></el-avatar>
                </div>
                <div class="message-content">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="chat-input">
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="3"
                placeholder="输入消息..."
                @keydown.enter.prevent="sendMessage"
              ></el-input>
              <div class="input-actions">
                <el-button type="primary" @click="sendMessage" :disabled="!messageInput.trim() || isLoading">
                  发送
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { useUserStore } from '../../stores/userStore';
import marked from 'marked';
import DOMPurify from 'dompurify';

const userStore = useUserStore();
const aiAvatar = 'https://example.com/ai-avatar.png'; // AI头像URL

// 聊天历史
const chatHistory = ref([]);
const selectedChatId = ref(null);
const currentMessages = ref([]);
const messageInput = ref('');
const isLoading = ref(false);
const messagesContainer = ref(null);

// 获取聊天历史
const fetchChatHistory = async () => {
  try {
    const response = await axios.get('http://localhost:8100/ai-chat/history', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      chatHistory.value = response.data.data;
    } else {
      ElMessage.error('获取聊天历史失败');
    }
  } catch (error) {
    console.error('获取聊天历史出错:', error);
    ElMessage.error('获取聊天历史出错');
  }
};

// 获取特定对话的消息
const fetchChatMessages = async (chatId) => {
  try {
    const response = await axios.get(`http://localhost:8100/ai-chat/messages/${chatId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      currentMessages.value = response.data.data;
      scrollToBottom();
    } else {
      ElMessage.error('获取对话消息失败');
    }
  } catch (error) {
    console.error('获取对话消息出错:', error);
    ElMessage.error('获取对话消息出错');
  }
};

// 创建新对话
const createNewChat = async () => {
  try {
    const response = await axios.post('http://localhost:8100/ai-chat/create', {}, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      const newChat = response.data.data;
      chatHistory.value.unshift(newChat);
      selectChat(newChat.id);
      ElMessage.success('创建新对话成功');
    } else {
      ElMessage.error('创建新对话失败');
    }
  } catch (error) {
    console.error('创建新对话出错:', error);
    ElMessage.error('创建新对话出错');
  }
};

// 选择对话
const selectChat = (chatId) => {
  selectedChatId.value = chatId;
  fetchChatMessages(chatId);
};

// 重命名对话
const renameChat = async (chat) => {
  try {
    const { value: newTitle } = await ElMessageBox.prompt('请输入新的对话标题', '重命名对话', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: chat.title || '',
      inputValidator: (value) => {
        if (!value.trim()) {
          return '标题不能为空';
        }
        return true;
      }
    });
    
    if (newTitle && newTitle.trim() !== chat.title) {
      const response = await axios.put(`http://localhost:8100/ai-chat/rename/${chat.id}`, {
        title: newTitle.trim()
      }, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      
      if (response.data.code === 200) {
        const index = chatHistory.value.findIndex(item => item.id === chat.id);
        if (index !== -1) {
          chatHistory.value[index].title = newTitle.trim();
        }
        ElMessage.success('重命名成功');
      } else {
        ElMessage.error('重命名失败');
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重命名对话出错:', error);
      ElMessage.error('重命名对话出错');
    }
  }
};

// 删除对话
const deleteChat = async (chatId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个对话吗？此操作不可恢复。', '删除对话', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const response = await axios.delete(`http://localhost:8100/ai-chat/delete/${chatId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      chatHistory.value = chatHistory.value.filter(chat => chat.id !== chatId);
      if (selectedChatId.value === chatId) {
        selectedChatId.value = null;
        currentMessages.value = [];
      }
      ElMessage.success('删除成功');
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除对话出错:', error);
      ElMessage.error('删除对话出错');
    }
  }
};

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || isLoading.value) return;
  
  const message = messageInput.value.trim();
  messageInput.value = '';
  
  // 添加用户消息到当前对话
  currentMessages.value.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
  
  scrollToBottom();
  isLoading.value = true;
  
  try {
    const response = await axios.post(`http://localhost:8100/ai-chat/message/${selectedChatId.value}`, {
      content: message
    }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    
    if (response.data.code === 200) {
      // 添加AI回复到当前对话
      currentMessages.value.push({
        role: 'ai',
        content: response.data.data.content,
        timestamp: new Date().toISOString()
      });
      
      // 更新对话预览
      const chatIndex = chatHistory.value.findIndex(chat => chat.id === selectedChatId.value);
      if (chatIndex !== -1) {
        chatHistory.value[chatIndex].preview = message;
        
        // 如果是第一条消息，自动设置对话标题
        if (!chatHistory.value[chatIndex].title && currentMessages.value.length <= 2) {
          const title = message.length > 20 ? message.substring(0, 20) + '...' : message;
          chatHistory.value[chatIndex].title = title;
        }
      }
      
      scrollToBottom();
    } else {
      ElMessage.error('发送消息失败');
    }
  } catch (error) {
    console.error('发送消息出错:', error);
    ElMessage.error('发送消息出错');
    
    // 添加错误消息
    currentMessages.value.push({
      role: 'ai',
      content: '抱歉，发生了错误，请稍后再试。',
      timestamp: new Date().toISOString()
    });
  } finally {
    isLoading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
};

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 格式化消息内容（支持Markdown）
const formatMessage = (content) => {
  return DOMPurify.sanitize(marked(content));
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(() => {
  fetchChatHistory();
});
</script>

<style scoped>
.ai-chat {
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

.chat-container {
  display: flex;
  height: calc(100vh - 200px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-history {
  width: 300px;
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.history-item:hover {
  background-color: #ecf5ff;
}

.history-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.history-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.history-title span {
  font-weight: 500;
  color: #333;
}

.history-date {
  font-size: 12px;
  color: #909399;
}

.history-preview {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: none;
}

.history-item:hover .history-actions {
  display: flex;
}

.action-btn {
  padding: 2px;
}

.delete-btn {
  color: #f56c6c;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.empty-chat {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  max-width: 80%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  background-color: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
}

.message-item.user .message-content {
  background-color: #ecf5ff;
}

.message-item.ai .message-content {
  background-color: #f5f7fa;
}

.message-text {
  color: #333;
  line-height: 1.5;
}

.message-text p {
  margin: 0 0 10px 0;
}

.message-text p:last-child {
  margin-bottom: 0;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #a0cfff;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #e6e6e6;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
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

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    height: auto;
  }
  
  .chat-history {
    width: 100%;
    height: 300px;
  }
  
  .chat-main {
    height: calc(100vh - 500px);
  }
  
  .message-item {
    max-width: 90%;
  }
}
</style>