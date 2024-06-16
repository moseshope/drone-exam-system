import { getRequest } from "./axiosClient";

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

export const getUserCount = (query) => getRequest("users/getUserCount", query);
