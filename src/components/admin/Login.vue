<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Phone } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { login, register, setToken, setUserInfo, getToken, saveLoginInfo, getSavedLoginInfo, removeSavedLoginInfo } from '@/utils/auth.js'
import { authApi } from '@/api/auth'
const router = useRouter()
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const isRegisterMode = ref(false)

// 登录表单数据
const loginForm = reactive({
  userName: '',
  password: '',
  remember: false
})

// 注册表单数据
const registerForm = reactive({
  userName: '',      // 用户名（必填）
  email: '',         // 邮箱（必填）
  password: '',      // 密码（必填）
  confirmPassword: '', // 确认密码
  nickName: '',      // 昵称（可选）
  mobile: '',        // 手机号（可选）
  remember: false
})

// 登录表单验证规则
const loginRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, message: '用户名只能包含中文、字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, message: '用户名只能包含中文、字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      message: '密码必须含大小写字母、数字和特殊字符，且长度至少8位', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
              validator: (rule, value, callback) => {
          if (value !== registerForm.password) {
            callback(new Error('两次密码输入不一致'))
          } else {
            callback()
          }
        },
      trigger: 'blur'
    }
  ],
  mobile: [
    {
      validator: (rule, value, callback) => {
        if (value && !/^1[3-9]\d{9}$/.test(value)) {
          callback(new Error('手机号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  // 验证表单
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  
      try {
      const response = await authApi.login(loginForm)
      // 保存token和用户信息 - 使用userInfo字段
      setToken(response.tokenInfo.accessToken, loginForm.remember)
      setUserInfo(response.userInfo, loginForm.remember)
      
      // 处理记住密码
      if (loginForm.remember) {
        // 保存登录信息
                  saveLoginInfo({
            username: loginForm.userName,
            password: loginForm.password,
            remember: true
          })
      } else {
        // 如果用户取消记住密码，删除保存的登录信息
        removeSavedLoginInfo()
      }
            ElMessage.success('登录成功')
      // 跳转到管理后台
      router.push('/admin')
    } catch (error) {
      console.error('登录失败:', error)
      
      // 检查是否是用户不存在的错误
      if (error.message && error.message.includes('用户不存在')) {
        // 用户不存在，询问是否注册
        ElMessageBox.confirm(
          '用户不存在，是否立即注册？',
          '用户不存在',
          {
            confirmButtonText: '立即注册',
            cancelButtonText: '取消',
            type: 'info',
          }
        ).then(() => {
          // 切换到注册模式并预填用户名
          isRegisterMode.value = true
          registerForm.userName = loginForm.userName
        }).catch(() => {
          // 用户取消
        })
      } else {
        ElMessage.error(error.message || '登录失败，请检查网络连接')
      }
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  // 验证表单
  const valid = await registerFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  
      try {
      const response = await authApi.register(registerForm)
      // 保存token和用户信息 - 使用userInfo字段
      setToken(response.tokenInfo.accessToken, registerForm.remember)
      setUserInfo(response.userInfo, registerForm.remember)
      
      // 处理记住密码
      if (registerForm.remember) {
        // 保存登录信息
        saveLoginInfo({
          username: registerForm.userName,
          password: registerForm.password,
          remember: true
        })
      }
      
      ElMessage.success('注册成功')
      // 跳转到管理后台
      router.push('/admin')
    
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 切换登录/注册模式
const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  // 清空表单错误
  if (loginFormRef.value) {
    loginFormRef.value.clearValidate()
  }
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate()
  }
  
  // 如果从注册模式切换回登录模式，重新初始化登录表单
  if (!isRegisterMode.value) {
    initLoginForm()
  }
}

// 初始化登录表单
const initLoginForm = () => {
  // 恢复保存的登录信息
  const savedLoginInfo = getSavedLoginInfo()
  if (savedLoginInfo) {
    loginForm.userName = savedLoginInfo.username || ''
    loginForm.password = savedLoginInfo.password || ''
    loginForm.remember = savedLoginInfo.remember || false
  } else {
    // 如果没有保存的信息，提供默认演示账号
    loginForm.userName = 'admin'
    loginForm.password = '123456'
    loginForm.remember = false
  }
}

// 清除记住的密码
const clearSavedPassword = () => {
  ElMessageBox.confirm(
    '确定要清除记住的密码吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    removeSavedLoginInfo()
    // 重置表单为默认状态
    loginForm.userName = 'admin'
    loginForm.password = '123456'
    loginForm.remember = false
    ElMessage.success('已清除记住的密码')
  }).catch(() => {
    // 用户取消
  })
}

// 密码强度验证辅助函数
const hasLowerCase = (password) => /[a-z]/.test(password)
const hasUpperCase = (password) => /[A-Z]/.test(password)
const hasNumber = (password) => /\d/.test(password)
const hasSpecialChar = (password) => /[@$!%*?&]/.test(password)

// 组件挂载时检查是否已登录
onMounted(() => {
  const token = getToken()
  if (token) {
    // 已登录，跳转到管理后台
    router.push('/admin')
  } else {
    // 未登录，初始化登录表单
    initLoginForm()
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.svg" alt="Logo" class="logo" />
        <h2 class="login-title">Excel管理系统</h2>
        <p class="login-subtitle">{{ isRegisterMode ? '创建新账户' : '请登录您的账户' }}</p>
      </div>
      
      <!-- 登录表单 -->
      <el-form 
        v-if="!isRegisterMode"
        :model="loginForm" 
        :rules="loginRules" 
        ref="loginFormRef"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="userName">
          <el-input
            v-model="loginForm.userName"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 注册表单 -->
      <el-form 
        v-else
        :model="registerForm" 
        :rules="registerRules" 
        ref="registerFormRef"
        class="login-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="userName">
          <el-input
            v-model="registerForm.userName"
            placeholder="请输入用户名（必填）"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱（必填）"
            size="large"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
          <!-- <div class="password-tips">
            <p class="tip-title">密码要求：</p>
            <ul class="tip-list">
              <li :class="{ valid: hasLowerCase(registerForm.password) }">包含小写字母</li>
              <li :class="{ valid: hasUpperCase(registerForm.password) }">包含大写字母</li>
              <li :class="{ valid: hasNumber(registerForm.password) }">包含数字</li>
              <li :class="{ valid: hasSpecialChar(registerForm.password) }">包含特殊字符(@$!%*?&)</li>
              <li :class="{ valid: registerForm.password.length >= 8 }">长度至少8位</li>
            </ul>
          </div> -->
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="nickName">
          <el-input
            v-model="registerForm.nickName"
            placeholder="请输入昵称（可选）"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="mobile">
          <el-input
            v-model="registerForm.mobile"
            placeholder="请输入手机号（可选）"
            size="large"
            :prefix-icon="Phone"
            clearable
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="registerForm.remember">记住密码</el-checkbox>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-button"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      
              <div class="login-footer">
          <!-- <div v-if="!isRegisterMode" class="demo-account">
            <p>演示账号：admin / 123456</p>
            <p>或者：user1 / 123456</p>
            <div v-if="getSavedLoginInfo()" class="saved-info">
              <el-link type="info" :underline="false" size="small" @click="clearSavedPassword">
                清除记住的密码
              </el-link>
            </div>
          </div> -->
          <div class="toggle-mode">
            <span>{{ isRegisterMode ? '已有账户？' : '没有账户？' }}</span>
            <el-link type="primary" :underline="false" @click="toggleMode">
              {{ isRegisterMode ? '立即登录' : '立即注册' }}
            </el-link>
          </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.2s;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.demo-account {
  font-size: 14px;
  color: #909399;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.demo-account p {
  margin: 4px 0;
}

.saved-info {
  margin-top: 8px;
  text-align: center;
}

.toggle-mode {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.toggle-mode span {
  margin-right: 8px;
}

.saved-info {
  margin-top: 8px;
  text-align: center;
}

/* 密码强度提示样式 */
.password-tips {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.tip-title {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.tip-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tip-list li {
  font-size: 12px;
  color: #6c757d;
  margin: 4px 0;
  padding-left: 16px;
  position: relative;
  transition: color 0.2s;
}

.tip-list li:before {
  content: '✗';
  position: absolute;
  left: 0;
  color: #dc3545;
  font-weight: bold;
  transition: color 0.2s;
}

.tip-list li.valid {
  color: #28a745;
}

.tip-list li.valid:before {
  content: '✓';
  color: #28a745;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
}

/* 表单样式覆盖 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6;
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}

:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}
</style>