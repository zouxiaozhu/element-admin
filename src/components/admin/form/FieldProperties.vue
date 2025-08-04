<template>
  <div class="field-properties">
    <div class="property-header">
      <div class="field-info">
        <h4>{{ schema?.title || field }}</h4>
        <el-tag size="small" type="info">{{ schema?.['x-component'] || 'Input' }}</el-tag>
      </div>
      <el-button size="small" type="danger" @click="handleDelete" :icon="Delete">
        删除字段
      </el-button>
    </div>

    <el-scrollbar class="property-content">
      <el-form :model="localSchema" label-width="80px" size="small">
        <!-- 基础属性 -->
        <div class="property-group">
          <h5 class="group-title">基础属性</h5>
          
          <el-form-item label="字段名">
            <el-input :value="field" disabled>
              <template #suffix>
                <el-icon class="input-icon"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="标题">
            <el-input 
              v-model="localSchema.title" 
              @input="updateProperty('title', $event)"
              placeholder="请输入字段标题"
            />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input 
              v-model="localSchema.description" 
              @input="updateProperty('description', $event)"
              type="textarea"
              :rows="2"
              placeholder="请输入字段描述"
            />
          </el-form-item>
          
          <el-form-item label="占位符">
            <el-input 
              v-model="localSchema.placeholder" 
              @input="updateProperty('placeholder', $event)"
              placeholder="请输入占位符文本"
            />
          </el-form-item>
        </div>

        <!-- 组件设置 -->
        <div class="property-group">
          <h5 class="group-title">组件设置</h5>
          
          <el-form-item label="组件类型">
            <el-select 
              v-model="localSchema['x-component']" 
              @change="handleComponentChange"
              style="width: 100%"
            >
              <el-option-group label="基础输入">
                <el-option label="单行输入" value="Input" />
                <el-option label="多行输入" value="Textarea" />
                <el-option label="密码输入" value="Password" />
                <el-option label="数字输入" value="InputNumber" />
                <el-option label="手机号码" value="Phone" />
                <el-option label="邮箱地址" value="Email" />
                <el-option label="网址链接" value="URL" />
              </el-option-group>
              <el-option-group label="选择控件">
                <el-option label="下拉选择" value="Select" />
                <el-option label="单选按钮" value="Radio" />
                <el-option label="多选框" value="Checkbox" />
                <el-option label="开关" value="Switch" />
                <el-option label="级联选择" value="Cascader" />
                <el-option label="树形选择" value="TreeSelect" />
              </el-option-group>
              <el-option-group label="日期时间">
                <el-option label="日期选择" value="DatePicker" />
                <el-option label="时间选择" value="TimePicker" />
                <el-option label="日期时间" value="DateTimePicker" />
                <el-option label="日期范围" value="DateRange" />
                <el-option label="时间范围" value="TimeRange" />
              </el-option-group>
              <el-option-group label="文件上传">
                <el-option label="文件上传" value="Upload" />
                <el-option label="图片上传" value="ImageUpload" />
                <el-option label="头像上传" value="Avatar" />
              </el-option-group>
            </el-select>
          </el-form-item>
          
          <el-form-item label="数据类型">
            <el-select 
              v-model="localSchema.type" 
              @change="updateProperty('type', $event)"
              style="width: 100%"
            >
              <el-option label="字符串" value="string" />
              <el-option label="数字" value="number" />
              <el-option label="布尔值" value="boolean" />
              <el-option label="数组" value="array" />
              <el-option label="对象" value="object" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 验证规则 -->
        <div class="property-group">
          <h5 class="group-title">验证规则</h5>
          
          <el-form-item label="必填">
            <el-switch 
              :model-value="isRequired" 
              @change="updateRequired"
            />
          </el-form-item>
          
          <el-form-item label="禁用">
            <el-switch 
              v-model="localSchema.disabled" 
              @change="updateProperty('disabled', $event)"
            />
          </el-form-item>

          <el-form-item label="只读">
            <el-switch 
              v-model="localSchema.readonly" 
              @change="updateProperty('readonly', $event)"
            />
          </el-form-item>
        </div>

        <!-- 选择类组件的选项设置 -->
        <div v-if="hasOptions" class="property-group">
          <h5 class="group-title">选项设置</h5>
          
          <div class="options-manager">
            <div class="options-header">
              <span>选项列表</span>
              <el-button size="small" type="primary" @click="addOption" :icon="Plus">
                添加选项
              </el-button>
            </div>
            
            <div class="options-list">
              <div 
                v-for="(option, index) in localSchema.enum || []" 
                :key="index" 
                class="option-item"
              >
                <el-input 
                  :model-value="option" 
                  @input="updateOption(index, $event)"
                  size="small"
                  placeholder="选项值"
                />
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="removeOption(index)"
                  :icon="Delete"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 数字输入组件特有属性 -->
        <div v-if="localSchema['x-component'] === 'InputNumber'" class="property-group">
          <h5 class="group-title">数字设置</h5>
          
          <el-form-item label="最小值">
            <el-input-number 
              v-model="componentProps.min" 
              @change="updateComponentProp('min', $event)"
              style="width: 100%"
              :precision="2"
            />
          </el-form-item>
          
          <el-form-item label="最大值">
            <el-input-number 
              v-model="componentProps.max" 
              @change="updateComponentProp('max', $event)"
              style="width: 100%"
              :precision="2"
            />
          </el-form-item>
          
          <el-form-item label="步长">
            <el-input-number 
              v-model="componentProps.step" 
              @change="updateComponentProp('step', $event)"
              :min="0.01"
              :step="0.01"
              style="width: 100%"
              :precision="2"
            />
          </el-form-item>

          <el-form-item label="精度">
            <el-input-number 
              v-model="componentProps.precision" 
              @change="updateComponentProp('precision', $event)"
              :min="0"
              :max="10"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <!-- 输入框特有属性 -->
        <div v-if="isInputComponent" class="property-group">
          <h5 class="group-title">输入设置</h5>
          
          <el-form-item v-if="localSchema['x-component'] === 'Input'" label="输入类型">
            <el-select 
              v-model="componentProps.type" 
              @change="updateComponentProp('type', $event)"
              style="width: 100%"
            >
              <el-option label="文本" value="text" />
              <el-option label="密码" value="password" />
              <el-option label="邮箱" value="email" />
              <el-option label="电话" value="tel" />
              <el-option label="URL" value="url" />
              <el-option label="搜索" value="search" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="最大长度">
            <el-input-number 
              v-model="componentProps.maxlength" 
              @change="updateComponentProp('maxlength', $event)"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item v-if="localSchema['x-component'] === 'Textarea'" label="行数">
            <el-input-number 
              v-model="componentProps.rows" 
              @change="updateComponentProp('rows', $event)"
              :min="2"
              :max="20"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="显示字数">
            <el-switch 
              v-model="componentProps.showWordLimit" 
              @change="updateComponentProp('showWordLimit', $event)"
            />
          </el-form-item>

          <el-form-item label="可清空">
            <el-switch 
              v-model="componentProps.clearable" 
              @change="updateComponentProp('clearable', $event)"
            />
          </el-form-item>
        </div>

        <!-- 日期组件特有属性 -->
        <div v-if="isDateComponent" class="property-group">
          <h5 class="group-title">日期设置</h5>
          
          <el-form-item label="格式">
            <el-select 
              v-model="componentProps.format" 
              @change="updateDateFormat"
              style="width: 100%"
            >
              <el-option v-if="localSchema['x-component'] === 'DatePicker'" label="YYYY-MM-DD" value="YYYY-MM-DD" />
              <el-option v-if="localSchema['x-component'] === 'DatePicker'" label="YYYY/MM/DD" value="YYYY/MM/DD" />
              <el-option v-if="localSchema['x-component'] === 'DateTimePicker'" label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
              <el-option v-if="localSchema['x-component'] === 'DateTimePicker'" label="YYYY/MM/DD HH:mm:ss" value="YYYY/MM/DD HH:mm:ss" />
              <el-option v-if="localSchema['x-component'] === 'TimePicker'" label="HH:mm:ss" value="HH:mm:ss" />
              <el-option v-if="localSchema['x-component'] === 'TimePicker'" label="HH:mm" value="HH:mm" />
            </el-select>
          </el-form-item>

          <el-form-item label="可清空">
            <el-switch 
              v-model="componentProps.clearable" 
              @change="updateComponentProp('clearable', $event)"
            />
          </el-form-item>
        </div>

        <!-- 上传组件特有属性 -->
        <div v-if="isUploadComponent" class="property-group">
          <h5 class="group-title">上传设置</h5>
          
          <el-form-item label="上传地址">
            <el-input 
              v-model="componentProps.action" 
              @input="updateComponentProp('action', $event)"
              placeholder="/api/upload"
            />
          </el-form-item>

          <el-form-item label="最大数量">
            <el-input-number 
              v-model="componentProps.limit" 
              @change="updateComponentProp('limit', $event)"
              :min="1"
              :max="20"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="文件大小">
            <el-input-number 
              v-model="componentProps.fileSize" 
              @change="updateComponentProp('fileSize', $event)"
              :min="1"
              style="width: 100%"
            />
            <template #suffix>MB</template>
          </el-form-item>

          <el-form-item label="允许格式">
            <el-input 
              v-model="componentProps.accept" 
              @input="updateComponentProp('accept', $event)"
              placeholder=".jpg,.png,.pdf"
            />
          </el-form-item>

          <el-form-item label="多选上传">
            <el-switch 
              v-model="componentProps.multiple" 
              @change="updateComponentProp('multiple', $event)"
            />
          </el-form-item>
        </div>

        <!-- 自定义规则 -->
        <div class="property-group">
          <h5 class="group-title">自定义规则</h5>
          
          <div class="rules-manager">
            <div class="rules-header">
              <span>验证规则</span>
              <el-button size="small" type="primary" @click="addRule" :icon="Plus">
                添加规则
              </el-button>
            </div>
            
            <div class="rules-list">
              <div 
                v-for="(rule, index) in customRules" 
                :key="index" 
                class="rule-item"
              >
                <el-select 
                  v-model="rule.type" 
                  @change="updateRule(index, 'type', $event)"
                  size="small"
                  style="width: 80px"
                >
                  <el-option label="长度" value="len" />
                  <el-option label="最小" value="min" />
                  <el-option label="最大" value="max" />
                  <el-option label="正则" value="pattern" />
                </el-select>
                <el-input 
                  v-model="rule.value" 
                  @input="updateRule(index, 'value', $event)"
                  size="small"
                  placeholder="值"
                  style="flex: 1"
                />
                <el-input 
                  v-model="rule.message" 
                  @input="updateRule(index, 'message', $event)"
                  size="small"
                  placeholder="错误提示"
                  style="flex: 1"
                />
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="removeRule(index)"
                  :icon="Delete"
                />
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Lock, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  field: {
    type: String,
    required: true
  },
  schema: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'delete'])

