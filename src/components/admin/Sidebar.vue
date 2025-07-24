<template>
  <div class="menu-container">
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      @select="handleMenuSelect"
      background-color="var(--sidebar-bg, #222c3c)"
      text-color="var(--sidebar-text, #fff)"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="excel">
        <el-icon><i class="el-icon-document" /></el-icon>
        <span>Excel管理</span>
      </el-menu-item>
      <el-menu-item index="excel">
        <el-icon><i class="el-icon-document" /></el-icon>
        <span>Excel管理</span>
      </el-menu-item>
      <el-menu-item index="excel">
        <el-icon><i class="el-icon-document" /></el-icon>
        <span>Excel管理</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ activeMenu: string }>()
const emit = defineEmits(['menu-select'])
const handleMenuSelect = (index: string) => {
  emit('menu-select', index)
}
</script>

<style scoped>
.menu-container {
  width: 230px;
  height: 100vh;
  background: linear-gradient(180deg, rgba(34,44,60,0.98) 0%, rgba(64,158,255,0.12) 100%);
  box-shadow: 6px 0 32px rgba(64,158,255,0.10);
  border-right: 1.5px solid #222c3c;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  backdrop-filter: blur(8px);
}
.el-menu-vertical {
  border-right: none;
  background: transparent;
}
.el-menu-item {
  border-radius: 16px;
  margin: 12px 16px;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
}
.el-menu-item .el-icon {
  font-size: 22px;
  margin-right: 10px;
}
.el-menu-item.is-active,
.el-menu-item:hover {
  background: linear-gradient(90deg, #409eff 0%, #ffd04b 100%) !important;
  color: #fff !important;
  transform: scale(1.04);
  box-shadow: 0 2px 12px rgba(64,158,255,0.10);
}
</style>

