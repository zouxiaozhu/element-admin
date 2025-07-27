// Token管理工具类

const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'
const LOGIN_INFO_KEY = 'loginInfo'

/**
 * 获取token
 * @returns {string|null}
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

/**
 * 设置token
 * @param {string} token 
 * @param {boolean} remember 是否记住登录状态
 */
export const setToken = (token, remember = false) => {
    if (remember) {
        localStorage.setItem(TOKEN_KEY, token)
        // 清除sessionStorage中的token
        sessionStorage.removeItem(TOKEN_KEY)
    } else {
        sessionStorage.setItem(TOKEN_KEY, token)
        // 清除localStorage中的token
        localStorage.removeItem(TOKEN_KEY)
    }
}

/**
 * 移除token
 */
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取用户信息
 * @returns {object|null}
 */
export const getUserInfo = () => {
    const userInfo = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
    if (!userInfo || userInfo === 'undefined' || userInfo === 'null') {
        return null
    }
    try {
        return JSON.parse(userInfo)
    } catch (error) {
        console.error('Failed to parse user info:', error)
        return null
    }
}

/**
 * 设置用户信息
 * @param {object} userInfo 
 * @param {boolean} remember 是否记住登录状态
 */
export const setUserInfo = (userInfo, remember = false) => {
    const userInfoStr = JSON.stringify(userInfo)
    if (remember) {
        localStorage.setItem(USER_KEY, userInfoStr)
        sessionStorage.removeItem(USER_KEY)
    } else {
        sessionStorage.setItem(USER_KEY, userInfoStr)
        localStorage.removeItem(USER_KEY)
    }
}

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
}

/**
 * 更新用户信息
 * @param {object} userData 要更新的用户信息
 * @returns {Promise<object>} 返回更新结果
 */
export const updateUserInfo = async (userData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                // 获取当前用户信息
                const currentUserInfo = getUserInfo()
                if (!currentUserInfo) {
                    resolve({
                        success: false,
                        code: 1,
                        message: '用户未登录'
                    })
                    return
                }

                // 合并更新用户信息
                const updatedUserInfo = {
                    ...currentUserInfo,
                    ...userData,
                    loginTime: new Date().toISOString()
                }

                // 保存更新后的用户信息
                const remember = localStorage.getItem(USER_KEY) !== null
                setUserInfo(updatedUserInfo, remember)

                resolve({
                    success: true,
                    code: 0,
                    message: 'ok',
                    data: {
                        userInfo: updatedUserInfo
                    }
                })
            } catch (error) {
                resolve({
                    success: false,
                    code: 1,
                    message: '更新用户信息失败: ' + error.message
                })
            }
        }, 800) // 模拟网络延迟
    })
}

/**
 * 保存登录信息（用于记住密码）
 * @param {object} loginInfo 
 */
export const saveLoginInfo = (loginInfo) => {
    localStorage.setItem(LOGIN_INFO_KEY, JSON.stringify(loginInfo))
}

/**
 * 获取保存的登录信息
 * @returns {object|null}
 */
export const getSavedLoginInfo = () => {
    const loginInfo = localStorage.getItem(LOGIN_INFO_KEY)
    return loginInfo ? JSON.parse(loginInfo) : null
}

/**
 * 移除保存的登录信息
 */
