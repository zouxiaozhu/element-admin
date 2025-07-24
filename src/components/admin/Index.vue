<template>
  <Layout >
    <!-- 使用插槽来容纳不同的页面内容 -->
    <div class="page-container">
      <div class="tab-content-wrapper">
           compiote
      </div>
    </div>
  </Layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Layout from './Layout.vue'
import ExcelPage from './ExcelPage.vue'
import ExcelSearch from '@/web/ExcelSearch.vue'

</script>

<style scoped>
</style>