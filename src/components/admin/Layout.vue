<template>
  <div class="layout-root">
    <Header />
    <div class="main-area">
      <Sidebar :activeMenu="activeMenu" @menu-select="handleMenuSelect" />
      <div class="content-area">
        <slot>
          <component :is="currentComponent" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Dashboard from './Dashboard.vue'
import ExcelPage from './ExcelPage.vue'

const activeMenu = ref('')
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}
const currentComponent = computed(() => {
  if (activeMenu.value === 'excel') return ExcelPage
  return Dashboard
})
</script>

<style scoped>
.layout-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f6fa 0%, #eaf3ff 100%);
}
.main-area {
  display: flex;
  flex: 1;
  min-height: 0;
}
.content-area {
  flex: 1;
  padding: 40px 40px 0 40px;
  overflow-y: auto;
  background: transparent;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(64,158,255,0.08);
  margin: 32px 0 32px 0;
  min-height: 80vh;
  transition: box-shadow 0.2s;
}
@media (max-width: 900px) {
  .content-area {
    padding: 18px 6px 0 6px;
    margin: 12px 0 12px 0;
  }
  .layout-root {
    background: #f5f6fa;
  }
}
</style>