import { postRequest } from "./axiosClient";

export const forgotPassword = (data) => postRequest('auth/forgot-password', data);
export const resetPassword = (data) => postRequest('auth/reset-password', data);
export const verifyResetLink = (data) => postRequest('auth/vierfy-link', data);
export const addNewUser = (data) => postRequest('auth/addNewUser', data);
