<template>
<!--    临时学习登录接口 https://www.liulongbin.top:8888/api/private/v1/-->
    <el-container style="height: 100%;">
<!--      头部-->
      <el-header>
        <div>
          <img src="../assets/img/logo.svg" alt="" width="50" height="50">
          <span>电商管理系统</span>
        </div>
        <el-button type="info" @click="loginout">退出</el-button>
      </el-header>
      <el-container>
<!--        左侧栏-->
        <el-aside :width="isCollapse ?'64px':'200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
<!--          侧边栏菜单-->
          <el-menu
              :default-active="activePath"
              :router="true"
              :collapse="isCollapse"
              :collapse-transition="false"
              :unique-opened="true"
              background-color="#333744"
              text-color="#fff"
              active-text-color="#409bff">
<!--            一级菜单-->
            <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
<!--              一级菜单模板-->
              <template #title>
<!--                图标-->
                <i :class="iconsObj[item.id]"></i>
<!--                文本-->
                <span class="icon-font">{{item.authName}}</span>
              </template>
<!--              二级菜单-->
              <el-menu-item :index="'/'+subItem.path+''" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path+'')">
                <template #title>
                  <!--图标-->
                  <i class="el-icon-menu"></i>
                  <!--文本-->
                  <span class="icon-font">{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
<!--        右侧栏-->
        <el-main>
<!--          路由占位符-->
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  name: 'Home',
  created() {
    this.getMenuList()
    this.activePath=window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      menuList:[],
      iconsObj:{
        '125':'el-icon-s-custom',
        '103':'el-icon-s-promotion',
        '101':'el-icon-s-platform',
        '102':'el-icon-umbrella',
        '145':'el-icon-reading'
      },
      isCollapse:false,
      activePath:''
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    loginout(){
      window.sessionStorage.clear()
      this.$message.info("用户已退出")
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList(){
      const {data:res}=await this.$http.get('menus')
      if (res.meta.status!==200) return this.$message.error(res.meta.msg)
      this.menuList=res.data
    },
    // 点击按钮切换菜单折叠与展开
    toggleCollapse(){
      this.isCollapse=!this.isCollapse
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #ffffff;
    font-size: 20px;
    >div{
      display: flex;
      align-items: center;
      span{
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right: 0;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .icon-font{
    margin-left: 10px;
  }
  .toggle-button{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
</style>