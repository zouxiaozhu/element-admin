<template>
  <div class="form-preview">
    <div class="preview-header">
      <div class="header-left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h3>表单预览</h3>
      </div>
      <div class="header-right">
        <el-button @click="editForm">编辑表单</el-button>
        <el-button @click="exportData" type="primary">导出数据</el-button>
      </div>
    </div>

    <div class="preview-content">
      <el-card v-if="formSchema" class="form-card">
        <FormRenderer
          :schema="formSchema"
          :values="formValues"
          mode="view"
          @submit="handleSubmit"
          @update:values="handleValuesUpdate"
        />
      </el-card>
      
      <div v-else class="loading-state">
        <el-skeleton :rows="8" animated />
      </div>
    </div>

    <!-- 提交结果对话框 -->
    <el-dialog v-model="resultDialogVisible" title="表单提交结果" width="600px">
      <div class="result-content">
        <h4>提交的数据：</h4>
        <pre class="json-preview">{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
      <template #footer>
        <el-button @click="copyResult">复制数据</el-button>
        <el-button type="primary" @click="resultDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import FormRenderer from './FormRenderer.vue'

const route = useRoute()
const router = useRouter()

// 数据状态
const formSchema = ref(null)
const formValues = ref({})
const submittedData = ref({})
const resultDialogVisible = ref(false)

// 示例表单配置
const demoSchema = {
  "type": "object",
  "title": "复杂业务表单-Demo",
  "description": "这是一个演示低代码表单渲染能力的示例表单",
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
      "placeholder": "请输入您的姓名",
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
      "minItems": 1,
      "description": "请上传身份证正面照片"
    },
    "region": {
      "type": "string",
      "title": "所属片区",
      "x-component": "TreeSelect",
      "x-large": true,
      "description": "选择您所在的管理片区"
    },
    "appointment": {
      "type": "object",
      "title": "预约",
      "x-component": "Appointment",
      "properties": {
        "start": {
          "type": "string",
          "title": "开始时间",
          "x-component": "TimePicker",
          "format": "HH:mm"
        },
        "end": {
          "type": "string",
          "title": "结束时间",
          "x-component": "TimePicker",
          "format": "HH:mm"
        }
      },
      "x-rules": [
        {
          "validator": "function(rule, value){ return value.start < value.end || '开始要早于结束'; }"
        }
      ]
    },
    "checkList": {
      "type": "array",
      "title": "巡检检查项",
      "x-component": "CheckList",
      "description": "请完成所有检查项目",
      "items": {
        "type": "object",
        "properties": {
          "desc": {
            "type": "string",
            "title": "描述",
            "x-component": "Textarea"
          },
          "photo": {
            "type": "array",
            "title": "照片",
            "x-component": "ImageUploader",
            "maxItems": 2
          },
          "result": {
            "type": "string",
            "title": "结果",
            "enum": ["合格", "不合格", "有异议"],
            "x-component": "RadioGroup"
          }
        }
      }
    },
    "mainPhoto": {
      "type": "array",
      "title": "现场环境照片(多选)",
      "x-component": "ImageUploader",
      "maxItems": 8,
      "description": "最多上传8张现场照片"
    },
    "itemSinglePhoto": {
      "type": "string",
      "title": "物品外观照(单选)",
      "x-component": "ImageUploader",
      "maxItems": 1
    },
    "itemMultiPhoto": {
      "type": "array",
      "title": "物品细节照(多选)",
      "x-component": "ImageUploader",
      "maxItems": 6
    },
    "storeRecords": {
      "type": "array",
      "title": "出入库明细",
      "x-component": "Table",
      "description": "记录所有出入库操作",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "title": "类型",
            "enum": ["入库", "出库"],
            "x-component": "Select"
          },
          "name": {
            "type": "string",
            "title": "物品名称",
            "x-component": "Input"
          },
          "qty": {
            "type": "number",
            "title": "数量",
            "x-component": "InputNumber"
          },
          "operator": {
            "type": "string",
            "title": "操作人",
            "x-component": "Input"
          },
          "datetime": {
            "type": "string",
            "title": "时间",
            "x-component": "DatePicker",
            "format": "dateTime"
          }
        }
      }
    },
    "testScore": {
      "type": "number",
      "title": "考试得分",
      "minimum": 0,
      "maximum": 100,
      "x-component": "InputNumber",
      "description": "请输入您的考试分数",
      "x-rules": [
        { "type": "number", "max": 100, "min": 0, "message": "0~100分" }
      ]
    },
    "department": {
      "type": "string",
      "title": "部门",
      "x-component": "Select",
      "enum": [
        "工程部", "财务部", "后勤部", "研发组", "市场部"
      ]
    },
    "largeRadio": {
      "type": "string",
      "title": "海量单选项",
      "x-component": "RadioGroup",
      "x-large": true,
      "enum": [
        "选项1", "选项2", "选项3", "选项4","选项5","选项6","选项7","选项8","选项9","选项10",
        "选项11","选项12","选项13","选项14","选项15","选项16","选项17","选项18","选项19","选项20"
      ]
    },
    "multiLevelSelect": {
      "type": "string",
      "title": "三级品类选择",
      "x-component": "Cascader",
      "x-multiple": false,
      "description": "请选择商品的三级分类"
    },
    "idNoOCR": {
      "type": "string",
      "title": "身份证自动识别",
      "x-component": "Input",
      "placeholder": "支持OCR自动识别身份证号",
      "description": "可以通过拍照自动识别身份证号码"
    },
    "nestedFormDemo": {
      "type": "array",
      "title": "嵌套工单记录",
      "x-component": "SubFormArray",
      "description": "可以添加多个工单子项",
      "items": {
        "type": "object",
        "properties": {
          "subName": {
            "type": "string",
            "title": "工单子项名称",
            "x-component": "Input"
          },
          "subDesc": {
            "type": "string",
            "title": "描述",
            "x-component": "Textarea"
          },
          "subScore": {
            "type": "number",
            "title": "得分",
            "x-component": "InputNumber"
          },
          "subPhoto": {
            "type": "array",
            "title": "附图",
            "x-component": "ImageUploader",
            "maxItems": 2
          }
        }
      }
    },
    "remark": {
      "type": "string",
      "title": "备注",
      "x-component": "Textarea",
      "placeholder": "请输入备注信息",
      "description": "当部门为后勤部或考试得分低于60分时显示",
      "x-visible": "{{ $form.values.department === '后勤部' || $form.values.testScore < 60 }}"
    }
  }
}

