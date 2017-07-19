<template>
  <div id="app">
    <el-row>
      <el-col :span="24" class="title">
        <span>机构</span>
        <el-button-group>
          <el-button type="primary" @click="createNode">新增</el-button>
          <el-button type="primary" :disabled="isModify" @click="modifyNode">修改</el-button>
          <el-button type="primary" :disabled="isRemove" @click="removeNode">删除</el-button>
        </el-button-group>
      </el-col>
      <el-col :span="24" class="content">
        <el-tree :data="treelist" node-key="id" ref="tree" highlight-current :props="defaultProps" :render-content="renderContent" :expand-on-click-node="false" @current-change="setCurrentChange">
        </el-tree>
      </el-col>
    </el-row>
    <el-dialog title="机构" :visible.sync="dialogFormVisible" @close="initForm">
      <el-form ref="orgForm" :rules="formRules" label-position="right" label-width="120px" :model="form">
        <el-form-item label="编码" prop="code" required v-show='!isEdit'>
          <el-input v-model="form.code"></el-input>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name" required>
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="父机构" prop="parentId" v-show="isLeaf">
          <el-select clearable filterable v-model="form.parentId" placeholder="请选择">
            <el-option v-for="item in parentOptions" :disabled="form.id===item.id" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Api from '../../api'
export default {
  data() {
    return {
      treelist: [],
      defaultProps: {
        children: 'nodes',
        label: 'name'
      },
      dialogFormVisible: false,
      isEdit: false,
      currentData: null,
      form: {
        id: '',
        code: '',
        name: '',
        parentId: ''
      },
      formRules: {
        'code': [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        'name': [
          { required: true, message: '请输入菜单名称', trigger: 'blur' }
        ]
      },
      parentOptions: []
    }
  },
  computed: {
    isModify: function () { // 修改按钮状态
      return this.currentData == null;
    },
    isRemove: function () { // 删除按钮状态
      return !(this.currentData && this.currentData.leaf)
    },
    isLeaf: function () { // 新增状态，或者编辑状态下的叶子节点，可以显示父菜单下拉框
      return !this.isEdit || (this.isEdit && this.currentData.leaf)
    }
  },
  methods: {
    /* Dialog */
    openDialog() {
      this.dialogFormVisible = true;
    },
    closeDialog() {
      this.dialogFormVisible = false;
    },
    /* Form */
    initForm({ // 初始化表单
      id = '',
      parentId = '',
      name = '',
      code = ''
    } = {}, isEdit = false) {
      this.$refs['orgForm'] && this.$refs['orgForm'].resetFields();
      this.isEdit = isEdit;
      this.form.id = id;
      this.form.parentId = parentId;
      this.form.name = name;
      this.form.code = code;
      
      this.initParent();
    },
    submitForm() {  // 提交表单
      this.$refs['orgForm'].validate((valid) => {
        if (valid) {
          let _promise = this.isEdit ? Api.org_edit(this.form) : Api.org_add(this.form);
          _promise
            .then(res => {
              // console.log(res);
              if (res.code == '1') {
                this.$message({
                  type: 'success',
                  message: res.message
                });
                this.closeDialog();
              } else {
                throw new Error(res.message);
              }
            })
            .then(res => {  // 刷新树
              this.initTree();
            })
            .catch(err => {
              // error code
              this.$message({
                type: 'info',
                message: err.message
              });
            });
        }
      });
    },
    initParent() {  // 请求父菜单数据
      Api.org_options_parent()
        .then(res => {
          this.parentOptions = res.data;
        });
    },
    /* Tree */
    initTree() { // 初始化 Tree 组件
      Api.org_list()
        .then(res => {
          this.treelist = res.data;
        });
    },
    createNode() { // 创建节点
      this.isEdit = false;
      this.initForm();
      this.openDialog();
    },
    modifyNode() { // 修改节点
      this.isEdit = true;
      this.initForm(this.currentData, this.isEdit);
      this.openDialog();
    },
    removeNode() { // 删除节点
      this.$confirm('将删除该节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(resConfirm => {
          if (resConfirm == 'confirm') {
            return Api.org_delete({
              'OrgId': this.currentData.id
            });
          }
        })
        .then(resRemove => {
          if (resRemove.code == '1') {
            // this.$refs.tree.store.remove(this.currentData);
            this.initTree();
            this.currentData = null;
            this.$message({
              type: 'success',
              message: resRemove.message
            });
          } else {
            throw new Error(resRemove.message);
          }
        })
        .catch(err => {
          let message = err == 'cancel' ? '取消删除' : err.message;
          this.$message({
            type: 'info',
            message: message
          });
        });
    },
    setCurrentChange(data) {
      this.currentData = data;
    },
    renderContent(h, { node, data, store }) { // 渲染节点内容
      return (<span>{node.label}</span>);
      // return (
      //   <span>
      //     <span>{node.label}</span>
      //     <span style="float: right; margin-right: 20px">
      //       <el-button icon="edit" size="mini" on-click={() => this.modifyNode(store, data)}>修改</el-button>
      //       <el-button v-show={node.isLeaf} icon="delete" size="mini" on-click={() => this.removeNode(store, data)}>删除</el-button>
      //     </span>
      //   </span>);
    }
  },
  mounted() {
    this.initTree();
  }
}
</script>

<style lang="scss">
body {
  font-family: Helvetica, sans-serif;
}

.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

.el-form .el-select {
  display: block;
}

.el-col {
  &.title {
    display: flex;
    padding: 10px 0;
    align-items: center;
    span {
      flex-grow: 1;
    }
    .el-button-group {
      float: right;
    }
  }
}
</style>
