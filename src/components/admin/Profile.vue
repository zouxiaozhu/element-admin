<template>
  <div class="profile-page">
    <div class="page-header">
      <h2>个人资料</h2>
      <p>管理你的个人信息和设置</p>
    </div>
    
    <el-card class="profile-card">
      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar :size="120" :src="userInfo?.avatar || defaultAvatar" />
            <div class="avatar-overlay">
              <el-upload
                :http-request="handleAvatarUpload"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                accept="image/*"
                class="avatar-uploader"
              >
                <el-button type="primary" size="small" :loading="uploading">
                  <el-icon><Camera /></el-icon>
                  {{ uploading ? '上传中...' : '更换头像' }}
                </el-button>
              </el-upload>
            </div>
          </div>
          <div class="avatar-tips">
            <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
          </div>
        </div>
        
        <!-- 基本信息 -->
        <div class="info-section">
          <el-form :model="userForm" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" />
            </el-form-item>
            
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="userForm.nickName" placeholder="请输入昵称" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            
            <!-- <el-form-item label="个人简介">
              <el-input
                v-model="userForm.bio"
                type="textarea"
                :rows="4"
                placeholder="请输入个人简介"
              />
            </el-form-item> -->
            
            <el-form-item>
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存修改
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import { getUserInfo, setUserInfo, updateUserInfo } from '@/utils/auth.js'
import { dashboardApi } from '@/api/dashboard.js'
import { authApi } from '@/api/auth'

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const formRef = ref()
const uploading = ref(false)
const saving = ref(false)

const userInfo = ref(null)
const userForm = reactive({
  username: '',
  nickName: '',
  email: '',
  phone: '',
  bio: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 头像上传前的校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 头像上传处理
const handleAvatarUpload = async (options) => {
  const { file } = options
  uploading.value = true
  
    console.log('开始上传头像...')
    
    // 调用dashboard.js中的uploadFile方法上传头像
    const uploadResponse = await dashboardApi.uploadFile(file, 'USER_AVATAR')
    console.log('头像上传响应:', uploadResponse)
    
    
    // 获取头像URL
    const avatarUrl = uploadResponse?.externalUrl || uploadResponse?.internalUrl || uploadResponse?.path || uploadResponse.externalUrl || uploadResponse.url
    
    if (!avatarUrl) {
      throw new Error('无法获取头像URL')
    }
    
    console.log('头像URL:', avatarUrl)
    
    // 更新用户信息中的头像
    const updateResponse = await authApi.updateUserInfo({ avatar: avatarUrl })
    console.log('更新用户信息响应:', updateResponse)
    
      // 从后端响应中获取完整的用户信息
      const updatedUserInfo = updateResponse
      if (userInfo.value) {
          Object.assign(userInfo.value, updatedUserInfo)
          setUserInfo(userInfo.value, true) // 保存到localStorage
        }
        // 强制触发响应式更新
        userInfo.value = { ...userInfo.value }
        // 触发全局事件，通知其他组件用户信息已更新
        window.dispatchEvent(new CustomEvent('user-info-updated'))
        ElMessage.success('头像更新成功!')
        uploading.value=false
  
}

// 保存用户信息
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    console.log('保存用户信息:', userForm)
    
    // 调用authApi的updateUserInfo方法保存用户信息
    const response = await authApi.updateUserInfo(userForm)
    console.log('保存用户信息响应:', response)
    
    // 检查更新是否成功
    if (response && response.success) {
      // 从后端响应中获取完整的用户信息
      const updatedUserInfo = response.data
      if (updatedUserInfo) {
        // 更新本地用户信息引用
        if (userInfo.value) {
          Object.assign(userInfo.value, updatedUserInfo)
          setUserInfo(userInfo.value, true)
        }
        // 强制触发响应式更新
        userInfo.value = { ...userInfo.value }
        // 触发全局事件，通知其他组件用户信息已更新
        window.dispatchEvent(new CustomEvent('user-info-updated'))
      } else {
        // 如果没有返回完整用户信息，只更新表单数据
        if (userInfo.value) {
          Object.assign(userInfo.value, userForm)
          setUserInfo(userInfo.value, true)
          userInfo.value = { ...userInfo.value }
          window.dispatchEvent(new CustomEvent('user-info-updated'))
        }
      }
      ElMessage.success('保存成功!')
    } else {
      throw new Error(response?.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (userInfo.value) {
    Object.assign(userForm, {
      username: userInfo.value.username || userInfo.value.userName || '',
      nickName: userInfo.value.nickName || '',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || '',
      bio: userInfo.value.bio || ''
    })
  }
}

// 初始化数据
onMounted(() => {
  userInfo.value = getUserInfo()
  if (userInfo.value) {
    Object.assign(userForm, {
      username: userInfo.value.username || userInfo.value.userName || '',
      nickName: userInfo.value.nickName || '',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || '',
      bio: userInfo.value.bio || ''
    })
  }
})
</script>

<style scoped>
.profile-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

.profile-card {
  border-radius: 12px;
}

.profile-content {
  display: flex;
  gap: 40px;
}

.avatar-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.avatar-overlay {
  margin-top: 16px;
  text-align: center;
}

.avatar-tips {
  text-align: center;
}

.avatar-tips p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.info-section {
  flex: 1;
  padding: 20px;
}

.el-form {
  max-width: 500px;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .avatar-section {
    padding: 10px;
  }
  
  .info-section {
    padding: 10px;
  }
}
</style> 