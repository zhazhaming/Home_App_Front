<template>
  <div class="aichat-container">
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-chip">
            <SvgIcon name="spark" :size="22" fill />
          </div>
          <div class="logo-text">
            <h3>AI 助手</h3>
            <span>MY HOME · 智能伴侣</span>
          </div>
        </div>
        <el-button type="primary" size="small" @click="createConversation" class="new-chat-btn">
          <SvgIcon name="plus" :size="14" /> 新对话
        </el-button>
      </div>

      <el-input
        v-model="searchText"
        placeholder="搜索历史对话..."
        size="default"
        clearable
        class="sidebar-search"
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
          <div class="empty-icon"><SvgIcon name="chat" :size="34" /></div>
          <p>暂无对话记录</p>
        </div>
      </el-scrollbar>

      <div class="sidebar-footer">
        <el-button class="home-btn" @click="goHome">
          <SvgIcon name="home" :size="15" /> 返回首页
        </el-button>
      </div>
    </aside>

    <section class="chat-main">
      <header class="chat-header">
        <div class="header-left">
          <el-button class="back-home-btn" size="small" @click="goHome">
            <SvgIcon name="home" :size="14" /> 返回主页
          </el-button>
          <div class="chat-title">
            <h2>{{ currentTitle }}</h2>
            <span v-if="selectedConversationId" class="chat-status">在线</span>
          </div>
        </div>
        <div class="header-actions">
          <el-tooltip content="新对话" placement="bottom">
            <button class="icon-btn" @click="createConversation" aria-label="新对话">
              <SvgIcon name="plus" :size="16" />
            </button>
          </el-tooltip>
          <el-tooltip content="重命名对话" placement="bottom">
            <button class="icon-btn" @click="renameCurrent" :disabled="!selectedConversationId" aria-label="重命名对话">
              <SvgIcon name="edit" :size="15" />
            </button>
          </el-tooltip>
          <el-tooltip content="删除对话" placement="bottom">
            <button class="icon-btn danger" @click="deleteCurrent" :disabled="!selectedConversationId" aria-label="删除对话">
              <SvgIcon name="trash" :size="15" />
            </button>
          </el-tooltip>
        </div>
      </header>

      <div class="messages-wrapper" ref="messagesEl">
        <div v-if="messages.length === 0 && !isLoading" class="welcome-screen">
          <div class="welcome-chip">
            <SvgIcon name="spark" :size="40" fill />
          </div>
          <h3>你好！我是你的 AI 助手</h3>
          <p>有什么我可以帮助你的吗？</p>
          <div class="quick-prompts">
            <div class="prompt-card" @click="quickSend('帮我写一首诗')">
              <div class="prompt-icon tint-violet"><SvgIcon name="pen" :size="20" /></div>
              <div class="prompt-text">写首诗</div>
            </div>
            <div class="prompt-card" @click="quickSend('告诉我一个有趣的故事')">
              <div class="prompt-icon tint-blue"><SvgIcon name="book" :size="20" /></div>
              <div class="prompt-text">讲故事</div>
            </div>
            <div class="prompt-card" @click="quickSend('今天天气怎么样？')">
              <div class="prompt-icon tint-amber"><SvgIcon name="sun" :size="20" /></div>
              <div class="prompt-text">查天气</div>
            </div>
            <div class="prompt-card" @click="quickSend('帮我解决一个技术问题')">
              <div class="prompt-icon tint-emerald"><SvgIcon name="terminal" :size="20" /></div>
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
              <div v-if="m.role === 'ai'" class="avatar-chip">
                <SvgIcon name="spark" :size="18" fill />
              </div>
              <el-avatar v-else :size="38" :src="userStore.avatar">
                <SvgIcon name="user" :size="18" />
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
              <div class="avatar-chip">
                <SvgIcon name="spark" :size="18" fill />
              </div>
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
              <SvgIcon name="stop" :size="14" fill /> 停止
            </el-button>
            <el-button v-else type="primary" :disabled="!canSend" @click="send" class="send-btn">
              <SvgIcon name="send" :size="14" /> 发送
            </el-button>
          </div>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, h } from 'vue';
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
let abortController = null;

/* ========== 线性SVG图标集（跟随currentColor，无外部依赖） ========== */
const ICONS = {
  spark: '<path d="M12 2l2.35 7.3L22 12l-7.65 2.7L12 22l-2.35-7.3L2 12l7.65-2.7L12 2z"/>',
  home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><path d="M12 19h8"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
};

