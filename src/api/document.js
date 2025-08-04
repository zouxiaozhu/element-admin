import request from '@/utils/request'

// Excel转Word相关API接口
export const documentApi = {
    // 上传文件
    uploadFile(file, fileType = 'excel') {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('file_type', fileType)
        return request.postForm('/api/office/upload', formData)
    },

    // 解析Excel表格，获取变量信息
    parseTable(data) {
        return request.post('/api/office/parseTable', data)
    },

    // 创建转换任务
    createTransferTask(data) {
        return request.post('/api/office/transferTable', data)
    },

    // 获取转换状态
    getTransferStatus(data) {
        return request.post('/api/office/transferStatus', data)
    },

    // 获取DOT信息
    getDotInfo(data) {
        return request.post('/api/office/dot', data)
    }
}

export default documentApi 