// 本地状态
const localSchema = ref({ ...props.schema })
const componentProps = ref({ ...(props.schema['x-component-props'] || {}) })
const customRules = ref([...(props.schema['x-rules']?.filter(rule => !rule.required) || [])])

// 计算属性
const isRequired = computed(() => {
  return props.schema['x-rules']?.some(rule => rule.required) || false
})

const hasOptions = computed(() => {
  return ['Select', 'Radio', 'Checkbox'].includes(localSchema.value['x-component'])
})

const isInputComponent = computed(() => {
  return ['Input', 'Textarea', 'Password', 'Phone', 'Email', 'URL'].includes(localSchema.value['x-component'])
})

const isDateComponent = computed(() => {
  return ['DatePicker', 'TimePicker', 'DateTimePicker', 'DateRange', 'TimeRange'].includes(localSchema.value['x-component'])
})

const isUploadComponent = computed(() => {
  return ['Upload', 'ImageUpload', 'Avatar'].includes(localSchema.value['x-component'])
})

// 方法
const updateProperty = (property, value) => {
  localSchema.value[property] = value
  emit('update', property, value)
}

const updateComponentProp = (prop, value) => {
  componentProps.value[prop] = value
  localSchema.value['x-component-props'] = { ...componentProps.value }
  emit('update', 'x-component-props', localSchema.value['x-component-props'])
}

