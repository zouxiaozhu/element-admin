<template>
  <div class="image-uploader">
    <el-upload
      v-if="mode !== 'view'"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :limit="maxItems"
      :multiple="maxItems > 1"
      list-type="picture-card"
      action="#"
      :http-request="customUpload"
      accept="image/*"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="el-upload__tip">
          {{ description || `最多上传${maxItems}张图片` }}
        </div>
      </template>
    </el-upload>
    
    <!-- 预览模式 -->
    <div v-else class="image-preview">
      <div v-if="fileList.length > 0" class="image-list">
        <div
          v-for="(file, index) in fileList"
          :key="index"
          class="image-item"
        >
          <el-image
            :src="file.url"
            :preview-src-list="fileList.map(f => f.url)"
            fit="cover"
            class="preview-image"
          />
        </div>
      </div>
      <div v-else class="no-images">
        <el-empty description="暂无图片" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: [Array, String],
    default: () => []
  },
  maxItems: {
    type: Number,
    default: 5
  },
  minItems: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'view'
  }
})

const emit = defineEmits(['update:modelValue'])

// 文件列表
const fileList = ref([])

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue)) {
    fileList.value = newValue.map((item, index) => ({
      uid: index,
      name: typeof item === 'string' ? `image-${index}.jpg` : item.name || `image-${index}.jpg`,
      url: typeof item === 'string' ? item : item.url || item,
      status: 'success'
    }))
  } else if (newValue) {
    fileList.value = [{
      uid: 0,
      name: 'image.jpg',
      url: newValue,
      status: 'success'
    }]
  } else {
    fileList.value = []
  }
}, { immediate: true })

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 自定义上传
const customUpload = async (options) => {
  const { file } = options
  
  try {
    // 模拟上传成功
    const fakeUrl = URL.createObjectURL(file)
    const fileInfo = {
      uid: Date.now(),
      name: file.name,
      url: fakeUrl,
      status: 'success'
    }
    
    // 添加到文件列表
    if (props.maxItems === 1) {
      fileList.value = [fileInfo]
    } else {
      fileList.value.push(fileInfo)
    }
    
    // 更新modelValue
    updateModelValue()
    
    options.onSuccess(fileInfo)
  } catch (error) {
    console.error('上传失败:', error)
    options.onError(error)
  }
}

// 上传成功
const handleSuccess = (response, file) => {
  ElMessage.success('上传成功')
}

// 上传失败
const handleError = (error) => {
  ElMessage.error('上传失败')
}

// 移除文件
const handleRemove = (file) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    updateModelValue()
  }
}

// 更新modelValue
const updateModelValue = () => {
  if (props.maxItems === 1) {
    // 单选模式，返回字符串
    emit('update:modelValue', fileList.value[0]?.url || '')
  } else {
    // 多选模式，返回数组
    emit('update:modelValue', fileList.value.map(file => file.url))
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.image-preview {
  min-height: 100px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  width: 100px;
  height: 100px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.no-images {
  padding: 20px;
  text-align: center;
  color: #909399;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style> 