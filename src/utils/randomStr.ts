// 生成随机名称
export const generateName = (): string => {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 6)
  } catch (e) {
    return Math.random().toString(36).slice(2, 8)
  }
}
