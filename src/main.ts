import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { appConfig } from './config'

const app = createApp(App)

// 设置浏览器标签标题
document.title = appConfig.browserTitle

app.use(createPinia())
app.use(router)

app.mount('#app')
