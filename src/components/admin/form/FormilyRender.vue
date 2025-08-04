<template>
  <div class="formily-render">
    <div v-if="schema.properties && Object.keys(schema.properties).length > 0" class="form-fields">
      <div
        v-for="(fieldSchema, fieldName) in schema.properties"
        :key="fieldName"
        class="design-field"
        :class="{ selected: selectedField === fieldName }"
        @click="handleFieldClick(fieldName)"
      >
        <!-- 设计模式下的操作按钮 -->
        <div class="field-actions">
          <el-button size="small" type="primary" @click.stop="handleFieldClick(fieldName)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click.stop="handleFieldDelete(fieldName)">
            删除
          </el-button>
        </div>

        <!-- 渲染表单项 -->
        <el-form-item 
          :label="fieldSchema.title || fieldName"
          :required="isFieldRequired(fieldSchema)"
        >
          <component
            :is="getComponentName(fieldSchema['x-component'])"
            v-bind="getComponentProps(fieldSchema)"
            :model-value="form.values[fieldName]"
            @update:model-value="updateFieldValue(fieldName, $event)"
          >
            <!-- 选择类组件的选项 -->
            <template v-if="hasOptions(fieldSchema)">
              <el-option
                v-for="option in fieldSchema.enum || []"
                :key="option"
                :label="option"
                :value="option"
              />
            </template>
            <template v-if="fieldSchema['x-component'] === 'Radio'">
              <el-radio
                v-for="option in fieldSchema.enum || []"
                :key="option"
                :label="option"
              >
                {{ option }}
              </el-radio>
            </template>
            <template v-if="fieldSchema['x-component'] === 'Checkbox'">
              <el-checkbox
                v-for="option in fieldSchema.enum || []"
                :key="option"
                :label="option"
              >
                {{ option }}
              </el-checkbox>
            </template>
          </component>
          
          <!-- 字段描述 -->
          <div v-if="fieldSchema.description" class="field-description">
            {{ fieldSchema.description }}
          </div>
        </el-form-item>
      </div>
    </div>
    
    <div v-else class="empty-form">
      <p>暂无表单字段</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  schema: {
    type: Object,
    required: true
  },
  selectedField: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['field-click', 'field-delete', 'field-move'])

// 组件名称映射
const getComponentName = (componentType) => {
  const componentMap = {
    'Input': 'el-input',
    'Textarea': 'el-input',
    'InputNumber': 'el-input-number',
    'Select': 'el-select',
    'Radio': 'el-radio-group',
    'Checkbox': 'el-checkbox-group',
    'Switch': 'el-switch',
    'DatePicker': 'el-date-picker',
    'TimePicker': 'el-time-picker',
    'DateTimePicker': 'el-date-picker',
    'Cascader': 'el-cascader',
    'TreeSelect': 'el-tree-select',
    'Upload': 'el-upload',
    'ImageUpload': 'el-upload'
  }
  return componentMap[componentType] || 'el-input'
}

// 获取组件属性
const getComponentProps = (fieldSchema) => {
  const props = { ...fieldSchema['x-component-props'] || {} }
  const component = fieldSchema['x-component']

  // 基础属性
  if (fieldSchema.placeholder) {
    props.placeholder = fieldSchema.placeholder
  }

  // 根据组件类型设置特定属性
  switch (component) {
    case 'Textarea':
      props.type = 'textarea'
      props.rows = fieldSchema.rows || 4
      break
    case 'DateTimePicker':
      props.type = 'datetime'
      break
    case 'Select':
      props.clearable = true
      props.filterable = true
      break
    case 'Upload':
    case 'ImageUpload':
      props.action = '/api/upload'
      props.listType = component === 'ImageUpload' ? 'picture-card' : 'text'
      break
  }

  return props
}

// 判断是否有选项
const hasOptions = (fieldSchema) => {
  return ['Select'].includes(fieldSchema['x-component']) && fieldSchema.enum
}

// 判断是否必填
const isFieldRequired = (fieldSchema) => {
  return fieldSchema['x-rules']?.some(rule => rule.required) || false
}

// 更新字段值
const updateFieldValue = (fieldName, value) => {
  if (props.form && props.form.setFieldValue) {
    props.form.setFieldValue(fieldName, value)
  }
}

// 处理字段点击
const handleFieldClick = (fieldName) => {
  emit('field-click', fieldName)
}

// 处理字段删除
const handleFieldDelete = (fieldName) => {
  emit('field-delete', fieldName)
}
</script>



<style scoped>
.formily-render {
  width: 100%;
  min-height: 400px;
}

.form-fields {
  padding: 8px;
}

.design-field {
  position: relative;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px dashed transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.design-field:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.design-field.selected {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.design-field:hover .field-actions {
  opacity: 1;
}

.design-field.selected .field-actions {
  opacity: 1;
}

.field-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.field-actions .el-button {
  padding: 4px 8px;
  font-size: 11px;
  margin-left: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-description {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.empty-form {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

:deep(.el-form-item__content) {
  position: relative;
}

/* 输入框样式 */
:deep(.el-input) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-tree-select) {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
}

/* 单选框组样式 */
:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.el-radio) {
  margin-right: 0;
  white-space: nowrap;
}

:deep(.el-radio__label) {
  font-size: 14px;
}

/* 多选框组样式 */
:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.el-checkbox) {
  margin-right: 0;
  white-space: nowrap;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
}

/* 上传组件样式 */
:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  background: #fafcff;
  transition: all 0.2s ease;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

/* 开关样式 */
:deep(.el-switch) {
  line-height: 32px;
}

/* 数字输入框样式 */
:deep(.el-input-number) {
  width: 100%;
}

/* 文本域样式 */
:deep(.el-textarea__inner) {
  border-radius: 6px;
}
</style> 