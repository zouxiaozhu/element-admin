<template>
  <div class="excel-search-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2>{{fileName}}数据查询</h2>
        <p v-if="fileCoding" style="margin: 5px 0 0 0; color: #909399; font-size: 14px;">
          文件编码: {{ fileCoding }}
        </p>
      </div>
      <!-- <el-button type="primary" @click="refreshData" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button> -->
    </div>

    <!-- 搜索区域 -->
    <div class="search-section" v-if="excelMetaData && !hasError">
      <el-card class="search-card">
        <template #header>
          <div class="card-header">
            <span>搜索条件</span>
            <el-button type="text" @click="clearSearch">清空搜索</el-button>
          </div>
        </template>
        
        <el-form :model="searchForm" :label-width="isMobile ? '80px' : '100px'" class="search-form">
          <el-row :gutter="isMobile ? 10 : 20">
            <el-col :xs="24" :sm="24" :md="12" :lg="8" v-for="column in uniqueColumns" :key="column">
              <el-form-item :label="column" class="search-form-item">
                <el-input
                  v-model="searchForm[column]"
                  :placeholder="`请输入${column}`"
                  clearable
                  @keyup.enter="handleSearch"
                  size="small"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <!-- <el-form-item label="搜索逻辑" class="logic-form-item">
            <el-radio-group v-model="searchLogic" size="small">
              <el-radio label="OR">或 (OR)</el-radio>
              <el-radio label="AND">且 (AND)</el-radio>
            </el-radio-group>
          </el-form-item> -->
          
          <el-form-item class="action-form-item">
            <el-button type="primary" @click="handleSearch" :loading="searching" size="small">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="clearSearch" size="small">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 结果展示区域 -->
    <div class="result-section" v-if="searchResults.length > 0">
      <el-card class="result-card">
        <template #header>
          <div class="card-header">
            <span>查询结果 (共 {{ searchResults.length }} 条)</span>
            <el-button type="text" @click="exportResults">导出结果</el-button>
          </div>
        </template>
        
        <el-table 
          :data="searchResults" 
          border 
          stripe 
          style="width: 100%"
          :size="isMobile ? 'small' : 'default'"
          :max-height="isMobile ? 500 : 600"
        >
          <el-table-column
            v-for="column in tableColumns"
            :key="column"
            :prop="column"
            :label="column"
            :min-width="isMobile ? 80 : 120"
            show-overflow-tooltip
          />
          <el-table-column label="操作" :width="isMobile ? 80 : 120" fixed="right">
            <template #default="scope">
              <el-button type="text" size="small" @click="viewDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 无数据提示 -->
    <div class="no-data" v-if="!loading && !excelMetaData && !hasError">
      <el-empty description="正在加载数据..." />
    </div>

    <!-- 错误状态 -->
    <div class="error-state" v-if="!loading && hasError && errorMessage">
      <el-card class="error-card">
        <template #header>
          <span>加载失败</span>
        </template>
        <div class="error-content">
          <el-alert
            :title="errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
          <div style="margin-top: 20px;">
            <el-button type="primary" @click="retryLoad">重试</el-button>
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="数据详情"
      :width="isMobile ? '90%' : '60%'"
      :before-close="handleCloseDetail"
    >
      <el-descriptions :column="isMobile ? 1 : 2" border>
        <el-descriptions-item
          v-for="(value, key) in currentDetail"
          :key="key"
          :label="key"
        >
          {{ value }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false" size="small">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getExcelMetaData, searchExcelData } from '@/api/excel'

// 响应式数据
const fileCoding = ref('')
const fileName = ref('Excel')
const excelMetaData = ref(null)
const searchForm = ref({})
const searchResults = ref([])
const loading = ref(false)
const searching = ref(false)
const detailDialogVisible = ref(false)
const currentDetail = ref({})
const searchLogic = ref('AND') // 搜索逻辑：AND 或 OR
const errorMessage = ref('') // 错误信息
const isMobile = ref(false) // 移动端检测
const hasError = ref(false);
// 计算属性
const uniqueColumns = computed(() => {
  if (!excelMetaData.value) return []
  // 从数组数据中提取唯一的 columnKey
  return [...new Set(excelMetaData.value.map(item => item.columnKey))]
})

const tableColumns = computed(() => {
  if (searchResults.value.length === 0) return []
  // 从第一行数据中获取所有列名
  const firstRow = searchResults.value[0]
  if (!firstRow) return []
  // 过滤掉内部字段（以下划线开头的字段）
  return Object.keys(firstRow).filter(key => !key.startsWith('_'))
})

// 方法
const loadExcelData = async () => {
  if (!fileCoding.value) {
    errorMessage.value = '未找到文件编码参数'
    ElMessage.error('未找到文件编码参数')
    return
  }

  loading.value = true
  errorMessage.value = '' // 清除错误信息
  try {
    const response = await getExcelMetaData(fileCoding.value)
    
    console.log('API 返回数据:', response) // 调试信息
    
    // 检查 API 返回格式
      excelMetaData.value = response?.headers||[];
      fileName.value = response?.fileInfo?.extendData?.aliasFileName ||  response?.fileInfo?.fileInfo?.fileName ||'Excel';
      // fileName.value = response.fileInfo.excelParse
      console.log('提取的列名:', uniqueColumns.value) // 调试信息
      
      // 初始化搜索表单
      searchForm.value = {}
      uniqueColumns.value.forEach(column => {
        searchForm.value[column] = ''
      })
      
      ElMessage.success(`数据加载成功，发现 ${uniqueColumns.value.length} 个字段`)
  } catch (error) {
    console.error('加载数据失败:', error)
    errorMessage.value = error.message || '加载数据失败，请检查文件编码是否正确'
    ElMessage.error( errorMessage.value)
    hasError.value = true;
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  // 移除空值检查，允许所有参数（包括空值）传递到后端
  // 这样后端可以接收到完整的搜索表单数据，包括空字段
  
  searching.value = true
  try {
    // 构建搜索参数
    const searchParams = {
      file_coding: fileCoding.value,
      logic: searchLogic.value, // 添加搜索逻辑
      ...searchForm.value
    }
    
    console.log('发送搜索参数:', searchParams) // 调试信息
    
    const responseData = await searchExcelData(searchParams)
    
    console.log('搜索结果:', responseData) // 调试信息
    
    // request.js已经处理了响应格式，直接使用返回的数据数组
    if (Array.isArray(responseData)) {
      // 将数据转换为表格格式
      const processedData = processSearchResults(responseData)
      searchResults.value = processedData
      
      if (processedData.length === 0) {
        ElMessage.info('未找到匹配的数据')
      } else {
        ElMessage.success(`找到 ${processedData.length} 条匹配数据`)
      }
    } else {
      throw new Error('返回数据格式错误')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    searching.value = false
  }
}

// 处理搜索结果，将新的数据格式转换为表格格式
const processSearchResults = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length === 0) return []
  
  // 处理新的数据格式
  const result = rawData.map(item => {
    const row = {}
    
    // 从 columnData 对象中提取每列的值
    if (item.columnData && typeof item.columnData === 'object') {
      Object.keys(item.columnData).forEach(columnName => {
        const columnInfo = item.columnData[columnName]
        // 提取 columnValue 作为单元格的值
        row[columnName] = columnInfo?.columnValue || ''
      })
    }
    
    // 可选：保留行号信息用于调试或其他用途
    row.行号 = item.rowLine
    
    return row
  })
  
  console.log('处理后的搜索结果:', result) // 调试信息
  return result
}

const clearSearch = () => {
  searchForm.value = {}
  uniqueColumns.value.forEach(column => {
    searchForm.value[column] = ''
  })
  searchResults.value = []
}

const refreshData = () => {
  if (fileCoding.value) {
    loadExcelData()
  } else {
    errorMessage.value = '未找到文件编码参数'
    ElMessage.error('未找到文件编码参数')
  }
}

const viewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

const handleCloseDetail = () => {
  detailDialogVisible.value = false
  currentDetail.value = {}
}

const exportResults = async () => {
  if (searchResults.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  try {
    // 这里可以实现导出功能，比如导出为 CSV 或 Excel
    const csvContent = convertToCSV(searchResults.value)
    downloadCSV(csvContent, `excel_search_results_${Date.now()}.csv`)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const convertToCSV = (data) => {
  if (data.length === 0) return ''
  
  // 过滤掉内部字段（以下划线开头的字段）
  const headers = Object.keys(data[0]).filter(key => !key.startsWith('_'))
  const csvRows = [headers.join(',')]
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      return `"${value || ''}"`
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const retryLoad = () => {
  loadExcelData()
}

const goBack = () => {
  window.history.back()
}

// 移动端检测
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 窗口大小变化监听
const handleResize = () => {
  checkMobile()
}

// 生命周期
onMounted(() => {
  // 从 URL 参数中获取文件编码
  const urlParams = new URLSearchParams(window.location.search)
  const coding = urlParams.get('fileCoding') || urlParams.get('file_coding')
  
  if (coding) {
    fileCoding.value = coding
    console.log('从 URL 获取到文件编码:', coding)
    loadExcelData() // 自动加载数据
  } else {
    errorMessage.value = 'URL 中缺少 fileCoding 参数'
    ElMessage.error('URL 中缺少 fileCoding 参数')
  }

  // 初始化移动端检测
  checkMobile()
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.excel-search-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
  position: relative;
}

/* 移动端样式优化 */
@media (max-width: 768px) {
  .excel-search-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .page-header h2 {
    font-size: 1.5em;
  }
  
  .search-form-item {
    margin-bottom: 15px;
  }
  
  .logic-form-item {
    margin-bottom: 15px;
  }
  
  .action-form-item {
    margin-bottom: 15px;
  }
  
  .action-form-item .el-button {
    margin-right: 10px;
    margin-bottom: 10px;
  }
  
  .error-card {
    max-width: 100%;
    margin: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0 0 20px 0;
  border-bottom: 1px solid #e4e7ed;
  width: 100%;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-section {
  margin-bottom: 20px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.search-card {
  margin-bottom: 20px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-top: 10px;
  width: 100%;
}

.result-section {
  margin-top: 20px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.result-card {
  margin-bottom: 20px;
  width: 100%;
  background: white;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  width: 100%;
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
  width: 100%;
}

.error-card {
  width: 100%;
  max-width: 600px;
  min-width: 300px;
}

.error-content {
  text-align: center;
  width: 100%;
}

.file-coding-input {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  width: 100%;
}

.coding-card {
  width: 100%;
  max-width: 500px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}

/* 确保表格容器宽度正常 */
:deep(.el-table) {
  width: 100% !important;
}

/* 确保表单容器宽度正常 */
:deep(.el-form) {
  width: 100%;
}

/* 确保行容器宽度正常 */
:deep(.el-row) {
  width: 100%;
}

/* 确保列容器宽度正常 */
:deep(.el-col) {
  width: 100%;
}

/* 移动端表格优化 */
@media (max-width: 768px) {
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 8px 4px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
  
  :deep(.el-input__inner) {
    font-size: 14px;
  }
  
  :deep(.el-button) {
    font-size: 14px;
  }
}
</style> 