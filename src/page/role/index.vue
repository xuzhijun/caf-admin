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
          <el-button :disabled="isRoleActived" type="primary" @click="editFunction" v-loading.fullscreen.lock="fullscreenLoading">授权</el-button>
        </div>
        <div class="content">
          <el-table v-loading="loading" stripe border :data="func.table" ref="functionTable" style="width: 100%" highlight-current-row>
            <el-table-column type="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column sortable prop="type" label="类型"></el-table-column>
            <el-table-column sortable prop="parentName" label="父节点"></el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-dialog class="dialog-function" title="授权" size="large" :visible.sync="dialogFunctionVisible">
      <el-row v-loading="dialogLoading">
        <el-col :span="8" class="role-function">
          <div class="title">
            <span>功能{{currentNodeType}}</span>
          </div>
          <div class="content">
            <el-tree node-key="id" ref="functionTree" highlight-current show-checkbox accordion current-node-key="id" :data="func.data" :props="func.props" :default-checked-keys="func.defaultChecked" :render-content="renderFunctionContent" :expand-on-click-node="true" @current-change="functionCurrentChange" @check-change="functionCheckChange"></el-tree>
          </div>
        </el-col>
        <el-col :span="16" class="role-org">
          <div class="title">
            <span>属性（NODE类型节点不能添加属性）</span>
            <el-button :disabled="checkAddPermission" type="primary" size="small" @click="addPermission">新增</el-button>
          </div>
          <div class="content">
            <el-table stripe border ref="permissionTable" :data="permission.data" style="width: 100%" highlight-current-row>
              <el-table-column prop="proName" label="属性名"></el-table-column>
              <el-table-column prop="value" label="属性值"></el-table-column>
              <el-table-column label="操作">
                <template scope="scope">
                  <el-button size="small" @click="editPermission(scope.$index, scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deletePermission(scope.$index, scope.row, permission.data)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialogFunction">取 消</el-button>
        <el-button type="primary" @click="saveFunction">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="dialog-permission" title="属性" :visible.sync="dialogPermissionVisible">
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
        <el-button type="primary" @click="savePermission">确 定</el-button>
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
      fullscreenLoading: false,
      dialogLoading: false,
      role: {
        current: {},
        data: []
      },
      func: {
        currentNode: {},
        current: {},      // 当前选中的 function 节点
        data: [],         // 原始树
        dataFlatten: [],  // 扁平化树
        dataChecked: [],  // 选中节点ID列表
        defaultChecked: [], // 默认选中节点
        table: [],        // 扁平化选中树
        props: {
          children: 'functions',
          label: 'name'
        }
      },
      permission: {
        current: {},  // 存放当前选中的 permission 项
        data: [],     // 存放当前 function 下的 permission 列表
        unsave: [],
        delete: []
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
    checkAddPermission() {
      return !(this.func.currentNode.checked && this.func.current.type != 'NODE');
    },
    // checkPermissionSave() {
    //   return !(this.permission.unsave.length || this.permission.delete.length);
    // },
    // permissionData() {
    //   // return _.concat(this.permission.data, this.permission.unsave);
    // },
    isActiveOrg() {
      return this.func.current
    },
    isRoleActived() {
      return !this.role.current
    },
    currentNodeType() {
      let tips = this.func.current.type ? "选中节点类型：" + this.func.current.type : "未选中节点";
      return "（" + tips + "）";
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
    resetFunction() {
      this.func.current = {};       // 当前选中的 function 节点
      this.func.data = [];          // 原始树
      this.func.dataFlatten = [];   // 扁平化树
      this.func.dataChecked = [];   // 选中节点ID列表
      // this.func.table = [];
    },
    initFunctionTable(roleId) { // 初始化 function 表
      this.loading = true;
      Api.role_function_list_table({
        'roleId': roleId
      })
        .then(res => {// 填充 function 数据
          this.func.table = res.data;
          setTimeout(() => {
            this.loading = false;
          }, 500);
        })
        .catch(() => {
          this.loading = false;
        });
    },
    initFunction(roleId) { // 初始化 function 树
      this.fullscreenLoading = true;
      Api.role_function_list({
        'roleId': roleId
      })
        .then(res => {// 请求成功
          if (res.code == '1') {
            this.fullscreenLoading = false;
            // 清除旧数据
            this.resetFunction();
            // 写入新数据
            this.func.data = res.data;
            // 打开对话框
            this.openDialogFunction();

            this.recursionFunction(this.func.data); // 递归树

            this.func.defaultChecked = this.func.dataChecked; // 勾选打钩节点
          } else {
            throw new Error(res.message);
          }
        })
        .then(() => {
        })
        .then(() => {
        })
        .then(() => {
          this.initPermission(); // 初始化 permission
        })
        .catch(err => {
          // error code
          this.fullscreenLoading = false;
          this.$message({
            type: 'info',
            message: err.message
          });
        });
    },
    editFunction() {
      this.role.current.id && this.initFunction(this.role.current.id);
    },
    saveFunction() {
      this.dialogLoading = true;
      Api.role_function_permission_save(this.func.dataFlatten)
        .then(res => {
          // console.log(res);
          if (res.code == '1') {
            this.$message({
              type: 'success',
              message: res.message
            });
          } else {
            throw new Error(res.message);
          }
        })
        .then(() => {
          this.dialogLoading = false;
          this.closeDialogFunction();
        })
        .then(() => {
          this.initFunctionTable(this.role.current.id);
        })
        .catch(err => {
          // error code
          this.dialogLoading = false;
          this.$message({
            type: 'info',
            message: err.message
          });
        });
    },
    renderFunctionContent(h, { node, data, store }) { // 渲染 功能树的节点内容
      return (<span>{node.label}</span>);
    },
    /* 递归功能树，两个功能
    一，遍历勾选的节点
    二，扁平化所有树节点
    */
    recursionFunction(list) {
      if (!list || list.length == 0) {
        return;
      }
      for (let i = 0; i < list.length; i++) {
        list[i].flag && this.func.dataChecked.push(list[i].id);
        this.func.dataFlatten.push({
          "id": list[i].id,
          "roleId": this.role.current.id,
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
    updateFunction: function (target = [], list = []) {
      for (let i = 0; i < list.length; i++) {
        list[i].flag = target.indexOf(list[i].id) != -1
        // console.log(list[i].flag);
      }
    },
    functionCurrentChange(currentData, currentNode) {
      if (currentData && currentData.id) {
        this.func.current = currentData;
        this.func.currentNode = currentNode;
        this.initPermission(this.role.current.id, this.func.current.id);
      }
    },
    functionCheckChange: _.debounce(function (currentData, isChecked, isChildrenChecked) {
      this.updateFunction(this.$refs.functionTree.getCheckedKeys(), this.func.dataFlatten);

    }, 200),
    // functionCheckedSave() { // 保存 功能树的勾选状态
    //   let _checked = this.$refs.functionTree.getCheckedKeys(true);
    //   if (this.role.current) {
    //     Api.role_function_save({
    //       'roleId': this.role.current.id,
    //       'functionId': _checked.join(',')
    //     })
    //       .then(res => {
    //         // console.log(res);
    //         if (res.code == '1') {
    //           this.$message({
    //             type: 'success',
    //             message: res.message
    //           });
    //           // this.func.checked = res.data;
    //           this.func.checked = _checked;
    //           this.closeDialog();
    //         } else {
    //           throw new Error(res.message);
    //         }
    //       })
    //       .catch(err => {
    //         // error code
    //         // console.log(err);
    //         this.$message({
    //           type: 'info',
    //           message: err.message
    //         });
    //       });
    //   }
    // },
    // functionRefresh: _.debounce(function () { // 刷新 功能树
    //   this.role.current && this.initFunction(this.role.current.id);
    // }, 200),
    // eventFunciton: function () {

    // },
    /* 机构 */
    // 初始化 permission 表
    resetPermission() {
      this.permission.current = {};
      this.permission.data = [];
    },
    initPermission(roleId = '', functionId = '') {
      this.permission.data = [];
      this.permission.current = {};
      // this.permission.unsave = [];
      // this.permission.delete = [];
      // console.log(this.func.dataFlatten);
      if (functionId) {
        this.permission.data = _.find(this.func.dataFlatten, function (o) {
          return o.id == functionId;
        }).permissionList;
      }
      // console.log(this.permission.data);
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
    initPermissionForm(index = '', { // 初始化 permission 表单
      proName = '',
      value = ''
    } = {}) {
      this.$refs['permissionForm'] && this.$refs['permissionForm'].resetFields();
      this.permission.current.index = index;
      this.permission.current.proName = proName;
      this.permission.current.value = value;
    },
    /* 
    在做新增和编辑的时候曾经想过把这两个方法合并，利用函数参数的默认值来区分两者，
    但是这样做会牺牲对于命名的语义化，所以最终还是使用了两个方法。
    我觉得，代码不仅仅是写给机器看的，也是写给人看的。
    */
    addPermission() { // 新增 permission
      this.initPermissionForm();
      this.openDialog();
    },
    editPermission(index, row) { // 修改 permission
      this.initPermissionForm(index, row);
      this.openDialog();
    },
    savePermission() { // 保存 permission
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
    deletePermission(index, row, rows) { // 删除 permission
      this.permission.data.splice(index, 1);
      // if (row.id) {
      //   this.permission.delete.push(row.id);

      // } else {
      //   this.permission.unsave.splice(index - this.permission.data.length, 1)
      // }
    },
    // permissionRefresh: _.debounce(function () {
    //   this.role.current
    //     && this.func.current
    //     && this.initPermission(this.role.current.id, this.func.current.id);
    // }, 200),
    // permissionSave: _.debounce(function () {
    //   if (this.permission.unsave.length || this.permission.delete.length) {
    //     Api.role_permission_save({
    //       "addRoleFuncPermissions": this.permission.unsave,
    //       "deleteIds": this.permission.delete
    //     })
    //       .then(res => {
    //         // console.log(res);
    //         if (res.code == '1') {
    //           this.$message({
    //             type: 'success',
    //             message: res.message
    //           });
    //           this.closeDialog();
    //         } else {
    //           throw new Error(res.message);
    //         }
    //       })
    //       .catch(err => {
    //         // error code
    //         this.$message({
    //           type: 'info',
    //           message: err.message
    //         });
    //       });
    //   }
    // }, 200)
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
  .role-list,.role-org {
    display: flex;
    flex-direction: column;
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

.el-table {
  height: 100%;
  .el-table__body-wrapper {
    position: absolute;
    top: 40px;
    bottom: 0;
  }
}

.dialog-function {
  .el-dialog__body {
    padding-top: 0;
  }
}
</style>
