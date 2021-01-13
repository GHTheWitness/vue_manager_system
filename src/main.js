import { createApp } from 'vue'
import App from "./App";
import router from './router'
import store from './store'
import ElementPlus from 'element-plus';
import {ElMessage} from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import axios from 'axios'
import './assets/css/base.css'

axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  console.log(config,"-------------")
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})

const app=createApp(App)
app.use(ElementPlus).use(store).use(router).mount('#app')
app.config.globalProperties.$http=axios
app.config.globalProperties.$message=ElMessage