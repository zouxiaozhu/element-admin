<template>
  <div class="excel-page">
    <el-card class="upload-card" style="margin-bottom:18px;">
      <div class="upload-container">
        <div class="upload-actions">
          <el-upload
            ref="uploadRef"
            class="excel-uploader"
            :http-request="customUpload"
            :show-file-list="true"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :limit="1"
            :on-exceed="handleExceed"
            accept=".xls,.xlsx"
          >
            <el-button type="primary" :loading="isUploading">{{ isUploading ? '上传中...' : '上传Excel文件' }}</el-button>
          </el-upload>
          <el-button type="success" @click="parseExcel" :disabled="!uploadedFile || isUploading">解析Excel</el-button>
        </div>
        <div class="upload-info">
          <div class="upload-tip-left">
            <span class="upload-tip">仅支持 .xls/.xlsx 文件</span>
          </div>
          <!-- <div class="upload-tip-right">
            <span v-if="!uploadedFile" class="status-tip">请先上传文件</span>
            <span v-else class="status-tip success">文件已上传，可以解析</span>
          </div> -->
        </div>
      </div>
    </el-card>
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="任务名称">
          <el-input v-model="searchForm.name" placeholder="输入任务名称" clearable />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="searchForm.startTime" type="date" placeholder="选择开始时间" clearable />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="searchForm.endTime" type="date" placeholder="选择结束时间" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <el-table :data="filteredTasks" style="width: 100%" border stripe highlight-current-row >
        <el-table-column prop="id" label="任务ID" width="100"  align="center" />
        <el-table-column prop="fileInfo.fileName" label="任务名称" width="200"  align="center" />
        <el-table-column prop="rowCount" label="行数" width="100"  align="center" />
        <el-table-column prop="status" label="状态" width="100"  align="center">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200"  align="center" />
        <el-table-column
          prop="startTime"
          label="开始时间"
          width="200"
          :formatter="startTimeFormatter"  align="center"
        />
        <el-table-column
          prop="endTime"
          label="结束时间"
          width="200"
          :formatter="endTimeFormatter"  align="center"
        />
        <el-table-column label="操作"   align="center">
          <template #default="scope">
            <el-button size="small" @click="showDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="editTask(scope.row)">编辑</el-button>
            <el-button size="small" type="warning" @click="pauseTask(scope.row)" v-if="scope.row.status==='进行中'">暂停</el-button>
            <el-button size="small" type="danger" @click="deleteTask(scope.row)">删除</el-button>
            <el-button size="small" type="info" @click="shareTask(scope.row)">分享</el-button>
            <el-button size="small" type="info" @click="download(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 18px 0; text-align: right;">
        <el-pagination
          background
          hide-on-single-page="true"
          layout="prev, pager, next, jumper, ->, total"
          :current-page="page.current"
          :page-size="page.size"
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    <el-dialog v-model="detailVisible" title="Excel数据明细" width="95%" :close-on-click-modal="false">
      <div v-if="currentTask">
        <el-descriptions :column="4" border style="margin-bottom: 20px;">
          <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
          <el-descriptions-item label="Excel文件">{{ currentTask.excelFile || currentTask.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentTask.status }}</el-descriptions-item>
          <el-descriptions-item label="总行数">{{ detailRecords.length }}</el-descriptions-item>
        </el-descriptions>
        
        <div v-if="detailRecords.length > 0">
          <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">Excel表格数据</h3>
            <div>
              <!-- <el-button size="small" @click="exportToExcel">导出Excel</el-button> -->
              <!-- <el-button size="small" @click="refreshData">刷新数据</el-button> -->
            </div>
          </div>
          
                    <!-- Excel表格数据展示 -->
          <div class="excel-table-container">
            <el-table 
              :data="detailRecords" 
              border 
              stripe 
              style="width: 100%"
              :max-height="600"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
            >
              <el-table-column prop="rowLine" label="行号" width="80" align="center" fixed="left" />
              <el-table-column 
                v-for="column in getColumnHeaders()" 
                :key="column"
                :prop="`columnData.${column}.columnValue`"
                :label="column"
                :min-width="getColumnWidth(column)"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <div class="cell-content">
                    <span v-if="!isComplexData(scope.row.columnData, column)">
                      <span v-if="isUrl(getColumnValue(scope.row.columnData, column))" class="url-link">
                        <a :href="getColumnValue(scope.row.columnData, column)" target="_blank" rel="noopener noreferrer">
                          {{ getColumnValue(scope.row.columnData, column) }}
                        </a>
                      </span>
                      <span v-else>
                        {{ getColumnValue(scope.row.columnData, column) || '-' }}
                      </span>
                    </span>
                    <div v-else class="complex-data">
                      <div v-if="column.includes('自增表格')" class="table-data">
                        <div class="table-header">
                          <span v-for="(header, index) in getTableHeaders(scope.row.columnData, column)" :key="index" class="table-header-cell">
                            {{ header }}
                          </span>
                        </div>
                        <div v-for="(row, index) in parseTableData(scope.row.columnData, column).slice(1)" :key="index" class="table-row">
                          <span v-for="(cell, cellIndex) in row" :key="cellIndex" class="table-cell">
                            {{ cell && cell.toString().trim() !== '' ? cell.toString().trim() : '-' }}
                          </span>
                        </div>
                      </div>
                      <div v-else>
                        <div v-for="(item, index) in parseComplexData(scope.row.columnData, column)" :key="index" class="data-item">
                          {{ item && item.toString().trim() !== '' ? item.toString().trim() : '-' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页组件 -->
            <div v-if="detailTotal > detailPageSize" class="detail-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :current-page="detailCurrentPage"
                :page-size="detailPageSize"
                :page-sizes="[5, 10, 20, 50, 100]"
                :total="detailTotal"
                @current-change="handleDetailPageChange"
                @size-change="handleDetailSizeChange"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <el-empty description="该Excel文件暂无解析数据" />
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible=false">关闭</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="editVisible" title="编辑任务" width="70vw">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="任务名称">
          <el-input :value="currentTask?.fileInfo?.fileName" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="启用" value="Enable" />
            <el-option label="禁用" value="Disable" />
            <el-option label="异常" value="Error" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="editForm.startTime" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="editForm.endTime" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
        <!-- 新增多选项 -->
        <el-form-item label="多选字段">
          <el-checkbox-group v-model="editForm.searchHeaders">
            <el-checkbox
              v-for="header in editForm.extendData?.headers || []"
              :key="header"
              :label="header"
            >{{ header }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible=false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadExcelFile, getExcelFileList, updateParseFile, deleteExcelFile ,getExcelFileDetail} from '@/api/excel'
import { env } from '@/utils/env.js'
import request from '@/utils/request'

interface Task {
  id: number
  name: string
  status: string
  startTime: string
  endTime: string
  fileCoding?: string
  excelFile?: string
  rowCount?: number
  fileInfo?: {
    fileId: number
    fileSize: number
    fileType: string
    fileName: string
    fileUrl: string
  }
  extendData?: {
    headers?: string[];
    searchHeaders?: string[];
  };

}

interface DetailRecord {
  rowLine: number
  columnData: Record<string, {
    id: number
    columnName: string
    columnValue: string
  }>
}

const tasks = ref<Task[]>([])
const page = ref({ current: 1, size: 10 })
const total = ref(0)

async function fetchTasks() {
  const res = await getExcelFileList({ page: page.value.current, size: page.value.size })
  tasks.value = res?.data?.records || []
  total.value = res?.data?.total || 0
}

onMounted(() => {
  fetchTasks()
})

function handlePageChange(val: number) {
  page.value.current = val
  fetchTasks()
}

const searchForm = ref({
  name: '',
  status: '',
  startTime: '',
  endTime: ''
})

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const nameMatch = !searchForm.value.name || task.name.includes(searchForm.value.name)
    const statusMatch = !searchForm.value.status || task.status === searchForm.value.status
    const startMatch = !searchForm.value.startTime || (task.startTime && task.startTime >= searchForm.value.startTime)
    const endMatch = !searchForm.value.endTime || (task.endTime && task.endTime <= searchForm.value.endTime)
    return nameMatch && statusMatch && startMatch && endMatch
  })
})

