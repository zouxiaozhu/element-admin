<template>
  <div class="field-property-editor">
    <h5>{{ field }} 属性</h5>
    
    <el-form :model="localSchema" label-width="80px" size="small">
      <!-- 基础属性 -->
      <el-form-item label="字段名">
        <el-input :value="field" disabled />
      </el-form-item>
      
      <el-form-item label="标题">
        <el-input 
          :modelValue="localSchema.title" 
          @update:modelValue="updateProperty('title', $event)"
          placeholder="请输入字段标题"
        />
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input 
          :modelValue="localSchema.description" 
          @update:modelValue="updateProperty('description', $event)"
          type="textarea"
          :rows="2"
          placeholder="请输入字段描述"
        />
      </el-form-item>
      
      <el-form-item label="占位符">
        <el-input 
          :modelValue="localSchema.placeholder" 
          @update:modelValue="updateProperty('placeholder', $event)"
          placeholder="请输入占位符"
        />
      </el-form-item>
      
      <el-form-item label="组件类型">
        <el-select 
          :modelValue="localSchema['x-component']" 
          @update:modelValue="updateProperty('x-component', $event)"
          style="width: 100%"
        >
          <el-option label="输入框" value="Input" />
          <el-option label="文本域" value="Textarea" />
          <el-option label="数字输入" value="InputNumber" />
          <el-option label="下拉选择" value="Select" />
          <el-option label="单选框" value="RadioGroup" />
          <el-option label="多选框" value="CheckboxGroup" />
          <el-option label="开关" value="Switch" />
          <el-option label="日期选择" value="DatePicker" />
          <el-option label="时间选择" value="TimePicker" />
          <el-option label="日期时间" value="DateTimePicker" />
          <el-option label="树形选择" value="TreeSelect" />
          <el-option label="级联选择" value="Cascader" />
          <el-option label="图片上传" value="ImageUploader" />
          <el-option label="文件上传" value="Upload" />
        </el-select>
      </el-form-item>
      
      <!-- 数据类型 -->
      <el-form-item label="数据类型">
        <el-select 
          :modelValue="localSchema.type" 
          @update:modelValue="updateProperty('type', $event)"
          style="width: 100%"
        >
          <el-option label="字符串" value="string" />
          <el-option label="数字" value="number" />
          <el-option label="布尔值" value="boolean" />
          <el-option label="数组" value="array" />
          <el-option label="对象" value="object" />
        </el-select>
      </el-form-item>
      
      <!-- 必填设置 -->
      <el-form-item label="必填">
        <el-switch 
          :modelValue="isRequired" 
          @update:modelValue="updateRequired"
        />
      </el-form-item>
      
      <!-- 禁用设置 -->
      <el-form-item label="禁用">
        <el-switch 
          :modelValue="localSchema.disabled" 
          @update:modelValue="updateProperty('disabled', $event)"
        />
      </el-form-item>
      
      <!-- 选择框选项设置 -->
      <template v-if="hasOptions">
        <el-form-item label="选项">
          <div class="options-editor">
            <div 
              v-for="(option, index) in localSchema.enum || []" 
              :key="index" 
              class="option-item"
            >
              <el-input 
                :modelValue="option" 
                @update:modelValue="updateOption(index, $event)"
                size="small"
              />
              <el-button 
                size="small" 
                type="danger" 
                @click="removeOption(index)"
              >
                删除
              </el-button>
            </div>
            <el-button size="small" @click="addOption">添加选项</el-button>
          </div>
        </el-form-item>
      </template>
      
      <!-- 数字输入特定属性 -->
      <template v-if="localSchema['x-component'] === 'InputNumber'">
        <el-form-item label="最小值">
          <el-input-number 
            :modelValue="localSchema.minimum" 
            @update:modelValue="updateProperty('minimum', $event)"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="最大值">
          <el-input-number 
            :modelValue="localSchema.maximum" 
            @update:modelValue="updateProperty('maximum', $event)"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="步长">
          <el-input-number 
            :modelValue="localSchema.step" 
            @update:modelValue="updateProperty('step', $event)"
            :min="0.01"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
      </template>
      
      <!-- 输入框特定属性 -->
      <template v-if="localSchema['x-component'] === 'Input'">
        <el-form-item label="输入类型">
          <el-select 
            :modelValue="localSchema['x-type']" 
            @update:modelValue="updateProperty('x-type', $event)"
            style="width: 100%"
          >
            <el-option label="文本" value="text" />
            <el-option label="密码" value="password" />
            <el-option label="邮箱" value="email" />
            <el-option label="电话" value="tel" />
            <el-option label="URL" value="url" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="最大长度">
          <el-input-number 
            :modelValue="localSchema.maxlength" 
            @update:modelValue="updateProperty('maxlength', $event)"
            :min="1"
            style="width: 100%"
          />
        </el-form-item>
      </template>
      
      <!-- 文本域特定属性 -->
      <template v-if="localSchema['x-component'] === 'Textarea'">
        <el-form-item label="行数">
          <el-input-number 
            :modelValue="localSchema.rows" 
            @update:modelValue="updateProperty('rows', $event)"
            :min="2"
            :max="10"
            style="width: 100%"
          />
        </el-form-item>
      </template>
      
      <!-- 上传组件特定属性 -->
      <template v-if="isUploadComponent">
        <el-form-item label="最大数量">
          <el-input-number 
            :modelValue="localSchema.maxItems" 
            @update:modelValue="updateProperty('maxItems', $event)"
            :min="1"
            :max="20"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="最小数量">
          <el-input-number 
            :modelValue="localSchema.minItems" 
            @update:modelValue="updateProperty('minItems', $event)"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </template>
      
      <!-- 日期组件特定属性 -->
      <template v-if="isDateComponent">
        <el-form-item label="格式">
          <el-select 
            :modelValue="localSchema.format" 
            @update:modelValue="updateProperty('format', $event)"
            style="width: 100%"
          >
            <el-option label="日期" value="date" />
            <el-option label="日期时间" value="dateTime" />
            <el-option label="时间" value="time" />
            <el-option label="年月" value="year-month" />
            <el-option label="年" value="year" />
          </el-select>
        </el-form-item>
      </template>
      
      <!-- 验证规则 -->
      <el-form-item label="验证规则">
        <div class="rules-editor">
          <div 
            v-for="(rule, index) in localRules" 
            :key="index" 
            class="rule-item"
          >
            <el-input 
              :modelValue="rule.message" 
              @update:modelValue="updateRuleMessage(index, $event)"
              placeholder="错误提示"
              size="small"
            />
            <el-button 
              size="small" 
              type="danger" 
              @click="removeRule(index)"
            >
              删除
            </el-button>
          </div>
          <el-button size="small" @click="addRule">添加规则</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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

