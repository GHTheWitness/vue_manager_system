<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

<!--      表格-->
      <a-table style="margin-top: 10px" :columns="columns" :data-source="catelist" :pagination="false" :rowKey="record=>record.cat_id" bordered>
        <template #isok="scope">
          <i class="el-icon-success" v-if="scope.record.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: lightcoral"></i>
        </template>
        <template #order="scope">
          <el-tag size="mini" v-if="scope.record.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.record.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template #opt="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </a-table>

<!--      分页-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
<!--    添加分类的对话框-->
    <el-dialog
        title="添加分类"
        v-model="addCateDialogVisible"
        width="50%" @close="addCateDialogClosed"
       >
      <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_name">
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged" clearable style="width: 100%"

          ></el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="addCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
const columns = [
  {
    title: '分类名称',
    dataIndex: 'cat_name',
    key:'cat_name'
  },
  {
    title: '是否有效',
    dataIndex:'isok',
    slots:{ customRender: 'isok' }
  },
  {
    title: '排序',
    dataIndex:'order',
    slots:{ customRender: 'order' }
  },
  {
    title: '操作',
    dataIndex:'opt',
    slots:{ customRender: 'opt' }
  },
];
export default {
  name: "Cate",
  data(){
    return{
      queryInfo:{
        type:3,
        pagenum:1,
        pagesize:5
      },
      // 商品分类的数据列表
      catelist:[],
      total:0,
      columns,
      index:0,
      addCateDialogVisible:false,
      addCateForm:{
        cat_name:'',

        // 默认等级 1级分类
        cat_pid:0,
        cat_level:0
      },
      addCateFormRules:{
        cat_name:[
          {required:true,message:"请输入分类名称",trigger:'blur'}
        ]
      },
      parentCateList:[],
      cascaderProps:{
        checkStrictly: true,
        expandTrigger: 'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      selectedKeys:[]
    }
  },
  created() {
    this.getCateList()
  },
  methods:{
    async getCateList(){
      const {data:res}=await this.$http.get('categories',{params:this.queryInfo})
      if(res.meta.status!==200) return this.$message.error("获取商品分类失败")
      this.catelist=res.data.result
      this.total=res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getCateList()
    },
    // 监听page页码值
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getCateList()
    },
    showAddCateDialog(){
      this.getParentCateList()
      this.addCateDialogVisible=true
    },
    async getParentCateList(){
      const {data:res}=await this.$http.get('categories',{
        params:{type:2}
      })
      if(res.meta.status!==200)return this.$message.error("获取父级分类数据失败")
      this.parentCateList=res.data
    },
    parentCateChanged(){
      if ( this.selectedKeys !== null){
        // 父级分类的ID
        this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
        // 当前分类的等级赋值
        this.addCateForm.cat_level=this.selectedKeys.length
      }else {
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
      }
    },
    // 点击按钮添加新的分类
    addCate(){
      this.$refs.addCateFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res}=await this.$http.post('categories',this.addCateForm)
        if(res.meta.status!==201) return this.$message.error("添加分类失败")
        this.$message.success("添加分类成功")
        await this.getCateList()
        this.addCateDialogVisible=false
      })
    },
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys=[]
      this.addCateForm.cat_pid=0
      this.addCateForm.cat_level=0
    }
  }
}
</script>

<style scoped>
  .el-cascader{
    width: 100% !important;
  }
</style>