function handleSearch() {
  // 这里只需触发 filteredTasks 计算属性即可
}
function handleReset() {
  searchForm.value = { name: '', status: '', startTime: '', endTime: '' }
}
function statusType(status: string) {
  switch (status) {
    case '进行中': return 'success'
    case '已完成': return 'info'
    case '失败': return 'danger'
    case '已暂停': return 'warning'
    default: return ''
  }
}

const detailVisible = ref(false)
const detailRecords = ref<DetailRecord[]>([])
const detailOffset = ref(1)
const detailTotal = ref(0)
const detailPageSize = ref(5)
const detailCurrentPage = ref(1)

const pageSize = ref(10)
const currentTask = ref<Task | null>(null)

function showDetail(row: Task) {
  currentTask.value = row
  detailOffset.value = 1 // 重置偏移量
  detailCurrentPage.value = 1 // 重置当前页
  loadDetailData()
  detailVisible.value = true
}

function loadDetailData() {
  if (!currentTask.value) return
  getExcelFileDetail(currentTask.value.id, detailOffset.value, detailPageSize.value).then(ret => {
    console.log('Detail data response:', ret)
    detailRecords.value = ret?.records || []
    detailTotal.value = ret?.total || 0
  }).catch(error => {
    detailRecords.value=[];
    detailTotal.value=0;
    console.error('Failed to load detail data:', error)
    ElMessage.error(error.message || '获取详情失败')
  })
}
function pauseTask(row: Task) {
  row.status = '已暂停'
  ElMessage.success('任务已暂停')
}
function deleteTask(row: Task) {
  ElMessageBox.confirm('确定要删除该任务吗？', '提示', { type: 'warning' })
    .then(() => {
      deleteExcelFile(row.id).then(r  => {
        tasks.value = tasks.value.filter(t => t.id !== row.id)
        ElMessage.success('删除成功');
      }).catch(error => {
        ElMessage.error('删除失败')
      })
      // 
      
    })
}

