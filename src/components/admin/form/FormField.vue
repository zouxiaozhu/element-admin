<template>
  <div
    class="form-field"
    :class="{ 'design-mode': mode === 'design', 'selected': isSelected }"
    @click="handleClick"
  >
    <el-form-item
      :label="schema.title || name"
      :prop="name"
      :required="isRequired"
    >
      <!-- 设计模式的操作按钮 -->
      <div v-if="mode === 'design'" class="field-actions">
        <el-button size="small" type="primary" @click.stop="handleEdit">编辑</el-button>
        <el-button size="small" type="danger" @click.stop="handleDelete">删除</el-button>
      </div>

      <!-- 根据组件类型渲染不同的表单控件 -->
      <!-- 选择框组件 -->
      <el-select 
        v-if="componentName === 'el-select'"
        v-bind="componentProps" 
        :modelValue="value" 
        @update:modelValue="handleUpdate"
      >
        <el-option
          v-for="option in schema.enum || []"
          :key="option"
          :label="option"
          :value="option"
        />
      </el-select>

      <!-- 单选框组件 -->
      <el-radio-group 
        v-else-if="componentName === 'el-radio-group'"
        v-bind="componentProps" 
        :modelValue="value" 
        @update:modelValue="handleUpdate"
      >
        <el-radio
          v-for="option in schema.enum || []"
          :key="option"
          :label="option"
        >
          {{ option }}
        </el-radio>
      </el-radio-group>

      <!-- 多选框组件 -->
      <el-checkbox-group 
        v-else-if="componentName === 'el-checkbox-group'"
        v-bind="componentProps" 
        :modelValue="value" 
        @update:modelValue="handleUpdate"
      >
        <el-checkbox
          v-for="option in schema.enum || []"
          :key="option"
          :label="option"
        >
          {{ option }}
        </el-checkbox>
      </el-checkbox-group>

      <!-- 其他组件 -->
      <component
        v-else
        :is="componentName"
        v-bind="componentProps"
        :modelValue="value"
        @update:modelValue="handleUpdate"
        v-on="componentEvents"
      />

      <!-- 字段描述 -->
      <div v-if="schema.description" class="field-description">
        {{ schema.description }}
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ImageUploader from './ImageUploader.vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  schema: {
    type: Object,
    required: true
  },
  value: {
    type: [String, Number, Boolean, Array, Object],
    default: undefined
  },
  mode: {
    type: String,
    default: 'view'
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'click', 'delete'])

// 计算属性
const isSelected = computed(() => props.selected)

const isRequired = computed(() => {
  return props.schema['x-rules']?.some(rule => rule.required) || false
})

const componentName = computed(() => {
  const componentMap = {
    'Input': 'el-input',
    'Textarea': 'el-input',
    'InputNumber': 'el-input-number',
    'Select': 'el-select',
    'RadioGroup': 'el-radio-group',
    'CheckboxGroup': 'el-checkbox-group',
    'Switch': 'el-switch',
    'DatePicker': 'el-date-picker',
    'TimePicker': 'el-time-picker',
    'DateTimePicker': 'el-date-picker',
    'TreeSelect': 'el-tree-select',
    'Cascader': 'el-cascader',
    'ImageUploader': 'ImageUploader',
    'Upload': 'el-upload'
  }
  return componentMap[props.schema['x-component']] || 'el-input'
})

const componentProps = computed(() => {
  const baseProps = {}
  const component = props.schema['x-component']

  // 基础属性
  if (props.schema.placeholder) {
    baseProps.placeholder = props.schema.placeholder
  }

  if (props.schema.disabled) {
    baseProps.disabled = props.schema.disabled
  }

  // 根据组件类型设置特定属性
  switch (component) {
    case 'Textarea':
      baseProps.type = 'textarea'
      baseProps.rows = props.schema.rows || 4
      break

    case 'Input':
      if (props.schema['x-type']) {
        baseProps.type = props.schema['x-type']
      }
      if (props.schema.maxlength) {
        baseProps.maxlength = props.schema.maxlength
      }
      break

    case 'InputNumber':
      if (props.schema.minimum !== undefined) {
        baseProps.min = props.schema.minimum
      }
      if (props.schema.maximum !== undefined) {
        baseProps.max = props.schema.maximum
      }
      if (props.schema.step) {
        baseProps.step = props.schema.step
      }
      break

    case 'Select':
      baseProps.clearable = true
      baseProps.filterable = true
      break

    case 'DatePicker':
      baseProps.type = props.schema.format === 'dateTime' ? 'datetime' : 'date'
      baseProps.format = props.schema.format === 'dateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
      baseProps.valueFormat = props.schema.format === 'dateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
      break

    case 'TimePicker':
      baseProps.format = props.schema.format || 'HH:mm:ss'
      baseProps.valueFormat = props.schema.format || 'HH:mm:ss'
      break

    case 'DateTimePicker':
      baseProps.type = 'datetime'
      baseProps.format = 'YYYY-MM-DD HH:mm:ss'
      baseProps.valueFormat = 'YYYY-MM-DD HH:mm:ss'
      break

    case 'TreeSelect':
      baseProps.data = []
      baseProps.clearable = true
      baseProps.filterable = true
      break

    case 'Cascader':
      baseProps.options = []
      baseProps.clearable = true
      baseProps.filterable = true
      if (props.schema['x-multiple']) {
        baseProps.props = { multiple: true }
      }
      break

    case 'Upload':
      baseProps.action = '/api/upload'
      break

    case 'ImageUploader':
      baseProps.maxItems = props.schema.maxItems || 5
      baseProps.minItems = props.schema.minItems || 0
      baseProps.description = props.schema.description || ''
      baseProps.mode = props.mode
      break
      baseProps.multiple = props.schema.maxItems > 1
      break
  }

  return baseProps
})

const componentEvents = computed(() => {
  const events = {}
  
  // 为不同组件添加特定事件
  switch (props.schema['x-component']) {
    case 'Upload':
      events.onSuccess = (response, file) => {
        console.log('Upload success:', response, file)
      }
      events.onError = (error) => {
        console.error('Upload error:', error)
      }
      break
  }

  return events
})

// 方法
const handleUpdate = (newValue) => {
  emit('update', props.name, newValue)
}

const handleClick = () => {
  emit('click', props.name)
}

const handleEdit = () => {
  emit('click', props.name)
}

const handleDelete = () => {
  emit('delete', props.name)
}
</script>

<style scoped>
.form-field {
  position: relative;
  margin-bottom: 20px;
}

.form-field.design-mode {
  border: 1px dashed transparent;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.form-field.design-mode:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.form-field.design-mode.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.field-actions {
  position: absolute;
  top: -5px;
  right: -5px;
  z-index: 10;
}

.field-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.field-description {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 选择框选项样式 */
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
</style>

 