export const removeSavedLoginInfo = () => {
    localStorage.removeItem(LOGIN_INFO_KEY)
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export const isLoggedIn = () => {
    const token = getToken()
    return !!token
}

/**
 * 登出
 */
export const logout = () => {
    removeToken()
    removeUserInfo()
    // 注意：登出时不要删除记住的登录信息，只有用户主动取消"记住密码"时才删除

    // 可以在这里添加其他登出逻辑，比如清除其他缓存数据
    console.log('用户已登出')
}

/**
 * 模拟检查用户是否存在
 * @param {string} username 
 * @returns {Promise<{exists: boolean}>}
 */
export const checkUserExists = async (username) => {
    // 模拟API调用
    return new Promise((resolve) => {
        setTimeout(() => {
            // 预设存在的用户
            const existingUsers = ['admin', 'user1', 'test']
            resolve({
                exists: existingUsers.includes(username.toLowerCase())
            })
        }, 500)
    })
}

/**
 * 模拟用户注册
 * @param {object} userData 
 * @returns {Promise<{success: boolean, code: number, data?: object, message?: string}>}
 */
export const register = async (userData) => {
    // 模拟API调用
    return new Promise((resolve) => {
        setTimeout(() => {
            const { username, password, email, confirmPassword } = userData

            // 验证数据
            if (!username || !password || !email || !confirmPassword) {
                resolve({
                    success: false,
                    code: 1,
                    message: '请填写完整信息'
                })
                return
            }

            if (password !== confirmPassword) {
                resolve({
                    success: false,
                    code: 1,
                    message: '两次密码输入不一致'
                })
                return
            }

            if (password.length < 6) {
                resolve({
                    success: false,
                    code: 1,
                    message: '密码长度至少6位'
                })
                return
            }

            // 检查用户名是否已存在
            const existingUsers = ['admin', 'user1', 'test']
            if (existingUsers.includes(username.toLowerCase())) {
                resolve({
                    success: false,
                    code: 1,
                    message: '用户名已存在'
                })
                return
            }

            // 模拟注册成功
            const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIgIHVzZXJuYW1lICIgLCJpc3MiOiIxIiwiaWF0IjoxNzUzNTM3MTI2LCJleHAiOjE3NTM1NDA3MjZ9.' + Date.now()
            const mockUserInfo = {
                userId: Date.now() % 10000,
                userName: username,
                nickName: userData.nickName || username,
                email: email,
                mobile: userData.mobile || '',
                loginTime: new Date().toISOString(),
                avatar: ''
            }

            resolve({
                success: true,
                code: 0,
                message: 'ok',
                data: {
                    userInfo: mockUserInfo,
                    tokenInfo: {
                        accessToken: mockToken,
                        tokenExpireTime: new Date(Date.now() + 3600000).toISOString(), // 1小时后过期
                        refreshTime: null
                    }
                }
            })
        }, 1500) // 模拟网络延迟
    })
}

/**
 * 模拟登录验证
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, code: number, data?: object, message?: string, userNotFound?: boolean}>}
 */
export const login = async (username, password) => {
    // 模拟API调用
    return new Promise((resolve) => {
        setTimeout(() => {
            // 预设的用户数据
            const users = [
                { username: 'admin', password: '123456', role: '管理员', nickName: '管理员', email: 'admin@example.com' },
                { username: 'user1', password: '123456', role: '用户', nickName: '用户1', email: 'user1@example.com' },
                { username: 'test', password: '123456', role: '用户', nickName: '测试用户', email: 'test@example.com' }
            ]

            const user = users.find(u => u.username === username)

            if (!user) {
                resolve({
                    success: false,
                    code: 1,
                    userNotFound: true,
                    message: '用户不存在，是否注册新账号？'
                })
                return
            }

            if (user.password !== password) {
                resolve({
                    success: false,
                    code: 1,
                    message: '密码错误'
                })
                return
            }

            // 登录成功
            const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIgIHVzZXJuYW1lICIgLCJpc3MiOiIxIiwiaWF0IjoxNzUzNTM3MTI2LCJleHAiOjE3NTM1NDA3MjZ9.' + Date.now()
            const mockUserInfo = {
                userId: user.username === 'admin' ? 1 : 2,
                userName: user.username,
                nickName: user.nickName,
                email: user.email,
                mobile: '',
                loginTime: new Date().toISOString(),
                avatar: ''
            }

            resolve({
                success: true,
                code: 0,
                message: 'ok',
                data: {
                    userInfo: mockUserInfo,
                    tokenInfo: {
                        accessToken: mockToken,
                        tokenExpireTime: new Date(Date.now() + 3600000).toISOString(), // 1小时后过期
                        refreshTime: null
                    }
                }
            })
        }, 1000) // 模拟网络延迟
    })
}

/**
 * 验证token有效性
 * @param {string} token 
 * @returns {Promise<{success: boolean, code: number, data?: object, message?: string}>}
 */
export const validateToken = async (token) => {
    // 模拟API调用验证token
    return new Promise((resolve) => {
        setTimeout(() => {
            // 简单的token格式检查
            if (token && token.startsWith('eyJhbGciOiJIUzI1NiJ9')) {
                const userInfo = getUserInfo()
                resolve({
                    success: true,
                    code: 0,
                    message: 'ok',
                    data: {
                        userInfo: userInfo
                    }
                })
            } else {
                resolve({
                    success: false,
                    code: 1,
                    message: 'Token无效或已过期'
                })
            }
        }, 500)
    })
} 