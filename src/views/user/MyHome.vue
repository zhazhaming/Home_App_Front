<template>
  <div class="my-home-settings">
    <h2 class="section-title">智能家庭设置</h2>

    <div class="settings-content">
      <el-alert
        type="info"
        :closable="false"
        class="tip-alert"
      >
        将你的小米/米家智能设备接入 MY HOME，与大屏、AI 助手联动。
        设备与偏好配置保存在本机浏览器中，后端接口就绪后可一键迁移。
      </el-alert>

      <!-- 绑定状态 -->
      <div class="bind-card" :class="{ bound: homeSettings.bound }">
        <div class="bind-left">
          <div class="bind-icon">🏠</div>
          <div class="bind-info">
            <h3>米家账号绑定</h3>
            <p>{{ homeSettings.bound ? `已绑定家庭：${homeSettings.homeName || '我的家'}` : '绑定后可控制已接入的智能设备' }}</p>
          </div>
        </div>
        <el-button v-if="!homeSettings.bound" type="primary" @click="bindHome">立即绑定</el-button>
        <el-button v-else type="danger" plain @click="unbindHome">解除绑定</el-button>
      </div>

      <template v-if="homeSettings.bound">
        <!-- 设备列表 -->
        <div class="section-block">
          <h3 class="block-title">我的设备（{{ devices.length }}）</h3>
          <div class="device-grid">
            <div v-for="d in devices" :key="d.id" class="device-card" :class="{ offline: !d.online }">
              <div class="device-top">
                <span class="device-icon">{{ d.icon }}</span>
                <el-switch v-model="d.online" @change="saveAll" />
              </div>
              <div class="device-name">{{ d.name }}</div>
              <div class="device-room">{{ d.room }} · {{ d.online ? '在线' : '离线' }}</div>
              <div class="device-desc">{{ d.desc }}</div>
            </div>
          </div>
          <div class="add-device">
            <el-button type="text" icon="el-icon-plus" @click="openAddDevice">添加设备</el-button>
          </div>
        </div>

        <!-- 语音助手 -->
        <div class="section-block">
          <h3 class="block-title">小爱同学</h3>
          <el-form label-width="110px" class="home-form">
            <el-form-item label="语音唤醒">
              <el-switch v-model="voice.enabled" @change="saveAll"></el-switch>
              <span class="form-tip">对音箱说"小爱同学"即可唤起 MY HOME 助手</span>
            </el-form-item>
            <el-form-item label="唤醒词">
              <el-input v-model="voice.wakeWord" style="width: 240px" placeholder="小爱同学" :disabled="!voice.enabled" @change="saveAll"></el-input>
            </el-form-item>
            <el-form-item label="音量">
              <el-slider v-model="voice.volume" style="width: 260px" :disabled="!voice.enabled" @change="saveAll"></el-slider>
            </el-form-item>
            <el-form-item label="上映提醒播报">
              <el-switch v-model="voice.notifyBroadcast" @change="saveAll"></el-switch>
              <span class="form-tip">预约的电影上映时，通过音箱语音播报提醒</span>
            </el-form-item>
          </el-form>
        </div>

        <!-- 观影场景联动 -->
        <div class="section-block">
          <h3 class="block-title">观影场景联动</h3>
          <div class="scene-list">
            <div v-for="s in scenes" :key="s.id" class="scene-item">
              <div class="scene-info">
                <div class="scene-name">{{ s.icon }} {{ s.name }}</div>
                <div class="scene-desc">{{ s.desc }}</div>
              </div>
              <el-switch v-model="s.enabled" @change="saveAll"></el-switch>
            </div>
          </div>
        </div>
      </template>

      <el-empty v-else description="绑定米家账号后开始配置智能设备"></el-empty>
    </div>

    <!-- 添加设备弹窗 -->
    <el-dialog title="添加设备" v-model="addDeviceVisible" width="420px">
      <el-form label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="newDevice.name" placeholder="如：卧室的音箱"></el-input>
        </el-form-item>
        <el-form-item label="所在房间">
          <el-select v-model="newDevice.room" style="width: 100%">
            <el-option v-for="r in ROOMS" :key="r" :label="r" :value="r"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDeviceVisible = false">取消</el-button>
        <el-button type="primary" @click="addDevice">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const STORAGE_KEY = 'my_home_smart_settings';
