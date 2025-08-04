<template>
  <div class="form-builder">
    <div class="builder-header">
      <div class="header-left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h3>{{ isEdit ? '编辑表单' : '新建表单' }}</h3>
      </div>
      <div class="header-right">
        <el-button @click="previewForm">预览</el-button>
        <el-button @click="saveForm" type="primary">保存</el-button>
        <el-button @click="publishForm" type="success">发布</el-button>
      </div>
    </div>

    <div class="builder-content">
      <el-row :gutter="20">
        <!-- 左侧：组件库 -->
        <el-col :span="6">
          <div class="component-panel">
            <h4>组件库</h4>
            <div class="component-categories">
              <div v-for="category in componentCategories" :key="category.name" class="category">
                <h5>{{ category.name }}</h5>
                <div class="component-list">
                  <div
                    v-for="component in category.components"
                    :key="component.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart(component, $event)"
                  >
                    <el-icon>
                      <component :is="component.icon" />
                    </el-icon>
                    <span>{{ component.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 中间：设计区域 -->
        <el-col :span="12">
          <div class="design-panel">
            <div class="panel-header">
              <h4>表单设计</h4>
              <div class="panel-actions">
                <el-button size="small" @click="clearForm">清空</el-button>
                <el-button size="small" @click="importJSON">导入JSON</el-button>
                <el-button size="small" @click="exportJSON">导出JSON</el-button>
              </div>
            </div>
            
            <div class="form-settings">
              <el-form :model="formSchema" label-width="80px" size="small">
                <el-form-item label="表单名称">
                  <el-input v-model="formSchema.title" placeholder="请输入表单名称" />
                </el-form-item>
                <el-form-item label="表单描述">
                  <el-input v-model="formSchema.description" placeholder="请输入表单描述" />
                </el-form-item>
                <el-form-item label="启用步骤">
                  <el-switch v-model="enableSteps" @change="handleStepsChange" />
                </el-form-item>
              </el-form>
            </div>

            <div
              class="design-area"
              @drop="handleDrop"
              @dragover="handleDragOver"
            >
              <div v-if="Object.keys(formSchema.properties || {}).length === 0" class="empty-design">
                <el-icon size="48"><DocumentAdd /></el-icon>
                <p>拖拽左侧组件到这里开始设计表单</p>
              </div>
              
              <div v-else class="form-preview">
                <FormRenderer
                  :schema="formSchema"
                  :values="formValues"
                  mode="design"
                  @field-click="selectField"
                  @field-delete="deleteField"
                />
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧：属性配置 -->
        <el-col :span="6">
          <div class="property-panel">
            <h4>属性配置</h4>
            <div v-if="selectedField" class="field-properties">
              <FieldPropertyEditor
                :field="selectedField"
                :schema="formSchema.properties[selectedField]"
                @update="updateFieldProperty"
              />
            </div>
            <div v-else class="no-selection">
              <p>请先选择一个字段</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- JSON导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入JSON配置" width="600px">
      <el-input
        v-model="importJson"
        type="textarea"
        :rows="15"
        placeholder="请粘贴表单JSON配置"
      />
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportJSON">确定</el-button>
      </template>
    </el-dialog>

    <!-- JSON导出对话框 -->
    <el-dialog v-model="exportDialogVisible" title="导出JSON配置" width="600px">
      <el-input
        v-model="exportJson"
        type="textarea"
        :rows="15"
        readonly
      />
      <template #footer>
        <el-button @click="copyToClipboard">复制到剪贴板</el-button>
        <el-button type="primary" @click="exportDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  DocumentAdd,
  Edit,
  Calendar,
  Picture,
  List,
  Select,
  Switch,
  Upload
} from '@element-plus/icons-vue'
import FormRenderer from './FormRenderer.vue'
import FieldPropertyEditor from './FieldPropertyEditor.vue'

const route = useRoute()
const router = useRouter()

// 数据状态
const isEdit = computed(() => !!route.params.id)
const formSchema = ref({
  type: 'object',
  title: '',
  description: '',
  properties: {},
  'x-steps': []
})
const formValues = ref({})
const selectedField = ref(null)
const enableSteps = ref(false)

// 对话框状态
const importDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const importJson = ref('')
const exportJson = ref('')

// 组件库配置
const componentCategories = ref([
  {
    name: '基础组件',
    components: [
      { type: 'Input', label: '输入框', icon: 'Edit' },
      { type: 'Textarea', label: '文本域', icon: 'Edit' },
      { type: 'InputNumber', label: '数字输入', icon: 'Edit' },
      { type: 'Select', label: '下拉选择', icon: 'Select' },
      { type: 'RadioGroup', label: '单选框', icon: 'Select' },
      { type: 'CheckboxGroup', label: '多选框', icon: 'Select' },
      { type: 'Switch', label: '开关', icon: 'Switch' }
    ]
  },
  {
    name: '日期时间',
    components: [
      { type: 'DatePicker', label: '日期选择', icon: 'Calendar' },
      { type: 'TimePicker', label: '时间选择', icon: 'Calendar' },
      { type: 'DateTimePicker', label: '日期时间', icon: 'Calendar' }
    ]
  },
  {
    name: '高级组件',
    components: [
      { type: 'ImageUploader', label: '图片上传', icon: 'Picture' },
      { type: 'TreeSelect', label: '树形选择', icon: 'List' },
      { type: 'Cascader', label: '级联选择', icon: 'List' },
      { type: 'Upload', label: '文件上传', icon: 'Upload' }
    ]
  }
])

// 方法
const handleDragStart = (component, event) => {
  event.dataTransfer.setData('component', JSON.stringify(component))
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  const componentData = event.dataTransfer.getData('component')
  if (componentData) {
    const component = JSON.parse(componentData)
    addField(component)
  }
}

const addField = (component) => {
  const fieldName = `field_${Date.now()}`
  const fieldSchema = {
    type: getFieldType(component.type),
    title: component.label,
    'x-component': component.type
  }

  // 根据组件类型设置默认属性
  switch (component.type) {
    case 'Select':
    case 'RadioGroup':
    case 'CheckboxGroup':
      fieldSchema.enum = ['选项1', '选项2', '选项3']
      break
    case 'ImageUploader':
    case 'Upload':
      fieldSchema.type = 'array'
      fieldSchema.maxItems = 5
      break
    case 'InputNumber':
      fieldSchema.type = 'number'
      break
    case 'Switch':
      fieldSchema.type = 'boolean'
      break
  }

  formSchema.value.properties[fieldName] = fieldSchema
  selectedField.value = fieldName
}

const getFieldType = (component) => {
  const typeMap = {
    'InputNumber': 'number',
    'Switch': 'boolean',
    'ImageUploader': 'array',
    'Upload': 'array',
    'CheckboxGroup': 'array'
  }
  return typeMap[component] || 'string'
}

const selectField = (fieldName) => {
  selectedField.value = fieldName
}

const deleteField = (fieldName) => {
  delete formSchema.value.properties[fieldName]
  if (selectedField.value === fieldName) {
    selectedField.value = null
  }
}

const updateFieldProperty = (property, value) => {
  if (selectedField.value && formSchema.value.properties[selectedField.value]) {
    formSchema.value.properties[selectedField.value][property] = value
  }
}

const handleStepsChange = (value) => {
  if (value) {
    formSchema.value['x-steps'] = [
      {
        title: '步骤1',
        fields: Object.keys(formSchema.value.properties || {})
      }
    ]
  } else {
    delete formSchema.value['x-steps']
  }
}

const clearForm = () => {
  formSchema.value.properties = {}
  selectedField.value = null
}

const importJSON = () => {
  importJson.value = JSON.stringify(formSchema.value, null, 2)
  importDialogVisible.value = true
}

const handleImportJSON = () => {
  try {
    const schema = JSON.parse(importJson.value)
    formSchema.value = schema
    enableSteps.value = !!schema['x-steps']
    selectedField.value = null
    importDialogVisible.value = false
    ElMessage.success('导入成功')
  } catch (error) {
    ElMessage.error('JSON格式错误')
  }
}

const exportJSON = () => {
  exportJson.value = JSON.stringify(formSchema.value, null, 2)
  exportDialogVisible.value = true
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportJson.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const previewForm = () => {
  // 暂存当前表单配置，然后跳转到预览页面
  sessionStorage.setItem('preview-form', JSON.stringify(formSchema.value))
  router.push('/admin/form/preview/temp')
}

const saveForm = () => {
  if (!formSchema.value.title) {
    ElMessage.error('请输入表单名称')
    return
  }
  // 这里应该调用API保存表单
  ElMessage.success('保存成功')
}

const publishForm = () => {
  if (!formSchema.value.title) {
    ElMessage.error('请输入表单名称')
    return
  }
  // 这里应该调用API发布表单
  ElMessage.success('发布成功')
}

// 生命周期
onMounted(() => {
  if (isEdit.value) {
    // 加载现有表单数据
    loadFormData(route.params.id)
  }

  // 加载示例表单数据
  if (route.query.demo) {
    loadDemoForm()
  }
})

const loadFormData = (id) => {
  // 模拟加载表单数据
  // 这里应该调用API获取表单数据
}

const loadDemoForm = () => {
  // 加载示例表单
  formSchema.value = {
    "type": "object",
    "title": "复杂业务表单-Demo",
    "description": "包含多种组件类型的示例表单",
    "x-steps": [
      {
        "title": "基础信息",
        "fields": ["username", "date", "idPhoto", "region"]
      },
      {
        "title": "其他信息",
        "fields": ["department", "remark"]
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
      },
      "idPhoto": {
        "type": "array",
        "title": "身份证照片",
        "x-component": "ImageUploader",
        "maxItems": 1,
        "minItems": 1
      },
      "region": {
        "type": "string",
        "title": "所属片区",
        "x-component": "TreeSelect",
        "x-large": true
      },
      "department": {
        "type": "string",
        "title": "部门",
        "x-component": "Select",
        "enum": ["工程部", "财务部", "后勤部", "研发组", "市场部"]
      },
      "remark": {
        "type": "string",
        "title": "备注",
        "x-component": "Textarea"
      }
    }
  }
  enableSteps.value = true
}
</script>

<style scoped>
.form-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h3 {
  margin: 0;
  color: #303133;
}

.header-right .el-button {
  margin-left: 10px;
}

.builder-content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow: hidden;
}

.component-panel,
.design-panel,
.property-panel {
  height: calc(100vh - 120px);
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.component-panel h4,
.design-panel h4,
.property-panel h4 {
  padding: 15px 20px;
  margin: 0;
  border-bottom: 1px solid #e6e6e6;
  background: #fafbfc;
}

.component-categories {
  padding: 15px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.category {
  margin-bottom: 20px;
}

.category h5 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 13px;
}

.component-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  cursor: move;
  background: #fafbfc;
  transition: all 0.3s;
}

.component-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.component-item span {
  margin-top: 5px;
  font-size: 12px;
  color: #606266;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafbfc;
}

.panel-actions .el-button {
  margin-left: 8px;
}

.form-settings {
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
}

.design-area {
  height: calc(100% - 180px);
  overflow-y: auto;
  position: relative;
}

.empty-design {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-design p {
  margin-top: 15px;
}

.form-preview {
  padding: 20px;
}

.field-properties {
  padding: 15px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 60px);
  color: #909399;
}
</style> 