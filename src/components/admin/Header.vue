<template>
  <header class="top-navbar">
    <div class="navbar-left">
      <div class="logo">
        <img src="/logo.svg" alt="Logo" class="logo-img" />
        <span class="logo-text">Excel管理系统</span>
      </div>
    </div>
    
    <div class="navbar-right">
      <div class="user-info">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="username">{{ username }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserInfo, logout } from '@/utils/auth.js'

const router = useRouter()
const userInfo = ref(null)

const userAvatar = computed(() => {
  return userInfo.value?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

const username = computed(() => {
  return userInfo.value?.nickName ||  userInfo.value?.userName
})

// 定义 emits
const emit = defineEmits(['menu-select'])

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 发送菜单切换事件到Layout
      emit('menu-select', 'profile')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 执行登出
    logout()
    ElMessage.success('退出登录成功')
    // 跳转到登录页
    router.push('/login')
  }).catch(() => {
    // 用户取消
  })
}

// 初始化用户信息
onMounted(() => {
  userInfo.value = getUserInfo()
})
</script>

<style scoped>
.top-navbar {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-info {
  position: relative;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.el-dropdown-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .top-navbar {
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .username {
    display: none;
  }
}
</style> 