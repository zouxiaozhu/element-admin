<template>
  <div class="users-page">
    <div class="page-header">
      <h2>用户管理</h2>
      <p>管理系统用户和权限</p>
    </div>
    
    <el-card class="users-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAddUser">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>
      
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface User {
  id: number
  username: string
  email: string
  role: string
  status: string
  createTime: string
}

const users = ref<User[]>([
  { id: 1, username: 'admin', email: 'admin@example.com', role: '管理员', status: '启用', createTime: '2024-01-01 10:00:00' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: '用户', status: '启用', createTime: '2024-01-02 11:00:00' },
  { id: 3, username: 'user2', email: 'user2@example.com', role: '用户', status: '禁用', createTime: '2024-01-03 12:00:00' }
])

const getRoleType = (role: string) => {
  return role === '管理员' ? 'danger' : 'primary'
}

const handleAddUser = () => {
  ElMessage.info('添加用户功能开发中...')
}

const handleEdit = (user: User) => {
  ElMessage.info(`编辑用户: ${user.username}`)
}

const handleDelete = (user: User) => {
  ElMessage.info(`删除用户: ${user.username}`)
}
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
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

.users-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style> 