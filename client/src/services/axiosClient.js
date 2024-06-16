import axios from "axios";
import constants from "../config/constants";
import { getStorage } from "../helpers";

const axiosClient = axios.create();

axiosClient.defaults.baseURL = constants.HOST_URL;

axiosClient.defaults.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
};

// To share cookies to cross site domain, change to true.
// axiosClient.defaults.withCredentials = true;

// if(token) {
axiosClient.interceptors.request.use(function (config) {
    const token = getStorage("token");
    config.headers.Authorization = token;
    return config;
});
// axiosClient.defaults.headers.common['Authorization'] = `${token}`;
// } else {
// delete axiosClient.defaults.headers.common['Authorization'];
// }

export function getRequest(URL, params) {
    return axiosClient.get(`/${URL}`, { params }).then((response) => response);
}

export function postRequest(URL, payload) {
    return axiosClient.post(`/${URL}`, payload).then((response) => response);
}

export function patchRequest(URL, payload) {
    return axiosClient.patch(`/${URL}`, payload).then((response) => response);
}

export function putRequest(URL, payload) {
    return axiosClient.put(`/${URL}`, payload).then((response) => response);
}

export function deleteRequest(URL) {
    return axiosClient.delete(`/${URL}`).then((response) => response);
}

//  Axios client to post multipart/form-data
const axiosClientWithFiles = axios.create();

axiosClientWithFiles.defaults.baseURL = constants.HOST_URL;
axiosClientWithFiles.defaults.headers = {
    "Content-Type": "multipart/form-data",
    Accept: 'multipart/form-data',
};

axiosClientWithFiles.interceptors.request.use(function (config) {
    const token = getStorage("token");
    config.headers.Authorization = token;
    return config;
});

export function postRequestWithFiles(URL, payload) {
    return axiosClientWithFiles
        .post(`/${URL}`, payload)
        .then((response) => response);
}
