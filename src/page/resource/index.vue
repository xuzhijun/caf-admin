<template>
  <div id="app">
    <el-row>
      <el-col :span="24" class="title">
        <span>资源</span>
        <el-button-group>
          <el-button type="primary" @click="createNode">新增</el-button>
          <el-button type="primary" :disabled="isModify" @click="modifyNode">修改</el-button>
          <el-button type="primary" :disabled="isRemove" @click="removeNode">删除</el-button>
        </el-button-group>
      </el-col>
      <el-col :span="24" class="content">
        <el-tree :data="treelist" empty-text="加载中..." node-key="id" ref="tree" highlight-current :props="defaultProps" :expand-on-click-node="false" @current-change="setCurrentChange" :render-content="renderContent"></el-tree>
      </el-col>
    </el-row>
    <el-dialog ref="resourceDialog" :title="dialogTitle" :visible.sync="dialogFormVisible" @close="initForm">
      <el-form ref="resourceForm" :rules="formRules" label-position="right" label-width="80px" :model="form">
        <el-form-item label="类型" required prop="type">
          <el-select v-model="form.type" placeholder="请选择" @change="initParent">
            <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父菜单" prop="parentId" v-show="isLeaf">
          <el-select v-model="form.parentId" placeholder="请选择">
            <el-option v-for="item in parentOptions" :disabled="form.id===item.id" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="编码" prop="code" required>
          <el-input v-model="form.code"></el-input>
        </el-form-item>
        <el-form-item label="资源名称" prop="name" required>
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="URL" prop="url" v-if="form.type!='NODE'">
          <el-input v-model="form.url"></el-input>
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
        type: '',
        parentId: '',
        code: '',
        name: '',
        url: ''
      },
      formRules: {
        'type': [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        'code': [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        'name': [
          { required: true, message: '请输入资源名称', trigger: 'blur' }
        ],
        'url': [
          { required: true, message: '请输入URL', trigger: 'blur' }
        ]
      },
      typeOptions: [
        { id: 'NODE', name: 'NODE' },
        { id: 'MENU', name: 'MENU' },
        { id: 'URL', name: 'URL' },
        { id: 'AJAX', name: 'AJAX' }
      ],
      parentOptions: []
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
    /*Form */
    initForm({ // 初始化表单
      id = '',
      type = '',
      parentId = '',
      code = '',
      name = '',
      url = ''
    } = {}) {
      this.$refs['resourceForm'] && this.$refs['resourceForm'].resetFields();
      this.form.id = id;
      this.form.code = code;
      this.form.type = type;
      this.form.name = name;
      this.form.parentId = parentId;
      this.form.url = url;

      this.initParent(type);
    },
    submitForm() { // 验证和提交表单
      this.$refs['resourceForm'].validate((valid) => {

        if (valid) {
          let _promise = this.isEdit ? Api.resource_edit({
            'id': this.form.id,
            'type': this.form.type,
            'parentId': this.form.parentId,
            'code': this.form.code,
            'name': this.form.name,
            'url': this.form.url
          }) : Api.resource_add({
            'type': this.form.type,
            'parentId': this.form.parentId,
            'code': this.form.code,
            'name': this.form.name,
            'url': this.form.url
          });
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
            .then(res => {
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
    initParent(type = '') { // 初始化父菜单选项
      if (type) {
        let _type = type == 'AJAX' ? 'AJAX' : 'NODE';

        Api.resource_options_parent({
          type: _type
        })
          .then(res => {
            // console.log(res);
            this.parentOptions = res.data;
          })
          .catch(err => {
            // console.log(err);
          });
      } else {
        this.parentOptions = [];
      }
    },
    /* Tree */
    initTree() { // 初始化 Tree 组件
      Api.resource_list()
        .then(res => {
          this.treelist = res.data;
        })
        .catch(err => {
          // console.log(err)
          // 加载树失败
        });
    },
    createNode() { // 创建节点
      this.isEdit = false;
      this.openDialog();
    },
    modifyNode() { // 修改节点
      this.isEdit = true;
      this.initForm(this.currentData);
      this.openDialog();
    },
    removeNode() { // 删除节点
      this.$confirm('将删除该节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(resConfirm => {
          // console.log(resConfirm);
          if (resConfirm == 'confirm') {
            return Api.resource_delete({
              'FunctionId': this.currentData.id
            });
          }
        })
        .then(resRemove => {
          // console.log(resRemove);
          if (resRemove.code == '1') {
            this.$refs.tree.store.remove(this.currentData);
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
  computed: {
    dialogTitle: function () { // 动态 Dialog 标题
      return this.isEdit ? '修改资源' : '新增资源'
    },
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
