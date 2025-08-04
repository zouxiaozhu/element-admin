import { getCosSecretId, getCosSecretKey, getCosBucket, getCosRegion } from './env'

// 生成随机文件名，难以碰撞和猜测
export const generateRandomFileName = (file, prefix = 'uploads') => {
    // 生成一个随机UUID
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })

    // 获取文件扩展名
    const ext = file.name.split('.').pop() || ''

    // 生成随机数
    const randomNum = Math.floor(Math.random() * 10000000)

    // 获取当前时间，并格式化为年月日时分秒目录结构
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    // 构建日期目录路径
    const datePath = `${year}/${month}/${day}/${hours}${minutes}${seconds}`

    // 组合生成随机文件名，带有日期目录结构
    return `${prefix}/${datePath}/${randomNum}-${uuid}.${ext}`
}

// 初始化COS
export const initCOS = () => {
    // 动态导入COS SDK
    return import('cos-js-sdk-v5').then(({ default: COS }) => {
        return new COS({
            SecretId: getCosSecretId(),
            SecretKey: getCosSecretKey(),
            SimpleUploadMethod: true
        })
    })
}

// 上传文件到COS
export const uploadToCOS = async (file, prefix = 'uploads') => {
    try {
        const cos = await initCOS()
        const fileName = generateRandomFileName(file, prefix)

        return new Promise((resolve, reject) => {
            cos.putObject({
                Bucket: getCosBucket(),
                Region: getCosRegion(),
                Key: fileName,
                Body: file,
                onProgress: (info) => {
                    console.log('上传进度:', info)
                }
            }, (err, data) => {
                if (err) {
                    console.error('上传到COS失败:', err)
                    reject(err)
                } else {
                    console.log('上传到COS成功:', data)
                    // 返回文件的访问URL
                    const fileUrl = `https://${getCosBucket()}.cos.${getCosRegion()}.myqcloud.com/${fileName}`
                    resolve(fileUrl)
                }
            })
        })
    } catch (error) {
        console.error('初始化COS失败:', error)
        throw error
    }
}

// 获取文件URL
export const getFileUrl = (key) => {
    if (!key) return ''

    // 如果已经是完整URL，直接返回
    if (key.startsWith('http')) {
        return key
    }

    // 构建COS文件URL
    return `https://${getCosBucket()}.cos.${getCosRegion()}.myqcloud.com/${key}`
}

// 获取COS配置
export const getCOSConfig = () => {
    return {
        SecretId: getCosSecretId(),
        SecretKey: getCosSecretKey(),
        Bucket: getCosBucket(),
        Region: getCosRegion()
    }
}

export default {
    generateRandomFileName,
    initCOS,
    uploadToCOS,
    getFileUrl,
    getCOSConfig
} 