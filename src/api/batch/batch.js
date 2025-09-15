import { authAxios, publicAxios } from "../config";
import { ApiKey } from "../endpoint";

export const fetchBatchReq = async () => {
  try {
    debugger;
    const res = await publicAxios.get(`${ApiKey.Batch}`);

    const _data = res.data;
    return { error: false, data: _data, message: "", errorMsg: "" };
  } catch (err) {
    let error;
    if (err.response) error = err.response.data.message || "Response error";
    else if (err.request) error = "Request error";
    else error = "Something went wrong please try again later";
    throw { error: true, data: "", message: "", errorMsg: error };
  }
};

export const fetchBatchReqById = async (id) => {
  try {
    debugger;
  const res = await publicAxios.get(`${ApiKey.Batch}/${id}`);

    const _data = res.data;
    return { error: false, data: _data, message: "", errorMsg: "" };
  } catch (err) {
    let error;
    if (err.response) error = err.response.data.message || "Response error";
    else if (err.request) error = "Request error";
    else error = "Something went wrong please try again later";
    throw { error: true, data: "", message: "", errorMsg: error };
  }
};

export const fetchBatchListReq = async () => {
    try {
      debugger;
      const res = await publicAxios.get(`${ApiKey.Batch}`);
  
      const _data = res.data;
      return { error: false, data: _data, message: "", errorMsg: "" };
    } catch (err) {
      let error;
      if (err.response) error = err.response.data.message || "Response error";
      else if (err.request) error = "Request error";
      else error = "Something went wrong please try again later";
      throw { error: true, data: "", message: "", errorMsg: error };
    }
  };
  export const fetchBatchDropdownReq = async (courseId) => {
    try {
      debugger;
      const res = await publicAxios.get(`${ApiKey.BatchDropdown}?courseId=${courseId}`);
  
      const _data = res.data;
      return { error: false, data: _data, message: "", errorMsg: "" };
    } catch (err) {
      let error;
      if (err.response) error = err.response.data.message || "Response error";
      else if (err.request) error = "Request error";
      else error = "Something went wrong please try again later";
      throw { error: true, data: "", message: "", errorMsg: error };
    }
  };
  export const addNewBatchReq = async (data) => {
    try {
      const res = await publicAxios.post(`${ApiKey.Batch}`, data);
      const msg = res.data.message;
      const _data = res.data;
      return { error: false, data: _data, message: msg, errorMsg: "" };
    } catch (err) {
      // Log the full error object for debugging
      console.error("Full API error:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
      }
  
      let error;
      if (err.response) {
        // If there is a response, try logging its full data structure:
        error = err.response.data.message || "Response error";
      } else if (err.request) {
        error = "Request error";
      } else {
        error = "Something went wrong please try again later";
      }
      throw { error: true, data: "", message: "", errorMsg: error };
    }
  };
  
export const updateBatchReq = async (data) => {
  try {
    const res = await publicAxios.put(`${ApiKey.Batch}`, data);

    const msg = res.data.message;
    const _data = res.data;
    return { error: false, data: _data, message: msg, errorMsg: "" };
  } catch (err) {
    let error;
    if (err.response) error = err.response.data.message || "Response error";
    else if (err.request) error = "Request error";
    else error = "Something went wrong please try again later";
    throw { error: true, data: "", message: "", errorMsg: error };
  }
};

export const deleteBatchReq = async (actionId) => {
  try {
    const res = await publicAxios.delete(`${ApiKey.Batch}/${actionId}`);

    const msg = res.data?.message;
    const _data = res.data;
    return { error: false, data: _data, message: msg, errorMsg: "" };
  } catch (err) {
    let error;
    if (err.response) error = err.response.data.message || "Response error";
    else if (err.request) error = "Request error";
    else error = "Something went wrong please try again later";
    throw { error: true, data: "", message: "", errorMsg: error };
  }
};
