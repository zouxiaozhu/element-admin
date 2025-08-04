<template>
  <div class="form-list">
    <div class="page-header">
      <h2>表单管理</h2>
      <p>管理和配置表单模板</p>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="createForm">
        <el-icon><Plus /></el-icon>
        新建表单
      </el-button>
      <el-button @click="openImportDialog">
        <el-icon><Upload /></el-icon>
        导入表单
      </el-button>
    </div>

    <el-table :data="formList" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="表单名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
            {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button size="small" @click="editForm(scope.row)">编辑</el-button>
          <el-button size="small" @click="previewForm(scope.row)">预览</el-button>
          <el-button size="small" @click="copyForm(scope.row)">复制</el-button>
          <el-popconfirm title="确定删除这个表单吗？" @confirm="deleteForm(scope.row)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 导入表单对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入表单" width="500px">
      <el-form :model="importForm" label-width="80px">
        <el-form-item label="表单名称">
          <el-input v-model="importForm.title" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="JSON配置">
          <el-input
            v-model="importForm.schema"
            type="textarea"
            :rows="10"
            placeholder="请粘贴表单JSON配置"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'

const router = useRouter()

// 数据状态
const loading = ref(false)
const formList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 导入表单
const importDialogVisible = ref(false)
const importForm = ref({
  title: '',
  schema: ''
})

// 示例数据
const sampleForms = [
  {
    id: 1,
    title: '复杂业务表单-Demo',
    description: '包含多种组件类型的示例表单',
    status: 'published',
    createTime: '2025-01-28 10:00:00',
    updateTime: '2025-01-28 12:00:00',
    schema: {
      "type": "object",
      "title": "复杂业务表单-Demo",
      "x-steps": [
        {
          "title": "基础信息",
          "fields": ["username", "date", "idPhoto", "region", "appointment"]
        },
        {
          "title": "检查与出入库",
          "fields": ["checkList", "mainPhoto", "itemSinglePhoto", "itemMultiPhoto", "storeRecords"]
        },
        {
          "title": "考试与多级",
          "fields": ["testScore", "department", "largeRadio", "multiLevelSelect"]
        },
        {
          "title": "OCR与嵌套",
          "fields": ["idNoOCR", "nestedFormDemo", "remark"]
        }
      ],
      "properties": {
        "username": {
          "type": "string",
          "title": "姓名",
          "x-component": "Input",
          "x-rules": [
            { "required": true, "message": "必填" },
            { "max": 16, "message": "最多16字" }
          ]
        },
        "date": {
          "type": "string",
          "title": "日期",
          "x-component": "DatePicker",
          "format": "date"
        }
      }
    }
  },
  {
    id: 2,
    title: '用户注册表单',
    description: '简单的用户注册表单',
    status: 'draft',
    createTime: '2025-01-27 14:00:00',
    updateTime: '2025-01-27 16:00:00',
    schema: {
      "type": "object",
      "title": "用户注册表单",
      "properties": {
        "username": {
          "type": "string",
          "title": "用户名",
          "x-component": "Input",
          "x-rules": [{ "required": true, "message": "请输入用户名" }]
        },
        "email": {
          "type": "string",
          "title": "邮箱",
          "x-component": "Input",
          "format": "email",
          "x-rules": [{ "required": true, "message": "请输入邮箱" }]
        },
        "password": {
          "type": "string",
          "title": "密码",
          "x-component": "Input",
          "x-type": "password",
          "x-rules": [{ "required": true, "message": "请输入密码" }]
        }
      }
    }
  }
]

// 页面方法
const loadFormList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    formList.value = sampleForms
    total.value = sampleForms.length
    loading.value = false
  }, 500)
}

const createForm = () => {
  router.push('/admin/form/builder')
}

const editForm = (form) => {
  router.push(`/admin/form/builder/${form.id}`)
}

const previewForm = (form) => {
  router.push(`/admin/form/preview/${form.id}`)
}

const copyForm = (form) => {
  router.push(`/admin/form/builder?copy=${form.id}`)
}

const deleteForm = (form) => {
  const index = formList.value.findIndex(f => f.id === form.id)
  if (index > -1) {
    formList.value.splice(index, 1)
    total.value--
    ElMessage.success('删除成功')
  }
}

const openImportDialog = () => {
  importForm.value = {
    title: '',
    schema: JSON.stringify(sampleForms[0].schema, null, 2)
  }
  importDialogVisible.value = true
}

const handleImport = () => {
  try {
    const schema = JSON.parse(importForm.value.schema)
    const newForm = {
      id: Date.now(),
      title: importForm.value.title || schema.title || '未命名表单',
      description: '导入的表单',
      status: 'draft',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      schema
    }
    formList.value.unshift(newForm)
    total.value++
    importDialogVisible.value = false
    ElMessage.success('导入成功')
  } catch (error) {
    ElMessage.error('JSON格式错误')
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadFormList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadFormList()
}

// 生命周期
onMounted(() => {
  loadFormList()
})
</script>

<style scoped>
.form-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar .el-button {
  margin-right: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 