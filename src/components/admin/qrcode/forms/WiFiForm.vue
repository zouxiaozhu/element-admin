<template>
  <div class="wifi-form">
    <h4>WiFi网络设置</h4>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" size="small">
      <el-form-item label="网络名称" prop="ssid">
        <el-input
          v-model="formData.ssid"
          placeholder="请输入WiFi网络名称(SSID)"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="安全类型" prop="security">
        <el-select v-model="formData.security" placeholder="请选择安全类型" style="width: 100%" @change="handleUpdate">
          <el-option label="WPA/WPA2" value="WPA" />
          <el-option label="WEP" value="WEP" />
          <el-option label="无密码" value="nopass" />
        </el-select>
      </el-form-item>
      
      <el-form-item 
        v-if="formData.security !== 'nopass'" 
        label="网络密码" 
        prop="password"
      >
        <el-input
          v-model="formData.password"
          type="password"
          show-password
          placeholder="请输入WiFi密码"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="隐藏网络">
        <el-switch
          v-model="formData.hidden"
          active-text="是"
          inactive-text="否"
          @change="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="网络描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="网络描述（可选）"
          @input="handleUpdate"
        />
      </el-form-item>
    </el-form>
    
    <div class="wifi-preview">
      <h5>WiFi配置预览</h5>
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="网络名称">{{ formData.ssid || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="安全类型">{{ getSecurityName(formData.security) }}</el-descriptions-item>
        <el-descriptions-item v-if="formData.security !== 'nopass'" label="密码">
          {{ formData.password ? '已设置' : '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="隐藏网络">{{ formData.hidden ? '是' : '否' }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

const formRef = ref()
const formData = ref({
  ssid: '',
  security: 'WPA',
  password: '',
  hidden: false,
  description: '',
  ...props.modelValue
})

const rules = computed(() => ({
  ssid: [
    { required: true, message: '请输入WiFi网络名称', trigger: 'blur' },
    { min: 1, max: 32, message: '网络名称长度在1-32个字符', trigger: 'blur' }
  ],
  security: [
    { required: true, message: '请选择安全类型', trigger: 'change' }
  ],
  password: formData.value.security !== 'nopass' ? [
    { required: true, message: '请输入网络密码', trigger: 'blur' },
    { min: 8, message: '密码至少需要8个字符', trigger: 'blur' }
  ] : []
}))

const handleUpdate = () => {
  emit('update:modelValue', formData.value)
  emit('update', formData.value)
}

const getSecurityName = (security) => {
  const nameMap = {
    'WPA': 'WPA/WPA2',
    'WEP': 'WEP',
    'nopass': '无密码'
  }
  return nameMap[security] || security
}

watch(() => props.modelValue, (newValue) => {
  formData.value = { ...formData.value, ...newValue }
}, { deep: true })

watch(() => formData.value.security, (newSecurity) => {
  if (newSecurity === 'nopass') {
    formData.value.password = ''
  }
})
</script>

<style scoped>
.wifi-form h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.wifi-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.wifi-preview h5 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 13px;
}
</style> 