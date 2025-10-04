<template>
  <div class="aichat-container">
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-icon">🤖</div>
          <h3>AI 助手</h3>
        </div>
        <el-button type="primary" size="small" @click="createConversation" class="new-chat-btn">
          <i class="el-icon-plus"></i> 新对话
        </el-button>
      </div>

      <el-input
        v-model="searchText"
        placeholder="搜索历史对话..."
        size="default"
        clearable
        class="sidebar-search"
        prefix-icon="el-icon-search"
      />

      <el-scrollbar class="conversation-list">
        <div
          v-for="c in filteredConversations"
          :key="c.id"
          class="conversation-item"
          :class="{ active: c.id === selectedConversationId }"
          @click="selectConversation(c.id)"
        >
          <div class="conversation-content">
            <div class="title">{{ c.title || '新对话' }}</div>
            <div class="preview">{{ c.preview || '开始新的对话...' }}</div>
          </div>
          <div class="time">{{ formatDateTime(c.updatedAt || c.createdAt) }}</div>
        </div>

        <div v-if="filteredConversations.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <p>暂无对话记录</p>
        </div>
      </el-scrollbar>

      <div class="sidebar-footer">
        <el-button class="home-btn" @click="goHome" plain>
          <i class="el-icon-house"></i> 返回首页
        </el-button>
      </div>
    </aside>

    <section class="chat-main">
      <header class="chat-header">
        <div class="header-left">
          <div class="chat-title">
            <h2>{{ currentTitle }}</h2>
            <span v-if="selectedConversationId" class="chat-status">在线</span>
          </div>
        </div>
        <div class="header-actions">
          <el-tooltip content="重命名对话" placement="bottom">
            <el-button circle size="small" @click="renameCurrent" :disabled="!selectedConversationId">
              <i class="el-icon-edit"></i>
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除对话" placement="bottom">
            <el-button circle size="small" type="danger" @click="deleteCurrent" :disabled="!selectedConversationId">
              <i class="el-icon-delete"></i>
            </el-button>
          </el-tooltip>
        </div>
      </header>

      <div class="messages-wrapper" ref="messagesEl">
        <div v-if="messages.length === 0 && !isLoading" class="welcome-screen">
          <div class="welcome-icon">✨</div>
          <h3>你好！我是你的 AI 助手</h3>
          <p>有什么我可以帮助你的吗？</p>
          <div class="quick-prompts">
            <div class="prompt-card" @click="quickSend('帮我写一首诗')">
              <div class="prompt-icon">✍️</div>
              <div class="prompt-text">写首诗</div>
            </div>
            <div class="prompt-card" @click="quickSend('告诉我一个有趣的故事')">
              <div class="prompt-icon">📖</div>
              <div class="prompt-text">讲故事</div>
            </div>
            <div class="prompt-card" @click="quickSend('今天天气怎么样？')">
              <div class="prompt-icon">🌤️</div>
              <div class="prompt-text">查天气</div>
            </div>
            <div class="prompt-card" @click="quickSend('帮我解决一个技术问题')">
              <div class="prompt-icon">💻</div>
              <div class="prompt-text">技术支持</div>
            </div>
          </div>
        </div>

        <div
          v-for="(m, i) in messages"
          :key="i"
          class="message-row"
          :class="m.role"
        >
          <div class="message-container">
            <div class="message-avatar">
              <el-avatar :size="40" :src="m.role === 'user' ? userStore.avatar : aiAvatar">
                <span v-if="m.role === 'ai'">🤖</span>
              </el-avatar>
            </div>
            <div class="message-bubble">
              <div class="message-header">
                <span class="sender-name">{{ m.role === 'user' ? '你' : 'AI 助手' }}</span>
                <span class="message-time">{{ formatTime(m.timestamp) }}</span>
              </div>
              <div class="message-content" v-html="formatMessage(m.content)"></div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="message-row ai">
          <div class="message-container">
            <div class="message-avatar">
              <el-avatar :size="40" :src="aiAvatar">🤖</el-avatar>
            </div>
            <div class="message-bubble">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="composer">
        <div class="composer-container">
          <el-input
            v-model="input"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            @keydown.enter.exact.prevent="send"
            class="message-input"
          />
          <div class="composer-actions">
            <el-button v-if="isLoading" type="warning" @click="cancelGenerating" class="send-btn">
              <i class="el-icon-video-pause"></i> 停止
            </el-button>
            <el-button v-else type="primary" :disabled="!canSend" @click="send" class="send-btn">
              <i class="el-icon-s-promotion"></i> 发送
            </el-button>
          </div>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ENV_CONFIG } from '../../config/env';
