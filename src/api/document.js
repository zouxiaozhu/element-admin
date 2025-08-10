import request from '@/utils/request'
import { dashboardApi } from './dashboard.js'

// Excel转Word相关API接口
export const documentApi = {
    // 上传文件
    uploadFile(file, businessType = 'EXCEL_TO_WORD_EXCEL') {
        return dashboardApi.uploadFile(file, businessType);
    },

    // 解析Excel表格，获取变量信息
    parseTable(data) {
        return request.post('/api/excel-to-word/parse-table', data)
    },

    // 创建转换任务
    createTransferTask(data) {
        return request.post('/api/office/transferTable', data)
    },

    // 创建转换任务 (别名)
    transferTable(data) {
        return request.post('/api/excel-to-word/transfer', data)
    },

    // 获取转换状态
    getTransferStatus(data) {
        return request.postUrlencoded('/api/excel-to-word/task-process', data)
    },

    // 下载转换完成的文件
    downloadFile(taskId, transferId = null) {
        const url = transferId
            ? `/api/excel-to-word/download?taskId=${taskId}&transferId=${transferId}`
            : `/api/excel-to-word/download?taskId=${taskId}`;
        return request.getBlob(url)
    },

    // 获取DOT信息
    getDotInfo(data) {
        return request.post('/api/office/dot', data)
    },

    // 获取历史转换任务列表
    listHistory(params = {}) {
        return request.get('/api/excel-to-word/history', params)
    },

    // 删除历史任务
    deleteHistory(taskId) {
        return request.postUrlencoded('/api/excel-to-word/delete', { taskId })
    }
}

export default documentApi 