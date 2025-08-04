<template>
  <div class="qrcode-editor">
    <!-- 页面头部 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button @click="handleBack" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="page-info">
          <h2>{{ isEdit ? '编辑二维码' : '创建二维码' }}</h2>
          <p>{{ formData.name || '未命名二维码' }}</p>
        </div>
      </div>
      
      <div class="header-right">
        <el-button-group>
          <el-button @click="handlePreview" :icon="View">预览</el-button>
          <el-button @click="handleTemplate" :icon="Folder">模板</el-button>
          <el-button @click="handleHistory" :icon="Clock">历史</el-button>
        </el-button-group>
        <el-divider direction="vertical" />
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button @click="handleSave" type="primary" :loading="saving">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="editor-main">
      <el-row :gutter="20">
        <!-- 左侧编辑区域 -->
        <el-col :span="16">
          <div class="edit-panel">
            <!-- 基本信息 -->
            <el-card class="info-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                  <el-button size="small" text @click="toggleInfoCollapse">
                    <el-icon>
                      <component :is="infoCollapsed ? 'ArrowDown' : 'ArrowUp'" />
                    </el-icon>
                  </el-button>
                </div>
              </template>
              
              <el-collapse-transition>
                <div v-show="!infoCollapsed" class="info-form">
                  <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="二维码名称" prop="name">
                          <el-input 
                            v-model="formData.name" 
                            placeholder="请输入二维码名称"
                            maxlength="50"
                            show-word-limit
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="二维码类型" prop="type">
                          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
                            <el-option label="文本内容" value="text" />
                            <el-option label="网址链接" value="url" />
                            <el-option label="WiFi信息" value="wifi" />
                            <el-option label="邮箱地址" value="email" />
                            <el-option label="电话号码" value="phone" />
                            <el-option label="短信内容" value="sms" />
                            <el-option label="电子名片" value="vcard" />
                            <el-option label="日程事件" value="event" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    
                    <el-form-item label="描述信息">
                      <el-input 
                        v-model="formData.description" 
                        type="textarea" 
                        :rows="2"
                        placeholder="请输入描述信息"
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                    
                    <el-row :gutter="20">
                      <el-col :span="8">
                        <el-form-item label="状态">
                          <el-radio-group v-model="formData.status">
                            <el-radio label="active">启用</el-radio>
                            <el-radio label="inactive">禁用</el-radio>
                            <el-radio label="draft">草稿</el-radio>
                          </el-radio-group>
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item label="过期时间">
                          <el-date-picker
                            v-model="formData.expireAt"
                            type="datetime"
                            placeholder="选择过期时间"
                            style="width: 100%"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item label="标签">
                          <el-select
                            v-model="formData.tags"
                            multiple
                            filterable
                            allow-create
                            placeholder="选择或创建标签"
                            style="width: 100%"
                          >
                            <el-option
                              v-for="tag in availableTags"
                              :key="tag"
                              :label="tag"
                              :value="tag"
                            />
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
              </el-collapse-transition>
            </el-card>

            <!-- 内容编辑 -->
            <el-card class="content-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>内容编辑</span>
                  <div class="content-actions">
                    <el-button-group size="small">
                      <el-button @click="insertTemplate" :icon="DocumentAdd">模板</el-button>
                      <el-button @click="insertVariable" :icon="Promotion">变量</el-button>
                      <el-button @click="formatContent" :icon="EditPen">格式化</el-button>
                    </el-button-group>
                  </div>
                </div>
              </template>
              
              <div class="content-editor">
                <!-- 类型特定的表单 -->
                <!-- Formily表单设计器 -->
                <div v-if="formData.type && formData.type !== 'text'" class="formily-designer">
                  <h4>{{ getTypeName(formData.type) }}表单设计</h4>
                  <div class="formily-container">
                    <div class="formily-toolbar">
                      <el-button-group size="small">
                        <el-button @click="addFormilyField('input')" :icon="EditPen">单行文本</el-button>
                        <el-button @click="addFormilyField('textarea')" :icon="Document">多行文本</el-button>
                        <el-button @click="addFormilyField('select')" :icon="ArrowDown">下拉选择</el-button>
                        <el-button @click="addFormilyField('radio')" :icon="Finished">单选框</el-button>
                        <el-button @click="addFormilyField('checkbox')" :icon="Check">多选框</el-button>
                        <el-button @click="addFormilyField('date')" :icon="Calendar">日期选择</el-button>
                      </el-button-group>
                    </div>
                    
                    <div class="formily-preview">
                      <el-card shadow="never">
                        <template #header>
                          <div class="preview-header">
                            <span>表单预览</span>
                            <el-button size="small" @click="previewQRForm">生成二维码</el-button>
                          </div>
                        </template>
                        
                        <FormProvider :form="qrForm">
                          <div v-if="qrFormSchema.properties && Object.keys(qrFormSchema.properties).length > 0">
                            <div 
                              v-for="(field, key) in qrFormSchema.properties" 
                              :key="key"
                              class="form-field-wrapper"
                              @click="selectField(key)"
                              :class="{ 'selected': selectedFieldKey === key }"
                            >
                              <div class="field-actions">
                                <el-button-group size="small">
                                  <el-button @click.stop="editField(key)" :icon="Edit">编辑</el-button>
                                  <el-button @click.stop="deleteField(key)" :icon="Delete" type="danger">删除</el-button>
                                </el-button-group>
                              </div>
                              
                              <el-form-item :label="field.title || field['x-decorator-props']?.label || key">
                                <component 
                                  :is="getFormilyComponent(field['x-component'])"
                                  v-bind="getFormilyProps(field)"
                                  :placeholder="field['x-component-props']?.placeholder"
                                />
                              </el-form-item>
                            </div>
                          </div>
                          <div v-else class="empty-form">
                            <el-empty description="暂无表单字段，请点击上方按钮添加">
                              <el-button type="primary" @click="addFormilyField('input')">添加字段</el-button>
                            </el-empty>
                          </div>
                        </FormProvider>
                      </el-card>
                    </div>
                  </div>
                </div>

                <!-- 富文本编辑器 -->
                <div class="rich-editor">
                  <h4>富文本内容</h4>
                  <el-input
                    v-model="formData.content"
                    type="textarea"
                    :rows="8"
                    placeholder="请输入富文本内容（CKEditor集成中...）"
                    @input="handleContentChange"
                  />
                  <div class="editor-footer">
                    <el-text size="small" type="info">
                      暂时使用简单编辑器，CKEditor正在重新集成中...
                    </el-text>
                  </div>
                </div>

                <!-- 原始内容编辑 -->
                <div class="raw-content" v-if="showRawContent">
                  <h4>
                    原始内容
                    <el-button size="small" text @click="showRawContent = false">
                      隐藏
                    </el-button>
                  </h4>
                  <el-input
                    v-model="formData.rawContent"
                    type="textarea"
                    :rows="8"
                    placeholder="原始二维码内容，将用于生成二维码"
                  />
                </div>
                
                <div class="content-footer">
                  <el-button size="small" @click="showRawContent = !showRawContent">
                    {{ showRawContent ? '隐藏' : '显示' }}原始内容
                  </el-button>
                  <el-button size="small" @click="syncToRaw" type="primary">
                    同步到原始内容
                  </el-button>
                </div>
              </div>
            </el-card>

            <!-- 样式设置 -->
            <el-card class="style-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>样式设置</span>
                  <el-button size="small" text @click="toggleStyleCollapse">
                    <el-icon>
                      <component :is="styleCollapsed ? 'ArrowDown' : 'ArrowUp'" />
                    </el-icon>
                  </el-button>
                </div>
              </template>
              
              <el-collapse-transition>
                <div v-show="!styleCollapsed" class="style-form">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="二维码大小">
                        <el-slider
                          v-model="styleData.size"
                          :min="100"
                          :max="800"
                          :step="10"
                          show-input
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="容错级别">
                        <el-select v-model="styleData.errorLevel" style="width: 100%">
                          <el-option label="低 (7%)" value="L" />
                          <el-option label="中 (15%)" value="M" />
                          <el-option label="中高 (25%)" value="Q" />
                          <el-option label="高 (30%)" value="H" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="边框大小">
                        <el-input-number
                          v-model="styleData.margin"
                          :min="0"
                          :max="50"
                          style="width: 100%"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="前景色">
                        <el-color-picker v-model="styleData.foregroundColor" />
                        <span class="color-text">{{ styleData.foregroundColor }}</span>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="背景色">
                        <el-color-picker v-model="styleData.backgroundColor" />
                        <span class="color-text">{{ styleData.backgroundColor }}</span>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="输出格式">
                        <el-select v-model="styleData.format" style="width: 100%">
                          <el-option label="PNG" value="png" />
                          <el-option label="JPG" value="jpg" />
                          <el-option label="SVG" value="svg" />
                          <el-option label="PDF" value="pdf" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- Logo设置 -->
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="中心Logo">
                        <el-upload
                          :action="uploadAction"
                          :show-file-list="false"
                          :on-success="handleLogoSuccess"
                          :before-upload="beforeLogoUpload"
                          accept=".png,.jpg,.jpeg,.svg"
                        >
                          <div class="logo-upload">
                            <img v-if="styleData.logo" :src="styleData.logo" alt="Logo" />
                            <div v-else class="upload-placeholder">
                              <el-icon><Plus /></el-icon>
                              <div>上传Logo</div>
                            </div>
                          </div>
                        </el-upload>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="Logo大小">
                        <el-slider
                          v-model="styleData.logoSize"
                          :min="10"
                          :max="30"
                          :step="1"
                          show-input
                          :disabled="!styleData.logo"
                        />
                        <div class="form-help">Logo占二维码大小的百分比</div>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </el-collapse-transition>
            </el-card>
          </div>
        </el-col>

        <!-- 右侧预览区域 -->
        <el-col :span="8">
          <div class="preview-panel">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>实时预览</span>
                  <el-button-group size="small">
                    <el-button @click="generatePreview" :loading="generating" :icon="Refresh">
                      刷新
                    </el-button>
                    <el-button @click="downloadPreview" :disabled="!previewUrl" :icon="Download">
                      下载
                    </el-button>
                  </el-button-group>
                </div>
              </template>
              
              <div class="preview-content">
                <div class="qrcode-preview">
                  <div v-if="previewUrl" class="qrcode-image">
                    <img :src="previewUrl" alt="二维码预览" />
                  </div>
                  <div v-else-if="generating" class="loading-placeholder">
                    <el-icon class="rotating"><Loading /></el-icon>
                    <p>生成中...</p>
                  </div>
                  <div v-else class="empty-placeholder">
                    <el-icon><DocumentAdd /></el-icon>
                    <p>暂无预览</p>
                    <el-button size="small" @click="generatePreview">生成预览</el-button>
                  </div>
                </div>
                
                <div class="preview-info">
                  <el-descriptions :column="1" size="small" border>
                    <el-descriptions-item label="名称">
                      {{ formData.name || '未命名' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="类型">
                      {{ getTypeName(formData.type) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="状态">
                      <el-tag :type="getStatusTagType(formData.status)">
                        {{ getStatusName(formData.status) }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="大小">
                      {{ styleData.size }}x{{ styleData.size }}px
                    </el-descriptions-item>
                    <el-descriptions-item label="格式">
                      {{ styleData.format.toUpperCase() }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <div class="preview-actions">
                  <el-button @click="handleFullPreview" style="width: 100%">
                    全屏预览
                  </el-button>
                </div>
              </div>
            </el-card>

            <!-- 操作历史 -->
            <el-card shadow="never" class="history-card">
              <template #header>
                <span>操作历史</span>
              </template>
              
              <div class="history-list">
                <div
                  v-for="item in historyList"
                  :key="item.id"
                  class="history-item"
                  @click="restoreFromHistory(item)"
                >
                  <div class="history-time">{{ formatTime(item.createTime) }}</div>
                  <div class="history-action">{{ item.action }}</div>
                </div>
                <div v-if="historyList.length === 0" class="empty-history">
                  暂无历史记录
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 全屏预览对话框 -->
    <el-dialog v-model="fullPreviewVisible" title="二维码预览" width="600px" center>
      <div class="full-preview">
        <div class="preview-image">
          <img v-if="previewUrl" :src="previewUrl" alt="二维码" />
        </div>
        <div class="preview-details">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="名称">{{ formData.name }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ getTypeName(formData.type) }}</el-descriptions-item>
            <el-descriptions-item label="尺寸">{{ styleData.size }}px</el-descriptions-item>
            <el-descriptions-item label="格式">{{ styleData.format.toUpperCase() }}</el-descriptions-item>
            <el-descriptions-item label="容错级别">{{ styleData.errorLevel }}</el-descriptions-item>
            <el-descriptions-item label="边框">{{ styleData.margin }}px</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="downloadPreview" type="primary">下载二维码</el-button>
        <el-button @click="fullPreviewVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 模板选择对话框 -->
    <el-dialog v-model="templateDialogVisible" title="选择模板" width="800px">
      <div class="template-grid">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          @click="applyTemplate(template)"
        >
          <div class="template-preview">
            <img v-if="template.preview" :src="template.preview" alt="模板预览" />
            <div v-else class="no-preview">无预览</div>
          </div>
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-desc">{{ template.description }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, View, Folder, Clock, ArrowDown, ArrowUp, DocumentAdd, Promotion, EditPen,
  Refresh, Download, Loading, Plus
} from '@element-plus/icons-vue'

// CKEditor (临时注释，稍后重新集成)
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
// import { component as CKEditor } from '@ckeditor/ckeditor5-vue'

// Formily 相关导入
import { createForm } from '@formily/core'
import { FormProvider } from '@formily/vue'

import {
  createQRCode, updateQRCode, getQRCodeDetail, generateQRCode,
  getQRCodeTemplates, saveAsTemplate
} from '@/api/qrcode'
import { handleApiCall } from '@/utils/apiHelper'

// 注册组件
const components = {
  FormProvider
}

const route = useRoute()
const router = useRouter()

// 基础状态
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const generating = ref(false)

// 折叠状态
const infoCollapsed = ref(false)
const styleCollapsed = ref(true)
const showRawContent = ref(false)

// 简单编辑器处理
const handleContentChange = () => {
  // 内容变化时自动同步
  nextTick(() => {
    if (formData.value.type === 'text') {
      generateRawContent()
    }
  })
}

// 表单数据
const formData = ref({
  name: '',
  type: 'text',
  description: '',
  content: '',
  rawContent: '',
  status: 'active',
  expireAt: null,
  tags: []
})

// Formily表单相关
const qrForm = ref(createForm())
const qrFormSchema = ref({
  type: 'object',
  properties: {}
})
const selectedFieldKey = ref(null)
const fieldCounter = ref(0)

// 样式数据
const styleData = ref({
  size: 300,
  errorLevel: 'M',
  margin: 4,
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  format: 'png',
  logo: '',
  logoSize: 15
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入二维码名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择二维码类型', trigger: 'change' }
  ]
}

// 其他状态
const formRef = ref()
const previewUrl = ref('')
const fullPreviewVisible = ref(false)
const templateDialogVisible = ref(false)
const templates = ref([])
const historyList = ref([])
const availableTags = ref(['营销', '活动', '产品', '联系', '文档', '其他'])
const uploadAction = '/api/upload'

// Formily相关方法
const addFormilyField = (type) => {
  fieldCounter.value++
  const fieldKey = `field_${fieldCounter.value}`
  
  const fieldConfigs = {
    input: {
      title: '单行文本',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入内容'
      }
    },
    textarea: {
      title: '多行文本',
      'x-component': 'Input.TextArea',
      'x-component-props': {
        placeholder: '请输入内容',
        rows: 4
      }
    },
    select: {
      title: '下拉选择',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择'
      },
      enum: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    },
    radio: {
      title: '单选框',
      'x-component': 'Radio.Group',
      enum: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    },
    checkbox: {
      title: '多选框',
      'x-component': 'Checkbox.Group',
      enum: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    },
    date: {
      title: '日期选择',
      'x-component': 'DatePicker',
      'x-component-props': {
        placeholder: '请选择日期'
      }
    }
  }
  
  qrFormSchema.value.properties[fieldKey] = fieldConfigs[type]
  selectedFieldKey.value = fieldKey
}

const selectField = (key) => {
  selectedFieldKey.value = key
}

const editField = (key) => {
  // 打开字段编辑对话框
  ElMessage.info('字段编辑功能开发中...')
}

const deleteField = (key) => {
  delete qrFormSchema.value.properties[key]
  if (selectedFieldKey.value === key) {
    selectedFieldKey.value = null
  }
}

const getFormilyComponent = (component) => {
  const componentMap = {
    'Input': 'el-input',
    'Input.TextArea': 'el-input',
    'Select': 'el-select',
    'Radio.Group': 'el-radio-group',
    'Checkbox.Group': 'el-checkbox-group',
    'DatePicker': 'el-date-picker'
  }
  return componentMap[component] || 'el-input'
}

const getFormilyProps = (field) => {
  const props = { ...(field['x-component-props'] || {}) }
  
  if (field['x-component'] === 'Input.TextArea') {
    props.type = 'textarea'
  }
  
  return props
}

const previewQRForm = () => {
  // 将表单schema转换为二维码内容
  const formContent = JSON.stringify(qrFormSchema.value, null, 2)
  formData.value.rawContent = formContent
  generatePreview()
}

const generateRawContent = () => {
  const type = formData.value.type
  let rawContent = ''

  if (type === 'text') {
    // 纯文本类型，使用富文本内容
    rawContent = formData.value.content.replace(/<[^>]*>/g, '') // 移除HTML标签
  } else {
    // 其他类型，使用Formily表单schema
    if (Object.keys(qrFormSchema.value.properties).length > 0) {
      rawContent = JSON.stringify({
        type: type,
        formSchema: qrFormSchema.value,
        description: formData.value.description || `${getTypeName(type)}表单`
      }, null, 2)
    } else {
      rawContent = `${getTypeName(type)}类型 - 暂无表单字段`
    }
  }

  formData.value.rawContent = rawContent
}



const syncToRaw = () => {
  if (formData.value.type === 'text') {
    // 移除HTML标签，保留纯文本
    formData.value.rawContent = formData.value.content.replace(/<[^>]*>/g, '')
  } else {
    generateRawContent()
  }
  ElMessage.success('已同步到原始内容')
}

const generatePreview = async () => {
  if (!formData.value.rawContent && !formData.value.content) {
    ElMessage.warning('请先添加内容')
    return
  }

  generating.value = true
  try {
    const content = formData.value.rawContent || formData.value.content.replace(/<[^>]*>/g, '')
    const params = {
      content,
      size: styleData.value.size,
      errorLevel: styleData.value.errorLevel,
      margin: styleData.value.margin,
      foregroundColor: styleData.value.foregroundColor,
      backgroundColor: styleData.value.backgroundColor,
      format: styleData.value.format,
      logo: styleData.value.logo,
      logoSize: styleData.value.logoSize
    }

    const result = await handleApiCall(() => generateQRCode(params))
    if (result.success) {
      previewUrl.value = result.data.url
      addToHistory('生成预览')
    }
  } catch (error) {
    ElMessage.error('生成预览失败')
  } finally {
    generating.value = false
  }
}

const downloadPreview = () => {
  if (!previewUrl.value) {
    ElMessage.warning('请先生成预览')
    return
  }

  const link = document.createElement('a')
  link.href = previewUrl.value
  link.download = `${formData.value.name || 'qrcode'}.${styleData.value.format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.error('请完善表单信息')
    return
  }

  saving.value = true
  try {
    const saveData = {
      ...formData.value,
      qrFormSchema: qrFormSchema.value,
      styleData: styleData.value
    }

    let result
    if (isEdit.value) {
      result = await handleApiCall(() => updateQRCode(route.params.id, saveData))
    } else {
      result = await handleApiCall(() => createQRCode(saveData))
    }

    if (result.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      addToHistory(isEdit.value ? '更新二维码' : '创建二维码')
      
      if (!isEdit.value) {
        router.push(`/admin/qrcode/edit/${result.data.id}`)
      }
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

const handleSaveDraft = async () => {
  const saveData = {
    ...formData.value,
    status: 'draft',
    qrFormSchema: qrFormSchema.value,
    styleData: styleData.value
  }

  try {
    let result
    if (isEdit.value) {
      result = await handleApiCall(() => updateQRCode(route.params.id, saveData))
    } else {
      result = await handleApiCall(() => createQRCode(saveData))
    }

    if (result.success) {
      ElMessage.success('草稿保存成功')
      addToHistory('保存草稿')
    }
  } catch (error) {
    ElMessage.error('保存草稿失败')
  }
}

const handleBack = () => {
  router.push('/admin/qrcode')
}

const handlePreview = () => {
  if (previewUrl.value) {
    fullPreviewVisible.value = true
  } else {
    generatePreview().then(() => {
      if (previewUrl.value) {
        fullPreviewVisible.value = true
      }
    })
  }
}

const handleTemplate = async () => {
  try {
    const result = await handleApiCall(() => getQRCodeTemplates())
    if (result.success) {
      templates.value = result.data || []
      templateDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('加载模板失败')
  }
}

const applyTemplate = (template) => {
  formData.value = { ...formData.value, ...template.data }
  if (template.styleData) {
    styleData.value = { ...styleData.value, ...template.styleData }
  }
  templateDialogVisible.value = false
  ElMessage.success('模板应用成功')
  addToHistory(`应用模板: ${template.name}`)
}

const handleHistory = () => {
  // 显示历史记录
}

const toggleInfoCollapse = () => {
  infoCollapsed.value = !infoCollapsed.value
}

const toggleStyleCollapse = () => {
  styleCollapsed.value = !styleCollapsed.value
}

const insertTemplate = () => {
  handleTemplate()
}

const insertVariable = () => {
  ElMessage.info('变量功能开发中...')
}

const formatContent = () => {
  ElMessage.info('格式化功能开发中...')
}

const handleFullPreview = () => {
  fullPreviewVisible.value = true
}

const addToHistory = (action) => {
  historyList.value.unshift({
    id: Date.now(),
    action,
    createTime: new Date(),
    data: JSON.parse(JSON.stringify(formData.value))
  })
  
  // 只保留最近20条记录
  if (historyList.value.length > 20) {
    historyList.value = historyList.value.slice(0, 20)
  }
}

const restoreFromHistory = (item) => {
  formData.value = { ...item.data }
  ElMessage.success('已恢复到历史版本')
}

const handleLogoSuccess = (response) => {
  if (response.success) {
    styleData.value.logo = response.data.url
    ElMessage.success('Logo上传成功')
  }
}

const beforeLogoUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isValidType) {
    ElMessage.error('只能上传 JPG、PNG、SVG 格式的图片!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 编辑器事件处理（简化版）
const handleEditorBlur = () => {
  // 自动同步内容
  nextTick(() => {
    if (formData.value.type === 'text') {
      syncToRaw()
    }
  })
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

const getStatusName = (status) => {
  const statusMap = {
    'active': '启用',
    'inactive': '禁用',
    'draft': '草稿'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const typeMap = {
    'active': 'success',
    'inactive': 'danger',
    'draft': 'warning'
  }
  return typeMap[status] || ''
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

// 监听器
watch(() => formData.value.type, (newType, oldType) => {
  if (newType !== oldType) {
    // 重置Formily表单schema
    qrFormSchema.value = {
      type: 'object',
      properties: {}
    }
    selectedFieldKey.value = null
    fieldCounter.value = 0
    qrForm.value = createForm()
    generateRawContent()
  }
})

watch(() => formData.value.content, () => {
  if (formData.value.type === 'text') {
    nextTick(() => {
      generateRawContent()
    })
  }
})

// 生命周期
onMounted(async () => {
  if (isEdit.value) {
    try {
      const result = await handleApiCall(() => getQRCodeDetail(route.params.id))
      if (result.success) {
        const data = result.data
        formData.value = { ...formData.value, ...data }
        if (data.qrFormSchema) {
          qrFormSchema.value = data.qrFormSchema
          // 重新创建表单实例
          qrForm.value = createForm()
        }
        if (data.styleData) {
          styleData.value = { ...styleData.value, ...data.styleData }
        }
        if (data.qrcode_url) {
          previewUrl.value = data.qrcode_url
        }
      }
    } catch (error) {
      ElMessage.error('加载数据失败')
    }
  }

  // 添加初始历史记录
  addToHistory('打开编辑器')
})
</script>

<style scoped>
.qrcode-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-info h2 {
  margin: 0 0 2px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.page-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-main {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.edit-panel,
.preview-panel {
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.info-card,
.content-card,
.style-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-actions {
  display: flex;
  gap: 8px;
}

.info-form,
.style-form {
  padding-top: 16px;
}

.content-editor {
  padding: 16px 0;
}

.formily-designer {
  margin-bottom: 24px;
}

.formily-designer h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.formily-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.formily-toolbar {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.formily-preview {
  padding: 16px;
  background: #fff;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-field-wrapper {
  position: relative;
  padding: 12px;
  margin-bottom: 8px;
  border: 2px dashed transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-field-wrapper:hover {
  border-color: #e4e7ed;
  background: #f8f9fa;
}

.form-field-wrapper.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.field-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.form-field-wrapper:hover .field-actions,
.form-field-wrapper.selected .field-actions {
  opacity: 1;
}

.empty-form {
  padding: 40px;
  text-align: center;
}

.rich-editor h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.raw-content {
  margin-top: 24px;
}

.raw-content h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-footer {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.color-text {
  margin-left: 8px;
  font-size: 12px;
  color: #606266;
  font-family: monospace;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.logo-upload {
  width: 80px;
  height: 80px;
  border: 2px dashed #d3d3d3;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.logo-upload:hover {
  border-color: #409eff;
}

.logo-upload img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  text-align: center;
  color: #c0c4cc;
}

.upload-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.upload-placeholder div {
  font-size: 12px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qrcode-preview {
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-image img {
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.loading-placeholder,
.empty-placeholder {
  text-align: center;
  color: #909399;
}

.loading-placeholder .el-icon,
.empty-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.rotating {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-actions {
  margin-top: 16px;
}

.history-card {
  margin-top: 20px;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 8px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #f8f9fa;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-action {
  font-size: 13px;
  color: #606266;
  margin-top: 2px;
}

.empty-history {
  text-align: center;
  color: #c0c4cc;
  padding: 20px;
  font-size: 14px;
}

.full-preview {
  text-align: center;
}

.preview-image {
  margin-bottom: 20px;
}

.preview-image img {
  max-width: 300px;
  max-height: 300px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.template-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.template-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.template-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-preview {
  color: #c0c4cc;
  font-size: 14px;
}

.template-info {
  padding: 12px;
}

.template-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 简单编辑器样式 */
.editor-footer {
  margin-top: 8px;
  text-align: center;
}

/* Element Plus组件样式覆盖 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-descriptions__cell) {
  padding: 8px 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .editor-main .el-col:first-child {
    span: 18;
  }
  
  .editor-main .el-col:last-child {
    span: 6;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .editor-main .el-row {
    flex-direction: column;
  }
  
  .edit-panel,
  .preview-panel {
    height: auto;
  }
}
</style> 