const updateRequired = (required) => {
  let rules = [...(localSchema.value['x-rules'] || [])]
  
  if (required) {
    // 添加必填规则
    if (!rules.some(rule => rule.required)) {
      rules.unshift({
        required: true,
        message: `请${getRequiredMessage()}`
      })
    }
  } else {
    // 移除必填规则
    rules = rules.filter(rule => !rule.required)
  }
  
  localSchema.value['x-rules'] = rules
  emit('update', 'x-rules', rules)
}

const getRequiredMessage = () => {
  const component = localSchema.value['x-component']
  const messageMap = {
    'Input': '输入',
    'Textarea': '输入',
    'InputNumber': '输入',
    'Select': '选择',
    'Radio': '选择',
    'Checkbox': '选择',
    'DatePicker': '选择日期',
    'TimePicker': '选择时间',
    'DateTimePicker': '选择日期时间',
    'Upload': '上传文件',
    'ImageUpload': '上传图片'
  }
  return messageMap[component] || '填写'
}

const handleComponentChange = (component) => {
  // 重置组件属性
  const newProps = getDefaultComponentProps(component)
  componentProps.value = newProps
  
  updateProperty('x-component', component)
  updateProperty('x-component-props', newProps)
  
  // 更新数据类型
  const newType = getDefaultDataType(component)
  if (newType !== localSchema.value.type) {
    updateProperty('type', newType)
  }
  
  // 处理选项
  if (hasOptions.value && !localSchema.value.enum) {
    updateProperty('enum', ['选项1', '选项2', '选项3'])
  } else if (!hasOptions.value && localSchema.value.enum) {
    updateProperty('enum', undefined)
  }
}

