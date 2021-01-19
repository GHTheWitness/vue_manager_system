import { createApp } from 'vue'
import App from "./App";
import router from './router'
import store from './store'
import ElementPlus from 'element-plus';
import {ElMessage,ElMessageBox} from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import axios from 'axios'
import './assets/css/base.css'
import { Table } from "ant-design-vue";
import 'ant-design-vue/dist/antd.css';

// axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
axios.defaults.baseURL='http://120.53.120.229:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})

const app=createApp(App)
app.component('a-table',Table)
app.use(ElementPlus).use(store).use(router).mount('#app')
app.config.globalProperties.$http=axios
app.config.globalProperties.$message=ElMessage
app.config.globalProperties.$confirm=ElMessageBox.confirm