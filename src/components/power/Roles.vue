<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
      </el-col>
    </el-row>
    <el-table :data="rolelist" border stripe width="100%">
      <el-table-column type="expand">
        <template v-slot:default="scope">
          <el-row :class="['bd-bottom',i1===0?'bd-top':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
<!--            一级权限-->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">
                {{item1.authName}}
              </el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
<!--            二级权限-->
            <el-col :span="19">
              <el-row :class="[i2===0?'':'bd-top']" v-for="(item2,i2) in item1.children" :key="item2.id">
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id"
                          closable @close="removeRightById(scope.row,item3.id)">
                    {{item3.authName}}
                  </el-tag>

                </el-col>
                <el-col></el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="300">
        <template v-slot:default="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showRightDialog(scope.row)">分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog
      title="添加角色"
      v-model="addRoleDialogVisible"
      width="50%"
     >
    <el-form ref="addFormRef" :model="addForm" label-width="80px">
      <el-form-item label="角色名称">
        <el-input v-model="addForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input v-model="addForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="addRoleDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addRole">确 定</el-button>
    </span>
    </template>
  </el-dialog>

  <el-dialog title="分配权限" v-model="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
    <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all
    :default-checked-keys="defKeys" ref="treeRef"></el-tree>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "Roles",
  data(){
    return {
      addRoleDialogVisible:false,
      addForm:{
        roleName:'',
        roleDesc:''
      },
      rolelist:[],
      setRightDialogVisible:false,
      rightslist:[],
      // 树形控件属性绑定对象
      treeProps:{
        children:'children',
        label:'authName'
      },
      // 默认选中树形属性ID值
      defKeys:[],
      roleId:''
    }
  },
  created() {
    this.getRolesList()
  },
  methods:{
    addRole(){
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error("添加角色失败")
        this.$message.success("添加角色成功")
        this.addRoleDialogVisible = false
        await this.getRolesList()
      })
    },
    async deleteRole(id){
      const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      if (confirmResult!=='confirm'){
        return this.$message.info("已取消删除")
      }
      const {data:res}=await this.$http.delete(`roles/`+id)
      if(res.meta.status!==200) return this.$message.error("删除角色失败")
      this.$message.success("删除角色成功")
      await this.getRolesList()
    },
    async getRolesList(){
      const {data:res} = await this.$http.get('roles')
      if (res.meta.status!==200) return this.$message.error("获取角色列表失败")
      this.rolelist=res.data
    },
    async removeRightById(role,rightId){
      const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      if(confirmResult!=='confirm') return this.$message.info("取消了删除")
      const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status!==200)return this.$message.error("删除权限失败")
      role.children=res.data
    },
    async showRightDialog(role){
      this.roleId=role.id
      const {data:res}=await this.$http.get('rights/tree')
      if(res.meta.status!==200) return this.$message.error("获取权限数据失败")
      this.rightslist=res.data
      this.getLeafKey(role,this.defKeys)
      this.setRightDialogVisible=true
    },
    // 递归获取所有三级节点
    getLeafKey(node,arr){
      console.log(node)
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item=>this.getLeafKey(item,arr))
    },
    setRightDialogClosed(){
      this.defKeys=[]
    },
    async allotRights(){
      const keys=[
          ...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr=keys.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status!==200) return this.$message.error("权限更新失败")
      this.$message.success("分配权限成功")
      await this.getRolesList()
      this.setRightDialogVisible=false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 7px;
  }
  .bd-top{
    border-top: 1px solid #eee;
  }
  .bd-bottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>