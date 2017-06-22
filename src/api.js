import axios from 'axios'
import qs from 'qs'

export function fetch(url = '', data = {}, type = 'GET', config = {}) {
    type = type.toUpperCase();
    let requestConfig = {
        'url': url,
        'method': type,
        'baseURL': '/caf-template-admin',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };
    if (type == 'GET') {
        Object.defineProperty(requestConfig, 'params', {
            enumerable: true, // 在自定义配置的时候，必须设置为可枚举
            value: data
        })
    }
    if (type == 'POST') {
        Object.defineProperty(requestConfig, 'data', {
            enumerable: true, // 在自定义配置的时候，必须设置为可枚举
            value: data
        });
    }

    for (let key in config) { // 扩展选项
        Object.defineProperty(requestConfig, key, {
            enumerable: true, // 在自定义配置的时候，必须设置为可枚举
            value: config[key]
        });
    }
    return new Promise((resolve, reject) => {
        axios(requestConfig).then(res => {
            resolve(res.data);
        }).catch(err => {
            reject(err);
        });
    })
}
export default {
    resource_list : function (data) { // 资源列表
        return fetch('/applicationFunction/getFunctionTree', data)
    },
    resource_options_parent : function (data) { // 资源父菜单列表
        return fetch('/applicationFunction/getFunctionParentIds', data)
    },
    resource_add : function (data) {
        return fetch('/applicationFunction/saveAddFunction', qs.stringify(data), 'POST')
    },
    resource_edit : function (data) {
        return fetch('/applicationFunction/saveEditFunction', qs.stringify(data), 'POST')
    },
    resource_delete : function (data) {
        return fetch('/applicationFunction/deleteFunction', qs.stringify(data), 'POST')
    },
    menu_list : function (data) {
        return fetch('/shareCompon/getMenuTree', data)
    },
    menu_options_parent : function (data) {
        return fetch('/shareCompon/getParentIds', data)
    },
    menu_options_code : function (data) {
        return fetch('/shareCompon/getCodes', data)
    },
    menu_add : function (data) {
        return fetch('/shareCompon/saveAddMenu', qs.stringify(data), 'POST')
    },
    menu_edit : function (data) {
        return fetch('/shareCompon/saveEditMenu', qs.stringify(data), 'POST')
    },
    menu_delete : function (data) {
        return fetch('/shareCompon/deleteMenu', qs.stringify(data), 'POST')
    },
    org_list : function (data) {
        return fetch('/applicationOrg/getOrgTree', data)
    },
    org_options_parent : function (data) {
        return fetch('/applicationOrg/getOrgParentIds', data)
    },
    org_add : function (data) {
        return fetch('/applicationOrg/saveAddOrg', qs.stringify(data), 'POST')
    },
    org_edit : function (data) {
        return fetch('/applicationOrg/saveEditOrg', qs.stringify(data), 'POST')
    },
    org_delete : function (data) {
        return fetch('/applicationOrg/deleteOrg', qs.stringify(data), 'POST')
    },
    role_role_list : function (data) {
        return fetch('/applicationRole/getAllrole', data)
    },
    role_function_list : function (data) {
        return fetch('/roleFunction/findFunctionListByRoleId', data)
    },
    role_function_list_table : function (data) {
        return fetch('/roleFunction/findFunctionListByRoleIdTable', data)
    },
    role_function_save : function (data) {
        return fetch('/roleFunction/saveRoleAndFunction', qs.stringify(data), 'POST')
    },
    role_permission_list : function (data) {
        return fetch('/roleFunctionPermission/getPermission', data)
    },
    role_permission_save : function (data) {
        return fetch('/roleFunctionPermission/savePermission', data, 'POST', {
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        })
    }
}