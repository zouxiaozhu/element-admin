<template>
  <div class="my-feedback">
    <div class="page-header">
      <h2>我的反馈</h2>
    </div>

    <!-- 我要反馈按钮 -->
    <el-card class="submit-feedback-card">
      <div class="submit-feedback-content">
        <div class="submit-feedback-info">
          <h3>有新的问题或建议？</h3>
          <p>提交您的反馈，我们会尽快处理并回复</p>
        </div>
        <el-button type="primary" size="large" @click="showFeedbackDialog">
          <el-icon><ChatDotRound /></el-icon>
          我要反馈
        </el-button>
      </div>
    </el-card>

    <!-- 联系群二维码 -->
    <el-card class="contact-card">
      <template #header>
        <div class="card-header">
          <span>开发者联系群</span>
        </div>
      </template>
      <div class="contact-content">
        <div class="contact-info">
          <p>如果您有紧急问题或需要技术支持，欢迎加入我们的开发者联系群：</p>
          <ul>
            <li>微信群：Excel管理系统技术支持群</li>
            <li>QQ群：123456789</li>
            <li>工作时间：周一至周五 9:00-18:00</li>
          </ul>
        </div>
        <div class="qrcode-display">
          <img src="/qrcode.jpg" alt="联系群二维码" />
        </div>
      </div>
    </el-card>

    <!-- 反馈列表 -->
    <el-card class="feedback-list-card">
      <template #header>
        <div class="card-header">
          <span>反馈历史</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <el-table
        :data="feedbackList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="反馈ID" width="80" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回复" width="80">
          <template #default="{ row }">
            <div class="reply-badge-wrapper">
              <el-badge :value="getUnreadReplyCount(row)" :hidden="getUnreadReplyCount(row) === 0" class="reply-badge">
                <el-icon><ChatDotRound /></el-icon>
              </el-badge>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="反馈详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="反馈ID">{{ currentFeedback.id }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentFeedback.contact }}</el-descriptions-item>
          <el-descriptions-item label="问题类型">
            <el-tag :type="getTypeTag(currentFeedback.type)">
              {{ getTypeLabel(currentFeedback.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentFeedback.status)">
              {{ getStatusLabel(currentFeedback.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatTime(currentFeedback.submitTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(currentFeedback.updateTime) }}</el-descriptions-item>
        </el-descriptions>

        <div class="description-section">
          <h4>问题描述</h4>
          <div class="description-content">{{ currentFeedback.description }}</div>
        </div>

        <div v-if="currentFeedback.attachments && currentFeedback.attachments.length > 0" class="attachments-section">
          <h4>附件</h4>
          <div class="attachments-grid">
            <div
              v-for="(attachment, index) in currentFeedback.attachments"
              :key="index"
              class="attachment-item"
            >
              <div class="attachment-info">
                <el-icon><Document /></el-icon>
                <span class="attachment-name">{{ attachment.name }}</span>
                <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
              </div>
              <el-button size="small" @click="downloadAttachment(attachment)">
                下载
              </el-button>
            </div>
          </div>
        </div>

        <div v-if="currentFeedback.replies && currentFeedback.replies.length > 0" class="replies-section">
          <div class="replies-header">
            <h4>开发者回复 ({{ currentFeedback.replies.length }})</h4>
            <div class="replies-summary">
              <el-tag size="small" type="info">{{ currentFeedback.replies.length }}条回复</el-tag>
              <el-tag v-if="getUnreadReplyCount(currentFeedback) > 0" size="small" type="warning">
                {{ getUnreadReplyCount(currentFeedback) }}条未读
              </el-tag>
            </div>
          </div>
          <div class="replies-list">
            <div
              v-for="(reply, index) in currentFeedback.replies"
              :key="reply.id"
              class="reply-item"
              :class="{ unread: !reply.isRead }"
            >
              <div class="reply-avatar">
                <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <div class="reply-badge" v-if="!reply.isRead">
                  <el-icon><ChatDotRound /></el-icon>
                </div>
              </div>
              <div class="reply-content">
                <div class="reply-header">
                  <div class="reply-info">
                    <div class="reply-author">{{ reply.replierName || '系统管理员' }}</div>
                    <div class="reply-time">{{ formatTime(reply.createTime) }}</div>
                  </div>
                  <div class="reply-status">
                    <el-tag v-if="!reply.isRead" size="small" type="warning">未读</el-tag>
                    <el-tag v-else size="small" type="success">已读</el-tag>
                  </div>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-reply">
          <el-empty description="暂无回复" />
        </div>
      </div>
    </el-dialog>

    <!-- 反馈提交对话框 -->
    <el-dialog
      v-model="feedbackVisible"
      title="提交反馈"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="feedbackFormRef"
        :model="feedbackForm"
        :rules="feedbackRules"
        label-width="100px"
        class="feedback-form"
      >
        <el-form-item label="联系方式" prop="contact">
          <el-input
            v-model="feedbackForm.contact"
            placeholder="请输入您的邮箱或手机号"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="问题类型" prop="type">
          <el-select
            v-model="feedbackForm.type"
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
            v-model="feedbackForm.description"
            type="textarea"
            :rows="6"
            placeholder="请详细描述您遇到的问题或建议..."
          />
        </el-form-item>
        
        <el-form-item label="附件" prop="attachments">
          <div class="attachment-container">
            <div
              v-for="(attachment, index) in feedbackForm.attachments"
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
              v-if="feedbackForm.attachments.length < 5"
              :show-file-list="false"
              :before-upload="handleAttachmentUpload"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              class="upload-btn"
            >
              <el-button type="primary" plain>
                <el-icon><Plus /></el-icon>
                添加附件
              </el-button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="feedbackVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmitFeedback"
          >
            提交反馈
          </el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, ChatDotRound, Close, Plus } from '@element-plus/icons-vue'
import { getUserInfo } from '@/utils/auth.js'
import { getMyFeedback, markFeedbackAsRead as apiMarkFeedbackAsRead, markReplyAsRead, submitFeedback } from '@/api/feedback'

// 反馈列表
const feedbackList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 对话框状态
const detailVisible = ref(false)
const feedbackVisible = ref(false)
const currentFeedback = ref(null)

// 反馈表单
const feedbackFormRef = ref()
const submitting = ref(false)
const feedbackForm = reactive({
  contact: '',
  type: '',
  description: '',
  attachments: []
})

// 反馈表单验证规则
const phoneRegex = /^(?:\+?86)?1[3-9]\d{9}$/
const emailRegex = /^(?:[a-zA-Z0-9_\-.+])+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

const feedbackRules = {
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { validator: (_rule, value, callback) => {
        if (!value) return callback(new Error('请输入联系方式'))
        const isPhone = phoneRegex.test(value)
        const isEmail = emailRegex.test(value)
        if (!isPhone && !isEmail) {
          callback(new Error('联系方式必须为有效的手机号或邮箱'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择问题类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度在 10 到 1000 个字符', trigger: 'blur' }
  ]
}

// 获取我的反馈列表
const loadMyFeedback = async () => {
  loading.value = true
  try {
    const userInfo = getUserInfo()
    // 这里应该调用API获取用户的反馈列表
    const response = await getMyFeedback({
      userId: userInfo?.id,
      page: pagination.current,
      size: pagination.size
    })

const    mockData = response.records || []; 
    feedbackList.value = mockData
    pagination.total = response.total || 0;
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    ElMessage.error('获取反馈列表失败'+error.message)
  } finally {
    loading.value = false
  }
}

// 检查是否有未读数据
const hasUnreadData = (feedback) => {
  const hasUnreadFeedback = !feedback.isRead
  const hasUnreadReplies = feedback.replies && feedback.replies.some(reply => !reply.isRead)
  return hasUnreadFeedback || hasUnreadReplies
}

// 查看详情
const handleView = async (row) => {
  currentFeedback.value = row
  detailVisible.value = true
  
  // 如果有未读数据，自动标记为已读
  if (hasUnreadData(row)) {
    await markFeedbackAsRead(row)
  }
}



// 显示反馈对话框
const showFeedbackDialog = () => {
  feedbackVisible.value = true
}

// 处理附件上传
const handleAttachmentUpload = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  
  feedbackForm.attachments.push({
    name: file.name,
    size: file.size,
    file: file
  })
  
  return false // 阻止自动上传
}

// 移除附件
const removeAttachment = (index) => {
  feedbackForm.attachments.splice(index, 1)
}

// 提交反馈
const handleSubmitFeedback = async () => {
  try {
    await feedbackFormRef.value.validate()
    
    submitting.value = true
    
    // 准备提交数据
    const submitData = {
      contact: feedbackForm.contact,
      type: feedbackForm.type,
      description: feedbackForm.description
    }
    
    // 如果有附件，需要先上传
    if (feedbackForm.attachments.length > 0) {
      // 这里应该实现文件上传逻辑
      // const uploadedFiles = await uploadFiles(feedbackForm.attachments)
      // submitData.attachments = uploadedFiles
    }
    
    // 提交反馈
    const result = await submitFeedback(submitData)
    ElMessage.success('反馈提交成功，我们会尽快处理')
      feedbackVisible.value = false
      handleResetFeedbackForm()
      // 刷新反馈列表
      loadMyFeedback()
  } catch (error) {
    console.error('提交反馈失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置反馈表单
const handleResetFeedbackForm = () => {
  feedbackFormRef.value?.resetFields()
  feedbackForm.attachments = []
}

// 刷新
const handleRefresh = () => {
  loadMyFeedback()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  loadMyFeedback()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadMyFeedback()
}

// 下载附件
const downloadAttachment = (attachment) => {
  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 获取回复数量
const getReplyCount = (feedback) => {
  return feedback.replies ? feedback.replies.length : 0
}

// 获取未读回复数量
const getUnreadReplyCount = (feedback) => {
  if (!feedback.replies) return 0
  return feedback.replies.filter(reply => !reply.isRead).length
}

// 获取未读数量
const unreadCount = computed(() => {
  let count = 0
  feedbackList.value.forEach(feedback => {
    // 检查反馈本身是否未读
    if (!feedback.isRead) count++
    // 检查回复是否未读
    if (feedback.replies) {
      count += feedback.replies.filter(reply => !reply.isRead).length
    }
  })
  return count
})

// 标记单个反馈为已读
const markFeedbackAsRead = async (feedback) => {
  try {
    // 检查是否有未读数据
    const hasUnreadFeedback = !feedback.isRead
    const hasUnreadReplies = feedback.replies && feedback.replies.some(reply => !reply.isRead)
    
    if (!hasUnreadFeedback && !hasUnreadReplies) {
      console.log('没有未读数据，跳过标记已读')
      return
    }
    
    // 调用API标记反馈为已读
    if (hasUnreadFeedback) {
      await apiMarkFeedbackAsRead(feedback.id)
      feedback.isRead = true
    }
    
    // 调用API标记所有未读回复为已读
    if (hasUnreadReplies) {
      const unreadReplies = feedback.replies.filter(reply => !reply.isRead)
      for (const reply of unreadReplies) {
        await markReplyAsRead(reply.feedbackId)
        reply.isRead = true
      }
    }
    
    // 更新列表中的对应项
    const index = feedbackList.value.findIndex(item => item.id === feedback.id)
    if (index !== -1) {
      feedbackList.value[index] = { ...feedback }
    }
    
    console.log('反馈和回复已标记为已读:', feedback.id)
    
    // 通知Header更新未读数量
    window.dispatchEvent(new CustomEvent('update-unread-count', {
      detail: { count: unreadCount.value }
    }))
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}



// 工具函数
const getTypeTag = (type) => {
  const tags = {
    suggestion: 'success',
    bug: 'danger',
    question: 'info',
    other: 'warning'
  }
  return tags[type] || 'info'
}

const getTypeLabel = (type) => {
  const labels = {
    suggestion: '功能建议',
    bug: '问题反馈',
    question: '使用咨询',
    other: '其他'
  }
  return labels[type] || '未知'
}

const getStatusTag = (status) => {
  const tags = {
    pending: 'warning',
    processing: 'info',
    replied: 'success',
    closed: 'danger'
  }
  return tags[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    processing: '处理中',
    replied: '已回复',
    closed: '已关闭'
  }
  return labels[status] || '未知'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  loadMyFeedback()
})
</script>

<style scoped>
.my-feedback {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.submit-feedback-card {
  margin-bottom: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.submit-feedback-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  color: white;
}

.submit-feedback-info h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.submit-feedback-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.submit-feedback-content .el-button {
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: white;
  font-weight: 700;
  padding: 16px 32px;
  font-size: 18px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.submit-feedback-content .el-button:hover {
  background: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
}

.contact-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.contact-info {
  line-height: 1.6;
  flex: 1;
}

.contact-info p {
  margin-bottom: 12px;
  color: #606266;
}

.contact-info ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.contact-info li {
  margin-bottom: 8px;
}

.qrcode-display {
  flex-shrink: 0;
}

.qrcode-display img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.feedback-list-card {
  border-radius: 12px;
}

/* 增加表格行高 */
:deep(.el-table) {
  --el-table-row-height: 60px;
}

:deep(.el-table .el-table__row) {
  height: 60px;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

/* 调整表格内容垂直居中 */
:deep(.el-table .cell) {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 回复徽章样式 */
.reply-badge-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 8px;
}

.reply-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.reply-badge .el-icon {
  font-size: 16px;
  color: #409eff;
}

/* 修复徽章数字被盖住的问题 */
:deep(.el-badge__content) {
  z-index: 10;
  transform: translateY(-50%) translateX(50%);
}

:deep(.el-badge__content.is-fixed) {
  position: absolute;
  top: 0;
  right: 10px;
  transform: translateY(-50%) translateX(50%);
}

/* 确保徽章数字完全可见 */
:deep(.el-badge) {
  position: relative;
}

:deep(.el-badge .el-badge__content) {
  position: absolute;
  top: -8px;
  right: -8px;
  transform: scale(0.8);
  z-index: 20;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.feedback-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.description-section,
.attachments-section,
.reply-section {
  margin-top: 20px;
}

.description-section h4,
.attachments-section h4,
.reply-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.description-content {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.attachments-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
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

.replies-section {
  margin-top: 24px;
}

.replies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.replies-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.replies-summary {
  display: flex;
  gap: 8px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.reply-item.unread {
  background: #fff7e6;
  border-color: #ffd666;
  box-shadow: 0 2px 8px rgba(255, 214, 102, 0.2);
}

.reply-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.reply-avatar {
  position: relative;
  flex-shrink: 0;
}

.reply-avatar .reply-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.reply-info {
  flex: 1;
  min-width: 0;
}

.reply-author {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-status {
  flex-shrink: 0;
  margin-left: 12px;
}

.reply-text {
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  font-size: 14px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

/* 反馈表单样式 */
.feedback-form {
  max-width: 100%;
}

.attachment-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
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
  margin-left: 8px;
}

.upload-btn {
  margin-top: 8px;
}

.dialog-footer {
  text-align: right;
}

.no-reply {
  padding: 40px 0;
  text-align: center;
}



@media (max-width: 768px) {
  .my-feedback {
    padding: 16px;
  }
  
  .page-header h2 {
    font-size: 24px;
  }
  
  .contact-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .qrcode-display img {
    width: 100px;
    height: 100px;
  }
  
  .submit-feedback-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style> 