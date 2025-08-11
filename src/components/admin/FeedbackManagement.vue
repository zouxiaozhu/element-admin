<template>
  <div class="feedback-management">
    <div class="page-header">
      <h2>用户反馈管理</h2>
      <p>查看和处理用户提交的反馈信息</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in stats" :key="stat.label">
          <el-card class="stat-card" :class="stat.type">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已回复" value="replied" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
            <el-option label="功能建议" value="suggestion" />
            <el-option label="问题反馈" value="bug" />
            <el-option label="使用咨询" value="question" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索联系方式或描述"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 反馈列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>反馈列表</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <el-table
        :data="feedbackList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系方式" width="150" />
        <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleReply(row)"
              v-if="row.status !== 'closed'"
            >
              回复
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="反馈详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="反馈ID">{{ currentFeedback.id }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentFeedback.userName }}</el-descriptions-item>
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
        </el-descriptions>

        <div class="description-section">
          <h4>问题描述</h4>
          <div class="rich-content" v-html="currentFeedback.description"></div>
        </div>

        <div v-if="currentFeedback.screenshots && currentFeedback.screenshots.length > 0" class="screenshots-section">
          <h4>截图</h4>
          <div class="screenshots-grid">
            <div
              v-for="(screenshot, index) in currentFeedback.screenshots"
              :key="index"
              class="screenshot-item"
            >
              <el-image
                :src="screenshot"
                :preview-src-list="currentFeedback.screenshots"
                fit="cover"
              />
            </div>
          </div>
        </div>

        <div v-if="currentFeedback.reply" class="reply-section">
          <h4>回复内容</h4>
          <div class="reply-content">{{ currentFeedback.reply }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyVisible"
      title="回复反馈"
      width="600px"
      destroy-on-close
    >
      <el-form :model="replyForm" :rules="replyRules" ref="replyFormRef">
        <el-form-item label="回复内容" prop="reply">
          <el-input
            v-model="replyForm.reply"
            type="textarea"
            :rows="6"
            placeholder="请输入回复内容..."
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="replyForm.status">
            <el-option label="处理中" value="processing" />
            <el-option label="已回复" value="replied" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="replyVisible = false">取消</el-button>
          <el-button type="primary" @click="handleReplySubmit" :loading="submitting">
            提交回复
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound,
  QuestionFilled,
  Bell,
  Setting,
  Refresh
} from '@element-plus/icons-vue'
import {
  getFeedbackList,
  updateFeedbackStatus,
  replyFeedback,
  deleteFeedback,
  getFeedbackStats
} from '@/api/feedback.js'

// 统计数据
const stats = ref([
  { label: '总反馈', value: 0, icon: ChatDotRound, type: 'primary' },
  { label: '待处理', value: 0, icon: Bell, type: 'warning' },
  { label: '处理中', value: 0, icon: Setting, type: 'info' },
  { label: '已回复', value: 0, icon: QuestionFilled, type: 'success' }
])

// 筛选表单
const filterForm = reactive({
  status: '',
  type: '',
  keyword: ''
})

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
const replyVisible = ref(false)
const currentFeedback = ref(null)
const submitting = ref(false)

// 回复表单
const replyForm = reactive({
  reply: '',
  status: 'replied'
})

const replyRules = {
  reply: [
    { required: true, message: '请输入回复内容', trigger: 'blur' }
  ]
}

const replyFormRef = ref()

// 获取统计数据
const loadStats = async () => {
  try {
    const data = await getFeedbackStats()
    stats.value[0].value = data.total || 0
    stats.value[1].value = data.pending || 0
    stats.value[2].value = data.processing || 0
    stats.value[3].value = data.replied || 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取反馈列表
const loadFeedbackList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      ...filterForm
    }
    
    const response = await getFeedbackList(params)
      feedbackList.value = response.list || []
      pagination.total = response.total || 0
    
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    ElMessage.error('获取反馈列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadFeedbackList()
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    status: '',
    type: '',
    keyword: ''
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadStats()
  loadFeedbackList()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  loadFeedbackList()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadFeedbackList()
}

// 查看详情
const handleView = (row) => {
  currentFeedback.value = row
  detailVisible.value = true
}

// 回复
const handleReply = (row) => {
  currentFeedback.value = row
  replyForm.reply = row.reply || ''
  replyForm.status = row.status
  replyVisible.value = true
}

// 提交回复
const handleReplySubmit = async () => {
  try {
    await replyFormRef.value.validate()
    submitting.value = true
    
    const response = await replyFeedback(currentFeedback.value.id, {
      reply: replyForm.reply,
      status: replyForm.status
    })
    
    if (response.success) {
      ElMessage.success('回复成功')
      replyVisible.value = false
      loadFeedbackList()
      loadStats()
    }
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条反馈吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await deleteFeedback(row.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadFeedbackList()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
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

onMounted(() => {
  loadStats()
  loadFeedbackList()
})
</script>

<style scoped>
.feedback-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
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

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.list-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.screenshots-section,
.reply-section {
  margin-top: 20px;
}

.description-section h4,
.screenshots-section h4,
.reply-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.rich-content {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  line-height: 1.6;
}

.rich-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.screenshot-item {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.screenshot-item .el-image {
  width: 100%;
  height: 100px;
}

.reply-content {
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .feedback-management {
    padding: 16px;
  }
  
  .stats-cards .el-col {
    margin-bottom: 16px;
  }
  
  .filter-card .el-form {
    display: block;
  }
  
  .filter-card .el-form-item {
    margin-bottom: 12px;
  }
}
</style> 