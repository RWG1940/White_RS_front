White_RS_front 前端模板
简要说明

- 这是一个基于 Vue 3 + Vite 的前端应用模板，使用 TypeScript、Pinia、Vue Router、Tailwind CSS 与 Ant Design Vue 构建，包含若干常用模块示例，便于快速开发和扩展。
- 当前代码涉及的常用模块包括：数据表、文件驱动、AI 提示等，结构清晰，便于二次开发和组件化替换。

技术栈

- 前端框架: Vue.js 3
- 构建工具: Vite
- 语言: TypeScript
- 路由与状态管理: Vue Router + Pinia
- UI 组件: Ant Design Vue
- 样式: Tailwind CSS
- 依赖示例: axios、xlsx、handsontable、three、pdfjs-dist、vue-cropper 等

运行环境

- Node.js 版本：与 package.json engines 相匹配，推荐使用 Node 20.x/22.x。

快速开始

- 安装依赖
  ```bash
  npm install
  ```
- 开发环境
  ```bash
  npm run dev
  ```
- 访问地址
  http://localhost:5173
- 构建
  ```bash
  npm run build
  ```
- 本地预览构建结果
  ```bash
  npm run preview
  ```
- 代码格式化与类型检查
  ```bash
  npm run format
  npm run type-check
  ```

项目结构

- src/
  - App.vue、main 入口、路由、布局、视图等
  - layout/ 全局布局组件
  - views/ 页面视图集合（如 Home、Login、Register、文件驱动等）
  - components/ 通用组件
  - stores/ Pinia 状态管理
  - api/ 后端接口封装
  - utils/ 工具函数
  - config/ 配置文件
  - types/ 类型定义
- public/ 静态资源

如何自定义与扩展

- 主题与样式：Tailwind + Ant Design Vue，按需自定义样式变量与组件风格。
- API 封装：src/api 下的 services 可以按需新建/修改接口。
- 新模块新增：按现有模块结构创建新的 views/components 并在路由中注册即可。

环境变量

- 使用 .env.\* 文件管理环境变量，请将示例文件命名为 .env.example 并在实际环境中复制为 .env.local 等。

贡献与开发流程

- Fork/branch：在新分支上开发，提交前确保本地通过格式化与类型检查。
- 提交格式示例：
  - feat: 新增某某页面
  - fix: 修复某某问题
  - docs: 更新文档
- 提交后创建 Pull Request，并附上清晰的变更描述。

许可

- 许可证信息请在 LICENSE 文件中声明。

如需定制，请告知你的目标和现有问题，我可以据此调整 README。

## 文档导航

以下文档收集了核心组件和工具的使用指南，便于快速上手与二次开发。

- CreateCRUDStore 使用指南: [docs/createCRUDStore-Usage.md](docs/createCRUDStore-Usage.md)
- createApi 使用指南: [docs/createApi-Usage.md](docs/createApi-Usage.md)
- 全局配置使用指南: [docs/config-Usage.md](docs/config-Usage.md)
- ManagePage.vue 使用指南: [docs/ManagePage-Usage.md](docs/ManagePage-Usage.md)
- Modal.vue 使用指南: [docs/Modal-Usage.md](docs/Modal-Usage.md)
- CreateCRUDStore 使用指南: [docs/createCRUDStore-Usage.md](docs/createCRUDStore-Usage.md)
- createApi 使用指南: [docs/createApi-Usage.md](docs/createApi-Usage.md)
- 全局配置使用指南: [docs/config-Usage.md](docs/config-Usage.md)
- ManagePage.vue 使用指南: [docs/ManagePage-Usage.md](docs/ManagePage-Usage.md)
- Modal.vue 使用指南: [docs/Modal-Usage.md](docs/Modal-Usage.md)
- 全局 AI 使用约束: [docs/global-ai-constraints.md](docs/global-ai-constraints.md)

