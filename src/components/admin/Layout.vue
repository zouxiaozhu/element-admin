<template>
  <div class="layout-root">
    <Header @menu-select="handleMenuSelect" />
    <div class="main-area">
      <Sidebar :activeMenu="activeMenu" @menu-select="handleMenuSelect" />
      <div class="content-area">

        <component :is="currentComponent" :key="componentKey" @menu-select="handleMenuSelect" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Dashboard from './Dashboard.vue'
import ExcelPage from './ExcelPage.vue'
import Users from './Users.vue'
import Profile from './Profile.vue'

// 创建其他占位组件
const Analytics = {
  template: `
    <div class="placeholder-page">
      <div class="page-header">
        <h2>数据分析</h2>
        <p>Excel数据统计与分析</p>
      </div>
      <el-card>
        <div style="text-align: center; padding: 60px 0;">
          <el-icon size="64" color="#409eff"><DataAnalysis /></el-icon>
          <h3 style="margin: 20px 0 10px 0;">数据分析功能</h3>
          <p style="color: #909399;">该功能正在开发中，敬请期待...</p>
        </div>
      </el-card>
    </div>
  `
}

const SystemConfig = {
  template: `
    <div class="placeholder-page">
      <div class="page-header">
        <h2>系统配置</h2>
        <p>系统参数设置与配置</p>
      </div>
      <el-card>
        <div style="text-align: center; padding: 60px 0;">
          <el-icon size="64" color="#409eff"><Setting /></el-icon>
          <h3 style="margin: 20px 0 10px 0;">系统配置</h3>
          <p style="color: #909399;">该功能正在开发中，敬请期待...</p>
        </div>
      </el-card>
    </div>
  `
}

const SystemLogs = {
  template: `
    <div class="placeholder-page">
      <div class="page-header">
        <h2>系统日志</h2>
        <p>查看系统运行日志</p>
      </div>
      <el-card>
        <div style="text-align: center; padding: 60px 0;">
          <el-icon size="64" color="#409eff"><Document /></el-icon>
          <h3 style="margin: 20px 0 10px 0;">系统日志</h3>
          <p style="color: #909399;">该功能正在开发中，敬请期待...</p>
        </div>
      </el-card>
    </div>
  `
}

const activeMenu = ref('dashboard')
const currentComponent = ref(Dashboard)
const componentKey = ref(0)

// 组件映射
const componentMap = {
  dashboard: Dashboard,
  excel: ExcelPage,
  users: Users,
  profile: Profile,
  analytics: Analytics,
  'system-config': SystemConfig,
  'system-logs': SystemLogs
}

// 更新组件的函数
const updateComponent = (menuKey: string) => {
  const component = componentMap[menuKey] || Dashboard
  currentComponent.value = component
  componentKey.value++
}

const handleMenuSelect = (index: string) => {
  // 直接更新activeMenu和组件
  activeMenu.value = index
  updateComponent(index)
}

// 初始化时设置默认组件
updateComponent('dashboard')
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