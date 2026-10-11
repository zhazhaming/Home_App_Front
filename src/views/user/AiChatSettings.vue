<template>
  <div class="ai-chat-settings">
    <h2 class="section-title">AI聊天设置</h2>

    <div class="settings-content">
      <el-alert
        type="info"
        :closable="false"
        class="tip-alert"
      >
        配置你的个人大模型 API Key 后，AI 助手将调用你选择的大模型服务进行回复。
        Key 会经过 <b>AES-GCM 加密</b>后保存在服务端数据库，页面仅显示脱敏形式，任何人（包括你自己）都无法再查看明文。
        未配置时 AI 助手使用内置规则回复。
      </el-alert>

      <!-- 当前配置状态 -->
      <div class="status-card" :class="configInfo.configured ? 'status-on' : 'status-off'">
        <div class="status-header">
          <span class="status-dot"></span>
          <span class="status-text">{{ configInfo.configured ? '已启用个人 API Key' : '未配置（使用内置规则回复）' }}</span>
          <el-tag v-if="configInfo.configured" size="mini" type="success">生效中</el-tag>
          <el-tag v-else size="mini" type="info">未配置</el-tag>
        </div>
        <div v-if="configInfo.configured" class="status-detail">
          <div class="detail-item"><span class="label">服务商</span>{{ providerLabel(configInfo.provider) }}</div>
          <div class="detail-item"><span class="label">API Key</span><code>{{ configInfo.maskedApiKey }}</code></div>
          <div class="detail-item"><span class="label">Base URL</span>{{ configInfo.baseUrl || '（服务商默认）' }}</div>
          <div class="detail-item"><span class="label">模型</span>{{ configInfo.model || '（服务商默认）' }}</div>
          <div class="detail-item" v-if="configInfo.updatedAt"><span class="label">更新时间</span>{{ configInfo.updatedAt }}</div>
        </div>
      </div>

      <!-- 配置表单 -->
      <el-form :model="form" ref="formRef" label-width="90px" class="config-form">
        <el-form-item label="服务商">
          <el-select v-model="form.provider" @change="onProviderChange" style="width: 100%">
            <el-option
              v-for="(p, key) in PROVIDERS"
              :key="key"
              :label="p.label"
              :value="key"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="API Key">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            :placeholder="configInfo.configured ? '已加密保存，留空则保留原Key' : '请输入 API Key（如：sk-xxxxxxxx）'"
            autocomplete="new-password"
          ></el-input>
          <p class="form-tip" v-if="PROVIDERS[form.provider] && PROVIDERS[form.provider].keyUrl">
            没有Key？
            <a :href="PROVIDERS[form.provider].keyUrl" target="_blank" rel="noopener">
              去获取 {{ PROVIDERS[form.provider].label }} API Key
            </a>
          </p>
        </el-form-item>

        <el-form-item label="Base URL">
          <el-input v-model="form.baseUrl" :placeholder="PROVIDERS[form.provider].baseUrl || 'https://api.example.com/v1'"></el-input>
          <p class="form-tip">需为 OpenAI 兼容接口，留空使用所选服务商默认地址</p>
        </el-form-item>

        <el-form-item label="模型">
          <el-input v-model="form.model" :placeholder="PROVIDERS[form.provider].model || '如：deepseek-chat'"></el-input>
          <p class="form-tip">留空使用所选服务商默认模型</p>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
          <el-button type="danger" plain :disabled="!configInfo.configured" @click="clearConfig">清除配置</el-button>
          <el-button type="text" @click="goChat">
            <i class="el-icon-chat-dot-round"></i> 前往和 AI 聊天
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ENV_CONFIG } from '../../config/env';
import { useUserStore } from '../../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