import { useUserStore } from '../../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const conversations = ref([]);
const selectedConversationId = ref(null);
const messages = ref([]);
const input = ref('');
const isLoading = ref(false);
const messagesEl = ref(null);
const searchText = ref('');
const aiAvatar = 'https://unpkg.com/ionicons@5.5.2/dist/svg/planet-outline.svg';
let abortController = null;

const filteredConversations = computed(() => {
  if (!searchText.value.trim()) return conversations.value;
  const q = searchText.value.trim().toLowerCase();
  return conversations.value.filter(c =>
    (c.title || '新对话').toLowerCase().includes(q) ||
    (c.preview || '').toLowerCase().includes(q)
  );
});

const currentTitle = computed(() => {
  const c = conversations.value.find(v => v.id === selectedConversationId.value);
  return c?.title || '新对话';
});

const canSend = computed(() => input.value.trim() && selectedConversationId.value && !isLoading.value);

const authHeaders = () => ({
  Authorization: userStore?.token ? `Bearer ${userStore.token}` : undefined
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
};

const formatMessage = (content) => {
  const escaped = String(content || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return escaped.replace(/\n/g, '<br/>');
};

const formatDateTime = (s) => {
  if (!s) return '';
  const d = new Date(s);
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatTime = (s) => {
  const d = new Date(s);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const loadConversations = async () => {
  try {
    const { data } = await axios.get(`${ENV_CONFIG.API_BASE_URL}/ai-chat/history`, { headers: authHeaders() });
    if (data?.code === 200) {
      conversations.value = data.data || [];
    } else {
      conversations.value = [];
    }
  } catch {
    conversations.value = [];
  }
};

const loadMessages = async (id) => {
  try {
    const { data } = await axios.get(`${ENV_CONFIG.API_BASE_URL}/ai-chat/messages/${id}`, { headers: authHeaders() });
    if (data?.code === 200) {
      messages.value = data.data || [];
    } else {
      messages.value = [];
    }
  } catch {
    messages.value = [];
  } finally {
    scrollToBottom();
  }
};

const selectConversation = async (id) => {
  if (selectedConversationId.value === id) return;
  selectedConversationId.value = id;
  await loadMessages(id);
};

const createConversation = async () => {
  try {
    const { data } = await axios.post(`${ENV_CONFIG.API_BASE_URL}/ai-chat/create`, {}, { headers: authHeaders() });
    if (data?.code === 200) {
      const c = data.data;
      conversations.value.unshift(c);
      await selectConversation(c.id);
      ElMessage.success('已创建新对话');
    } else {
      ElMessage.error('创建失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('创建对话失败');
  }
};

const renameCurrent = async () => {
  if (!selectedConversationId.value) return;
  try {
    const { value } = await ElMessageBox.prompt('输入新的对话名', '重命名', { confirmButtonText: '确定', cancelButtonText: '取消' });
    if (!value || !value.trim()) return;
    const title = value.trim();
    const { data } = await axios.put(`${ENV_CONFIG.API_BASE_URL}/ai-chat/rename/${selectedConversationId.value}`, { title }, { headers: authHeaders() });
    if (data?.code === 200) {
      const c = conversations.value.find(v => v.id === selectedConversationId.value);
      if (c) c.title = title;
      ElMessage.success('已重命名');
    } else {
      ElMessage.error('重命名失败');
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('重命名失败');
  }
};

const deleteCurrent = async () => {
  if (!selectedConversationId.value) return;
  try {
    await ElMessageBox.confirm('确定删除当前对话？此操作不可恢复', '删除对话', { type: 'warning' });
    const id = selectedConversationId.value;
    const { data } = await axios.delete(`${ENV_CONFIG.API_BASE_URL}/ai-chat/delete/${id}`, { headers: authHeaders() });
    if (data?.code === 200) {
      conversations.value = conversations.value.filter(v => v.id !== id);
      selectedConversationId.value = null;
      messages.value = [];
      ElMessage.success('已删除');
    } else {
      ElMessage.error('删除失败');
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

const send = async () => {
  if (!canSend.value) return;
  const content = input.value.trim();
  input.value = '';

  messages.value.push({ role: 'user', content, timestamp: new Date().toISOString() });
  scrollToBottom();

  isLoading.value = true;
  abortController = new AbortController();
  try {
    const { data } = await axios.post(
      `${ENV_CONFIG.API_BASE_URL}/ai-chat/message/${selectedConversationId.value}`,
      { content },
      { headers: authHeaders(), signal: abortController.signal }
    );
    const answer = data?.code === 200 ? (data.data?.content || '（无回复内容）') : '抱歉，发送失败了';
    messages.value.push({ role: 'ai', content: answer, timestamp: new Date().toISOString() });

    const c = conversations.value.find(v => v.id === selectedConversationId.value);
    if (c) {
      c.preview = content;
      if (!c.title) c.title = content.length > 20 ? content.slice(0, 20) + '...' : content;
      c.updatedAt = new Date().toISOString();
    }
  } catch (e) {
    if (axios.isCancel?.(e)) return;
    console.error(e);
    messages.value.push({ role: 'ai', content: '抱歉，发生了错误，请稍后重试。', timestamp: new Date().toISOString() });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

const cancelGenerating = () => {
  try { abortController?.abort(); } catch {}
  isLoading.value = false;
};

const goHome = () => {
  router.push('/');
};

const quickSend = async (text) => {
  if (!selectedConversationId.value) {
    await createConversation();
  }
  input.value = text;
  await send();
};

onMounted(async () => {
  await loadConversations();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.aichat-container {
  display: grid;
  grid-template-columns: 340px 1fr;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* ========== 侧边栏样式 ========== */
.chat-sidebar {
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 32px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.logo-section h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #fff 0%, #a5b4fc 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.new-chat-btn {
  width: 100%;
  border-radius: 10px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.new-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.sidebar-search {
  padding: 10px 16px;
  background: transparent;
}

.sidebar-search :deep(.el-input__inner) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.sidebar-search :deep(.el-input__inner):focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #667eea;
}

.sidebar-search :deep(.el-input__inner)::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.conversation-list {
  flex: 1;
  padding: 10px 16px;
}

.conversation-item {
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.05);
}

.conversation-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.conversation-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.conversation-content {
  margin-bottom: 8px;
}

.conversation-item .title {
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
  font-size: 14px;
}

.conversation-item .preview {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-item .time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.home-btn {
  width: 100%;
  border-radius: 10px;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #667eea;
  transform: translateY(-2px);
}

/* ========== 聊天主区域 ========== */
.chat-main {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px 0 0 20px;
  overflow: hidden;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
}

.chat-status {
  padding: 4px 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 600;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* ========== 消息区域 ========== */
.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 30px 24px;
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: fadeIn 0.5s ease;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.welcome-screen h3 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 12px;
}

.welcome-screen p {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 30px;
}

.quick-prompts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 600px;
}

.prompt-card {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.prompt-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.prompt-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.prompt-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.message-row {
  margin-bottom: 24px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-container {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-row.user .message-container {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-bubble {
  flex: 1;
  padding: 16px 20px;
  border-radius: 16px;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-row.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sender-name {
  font-weight: 700;
  font-size: 13px;
  color: #374151;
}

.message-row.user .sender-name {
  color: rgba(255, 255, 255, 0.9);
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
}

.message-row.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-content {
  line-height: 1.6;
  color: #1f2937;
  word-wrap: break-word;
}

.message-row.user .message-content {
  color: #fff;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
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
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ========== 输入区域 ========== */
.composer {
  padding: 20px 24px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

.composer-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-textarea__inner) {
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.message-input :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.send-btn {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ========== 响应式设计 ========== */
@media (max-width: 900px) {
  .aichat-container {
    grid-template-columns: 1fr;
  }
  
  .chat-sidebar {
    display: none;
  }

  .chat-main {
    border-radius: 0;
  }

  .message-container {
    max-width: 90%;
  }

  .quick-prompts {
    grid-template-columns: 1fr;
  }
}

/* ========== 滚动条美化 ========== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%);
}
</style>