function shareTask(row: Task) {
    const webBaseUrl = env.webBaseUrl;
    const shareUrl = `${webBaseUrl}/excel-search?fileCoding=${row.fileCoding}`
    navigator.clipboard.writeText(shareUrl)
    ElMessage.success('分享链接已复制到剪贴板')
  console.log(row)
}

const editVisible = ref(false)
const editForm = ref<Task & { searchHeaders?: string[] }>({ id: 0, name: '', status: '', startTime: '', endTime: '', excelFile: '', extendData: { headers: [], searchHeaders: [] } })

// 新增上传文件状态
const uploadedFile = ref<any>(null)
const uploadRef = ref<any>(null)
const isUploading = ref(false)

async function saveEdit() {
  // 校验多选字段
  if (!editForm.value.extendData || !Array.isArray(editForm.value.searchHeaders) || editForm.value.searchHeaders.length === 0) {
    ElMessage.error('请至少选择一个多选字段！')
    return
  }
  // 校验开始时间和结束时间
  if (editForm.value.startTime && editForm.value.endTime) {
    const start = new Date(editForm.value.startTime).getTime()
    const end = new Date(editForm.value.endTime).getTime()
    if (start >= end) {
      ElMessage.error('开始时间必须小于结束时间')
      return
    }
  }
  if (!editForm.value.extendData) {
    editForm.value.extendData = { headers: [], searchHeaders: [] }
  }
  editForm.value.extendData.searchHeaders = [...(editForm.value.searchHeaders || [])]
  try {
    await updateParseFile(editForm)
    ElMessage.success('修改成功')
    editVisible.value = false
    fetchTasks()
  } catch (e) {
    ElMessage.error('修改失败')
  }
}

function handleUploadSuccess(response: any) {
  ElMessage.success('Excel上传成功')
  fetchTasks()
}
function handleUploadError() {
  ElMessage.error('Excel上传失败，请重试')
}

function handleExceed(files: any, uploadFiles: any) {
  if (isUploading.value) {
    ElMessage.warning('正在上传中，请稍候')
    return
  }
  
  ElMessageBox.confirm(
    '已有文件存在，是否替换当前文件？',
    '文件替换确认',
    {
      confirmButtonText: '替换',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 用户确认替换
    isUploading.value = true
    
    // 清除现有文件和状态
    uploadRef.value?.clearFiles()
    uploadedFile.value = null
    
    // 使用新文件直接触发上传
    const file = files[0]
    
    // 创建新的文件对象并添加到上传列表
    const fileItem = {
      name: file.name,
      size: file.size,
      status: 'uploading',
      uid: Date.now(),
      raw: file
    }
    
    // 先添加文件到列表
    uploadRef.value?.handleStart(file)
    
    // 执行上传
    uploadExcelFile(file)
      .then(res => {
        uploadedFile.value = res
        // 更新文件状态为成功
        uploadRef.value?.handleSuccess(res, file)
        ElMessage.success('文件已替换上传成功')
      })
      .catch(error => {
        console.error('Upload failed:', error)
        // 更新文件状态为失败
        uploadRef.value?.handleError(error, file)
        uploadedFile.value = null
        ElMessage.error('文件替换上传失败，请重试')
      })
      .finally(() => {
        isUploading.value = false
      })
  }).catch(() => {
    // 用户取消，不做任何操作
    ElMessage.info('已取消文件替换')
  })
}

