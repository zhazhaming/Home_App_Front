<template>
  <div class="points-settings">
    <h2 class="section-title">积分设置</h2>

    <div class="settings-content">
      <el-alert
        type="info"
        :closable="false"
        class="tip-alert"
      >
        签到与积分规则偏好保存在本机浏览器中，正式积分账户接入后端后将自动同步。
      </el-alert>

      <!-- 积分总览 + 签到 -->
      <div class="points-card">
        <div class="points-left">
          <div class="points-number">
            <span class="coin">💰</span>
            <span class="value">{{ points }}</span>
            <span class="unit">积分</span>
          </div>
          <div class="points-level">
            当前等级：<el-tag size="small" :type="level.tagType">{{ level.name }}</el-tag>
            <span class="level-tip">{{ level.tip }}</span>
          </div>
        </div>
        <div class="checkin-area">
          <el-button
            type="primary"
            size="medium"
            :disabled="checkedToday"
            @click="doCheckin"
          >
            {{ checkedToday ? '今日已签到' : '立即签到 +10' }}
          </el-button>
          <div class="checkin-info">连续签到 <b>{{ streak }}</b> 天（连续签到每满7天额外奖励50积分）</div>
        </div>
      </div>

      <!-- 签到日历（近7天） -->
      <div class="section-block">
        <h3 class="block-title">近7天签到</h3>
        <div class="week-strip">
          <div
            v-for="d in last7Days"
            :key="d.key"
            class="day-cell"
            :class="{ checked: checkedKeys.includes(d.key), today: d.isToday }"
          >
            <div class="day-label">{{ d.label }}</div>
            <div class="day-mark">{{ checkedKeys.includes(d.key) ? '✓' : '·' }}</div>
          </div>
        </div>
      </div>

      <!-- 积分规则 -->
      <div class="section-block">
        <h3 class="block-title">积分规则</h3>
        <div class="rule-list">
          <div v-for="r in rules" :key="r.id" class="rule-item">
            <div class="rule-info">
              <div class="rule-name">
                {{ r.icon }} {{ r.name }}
                <el-tag size="mini" type="warning" effect="plain">{{ r.points > 0 ? `+${r.points}` : r.points }}积分</el-tag>
              </div>
              <div class="rule-desc">{{ r.desc }}</div>
            </div>
            <el-switch
              v-model="r.enabled"
              @change="onRuleChange(r)"
            ></el-switch>
          </div>
        </div>
      </div>

      <!-- 积分兑换（预告） -->
      <div class="section-block">
        <h3 class="block-title">积分兑换</h3>
        <div class="exchange-grid">
          <div v-for="g in gifts" :key="g.id" class="gift-card">
            <div class="gift-icon">{{ g.icon }}</div>
            <div class="gift-name">{{ g.name }}</div>
            <div class="gift-cost">{{ g.cost }} 积分</div>
            <el-button
              size="mini"
              type="primary"
              plain
              :disabled="points < g.cost"
              @click="redeem(g)"
            >
              {{ points < g.cost ? '积分不足' : '兑换' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const STORAGE_KEY = 'my_home_points_settings';

const points = ref(0);
const streak = ref(0);
const lastCheckin = ref('');
const checkedKeys = ref([]);

const rules = ref([
  { id: 'daily', icon: '📅', name: '每日签到', points: 10, desc: '每天签到获得积分，连续签到有额外奖励', enabled: true },
  { id: 'watch', icon: '🎬', name: '观影赚积分', points: 20, desc: '标记一部电影为"已看"并获得评价后发放', enabled: true },
  { id: 'reserve', icon: '🔖', name: '预约上映', points: 15, desc: '成功预约一部待上映电影后发放', enabled: true },
  { id: 'review', icon: '✍️', name: '发表影评', points: 5, desc: '在电影详情页发表影评后发放', enabled: true },
  { id: 'invite', icon: '👥', name: '邀请好友', points: 30, desc: '邀请好友注册并登录后发放', enabled: false }
]);

const gifts = ref([
  { id: 'g1', icon: '🎟️', name: '观影券（模拟）', cost: 100 },
  { id: 'g2', icon: '🍿', name: '爆米花兑换券', cost: 200 },
  { id: 'g3', icon: '👑', name: '黄金会员体验7天', cost: 500 }
]);

const level = computed(() => {
  const p = points.value;
  if (p >= 1000) return { name: '黄金积分达人', tagType: 'warning', tip: '积分巅峰，兑换全场畅行' };
  if (p >= 500) return { name: '白银积分达人', tagType: 'success', tip: '再攒一点就能到黄金档啦' };
  if (p >= 100) return { name: '青铜积分新手', tagType: 'primary', tip: '每天签到很快就涨' };
  return { name: '积分萌新', tagType: 'info', tip: '签到、观影都可以攒积分' };
});

const checkedToday = computed(() => checkedKeys.value.includes(todayKey()));

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const last7Days = computed(() => {
  const days = [];
  const labels = ['日', '一', '二', '三', '四', '五', '六'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: i === 0 ? '今天' : `周${labels[d.getDay()]}`,
      isToday: i === 0
    });
  }
  return days;
});

