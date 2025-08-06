import { ElMessage } from 'element-plus'
import { getToken } from './auth.js'

/**
 * 全局错误处理工具
 */

/**
 * 检查是否是认证错误
 * @param {Error} error 错误对象
 * @returns {boolean}
 */
export const isAuthError = (error) => {
    return error.code === 10103 || error.code === 401 || error.httpStatus === 401
}

/**
 * 处理认证错误
 * @param {string} message 错误消息
 */
export const handleAuthError = (message = 'Token无效或已过期') => {
    ElMessage.error(message)
    // 清除token
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    // 跳转到登录页
    window.location.href = '/admin/login'
}

/**
 * 全局错误处理函数
 * @param {Error} error 错误对象
 * @param {string} defaultMessage 默认错误消息
 * @param {boolean} showMessage 是否显示错误消息
 */
export const handleError = (error, defaultMessage = '操作失败', showMessage = true) => {
    console.error('Error:', error)

    // 检查是否是认证错误
    if (isAuthError(error)) {
        handleAuthError(error.message || 'Token无效或已过期')
        return
    }

    // 显示错误消息
    if (showMessage) {
        const message = error.message || defaultMessage
        ElMessage.error(message)
    }
}

/**
 * 安全的异步操作包装器
 * @param {Function} asyncFn 异步函数
 * @param {string} errorMessage 错误消息
 * @param {boolean} showMessage 是否显示错误消息
 * @returns {Promise}
 */
export const safeAsync = async (asyncFn, errorMessage = '操作失败', showMessage = true) => {
    try {
        return await asyncFn()
    } catch (error) {
        handleError(error, errorMessage, showMessage)
        throw error
    }
}

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
export const checkAuth = () => {
    const token = getToken()
    if (!token) {
        handleAuthError('请先登录')
        return false
    }
    return true
} 