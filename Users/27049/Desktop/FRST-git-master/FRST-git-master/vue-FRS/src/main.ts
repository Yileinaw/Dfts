import { createApp } from 'vue'
// import './style.css' // 删除或注释掉这一行
import App from './App.vue'
import router from './router'
import pinia from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/base.scss'

// Remove conditional mock import
/*
if (import.meta.env.DEV) {
    import('./mock').then(() => {
        console.log('Mock service started in development mode.');
    }).catch((error) => {
        console.error('Error starting mock service:', error);
    });
}
*/
// -----------------------------------------------------

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
