<template>
  <div id="layout">
    <el-container style="height: 100vh; border: 1px solid #eee">
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1', '3']">
          <el-submenu index="1">
            <template #title><i class="el-icon-message"></i>综合管理</template>
            <el-menu-item-group>
              <template #title>分组一</template>
              <el-menu-item index="1-1">全部单词</el-menu-item>
              <el-menu-item index="1-2">英译中</el-menu-item>
              <el-menu-item index="1-3">中译英</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template #title><i class="el-icon-menu"></i>用户管理</template>
            <el-menu-item-group>
              <template #title>分组一</template>
              <el-menu-item index="2-1">修改资料</el-menu-item>
              <el-menu-item index="2-2">修改密码</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="2-3">退出登录</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>查看</el-dropdown-item>
                <el-dropdown-item>新增</el-dropdown-item>
                <el-dropdown-item>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>王小虎</span>
        </el-header>

        <el-main>
          <home></home>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Home from "../Home";
export default {
  name: "layout",
  data() {
    const item = {
      date: '2016-05-02',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1518 弄'
    };
    return {
      tableData: Array(20).fill(item)
    }
  },
  components:{
    Home
  }
}
</script>

<style scoped>
  .el-header {
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
  }
</style>