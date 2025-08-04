<template>
  <div class="sms-form">
    <h4>短信设置</h4>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px" size="small">
      <el-form-item label="手机号码" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号码"
          @input="handleUpdate"
        >
          <template #prepend>
            <el-select v-model="formData.countryCode" style="width: 80px" @change="handleUpdate">
              <el-option label="+86" value="+86" />
              <el-option label="+1" value="+1" />
              <el-option label="+44" value="+44" />
              <el-option label="+81" value="+81" />
              <el-option label="+82" value="+82" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="短信内容" prop="message">
        <el-input
          v-model="formData.message"
          type="textarea"
          :rows="4"
          placeholder="请输入短信内容"
          maxlength="160"
          show-word-limit
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item>
        <div class="sms-info">
          <el-alert
            title="扫描二维码后将自动打开短信应用并填入号码和内容"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
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
  phone: '',
  countryCode: '+86',
  message: '',
  ...props.modelValue
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^[0-9]{11}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入短信内容', trigger: 'blur' },
    { max: 160, message: '短信内容不能超过160个字符', trigger: 'blur' }
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
.sms-form h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.sms-info {
  width: 100%;
}
</style> 