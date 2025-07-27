// Excel 相关 API 服务
import request from '@/utils/request'

// 获取 Excel 元数据
export const getExcelMetaData = async (fileCoding) => {
    try {
        const data = await request.get(`/excel/meta?fileCoding=${fileCoding}`)
        return data // 直接返回完整响应，包含 success, code, msg, data
    } catch (error) {
        console.error('获取 Excel 元数据失败:', error)
        throw error
    }
}

// 搜索 Excel 数据
export const searchExcelData = async (params) => {
    try {
        // 构建新的请求参数格式
        const searchQueries = []

        // 从搜索表单中提取所有搜索条件（包括空值）
        Object.entries(params).forEach(([columnKey, columnValue]) => {
            // 排除特殊的控制参数，其他所有字段都传递给后端
            if (columnKey !== 'file_coding' && columnKey !== 'logic') {
                searchQueries.push({
                    columnKey: columnKey,
                    columnValue: columnValue || '' // 空值转换为空字符串
                })
            }
        })

        const requestBody = {
            fileCode: params.file_coding,
            logic: params.logic || "OR", // 使用传入的逻辑参数
            searchQueries: searchQueries
        }

        console.log('搜索请求参数:', requestBody) // 调试信息

        const data = await request.post('/excel/searchRows', requestBody)
        return data // 直接返回完整响应，包含 success, code, msg, data
    } catch (error) {
        console.error('搜索 Excel 数据失败:', error)
        throw error
    }
}

// 获取 Excel 文件列表
export const getExcelFileList = async (params) => {
    try {
        // 构建查询参数
        const queryParams = new URLSearchParams()

        // 基础分页参数
        if (params.page !== undefined) {
            queryParams.append('page', params.page)
        }
        if (params.size !== undefined) {
            queryParams.append('size', params.size)
        }

        // 搜索参数
        if (params.name) {
            queryParams.append('name', params.name)
        }
        if (params.status) {
            queryParams.append('status', params.status)
        }
        if (params.startTime) {
            queryParams.append('startTime', params.startTime)
        }
        if (params.endTime) {
            queryParams.append('endTime', params.endTime)
        }

        const data = await request.get(`/excel/excelFileList?${queryParams.toString()}`)
        return data
    } catch (error) {
        console.error('获取 Excel 文件列表失败:', error)
        throw error
    }
}

// 上传 Excel 文件
export const uploadExcelFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const data = request.upload('/file/upload?businessType=USER_EXCEL_PARSE', file);
    return data

}


export const deleteExcelFile = async (id) => {
    const data = request.get(`/excel/deleteParseFile?fileId=${id}`).catch(error => {
        throw error
    })
    return data
}

export const updateParseFile = async (editForm) => {
    try {
        // 处理时间格式转换
        const formatTime = (timeValue) => {
            if (!timeValue) return null
            if (timeValue instanceof Date) {
                // 转换为 YYYY-MM-DD HH:mm:ss 格式
                const year = timeValue.getFullYear()
                const month = String(timeValue.getMonth() + 1).padStart(2, '0')
                const day = String(timeValue.getDate()).padStart(2, '0')
                const hours = String(timeValue.getHours()).padStart(2, '0')
                const minutes = String(timeValue.getMinutes()).padStart(2, '0')
                const seconds = String(timeValue.getSeconds()).padStart(2, '0')
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            }
            return timeValue
        }

        const response = request.post('/excel/updateParseFile', {
            "id": editForm.value.id,
            "excelFile": editForm.value.excelFile,
            "startTime": formatTime(editForm.value.startTime),
            "endTime": formatTime(editForm.value.endTime),
            "status": editForm.value.status,
            "extendData": editForm.value.extendData
        })
        return response
    } catch (error) {
        throw error
    }
}

export const getExcelFileDetail = async (fileId, offset, size) => {
    try {
        const data = request.get(`/excel/getParseFileDetailPage?fileId=${fileId}&offset=${offset}&size=${size}`)
        return data

    } catch (error) {
        throw error;
    }
}