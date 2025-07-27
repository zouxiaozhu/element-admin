import { createRouter, createWebHistory } from 'vue-router'
import Index from '@c/admin/Index.vue'
import Login from '@c/admin/Login.vue'
import Layout from '@c/admin/Layout.vue'
import ExcelPage from '@c/admin/ExcelPage.vue'
import ExcelSearch from '@/web/ExcelSearch.vue'

const routes = [
  {
    path: '/',
    component: Index,
    name: 'Admin',
    meta: { title: '管理后台' }
  },
  {
    path: '/admin',
    component: Layout,
    name: 'Layout',
    meta: { title: '管理后台' }
  },
  {
    path: '/excel',
    component: ExcelPage,
    name: 'Excel',
    meta: { title: 'Excel管理' }
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
    path: '/index',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

import { getToken } from '@/utils/auth.js'

// 路由守卫
router.beforeEach((to, from, next) => {
  // 不需要验证token的页面
  const publicPages = ['/login', '/excel-search']
  const authRequired = !publicPages.includes(to.path)

  // 获取token
  const token = getToken()

  if (authRequired && !token) {
    // 需要登录但没有token，跳转到登录页
    console.log('No token found, redirecting to login...')
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已经登录但访问登录页，跳转到管理后台
    console.log('Already logged in, redirecting to admin...')
    next('/admin')
  } else {
    // 允许访问
    next()
  }
})

export default router