// 服务商预设（Base URL / 模型与后端 OpenAiCompatAiReplyProvider 保持一致）
const PROVIDERS = {
  deepseek: { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat', keyUrl: 'https://platform.deepseek.com/api_keys' },
  mimo: { label: '小米MiMo', baseUrl: 'https://platform.xiaomimimo.com/v1', model: 'mimo-v2.5', keyUrl: 'https://platform.xiaomimimo.com' },
  zhipu: { label: '智谱GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys' },
  qwen: { label: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', keyUrl: 'https://bailian.console.aliyun.com/?apiKey=1' },
  openai: { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', keyUrl: 'https://platform.openai.com/api-keys' },
  custom: { label: '自定义', baseUrl: '', model: '', keyUrl: '' }
};

const configInfo = ref({});
const form = reactive({
  provider: 'deepseek',
  apiKey: '',
  baseUrl: '',
  model: ''
});
const saving = ref(false);

const authHeaders = () => ({
  Authorization: userStore?.token ? `Bearer ${userStore.token}` : undefined
});

const providerLabel = (key) => (PROVIDERS[key] ? PROVIDERS[key].label : (key || '自定义'));

const onProviderChange = (key) => {
  const preset = PROVIDERS[key];
  if (preset) {
    form.baseUrl = preset.baseUrl;
    form.model = preset.model;
  }
};

const loadConfig = async () => {
  try {
    const { data } = await axios.get(`${ENV_CONFIG.API_BASE_URL}/ai-chat/config`, { headers: authHeaders() });
    if (data?.code === 200) {
      configInfo.value = data.data || {};
      if (configInfo.value.configured) {
        form.provider = configInfo.value.provider || 'custom';
        form.baseUrl = configInfo.value.baseUrl || '';
        form.model = configInfo.value.model || '';
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const saveConfig = async () => {
  if (!configInfo.value.configured && !form.apiKey.trim()) {
    ElMessage.warning('请输入 API Key');
    return;
  }
  saving.value = true;
  try {
    const { data } = await axios.post(
      `${ENV_CONFIG.API_BASE_URL}/ai-chat/config`,
      {
        provider: form.provider,
        baseUrl: form.baseUrl.trim(),
        model: form.model.trim(),
        apiKey: form.apiKey.trim()
      },
      { headers: authHeaders() }
    );
    if (data?.code === 200) {
      ElMessage.success('配置已保存（API Key已加密入库）');
      form.apiKey = '';
      await loadConfig();
    } else {
      ElMessage.error(data?.msg || '保存失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('保存失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};

const clearConfig = async () => {
  try {
    await ElMessageBox.confirm('确定清除已保存的 API Key？清除后 AI 助手将恢复内置规则回复。', '清除配置', { type: 'warning' });
    const { data } = await axios.delete(`${ENV_CONFIG.API_BASE_URL}/ai-chat/config`, { headers: authHeaders() });
    if (data?.code === 200) {
      ElMessage.success('已清除配置');
      form.apiKey = '';
      form.baseUrl = '';
      form.model = '';
      form.provider = 'deepseek';
      await loadConfig();
    } else {
      ElMessage.error(data?.msg || '清除失败');
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('清除失败');
  }
};

const goChat = () => {
  router.push('/ai-chat');
};

onMounted(loadConfig);
</script>

<style scoped>
.ai-chat-settings {
  padding: 10px 5px;
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
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #667eea);
  border-radius: 2px;
}

.tip-alert {
  margin-bottom: 20px;
}

.tip-alert b {
  color: #409eff;
}

/* 状态卡片 */
.status-card {
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 25px;
  border: 1px solid #e4e7ed;
  background: #fafafa;
}

.status-card.status-on {
  border-color: #c2e7d0;
  background: linear-gradient(135deg, #f0f9eb 0%, #ffffff 100%);
}

.status-card.status-off {
  border-color: #ebeef5;
  background: #fafbfc;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #909399;
}

.status-on .status-dot {
  background: #67c23a;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
}

.status-text {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.status-detail {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px 20px;
}

.detail-item {
  font-size: 13px;
  color: #606266;
  word-break: break-all;
}

.detail-item .label {
  display: inline-block;
  width: 70px;
  color: #909399;
}

.detail-item code {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
  color: #e6a23c;
  font-size: 12px;
}

/* 表单 */
.config-form {
  max-width: 640px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin: 4px 0 0;
  line-height: 1.4;
}

.form-tip a {
  color: #409eff;
  text-decoration: none;
}

.form-tip a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 20px;
  }

  .config-form {
    max-width: 100%;
  }
}
</style>
