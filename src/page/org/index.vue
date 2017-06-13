<template>
  <div id="app">
    <el-row>
      <el-col :span="24">
        <el-button icon="plus" @click="createNode">新增机构</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-tree :data="treelist" node-key="id" ref="tree" highlight-current :props="defaultProps" :render-content="renderContent">
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
          <el-select v-model="form.parentId" placeholder="请选择">
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
      isLeaf: true,
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
    } = {}, isEdit = false, isLeaf = true) {
      this.$refs['orgForm'] && this.$refs['orgForm'].resetFields();
      this.isEdit = isEdit;
      this.isLeaf = isLeaf;
      this.form.id = id;
      this.form.parentId = parentId;
      this.form.name = name;
      this.form.code = code;
    },
    submitForm() { // 提交表单
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
            .then(res => {
              this.initTree();
              this.initParent();
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
    initParent() {
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
      this.openDialog();
    },
    modifyNode(store, data) { // 修改节点
      this.isEdit = true;
      this.initForm(data, this.isEdit, data.leaf);
      this.openDialog();
    },
    removeNode(store, data) { // 删除节点
      Api.org_delete({
        'OrgId': data.id
      })
        .then(res => {
          // console.log(res);
          if (res.code == '1') {
            store.remove(data);
            this.$message({
              type: 'success',
              message: res.message
            });
          } else {
            throw new Error(res.message);
          }
        })
        .catch(err => {
          // error code
          this.$message({
            type: 'info',
            message: err.message
          });
        });
    },
    renderContent(h, { node, data, store }) { // 渲染节点内容
      return (
        <span>
          <span>{node.label}</span>
          <span style="float: right; margin-right: 20px">
            <el-button icon="edit" size="mini" on-click={() => this.modifyNode(store, data)}>修改</el-button>
            <el-button v-show={node.isLeaf} icon="delete" size="mini" on-click={() => this.removeNode(store, data)}>删除</el-button>
          </span>
        </span>);
    }
  },
  mounted() {
    this.initTree();
    this.initParent();
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
</style>
