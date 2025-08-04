<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="用户反馈"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="feedback-form"
    >
      <el-form-item label="联系方式" prop="contact">
        <el-input
          v-model="form.contact"
          placeholder="请输入您的邮箱或手机号"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="问题类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择问题类型"
          style="width: 100%"
        >
          <el-option label="功能建议" value="suggestion" />
          <el-option label="问题反馈" value="bug" />
          <el-option label="使用咨询" value="question" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="问题描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="6"
          placeholder="请详细描述您遇到的问题或建议..."
        />
      </el-form-item>
      
      <el-form-item label="附件" prop="attachments">
        <div class="attachment-container">
          <div
            v-for="(attachment, index) in form.attachments"
            :key="index"
            class="attachment-item"
          >
            <div class="attachment-info">
              <el-icon><Document /></el-icon>
              <span class="attachment-name">{{ attachment.name }}</span>
              <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
            </div>
            <el-button
              type="danger"
              size="small"
              circle
              @click="removeAttachment(index)"
              class="remove-btn"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <el-upload
            v-if="form.attachments.length < 5"
            :show-file-list="false"
            :before-upload="handleAttachmentUpload"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            class="upload-btn"
          >
            <el-button type="dashed">
              <el-icon><Plus /></el-icon>
              添加附件
            </el-button>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交反馈
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Close, Plus } from '@element-plus/icons-vue'
import { getUserInfo } from '@/utils/auth.js'
import { submitFeedback } from '@/api/feedback.js'
import { dashboardApi } from '@/api/dashboard.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const submitting = ref(false)

const form = reactive({
  contact: '',
  type: '',
  description: '',
  attachments: []
})

const rules = {
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择问题类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' }
  ]
}

const handleClose = () => {
  ElMessageBox.confirm(
    '确定要关闭反馈对话框吗？未保存的内容将丢失。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    emit('update:visible', false)
  }).catch(() => {
    // 用户取消
  })
}

const handleAttachmentUpload = async (file) => {
  try {
    // 检查文件大小（限制10MB）
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过10MB')
      return false
    }
    
    // 使用dashboardApi.uploadFile方法上传
    const response = await dashboardApi.uploadFile(file, 'FEEDBACK')
    console.log('附件上传响应:', response)
    
    if (response && response.success && response.data) {
      // 使用externalUrl作为文件地址
      const fileUrl = response.data.externalUrl || response.data.internalUrl || response.data.path
      form.attachments.push({
        name: file.name,
        size: file.size,
        url: fileUrl,
        type: file.type
      })
      ElMessage.success('附件上传成功')
    } else {
      ElMessage.error('附件上传失败')
    }
  } catch (error) {
    console.error('附件上传失败:', error)
    ElMessage.error('附件上传失败')
  }
  return false // 阻止默认上传
}

const removeAttachment = (index) => {
  form.attachments.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 获取用户信息
    const userInfo = getUserInfo()
    
    // 准备提交数据
    const submitData = {
      ...form,
      userId: userInfo?.id,
      userName: userInfo?.userName,
      userToken: localStorage.getItem('token'),
      submitTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      status: 'pending' // 设置初始状态
    }
    
    console.log('提交反馈数据:', submitData)
    
    // 调用API提交数据
    const response = await submitFeedback(submitData)
    
    console.log('API响应:', response)
    
    ElMessage.success('反馈提交成功，我们会尽快处理')
    emit('submit', submitData)
    emit('update:visible', false)
    
    // 重置表单
    form.contact = ''
    form.type = ''
    form.description = ''
    form.attachments = []
    
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-form {
  max-height: 60vh;
  overflow-y: auto;
}

.attachment-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.attachment-name {
  font-size: 14px;
  color: #303133;
  flex: 1;
}

.attachment-size {
  font-size: 12px;
  color: #909399;
}

.remove-btn {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.upload-btn {
  display: flex;
  justify-content: center;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .attachment-item {
    padding: 8px;
  }
  
  .attachment-name {
    font-size: 12px;
  }
  
  .attachment-size {
    font-size: 11px;
  }
}
</style> 