const SvgIcon = (props) => h('svg', {
  viewBox: '0 0 24 24',
  width: props.size || 18,
  height: props.size || 18,
  fill: props.fill ? 'currentColor' : 'none',
  stroke: props.fill ? 'none' : 'currentColor',
  'stroke-width': props.strokeWidth || 1.8,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  innerHTML: ICONS[props.name] || ''
});
SvgIcon.props = ['name', 'size', 'fill', 'strokeWidth'];

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
  grid-template-columns: 320px 1fr;
  height: 100vh;
  background: #eef1f6;
  overflow: hidden;
}

/* ========== 侧边栏（浅色极简风） ========== */
.chat-sidebar {
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

.sidebar-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

/* 渐变Logo芯片 */
.logo-chip {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.logo-text h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.5px;
}

.logo-text span {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.new-chat-btn {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.25s ease;
}

.new-chat-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.sidebar-search {
  padding: 14px 16px 10px;
  background: transparent;
}

/* 浅色主题下的搜索框 */
.sidebar-search :deep(.el-input__wrapper) {
  background: #f1f5f9;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  border-radius: 10px;
  transition: all 0.25s ease;
}

.sidebar-search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset;
  background: #ffffff;
}

.sidebar-search :deep(.el-input__inner) {
  color: #0f172a;
  height: 34px;
}

.sidebar-search :deep(.el-input__inner)::placeholder {
  color: #94a3b8;
}

.sidebar-search :deep(.el-input__suffix) {
  color: #94a3b8;
}

.conversation-list {
  flex: 1;
  padding: 4px 12px;
}

.conversation-item {
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.conversation-item:hover {
  background: #f1f5f9;
}

.conversation-item.active {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.conversation-content {
  margin-bottom: 6px;
}

.conversation-item .title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item.active .title {
  color: #4f46e5;
}

.conversation-item .preview {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.conversation-item .time {
  font-size: 11px;
  color: #cbd5e1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  color: #cbd5e1;
}

.empty-icon {
  color: #e2e8f0;
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}

.sidebar-footer {
  padding: 14px 16px;
  border-top: 1px solid #f1f5f9;
}

.home-btn {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  color: #475569 !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.home-btn:hover {
  color: #6366f1 !important;
  background: #eef2ff !important;
  border-color: #c7d2fe !important;
}

/* ========== 聊天主区域 ========== */
.chat-main {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-home-btn {
  color: #475569 !important;
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.back-home-btn:hover {
  color: #6366f1 !important;
  background: #eef2ff !important;
  border-color: #c7d2fe !important;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.chat-status {
  padding: 3px 10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  font-size: 11px;
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
  gap: 8px;
}

/* 圆形操作按钮（SVG图标） */
.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover:not(:disabled) {
  background: #eef2ff;
  color: #6366f1;
}

.icon-btn.danger {
  color: #ef4444;
  background: #fef2f2;
}

.icon-btn.danger:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ========== 消息区域 ========== */
.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 28px 24px;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: fadeIn 0.5s ease;
}

.welcome-chip {
  width: 76px;
  height: 76px;
  border-radius: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14px 34px rgba(99, 102, 241, 0.35);
  margin-bottom: 22px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.welcome-screen h3 {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.welcome-screen p {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 30px;
}

.quick-prompts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-width: 520px;
  width: 100%;
}

.prompt-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
}

.prompt-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px rgba(99, 102, 241, 0.16);
  border-color: #c7d2fe;
}

/* 图标底色芯片 */
.prompt-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tint-violet { background: #eef2ff; color: #6366f1; }
.tint-blue { background: #eff6ff; color: #3b82f6; }
.tint-amber { background: #fffbeb; color: #f59e0b; }
.tint-emerald { background: #ecfdf5; color: #10b981; }

.prompt-text {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.message-row {
  margin-bottom: 22px;
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

/* AI头像芯片 */
.avatar-chip {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.message-bubble {
  flex: 1;
  padding: 14px 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.message-row.user .message-bubble {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: transparent;
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
  color: #334155;
}

.message-row.user .sender-name {
  color: rgba(255, 255, 255, 0.92);
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
}

.message-row.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-content {
  line-height: 1.65;
  color: #1e293b;
  word-wrap: break-word;
  font-size: 14px;
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
  width: 9px;
  height: 9px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  padding: 16px 22px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
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
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.25s ease;
}

.message-input :deep(.el-textarea__inner):focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.send-btn {
  border-radius: 12px;
  height: 42px;
  padding: 0 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s ease;
}

.send-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.5;
}

.send-btn.el-button--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
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

  .message-container {
    max-width: 92%;
  }

  .quick-prompts {
    grid-template-columns: 1fr;
  }
}

/* ========== 滚动条美化 ========== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}
</style>
