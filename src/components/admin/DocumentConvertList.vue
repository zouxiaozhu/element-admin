<template>
  <div class="document-convert-list">
    <!-- <div class="page-header">
      <h2>Excel转Word · 历史记录</h2>
    </div> -->
    <el-card class="create-convert-card" shadow="never">
      <div class="create-convert-content">
        <div class="create-convert-info">
          <h3>有新的Excel转Word任务？</h3>
          <p>点击开始新建任务，上传Excel并选择Word模板</p>
        </div>
        <el-button type="primary" size="large" @click="goNew">
          <el-icon style="margin-right:6px;"><Plus /></el-icon>
          添加新的转换
        </el-button>
      </div>
    </el-card>

    <el-card class="history-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>历史转换记录</span>
          <el-button type="primary" @click="loadHistory" :loading="loadingHistory" plain>刷新</el-button>
        </div>
      </template>
      <div v-if="loadingHistory" class="loading-tip">加载中...</div>
      <el-empty v-else-if="!historyList || historyList.length === 0" description="暂无历史记录" />
      <el-table v-else :data="historyList" size="small" border style="width:100%" :fit="true">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="taskId" label="任务ID" min-width="260" />
        <el-table-column prop="fileCount" label="文件数" width="120" />
        <el-table-column prop="createdAt" label="创建时间" min-width="200" />
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button size="small" type="primary" :disabled="!getZipUrl(scope.row)" @click="downloadHistoryZip(scope.row)">批量下载</el-button>
            <el-button size="small" type="danger" plain @click="confirmDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :page-size="5"
          :total="total"
          :current-page="page"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { documentApi } from '@/api/document'

const router = useRouter()
const loadingHistory = ref(false)
const historyList = ref([])
const page = ref(1)
const size = 15
const total = ref(0)

const goNew = () => router.push('/admin/document-convert/new')

const getZipUrl = (row) => row?.zip_url || row?.zipUrl || row?.result?.zip_url

const downloadHistoryZip = (row) => {
  const url = getZipUrl(row)
  if (!url) return
  const link = document.createElement('a')
  link.href = url
  link.download = 'words.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const loadHistory = async () => {
  try {
    loadingHistory.value = true
    const res = await documentApi.listHistory({ page: page.value, size })
    historyList.value = res?.records || res?.list || []
    total.value = res?.total || historyList.value.length
  } finally {
    loadingHistory.value = false
  }
}

const handlePageChange = (p) => {
  page.value = p
  loadHistory()
}

const confirmDelete = (row) => {
  ElMessageBox.confirm('确定删除该历史任务吗？此操作不可恢复', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await documentApi.deleteHistory(row.taskId)
        ElMessage.success('删除成功')
        loadHistory()
      } catch (e) {
        ElMessage.error('删除失败')
      }
    })
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.document-convert-list { padding: 20px; }
.page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-header { display:flex; align-items:center; justify-content:space-between; }
.loading-tip { text-align:center; color:#909399; padding:16px 0; }
.pager { display:flex; justify-content:flex-end; padding-top:12px; }
.create-convert-card { margin-bottom: 16px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; box-shadow: 0 8px 32px rgba(102,126,234,0.25); }
.create-convert-content { display:flex; justify-content:space-between; align-items:center; padding: 20px; color: #fff; }
.create-convert-info h3 { margin:0 0 6px 0; font-size: 20px; font-weight: 700; color:#fff; }
.create-convert-info p { margin:0; color: rgba(255,255,255,0.9); }
.create-convert-content .el-button { background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.4); color: #fff; font-weight: 800; padding: 16px 28px; border-radius: 10px; font-size: 18px; height: 52px; min-width: 240px; }
.create-convert-content .el-button:hover { background: rgba(255,255,255,0.4); border-color: rgba(255,255,255,0.6); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(255,255,255,0.25); }
</style>


