import { getRequest, postRequest } from "./axiosClient";

export const getAllExams = async (query) => {
  try {
    const response = await getRequest("exams", query);
    return response.data;
  } catch (error) {
    console.log("[GET exams error]", error);
    return {
      exams: [],
      total: 0,
    };
  }
};

export const saveExam = async (query) => {
  try {
    const response = await postRequest("exams/saveExam", query);
    return response.data;
  } catch (error) {
    console.log("[Save exams error]", error);
    return {
      exams: [],
      total: 0,
    };
  }
};

export const getLastExams = async (query) => {
  try {
    const response = await getRequest("exams/getLastExam", query);
    return response.data;
  } catch (error) {
    console.log("[GET exams error]", error);
    return {
      exams: [],
      total: 0,
    };
  }
};
