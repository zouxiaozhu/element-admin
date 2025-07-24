<template>
  <div class="excel-container">
    <el-table :data="tasks" style="width: 100%" border stripe highlight-current-row>
      <el-table-column prop="id" label="任务ID" width="100" />
      <el-table-column prop="name" label="任务名称" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tasks = ref([
  { id: 1, name: '导入用户数据', status: '已完成', createdAt: '2024-05-01 10:00' },
  { id: 2, name: '导出销售报表', status: '进行中', createdAt: '2024-05-02 14:30' },
  { id: 3, name: '分析库存', status: '失败', createdAt: '2024-05-03 09:15' },
])
</script>

<style scoped>
.excel-container {
  padding: 0;
  background: none;
  border-radius: 0;
}
:deep(.el-table) {
  border-radius: 0;
  overflow: hidden;
  font-size: 15px;
}
:deep(.el-table th) {
  background: #f5f7fa;
  color: #333;
  font-weight: bold;
  font-size: 15px;
}
:deep(.el-table__row:hover) {
  background: #f0f6ff !important;
}
:deep(.el-table td) {
  background: #fff;
}
</style>