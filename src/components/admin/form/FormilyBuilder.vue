<template>
  <div class="formily-builder">
    <!-- 顶部工具栏 -->
    <div class="builder-toolbar">
      <div class="toolbar-left">
        <el-button @click="$router.back()" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="form-info">
          <h2 class="form-title">{{ isEdit ? '编辑表单' : '新建表单' }}</h2>
          <span class="form-subtitle">{{ formConfig.title || '未命名表单' }}</span>
        </div>
      </div>
      
      <div class="toolbar-right">
        <el-button-group>
                          <el-button @click="handlePreviewForm" :icon="View">预览</el-button>
          <el-button @click="exportSchema" :icon="Download">导出</el-button>
          <el-button @click="importSchema" :icon="Upload">导入</el-button>
        </el-button-group>
        <el-divider direction="vertical" />
        <el-button @click="saveForm" type="primary" :icon="DocumentChecked">保存</el-button>
        <el-button @click="publishForm" type="success" :icon="Promotion">发布</el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="builder-main">
      <!-- 左侧组件面板 -->
      <div class="components-panel">
        <div class="panel-header">
          <h3>组件库</h3>
          <div class="search-wrapper">
            <el-input 
              v-model="componentSearch" 
              placeholder="搜索组件..." 
              size="small"
              :prefix-icon="Search"
              clearable
            />
            <el-text class="components-count" size="small" type="info">
              {{ getTotalComponentsCount() }} 个组件
            </el-text>
          </div>
        </div>
        
        <el-scrollbar class="panel-content">
          <div v-for="category in filteredComponents" :key="category.name" class="component-category">
            <h4 class="category-title">{{ category.name }}</h4>
            <div class="component-grid">
              <div
                v-for="component in category.components"
                :key="component.type"
                class="component-card"
                draggable="true"
                @dragstart="handleDragStart(component, $event)"
                @click="addComponent(component)"
                :title="component.desc"
              >
                <div class="component-icon">
                  <el-icon :size="24">
                    <component :is="component.icon" />
                  </el-icon>
                </div>
                <div class="component-info">
                  <span class="component-name">{{ component.label }}</span>
                  <span class="component-desc">{{ component.desc }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 中间设计区域 -->
      <div class="design-panel">
        <div class="panel-header">
          <div class="header-left">
            <h3>表单设计</h3>
            <el-tag v-if="selectedField" type="primary" size="small">
              已选择: {{ getFieldSchema(selectedField)?.title || selectedField }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button-group size="small">
              <el-button @click="clearForm" :icon="Delete">清空</el-button>
              <el-button @click="undoAction" :disabled="!canUndo" :icon="RefreshLeft">撤销</el-button>
              <el-button @click="redoAction" :disabled="!canRedo" :icon="RefreshRight">重做</el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 表单基本设置 -->
        <div class="form-settings">
          <el-form :model="formConfig" layout="inline" size="small">
            <el-form-item label="表单名称">
              <el-input v-model="formConfig.title" placeholder="请输入表单名称" style="width: 200px" />
            </el-form-item>
            <el-form-item label="表单描述">
              <el-input v-model="formConfig.description" placeholder="表单描述" style="width: 200px" />
            </el-form-item>
            <el-form-item label="布局">
              <el-select v-model="formConfig.layout" style="width: 120px">
                <el-option label="垂直" value="vertical" />
                <el-option label="水平" value="horizontal" />
                <el-option label="内联" value="inline" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表单设计区域 -->
        <div 
          class="design-area"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @click="clearSelection"
        >
          <div v-if="formSchema.properties && Object.keys(formSchema.properties).length === 0" class="empty-state">
            <el-icon :size="64" class="empty-icon"><DocumentAdd /></el-icon>
            <h3>开始设计你的表单</h3>
            <p>从左侧拖拽组件到这里，或者点击组件直接添加</p>
          </div>
          
          <div v-else class="form-content">
            <FormRender
              :form="form"
              :schema="formSchema"
              :selected-field="selectedField"
              @field-click="selectField"
              @field-delete="deleteField"
              @field-move="moveField"
            />
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="properties-panel">
        <div class="panel-header">
          <h3>{{ selectedField ? '属性设置' : '表单设置' }}</h3>
        </div>
        
        <el-scrollbar class="panel-content">
          <div v-if="selectedField" class="field-properties">
            <FieldProperties
              :field="selectedField"
              :schema="getFieldSchema(selectedField)"
              @update="updateFieldProperty"
              @delete="deleteField"
            />
          </div>
          
          <div v-else class="form-properties">
            <FormProperties
              :config="formConfig"
              @update="updateFormConfig"
            />
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="表单预览" width="800px" center>
      <div class="preview-content">
        <FormRender
          :form="previewForm"
          :schema="formSchema"
          :readonly="false"
        />
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="testSubmit">测试提交</el-button>
      </template>
    </el-dialog>

    <!-- 导入导出对话框 -->
    <el-dialog v-model="importVisible" title="导入表单配置" width="600px">
      <el-input
        v-model="importData"
        type="textarea"
        :rows="15"
        placeholder="请粘贴JSON格式的表单配置"
      />
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport">导入</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="exportVisible" title="导出表单配置" width="600px">
      <el-input
        v-model="exportData"
        type="textarea"
        :rows="15"
        readonly
      />
      <template #footer>
        <el-button @click="copyExportData">复制到剪贴板</el-button>
        <el-button type="primary" @click="exportVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createForm } from '@formily/core'
import {
  ArrowLeft, View, Download, Upload, DocumentChecked, Promotion,
  Search, Delete, RefreshLeft, RefreshRight, DocumentAdd,
  Edit, Calendar, Picture, List, Select, Switch, UploadFilled,
  Files, Grid, User, Phone, Lock, Link, ChatDotRound
} from '@element-plus/icons-vue'

import FormRender from './FormilyRender.vue'
import FieldProperties from './FieldProperties.vue'
import FormProperties from './FormProperties.vue'

const route = useRoute()
const router = useRouter()

// 基础状态
const isEdit = computed(() => !!route.params.id)
const selectedField = ref(null)
const componentSearch = ref('')

// 表单配置
const formConfig = ref({
  title: '',
  description: '',
  layout: 'vertical',
  size: 'default',
  labelWidth: '100px',
  labelPosition: 'right'
})

// Formily表单实例
const form = ref(createForm())
const previewForm = ref(createForm())

// 表单Schema
const formSchema = ref({
  type: 'object',
  properties: {}
})

// 历史记录
const history = ref([])
const historyIndex = ref(-1)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// 对话框状态
const previewVisible = ref(false)
const importVisible = ref(false)
const exportVisible = ref(false)
const importData = ref('')
const exportData = ref('')

// 组件库配置 - 参考专业二维码编辑器设计
const componentCategories = ref([
  {
    name: '基础输入',
    components: [
      { type: 'Input', label: '单行文本', icon: 'EditPen', category: 'input', desc: '单行文本输入框' },
      { type: 'Textarea', label: '多行文本', icon: 'Document', category: 'input', desc: '多行文本输入域' },
      { type: 'Password', label: '密码输入', icon: 'Lock', category: 'input', desc: '密码输入框' },
      { type: 'InputNumber', label: '数字输入', icon: 'Calculator', category: 'input', desc: '数字输入框' },
      { type: 'Phone', label: '手机号码', icon: 'Phone', category: 'input', desc: '手机号码输入' },
      { type: 'Email', label: '邮箱地址', icon: 'Message', category: 'input', desc: '邮箱地址输入' },
      { type: 'URL', label: '网址链接', icon: 'Link', category: 'input', desc: '网址链接输入' },
      { type: 'IDCard', label: '身份证号', icon: 'Postcard', category: 'input', desc: '身份证号输入' }
    ]
  },
  {
    name: '选择控件',
    components: [
      { type: 'Select', label: '下拉选择', icon: 'ArrowDown', category: 'select', desc: '下拉选择器' },
      { type: 'Radio', label: '单选按钮', icon: 'Finished', category: 'select', desc: '单选按钮组' },
      { type: 'Checkbox', label: '多选框', icon: 'Check', category: 'select', desc: '多选框组' },
      { type: 'Switch', label: '开关切换', icon: 'SwitchButton', category: 'select', desc: '开关组件' },
      { type: 'Cascader', label: '级联选择', icon: 'Sort', category: 'select', desc: '级联选择器' },
      { type: 'TreeSelect', label: '树形选择', icon: 'Share', category: 'select', desc: '树形选择器' },
      { type: 'Transfer', label: '穿梭框', icon: 'Sort', category: 'select', desc: '双栏穿梭选择' },
      { type: 'Rate', label: '评分组件', icon: 'Star', category: 'select', desc: '星级评分' }
    ]
  },
  {
    name: '日期时间',
    components: [
      { type: 'DatePicker', label: '日期选择', icon: 'Calendar', category: 'date', desc: '日期选择器' },
      { type: 'TimePicker', label: '时间选择', icon: 'Clock', category: 'date', desc: '时间选择器' },
      { type: 'DateTimePicker', label: '日期时间', icon: 'Timer', category: 'date', desc: '日期时间选择器' },
      { type: 'DateRange', label: '日期范围', icon: 'Calendar', category: 'date', desc: '日期范围选择' },
      { type: 'TimeRange', label: '时间范围', icon: 'Clock', category: 'date', desc: '时间范围选择' },
      { type: 'MonthPicker', label: '月份选择', icon: 'Calendar', category: 'date', desc: '月份选择器' },
      { type: 'YearPicker', label: '年份选择', icon: 'Calendar', category: 'date', desc: '年份选择器' }
    ]
  },
  {
    name: '媒体上传',
    components: [
      { type: 'Upload', label: '文件上传', icon: 'Folder', category: 'upload', desc: '通用文件上传' },
      { type: 'ImageUpload', label: '图片上传', icon: 'Picture', category: 'upload', desc: '图片文件上传' },
      { type: 'VideoUpload', label: '视频上传', icon: 'VideoCamera', category: 'upload', desc: '视频文件上传' },
      { type: 'AudioUpload', label: '音频上传', icon: 'Microphone', category: 'upload', desc: '音频文件上传' },
      { type: 'DocUpload', label: '文档上传', icon: 'Document', category: 'upload', desc: '文档文件上传' },
      { type: 'Avatar', label: '头像上传', icon: 'User', category: 'upload', desc: '用户头像上传' }
    ]
  },
  {
    name: '高级组件',
    components: [
      { type: 'RichText', label: '富文本编辑', icon: 'Edit', category: 'advanced', desc: '富文本编辑器' },
      { type: 'CodeEditor', label: '代码编辑', icon: 'Document', category: 'advanced', desc: '代码编辑器' },
      { type: 'ColorPicker', label: '颜色选择', icon: 'Brush', category: 'advanced', desc: '颜色选择器' },
      { type: 'Slider', label: '滑动条', icon: 'Minus', category: 'advanced', desc: '数值滑动条' },
      { type: 'Mention', label: '@提及', icon: 'ChatDotRound', category: 'advanced', desc: '提及组件' },
      { type: 'AutoComplete', label: '自动完成', icon: 'Search', category: 'advanced', desc: '自动完成输入' },
      { type: 'Signature', label: '电子签名', icon: 'EditPen', category: 'advanced', desc: '手写签名板' },
      { type: 'Location', label: '地图定位', icon: 'Location', category: 'advanced', desc: '地图位置选择' }
    ]
  },
  {
    name: '数据展示',
    components: [
      { type: 'Table', label: '数据表格', icon: 'Grid', category: 'display', desc: '数据表格展示' },
      { type: 'List', label: '列表展示', icon: 'List', category: 'display', desc: '列表数据展示' },
      { type: 'Chart', label: '图表组件', icon: 'TrendCharts', category: 'display', desc: '数据图表展示' },
      { type: 'StatCard', label: '统计卡片', icon: 'DataBoard', category: 'display', desc: '统计数据卡片' },
      { type: 'Timeline', label: '时间轴', icon: 'Clock', category: 'display', desc: '时间轴展示' },
      { type: 'Tree', label: '树形控件', icon: 'Share', category: 'display', desc: '树形数据展示' }
    ]
  },
  {
    name: '容器布局',
    components: [
      { type: 'Card', label: '卡片容器', icon: 'Tickets', category: 'layout', desc: '卡片布局容器' },
      { type: 'Collapse', label: '折叠面板', icon: 'Fold', category: 'layout', desc: '可折叠面板' },
      { type: 'Tabs', label: '标签页', icon: 'Menu', category: 'layout', desc: '标签页容器' },
      { type: 'Steps', label: '步骤条', icon: 'Sort', category: 'layout', desc: '步骤流程展示' },
      { type: 'Divider', label: '分割线', icon: 'Minus', category: 'layout', desc: '内容分割线' },
      { type: 'Space', label: '间距组件', icon: 'MoreFilled', category: 'layout', desc: '设置组件间距' },
      { type: 'Row', label: '栅格行', icon: 'Grid', category: 'layout', desc: '栅格布局行' },
      { type: 'Col', label: '栅格列', icon: 'Grid', category: 'layout', desc: '栅格布局列' }
    ]
  },
  {
    name: '反馈组件',
    components: [
      { type: 'Alert', label: '警告提示', icon: 'Warning', category: 'feedback', desc: '警告信息展示' },
      { type: 'Progress', label: '进度条', icon: 'Loading', category: 'feedback', desc: '进度展示组件' },
      { type: 'Result', label: '结果页', icon: 'SuccessFilled', category: 'feedback', desc: '操作结果页面' },
      { type: 'Empty', label: '空状态', icon: 'Box', category: 'feedback', desc: '空数据展示' },
      { type: 'Spin', label: '加载中', icon: 'Loading', category: 'feedback', desc: '加载状态显示' }
    ]
  },
  {
    name: '特殊组件',
    components: [
      { type: 'QRCode', label: '二维码', icon: 'Picture', category: 'special', desc: '二维码生成显示' },
      { type: 'Barcode', label: '条形码', icon: 'Grid', category: 'special', desc: '条形码生成显示' },
      { type: 'Captcha', label: '验证码', icon: 'View', category: 'special', desc: '图形验证码' },
      { type: 'Weather', label: '天气组件', icon: 'Sunny', category: 'special', desc: '天气信息展示' },
      { type: 'Map', label: '地图组件', icon: 'Location', category: 'special', desc: '地图展示组件' },
      { type: 'Calendar', label: '日历组件', icon: 'Calendar', category: 'special', desc: '日历展示组件' }
    ]
  }
])

// 过滤组件
const filteredComponents = computed(() => {
  if (!componentSearch.value) return componentCategories.value
  
  const searchTerm = componentSearch.value.toLowerCase()
  return componentCategories.value.map(category => ({
    ...category,
    components: category.components.filter(comp => 
      comp.label.toLowerCase().includes(searchTerm) ||
      comp.desc.toLowerCase().includes(searchTerm) ||
      comp.type.toLowerCase().includes(searchTerm)
    )
  })).filter(category => category.components.length > 0)
})

// 获取组件总数
const getTotalComponentsCount = () => {
  return filteredComponents.value.reduce((total, category) => {
    return total + category.components.length
  }, 0)
}

// 方法
const addToHistory = () => {
  const snapshot = JSON.parse(JSON.stringify({
    schema: formSchema.value,
    config: formConfig.value
  }))
  
  // 移除当前位置之后的历史记录
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  
  history.value.push(snapshot)
  historyIndex.value = history.value.length - 1
  
  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

const undoAction = () => {
  if (canUndo.value) {
    historyIndex.value--
    const snapshot = history.value[historyIndex.value]
    formSchema.value = JSON.parse(JSON.stringify(snapshot.schema))
    formConfig.value = JSON.parse(JSON.stringify(snapshot.config))
    selectedField.value = null
  }
}

const redoAction = () => {
  if (canRedo.value) {
    historyIndex.value++
    const snapshot = history.value[historyIndex.value]
    formSchema.value = JSON.parse(JSON.stringify(snapshot.schema))
    formConfig.value = JSON.parse(JSON.stringify(snapshot.config))
    selectedField.value = null
  }
}

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
    addComponent(component)
  }
}

const addComponent = (component) => {
  addToHistory()
  
  const fieldName = `field_${Date.now()}`
  const fieldSchema = createFieldSchema(component)
  
  formSchema.value.properties[fieldName] = fieldSchema
  selectedField.value = fieldName
  
  // 添加到form实例
  form.value.setFieldState(fieldName, {
    title: fieldSchema.title,
    component: fieldSchema['x-component'],
    componentProps: fieldSchema['x-component-props'] || {}
  })
}

const createFieldSchema = (component) => {
  const baseSchema = {
    type: 'string',
    title: component.label,
    'x-component': component.type,
    'x-component-props': {}
  }

  // 根据组件类型设置默认属性
  switch (component.type) {
    case 'InputNumber':
      baseSchema.type = 'number'
      baseSchema['x-component-props'] = { min: 0, max: 100, step: 1 }
      break
    case 'Switch':
      baseSchema.type = 'boolean'
      break
    case 'Select':
    case 'Radio':
      baseSchema.enum = ['选项1', '选项2', '选项3']
      break
    case 'Checkbox':
      baseSchema.type = 'array'
      baseSchema.enum = ['选项1', '选项2', '选项3']
      break
    case 'DatePicker':
      baseSchema['x-component-props'] = { 
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD'
      }
      break
    case 'DateTimePicker':
      baseSchema['x-component-props'] = {
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
      break
    case 'Upload':
    case 'ImageUpload':
      baseSchema.type = 'array'
      baseSchema['x-component-props'] = {
        action: '/api/upload',
        listType: component.type === 'ImageUpload' ? 'picture-card' : 'text'
      }
      break
    case 'Textarea':
      baseSchema['x-component-props'] = { rows: 4 }
      break
    case 'Password':
      baseSchema['x-component'] = 'Input'
      baseSchema['x-component-props'] = { type: 'password', showPassword: true }
      break
    case 'Phone':
      baseSchema['x-component'] = 'Input'
      baseSchema['x-component-props'] = { 
        placeholder: '请输入手机号码',
        maxlength: 11
      }
      break
    case 'Email':
      baseSchema['x-component'] = 'Input'
      baseSchema['x-component-props'] = { 
        placeholder: '请输入邮箱地址',
        type: 'email'
      }
      break
    case 'URL':
      baseSchema['x-component'] = 'Input'
      baseSchema['x-component-props'] = { 
        placeholder: '请输入网址',
        type: 'url'
      }
      break
  }

  return baseSchema
}

const selectField = (fieldName) => {
  selectedField.value = fieldName
}

const clearSelection = (event) => {
  if (event.target.classList.contains('design-area')) {
    selectedField.value = null
  }
}

const deleteField = (fieldName) => {
  addToHistory()
  
  delete formSchema.value.properties[fieldName]
  if (selectedField.value === fieldName) {
    selectedField.value = null
  }
  
  form.value.deleteField(fieldName)
}

const moveField = (dragIndex, hoverIndex) => {
  addToHistory()
  
  const fields = Object.keys(formSchema.value.properties)
  const dragField = fields[dragIndex]
  const newFields = [...fields]
  
  newFields.splice(dragIndex, 1)
  newFields.splice(hoverIndex, 0, dragField)
  
  const newProperties = {}
  newFields.forEach(field => {
    newProperties[field] = formSchema.value.properties[field]
  })
  
  formSchema.value.properties = newProperties
}

const getFieldSchema = (fieldName) => {
  return formSchema.value.properties[fieldName]
}

const updateFieldProperty = (property, value) => {
  if (selectedField.value && formSchema.value.properties[selectedField.value]) {
    addToHistory()
    formSchema.value.properties[selectedField.value][property] = value
    
    // 更新form实例
    form.value.setFieldState(selectedField.value, {
      [property]: value
    })
  }
}

const updateFormConfig = (property, value) => {
  addToHistory()
  formConfig.value[property] = value
}

const clearForm = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有内容吗？此操作不可恢复。', '确认清空', {
      type: 'warning'
    })
    
    addToHistory()
    formSchema.value.properties = {}
    selectedField.value = null
    form.value.clearFormGraph()
    
    ElMessage.success('表单已清空')
  } catch {
    // 用户取消
  }
}

