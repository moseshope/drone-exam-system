import { getRequest, postRequest } from "./axiosClient";

export const getAllProblems = async (query) => {
  try {
    const response = await getRequest("problems", query);
    return response.data;
  } catch (error) {
    console.log("[GET problems error]", error);
    return {
      problems: [],
      total: 0,
    };
  }
};

export const getProblemCount = (query) =>
  getRequest("problems/getProblemCount", query);

export const getProblems = (query) => getRequest("problems/getProblems", query);
export const getExamProblems = (query) => getRequest("exams/getExamProblems", query);
export const addProblems = (data) => postRequest("problems/addProblem", data);
export const updateProblem = (query) =>
  getRequest("problems/updateProblem", query);
export const deleteProblem = (query) =>
  getRequest("problems/deleteProblem", query);
