import { register } from '@/utils/auth'
import request from '@/utils/request'
import axios from 'axios'
import { apiBaseUrl } from '@/utils/env.js'
import { getToken } from '@/utils/auth.js'

// 认证相关接口
export const dashboardApi = {
    // 发送验证码
    dashBoardSummary() {
        return request.get('/dashboard/dashBoardSummary', {})
    },

    uploadFile(file, businessType) {
        // 直接使用axios，避免被request拦截器处理
        const formData = new FormData()
        formData.append('file', file)

        return axios.post(apiBaseUrl + '/file/upload?businessType=' + businessType, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(response => {
            return response.data
        })
    }
} 