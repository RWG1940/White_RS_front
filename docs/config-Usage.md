Usage Guide: src/config/index.ts

概览

- 这份配置文件定义了全局应用配置（AppConfig）以及不同环境的具体配置对象，方便在不同环境下切换前端与后端的地址、端口、标题等信息。

AppConfig 结构

- siteTitle: 网站主标题
- browserTitle: 浏览器标签页标题
- frontendPort: 前端开发端口
- backendUrl: 后端地址（通常为 API 的基础路径）
- enableDebug: 是否开启调试输出
- bottomText: 页面底部文本
- frontendUrl: 前端访问地址（用于拼接如链接跳转等）

环境配置

- productConfig: 生产环境配置
- developConfig: 开发环境配置
- aiConfig: AI 项目配置
- dhConfig: 大华/考勤相关项目配置

当前选用的配置

- getConfig(): AppConfig
  - 通过合并不同环境的配置对象来得到最终的 appConfig 对象。
  - 当前实现中注释掉了部分环境的合并，示例为使用开发环境配置 developConfig。
- appConfig: 导出的配置实例，供应用初始化时使用。

使用示例

- 在应用入口处引入并应用：

```ts
import { appConfig } from '@/config'

// 典型用途：将后端地址注入 http 客户端、路由跳转基础等
console.log('后端地址：', appConfig.backendUrl)
```

环境切换建议

- 目前 getConfig 的实现是通过手动注释/取消注释来切换环境。推荐改造成基于环境变量的动态选择，例如根据 process.env.VUE_APP_ENV（或 VITE_ENV）来选择不同的配置对象。
- 可能的实现思路：在 getConfig 中读取环境变量，然后返回对应的配置对象。

改进建议（示例）

- 增加环境变量读取逻辑：
  - 例如在 getConfig 中：
    const env = process.env.VUE_APP_ENV || 'develop'
    if (env === 'production') return productConfig
    if (env === 'ai') return aiConfig
    if (env === 'dh') return dhConfig
    return developConfig
