import { HomeOutlined, UserOutlined, SettingOutlined, DesktopOutlined,CloudOutlined } from '@ant-design/icons-vue'

// 统一的菜单和路由配置
export interface MenuItem {
  key: string
  path: string
  name: string
  icon: any
  label: string
  title: string
  component: () => Promise<any>
  requiresAuth?: boolean
  // 允许访问的角色列表（为空表示所有角色都可访问）
  allowedRoles?: string[]
}

// 定义所有菜单项
export const menuConfig: MenuItem[] = [
  {
    key: '/',
    path: '',
    name: 'Home',
    icon: HomeOutlined,
    label: '首页',
    title: '首页',
    component: () => import('@/views/Home.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    // 首页所有角色都可访问
  },
  {
    key: '/youding-workbench',
    path: 'youding-workbench',
    name: 'youding-workbench',
    icon: DesktopOutlined,
    label: '优鼎工作台',
    title: '优鼎工作台',
    component: () => import('@/views/accessories-work/YoudingWork.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    // 只有优鼎角色(5293)和管理员(3294)可以访问
    allowedRoles: ['5293', '3294'],
  },
  {
    key: '/gendan-workbench',
    path: 'gendan-workbench',
    name: 'gendan-workbench',
    icon: DesktopOutlined,
    label: '跟单工作台',
    title: '跟单工作台',
    component: () => import('@/views/accessories-work/GendanWork.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    // 只有跟单角色(5555)和管理员(3294)可以访问
    allowedRoles: ['5555', '3294'],
  },
  {
    key: '/factory-workbench',
    path: 'factory-workbench',
    name: 'factory-workbench',
    icon: DesktopOutlined,
    label: '工厂工作台',
    title: '工厂工作台',
    component: () => import('@/views/accessories-work/FactoryWork.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    // 只有工厂角色(7777)和管理员(3294)可以访问
    allowedRoles: ['7777', '3294'],
  },
  {
    key: '/accessories-factory-workbench',
    path: 'accessories-factory-workbench',
    name: 'accessories-factory-workbench',
    icon: DesktopOutlined,
    label: '辅料工厂工作台',
    title: '辅料工厂工作台',
    component: () => import('@/views/accessories-work/AccessoriesFactoryWork.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    // 只有辅料工厂角色(6666)和管理员(3294)可以访问
    allowedRoles: ['6666', '3294'],
  },
  
  {
    key: '/usersManage',
    path: 'usersManage',
    name: 'usersManage',
    icon: UserOutlined,
    label: '用户管理',
    title: '用户管理',
    component: () => import('@/views/usersManage.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    // 只有管理员(3294)可以访问
    allowedRoles: ['3294'],
  },
  {
    key: '/rsDrive',
    path: 'rsDrive',
    name: 'rsDrive',
    icon: CloudOutlined,
    label: '优鼎云盘',
    title: '优鼎云盘',
    component: () => import('@/views/fileDrive.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    allowedRoles: ['3294','5293'],
  },
  {
    key: '/settingsManage',
    path: 'settingsManage',
    name: 'settingsManage',
    icon: SettingOutlined,
    label: '系统设置',
    title: '系统设置',
    component: () => import('@/views/settingsManage.vue').catch(() => import('@/views/NotFound.vue')),
    requiresAuth: true,
    // 只有管理员(3294)可以访问
    allowedRoles: ['3294'],
  },
  
]

// 根据角色过滤菜单项
export function filterMenuByRole(menuItems: MenuItem[], roles: string[]): MenuItem[] {
  if (!roles || roles.length === 0) return menuItems
  
  // 只要包含 3294 就显示全部
  if (roles.includes('3294')) return menuItems
  
  // 只有单一角色时按要求过滤，但始终保留首页 '/'
  if (roles.length === 1) {
    const r = roles[0]
    const allowedKeys = ['/']
    if (r === '5293') allowedKeys.push('/youding-workbench')
    if (r === '6666') allowedKeys.push('/accessories-factory-workbench')
    if (r === '7777') allowedKeys.push('/factory-workbench')
    if (r === '5555') allowedKeys.push('/gendan-workbench')
    return menuItems.filter((item) => allowedKeys.includes(item.key))
  }
  
  // 其它情况默认显示全部
  return menuItems
}

// 将菜单项转换为路由配置
export function menuItemsToRoutes(menuItems: MenuItem[]) {
  return menuItems.map(item => ({
    path: item.path,
    name: item.name,
    component: item.component,
    meta: {
      title: item.title,
      requiresAuth: item.requiresAuth !== false,
      allowedRoles: item.allowedRoles || [],
    },
  }))
}

// 检查用户是否有权限访问指定路由
export function hasPermissionToRoute(routePath: string, userRoles: string[]): boolean {
  const menuItem = menuConfig.find(item => item.path === routePath || item.key === routePath)
  if (!menuItem) return false
  
  // 如果没有设置角色限制，则所有角色都可访问
  if (!menuItem.allowedRoles || menuItem.allowedRoles.length === 0) return true
  
  // 检查用户角色是否在允许的角色列表中
  return userRoles.some(role => menuItem.allowedRoles!.includes(role))
}