const getDefaultComponentProps = (component) => {
  const defaultProps = {
    'Input': { clearable: true },
    'Textarea': { rows: 4, showWordLimit: false },
    'InputNumber': { min: 0, max: 100, step: 1, precision: 0 },
    'Select': { clearable: true, filterable: true },
    'DatePicker': { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD', clearable: true },
    'TimePicker': { format: 'HH:mm:ss', valueFormat: 'HH:mm:ss', clearable: true },
    'DateTimePicker': { format: 'YYYY-MM-DD HH:mm:ss', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true },
    'Upload': { action: '/api/upload', limit: 5, fileSize: 10, multiple: false },
    'ImageUpload': { action: '/api/upload', limit: 5, fileSize: 5, accept: '.jpg,.jpeg,.png,.gif', listType: 'picture-card' }
  }
  return defaultProps[component] || {}
}

const getDefaultDataType = (component) => {
  const typeMap = {
    'InputNumber': 'number',
    'Switch': 'boolean',
    'Checkbox': 'array',
    'Upload': 'array',
    'ImageUpload': 'array'
  }
  return typeMap[component] || 'string'
}

const updateDateFormat = (format) => {
  componentProps.value.format = format
  componentProps.value.valueFormat = format
  updateComponentProp('format', format)
  updateComponentProp('valueFormat', format)
}

const addOption = () => {
  const options = [...(localSchema.value.enum || [])]
  options.push(`选项${options.length + 1}`)
  updateProperty('enum', options)
}

const updateOption = (index, value) => {
  const options = [...(localSchema.value.enum || [])]
  options[index] = value
  updateProperty('enum', options)
}

const removeOption = (index) => {
  const options = [...(localSchema.value.enum || [])]
  options.splice(index, 1)
  updateProperty('enum', options)
}

const addRule = () => {
  customRules.value.push({
    type: 'len',
    value: '',
    message: '输入长度不正确'
  })
  updateCustomRules()
}

const updateRule = (index, prop, value) => {
  customRules.value[index][prop] = value
  updateCustomRules()
}

const removeRule = (index) => {
  customRules.value.splice(index, 1)
  updateCustomRules()
}

const updateCustomRules = () => {
  let allRules = [...(localSchema.value['x-rules']?.filter(rule => rule.required) || [])]
  
  customRules.value.forEach(rule => {
    if (rule.value) {
      const ruleObj = { message: rule.message }
      
      switch (rule.type) {
        case 'len':
          ruleObj.len = parseInt(rule.value)
          break
        case 'min':
          ruleObj.min = parseInt(rule.value)
          break
        case 'max':
          ruleObj.max = parseInt(rule.value)
          break
        case 'pattern':
          try {
            ruleObj.pattern = new RegExp(rule.value)
          } catch (e) {
            ElMessage.error('正则表达式格式错误')
            return
          }
          break
      }
      
      allRules.push(ruleObj)
    }
  })
  
  localSchema.value['x-rules'] = allRules
  emit('update', 'x-rules', allRules)
}

const handleDelete = () => {
  emit('delete', props.field)
}

// 监听器
watch(() => props.schema, (newSchema) => {
  localSchema.value = { ...newSchema }
  componentProps.value = { ...(newSchema['x-component-props'] || {}) }
  customRules.value = [...(newSchema['x-rules']?.filter(rule => !rule.required) || [])]
}, { deep: true })
</script>

<style scoped>
.field-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.property-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
}

.field-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.field-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
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

.options-manager,
.rules-manager {
  width: 100%;
}

.options-header,
.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #606266;
}

.options-list,
.rules-list {
  space-y: 8px;
}

.option-item,
.rule-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.option-item .el-input,
.rule-item .el-input {
  flex: 1;
}

.rule-item .el-select {
  flex-shrink: 0;
}

.input-icon {
  color: #c0c4cc;
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

:deep(.el-scrollbar__view) {
  padding-right: 8px;
}

/* 按钮样式 */
:deep(.el-button--small) {
  padding: 4px 8px;
  font-size: 11px;
}

/* 开关样式 */
:deep(.el-switch) {
  line-height: 1;
}

/* 标签样式 */
:deep(.el-tag) {
  height: 20px;
  line-height: 18px;
  font-size: 11px;
}
</style> 