<template>
  <div class="form-properties">
    <div class="property-header">
      <h4>表单设置</h4>
      <p>配置表单的基本信息和样式</p>
    </div>

    <el-scrollbar class="property-content">
      <el-form :model="localConfig" label-width="80px" size="small">
        <!-- 基本信息 -->
        <div class="property-group">
          <h5 class="group-title">基本信息</h5>
          
          <el-form-item label="表单标题">
            <el-input 
              v-model="localConfig.title" 
              @input="updateConfig('title', $event)"
              placeholder="请输入表单标题"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="表单描述">
            <el-input 
              v-model="localConfig.description" 
              @input="updateConfig('description', $event)"
              type="textarea"
              :rows="3"
              placeholder="请输入表单描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="表单分类">
            <el-select 
              v-model="localConfig.category" 
              @change="updateConfig('category', $event)"
              placeholder="请选择分类"
              style="width: 100%"
            >
              <el-option label="用户注册" value="registration" />
              <el-option label="信息收集" value="collection" />
              <el-option label="调查问卷" value="survey" />
              <el-option label="申请表单" value="application" />
              <el-option label="反馈意见" value="feedback" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="表单状态">
            <el-radio-group 
              v-model="localConfig.status" 
              @change="updateConfig('status', $event)"
            >
              <el-radio label="draft">草稿</el-radio>
              <el-radio label="published">已发布</el-radio>
              <el-radio label="archived">已归档</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 布局设置 -->
        <div class="property-group">
          <h5 class="group-title">布局设置</h5>
          
          <el-form-item label="表单布局">
            <el-radio-group 
              v-model="localConfig.layout" 
              @change="updateConfig('layout', $event)"
            >
              <el-radio-button label="vertical">垂直</el-radio-button>
              <el-radio-button label="horizontal">水平</el-radio-button>
              <el-radio-button label="inline">内联</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="标签位置" v-if="localConfig.layout !== 'inline'">
            <el-radio-group 
              v-model="localConfig.labelPosition" 
              @change="updateConfig('labelPosition', $event)"
            >
              <el-radio-button label="left">左对齐</el-radio-button>
              <el-radio-button label="right">右对齐</el-radio-button>
              <el-radio-button label="top">顶部</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="标签宽度" v-if="localConfig.layout === 'horizontal'">
            <el-input-number 
              v-model="labelWidthNumber" 
              @change="updateLabelWidth"
              :min="60"
              :max="200"
              :step="10"
              style="width: 100%"
            />
            <template #suffix>px</template>
          </el-form-item>
          
          <el-form-item label="组件尺寸">
            <el-radio-group 
              v-model="localConfig.size" 
              @change="updateConfig('size', $event)"
            >
              <el-radio-button label="large">大</el-radio-button>
              <el-radio-button label="default">中</el-radio-button>
              <el-radio-button label="small">小</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 样式设置 -->
        <div class="property-group">
          <h5 class="group-title">样式设置</h5>
          
          <el-form-item label="主题色彩">
            <div class="color-picker-group">
              <el-color-picker 
                v-model="localConfig.primaryColor" 
                @change="updateConfig('primaryColor', $event)"
                show-alpha
              />
              <span class="color-label">{{ localConfig.primaryColor || '#409EFF' }}</span>
            </div>
          </el-form-item>
          
          <el-form-item label="边框样式">
            <el-radio-group 
              v-model="localConfig.borderStyle" 
              @change="updateConfig('borderStyle', $event)"
            >
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="rounded">圆角</el-radio-button>
              <el-radio-button label="square">直角</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="表单宽度">
            <el-slider 
              v-model="formWidthPercent" 
              @change="updateFormWidth"
              :min="50"
              :max="100"
              :step="5"
              show-input
            />
            <span class="width-label">{{ formWidthPercent }}%</span>
          </el-form-item>
          
          <el-form-item label="字段间距">
            <el-input-number 
              v-model="localConfig.fieldSpacing" 
              @change="updateConfig('fieldSpacing', $event)"
              :min="8"
              :max="40"
              :step="4"
              style="width: 100%"
            />
            <template #suffix>px</template>
          </el-form-item>
        </div>

        <!-- 功能设置 -->
        <div class="property-group">
          <h5 class="group-title">功能设置</h5>
          
          <el-form-item label="显示必填标记">
            <el-switch 
              v-model="localConfig.showRequiredMark" 
              @change="updateConfig('showRequiredMark', $event)"
            />
          </el-form-item>
          
          <el-form-item label="显示字段序号">
            <el-switch 
              v-model="localConfig.showFieldNumber" 
              @change="updateConfig('showFieldNumber', $event)"
            />
          </el-form-item>
          
          <el-form-item label="启用字段搜索">
            <el-switch 
              v-model="localConfig.enableFieldSearch" 
              @change="updateConfig('enableFieldSearch', $event)"
            />
          </el-form-item>
          
          <el-form-item label="自动保存草稿">
            <el-switch 
              v-model="localConfig.autoSaveDraft" 
              @change="updateConfig('autoSaveDraft', $event)"
            />
          </el-form-item>
          
          <el-form-item label="提交后重置">
            <el-switch 
              v-model="localConfig.resetAfterSubmit" 
              @change="updateConfig('resetAfterSubmit', $event)"
            />
          </el-form-item>
        </div>

        <!-- 提交设置 -->
        <div class="property-group">
          <h5 class="group-title">提交设置</h5>
          
          <el-form-item label="提交地址">
            <el-input 
              v-model="localConfig.submitUrl" 
              @input="updateConfig('submitUrl', $event)"
              placeholder="/api/form/submit"
            />
          </el-form-item>
          
          <el-form-item label="提交方式">
            <el-radio-group 
              v-model="localConfig.submitMethod" 
              @change="updateConfig('submitMethod', $event)"
            >
              <el-radio label="POST">POST</el-radio>
              <el-radio label="PUT">PUT</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="成功提示">
            <el-input 
              v-model="localConfig.successMessage" 
              @input="updateConfig('successMessage', $event)"
              placeholder="提交成功！"
            />
          </el-form-item>
          
          <el-form-item label="跳转地址">
            <el-input 
              v-model="localConfig.redirectUrl" 
              @input="updateConfig('redirectUrl', $event)"
              placeholder="提交成功后跳转的地址"
            />
          </el-form-item>
        </div>

        <!-- 权限设置 -->
        <div class="property-group">
          <h5 class="group-title">权限设置</h5>
          
          <el-form-item label="访问权限">
            <el-radio-group 
              v-model="localConfig.accessLevel" 
              @change="updateConfig('accessLevel', $event)"
            >
              <el-radio label="public">公开</el-radio>
              <el-radio label="login">需要登录</el-radio>
              <el-radio label="admin">仅管理员</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="填写次数限制">
            <el-radio-group 
              v-model="localConfig.submitLimit" 
              @change="updateConfig('submitLimit', $event)"
            >
              <el-radio label="unlimited">不限制</el-radio>
              <el-radio label="once">每人一次</el-radio>
              <el-radio label="daily">每天一次</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="开始时间">
            <el-date-picker 
              v-model="localConfig.startTime" 
              @change="updateConfig('startTime', $event)"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="结束时间">
            <el-date-picker 
              v-model="localConfig.endTime" 
              @change="updateConfig('endTime', $event)"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// 本地状态