function customUpload(option: any) {
  if (isUploading.value) {
    ElMessage.warning('正在上传中，请稍候')
    return
  }
  
  isUploading.value = true
  const file = option.file
  
  uploadExcelFile(file)
    .then(res => {
      uploadedFile.value = res
      option.onSuccess && option.onSuccess(res)
    })
    .catch(err => {
      uploadedFile.value = null
      option.onError && option.onError(err)
    })
    .finally(() => {
      isUploading.value = false
    })
}

// 解析Excel文件
async function parseExcel() {
  if (!uploadedFile.value) {
    ElMessage.warning('请先上传文件')
    return
  }
  
  try {
    const response = await request.postForm('/excel/parse', {
      fileId: uploadedFile.value.fileId || uploadedFile.value.id
    })
    ElMessage.success('Excel解析成功')
    uploadedFile.value = null // 清空上传文件状态
    uploadRef.value?.clearFiles() // 清空文件列表
    fetchTasks() // 刷新任务列表
  } catch ( error) {
    console.error('解析失败:', error)
    ElMessage.error(error.message || 'Excel解析失败，请重试')
  }
}

function startTimeFormatter(row: Task) {
  return row.startTime ? row.startTime : '未设置'
}
function endTimeFormatter(row: Task) {
  return row.endTime ? row.endTime : '未设置'
}
// 编辑任务弹窗多选字段
function editTask(row: Task) {
  currentTask.value = row
  editForm.value = { ...row }
  if (!editForm.value.extendData) {
    editForm.value.extendData = { headers: [], searchHeaders: [] }
  }
  if (!Array.isArray(editForm.value.extendData.searchHeaders)) {
    editForm.value.extendData.searchHeaders = []
  }
  editForm.value.searchHeaders = [...editForm.value.extendData.searchHeaders]
  editVisible.value = true
}

// 获取所有列标题（字段名称）
function getColumnHeaders() {
  if (detailRecords.value.length === 0) return []
  const firstRecord = detailRecords.value[0]
  return Object.keys(firstRecord.columnData)
}

// 获取指定列的值
function getColumnValue(columnData: Record<string, { id: number; columnName: string; columnValue: string }>, columnKey: string) {
  const column = columnData[columnKey]
  if (!column || column.columnValue === null || column.columnValue === undefined) {
    return ''
  }
  const value = column.columnValue.toString().trim()
  return value || ''
}

// 判断是否为复杂数据（包含分号分隔或换行符）
function isComplexData(columnData: Record<string, { id: number; columnName: string; columnValue: string }>, columnKey: string) {
  const value = getColumnValue(columnData, columnKey)
  return value.includes(';') || value.includes('\n')
}

// 解析复杂数据
function parseComplexData(columnData: Record<string, { id: number; columnName: string; columnValue: string }>, columnKey: string) {
  const value = getColumnValue(columnData, columnKey)
  if (!value) return []
  
  // 先按换行符分割，再按分号分割
  const lines = value.split('\n')
  const result: string[] = []
  
  lines.forEach(line => {
    if (line.trim()) {
      const items = line.split(';').filter(item => item.trim())
      result.push(...items)
    }
  })
  
  return result
}

// 根据列名计算列宽度
function getColumnWidth(columnName: string) {
 return 150;
}

// 解析表格数据（用于自增表格字段）
function parseTableData(columnData: Record<string, { id: number; columnName: string; columnValue: string }>, columnKey: string) {
  const value = getColumnValue(columnData, columnKey)
  if (!value) return []
  
  const lines = value.split('\n')
  const result: string[][] = []
  
  lines.forEach((line, lineIndex) => {
    if (line.trim()) {
      const cells = line.split(';').map(cell => cell.trim())
      // 过滤掉完全为空的行，但保留有部分数据的行
      if (cells.some(cell => cell)) {
        result.push(cells)
      }
    }
  })
  
  return result
}

// 获取表格列标题（用于自增表格）
function getTableHeaders(columnData: Record<string, { id: number; columnName: string; columnValue: string }>, columnKey: string) {
  const tableData = parseTableData(columnData, columnKey)
  if (tableData.length === 0) return []
  
  // 使用第一行作为标题，或者生成默认标题
  const firstRow = tableData[0]
  const headers: string[] = []
  
  for (let i = 0; i < firstRow.length; i++) {
    if (firstRow[i]) {
      headers.push(firstRow[i])
    } else {
      headers.push(`列${i + 1}`)
    }
  }
  
  return headers
}