const ROOMS = ['客厅', '卧室', '书房', '厨房', '其他'];

const homeSettings = reactive({ bound: false, homeName: '我的家' });
const voice = reactive({ enabled: true, wakeWord: '小爱同学', volume: 60, notifyBroadcast: true });
const devices = ref([]);
const scenes = ref([
  { id: 'scene-movie', icon: '🎬', name: '电影之夜', desc: '播放电影时自动调暗灯光并拉上窗帘', enabled: true },
  { id: 'scene-pause', icon: '⏸️', name: '暂停亮灯', desc: '暂停播放时灯光恢复至柔和亮度', enabled: false },
  { id: 'scene-end', icon: '🌙', name: '片单结束', desc: '观影结束后关闭电视并进入夜灯模式', enabled: false }
]);

const addDeviceVisible = ref(false);
const newDevice = reactive({ name: '', room: '客厅' });

const DEFAULT_DEVICES = () => ([
  { id: 1, icon: '🔊', name: '小爱音箱 Pro', room: '客厅', online: true, desc: '语音助手 / 上映播报' },
  { id: 2, icon: '📺', name: '小米电视 ES55', room: '客厅', online: true, desc: '大屏观影主设备' },
  { id: 3, icon: '💡', name: '米家智能吸顶灯', room: '客厅', online: true, desc: '观影场景联动' },
  { id: 4, icon: '🌡️', name: '米家温湿度计', room: '卧室', online: false, desc: '环境舒适度监测' }
]);

const bindHome = () => {
  homeSettings.bound = true;
  if (devices.value.length === 0) {
    devices.value = DEFAULT_DEVICES();
  }
  saveAll();
  ElMessage.success('米家账号绑定成功，已同步示例设备');
};

const unbindHome = () => {
  ElMessageBox.confirm('解除绑定后将无法控制智能设备，确定继续？', '解除绑定', { type: 'warning' })
    .then(() => {
      homeSettings.bound = false;
      saveAll();
      ElMessage.success('已解除绑定');
    })
    .catch(() => {});
};

const openAddDevice = () => {
  newDevice.name = '';
  newDevice.room = '客厅';
  addDeviceVisible.value = true;
};

const addDevice = () => {
  if (!newDevice.name.trim()) {
    ElMessage.warning('请输入设备名称');
    return;
  }
  const id = Date.now();
  devices.value.push({
    id,
    icon: '🔌',
    name: newDevice.name.trim(),
    room: newDevice.room,
    online: true,
    desc: '自定义设备'
  });
  saveAll();
  addDeviceVisible.value = false;
  ElMessage.success('设备已添加');
};

const saveAll = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    homeSettings: { ...homeSettings },
    voice: { ...voice },
    devices: devices.value,
    scenes: scenes.value
  }));
};

const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.homeSettings) Object.assign(homeSettings, data.homeSettings);
    if (data.voice) Object.assign(voice, data.voice);
    if (data.devices) devices.value = data.devices;
    if (data.scenes) scenes.value = data.scenes;
  } catch (e) {
    console.error('加载智能家庭配置失败', e);
  }
};

onMounted(loadAll);
</script>

<style scoped>
.my-home-settings {
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

/* 绑定卡片 */
.bind-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 18px 22px;
  margin-bottom: 25px;
  background: #fafbfc;
}

.bind-card.bound {
  border-color: #c2e7d0;
  background: linear-gradient(135deg, #f0f9eb 0%, #ffffff 100%);
}

.bind-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.bind-icon {
  font-size: 34px;
}

.bind-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #303133;
}

.bind-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* 分区 */
.section-block {
  margin-bottom: 30px;
}

.block-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 14px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

/* 设备卡片 */
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.device-card {
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  transition: all 0.3s ease;
}

.device-card:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.device-card.offline {
  opacity: 0.55;
  background: #fafafa;
}

.device-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.device-icon {
  font-size: 28px;
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.device-room {
  font-size: 12px;
  color: #909399;
  margin: 4px 0;
}

.device-desc {
  font-size: 12px;
  color: #c0c4cc;
}

.add-device {
  margin-top: 12px;
}

/* 语音助手表单 */
.home-form .form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

/* 场景联动 */
.scene-list {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
}

.scene-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #fff;
}

.scene-item + .scene-item {
  border-top: 1px solid #ebeef5;
}

.scene-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.scene-desc {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 20px;
  }

  .device-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
