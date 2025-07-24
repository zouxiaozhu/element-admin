<template>
  <header class="top-navbar">
    <div class="left">
      <img class="logo" src="/logo.png" alt="logo" />
      <span class="system-name">企业管理平台</span>
    </div>
    <div class="right">
      <ThemeSwitch v-model="isDark" />
      <el-icon class="icon-btn"><Setting /></el-icon>
      <div class="user-info-content">
        <img class="avatar" :src="user.avatar" alt="用户头像" />
        <span class="username">{{ user.name }}</span>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Setting } from '@element-plus/icons-vue'
// 主题切换组件
const ThemeSwitch = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `<el-switch :model-value="modelValue" @change="$emit('update:modelValue', $event)" active-text="🌙" inactive-text="☀️" />`
}
const user = ref({
  name: '张三',
  avatar: 'https://i.pravatar.cc/48?img=3'
})
const isDark = ref(false)
watch(isDark, val => {
  document.body.classList.toggle('dark', val)
})
</script>

<style scoped>
.top-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  background: linear-gradient(90deg, rgba(64,158,255,0.85) 0%, rgba(32,45,64,0.85) 100%);
  color: var(--header-text, #fff);
  box-shadow: 0 4px 24px 0 rgba(64,158,255,0.08);
  padding: 0 40px;
  border-radius: 0 0 18px 0;
  backdrop-filter: blur(8px);
}
.left {
  display: flex;
  align-items: center;
}
.logo {
  width: 40px;
  height: 40px;
  margin-right: 14px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
}
.system-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 2px 8px rgba(64,158,255,0.12);
}
.right {
  display: flex;
  align-items: center;
  gap: 28px;
}
.icon-btn {
  font-size: 26px;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  color: #fff;
}
.icon-btn:hover {
  color: #ffd04b;
  transform: scale(1.15) rotate(-10deg);
}
.user-info-content {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 6px 18px 6px 10px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
  border: 1.5px solid rgba(255,255,255,0.18);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid #ffd04b;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
}
.username {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 1px 4px rgba(64,158,255,0.12);
}
:deep(.el-switch) {
  --el-switch-on-color: #ffd04b;
  --el-switch-off-color: #409eff;
  transform: scale(1.2);
}
body.dark .top-navbar {
  --header-bg: rgba(34,44,60,0.95);
  --header-text: #fff;
  --user-info-bg: rgba(45,58,75,0.85);
}
</style> 