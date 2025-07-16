import request from '@/utils/request'

// 认证相关接口
export const authApi = {
    // 发送验证码
    sendSmsCode(phone) {
        return request.post('/auth/send-sms', { phone })
    },

    // 登录（JSON格式）
    login(data) {
        return request.post('/auth/login', data)
    },

    // 登录（FormData格式）
    loginForm(data) {
        return request.postForm('/auth/login', data)
    },

    // 登录（URL编码格式）
    loginUrlencoded(data) {
        return request.postUrlencoded('/auth/login', data)
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
    }
} 