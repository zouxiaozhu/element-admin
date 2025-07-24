// Vue 组件类型声明
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

// 全局类型声明
declare global {
    interface Window {
        // 添加全局属性
    }
}

// Vuex store 类型
declare module 'vuex' {
    interface Store<S> {
        // 添加 store 类型
    }
}

// 路由元信息类型
declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        icon?: string
        affix?: boolean
        activeMenu?: string
    }
} 