const handlePreviewForm = () => {
  previewForm.value = createForm()
  previewVisible.value = true
}

const testSubmit = async () => {
  try {
    await previewForm.value.submit()
    ElMessage.success('表单验证通过')
    console.log('表单数据:', previewForm.value.values)
  } catch (error) {
    ElMessage.error('表单验证失败')
    console.error('验证错误:', error)
  }
}

const exportSchema = () => {
  exportData.value = JSON.stringify({
    config: formConfig.value,
    schema: formSchema.value
  }, null, 2)
  exportVisible.value = true
}

const importSchema = () => {
  importData.value = ''
  importVisible.value = true
}

const handleImport = () => {
  try {
    const data = JSON.parse(importData.value)
    
    if (data.config) {
      formConfig.value = { ...formConfig.value, ...data.config }
    }
    if (data.schema) {
      addToHistory()
      formSchema.value = data.schema
      selectedField.value = null
      
      // 重新创建form实例
      form.value = createForm({
        initialValues: {},
        effects: () => {}
      })
    }
    
    importVisible.value = false
    ElMessage.success('导入成功')
  } catch (error) {
    ElMessage.error('JSON格式错误，请检查后重试')
  }
}

const copyExportData = async () => {
  try {
    await navigator.clipboard.writeText(exportData.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const saveForm = async () => {
  if (!formConfig.value.title) {
    ElMessage.error('请输入表单名称')
    return
  }
  
  try {
    // 这里调用API保存表单
    // await api.saveForm({ config: formConfig.value, schema: formSchema.value })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const publishForm = async () => {
  if (!formConfig.value.title) {
    ElMessage.error('请输入表单名称')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要发布此表单吗？发布后用户可以填写表单。', '确认发布', {
      type: 'warning'
    })
    
    // 这里调用API发布表单
    // await api.publishForm({ config: formConfig.value, schema: formSchema.value })
    ElMessage.success('发布成功')
  } catch {
    // 用户取消
  }
}

// 初始化
onMounted(() => {
  // 添加初始历史记录
  addToHistory()
  
  if (isEdit.value) {
    // 加载现有表单
    loadFormData(route.params.id)
  }
  
  if (route.query.demo) {
    loadDemoForm()
  }
})

const loadFormData = async (id) => {
  try {
    // 这里调用API加载表单数据
    // const data = await api.getForm(id)
    // formConfig.value = data.config
    // formSchema.value = data.schema
  } catch (error) {
    ElMessage.error('加载表单失败')
  }
}

const loadDemoForm = () => {
  formConfig.value = {
    title: '用户信息登记表',
    description: '请填写完整的用户信息',
    layout: 'vertical'
  }
  
  formSchema.value = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: '姓名',
        'x-component': 'Input',
        'x-component-props': { placeholder: '请输入姓名' },
        'x-rules': [{ required: true, message: '请输入姓名' }]
      },
      email: {
        type: 'string',
        title: '邮箱',
        'x-component': 'Input',
        'x-component-props': { placeholder: '请输入邮箱地址', type: 'email' },
        'x-rules': [
          { required: true, message: '请输入邮箱' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式' }
        ]
      },
      phone: {
        type: 'string',
        title: '手机号',
        'x-component': 'Input',
        'x-component-props': { placeholder: '请输入手机号', maxlength: 11 },
        'x-rules': [
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
        ]
      },
      gender: {
        type: 'string',
        title: '性别',
        'x-component': 'Radio',
        enum: ['男', '女'],
        'x-rules': [{ required: true, message: '请选择性别' }]
      },
      birthday: {
        type: 'string',
        title: '出生日期',
        'x-component': 'DatePicker',
        'x-component-props': { 
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          placeholder: '请选择出生日期'
        }
      }
    }
  }
  
  addToHistory()
}
</script>

