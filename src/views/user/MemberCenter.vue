<template>
  <div class="member-center">
    <h2 class="section-title">会员中心</h2>

    <div class="settings-content">
      <!-- 当前身份卡 -->
      <div class="member-hero" :class="currentPlan.id">
        <div class="hero-left">
          <div class="hero-icon">{{ currentPlan.icon }}</div>
          <div class="hero-info">
            <h3>{{ currentPlan.name }}</h3>
            <p>{{ currentPlan.heroDesc }}</p>
          </div>
        </div>
        <div class="hero-right" v-if="currentPlan.id !== 'free'">
          <div class="hero-expire">有效期至：{{ expireText }}</div>
          <el-switch
            v-model="autoRenew"
            active-text="自动续费"
            @change="onAutoRenewChange"
          ></el-switch>
        </div>
      </div>

      <!-- 套餐选择 -->
      <div class="section-block">
        <h3 class="block-title">会员套餐</h3>
        <div class="plan-grid">
          <div
            v-for="p in plans"
            :key="p.id"
            class="plan-card"
            :class="{ current: p.id === currentPlan.id, recommend: p.recommend }"
          >
            <div v-if="p.recommend" class="recommend-badge">推荐</div>
            <div class="plan-icon">{{ p.icon }}</div>
            <div class="plan-name">{{ p.name }}</div>
            <div class="plan-price">
              <span class="price-symbol">￥</span>
              <span class="price">{{ p.price }}</span>
              <span class="price-unit">/{{ p.period }}</span>
            </div>
            <ul class="plan-benefits">
              <li v-for="b in p.benefits" :key="b">{{ b }}</li>
            </ul>
            <el-button
              :type="p.id === currentPlan.id ? 'info' : 'primary'"
              :plain="p.id !== 'gold'"
              :disabled="p.id === currentPlan.id"
              @click="subscribe(p)"
            >
              {{ p.id === currentPlan.id ? '当前套餐' : '立即开通' }}
            </el-button>
          </div>
        </div>
        <p class="plan-note">* 当前为演示环境，开通操作仅在本地模拟，不会产生真实扣费。</p>
      </div>

      <!-- 权益对比 -->
      <div class="section-block">
        <h3 class="block-title">权益对比</h3>
        <el-table :data="benefitTable" style="width: 100%" size="small" border>
          <el-table-column prop="name" label="权益" min-width="180"></el-table-column>
          <el-table-column prop="free" label="免费会员" width="120" align="center"></el-table-column>
          <el-table-column prop="silver" label="白银会员" width="120" align="center">
            <template #default="scope">
              <span :class="{ gold: scope.row.silverText }">{{ scope.row.silver }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="gold" label="黄金会员" width="120" align="center">
            <template #default="scope">
              <span class="gold">{{ scope.row.gold }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const STORAGE_KEY = 'my_home_member_settings';

const autoRenew = ref(false);
const expireAt = ref('');

const plans = ref([
  {
    id: 'free',
    icon: '🎮',
    name: '免费会员',
    price: 0,
    period: '永久',
    heroDesc: '基础观影功能，注册即可使用',
    benefits: ['电影浏览与搜索', '每日3次AI助手对话', '上映预约提醒'],
    recommend: false
  },
  {
    id: 'silver',
    icon: '🥈',
    name: '白银会员',
    price: 12,
    period: '月',
    heroDesc: '更高频的AI助手与专属观影记录',
    benefits: ['每日30次AI助手对话', '完整观影历史与收藏', '预约提醒优先推送', '专属白银标识'],
    recommend: false
  },
  {
    id: 'gold',
    icon: '👑',
    name: '黄金会员',
    price: 30,
    period: '月',
    heroDesc: '全功能畅享，AI助手不限次',
    benefits: ['AI助手不限次对话', '支持个人大模型Key接入', '上映提醒全渠道推送', '新功能抢先体验', '专属黄金标识'],
    recommend: true
  }
]);

const currentPlanId = ref('free');

const currentPlan = computed(() => plans.value.find(p => p.id === currentPlanId.value) || plans.value[0]);

const expireText = computed(() => expireAt.value || '（未开通）');

const benefitTable = ref([
  { name: 'AI助手每日对话次数', free: '3次', silver: '30次', gold: '不限' },
  { name: '个人大模型Key接入', free: '—', silver: '—', gold: '✓' },
  { name: '观影历史保留时长', free: '30天', silver: '180天', gold: '永久' },
  { name: '上映提醒渠道', free: '站内', silver: '站内+邮件', gold: '站内+邮件+音箱播报' },
  { name: '会员专属标识', free: '—', silver: '🥈', gold: '👑' },
  { name: '新功能抢先体验', free: '—', silver: '—', gold: '✓' }
]);

const subscribe = (plan) => {
  if (plan.id === 'free') return;
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  currentPlanId.value = plan.id;
  expireAt.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  save();
  ElMessage.success(`已开通${plan.name}（模拟），有效期至 ${expireText.value}`);
};

const onAutoRenewChange = () => {
  save();
  ElMessage.info(autoRenew.value ? '已开启自动续费（模拟）' : '已关闭自动续费');
};

const save = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    currentPlanId: currentPlanId.value,
    autoRenew: autoRenew.value,
    expireAt: expireAt.value
  }));
};

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    currentPlanId.value = data.currentPlanId || 'free';
    autoRenew.value = !!data.autoRenew;
    expireAt.value = data.expireAt || '';
  } catch (e) {
    console.error('加载会员信息失败', e);
  }
};