// 方法
const loadFormData = () => {
  const formId = route.params.id
  
  if (formId === 'temp') {
    // 从sessionStorage加载临时表单
    const tempForm = sessionStorage.getItem('preview-form')
    if (tempForm) {
      try {
        formSchema.value = JSON.parse(tempForm)
      } catch (error) {
        console.error('解析临时表单失败:', error)
        formSchema.value = demoSchema
      }
    } else {
      formSchema.value = demoSchema
    }
  } else if (formId === '1' || !formId) {
    // 加载示例表单
    formSchema.value = demoSchema
  } else {
    // 这里应该从API加载表单数据
    // 暂时使用示例数据
    formSchema.value = demoSchema
  }
}

const editForm = () => {
  const formId = route.params.id
  if (formId === 'temp') {
    router.push('/admin/form/builder?demo=1')
  } else {
    router.push(`/admin/form/builder/${formId}`)
  }
}

const handleSubmit = (data) => {
  submittedData.value = data
  resultDialogVisible.value = true
}

const handleValuesUpdate = (values) => {
  formValues.value = values
}

const exportData = () => {
  const dataToExport = {
    schema: formSchema.value,
    values: formValues.value,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `form-data-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('数据导出成功')
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(submittedData.value, null, 2))
    ElMessage.success('数据已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 生命周期
onMounted(() => {
  loadFormData()
})
</script>

<style scoped>
.form-preview {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
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

.preview-content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}

.form-card {
  max-width: 900px;
  margin: 0 auto;
}

.loading-state {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 6px;
}

.result-content h4 {
  margin-top: 0;
  color: #303133;
}

.json-preview {
  background: #f5f7fa;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #303133;
}
</style> 