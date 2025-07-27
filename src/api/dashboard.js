import { register } from '@/utils/auth'
import request from '@/utils/request'

// 认证相关接口
export const dashboardApi = {
    // 发送验证码
    dashBoardSummary() {
        return request.get('/dashboard/dashBoardSummary', {})
    },

    uploadFile(file, businessType) {
        const formData = new FormData()
        formData.append('file', file)
        const data = request.upload('/file/upload?businessType=' + businessType, file);
        return data
    }
} 