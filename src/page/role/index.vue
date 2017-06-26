<template>
  <div id="app" class="full">
    <el-row :gutter="24" type="flex">
      <el-col :span="10" class="role-list">
        <div class="title">
          <span>角色</span>
        </div>
        <div class="content">
          <el-table stripe border ref="roleTable" :data="role.data" style="width: 100%" highlight-current-row @current-change="roleCurrentChange">
            <el-table-column type="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="code" label="角色编码"></el-table-column>
            <el-table-column prop="name" label="角色名称"></el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="14" class="role-org">
        <div class="title">
          <span>角色名称：{{role.current.name}}</span>
          <el-button :disabled="isRoleActived" type="primary" @click="initFunction">授权</el-button>
        </div>
        <div class="content">
          <el-table stripe border :data="func.table" ref="functionTable" style="width: 100%" highlight-current-row>
            <el-table-column type="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column sortable prop="type" label="类型"></el-table-column>
            <el-table-column sortable prop="parentName" label="父节点"></el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-dialog class="dialog-function" title="授权" size="large" :visible.sync="dialogFunctionVisible">
      <el-row>
        <el-col :span="8" class="role-function">
          <div class="title">
            <span>功能</span>
          </div>
          <div class="content">
            <el-tree v-loading="loading" :data="func.data" node-key="id" ref="functionTree" highlight-current show-checkbox accordion current-node-key="id" :props="func.props" :render-content="renderFunctionContent" :expand-on-click-node="true" @current-change="functionCurrentChange"></el-tree>
          </div>
        </el-col>
        <el-col :span="16" class="role-org">
          <div class="title">
            <span>机构</span>
            <el-button :disabled="checkPermissionBtn" type="primary" size="small" @click="permissionAdd">新增</el-button>
          </div>
          <div class="content">
            <el-table stripe border ref="permissionTable" :data="permissionData" style="width: 100%" highlight-current-row>
              <el-table-column prop="proName" label="属性名"></el-table-column>
              <el-table-column prop="value" label="属性值"></el-table-column>
              <el-table-column label="操作">
                <template scope="scope">
                  <el-button size="small" @click="permissionEdit(scope.$index, scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="permissionDelete(scope.$index, scope.row, permissionData)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
  
      </el-row>
    </el-dialog>
    <el-dialog class="dialog-permission" title="机构" :visible.sync="dialogPermissionVisible" @close="initPermissionForm">
      <el-form ref="permissionForm" :rules="formRules" label-position="right" label-width="120px" :model="permission.current">
        <el-form-item label="属性名" prop="proName">
          <el-input v-model="permission.current.proName"></el-input>
        </el-form-item>
        <el-form-item label="属性值" prop="value">
          <el-input v-model="permission.current.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitPermissionForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Api from '../../api'
