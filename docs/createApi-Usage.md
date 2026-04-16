Usage Guide: createCRUDService (src/utils/createApi.ts)

概览

- createCRUDService(basePath) 提供一个简单的 API 客户端包装，基于统一的 REST 风格后端接口，封装了常用的增删改查、分页、模糊/精确查询等方法。
- 返回值均为 Promise，实际数据需要从 response.data 中取出，字段结构通常为后端约定的 JSON 对象。

可用方法

- 基础 CRUD
  - get(id: number): 查询单条
  - getAll(): 查询全部
  - getPages(page: number, pageSize: number): 分页查询（无条件）
  - getPagesByCondition(page: number, pageSize: number, conditions: Record<string, any>): 条件分页
  - add(data: any): 新增单条
  - addBatch(list: any[]): 批量新增
  - update(data: any): 更新单条，需包含主键，自动从 data.id / data.Id / data.ID / data.userId 解析
  - delete(ids: any[]): 删除，单/批
  - count(): 统计数量

- 查询类
  - queryLike(conditions: Record<string, string>): 模糊查询
  - queryEq(conditions: Record<string, any>): 精确查询

如何使用

```ts
import { createCRUDService } from '@/utils/createApi'

// 假设后端资源路径为 /api/users
const userApi = createCRUDService('/api/users')

// 获取全部
userApi.getAll().then((res) => {
  const data = res.data
  console.log('all users', data)
})

// 获取分页数据
userApi.getPages(1, 10).then((res) => {
  const data = res.data
  console.log('page 1', data)
})

// 按条件分页
userApi.getPagesByCondition(1, 10, { name: '张三' }).then((res) => {
  const data = res.data
  console.log('filtered page', data)
})

// 新增、更新、删除示例
userApi.add({ name: '新用户', email: 'new@example.com' }).then((r) => console.log('added', r.data))
userApi.update({ id: 123, name: '更新名称' }).then((r) => console.log('updated', r.data))
userApi.delete([123]).then((r) => console.log('deleted', r.data))
```

注意事项

- basePath 只包含资源根路径，不含域名和端口；实际请求由 api/index 中的 axios 实例处理。
- update、delete 等操作会依赖后端对主键字段的约定，需要数据对象中包含可识别的主键字段（默认优先取 data.id/Id/ID/userId）。
- 返回值为 AxiosResponse，具体数据结构请参考后端返回，例如 response.data.data、response.data.result 等。
- 生产环境中建议对请求错误进行统一处理与错误提示。

扩展

- 你可以简单地在你的项目中对 createCrudService 进行二次封装，或将不同资源的 basePath 封装成常量，保持代码复用。
