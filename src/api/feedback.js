import request from '@/utils/request'

// 提交用户反馈
export const submitFeedback = (data) => {
    return request.post('/api/feedback/submit', data)
}

// 获取反馈列表（管理员）
export const getFeedbackList = (params) => {
    return request.get('/api/feedback/list', params)
}

// 获取反馈详情
export const getFeedbackDetail = (id) => {
    return request.get(`/api/feedback/${id}`)
}

// 获取反馈回复列表
export const getFeedbackReplies = (feedbackId) => {
    return request.get(`/api/feedback/reply/list/${feedbackId}`)
}

// 更新反馈状态
export const updateFeedbackStatus = (id, status) => {
    return request.put(`/api/feedback/${id}/status`, { status })
}

// 回复反馈
export const replyFeedback = (id, reply) => {
    return request.post(`/api/feedback/${id}/reply`, { reply })
}

// 删除反馈
export const deleteFeedback = (id) => {
    return request.delete(`/api/feedback/${id}`)
}

// 获取反馈统计
export const getFeedbackStats = () => {
    return request.get('/api/feedback/stats')
}

// 获取我的反馈列表
export const getMyFeedback = (params) => {
    return request.get('/api/feedback/list', params)
}

// 标记反馈为已读
export const markFeedbackAsRead = (id) => {
    return request.postForm(`/api/feedback/read/${id}`)
}

// 标记回复为已读
export const markReplyAsRead = (replyId) => {
    return request.postForm(`/api/feedback/read/${replyId}`)
} 