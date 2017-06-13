<template>
  <div id="app">
    <el-row>
      <el-col :span="24">
        <el-button icon="plus" @click="createNode">新增菜单</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-tree :data="treelist" node-key="id" ref="tree" highlight-current :props="defaultProps" :render-content="renderContent">
        </el-tree>
      </el-col>
    </el-row>
    <el-dialog title="菜单" :visible.sync="dialogFormVisible" @close="initForm">
      <el-form ref="menuForm" :rules="formRules" label-position="right" label-width="120px" :model="form">
        <el-form-item v-show="!isEdit" label="父节点">
          <el-switch v-model="form.isParent" on-text="是" off-text="否"></el-switch>
        </el-form-item>
        <el-form-item label="父菜单" v-show="checkLeaf" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择">
            <el-option v-for="item in parentOptions" :disabled="form.id===item.id" :key="item.id" :label="item.label" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义编码" prop="codeInput" required v-show='isParent && !isEdit'>
          <el-input v-model="form.codeInput"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="codeSelect" required v-show='!isParent && !isEdit'>
          <el-select v-model="form.codeSelect" placeholder="请选择">
            <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="label" required>
          <el-input v-model="form.label"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon"></el-input>
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
    var validateCodeInput = (rule, value, callback) => {
      if (this.isParent && !this.isEdit && value === '') {
        callback(new Error('请输入自定义编码'));
      } else {
        callback();
      }
    };
    var validateCodeSelect = (rule, value, callback) => {
      if (!this.isParent && !this.isEdit && value === '') {
        callback(new Error('请选择编码'));
      } else {
        callback();
      }
    };
    return {
      treelist: [],
      defaultProps: {
        children: 'nodes',
        label: 'label'
      },
      dialogFormVisible: false,
      isEdit: false,
      currentData: null,
      codeSelect: '',
      codeInput: '',
      form: {
        isParent: true,
        id: '',
        code: '',
        codeInput: '',
        codeSelect: '',
        icon: '',
        label: '',
        parentId: '',
      },
      formRules: {
        'label': [
          { required: true, message: '请输入菜单名称', trigger: 'blur' }
        ],
        'codeInput': [
          { validator: validateCodeInput, trigger: 'change' }
        ],
        'codeSelect': [
          { validator: validateCodeSelect, trigger: 'change' }
        ]
      },
      parentOptions: [],
      codeOptions: []
    }
  },
  computed: {
    checkCodeField: function () {
      return this.isParent && !this.isEdit
    },
    checkLeaf: function () {
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
      code = '',
      icon = '',
      label = '',
      parentId = ''
    } = {}, isEdit = false, isParent = true) {
      this.$refs['menuForm'] && this.$refs['menuForm'].resetFields();
      this.isParent = isParent;
      this.isEdit = isEdit;
      this.form.id = id;
      this.form.codeInput = code;
      this.form.codeSelect = code;
      this.form.icon = icon;
      this.form.label = label;
      this.form.parentId = parentId;
    },
    submitForm() {
      this.$refs['menuForm'].validate((valid) => {
        if (valid) {
          let _code = this.isParent ? this.form.codeInput : this.form.codeSelect;
          let _promise = this.isEdit ? Api.menu_edit({
            id: this.form.id,
            code: _code,
            icon: this.form.icon,
            label: this.form.label,
            parentId: this.form.parentId
          }) : Api.menu_add({
            code: _code,
            icon: this.form.icon,
            label: this.form.label,
            parentId: this.form.parentId
          })

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
              this.initCode();
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
      Api.menu_options_parent()
        .then(res => {
          this.parentOptions = res.data;
        });
    },
    initCode() {
      Api.menu_options_code()
        .then(res => {
          this.codeOptions = res.data;
        });
    },
    /* Tree */
    initTree() { // 初始化 Tree 组件
      Api.menu_list()
        .then(res => {
          this.treelist = res.data;
        });
    },
    createNode() { // 创建节点
      this.isEdit = false;
      this.openDialog();
    },
    modifyNode(store, data) { // 修改节点
      console.log(data);
      this.isEdit = true;
      this.initForm(data, this.isEdit);
      this.openDialog();
    },
    removeNode(store, data) { // 删除节点
      let promise_confirm = this.$confirm('将删除该节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      let promise_remove = Api.menu_delete({
        'menuId': data.id
      });
      Promise.all([promise_confirm, promise_remove])
        .then(([resConfirm, resRemove]) => {
          if (resRemove.code == '1') {
            store.remove(data);
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
    this.initCode();
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
