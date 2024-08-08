import { getRequest, postRequest } from "./axiosClient";

export const getAll = async (query) => {
  try {
    const response = await getRequest("references", query);
    return response.data;
  } catch (error) {
    console.log("[GET references error]", error);
    return {
      references: [],
      total: 0,
    };
  }
};

export const del = async (query) => getRequest("references/del", query);

export const add = async (data) => postRequest("references/add", data);

export const update = (data) => postRequest("references/update", data);