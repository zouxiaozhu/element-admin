<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>系统概览</h2>
      <p>Excel解析</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon excel">
            <el-icon size="32"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats.todayCount }}次</h3>
            <p>今日解析Excel次数</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon processing">
            <el-icon size="32"><Loading /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats.thisWeekCount }}次</h3>
            <p>本周解析Excel次数</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon users">
            <el-icon size="32"><User /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalCount }}次</h3>
            <p>累计解析Excel次数</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon storage">
            <el-icon size="32"><FolderOpened /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalSizeInMb }}MB</h3>
            <p>Excel存储使用量</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card class="action-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>快速操作</span>
          </div>
        </template>
        <div class="actions-grid">
          <el-button type="primary" size="large" @click="goToExcelToWord">
            <el-icon><Upload /></el-icon>
            Excel转Word
          </el-button>
          <el-button type="success" size="large" @click="goToExcelSearch">
            <el-icon><DataAnalysis /></el-icon>
            Excel搜索
          </el-button>
          <el-button type="info" size="large" @click="goToProfile">
            <el-icon><User /></el-icon>
            个人资料
          </el-button>
          <el-button type="warning" size="large" @click="goToMyFeedback">
            <el-icon><Setting /></el-icon>
            我的反馈
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 最近活动（功能未实现，暂时隐藏，保留代码） -->
    <div class="recent-activity" style="display: none;">
      <el-card class="activity-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button link size="small">查看全部</el-button>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.time"
            :type="activity.type"
          >
            {{ activity.description }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Loading, User, FolderOpened, Upload, DataAnalysis, Setting } from '@element-plus/icons-vue'
import { dashboardApi } from '@/api/dashboard'

interface Stats {
  totalCount: number
  todayCount: number
  thisWeekCount: number
  totalSizeInMb: string
}

interface Activity {
  id: number
  description: string
  time: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const stats = ref<Stats>({
  totalCount: 0,
  todayCount: 0,
  thisWeekCount: 0,
  totalSizeInMb: '0'
})

const recentActivities = ref<Activity[]>([
  { id: 1, description: '用户上传了新的Excel文件', time: '2024-01-15 10:30', type: 'primary' },
  { id: 2, description: 'Excel文件解析完成', time: '2024-01-15 10:15', type: 'success' },
  { id: 3, description: '系统配置已更新', time: '2024-01-15 09:45', type: 'info' },
  { id: 4, description: '新用户注册', time: '2024-01-15 09:20', type: 'success' }
])

const router = useRouter()

const goToExcelToWord = () => router.push('/admin/document-convert')
const goToExcelSearch = () => router.push('/admin/excel')
const goToMyFeedback = () => router.push('/admin/my-feedback')
const goToProfile = () => router.push('/admin/profile')

// 模拟加载统计数据
const loadStats = () => {
  dashboardApi.dashBoardSummary().then(res => {
    stats.value = res
  })
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.dashboard-header p {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.excel {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
}

.stat-icon.processing {
  background: linear-gradient(135deg, #e6a23c 0%, #f0c444 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-icon.storage {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 32px;
  font-weight: 700;
  color: #303133;
}

.stat-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  margin-bottom: 32px;
}

.action-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.recent-activity {
  margin-bottom: 32px;
}

.activity-card {
  border-radius: 12px;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style> 