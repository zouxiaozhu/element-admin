import request from '@/utils/request'

// 使用示例
export const exampleApi = {
    // JSON 格式请求示例
    createUser(userData) {
        return request.post('/users', {
            name: userData.name,
            email: userData.email,
            age: userData.age
        })
    },

    // FormData 格式请求示例（适合文件上传）
    uploadUserAvatar(userId, avatarFile) {
        return request.postForm('/users/avatar', {
            userId: userId,
            avatar: avatarFile
        })
    },

    // URL编码格式请求示例（适合传统表单提交）
    submitForm(formData) {
        return request.postUrlencoded('/forms/submit', {
            name: formData.name,
            email: formData.email,
            message: formData.message
        })
    },

    // 单文件上传示例
    uploadFile(file) {
        return request.upload('/upload', file, (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log('上传进度:', percentCompleted + '%')
        })
    },

    // 多文件上传示例
    uploadMultipleFiles(files) {
        return request.uploadMultiple('/upload/multiple', files, (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log('上传进度:', percentCompleted + '%')
        })
    },

    // GET 请求示例
    getUserList(params) {
        return request.get('/users', {
            page: params.page,
            limit: params.limit,
            search: params.search
        })
    },

    // PUT 请求示例
    updateUser(userId, userData) {
        return request.put(`/users/${userId}`, userData)
    },

    // DELETE 请求示例
    deleteUser(userId) {
        return request.delete(`/users/${userId}`)
    }
} 