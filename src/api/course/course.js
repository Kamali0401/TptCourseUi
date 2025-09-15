import { authAxios, publicAxios } from "../config";
import { ApiKey } from "../endpoint";

export const fetchCourseReq = async () => {
  try {
    debugger;
    const res = await publicAxios.get(`${ApiKey.Course}`);

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
export const fetchCourseListReq = async () => {
    try {
      debugger;
      const res = await publicAxios.get(`${ApiKey.Course}`);
  
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
  export const addNewCourseReq = async (data) => {
    try {
      const res = await publicAxios.post(`${ApiKey.Course}`, data);
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
  // Check if API sends "message" or "error"
  error = err.response.data.message || err.response.data.error || "Response error";
} else if (err.request) {
  error = "Request error";
} else {
  error = "Something went wrong please try again later";
}
throw { error: true, data: "", message: "", errorMsg: error };

    }
  };
  
export const updateCourseReq = async (data) => {
  try {
    const res = await publicAxios.put(`${ApiKey.Course}`, data);

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

export const deleteCourseReq = async (actionId) => {
  try {
    const res = await publicAxios.delete(`${ApiKey.Course}/${actionId}`);

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
