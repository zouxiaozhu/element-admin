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
        return request.upload('/file/upload?businessType=' + businessType, file);
    }
} 