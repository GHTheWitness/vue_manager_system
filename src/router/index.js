import { createRouter, createWebHistory } from 'vue-router'
import Login from "../components/Login";
import Home from "../views/Home";
import Welcome from "../components/Welcome";
import Users from "../components/user/Users";
import Rights from "../components/power/Rights";
import Roles from "../components/power/Roles";
import Cate from "../components/goods/Cate";
import Params from "../components/goods/Params";

const routes = [
  {
    path: '/',
    redirect:'/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    redirect: '/welcome',
    children:[
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Cate},
      {path:'/params',component:Params},
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 导航守位,to将要访问的路径，from代表从哪个路径跳转而来,next是一个函数表示放行
router.beforeEach((to,from,next)=>{
  if (to.path === '/login') return next()
  // 获取登录后存放的token值
  const tokenStr=window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
