<template>
  <div id="app">
    <el-row>
      <el-col :span="24" class="title">
        <span>菜单</span>
        <el-button-group>
          <el-button type="primary" @click="createNode">新增</el-button>
          <el-button type="primary" :disabled="isModify" @click="modifyNode">修改</el-button>
          <el-button type="primary" :disabled="isRemove" @click="removeNode">删除</el-button>
        </el-button-group>
      </el-col>
      <el-col :span="24" class="content">
        <el-tree v-loading="loading" :data="treelist" node-key="id" ref="tree" highlight-current :props="defaultProps" :render-content="renderContent" @current-change="setCurrentChange">
        </el-tree>
      </el-col>
    </el-row>
    <el-dialog title="菜单" :visible.sync="dialogFormVisible">
      <el-form ref="menuForm" :rules="formRules" label-position="right" label-width="120px" :model="form">
        <el-form-item v-show="!isEdit" label="父节点">
          <el-switch v-model="form.isParent" on-text="是" off-text="否"></el-switch>
        </el-form-item>
        <el-form-item label="父菜单" v-show="isLeaf" prop="parentId">
          <el-select clearable filterable v-model="form.parentId" placeholder="请选择">
            <el-option v-for="item in parentOptions" :disabled="form.id===item.id" :key="item.id" :label="item.label" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义编码" prop="codeInput" required v-if='!isEdit && form.isParent'>
          <el-input v-model="form.codeInput"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="codeSelect" required v-if='!isEdit && !form.isParent'>
          <el-select clearable filterable v-model="form.codeSelect" placeholder="请选择">
            <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="label" required>
          <el-input v-model="form.label"></el-input>
        </el-form-item>
        <el-form-item label="排序数" prop="menuSort">
          <el-input v-model.number="form.menuSort" placeholder="请输入 1-100 之间的整数"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-col :lg="18" :md="16" :sm="12" :xs="24">
            <el-form-item prop="icon">
              <el-input :readonly="true" v-model="form.icon" :icon="icon"></el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="6" :md="8" :sm="12" :xs="24" style="text-align:right;">
            <el-button class="btnSelectIcon" type="primary" icon="menu" @click="openIconList">选择图标</el-button>
          </el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择图标" size="large" :visible.sync="dialogIconsVisible">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="Font-Awesome" name="fa">
          <caf-icons type="fa"></caf-icons>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import Api from '../../api'
import Icons from '../../component/icons/icons.vue'
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
    var checkSort = (rule, value, callback) => {
        if (value!==0 && !value) {
          return callback(new Error('排序数不能为空'));
        }
        setTimeout(() => {
          if (!Number.isInteger(value)) {
            callback(new Error('请输入数字值'));
          } else {
            if (value < 0 || value > 18) {
              callback(new Error('必须在 0-100 之间'));
            } else {
              callback();
            }
          }
        }, 1000);
      };
    return {
      loading: false,
      treelist: [],
      defaultProps: {
        children: 'nodes',
        label: 'label'
      },
      dialogFormVisible: false,
      dialogIconsVisible: false,
      isEdit: false,
      currentData: null,
      activeName: 'fa',
      form: {
        isParent: true,
        menuSort: 0,
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
        'menuSort': [
          { validator: checkSort, trigger: 'blur' }
        ],
        'codeInput': [
          { required: true, message: '请输入自定义编码', trigger: 'blur' }
        ],
        'codeSelect': [
          { required: true, message: '请选择编码', trigger: 'change' }
        ]
      },
      parentOptions: [],
      codeOptions: []
    }
  },
  computed: {
    checkCodeField: function () {
      return this.form.isParent && !this.isEdit
    },
    isModify: function () { // 修改按钮状态
      return this.currentData == null;
    },
    isRemove: function () { // 删除按钮状态
      return !(this.currentData && this.currentData.leaf)
    },
    isLeaf: function () { // 新增状态，或者编辑状态下的叶子节点，可以显示父菜单下拉框
      return !this.isEdit || (this.isEdit && this.currentData.leaf)
    },
    icon: function () {
      this.closeIconList();
      if(this.$store.state.icon!='') {
        this.form.icon = 'fa ' + this.$store.state.icon
      }
      return this.$store.state.icon;
      
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
    openIconList() {
      this.dialogIconsVisible = true
    },
    closeIconList() {
      this.dialogIconsVisible = false
    },
    /* Form */
    initForm({  // 初始化表单
      id = '',
      menuSort = 0,
      code = '',
      icon = '',
      label = '',
      parentId = ''
    } = {}, isEdit = false, isParent = true) {
      // 清空表单数据
      this.$refs['menuForm'] && this.$refs['menuForm'].resetFields();
      this.$store.commit('setIcon','');
      // 设置表单值
      this.isEdit = isEdit;
      this.form.isParent = isParent;
      this.form.id = id;
      this.form.menuSort = menuSort;
      this.form.codeInput = code;
      this.form.codeSelect = code;
      this.form.icon = icon;
      this.form.label = label;
      this.form.parentId = parentId;
      // 初始化下拉框选项
      this.initParent();
      this.initCode();
    },
    submitForm() {  // 验证和提交表单
      this.$refs['menuForm'].validate((valid) => {
        if (valid) {
          let _code = this.form.isParent ? this.form.codeInput : this.form.codeSelect;
          let _promise = this.isEdit ? Api.menu_edit({
            id: this.form.id,
            menuSort: this.form.menuSort,
            code: _code,
            icon: this.form.icon,
            label: this.form.label,
            parentId: this.form.parentId
          }) : Api.menu_add({
            code: _code,
            menuSort: this.form.menuSort,
            icon: this.form.icon,
            label: this.form.label,
            parentId: this.form.parentId
          })
          // 提交表单
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
      Api.menu_options_parent()
        .then(res => {
          this.parentOptions = res.data;
        });
    },
    initCode() {    // 请求编码数据
      Api.menu_options_code()
        .then(res => {
          this.codeOptions = res.data;
        });
    },
    /* Tree */
    initTree() {    // 初始化 Tree 组件
      this.loading = true;
      Api.menu_list()
        .then(res => {
          this.treelist = res.data;
        })
        .then(() => {
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          // console.log(err)
          // 加载树失败
        });
    },
    createNode() {  // 创建节点
      this.isEdit = false;
      this.initForm();
      this.openDialog();
    },
    modifyNode() {  // 修改节点      
      this.isEdit = true;
      this.initForm(this.currentData, this.isEdit);
      this.openDialog();
    },
    removeNode() {  // 删除节点
      this.$confirm('将删除该节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(resConfirm => {
          if (resConfirm == 'confirm') {
            return Api.menu_delete({
              'menuId': this.currentData.id
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
  },
  components: {
    'caf-icons': Icons
  }
}
</script>

<style lang="scss">
body, html, input, textarea, select, button {
  font-family: "Helvetica Neue",Helvetica,"Microsoft YaHei","微软雅黑","PingFang SC","Hiragino Sans GB",Arial,sans-serif;
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
