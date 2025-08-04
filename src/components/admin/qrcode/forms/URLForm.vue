<template>
  <div class="url-form">
    <h4>网址链接设置</h4>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px" size="small">
      <el-form-item label="网址" prop="url">
        <el-input
          v-model="formData.url"
          placeholder="请输入完整的网址，如：https://www.example.com"
          @input="handleUpdate"
        >
          <template #prepend>
            <el-select v-model="urlProtocol" style="width: 80px" @change="handleProtocolChange">
              <el-option label="https://" value="https://" />
              <el-option label="http://" value="http://" />
              <el-option label="ftp://" value="ftp://" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="标题">
        <el-input
          v-model="formData.title"
          placeholder="网页标题（可选）"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="网页描述（可选）"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item>
        <div class="form-actions">
          <el-button size="small" @click="validateUrl" :icon="Check">验证网址</el-button>
          <el-button size="small" @click="previewUrl" :icon="View">预览网页</el-button>
        </div>
      </el-form-item>
    </el-form>
    
    <div v-if="urlInfo.title || urlInfo.description" class="url-info">
      <h5>网页信息</h5>
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item v-if="urlInfo.title" label="标题">
          {{ urlInfo.title }}
        </el-descriptions-item>
        <el-descriptions-item v-if="urlInfo.description" label="描述">
          {{ urlInfo.description }}
        </el-descriptions-item>
        <el-descriptions-item v-if="urlInfo.favicon" label="图标">
          <img :src="urlInfo.favicon" alt="网站图标" class="favicon" />
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, View } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

const formRef = ref()
const formData = ref({
  url: '',
  title: '',
  description: '',
  ...props.modelValue
})

const urlInfo = ref({
  title: '',
  description: '',
  favicon: ''
})

const urlProtocol = ref('https://')

const rules = {
  url: [
    { required: true, message: '请输入网址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的网址格式', trigger: 'blur' }
  ]
}

const handleUpdate = () => {
  emit('update:modelValue', formData.value)
  emit('update', formData.value)
}

const handleProtocolChange = (protocol) => {
  if (formData.value.url && !formData.value.url.includes('://')) {
    formData.value.url = protocol + formData.value.url
    handleUpdate()
  }
}

const validateUrl = async () => {
  try {
    await formRef.value.validateField('url')
    
    // 这里可以调用API验证URL是否有效
    // const result = await validateURL(formData.value.url)
    
    ElMessage.success('网址格式正确')
  } catch (error) {
    ElMessage.error('网址格式错误')
  }
}

const previewUrl = () => {
  if (formData.value.url) {
    window.open(formData.value.url, '_blank')
  } else {
    ElMessage.warning('请先输入网址')
  }
}

watch(() => props.modelValue, (newValue) => {
  formData.value = { ...formData.value, ...newValue }
}, { deep: true })

onMounted(() => {
  // 自动检测协议
  if (formData.value.url) {
    const match = formData.value.url.match(/^(https?|ftp):\/\//)
    if (match) {
      urlProtocol.value = match[0]
    }
  }
})
</script>

<style scoped>
.url-form h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.url-info {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.url-info h5 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 13px;
}

.favicon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 4px 0 0 4px;
}
</style> 