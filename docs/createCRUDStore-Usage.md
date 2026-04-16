Using createCRUDStore (src/utils/createStore.ts)

简介

- createCRUDStore 是一个工厂函数，用于快速创建一个带有完整 CRUD 能力的 Pinia store。它基于一个简化的后端 API 对象封装，提供数据列表、分页、筛选、搜索、以及批量删除等通用能力，并包装了常见的提示信息。

核心能力

- 列表数据与分页：list、pagedList、total、currentPage、pageSize
- 条件化查询支持：fetchPageByConditions、handleSearch、handleExact 等
- 常用操作：fetchAll、fetchPage、create、update、remove、search、exact、removeSelected 等
- 表格相关辅助：onSelectionChange、handleSearch、handleExact、handleRowDelete 等
- 结果提示：通过 options.successMessage 提供自定义的成功提示

前提条件

- 安装并引入 Pinia，项目中已经配置好了 Pinia，并在组件中通过 useXStore() 形式调用。
- 需要一个实现了下列 API 的对象 api：
  getAll, getPages, getPagesByCondition, add, update, delete, queryLike, queryEq
- 每个方法返回一个对象，通常包含 data -> 具体数据，或嵌套在 data.data / data.result 结构中。

API 约定（api 参数应实现的方法）

- getAll(): Promise<any> 返回全部数据
- getPages(page: number, pageSize: number): Promise<any> 分页数据
- getPagesByCondition(page: number, pageSize: number, conditions: any): Promise<any> 条件分页
- add(item: T): Promise<any> 创建单条记录
- update(item: T): Promise<any> 更新单条记录，通常包含 id 字段
- delete(ids: number[]): Promise<any> 批量删除
- queryLike(conditions: any): Promise<any> 模糊查询
- queryEq(conditions: any): Promise<any> 精确查询

Usage 示例

- 假设我们有一个 User 类型，以及一个对应的后端 API 实现

  ```ts
  // src/types.ts
  export interface User {
    id: number
    name: string
    email: string
  }
  ```

  ```ts
  // src/api/userApi.ts
  import axios from 'axios'
  import type { User } from '@/types'

  export const userApi = {
    getAll: async () => axios.get('/users'),
    getPages: async (page: number, pageSize: number) =>
      axios.get('/users', { params: { page, pageSize } }),
    getPagesByCondition: async (page: number, pageSize: number, cond: any) =>
      axios.post('/users/search', { page, pageSize, ...cond }),
    add: async (data: User) => axios.post('/users', data),
    update: async (data: User) => axios.put(`/users/${data.id}`, data),
    delete: async (ids: number[]) => axios.delete('/users', { data: { ids } }),
    queryLike: async (cond: any) => axios.post('/users/search/like', cond),
    queryEq: async (cond: any) => axios.post('/users/search/eq', cond),
  }
  ```

  ```ts
  // 创建一个 CRUD Store
  import { createCRUDStore } from '@/utils/createStore'
  import { userApi } from '@/api/userApi'
  import type { User } from '@/types'

  export const useUserStore = createCRUDStore<User>('Users', userApi, {
    successMessage: {
      fetch: '获取用户成功',
      create: '创建用户成功',
      update: '更新用户成功',
      delete: '删除用户成功',
      search: '用户搜索完成',
    },
  })
  ```

使用方式（组件内）

- 导入并获取 store 实例
  ```ts
  import { useUserStore } from '@/stores/userStore'
  // 如果使用的是组合式 API，请在 setup 中执行
  const userStore = useUserStore()
  ```
- 基本用法示例

  ```ts
  // 获取当前页数据
  await userStore.fetchPage()
  console.log(userStore.pagedList)

  // 获取全部数据
  await userStore.fetchAll()
  console.log(userStore.list)

  // 创建一个新用户
  await userStore.create({ id: 0, name: '新用户', email: 'new@example.com' } as User)

  // 更新用户
  await userStore.update({ id: 1, name: '更新后名字', email: 'updated@example.com' } as User)

  // 删除选中的用户
  userStore.selectedIds = [1, 2]
  await userStore.removeSelected()
  ```

- 带条件的分页与搜索

  ```ts
  // 设置搜索条件后执行搜索并刷新分页
  await userStore.handleSearch({ name: '张三' })
  // 或仅执行不刷新的搜索
  await userStore.handleSearchN({ name: '张三' })

  // 精确查询
  await userStore.handleExact({ id: '100' })
  ```

注意事项

- storeName 仅用于标识，实际导出的 hook 名称会随你写的变量名而不同，按需命名并在组件中引用。
- api 对象的返回数据结构要尽可能与 unwrapResponse 的解析逻辑兼容，常用结构包括 res.data.result、res.data.data、res.data 等。
- 根据实际后端约定，可能需要对 delete 的调用方式（如 delete 路径、请求体结构）做微调。
- 该工具是面向通用 CRUD 场景设计，若字段结构复杂或需要不同的字段交互，可以在调用处对条件对象进行组装后再传入。

扩展点

- 如果需要添加自定义行为，可在 createStore.ts 内部增加新的方法，或者在你的 api 封装中扩展更多 API 调用并在外部调用。

更多示例与帮助

- 可以把此文档迁移到 docs 目录下的 README.md，或者在项目文档站点中提供 API 约定文档。
