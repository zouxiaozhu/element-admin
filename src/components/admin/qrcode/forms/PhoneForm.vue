<template>
  <div class="phone-form">
    <h4>电话号码设置</h4>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px" size="small">
      <el-form-item label="电话号码" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入电话号码"
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
      
      <el-form-item label="联系人">
        <el-input
          v-model="formData.contactName"
          placeholder="联系人姓名（可选）"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.note"
          type="textarea"
          :rows="2"
          placeholder="备注信息（可选）"
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
  phone: '',
  countryCode: '+86',
  contactName: '',
  note: '',
  ...props.modelValue
})

const rules = {
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^[0-9-\s()]+$/, message: '请输入正确的电话号码格式', trigger: 'blur' }
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
.phone-form h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}
</style> 