<template>
  <div class="vcard-form">
    <h4>电子名片设置</h4>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px" size="small">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="姓名" prop="fullName">
            <el-input
              v-model="formData.fullName"
              placeholder="请输入姓名"
              @input="handleUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职位">
            <el-input
              v-model="formData.title"
              placeholder="职位/职务"
              @input="handleUpdate"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="公司/组织">
        <el-input
          v-model="formData.organization"
          placeholder="公司或组织名称"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="手机号码">
            <el-input
              v-model="formData.phone"
              placeholder="手机号码"
              @input="handleUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电子邮箱">
            <el-input
              v-model="formData.email"
              placeholder="邮箱地址"
              @input="handleUpdate"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="网站">
        <el-input
          v-model="formData.website"
          placeholder="个人或公司网站"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="地址">
        <el-input
          v-model="formData.address"
          type="textarea"
          :rows="2"
          placeholder="工作地址或通讯地址"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.note"
          type="textarea"
          :rows="2"
          placeholder="其他信息"
          @input="handleUpdate"
        />
      </el-form-item>
    </el-form>
    
    <div class="vcard-preview">
      <h5>名片预览</h5>
      <div class="card-content">
        <div class="card-name">{{ formData.fullName || '姓名' }}</div>
        <div v-if="formData.title" class="card-title">{{ formData.title }}</div>
        <div v-if="formData.organization" class="card-org">{{ formData.organization }}</div>
        <div class="card-contacts">
          <div v-if="formData.phone">📱 {{ formData.phone }}</div>
          <div v-if="formData.email">✉️ {{ formData.email }}</div>
          <div v-if="formData.website">🌐 {{ formData.website }}</div>
        </div>
      </div>
    </div>
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
  fullName: '',
  title: '',
  organization: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  note: '',
  ...props.modelValue
})

const rules = {
  fullName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
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
.vcard-form h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.vcard-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.vcard-preview h5 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 13px;
}

.card-content {
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.card-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.card-title {
  color: #606266;
  margin-bottom: 2px;
}

.card-org {
  color: #909399;
  font-size: 14px;
  margin-bottom: 12px;
}

.card-contacts {
  font-size: 13px;
  line-height: 1.6;
}

.card-contacts div {
  margin-bottom: 4px;
  color: #606266;
}
</style> 