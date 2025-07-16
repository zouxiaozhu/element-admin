// 环境变量工具类
export const env = {
    // API 基础 URL
    get apiBaseUrl() {
        return import.meta.env.VITE_API_BASE_URL || '/api'
    },

    // 应用标题
    get appTitle() {
        return import.meta.env.VITE_APP_TITLE || 'Element Admin'
    },

    // 应用版本
    get appVersion() {
        return import.meta.env.VITE_APP_VERSION || '1.0.0'
    },

    // 应用描述
    get appDescription() {
        return import.meta.env.VITE_APP_DESCRIPTION || 'Element Plus Admin System'
    },

    // 当前环境
    get mode() {
        return import.meta.env.MODE
    },

    // 是否为开发环境
    get isDev() {
        return import.meta.env.DEV
    },

    // 是否为生产环境
    get isProd() {
        return import.meta.env.PROD
    },

    // 是否为测试环境
    get isTest() {
        return this.mode === 'test'
    }
}

// 打印当前环境信息（开发时使用）
if (env.isDev) {
    console.log('当前环境信息:', {
        mode: env.mode,
        apiBaseUrl: env.apiBaseUrl,
        appTitle: env.appTitle,
        appVersion: env.appVersion
    })
} 