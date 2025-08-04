// 环境变量工具类

// API 相关
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
export const webBaseUrl = import.meta.env.VITE_WEB_BASE_URL || ''
export const uploadMode = import.meta.env.VITE_UPLOAD_MODE || 'SERVER'

// 应用信息
export const appTitle = import.meta.env.VITE_APP_TITLE || 'Element Admin'
export const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
export const appDescription = import.meta.env.VITE_APP_DESCRIPTION || 'Element Plus Admin System'

// 环境信息
export const mode = import.meta.env.MODE
export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
export const isTest = mode === 'test'

// COS 相关
export const cosSecretId = import.meta.env.VITE_COS_SECRET_ID || ''
export const cosSecretKey = import.meta.env.VITE_COS_SECRET_KEY || ''
export const cosBucket = import.meta.env.VITE_COS_BUCKET || ''
export const cosRegion = import.meta.env.VITE_COS_REGION || 'ap-guangzhou'

// Getter 函数
export const getApiBaseUrl = () => apiBaseUrl
export const getWebBaseUrl = () => webBaseUrl
export const getUploadMode = () => uploadMode
export const getAppTitle = () => appTitle
export const getAppVersion = () => appVersion
export const getAppDescription = () => appDescription
export const getMode = () => mode
export const getIsDev = () => isDev
export const getIsProd = () => isProd
export const getIsTest = () => isTest
export const getCosSecretId = () => cosSecretId
export const getCosSecretKey = () => cosSecretKey
export const getCosBucket = () => cosBucket
export const getCosRegion = () => cosRegion

// 兼容旧版本的 env 对象
export const env = {
    get apiBaseUrl() { return apiBaseUrl },
    get webBaseUrl() { return webBaseUrl },
    get uploadMode() { return uploadMode },
    get appTitle() { return appTitle },
    get appVersion() { return appVersion },
    get appDescription() { return appDescription },
    get mode() { return mode },
    get isDev() { return isDev },
    get isProd() { return isProd },
    get isTest() { return isTest },
    get cosSecretId() { return cosSecretId },
    get cosSecretKey() { return cosSecretKey },
    get cosBucket() { return cosBucket },
    get cosRegion() { return cosRegion }
}

// 打印当前环境信息（开发时使用）
if (isDev) {
    console.log('当前环境信息:', {
        mode,
        apiBaseUrl,
        webBaseUrl,
        uploadMode,
        appTitle,
        appVersion,
        cosRegion
    })
} 