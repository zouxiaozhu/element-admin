# Excel管理系统

基于Vue 3 + Element Plus的Excel文件管理和解析系统，提供用户认证、文件上传、数据搜索和分析功能。

## ✨ 功能特性

- 🔐 **用户认证** - 登录/注册/权限控制
- 📊 **Excel管理** - 文件上传、解析、状态跟踪
- 🔍 **数据搜索** - 多条件搜索、逻辑操作
- 📈 **数据分析** - 统计图表、数据可视化
- 👥 **用户管理** - 用户信息、角色权限
- 🎨 **响应式设计** - 支持PC和移动端

## 🚀 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI库**: Element Plus
- **构建工具**: Vite
- **语言**: JavaScript/TypeScript
- **路由**: Vue Router
- **HTTP客户端**: Axios

## 📦 安装

```bash
# 克隆项目
git clone <repository-url>
cd element-admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## ⚙️ 环境配置

创建 `.env` 文件配置后端API地址：

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:8080/api

# 应用配置
VITE_APP_TITLE=Excel管理系统
VITE_APP_VERSION=1.0.0
```

## 🏗️ 项目结构

```
src/
├── api/                    # API接口层
├── components/             # Vue组件
│   ├── admin/             # 管理后台组件
│   └── web/               # 前台组件
├── router/                # 路由配置
├── utils/                 # 工具函数
├── assets/               # 静态资源
└── types/                # TypeScript类型
```

## 🔌 API接口格式

后端接口需要返回统一格式：

```json
{
  "success": true,
  "code": 0,
  "message": "ok",
  "data": {
    "userInfo": { ... },
    "tokenInfo": { ... }
  }
}
```

## 📋 主要功能

### 认证系统
- 用户登录/注册
- Token认证
- 权限控制

### Excel管理
- 文件上传和解析
- 文件列表管理
- 解析状态跟踪

### 数据搜索
- 多字段搜索
- 逻辑条件(AND/OR)
- 结果分页显示

## 🛠️ 开发指南

1. **组件开发** - 使用Composition API和Element Plus
2. **API调用** - 通过统一的API模块
3. **错误处理** - 全局错误处理和用户提示
4. **样式规范** - Scoped CSS + Element Plus主题

## 📝 代码规范

项目使用了详细的代码规范，详见 `.cursorrules` 文件。主要包括：

- Vue 3 Composition API最佳实践
- Element Plus组件使用规范
- API调用和错误处理规范
- CSS/样式编写规范

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