import _ from 'lodash'
export default {
  data() {
    return {
      dialogFunctionVisible: false,
      dialogPermissionVisible: false,
      loading: false,
      role: {
        data: [],
        current: {}
      },
      func: {
        table: [],
        data: [],
        dataFlatten: [],
        current: null,
        checked: [],
        props: {
          children: 'functions',
          label: 'name'
        }
      },
      permission: {
        data: [],
        unsave: [],
        delete: [],
        current: {
          'index': '',
          'proName': '',
          'value': ''
        }
      },
      formRules: {
        'proName': [
          { required: true, message: '请输入属性名', trigger: 'blur' }
        ],
        'value': [
          { required: true, message: '请输入属性值', trigger: 'blur' }
        ]
      },
    }
  },
  computed: {
    functionBtn() {
      return !this.role.current;
    },
    checkPermissionBtn() {
      return !this.func.current;
    },
    checkPermissionSave() {
      return !(this.permission.unsave.length || this.permission.delete.length);
    },
    permissionData() {
      return _.concat(this.permission.data, this.permission.unsave);
    },
    isActiveOrg() {
      return this.func.current
    },
    isRoleActived() {
      return !this.role.current
    }
  },
  methods: {
    /* 对话框相关操作 */
    openDialogFunction() {
      this.dialogFunctionVisible = true;
    },
    closeDialogFunction() {
      this.dialogFunctionVisible = false;
    },
    openDialog() {
      this.dialogPermissionVisible = true;
    },
    closeDialog() {
      this.dialogPermissionVisible = false;
    },
    /* 角色 */
    initRole() { // 初始化 角色表
      Api.role_role_list()
        .then(res => {
          this.role.data = res.data;
        })
        .then(res => {
          if (this.role.data.length) {
            this.$refs.roleTable.setCurrentRow(this.role.data[0]);
            this.role.current = this.role.data[0];
          }
        });
    },
    roleCurrentChange(currentRow, oldCurrentRow) {
      if (currentRow && currentRow.id) {
        this.role.current = currentRow;
        this.initFunctionTable(this.role.current.id);
      }

    },
    /* 功能 */
    initFunction(roleId) { // 初始化 function 树
      Api.role_function_list({
        'roleId': roleId
      })
        .then(res => {// 填充 function 数据
          // this.initPermission();
          this.func.current = null;
          this.func.dataFlatten = [];
          this.func.data = res.data;
          this.openDialogFunction();
        })
        .then(() => {
          this.recursionFunction(this.func.data);// 获取 function 中勾选的节点（叶子结点）
        })
        .then(() => {
          this.$refs.functionTree.setCheckedKeys(this.func.checked);
        });
    },
    initFunctionTable(roleId) { // 初始化 function 表
      this.loading = true;
      Api.role_function_list_table({
        'roleId': roleId
      })
        .then(res => {// 填充 function 数据
          this.func.table = res.data;
          this.func.current = null;
          setTimeout(() => {
            this.loading = false;
          }, 500);
        })
        .catch(() => {
          this.loading = false;
        });
    },
    renderFunctionContent(h, { node, data, store }) { // 渲染 功能树的节点内容
      return (<span>{node.label}</span>);
    },
    recursionFunction(list) { // 初始化 功能树的勾选状态
      if ( !list || list.length == 0) {
        return;
      }
      for (let i = 0; i < list.length; i++) {
        list[i].flag && this.func.checked.push(list[i].id);
        this.func.dataFlatten.push({
          "id": list[i].id,
          "roleFunctionId": list[i].roleFunctionId,
          // "leaf": list[i].leaf,
          // "nodes": list[i].nodes,
          "name": list[i].name,
          "flag": list[i].flag,
          "type": list[i].type,
          // "parentId": list[i].parentId,
          // "url": list[i].url,
          // "code": list[i].code,
          // "status": list[i].status,
          "permissionList": list[i].permissionList,
        });
        this.recursionFunction(list[i].functions);
      }
    },
    functionCurrentChange(currentData, currentNode) {
      if (currentData && currentData.id) {
        this.func.current = currentData;
        this.initPermission(this.role.current.id, this.func.current.id);
      }
    },
    functionCheckedSave() { // 保存 功能树的勾选状态
      let _checked = this.$refs.functionTree.getCheckedKeys(true);
      if (this.role.current) {
        Api.role_function_save({
          'roleId': this.role.current.id,
          'functionId': _checked.join(',')
        })
          .then(res => {
            // console.log(res);
            if (res.code == '1') {
              this.$message({
                type: 'success',
                message: res.message
              });
              // this.func.checked = res.data;
              this.func.checked = _checked;
              this.closeDialog();
            } else {
              throw new Error(res.message);
            }
          })
          .catch(err => {
            // error code
            // console.log(err);
            this.$message({
              type: 'info',
              message: err.message
            });
          });
      }
    },
    functionRefresh: _.debounce(function () { // 刷新 功能树
      this.role.current && this.initFunction(this.role.current.id);
    }, 200),
    eventFunciton: function () {

    },
    /* 机构 */
    // 初始化 permission 表
    initPermission(roleId = '', functionId = '') {

      this.permission.data = [];
      this.permission.unsave = [];
      this.permission.delete = [];
      this.permission.current = {
        index: '',
        proName: '',
        value: ''
      };
      this.permission.data = _.find(this.func.dataFlatten, function (o) {
        return o.id == functionId;
      }).permissionList;
      // if (roleId && functionId) { // 不为空则异步请求数据
      //   Api.role_permission_list({
      //     'roleId': roleId,
      //     'functionId': functionId
      //   })
      //     .then(res => {
      //       this.permission.data = res.data;
      //     });
      // }
    },
    initPermissionForm(index = '', { // 初始化表单
      proName = '',
      value = ''
    } = {}) {
      this.$refs['permissionForm'] && this.$refs['permissionForm'].resetFields();
      this.permission.current.index = index;
      this.permission.current.proName = proName;
      this.permission.current.value = value;
    },
    submitPermissionForm() {
      // console.log(this.permission.current.index);
      this.$refs['permissionForm'].validate((valid) => {
        if (valid) {
          if (this.permission.current.index === '') {
            this.permission.data.push({
              'proName': this.permission.current.proName,
              'value': this.permission.current.value
            })
          } else {
            this.permission.data[this.permission.current.index].proName = this.permission.current.proName;
            this.permission.data[this.permission.current.index].value = this.permission.current.value;
          }
          this.closeDialog();
        }
      });

    },
    permissionAdd() {
      this.openDialog();
    },
    permissionEdit(index, row) { // 弹出编辑框
      this.initPermissionForm(index, row);
      this.openDialog();
    },
    permissionDelete(index, row, rows) { // 删除行
      if (row.id) {
        this.permission.delete.push(row.id);
        this.permission.data.splice(index, 1);
      } else {
        this.permission.unsave.splice(index - this.permission.data.length, 1)
      }
    },
    permissionRefresh: _.debounce(function () {
      this.role.current
        && this.func.current
        && this.initPermission(this.role.current.id, this.func.current.id);
    }, 200),
    permissionSave: _.debounce(function () {
      if (this.permission.unsave.length || this.permission.delete.length) {
        Api.role_permission_save({
          "addRoleFuncPermissions": this.permission.unsave,
          "deleteIds": this.permission.delete
        })
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
          .catch(err => {
            // error code
            this.$message({
              type: 'info',
              message: err.message
            });
          });
      }
    }, 200)
  },
  mounted() {
    this.initRole();
  }
}
</script>

<style lang="scss">
body {
  font-family: 'microsoft yahei', Helvetica, sans-serif;
}

.slide-enter-active {
  transition: all .3s ease-in;
}

.slide-leave-active {
  transition: all .3s ease-out;
}

.slide-enter,
.slide-leave-active {
  transform: translateX(100%);
}

.full {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 12px;
  overflow: hidden;
}

.el-table {
  height: 100%;
  .el-table__body-wrapper {
    height: 100%;
  }
}

.role-function {
  .el-tree {
    border: none;
  }
}

.el-row {
  height: 100%;
  margin-bottom: 20px;
  align-items: stretch;
  .el-col {
    overflow: hidden;
    position: relative;
    .title {
      // position: absolute;
      // left: 0;
      // right: 0;
      height: 30px;
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
    .content {
      // padding-top: 48px;
      height: 100%;
      overflow: auto;
      box-sizing: border-box;
    }
    >.el-row {
      margin-top: -30px;
    }
  }
  &:last-child {
    margin-bottom: 0;
  }
  &.direction-column {
    flex-direction: column;
    flex: 0 0 50%;
    .el-col {
      height: 50%;
    }
  }
}
.dialog-function {
  .el-dialog__body {
    padding-top: 0;
  }
}
</style>
