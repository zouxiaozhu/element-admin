<template>
  <header class="top-navbar">
    <div class="navbar-left">
      <div class="logo">
        <img src="/logo.svg" alt="Logo" class="logo-img" />
        <span class="logo-text">Excel管理系统</span>
      </div>
    </div>
    
    <div class="navbar-right">

      
      <div class="contact-buttons">
        <!-- 通知徽章 -->
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
          <el-button
            type="warning"
            size="small"
            @click="showNotifications"
            class="contact-btn"
          >
            <el-icon><Bell /></el-icon>
            {{ unreadCount === 0 ? '我要反馈' : '我的反馈' }}
          </el-button>
        </el-badge>
        

        <el-button
          type="info"
          size="small"
          @click="showHelp"
          class="contact-btn"
        >
          <el-icon><QuestionFilled /></el-icon>
          帮助
        </el-button>
      </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, QuestionFilled, Bell } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserInfo, logout } from '@/utils/auth.js'


const router = useRouter()
const userInfo = ref(null)
const unreadCount = ref(0)

const userAvatar = computed(() => {
  return userInfo.value?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

const username = computed(() => {
  return userInfo.value?.nickName ||  userInfo.value?.userName
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break

    case 'settings':
      router.push('/admin/system-config')
      break
    case 'logout':
      handleLogout()
      break
  }
}



const showNotifications = () => {
  // 跳转到我的反馈页面
  router.push('/admin/my-feedback')
}

// 更新未读数量
const updateUnreadCount = (count: number) => {
  unreadCount.value = count
}

const showHelp = () => {
  window.open('/help.html', '_blank')
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
  
  // 监听用户信息变化（比如头像更新）
  const handleUserInfoUpdate = () => {
    userInfo.value = getUserInfo()
  }
  
  // 监听未读数量更新事件
  const handleUnreadCountUpdate = (event: CustomEvent) => {
    updateUnreadCount(event.detail.count)
  }
  
  // 监听自定义事件
  window.addEventListener('user-info-updated', handleUserInfoUpdate)
  window.addEventListener('update-unread-count', handleUnreadCountUpdate as EventListener)
  
  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('user-info-updated', handleUserInfoUpdate)
    window.removeEventListener('update-unread-count', handleUnreadCountUpdate as EventListener)
  })
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
  gap: 16px;
}

.contact-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 6px 12px;
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
  
  .contact-buttons {
    gap: 4px;
  }
  
  .contact-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .contact-btn .el-icon {
    font-size: 12px;
  }
}
</style> 