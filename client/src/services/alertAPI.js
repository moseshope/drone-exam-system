import { getRequest, postRequest } from "./axiosClient";

export const getAll = () => getRequest('alert/');
export const getCount = (data) => getRequest('alert/getCount', data);
export const pushAlert = (data) => postRequest('alert/pushAlert', data);
export const update = (data) => getRequest('alert/updateAlert', data);