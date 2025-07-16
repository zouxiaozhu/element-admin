import { createRouter, createWebHistory } from 'vue-router'
import Index from '@c/admin/Index.vue'
import Login from '@c/admin/Login.vue'

const routes = [
    { path: '/index', component: Index },
    { path: '/', component: Login }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router