<template>
  <div class="document-convert-new">
    <div class="page-header">
      <h2>新建 Excel转Word 任务</h2>
      <el-button @click="$router.push('/admin/document-convert')">返回历史列表</el-button>
    </div>
    <DocumentConvertCore :hide-history="true" />
  </div>
</template>

<script setup>
import DocumentConvertCore from './DocumentConvert.vue'
</script>

<style scoped>
.document-convert-new { padding: 20px; }
.page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
</style>


