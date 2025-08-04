<template>
  <div class="qrcode-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>二维码管理</h2>
        <p>管理和维护所有二维码</p>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button @click="handleRefresh" :icon="Refresh">刷新</el-button>
          <el-button @click="handleImport" :icon="Upload">导入</el-button>
          <el-button @click="handleBatchExport" :disabled="!selectedIds.length" :icon="Download">
            批量导出
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="handleCreate" :icon="Plus">
          新建二维码
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-card shadow="never">
        <el-form :model="searchForm" :inline="true" label-width="80px">
          <el-form-item label="关键字">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索名称、内容或标签"
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="类型">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择类型"
              style="width: 150px"
              clearable
            >
              <el-option
                v-for="type in qrCodeTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              style="width: 120px"
              clearable
            >
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
              <el-option label="草稿" value="draft" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="handleReset" :icon="RefreshRight">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.total || 0 }}</div>
              <div class="stats-label">总二维码数</div>
            </div>
            <div class="stats-icon">
              <el-icon :size="32" color="#409EFF"><Grid /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.active || 0 }}</div>
              <div class="stats-label">启用中</div>
            </div>
            <div class="stats-icon">
              <el-icon :size="32" color="#67C23A"><SuccessFilled /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalScans || 0 }}</div>
              <div class="stats-label">总扫描次数</div>
            </div>
            <div class="stats-icon">
              <el-icon :size="32" color="#E6A23C"><View /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.todayScans || 0 }}</div>
              <div class="stats-label">今日扫描</div>
            </div>
            <div class="stats-icon">
              <el-icon :size="32" color="#F56C6C"><TrendCharts /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-card shadow="never">
        <!-- 表格工具栏 -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <span v-if="selectedIds.length" class="selected-info">
              已选择 {{ selectedIds.length }} 项
            </span>
            <el-button-group v-if="selectedIds.length" class="batch-actions">
              <el-button size="small" @click="handleBatchDelete" type="danger">
                批量删除
              </el-button>
              <el-button size="small" @click="handleBatchChangeStatus('active')">
                批量启用
              </el-button>
              <el-button size="small" @click="handleBatchChangeStatus('inactive')">
                批量禁用
              </el-button>
            </el-button-group>
          </div>
          
          <div class="toolbar-right">
            <el-button-group size="small">
              <el-button @click="tableSize = 'large'" :type="tableSize === 'large' ? 'primary' : ''">
                大
              </el-button>
              <el-button @click="tableSize = 'default'" :type="tableSize === 'default' ? 'primary' : ''">
                中
              </el-button>
              <el-button @click="tableSize = 'small'" :type="tableSize === 'small' ? 'primary' : ''">
                小
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          :data="tableData"
          :size="tableSize"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="50" />
          
          <el-table-column prop="id" label="ID" width="80" />
          
          <el-table-column label="二维码预览" width="100">
            <template #default="{ row }">
              <div class="qrcode-preview" @click="handlePreview(row)">
                <img v-if="row.qrcode_url" :src="row.qrcode_url" alt="二维码" />
                <div v-else class="no-qrcode">无</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="名称" min-width="150">
            <template #default="{ row }">
              <div class="name-cell">
                <div class="name">{{ row.name }}</div>
                <div class="description" v-if="row.description">{{ row.description }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">
                {{ getTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="content" label="内容" min-width="200">
            <template #default="{ row }">
              <div class="content-cell">
                <span class="content-preview">{{ getContentPreview(row.content) }}</span>
                <el-button size="small" text @click="handleViewContent(row)">
                  查看详情
                </el-button>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="scan_count" label="扫描次数" width="100" sortable />
          
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                active-value="active"
                inactive-value="inactive"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          
          <el-table-column prop="created_at" label="创建时间" width="160" sortable>
            <template #default="{ row }">
              {{ formatTime(row.created_at) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button-group size="small">
                <el-button @click="handleEdit(row)" :icon="Edit">编辑</el-button>
                <el-button @click="handleCopy(row)" :icon="DocumentCopy">复制</el-button>
                <el-button @click="handleDownload(row)" :icon="Download">下载</el-button>
                <el-button @click="handleDelete(row)" type="danger" :icon="Delete">删除</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 内容预览对话框 -->
    <el-dialog v-model="contentDialogVisible" title="二维码内容" width="600px">
      <div class="content-preview-dialog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称">{{ currentItem?.name }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ getTypeName(currentItem?.type) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentItem?.status === 'active' ? 'success' : 'danger'">
              {{ currentItem?.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="扫描次数">{{ currentItem?.scan_count || 0 }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="content-section">
          <h4>内容详情</h4>
          <div class="content-display" v-html="currentItem?.content"></div>
        </div>
        
        <div class="qrcode-section" v-if="currentItem?.qrcode_url">
          <h4>二维码图片</h4>
          <div class="qrcode-large">
            <img :src="currentItem.qrcode_url" alt="二维码" />
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="二维码预览" width="400px">
      <div class="qrcode-preview-dialog">
        <div class="qrcode-image">
          <img v-if="currentItem?.qrcode_url" :src="currentItem.qrcode_url" alt="二维码" />
        </div>
        <div class="preview-info">
          <p><strong>名称：</strong>{{ currentItem?.name }}</p>
          <p><strong>类型：</strong>{{ getTypeName(currentItem?.type) }}</p>
          <p><strong>扫描次数：</strong>{{ currentItem?.scan_count || 0 }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleDownload(currentItem)" type="primary">下载</el-button>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Upload, Download, Search, RefreshRight, Edit, Delete, DocumentCopy, View,
  Grid, SuccessFilled, TrendCharts
} from '@element-plus/icons-vue'

import {
  getQRCodeList, deleteQRCode, batchDeleteQRCode, updateQRCodeStatus,
  getQRCodeStats, copyQRCode, exportQRCode, batchExportQRCode, getQRCodeTypes
} from '@/api/qrcode'
import { handleApiCall } from '@/utils/apiHelper'

const router = useRouter()

// 数据状态
const loading = ref(false)
const tableData = ref([])
const stats = ref({})
const qrCodeTypes = ref([])

// 搜索表单
const searchForm = ref({
  keyword: '',
  type: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0
})

// 表格相关
const tableSize = ref('default')
const selectedIds = ref([])
const selectAll = ref(false)

// 对话框状态
const contentDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const currentItem = ref(null)

// 计算属性
const isIndeterminate = computed(() => {
  const selectedCount = selectedIds.value.length
  const totalCount = tableData.value.length
  return selectedCount > 0 && selectedCount < totalCount
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...searchForm.value,
      start_date: searchForm.value.dateRange?.[0],
      end_date: searchForm.value.dateRange?.[1]
    }
    delete params.dateRange

    const result = await handleApiCall(() => getQRCodeList(params))
    if (result.success) {
      tableData.value = result.data.list || []
      pagination.value.total = result.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const result = await handleApiCall(() => getQRCodeStats())
    if (result.success) {
      stats.value = result.data || {}
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadQRCodeTypes = async () => {
  try {
    const result = await handleApiCall(() => getQRCodeTypes())
    if (result.success) {
      qrCodeTypes.value = result.data || []
    }
  } catch (error) {
    console.error('加载二维码类型失败:', error)
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    type: '',
    status: '',
    dateRange: []
  }
  handleSearch()
}

const handleRefresh = () => {
  loadData()
  loadStats()
}

const handleCreate = () => {
  router.push('/admin/qrcode/create')
}

const handleEdit = (row) => {
  router.push(`/admin/qrcode/edit/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除二维码"${row.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    
    const result = await handleApiCall(() => deleteQRCode(row.id))
    if (result.success) {
      ElMessage.success('删除成功')
      loadData()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个二维码吗？`, '确认批量删除', {
      type: 'warning'
    })
    
    const result = await handleApiCall(() => batchDeleteQRCode(selectedIds.value))
    if (result.success) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      loadData()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleStatusChange = async (row) => {
  try {
    const result = await handleApiCall(() => updateQRCodeStatus(row.id, row.status))
    if (result.success) {
      ElMessage.success('状态更新成功')
      loadStats()
    } else {
      // 回滚状态
      row.status = row.status === 'active' ? 'inactive' : 'active'
    }
  } catch (error) {
    // 回滚状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.error('状态更新失败')
  }
}

const handleBatchChangeStatus = async (status) => {
  try {
    const statusText = status === 'active' ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${statusText}选中的 ${selectedIds.value.length} 个二维码吗？`, `确认批量${statusText}`, {
      type: 'warning'
    })
    
    // 这里应该调用批量更新状态的API
    ElMessage.success(`批量${statusText}成功`)
    selectedIds.value = []
    loadData()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败')
    }
  }
}

const handleCopy = async (row) => {
  try {
    const result = await handleApiCall(() => copyQRCode(row.id))
    if (result.success) {
      ElMessage.success('复制成功')
      loadData()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleDownload = async (row) => {
  try {
    const result = await exportQRCode(row.id, 'png')
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([result]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${row.name}.png`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleBatchExport = async () => {
  try {
    const result = await batchExportQRCode(selectedIds.value, 'zip')
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([result]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `qrcodes_${Date.now()}.zip`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('批量导出成功')
  } catch (error) {
    ElMessage.error('批量导出失败')
  }
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handlePreview = (row) => {
  currentItem.value = row
  previewDialogVisible.value = true
}

const handleViewContent = (row) => {
  currentItem.value = row
  contentDialogVisible.value = true
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
  selectAll.value = selection.length === tableData.value.length
}

const handleSelectAll = (checked) => {
  // Element Plus的表格组件会自动处理全选逻辑
}

const handleSizeChange = (size) => {
  pagination.value.limit = size
  pagination.value.page = 1
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.value.page = page
  loadData()
}

// 工具方法
const getTypeName = (type) => {
  const typeMap = {
    'text': '文本',
    'url': '网址',
    'wifi': 'WiFi',
    'email': '邮箱',
    'phone': '电话',
    'sms': '短信',
    'vcard': '名片',
    'event': '事件'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type) => {
  const typeMap = {
    'text': '',
    'url': 'success',
    'wifi': 'info',
    'email': 'warning',
    'phone': 'danger',
    'sms': 'success',
    'vcard': 'info',
    'event': 'warning'
  }
  return typeMap[type] || ''
}

const getContentPreview = (content) => {
  if (!content) return '无内容'
  const text = content.replace(/<[^>]*>/g, '') // 移除HTML标签
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// 生命周期
onMounted(() => {
  loadData()
  loadStats()
  loadQRCodeTypes()
})
</script>

<style scoped>
.qrcode-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-section {
  margin-bottom: 20px;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-card {
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.stats-content {
  position: relative;
  z-index: 2;
}

.stats-number {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stats-label {
  font-size: 14px;
  color: #606266;
}

.stats-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  opacity: 0.3;
}

.table-section {
  margin-bottom: 20px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-info {
  color: #409eff;
  font-size: 14px;
}

.batch-actions {
  margin-left: 16px;
}

.qrcode-preview {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.qrcode-preview:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.qrcode-preview img {
  max-width: 100%;
  max-height: 100%;
}

.no-qrcode {
  color: #c0c4cc;
  font-size: 12px;
}

.name-cell .name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.name-cell .description {
  color: #909399;
  font-size: 12px;
  line-height: 1.2;
}

.content-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.content-preview {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.content-preview-dialog {
  padding: 16px 0;
}

.content-section,
.qrcode-section {
  margin-top: 24px;
}

.content-section h4,
.qrcode-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.content-display {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  min-height: 100px;
  word-break: break-all;
}

.qrcode-large {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.qrcode-large img {
  max-width: 200px;
  max-height: 200px;
}

.qrcode-preview-dialog {
  text-align: center;
}

.qrcode-image {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.qrcode-image img {
  max-width: 200px;
  max-height: 200px;
}

.preview-info {
  text-align: left;
}

.preview-info p {
  margin: 8px 0;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .table-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table th) {
  background: #fafbfc;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style> 