import { authAxios, publicAxios } from "../config";
//import { ApiKey } from "../endpoint";
import { ApiKey } from "../endpoint";
export const fetchFormReq = async () => {
  try {
    debugger;
    const res = await publicAxios.get(`${ApiKey.Form}`);

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
export const fetchFormListReq = async () => {
    try {
      debugger;
      const res = await publicAxios.get(`${ApiKey.Form}`);
  
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
  export const fetchAttachmentReq = async (id,type) => {
    try {
      debugger;
      const res = await publicAxios.get(`${ApiKey.Attachment}?id=${id}&type=${type}`);
  
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
  export const addNewFormReq = async (data) => {
    try {
      const res = await publicAxios.post(`${ApiKey.Form}`, data);
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
  
export const updateFormReq = async (data) => {
  try {
    const res = await publicAxios.put(`${ApiKey.Form}`, data);

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

export const deleteFormReq = async (actionId) => {
  try {
    const res = await publicAxios.delete(`${ApiKey.Form}/${actionId}`);

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
// Upload Form Files

export const uploadFormFilesReq = async (formData) => {
  try {
    debugger;
    const res = await publicAxios.post(`${ApiKey.uploadApplicationFiles}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { error: false, data: res.data, message: res.data.message || "", errorMsg: "" };
  } catch (err) {
    let error;
    if (err.response) error = err.response.data.message || "Response error";
    else if (err.request) error = "Request error";
    else error = "Something went wrong please try again later";
    throw { error: true, data: "", message: "", errorMsg: error };
  }
};
export const updatePaymentFormReq = async (data) => {
  try {
    debugger
    const res = await publicAxios.put(`${ApiKey.Payment}`, data);

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
// Download Form Files

export const downloadFormFilesReq = async ({ id, type, filename }) => {
  try {
    debugger;
    // Construct URL with query parameters exactly as backend expects
    const url = `${ApiKey.downloadApplicationFiles}?id=${id}&type=${type}${filename ? `&filename=${filename}` : ""}`;

    const res = await publicAxios.get(url, {
      responseType: "blob", // important for file download
    });

    return res; // return full response so you can get headers too
  } catch (err) {
    let error;
    if (err.response) error = err.response.data.message || "Response error";
    else if (err.request) error = "Request error";
    else error = "Something went wrong please try again later";
    throw { error: true, data: "", message: "", errorMsg: error };
  }
};

