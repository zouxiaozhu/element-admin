<template>
  <aside class="sidebar">
    <el-menu
      :default-active="props.activeMenu"
      class="sidebar-menu"
      background-color="#ffffff"
      text-color="#606266"
      active-text-color="#409eff"
      @select="handleSelect"
    >
      <el-menu-item index="dashboard">
        <el-icon><House /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      
      <el-menu-item index="excel">
        <el-icon><Document /></el-icon>
        <span>Excel管理</span>
      </el-menu-item>
      
      <el-menu-item index="users">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="system-config">系统配置</el-menu-item>
        <el-menu-item index="system-logs">系统日志</el-menu-item>
      </el-sub-menu>
      
      <el-menu-item index="analytics">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据分析</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { House, Document, User, Setting, DataAnalysis } from '@element-plus/icons-vue'

interface Props {
  activeMenu?: string
}

interface Emits {
  (e: 'menu-select', index: string): void
}

const props = withDefaults(defineProps<Props>(), {
  activeMenu: 'dashboard'
})

const emit = defineEmits<Emits>()

const handleSelect = (index: string) => {
  emit('menu-select', index)
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow-y: auto;
}

.sidebar-menu {
  border: none;
  height: 100%;
  padding: 16px 0;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

:deep(.el-menu-item:hover) {
  background-color: #f5f7fa !important;
  color: #409eff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff !important;
  color: #409eff !important;
  border-right: none;
}

:deep(.el-sub-menu .el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

:deep(.el-sub-menu .el-sub-menu__title:hover) {
  background-color: #f5f7fa !important;
  color: #409eff !important;
}

:deep(.el-sub-menu .el-menu-item) {
  margin: 2px 24px;
  padding-left: 32px !important;
}

:deep(.el-menu .el-icon) {
  margin-right: 8px;
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  :deep(.el-menu-item span) {
    font-size: 14px;
  }
}
</style>

