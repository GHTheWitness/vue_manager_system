<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false">
    </el-alert>
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <el-cascader style="width: 50%"
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
            clearable></el-cascader>
      </el-col>
    </el-row>

<!--    tab页签区域-->
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled"
        @click="addDialogVisible=true">添加参数</el-button>
        <el-table :data="manyTableData" border stripe>
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template v-slot:default="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteAb(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                   @click="addDialogVisible=true">添加属性</el-button>
        <el-table :data="onlyTableData" border stripe>
          <el-table-column type="expand"></el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template v-slot:default="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>

  <el-dialog
      :title="'添加'+titleText"
      v-model="addDialogVisible"
      width="50%" @close="addDialogClosed">
    <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="addForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addParams">确 定</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "Params",
  data(){
    return{
      catelist:[],
      cateProps:{
        expandTrigger:'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      selectedCateKeys:[],
      // 默认被激活的页签
      activeName:'many',
      // 动态参数数据
      manyTableData:[],
      // 静态参数数据
      onlyTableData:[],
      addDialogVisible:false,
      addForm:{
        attr_name:''
      },
      addFormRules:{
        attr_name: [
          {required:true,message:'请输入参数名称',trigger:'blur'}
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods:{
    async getCateList(){
      const {data:res}=await this.$http.get('categories')
      if(res.meta.status!==200) return this.$message.error("获取分类列表失败")
      this.catelist=res.data
    },
    handleChange(){
      this.getParamsData()
    },
    handleTabClick(){
      this.getParamsData()
    },
    async getParamsData(){
      // 需求：必须选中三级分类以上
      if (this.selectedCateKeys!==null){
        // 证明选中不是三级分类
        if (this.selectedCateKeys.length!==3)this.selectedCateKeys=[]

        const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{
          params:{sel:this.activeName}
        })
        if(res.meta.status!==200) return this.$message.error("获取参数失败")
        if(this.activeName==='many'){
          this.manyTableData=res.data
        }else{
          this.onlyTableData=res.data
        }
      }
    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    addParams(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res}=await this.$http.post(`categories/${this.cateId}/attributes`,{
          attr_name:this.addForm.attr_name,
          attr_sel:this.activeName
        })
        if(res.meta.status!==201) return this.$message.error("添加参数失败")
        this.$message.success("添加参数成功")
        this.addDialogVisible=false
        await this.getParamsData()
      })
    },
    async deleteAb(id){
      const confirmResult=await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      if (confirmResult!=='confirm')return this.$message.info("已取消删除")

      const {data:res}=await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status!==200) return this.$message.error("删除属性失败")
      this.$message.success("删除属性成功")
      await this.getParamsData()
    }
  },
  computed:{
    isBtnDisabled(){
      if(this.selectedCateKeys!==null){
        return this.selectedCateKeys.length !== 3;
      }else {
        return true
      }
    },
    cateId(){
      if(this.selectedCateKeys!==null){
        if(this.selectedCateKeys.length===3){
          return this.selectedCateKeys[2]
        }
        return null
      }else {
        return null
      }
    },
    titleText(){
      return this.activeName==='many'?'动态属性':'静态属性'
    }
  }
}
</script>

<style scoped>
  .cat_opt{
    margin: 15px 0;
  }
</style>