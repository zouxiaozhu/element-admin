import axios from 'axios'
import { ElMessage } from 'element-plus'
import { env } from './env.js'

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
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
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
        // 对响应数据做点什么
        const { data } = response

        // 假设后端返回格式为 { code: 200, message: 'success', data: {} }
        if (data.code === 200) {
            return data.data
        } else {
            ElMessage.error(data.message || '请求失败')
            return Promise.reject(new Error(data.message || '请求失败'))
        }
    },
    error => {
        // 对响应错误做点什么
        console.error('Response error:', error)

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    ElMessage.error('未授权，请重新登录')
                    // 清除token并跳转到登录页
                    localStorage.removeItem('token')
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
                    ElMessage.error(data?.message || '网络错误')
            }
        } else if (error.request) {
            ElMessage.error('网络连接失败')
        } else {
            ElMessage.error('请求配置错误')
        }

        return Promise.reject(error)
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