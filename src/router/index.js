import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

// 动态导入组件
const Login = () => import('@/components/admin/Login.vue')
const Layout = () => import('@/components/admin/Layout.vue')
const Dashboard = () => import('@/components/admin/Dashboard.vue')
const ExcelPage = () => import('@/components/admin/ExcelPage.vue')
const Users = () => import('@/components/admin/Users.vue')
const Profile = () => import('@/components/admin/Profile.vue')
const DocumentConvert = () => import('@/components/admin/DocumentConvert.vue')
const FormBuilder = () => import('@/components/admin/form/FormBuilder.vue')
const FormilyBuilder = () => import('@/components/admin/form/FormilyBuilder.vue')
const FormList = () => import('@/components/admin/form/FormList.vue')
const FormPreview = () => import('@/components/admin/form/FormPreview.vue')
const QRCodeList = () => import('@/components/admin/qrcode/QRCodeList.vue')
const QRCodeEditor = () => import('@/components/admin/qrcode/QRCodeEditor.vue')
const FeedbackManagement = () => import('@/components/admin/FeedbackManagement.vue')
const MyFeedback = () => import('@/components/admin/MyFeedback.vue')
// 公共页面：Excel 搜索（无需登录）
const ExcelSearchPublic = () => import('@/web/ExcelSearch.vue')
// Excel转Word：列表页与新建页
const DocumentConvertList = () => import('@/components/admin/DocumentConvertList.vue')
const DocumentConvertNew = () => import('@/components/admin/DocumentConvertNew.vue')


// 占位组件
const PlaceholderPage = {
  template: `
    <div class="placeholder-page">
      <el-result icon="info" title="功能开发中" sub-title="该功能正在开发中，敬请期待...">
        <template #extra>
          <el-button type="primary" @click="$router.go(-1)">返回</el-button>
        </template>
      </el-result>
    </div>
  `
}

const routes = [
  {
    path: '/',
    redirect: '/admin'
  },
  // 公开页面：Excel 在线搜索
  {
    path: '/excel-search',
    name: 'ExcelSearchPublic',
    component: ExcelSearchPublic,
    meta: {
      title: 'Excel数据搜索',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    redirect: '/admin/login'
  },
  {
    path: '/admin/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '管理员登录',
      requiresAuth: false
    }
  },
  {
    path: '/admin',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表盘' }
      },
      {
        path: 'excel',
        name: 'Excel',
        component: ExcelPage,
        meta: { title: 'Excel管理' }
      },
      {
        path: 'document-convert',
        name: 'DocumentConvertList',
        component: DocumentConvertList,
        meta: { title: 'Excel转Word · 历史记录' }
      },
      {
        path: 'document-convert/new',
        name: 'DocumentConvertNew',
        component: DocumentConvertNew,
        meta: { title: '新建Excel转Word任务' }
      },
      {
        path: 'form/list',
        name: 'FormList',
        component: FormList,
        meta: { title: '表单列表' }
      },
      {
        path: 'form/builder/:id?',
        name: 'FormBuilder',
        component: FormBuilder,
        meta: { title: '表单设计器' }
      },
      {
        path: 'form/formily/:id?',
        name: 'FormilyBuilder',
        component: FormilyBuilder,
        meta: { title: 'Formily表单设计器' }
      },
      {
        path: 'form/preview/:id',
        name: 'FormPreview',
        component: FormPreview,
        meta: { title: '表单预览' }
      },
      {
        path: 'qrcode',
        name: 'QRCodeList',
        component: QRCodeList,
        meta: { title: '二维码管理' }
      },
      {
        path: 'qrcode/create',
        name: 'QRCodeCreate',
        component: QRCodeEditor,
        meta: { title: '创建二维码' }
      },
      {
        path: 'qrcode/edit/:id',
        name: 'QRCodeEdit',
        component: QRCodeEditor,
        meta: { title: '编辑二维码' }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { title: '用户管理' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '个人资料' }
      },
      {
        path: 'system-config',
        name: 'SystemConfig',
        component: PlaceholderPage,
        meta: { title: '系统配置' }
      },
      {
        path: 'system-logs',
        name: 'SystemLogs',
        component: PlaceholderPage,
        meta: { title: '系统日志' }
      },
      {
        path: 'feedback',
        name: 'FeedbackManagement',
        component: FeedbackManagement,
        meta: { title: '用户反馈管理' }
      },
      {
        path: 'my-feedback',
        name: 'MyFeedback',
        component: MyFeedback,
        meta: { title: '我的反馈' }
      },

    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = getToken()
  console.log('路由守卫:', { to: to.path, from: from.path, hasToken: !!token })

  if (to.meta.requiresAuth && !token) {
    console.log('需要认证但无token，跳转到登录页')
    next('/admin/login')
  } else if (to.path === '/admin/login' && token) {
    console.log('已登录用户访问登录页，跳转到首页')
    next('/admin')
  } else {
    console.log('正常路由跳转')
    next()
  }
})

export default router