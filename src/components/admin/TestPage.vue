<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>如果您能看到这个页面，说明路由正常工作。</p>
    <el-button @click="$router.push('/admin/login')">跳转到登录页</el-button>
  </div>
</template>

<script setup>
// 简单的测试页面
</script>

<style scoped>
.test-page {
  padding: 20px;
  text-align: center;
}
</style> 