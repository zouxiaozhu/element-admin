<template>
  <div class="email-form">
    <h4>邮箱设置</h4>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px" size="small">
      <el-form-item label="邮箱地址" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱地址"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="邮件主题">
        <el-input
          v-model="formData.subject"
          placeholder="邮件主题（可选）"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="邮件内容">
        <el-input
          v-model="formData.body"
          type="textarea"
          :rows="4"
          placeholder="邮件内容（可选）"
          @input="handleUpdate"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

const formRef = ref()
const formData = ref({
  email: '',
  subject: '',
  body: '',
  ...props.modelValue
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleUpdate = () => {
  emit('update:modelValue', formData.value)
  emit('update', formData.value)
}

watch(() => props.modelValue, (newValue) => {
  formData.value = { ...formData.value, ...newValue }
}, { deep: true })
</script>

<style scoped>
.email-form h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}
</style> 