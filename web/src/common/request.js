import axios from 'axios'
import {server} from "./env";
import {message} from 'antd';
import {getHeaders} from "../utils/utils";

// 测试地址
// axios.defaults.baseURL = server;
// 线上地址
axios.defaults.baseURL = server;

const handleError = (error) => {
    console.log(error)
    if ("Network Error" === error.toString()) {
        message.error('网络异常');
        return false;
    }
    if (error.response !== undefined && error.response.status === 401) {
        window.location.href = '#/login';
        return false;
    }

    if (error.response !== undefined) {
        let data = error.response.data;
        message.error(`${data.message}`, 10);
        return false;
    }
    return true;
};

const handleResult = (result) => {
    if (result['code'] === 401) {
        window.location.href = '#/login';
        return false;
    }
    return true;
}

const request = {

    get: function (url) {
        const headers = getHeaders();

        return new Promise((resolve, reject) => {
            axios.get(url, {headers: headers})
                .then((response) => {
                    if (!handleResult(response.data)) {
                        return;
                    }
                    resolve(response.data);
                })
                .catch((error) => {
                    handleError(error);
                    reject(error);
                });
        })
    },

    post: function (url, params) {

        const headers = getHeaders();

        return new Promise((resolve, reject) => {
            axios.post(url, params, {headers: headers})
                .then((response) => {
                    if (!handleResult(response.data)) {
                        return;
                    }
                    resolve(response.data);
                })
                .catch((error) => {
                    handleError(error);
                    reject(error);
                });
        })
    },

    put: function (url, params) {

        const headers = getHeaders();

        return new Promise((resolve, reject) => {
            axios.put(url, params, {headers: headers})
                .then((response) => {
                    if (!handleResult(response.data)) {
                        return;
                    }
                    resolve(response.data);
                })
                .catch((error) => {
                    handleError(error);
                    reject(error);
                });
        })
    },

    delete: function (url) {
        const headers = getHeaders();

        return new Promise((resolve, reject) => {
            axios.delete(url, {headers: headers})
                .then((response) => {
                    if (!handleResult(response.data)) {
                        return;
                    }
                    resolve(response.data);
                })
                .catch((error) => {
                    handleError(error);
                    reject(error);
                });
        })
    },

    patch: function (url, params) {
        const headers = getHeaders();

        return new Promise((resolve, reject) => {
            axios.patch(url, params, {headers: headers})
                .then((response) => {
                    if (!handleResult(response.data)) {
                        return;
                    }
                    resolve(response.data);
                })
                .catch((error) => {
                    handleError(error);
                    reject(error);
                });
        })
    },
};
export default request