const localConfig = ref({
  // 基本信息
  title: '',
  description: '',
  category: 'other',
  status: 'draft',
  
  // 布局设置
  layout: 'vertical',
  labelPosition: 'right',
  labelWidth: '100px',
  size: 'default',
  
  // 样式设置
  primaryColor: '#409EFF',
  borderStyle: 'default',
  formWidth: '100%',
  fieldSpacing: 16,
  
  // 功能设置
  showRequiredMark: true,
  showFieldNumber: false,
  enableFieldSearch: false,
  autoSaveDraft: false,
  resetAfterSubmit: false,
  
  // 提交设置
  submitUrl: '/api/form/submit',
  submitMethod: 'POST',
  successMessage: '提交成功！',
  redirectUrl: '',
  
  // 权限设置
  accessLevel: 'public',
  submitLimit: 'unlimited',
  startTime: null,
  endTime: null,
  
  ...props.config
})

// 计算属性
const labelWidthNumber = computed({
  get() {
    return parseInt(localConfig.value.labelWidth?.replace('px', '') || '100')
  },
  set(value) {
    // 通过updateLabelWidth方法更新
  }
})

const formWidthPercent = computed({
  get() {
    return parseInt(localConfig.value.formWidth?.replace('%', '') || '100')
  },
  set(value) {
    // 通过updateFormWidth方法更新
  }
})

// 方法
const updateConfig = (property, value) => {
  localConfig.value[property] = value
  emit('update', property, value)
}

const updateLabelWidth = (value) => {
  const width = `${value}px`
  localConfig.value.labelWidth = width
  emit('update', 'labelWidth', width)
}

const updateFormWidth = (value) => {
  const width = `${value}%`
  localConfig.value.formWidth = width
  emit('update', 'formWidth', width)
}

// 监听器
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...localConfig.value, ...newConfig }
}, { deep: true })
</script>

<style scoped>
.form-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.property-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
}

.property-header h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.property-header p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.property-content {
  flex: 1;
  padding: 16px;
}

.property-group {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.property-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.group-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-label {
  font-size: 12px;
  color: #606266;
  font-family: monospace;
}

.width-label {
  margin-left: 8px;
  font-size: 12px;
  color: #606266;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  line-height: 1.4;
}

:deep(.el-form-item__content) {
  line-height: 1.4;
}

:deep(.el-input--small) {
  font-size: 12px;
}

:deep(.el-select__wrapper) {
  font-size: 12px;
}

:deep(.el-textarea__inner) {
  font-size: 12px;
}

:deep(.el-radio-button__inner) {
  font-size: 11px;
  padding: 6px 12px;
}

:deep(.el-radio__label) {
  font-size: 12px;
}

:deep(.el-slider) {
  margin: 8px 0;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-scrollbar__view) {
  padding-right: 8px;
}

/* 开关样式 */
:deep(.el-switch) {
  line-height: 1;
}

/* 颜色选择器样式 */
:deep(.el-color-picker) {
  vertical-align: middle;
}

/* 滑块样式 */
:deep(.el-slider__input) {
  width: 60px !important;
}
</style> 