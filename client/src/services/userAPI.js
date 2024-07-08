import { getRequest, postRequest } from "./axiosClient";

export const getAllUsers = async (query) => {
  try {
    const response = await getRequest("users", query);
    return response.data;
  } catch (error) {
    console.log("[GET users error]", error);
    return {
      users: [],
      total: 0,
    };
  }
};

export const getUserStatus = () => getRequest("users/getUserStatus");

export const getUserCount = (query) => getRequest("users/getUserCount", query);

export const checkLastStatus = () => getRequest("users/checkLastStatus");

export const updateUserStatus = () => getRequest("users/updateUserStatus");

export const updateUser = (data) => postRequest("users/updateUser", data);
