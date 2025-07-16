<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
const default_countdown = 60
const phone = ref('')
const code = ref('')
const loading = ref(false)
const sms_disabled = ref(false)
const sms_text = ref('获取验证码')
const countdown = ref(default_countdown)
let timer = null
const send_sms_times = ref(0)
const phoneError = ref('')
const smsCodeError = ref('')
import { useRouter } from 'vue-router'
const router = useRouter()

const validatePhone = () => {
  // 简单的手机号正则（中国大陆11位手机号）
  const reg = /^1\d{10}$/
  if (!reg.test(phone.value)) {
    ElMessage.warning(phone.value)
    phoneError.value = '请输入正确的手机号'
    return false
  } else {
    phoneError.value = ''
    return true
  }
}

const validateCode = () => {
    var    ret= code.value.length ==4;
    if (!ret) {
        smsCodeError.value = '请输入正确的验证码'
        return false
    } else {
        smsCodeError.value = ''
        return true
    }
}


const getCode = async () => {
    if (send_sms_times.value > 3) {
        ElMessage.error('获取验证码次数过多，请稍后再试')
        return
    }
    if (sms_disabled.value) return
    
    // 验证手机号
    if (!validatePhone()) {
        ElMessage.warning('请输入正确的手机号')
        return
    }
    
    try {
        await authApi.sendSmsCode(phone.value)
        send_sms_times.value++
        sms_disabled.value = true
        countdown.value = default_countdown
        sms_text.value = `${countdown.value}秒后可再次获取`
        timer = setInterval(() => {
            countdown.value--
            sms_text.value = `${countdown.value}秒后可再次获取`
            if (countdown.value === 0) {
                clearInterval(timer)
                sms_disabled.value = false
                sms_text.value = '获取验证码'
            }
        }, 1000)
        ElMessage.success('验证码已发送')
    } catch (error) {
        console.error('发送验证码失败:', error)
    }
}

const login = async () => {
  loading.value = true
  
  try {
    if (!validatePhone() || !validateCode()) {
      ElMessage.warning('请检查手机号和验证码')
      return
    }
    
    const loginData = {
      phone: phone.value,
      code: code.value
    }
    
    const result = await authApi.login(loginData)
    
    // 保存token
    if (result.token) {
      localStorage.setItem('token', result.token)
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

</script>

<template>
        <router-view />

  <div class="login-bg">
    <div class="login-panel">
      <h2 class="login-title">统一登录平台</h2>
      <el-input v-model="phone" placeholder="请输入手机号" size="large" class="login-input"   @blur="validatePhone"
      />
      <div v-if="phoneError" class="error-tip">{{ phoneError }}</div>
      <div class="login-code-row">
        <el-input v-model="code" placeholder="输入验证码" @blur="validateCode" size="large" class="login-input-code" />
        <el-button type="warning" @click="getCode" size="large"  :disabled="sms_disabled"  class="login-code-btn">{{sms_text }} </el-button>
      </div>
      <div v-if="smsCodeError" class="error-tip">{{ smsCodeError }}</div>

      <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="login" round>登录</el-button>
      <div class="login-divider"></div>
      <!-- <el-button class="login-dingtalk-btn" icon="el-icon-dingtalk" plain>钉钉登录</el-button> -->
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: url('你的背景图地址.jpg') no-repeat center center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.login-panel {
  width: 380px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 40px 32px 32px 32px;
  margin-right: 8vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 32px;
  color: #2d3a4b;
  letter-spacing: 2px;
}
.login-input {
  width: 100%;
  margin-bottom: 18px;
}
.login-code-row {
  display: flex;
  width: 100%;
  margin-bottom: 18px;
}
.login-input-code {
  flex: 1;
}
.login-code-btn {
  margin-left: 12px;
}
.login-btn {
  width: 100%;
  margin-bottom: 18px;
}
.login-divider {
  width: 100%;
  text-align: center;
  color: #bbb;
  margin: 18px 0 10px 0;
  border-bottom: 1px solid #eee;
  line-height: 0.1em;
}
.login-divider:after {
  content: '其他登录方式';
  background: #fff;
  padding: 0 10px;
  position: relative;
  top: -0.7em;
}
.login-dingtalk-btn {
  width: 100%;
  color: #1677ff;
  border-color: #1677ff;
}


.error-tip {
  color: #f56c6c;
  font-size: 13px;
  margin-top: -12px;
  margin-bottom: 8px;
  width: 100%;
  text-align: left;
}
</style>