const doCheckin = () => {
  if (checkedToday.value) return;
  const dailyRule = rules.value.find(r => r.id === 'daily');
  const gain = dailyRule && dailyRule.enabled ? dailyRule.points : 0;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  streak.value = checkedKeys.value.includes(yKey) ? streak.value + 1 : 1;

  checkedKeys.value.push(todayKey());
  lastCheckin.value = todayKey();
  points.value += gain;

  let bonus = 0;
  if (streak.value > 0 && streak.value % 7 === 0) {
    bonus = 50;
    points.value += bonus;
  }
  save();
  ElMessage.success(bonus > 0
    ? `签到成功！+${gain}积分，连续${streak.value}天额外+${bonus}积分`
    : `签到成功！+${gain}积分`);
};

const onRuleChange = (rule) => {
  save();
  ElMessage.info(`已${rule.enabled ? '开启' : '关闭'}「${rule.name}」规则`);
};

const redeem = (gift) => {
  if (points.value < gift.cost) return;
  points.value -= gift.cost;
  save();
  ElMessage.success(`兑换成功：${gift.name}（模拟发放，正式版将同步到账户）`);
};

const save = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    points: points.value,
    streak: streak.value,
    lastCheckin: lastCheckin.value,
    checkedKeys: checkedKeys.value,
    rules: rules.value
  }));
};

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    points.value = data.points || 0;
    streak.value = data.streak || 0;
    lastCheckin.value = data.lastCheckin || '';
    checkedKeys.value = data.checkedKeys || [];
    if (data.rules) {
      data.rules.forEach(saved => {
        const target = rules.value.find(r => r.id === saved.id);
        if (target) target.enabled = saved.enabled;
      });
    }
    // 隔月清理签到记录
    const thisMonth = todayKey().slice(0, 7);
    checkedKeys.value = checkedKeys.value.filter(k => k.slice(0, 7) === thisMonth);
  } catch (e) {
    console.error('加载积分配置失败', e);
  }
};

onMounted(load);
</script>

<style scoped>
.points-settings {
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

/* 积分总览卡 */
.points-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 22px 28px;
  margin-bottom: 25px;
  color: #fff;
}

.points-number {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.coin {
  font-size: 30px;
}

.value {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}

.unit {
  font-size: 14px;
  opacity: 0.85;
}

.points-level {
  margin-top: 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-tip {
  opacity: 0.75;
}

.checkin-area {
  text-align: center;
}

.checkin-info {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.85;
}

.checkin-info b {
  font-size: 14px;
}

/* 近7天签到 */
.week-strip {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  max-width: 560px;
}

.day-cell {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px 0;
  text-align: center;
  background: #fff;
}

.day-cell.today {
  border-color: #409eff;
}

.day-cell.checked {
  background: #f0f9eb;
  border-color: #c2e7d0;
}

.day-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.day-cell.checked .day-label {
  color: #67c23a;
}

.day-mark {
  font-size: 16px;
  color: #c0c4cc;
}

.day-cell.checked .day-mark {
  color: #67c23a;
  font-weight: 700;
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

/* 规则列表 */
.rule-list {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #fff;
}

.rule-item + .rule-item {
  border-top: 1px solid #ebeef5;
}

.rule-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-desc {
  font-size: 12px;
  color: #909399;
}

/* 兑换 */
.exchange-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  max-width: 640px;
}

.gift-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 18px 14px;
  text-align: center;
  background: #fff;
  transition: all 0.3s ease;
}

.gift-card:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.gift-icon {
  font-size: 30px;
  margin-bottom: 8px;
}

.gift-name {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
}

.gift-cost {
  font-size: 12px;
  color: #e6a23c;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 20px;
  }

  .points-card {
    flex-direction: column;
    gap: 18px;
  }

  .week-strip {
    max-width: 100%;
  }
}
</style>
