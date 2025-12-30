import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 可选配置
NProgress.configure({
  showSpinner: false, // 右上角小圈圈
  trickleSpeed: 200,
  minimum: 0.1,
})

export default NProgress
