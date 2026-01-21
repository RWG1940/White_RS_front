import dayjs from 'dayjs'
/**
 * 时间格式化工具
 */

// 格式化时间
export const formatTime = (value: string) => {
  if (!value) {
    return ''
  }
  return dayjs(value).format('YYYY-MM-DD HH:mm')
}
