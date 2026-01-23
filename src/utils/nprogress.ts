import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 可选配置
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 50,
  minimum: 0.95,
})

export default NProgress
