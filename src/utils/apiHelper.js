// API调用辅助工具
import { ElMessage } from 'element-plus'

/**
 * 处理API响应的通用方法
 * @param {Function} apiCall - API调用函数
 * @param {Object} options - 配置选项
 * @returns {Promise}
 */
export const handleApiCall = async (apiCall, options = {}) => {
    const {
        showSuccess = false,
        showError = true,
        successMessage = '操作成功',
        errorMessage = null,
        throwError = false
    } = options

    try {
        const response = await apiCall()

        // 检查响应是否成功
        if (response.isSuccess && response.isSuccess()) {
            if (showSuccess) {
                ElMessage.success(successMessage)
            }
            return {
                success: true,
                data: response.getData(),
                code: response.getCode(),
                message: response.getMessage(),
                raw: response
            }
        } else {
            // 业务逻辑失败
            const error = new Error(response.getMessage() || '操作失败')
            error.code = response.getCode()
            error.data = response.getData()
            throw error
        }
    } catch (error) {
        console.error('API调用失败:', error)

        if (showError && !errorMessage) {
            // 如果没有自定义错误信息，使用error中的信息
            // request.js已经处理了错误显示，这里不重复显示
        } else if (showError && errorMessage) {
            ElMessage.error(errorMessage)
        }

        if (throwError) {
            throw error
        }

        return {
            success: false,
            code: error.code || -1,
            message: error.message || '未知错误',
            data: error.data || null,
            error
        }
    }
}

/**
 * 快捷的成功响应处理
 * @param {Function} apiCall 
 * @param {string} successMessage 
 */
export const callWithSuccess = (apiCall, successMessage = '操作成功') => {
    return handleApiCall(apiCall, { showSuccess: true, successMessage })
}

/**
 * 静默调用（不显示任何提示）
 * @param {Function} apiCall 
 */
export const callSilently = (apiCall) => {
    return handleApiCall(apiCall, { showSuccess: false, showError: false })
}

/**
 * 获取响应数据（如果失败返回null）
 * @param {Function} apiCall 
 */
export const getResponseData = async (apiCall) => {
    const result = await callSilently(apiCall)
    return result.success ? result.data : null
}

/**
 * 检查API调用是否成功
 * @param {Function} apiCall 
 */
export const isApiSuccess = async (apiCall) => {
    const result = await callSilently(apiCall)
    return result.success
} 