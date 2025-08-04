import request from '@/utils/request'

/**
 * 二维码管理API
 */

// 获取二维码列表
export function getQRCodeList(params) {
    return request({
        url: '/api/qrcode/list',
        method: 'get',
        params
    })
}

// 获取二维码详情
export function getQRCodeDetail(id) {
    return request({
        url: `/api/qrcode/${id}`,
        method: 'get'
    })
}

// 创建二维码
export function createQRCode(data) {
    return request({
        url: '/api/qrcode',
        method: 'post',
        data
    })
}

// 更新二维码
export function updateQRCode(id, data) {
    return request({
        url: `/api/qrcode/${id}`,
        method: 'put',
        data
    })
}

// 删除二维码
export function deleteQRCode(id) {
    return request({
        url: `/api/qrcode/${id}`,
        method: 'delete'
    })
}

// 批量删除二维码
export function batchDeleteQRCode(ids) {
    return request({
        url: '/api/qrcode/batch',
        method: 'delete',
        data: { ids }
    })
}

// 生成二维码
export function generateQRCode(data) {
    return request({
        url: '/api/qrcode/generate',
        method: 'post',
        data
    })
}

// 获取二维码统计数据
export function getQRCodeStats() {
    return request({
        url: '/api/qrcode/stats',
        method: 'get'
    })
}

// 获取二维码扫描记录
export function getQRCodeScanRecords(id, params) {
    return request({
        url: `/api/qrcode/${id}/scans`,
        method: 'get',
        params
    })
}

// 更新二维码状态
export function updateQRCodeStatus(id, status) {
    return request({
        url: `/api/qrcode/${id}/status`,
        method: 'patch',
        data: { status }
    })
}

// 复制二维码
export function copyQRCode(id) {
    return request({
        url: `/api/qrcode/${id}/copy`,
        method: 'post'
    })
}

// 导出二维码
export function exportQRCode(id, format = 'png') {
    return request({
        url: `/api/qrcode/${id}/export`,
        method: 'get',
        params: { format },
        responseType: 'blob'
    })
}

// 批量导出二维码
export function batchExportQRCode(ids, format = 'zip') {
    return request({
        url: '/api/qrcode/batch/export',
        method: 'post',
        data: { ids, format },
        responseType: 'blob'
    })
}

// 获取二维码类型列表
export function getQRCodeTypes() {
    return request({
        url: '/api/qrcode/types',
        method: 'get'
    })
}

// 获取二维码模板列表
export function getQRCodeTemplates(params) {
    return request({
        url: '/api/qrcode/templates',
        method: 'get',
        params
    })
}

// 保存为模板
export function saveAsTemplate(data) {
    return request({
        url: '/api/qrcode/templates',
        method: 'post',
        data
    })
} 