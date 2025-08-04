<template>
  <div class="form-renderer">
    <!-- 步骤式表单 -->
    <div v-if="schema['x-steps']" class="stepped-form">
      <el-steps :active="currentStep" class="form-steps">
        <el-step
          v-for="(step, index) in schema['x-steps']"
          :key="index"
          :title="step.title"
        />
      </el-steps>

      <div class="step-content">
        <h3>{{ schema['x-steps'][currentStep]?.title }}</h3>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          size="default"
        >
          <FormField
            v-for="fieldName in currentStepFields"
            :key="fieldName"
            :name="fieldName"
            :schema="schema.properties[fieldName]"
            :value="formData[fieldName]"
            :mode="mode"
            @update="updateField"
            @click="handleFieldClick"
            @delete="handleFieldDelete"
          />
        </el-form>
      </div>

      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < schema['x-steps'].length - 1" type="primary" @click="nextStep">
          下一步
        </el-button>
        <el-button v-if="currentStep === schema['x-steps'].length - 1" type="success" @click="submitForm">
          提交
        </el-button>
      </div>
    </div>

    <!-- 普通表单 -->
    <div v-else class="normal-form">
      <h3 v-if="schema.title">{{ schema.title }}</h3>
      <p v-if="schema.description" class="form-description">{{ schema.description }}</p>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        size="default"
      >
        <FormField
          v-for="(fieldSchema, fieldName) in schema.properties"
          :key="fieldName"
          :name="fieldName"
          :schema="fieldSchema"
          :value="formData[fieldName]"
          :mode="mode"
          @update="updateField"
          @click="handleFieldClick"
          @delete="handleFieldDelete"
        />
      </el-form>

      <div v-if="mode !== 'design'" class="form-actions">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import FormField from './FormField.vue'

const props = defineProps({
  schema: {
    type: Object,
    required: true
  },
  values: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String,
    default: 'view', // view, design, edit
    validator: (value) => ['view', 'design', 'edit'].includes(value)
  }
})

const emit = defineEmits(['update:values', 'submit', 'field-click', 'field-delete'])

// 表单数据
const formRef = ref()
const formData = ref({})
const currentStep = ref(0)

// 计算属性
const currentStepFields = computed(() => {
  if (!props.schema['x-steps'] || !props.schema['x-steps'][currentStep.value]) {
    return []
  }
  return props.schema['x-steps'][currentStep.value].fields || []
})

const formRules = computed(() => {
  const rules = {}
  Object.entries(props.schema.properties || {}).forEach(([fieldName, fieldSchema]) => {
    if (fieldSchema['x-rules']) {
      rules[fieldName] = fieldSchema['x-rules'].map(rule => {
        // 转换自定义验证器
        if (rule.validator && typeof rule.validator === 'string') {
          try {
            // 简单的函数字符串转换
            rule.validator = new Function('rule', 'value', 'callback', rule.validator.replace('function(rule, value)', 'return'))
          } catch (error) {
            console.warn('Invalid validator:', rule.validator)
          }
        }
        return rule
      })
    }
  })
  return rules
})

// 方法
const updateField = (fieldName, value) => {
  formData.value[fieldName] = value
  emit('update:values', { ...formData.value })
}

const handleFieldClick = (fieldName) => {
  if (props.mode === 'design') {
    emit('field-click', fieldName)
  }
}

const handleFieldDelete = (fieldName) => {
  if (props.mode === 'design') {
    emit('field-delete', fieldName)
  }
}

const nextStep = async () => {
  if (formRef.value) {
    try {
      // 验证当前步骤的字段
      const fieldsToValidate = currentStepFields.value
      if (fieldsToValidate.length > 0) {
        await formRef.value.validateField(fieldsToValidate)
      }
      currentStep.value++
    } catch (error) {
      ElMessage.error('请完成当前步骤的必填项')
    }
  } else {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitForm = async () => {
  if (formRef.value) {
    try {
      await formRef.value.validate()
      emit('submit', formData.value)
      ElMessage.success('提交成功')
    } catch (error) {
      ElMessage.error('请完成所有必填项')
    }
  } else {
    emit('submit', formData.value)
    ElMessage.success('提交成功')
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.value = {}
  currentStep.value = 0
}

// 监听器
watch(() => props.values, (newValues) => {
  formData.value = { ...newValues }
}, { immediate: true, deep: true })

// 生命周期
onMounted(() => {
  // 初始化表单数据
  Object.keys(props.schema.properties || {}).forEach(fieldName => {
    if (formData.value[fieldName] === undefined) {
      const fieldSchema = props.schema.properties[fieldName]
      // 设置默认值
      switch (fieldSchema.type) {
        case 'boolean':
          formData.value[fieldName] = false
          break
        case 'number':
          formData.value[fieldName] = 0
          break
        case 'array':
          formData.value[fieldName] = []
          break
        case 'object':
          formData.value[fieldName] = {}
          break
        default:
          formData.value[fieldName] = ''
      }
    }
  })
})
</script>

<style scoped>
.form-renderer {
  max-width: 800px;
}

.stepped-form .form-steps {
  margin-bottom: 30px;
}

.step-content {
  min-height: 400px;
  margin-bottom: 30px;
}

.step-content h3 {
  margin-bottom: 20px;
  color: #303133;
}

.step-actions {
  text-align: center;
  border-top: 1px solid #e6e6e6;
  padding-top: 20px;
}

.step-actions .el-button {
  margin: 0 10px;
}

.normal-form h3 {
  margin-bottom: 10px;
  color: #303133;
}

.form-description {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
  border-top: 1px solid #e6e6e6;
  padding-top: 20px;
}

.form-actions .el-button {
  margin: 0 10px;
}
</style> 