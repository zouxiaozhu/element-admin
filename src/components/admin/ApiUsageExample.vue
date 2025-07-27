<template>
  <div class="api-usage-example">
    <h3>API调用示例</h3>
    
    <el-card>
      <h4>方式一：直接使用API响应</h4>
      <el-button @click="directApiCall" :loading="loading1">直接API调用</el-button>
      <pre v-if="result1">{{ JSON.stringify(result1, null, 2) }}</pre>
    </el-card>
    
    <el-card>
      <h4>方式二：使用辅助工具</h4>
      <el-button @click="helperApiCall" :loading="loading2">辅助工具调用</el-button>
      <pre v-if="result2">{{ JSON.stringify(result2, null, 2) }}</pre>
    </el-card>
    
    <el-card>
      <h4>方式三：错误处理示例</h4>
      <el-button @click="errorApiCall" :loading="loading3">错误API调用</el-button>
      <pre v-if="result3">{{ JSON.stringify(result3, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authApi } from '@/api/auth'
import { handleApiCall, callWithSuccess, callSilently } from '@/utils/apiHelper'

const loading1 = ref(false)
const loading2 = ref(false)
const loading3 = ref(false)
const result1 = ref(null)
const result2 = ref(null)
const result3 = ref(null)

// 方式一：直接使用API响应
const directApiCall = async () => {
  loading1.value = true
  try {
    const response = await authApi.getUserInfo()
    
    // 访问响应的各个部分
    result1.value = {
      method: '直接API调用',
      success: response.success,
      code: response.code || response.getCode?.(),
      message: response.message || response.getMessage?.(),
      data: response.data || response.getData?.(),
      isSuccess: response.isSuccess ? response.isSuccess() : response.success === true
    }
  } catch (error) {
    result1.value = {
      method: '直接API调用（错误）',
      success: false,
      code: error.code,
      message: error.message,
      data: error.data,
      httpStatus: error.httpStatus
    }
  } finally {
    loading1.value = false
  }
}

// 方式二：使用辅助工具
const helperApiCall = async () => {
  loading2.value = true
  
  const result = await handleApiCall(
    () => authApi.getUserInfo(),
    {
      showSuccess: true,
      successMessage: '获取用户信息成功'
    }
  )
  
  result2.value = {
    method: '辅助工具调用',
    ...result
  }
  
  loading2.value = false
}

// 方式三：模拟错误API调用
const errorApiCall = async () => {
  loading3.value = true
  
  try {
    // 模拟一个会失败的API调用
    const response = await authApi.login({ userName: 'invalid', password: 'invalid' })
    
    result3.value = {
      method: '错误API调用',
      success: response.success,
      code: response.code,
      message: response.message,
      data: response.data
    }
  } catch (error) {
    result3.value = {
      method: '错误API调用（捕获异常）',
      success: false,
      code: error.code,
      message: error.message,
      data: error.data,
      httpStatus: error.httpStatus,
      errorType: error.type
    }
  } finally {
    loading3.value = false
  }
}
</script>

<style scoped>
.api-usage-example {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style> 