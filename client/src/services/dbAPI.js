import { getRequest, postRequest } from "./axiosClient";

export const getAll = async (query) => {
  try {
    const response = await getRequest("db", query);
    return response.data;
  } catch (error) {
    console.log("[GET db error]", error);
    return {
      dbs: [],
      total: 0,
    };
  }
};

export const deleteDBFile = async (query) => getRequest("db/delDB", query);

export const backup = async (data) => {
  try {
    const response = await postRequest("db/backup", data);
    return response;
  } catch (error) {
    console.log("[Save db error]", error);
    return {
      dbs: [],
      total: 0,
    };
  }
};

export const restore = (data) => postRequest("db/restore", data);