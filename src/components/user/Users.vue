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
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email" ></el-table-column>
        <el-table-column label="电话" prop="mobile" ></el-table-column>
        <el-table-column label="角色" prop="role_name" ></el-table-column>
        <el-table-column label="状态" width="200">
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
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
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
          width="50%"
          @close="addDialogClosed"
      >
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
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
        </template>
      </el-dialog>

      <!--      编辑用户信息对话框-->
      <el-dialog
          title="修改用户对话框"
          v-model="editDialogVisible"
          width="50%"
            @close="editDialogClosed"
      >
        <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
          </span>
        </template>
      </el-dialog>

<!--      分配角色对话框-->
      <el-dialog
          title="分配角色"
          v-model="setRoleDialogVisible"
          width="50%"
          @close="setRoleDialogClosed"
          >
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{userInfo.role_name}}</p>
          <p>分配新的角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                  v-for="item in rolesList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    //验证邮箱的校验规则
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 校验通过，表示合法对象
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 校验通过，表示合法对象
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        query: '', //查询参数
        pagenum: 1, //当前页码
        pagesize: 2,//每页显示条数
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名称', trigger: 'blur'},
          {min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入用户密码', trigger: 'blur'},
          {min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入用户邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入用户手机', trigger: 'blur'},
          {min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ],
      },
      editDialogVisible:false,
      editForm:{},
      // 编辑表单的验证对象
      editFormRules:{
        email:[
          {required: true, message: '请输入用户邮箱', trigger: 'blur'},
          {validator:checkEmail,trigger: 'blur'}
        ],
        mobile:[
          {required: true, message: '请输入用户手机', trigger: 'blur'},
          {validator:checkMobile,trigger: 'blur'}
        ]
      },
      setRoleDialogVisible:false,
      userInfo:{},
      // 所有角色的数据列表
      rolesList:[],
      selectedRoleId:''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const {data: res} = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error("用户数据获取失败")
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听switch开关状态的改变
    async userStateChanged(userInfo) {
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error("状态更改失败")
      }
      this.$message.success("状态更新成功~")
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getUserList()
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error("添加用户失败")
        this.$message.success("添加用户成功")
        this.addDialogVisible = false
        await this.getUserList()
      })
    },
    // 展示编辑用户对话框
    async showEditDialog(id) {
      const {data:res}=await this.$http.get('users/'+id)
      if (res.meta.status!==200) return this.$message.error("获取用户数据失败")
      this.editForm=res.data
      this.editDialogVisible=true
    },
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        if (!valid) return
        const {data:res}= await this.$http.put('users/'+this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        })
        if(res.meta.status!==200) return this.$message.error("更新用户信息失败")
        this.editDialogVisible=false
        this.$message.success("更新用户成功")
        await this.getUserList()
      })
    },
    async removeUserById(id){
      const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)

      if (confirmResult!=='confirm'){
        return this.$message.info("已取消删除")
      }
      const {data:res}=await this.$http.delete('users/'+ id)
      if (res.meta.status!==200) return this.$message.error("删除用户失败")
      this.$message.success("删除用户成功")
      await this.getUserList()
    },
    async setRole(userInfo){
      this.userInfo=userInfo
      const {data:res}=await this.$http.get('roles')
      if(res.meta.status!==200) return this.$message.error("获取角色列表失败")
      this.rolesList=res.data
      this.setRoleDialogVisible=true
    },
    // 点击按钮，分配角色
    async saveRoleInfo(){
      if(!this.selectedRoleId) return this.$message.error("请选择要分配的角色")
      const {data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      if(res.meta.status!==200) return this.$message.error("分配新角色失败")
      this.$message.success("分配新角色成功")
      this.setRoleDialogVisible=false
      await this.getUserList()
    },
    setRoleDialogClosed(){
      this.selectedRoleId=''
      this.userInfo={}
    }
  }
}
</script>

<style scoped>
.box-card {
  width: 100%;
}
</style>