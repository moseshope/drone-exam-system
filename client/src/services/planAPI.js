import { getRequest, postRequest, putRequest } from "./axiosClient";

export const getUserSubscription = () => getRequest('plans/getUserSubscription');
export const cancelSubscription = (data) => putRequest('plans/cancelSubscription', data);
export const continueSubscription = (data) => putRequest('plans/continueSubscription', data);
export const createSetupIntent = (data) => postRequest('plans/createSetupIntent', data);
export const createSubscription = (data) => postRequest('plans/createSubscription', data);