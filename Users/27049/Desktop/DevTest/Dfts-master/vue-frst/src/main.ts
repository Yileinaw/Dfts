import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus) // 注册 Element Plus

app.mount('#app')

// --- Remove debugging line ---
// console.log('Registered Routes:', router.getRoutes());
// --- End debugging line ---
