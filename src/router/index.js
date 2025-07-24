import { createRouter, createWebHistory } from 'vue-router'
import Index from '@c/admin/Index.vue'
import Login from '@c/admin/Login.vue'
import ExcelPage from '@c/admin/ExcelPage.vue'
// import Layout from '@/layout/index.vue'
import ExcelSearch from '@/web/ExcelSearch.vue'

const routes = [
  {
    path: '/',
    component: Index,
    name: 'Admin',
    meta: { title: '管理后台' }
  },
  {
    path: '/login',
    component: Login,
    name: 'Login',
    meta: { title: '登录' }
  },
  {
    path: '/excel-search',
    component: ExcelSearch,
    name: 'ExcelSearch',
    meta: { title: 'Excel 数据查询' }
  },
  {
    path: '/excel',
    component: ExcelPage,
    name: 'Excel',
    meta: { title: 'Excel 列表' }
  },
  {
    path: '/index',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router