<template>
  <div class="event-form">
    <h4>日程事件设置</h4>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px" size="small">
      <el-form-item label="事件标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入事件标题"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="事件描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="事件描述"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-form-item label="事件地点">
        <el-input
          v-model="formData.location"
          placeholder="事件地点"
          @input="handleUpdate"
        />
      </el-form-item>
      
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleUpdate"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="全天事件">
        <el-switch
          v-model="formData.allDay"
          active-text="是"
          inactive-text="否"
          @change="handleAllDayChange"
        />
      </el-form-item>
      
      <el-form-item label="提醒设置">
        <el-select v-model="formData.reminder" placeholder="选择提醒时间" style="width: 100%" @change="handleUpdate">
          <el-option label="无提醒" value="" />
          <el-option label="事件开始时" value="0" />
          <el-option label="5分钟前" value="5" />
          <el-option label="15分钟前" value="15" />
          <el-option label="30分钟前" value="30" />
          <el-option label="1小时前" value="60" />
          <el-option label="1天前" value="1440" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="重复设置">
        <el-select v-model="formData.recurrence" placeholder="选择重复周期" style="width: 100%" @change="handleUpdate">
          <el-option label="不重复" value="" />
          <el-option label="每天" value="DAILY" />
          <el-option label="每周" value="WEEKLY" />
          <el-option label="每月" value="MONTHLY" />
          <el-option label="每年" value="YEARLY" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <div class="event-preview">
      <h5>事件预览</h5>
      <div class="event-card">
        <div class="event-title">{{ formData.title || '事件标题' }}</div>
        <div class="event-time">
          <span v-if="formData.allDay">全天</span>
          <span v-else>
            {{ formatDateTime(formData.startTime) }} - {{ formatDateTime(formData.endTime) }}
          </span>
        </div>
        <div v-if="formData.location" class="event-location">📍 {{ formData.location }}</div>
        <div v-if="formData.description" class="event-desc">{{ formData.description }}</div>
        <div v-if="formData.reminder" class="event-reminder">
          ⏰ 提前 {{ getReminderText(formData.reminder) }} 提醒
        </div>
        <div v-if="formData.recurrence" class="event-recurrence">
          🔄 {{ getRecurrenceText(formData.recurrence) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

const formRef = ref()
const formData = ref({
  title: '',
  description: '',
  location: '',
  startTime: '',
  endTime: '',
  allDay: false,
  reminder: '',
  recurrence: '',
  ...props.modelValue
})

const rules = {
  title: [
    { required: true, message: '请输入事件标题', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

const handleUpdate = () => {
  emit('update:modelValue', formData.value)
  emit('update', formData.value)
}

const handleAllDayChange = (allDay) => {
  if (allDay) {
    // 清空时间部分，只保留日期
    if (formData.value.startTime) {
      formData.value.startTime = formData.value.startTime.split(' ')[0] + ' 00:00:00'
    }
    if (formData.value.endTime) {
      formData.value.endTime = formData.value.endTime.split(' ')[0] + ' 23:59:59'
    }
  }
  handleUpdate()
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getReminderText = (minutes) => {
  if (!minutes || minutes === '0') return '事件开始时'
  const num = parseInt(minutes)
  if (num < 60) return `${num}分钟`
  if (num < 1440) return `${Math.floor(num / 60)}小时`
  return `${Math.floor(num / 1440)}天`
}

const getRecurrenceText = (recurrence) => {
  const textMap = {
    'DAILY': '每天重复',
    'WEEKLY': '每周重复',
    'MONTHLY': '每月重复',
    'YEARLY': '每年重复'
  }
  return textMap[recurrence] || recurrence
}

watch(() => props.modelValue, (newValue) => {
  formData.value = { ...formData.value, ...newValue }
}, { deep: true })
</script>

<style scoped>
.event-form h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.event-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.event-preview h5 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 13px;
}

.event-card {
  padding: 16px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.event-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.event-time {
  color: #606266;
  margin-bottom: 6px;
  font-size: 14px;
}

.event-location,
.event-desc,
.event-reminder,
.event-recurrence {
  color: #909399;
  font-size: 13px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.event-desc {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}
</style> 