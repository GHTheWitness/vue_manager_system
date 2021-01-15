<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <template #append>
              <el-button icon="el-icon-search" @click="getUserList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe width="100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username" ></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="scope">
            <el-switch
                @change="userStateChanged(scope.row)"
                v-model="scope.row.mg_state"
                active-color="#13ce66"
                inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot:default="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>

<!--      添加用户对话框-->
      <el-dialog
          title="添加用户"
          v-model="addDialogVisible"
          width="50%">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
        </span>
        </template>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
export default {
  name: "Users",
  data(){
    return {
      queryInfo:{
        query:'', //查询参数
        pagenum:1, //当前页码
        pagesize:2,//每页显示条数
      },
      userList:[],
      total:0,
      addDialogVisible:false,
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      addFormRules:{
        username:[
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password:[
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        email:[
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
        ],
        mobile:[
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods:{
    async getUserList(){
      const {data:res}=await this.$http.get('users',{
        params:this.queryInfo
      })
      if (res.meta.status!==200) return this.$message.error("用户数据获取失败")
      this.userList=res.data.users
      this.total=res.data.total
    },
    // 监听switch开关状态的改变
    async userStateChanged(userInfo){
      const {data:res}= await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status!==200){
        userInfo.mg_state=!userInfo.mg_state
        return this.$message.error("状态更改失败")
      }
      this.$message.success("状态更新成功~")
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize=newSize
      this.getUserList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum=newNum
      this.getUserList()
    }
  }
}
</script>

<style scoped>
.box-card {
  width: 100%;
}
</style>