onMounted(load);
</script>

<style scoped>
.member-center {
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

/* 当前身份卡 */
.member-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 25px;
  color: #fff;
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
}

.member-hero.silver {
  background: linear-gradient(135deg, #8e9eab 0%, #4b6477 100%);
}

.member-hero.gold {
  background: linear-gradient(135deg, #f6d365 0%, #c78f36 100%);
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-icon {
  font-size: 44px;
}

.hero-info h3 {
  margin: 0 0 6px;
  font-size: 22px;
}

.hero-info p {
  margin: 0;
  font-size: 13px;
  opacity: 0.85;
}

.hero-right {
  text-align: right;
}

.hero-expire {
  font-size: 13px;
  color: #5c4a1e;
  font-weight: 600;
  margin-bottom: 10px;
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

/* 套餐卡片 */
.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  max-width: 860px;
}

.plan-card {
  position: relative;
  border: 2px solid #ebeef5;
  border-radius: 12px;
  padding: 22px 18px;
  text-align: center;
  background: #fff;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.15);
}

.plan-card.current {
  border-color: #409eff;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.2);
}

.plan-card.recommend {
  border-color: #e6a23c;
}

.recommend-badge {
  position: absolute;
  top: -10px;
  right: 14px;
  background: linear-gradient(135deg, #f6d365, #c78f36);
  color: #fff;
  font-size: 12px;
  padding: 2px 12px;
  border-radius: 12px;
}

.plan-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.plan-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.plan-price {
  margin-bottom: 14px;
  color: #409eff;
}

.price-symbol {
  font-size: 14px;
}

.price {
  font-size: 30px;
  font-weight: 700;
}

.price-unit {
  font-size: 12px;
  color: #909399;
}

.plan-benefits {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  text-align: left;
}

.plan-benefits li {
  font-size: 13px;
  color: #606266;
  padding: 4px 0;
}

.plan-benefits li::before {
  content: '✓';
  color: #67c23a;
  margin-right: 8px;
  font-weight: 700;
}

.plan-note {
  margin-top: 14px;
  font-size: 12px;
  color: #c0c4cc;
}

/* 权益对比表 */
.gold {
  color: #c78f36;
  font-weight: 600;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 20px;
  }

  .member-hero {
    flex-direction: column;
    gap: 14px;
    text-align: center;
  }
}
</style>
