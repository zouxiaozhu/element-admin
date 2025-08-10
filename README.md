# Excel管理系统

基于Vue 3 + Element Plus的Excel文件管理和数据转换系统，提供用户认证、文件上传、数据搜索、Word模板转换、二维码生成、表单设计等强大功能。

## ✨ 核心功能特性

### 📊 Excel文件管理
- **文件上传解析**: 支持.xlsx、.xls格式，自动解析变量和数据结构
- **智能变量提取**: 自动识别Excel表格列标题作为变量名
- **数据预览**: 实时预览解析结果，支持变量复制功能
- **状态跟踪**: 完整的文件处理状态跟踪和错误处理

### 📝 Word模板转换
- **批量转换**: 将Excel数据批量填充到Word模板中
- **变量替换**: 支持{{变量名}}格式的变量替换
- **多文档生成**: 根据Excel行数自动生成多个Word文档
- **下载管理**: 支持单个下载和批量下载功能

### 🔍 智能数据搜索
- **多条件搜索**: 支持多字段组合搜索
- **逻辑操作**: 支持AND/OR逻辑操作符
- **模糊匹配**: 智能模糊搜索和精确匹配
- **结果分页**: 高效的分页显示和结果导出

### 📱 二维码生成
- **多种类型**: 支持URL、文本、名片、WiFi、邮箱、电话等
- **自定义样式**: 可调整大小、颜色、纠错级别
- **批量操作**: 支持批量生成和管理
- **实时预览**: 二维码实时预览和下载

### 📋 表单设计器
- **可视化设计**: 拖拽式表单构建器
- **丰富组件**: 文本框、选择器、日期、图片上传等
- **自定义配置**: 字段属性编辑和验证规则
- **表单预览**: 实时预览和测试功能

### 💬 用户反馈系统
- **富文本编辑**: 支持格式化文本和图片插入
- **截图功能**: 自动截图和手动上传
- **实时通知**: 未读消息提醒和状态更新
- **反馈管理**: 完整的反馈处理流程

### 🔔 通知系统
- **实时提醒**: 头部通知徽章显示未读数量
- **消息管理**: 反馈回复和状态更新通知
- **批量操作**: 支持批量标记已读功能

## 🚀 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI库**: Element Plus
- **构建工具**: Vite
- **语言**: JavaScript/TypeScript
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **样式**: Scoped CSS + Element Plus主题

## 📦 安装和部署

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

# 预览生产版本
npm run preview
```

## ⚙️ 环境配置

创建 `.env` 文件配置后端API地址：

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:8080/api

# 应用配置
VITE_APP_TITLE=Excel管理系统
VITE_APP_VERSION=1.0.0

# 功能开关
VITE_ENABLE_FEEDBACK=true
VITE_ENABLE_QRCODE=true
VITE_ENABLE_FORM_BUILDER=true
```

## 🏗️ 项目结构

```
src/
├── api/                    # API接口层
│   ├── auth.js            # 认证相关接口
│   ├── excel.js           # Excel相关接口  
│   ├── document.js        # 文档转换接口
│   ├── qrcode.js          # 二维码接口
│   ├── feedback.js        # 反馈接口
│   └── dashboard.js       # 仪表盘接口
├── components/            # 组件
│   ├── admin/             # 管理后台组件
│   │   ├── excel/         # Excel管理组件
│   │   ├── qrcode/        # 二维码组件
│   │   ├── form/          # 表单设计组件
│   │   └── feedback/      # 反馈组件
│   └── web/               # 前台组件
├── router/                # 路由配置
├── utils/                 # 工具函数
│   ├── auth.js           # 认证工具
│   ├── request.js        # HTTP请求封装
│   ├── apiHelper.js      # API调用助手
│   └── env.js            # 环境配置
├── assets/               # 静态资源
└── types/                # TypeScript类型定义
```

## 🔌 API接口格式

所有API接口都返回统一格式：

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

## 📋 主要功能模块

### 认证系统
- 用户登录/注册
- Token认证和权限控制
- 自动登录状态管理
- 安全退出和会话清理

### Excel管理
- 文件上传和格式验证
- 自动解析和变量提取
- 数据预览和变量复制
- 文件状态跟踪和错误处理

### Word模板转换
- 模板上传和格式验证
- 变量匹配和批量转换
- 进度跟踪和状态显示
- 结果下载和文件管理

### 数据搜索
- 多字段组合搜索
- 逻辑条件(AND/OR)支持
- 模糊匹配和精确搜索
- 结果分页和导出功能

### 二维码生成
- 多种类型二维码支持
- 自定义样式和参数
- 批量生成和管理
- 实时预览和下载

### 表单设计
- 可视化表单构建器
- 丰富组件库支持
- 自定义字段配置
- 表单预览和测试

### 用户反馈
- 富文本反馈编辑器
- 截图上传和自动截图
- 反馈管理和回复系统
- 实时通知和状态更新

## 🛠️ 开发指南

### 组件开发规范
1. **使用Composition API**: 优先使用`<script setup>`语法
2. **响应式数据**: 使用`ref()`和`reactive()`正确声明响应式数据
3. **组件命名**: 使用PascalCase命名组件文件
4. **Props验证**: 定义clear的props类型和默认值
5. **样式作用域**: 使用`<style scoped>`避免样式污染

### API调用规范
1. **统一封装**: 所有API调用通过`src/api/`目录下的模块
2. **错误处理**: 使用try-catch处理异步操作
3. **loading状态**: UI操作时显示loading状态
4. **响应验证**: 检查`response.success`确认操作成功

### 样式规范
1. **CSS命名**: 使用BEM命名规范
2. **响应式设计**: 使用Element Plus栅格系统
3. **主题一致性**: 遵循Element Plus设计语言
4. **移动端适配**: 合理的断点设置

## 📈 SEO优化

### 页面优化
- 完整的meta标签设置
- 结构化数据标记
- 语义化HTML结构
- 页面加载速度优化

### 内容优化
- 详细的帮助文档
- 功能说明和使用指南
- 常见问题解答
- 技术文档和API说明

### 技术SEO
- 站点地图(sitemap.xml)
- 爬虫协议(robots.txt)
- 页面标题和描述优化
- 内部链接结构优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **邮箱**: support@excel-admin.com
- **微信**: Rqdll1
- **工作时间**: 周一至周五 9:00-18:00

## 🆕 更新日志

### v1.0.0 (2024-01-15)
- ✨ 新增Excel转Word批量转换功能
- ✨ 新增二维码生成和管理功能
- ✨ 新增表单设计器功能
- ✨ 新增用户反馈系统
- ✨ 新增实时通知系统
- 🐛 修复文件下载和滚动问题
- 🎨 优化UI界面和用户体验
