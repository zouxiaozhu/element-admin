import axios from 'axios'
import { ElMessage } from 'element-plus'
import { env } from './env.js'
import { getToken } from './auth.js'

// 创建 axios 实例
const service = axios.create({
    baseURL: env.apiBaseUrl, // 使用环境变量工具
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 添加其他公共请求头
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
        config.headers['Accept'] = 'application/json'

        return config
    },
    error => {
        // 对请求错误做些什么
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        if (response.data.success && response.data.code === 0) {
            return response.data.data
        }

        switch (response.data.code) {
            case 401:
            case 10103:
                ElMessage.error("登录已过期,请重新登录");
                // 清除token并跳转到登录页
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
                break;
            case 403:
                ElMessage.error('拒绝访问')
                break
        }
        let enhancedError = new Error(response.data.message || '网络连接失败')
        enhancedError.code = -1
        enhancedError.type = 'NETWORK_ERROR'
        return Promise.reject(enhancedError)

    },
    error => {
        debugger
        // 对响应错误做点什么

        // 创建增强的错误对象
        let enhancedError = error

        if (error.response && error.response.data) {
            const { status, data } = error.response

            // 创建新的错误对象，包含后端返回的详细信息
            enhancedError = new Error(data.message || '请求失败')
            enhancedError.code = data.code
            enhancedError.success = data.success
            enhancedError.data = data.data
            enhancedError.httpStatus = status
            enhancedError.response = error.response

            // 根据HTTP状态码显示通用错误信息
            switch (status) {
                case 401:
                    ElMessage.error('未授权，请重新登录')
                    // 清除token并跳转到登录页
                    localStorage.removeItem('token')
                    sessionStorage.removeItem('token')
                    window.location.href = '/login'
                    break
                case 403:
                    ElMessage.error('拒绝访问')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器内部错误')
                    break
                default:
                    // 显示后端返回的具体错误信息
                    if (data.message) {
                        ElMessage.error(data.message)
                    } else {
                        ElMessage.error('网络错误')
                    }
            }
        } else if (error.request) {
            enhancedError = new Error('网络连接失败')
            enhancedError.code = -1
            enhancedError.type = 'NETWORK_ERROR'
            ElMessage.error('网络连接失败')
        } else {
            enhancedError = new Error('请求配置错误')
            enhancedError.code = -2
            enhancedError.type = 'CONFIG_ERROR'
            ElMessage.error('请求配置错误')
        }

        return Promise.reject(enhancedError)
    }
)

// 封装请求方法
class RequestService {
    // GET 请求
    get(url, params = {}) {
        return service.get(url, { params })
    }

    // POST JSON 请求
    post(url, data = {}) {
        return service.post(url, data)
    }

    // POST FormData 请求
    postForm(url, data = {}) {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            formData.append(key, data[key])
        })

        return service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    // POST URLSearchParams 请求
    postUrlencoded(url, data = {}) {
        const params = new URLSearchParams()
        Object.keys(data).forEach(key => {
            params.append(key, data[key])
        })

        return service.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    }

    // PUT 请求
    put(url, data = {}) {
        return service.put(url, data)
    }

    // DELETE 请求
    delete(url, params = {}) {
        return service.delete(url, { params })
    }

    // 文件上传
    upload(url, file, onProgress = null) {
        const formData = new FormData()
        formData.append('file', file)

        return service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: onProgress
        })
    }

    // 多文件上传
    uploadMultiple(url, files, onProgress = null) {
        const formData = new FormData()
        files.forEach((file, index) => {
            formData.append(`file${index}`, file)
        })

        return service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: onProgress
        })
    }
}

export default new RequestService() 