// 检测是否为URL
function isUrl(value: string): boolean {
  if (!value) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

// 导出Excel功能
function exportToExcel() {
  if (detailRecords.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }
  
  // 这里可以添加导出Excel的逻辑
  ElMessage.success('导出功能开发中...')
}

// 刷新数据
function refreshData() {
  if (!currentTask.value) return
  
  getExcelFileDetail(currentTask.value.id, detailOffset.value, pageSize.value).then(r => {
    detailRecords.value = r.data?.records || []
    detailTotal.value = r.data?.total || 0
    ElMessage.success('数据已刷新')
  }).catch(error => {
    ElMessage.error('刷新数据失败')
  })
}

// 处理详情分页变化
function handleDetailPageChange(page: number) {
  detailCurrentPage.value = page
  detailOffset.value = (page - 1) * detailPageSize.value + 1
  loadDetailData()
}

// 处理详情页面大小变化
function handleDetailSizeChange(size: number) {
  detailPageSize.value = size
  detailCurrentPage.value = 1
  detailOffset.value = 1
  loadDetailData()
}

// 下载Excel文件
function download(row: Task) {
  // 这里可以添加下载Excel文件的逻辑
  ElMessage.success('下载功能开发中...')
}
</script>
<style scoped>
.excel-page {
  padding: 32px;
  background: linear-gradient(135deg, #eaf3ff 0%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(64,158,255,0.10);
  min-height: calc(100vh - 80px);
  transition: box-shadow 0.2s;
}
.excel-page:hover {
  box-shadow: 0 8px 32px rgba(64,158,255,0.18);
}
.search-card {
  margin-bottom: 18px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
}
.table-card {
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
  min-height: 500px;
}

.table-card :deep(.el-table) {
  min-height: 400px;
}

.table-card :deep(.el-table__empty-block) {
  min-height: 300px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.upload-card {
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
  margin-bottom: 18px;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-actions {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.upload-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
}

.excel-uploader {
  display: inline-block;
}

.upload-tip-left {
  display: flex;
  align-items: center;
}

.upload-tip-right {
  display: flex;
  align-items: center;
}

.upload-tip {
  color: #909399;
  font-size: 13px;
}

.status-tip {
  color: #909399;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  background: #f5f7fa;
}

.status-tip.success {
  color: #67c23a;
  background: #f0f9ff;
}

.cell-content {
  max-height: 200px;
  overflow-y: auto;
  color: #303133;
  word-break: break-word;
}

.cell-content * {
  color: inherit;
}

.complex-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item {
  padding: 2px 6px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  border-left: 3px solid #409eff;
  color: #303133;
  word-break: break-word;
  max-width: 100%;
  overflow: hidden;
}

.table-data {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 2px solid #dcdfe6;
}

.table-header-cell {
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  border-right: 1px solid #dcdfe6;
  color: #303133;
  text-align: center;
}

.table-header-cell:last-child {
  border-right: none;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 4px 8px;
  font-size: 12px;
  border-right: 1px solid #f0f0f0;
  background-color: #ffffff;
  color: #303133;
  text-align: center;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-word;
  overflow: hidden;
}

.table-cell:last-child {
  border-right: none;
}

.excel-table-container {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.url-link a {
  color: #409eff;
  text-decoration: none;
  word-break: break-all;
}

.url-link a:hover {
  text-decoration: underline;
}

.detail-pagination {
  margin-top: 16px;
  margin-left: 16px;
  text-align: right;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.detail-pagination :deep(.el-pagination) {
  font-size: 13px;
}

.detail-pagination :deep(.el-pagination .el-pagination__total) {
  font-size: 13px;
  color: #606266;
}

.detail-pagination :deep(.el-pagination .el-pagination__sizes) {
  font-size: 13px;
}

.detail-pagination :deep(.el-pagination .el-pagination__jump) {
  font-size: 13px;
}

.detail-pagination :deep(.el-pagination .btn-prev),
.detail-pagination :deep(.el-pagination .btn-next) {
  font-size: 13px;
  padding: 0 8px;
}

.detail-pagination :deep(.el-pagination .el-pager li) {
  font-size: 13px;
  padding: 0 8px;
  min-width: 28px;
  height: 28px;
  line-height: 28px;
}

.detail-pagination :deep(.el-pagination .el-pager li.is-active) {
  background-color: #409eff;
  color: #fff;
  font-weight: 500;
}
</style> 