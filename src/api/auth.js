import request from '@/utils/request'

// 认证相关接口
export const authApi = {
    // 发送验证码
    sendSmsCode(phone) {
        return request.post('/auth/send-sms', { phone })
    },
    // 登录（JSON格式）
    login(data) {
        return request.post('/system/user/login', data)
    },
    register(data) {
        return request.post('/system/user/register', data)
    },
    // 登出
    logout() {
        return request.post('/auth/logout')
    },

    // 获取用户信息
    getUserInfo() {
        return request.get('/auth/user-info')
    },

    // 刷新token
    refreshToken() {
        return request.post('/auth/refresh-token')
    },

    updateUserInfo(data) {
        return request.post('/system/user/update', data)
    }
} 