const emit = defineEmits(['update'])

// 本地状态
const localSchema = ref({ ...props.schema })
const localRules = ref([...(props.schema['x-rules'] || [])])

// 计算属性
const isRequired = computed(() => {
  return localRules.value.some(rule => rule.required)
})

const hasOptions = computed(() => {
  return ['Select', 'RadioGroup', 'CheckboxGroup'].includes(localSchema.value['x-component'])
})

const isUploadComponent = computed(() => {
  return ['ImageUploader', 'Upload'].includes(localSchema.value['x-component'])
})

const isDateComponent = computed(() => {
  return ['DatePicker', 'TimePicker', 'DateTimePicker'].includes(localSchema.value['x-component'])
})

// 方法
const updateProperty = (property, value) => {
  localSchema.value[property] = value
  emit('update', property, value)
}

const updateRequired = (required) => {
  if (required) {
    // 添加必填规则
    if (!localRules.value.some(rule => rule.required)) {
      localRules.value.push({
        required: true,
        message: '此字段为必填项'
      })
    }
  } else {
    // 移除必填规则
    localRules.value = localRules.value.filter(rule => !rule.required)
  }
  updateProperty('x-rules', localRules.value)
}

const updateOption = (index, value) => {
  const options = [...(localSchema.value.enum || [])]
  options[index] = value
  updateProperty('enum', options)
}

const addOption = () => {
  const options = [...(localSchema.value.enum || [])]
  options.push(`选项${options.length + 1}`)
  updateProperty('enum', options)
}

const removeOption = (index) => {
  const options = [...(localSchema.value.enum || [])]
  options.splice(index, 1)
  updateProperty('enum', options)
}

const updateRuleMessage = (index, message) => {
  const rules = [...localRules.value]
  rules[index].message = message
  localRules.value = rules
  updateProperty('x-rules', rules)
}

const addRule = () => {
  localRules.value.push({
    message: '请输入正确的值'
  })
  updateProperty('x-rules', localRules.value)
}

const removeRule = (index) => {
  localRules.value.splice(index, 1)
  updateProperty('x-rules', localRules.value)
}

// 监听器
watch(() => props.schema, (newSchema) => {
  localSchema.value = { ...newSchema }
  localRules.value = [...(newSchema['x-rules'] || [])]
}, { deep: true })
</script>

<style scoped>
.field-property-editor h5 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.options-editor,
.rules-editor {
  width: 100%;
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

.option-item .el-button,
.rule-item .el-button {
  flex-shrink: 0;
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-form-item__label) {
  font-size: 12px;
  line-height: 1.5;
}
</style> 