<style scoped>
.formily-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 工具栏样式 */
.builder-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.form-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.form-subtitle {
  font-size: 13px;
  color: #909399;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 主要内容区域 */
.builder-main {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

/* 组件面板 */
.components-panel {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-content {
  flex: 1;
  padding: 16px;
}

.component-category {
  margin-bottom: 24px;
}

.category-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  min-height: 60px;
  margin-bottom: 8px;
}

.component-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
  background: #f8fbff;
}

.component-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.component-icon {
  color: #409eff;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.component-card:hover .component-icon {
  background: rgba(64, 158, 255, 0.2);
  transform: scale(1.1);
}

.component-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.component-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.component-desc {
  font-size: 11px;
  color: #909399;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 设计面板 */
.design-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.form-settings {
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #e4e7ed;
}

.design-area {
  flex: 1;
  overflow-y: auto;
  position: relative;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.form-content {
  padding: 24px;
}

/* 属性面板 */
.properties-panel {
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.field-properties,
.form-properties {
  padding: 16px;
}

/* 预览内容 */
.preview-content {
  padding: 24px;
  background: #fafbfc;
  border-radius: 6px;
  margin: 16px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .components-panel {
    width: 240px;
  }
  
  .properties-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .builder-main {
    flex-direction: column;
    gap: 12px;
  }
  
  .components-panel,
  .properties-panel {
    width: 100%;
    height: 200px;
  }
}

/* 滚动条样式 */
:deep(.el-scrollbar__bar) {
  opacity: 0.3;
}

:deep(.el-scrollbar__bar:hover) {
  opacity: 0.6;
}
</style> 