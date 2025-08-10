<template>
  <aside class="sidebar">
    <el-menu
      :default-active="props.activeMenu"
      :default-openeds="defaultOpeneds"
      class="sidebar-menu"
      background-color="#ffffff"
      text-color="#606266"
      active-text-color="#409eff"
      mode="vertical"
      :collapse="false"
      router
    >
      <el-menu-item index="/admin">
        <el-icon><House /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/excel">
        <el-icon><Document /></el-icon>
        <span>Excel搜索</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/document-convert">
        <el-icon><DocumentCopy /></el-icon>
        <span>Excel转Word</span>
      </el-menu-item>

      <el-sub-menu index="form" class="hidden-menu" v-if="false">
        <template #title>
          <el-icon><Collection /></el-icon>
          <span>表单管理</span>
        </template>
        <el-menu-item index="/admin/form/list">表单列表</el-menu-item>
        <el-menu-item index="/admin/form/builder">表单设计器</el-menu-item>
        <el-menu-item index="/admin/form/formily">Formily设计器</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="qrcode" class="hidden-menu" v-if="false">
        <template #title>
          <el-icon><Picture /></el-icon>
          <span>二维码管理</span>
        </template>
        <el-menu-item index="/admin/qrcode">二维码列表</el-menu-item>
        <el-menu-item index="/admin/qrcode/create">创建二维码</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/admin/users" class="hidden-menu">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      
      <el-menu-item index="/admin/my-feedback">
        <el-icon><Message /></el-icon>
        <span>我的反馈</span>
      </el-menu-item>
      

      
      <el-menu-item index="/admin/profile">
        <el-icon><Avatar /></el-icon>
        <span>个人资料</span>
      </el-menu-item>
      
      <el-sub-menu index="system" class="hidden-menu">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/admin/system-config">系统配置</el-menu-item>
        <el-menu-item index="/admin/system-logs">系统日志</el-menu-item>
      </el-sub-menu>
      

    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { 
  House, 
  Document, 
  DocumentCopy,
  Collection,
  Picture,
  User, 
  Setting, 
  Message,
  Avatar,
  ChatDotRound
} from '@element-plus/icons-vue'

const props = defineProps({
  activeMenu: {
    type: String,
    default: '/admin'
  }
})

// 默认不展开子菜单，避免隐藏菜单触发过渡导致的 slot 警告
const defaultOpeneds = []
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e6e6e6;
}

.sidebar-menu {
  border: none;
  height: 100%;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #ecf5ff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  border-right: 2px solid #409eff;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  height: 45px;
  line-height: 45px;
  padding-left: 50px !important;
  background-color: #fafafa;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover {
  background-color: #ecf5ff;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
}

.sidebar-menu .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-sub-menu__title:hover {
  background-color: #ecf5ff;
}

/* 隐藏菜单项 */
.hidden-menu {
  display: none !important;
}
</style>

