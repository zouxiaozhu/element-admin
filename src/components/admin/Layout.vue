<template>
  <div class="layout-root">
    <Header />
    <div class="main-area">
      <Sidebar :activeMenu="activeMenu" />
      <div class="content-area">
        <router-view />
      </div>
    </div>
    
    <!-- 悬浮球 -->
    <FloatingBalls @feedback="showFeedbackDialog" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import FloatingBalls from './FloatingBalls.vue'

const route = useRoute()

// 根据当前路由计算活动菜单
const activeMenu = computed(() => {
  return route.path
})

// 显示反馈对话框
const showFeedbackDialog = () => {
  // 跳转到反馈页面
  window.location.href = '/admin/feedback-submit'
}
</script>

<style scoped>
.layout-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f6fa 0%, #eaf3ff 100%);
}

.main-area {
  display: flex;
  flex: 1;
  min-height: 0;
}

.content-area {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: transparent;
  margin: 0;
  min-height: 0;
}

/* 全局占位页面样式 */
:deep(.placeholder-page) {
  padding: 20px;
}

:deep(.placeholder-page .page-header) {
  margin-bottom: 32px;
}

:deep(.placeholder-page .page-header h2) {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

:deep(.placeholder-page .page-header p) {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

:deep(.placeholder-page .el-card) {
  border-radius: 12px;
}

@media (max-width: 900px) {
  .content-area {
    padding: 0;
    margin: 0;
  }
  
  .layout-root {
    background: #f5f6fa;
  }
}
</style>