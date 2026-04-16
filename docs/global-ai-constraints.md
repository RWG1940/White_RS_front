# 全局 AI 使用约束说明

目标与范围

- 本文档定义在项目中使用 AI 助手进行代码生成、设计建议、文档撰写时的统一约束和最佳实践，覆盖 API 调用、Pinia store 工具、以及组件模板的使用场景，确保产出可维护、可审查、可追溯。范围包括前端代码、文档、测试用例等与 UI-前端相关的产物。

角色与职责

- 开发人员：按约定使用 AI 辅助实现功能，遵循本约束进行代码生成、重构和文档撰写。
- AI 助手：严格在约束范围内输出代码、文档和设计建议，避免暴露敏感信息、避免对生产环境造成破坏性操作。输出应可复现、可审查。
- 审阅者：对 AI 产出进行人工审阅，确保风格统一、正确性、可维护性以及合规性。

核心原则

- 最小暴露原则：任何输出都不得包含密钥、证书、API 令牌等敏感信息。敏感信息通过环境变量或受控配置管理。
- 可重复性：生成的代码和文档应可重复执行、可部署，避免一次性、不可复用的片段。
- 可观测性：输出的代码应包含清晰的类型定义、边界条件处理和错误处理路径。
- 可维护性：遵循项目现有的代码风格、命名规范、文件结构，以及充分的注释/文档支持。
- 无副作用：默认不更改现有仓库状态，除非用户明确要求并提供审阅通过。涉及 git、部署等敏感操作时，需提前告知并征得许可。

数据与隐私

- 处理用户数据时遵循最小化原则，必要字段方可传输。
- 日志输出应避免记录可识别个人信息（PII），必要信息要经过脱敏处理。
- 与后端交互的 API 调用，应遵守后端的鉴权与数据返回结构，尽量通过封装好的 API 客户端进行访问。

API 使用约束（src/utils/createApi.ts）

- 使用模式：通过 createCRUDService(basePath) 快速封装 RESTful 资源的 CRUD 与查询能力。
- 关键方法：
  - get(id)、getAll()、getPages(page, pageSize)、getPagesByCondition(page, pageSize, conditions)
  - queryLike(conditions)、queryEq(conditions)
  - add(data)、addBatch(list)、update(data)、delete(ids)
  - count()
- 主键解析：update/delete 会尝试从 data.id、data.Id、data.ID、data.userId 解析主键，缺失时抛出警告或错误。
- 返回值：均为 Promise&lt;AxiosResponse&gt;，实际数据请从 res.data 中提取，结构可能为 res.data.data、res.data.result 等，需与后端对齐。
- 安全与健壮性：不要在 AI 使用场景中执行未验证的网络请求，确保输入数据已通过校验和清洗。
- 扩展点：如需对不同资源进行封装，可创建不同的 basePath 实例，例如 createCRUDService('/api/users')、createCRUDService('/api/products') 等。

Pinia Store 使用约束（src/utils/createStore.ts）

- Store 设计模式：使用 defineStore 进行组合式 API 的 store 定义，store 名称应与资源一致，如 useUserStore。
- 结构与类型：state/refs/computed/getters/actions 以组合函数方式暴露，强类型建议使用泛型 T。
- 命名与目录：store 放在 src/stores，文件与导出遵循 useXStore 命名风格。
- 数据不可变性：通过 actions 修改状态，避免直接在组件直接修改 store 的 state。
- 依赖与耦合：尽量使 store 独立于 UI 组件，UI 组件通过 props/slots/事件与 store 交互。
- 代码风格：类型定义清晰、接口暴露、错误处理到位、对网络请求的错误提示友好。
- 测试：为 store 的关键流程编写单元测试（fetchAll/fetchPage/create/update/remove/search 等场景）。
- 限制与约束：对分页、筛选与搜索行为设定合理的默认值，确保在多端适配时行为一致。

组件模板使用约束（ManagePage.vue、Modal.vue）

- 组件职责：模板化 UI 组件，提供可插拔的插槽点以支撑灵活的自定义需求。
- 插槽与扩展：尽量提供清晰的插槽契约（toolbar、custom-tool、bodyCell、operation、footer），避免暴露过多内部实现细节。
- 無副作用原则：在替换插槽内容时，保持原有API行为不变，确保向后兼容。
- 国际化与可访问性：对 UI 文案使用 i18n 方案或常量，确保文本可本地化；支持基础无障碍需求（标签、对比度、可聚焦元素等）。
- 风格与一致性：遵循项目 UI 风格、命名和类型声明规范，避免自定义实现与全局样式冲突。
- 测试与稳定性：对关键 UI 组件的交互行为写测试用例（如表格排序、筛选、搜索、行编辑、模态框打开关闭等）。

错误处理与日志

- 尽量提供友好的错误信息和错误码映射，前端日志应避免暴露敏感信息。
- 全局错误边界策略，例如对 API 调用失败统一提示并回退到可用状态。
- 日志应可配置开启/关闭，便于本地调试与生产环境日志控制。

变更与版本管理

- 对 AI 产出引入的变更需要有变更日志，记录变更原因、影响范围、回滚计划。
- 将 AI 产出与人工审核的结果纳入版本控制（如通过 PR 进行审阅）。

实现模板与示例

- 任务模板：先读取项目结构，定位 API、store、组件模板的位置，然后按约束输出改动。
- 提供产出校验清单：类型检查通过、单元测试覆盖、样式一致性、文档更新、PR 描述清晰等。

## AI 执行协议（面向 AI 的执行约束）

- 适用对象：代码生成、文档撰写、设计建议，以及对现有 API/store/component 模板的扩展。
- 约束要点：最小可行输出、可重复性、可审计性、避免暴露密钥、遵循现有代码风格与结构。
- 输出格式：优先补丁(diff)形式或代码块，附带文件路径和上下文，便于直接应用与复核。
- 安全与隐私：避免输出真实密钥、凭证、token，必要时使用占位符或环境变量。
- 交互策略：若有歧义，优先给出默认实现并在需要确认时请求人工确认。
- 生成内容的验证：提供测试/构建/类型检查的验证点，必要时给出可执行命令。
- 版本与回滚：每次变更附带回滚方案和变更日志。
- AI 产出审阅：所有非注释性代码变更应由人类审阅。

附录

- 参考文件：
  - src/utils/createApi.ts
  - src/utils/createStore.ts
  - src/api/index.ts 及各资源 API
  - 组件模板：src/components/ManagePage.vue、src/components/Modal.vue
