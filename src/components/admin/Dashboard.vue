<template>
  <div class="dashboard">
    <h2>系统大盘</h2>
    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Excel数量</div>
        <div class="card-value">123</div>
      </div>
      <div class="card">
        <div class="card-title">上次登录</div>
        <div class="card-value">2024-05-01 12:34</div>
      </div>
      <!-- 可继续添加更多概要信息 -->
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
.dashboard {
  padding: 24px;
}
.summary-cards {
  display: flex;
  gap: 32px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.card {
  background: linear-gradient(135deg, #eaf3ff 0%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(64,158,255,0.10);
  padding: 32px 40px;
  min-width: 200px;
  text-align: center;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.card:hover {
  box-shadow: 0 8px 32px rgba(64,158,255,0.18);
  transform: translateY(-4px) scale(1.04);
}
.card-title {
  font-size: 18px;
  color: #888;
  margin-bottom: 12px;
  font-weight: 600;
}
.card-value {
  font-size: 34px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(64,158,255,0.10);
}
@media (max-width: 900px) {
  .summary-cards {
    flex-direction: column;
    gap: 18px;
  }
  .card {
    padding: 18px 12px;
    min-width: 120px;
  }
}
</style> 