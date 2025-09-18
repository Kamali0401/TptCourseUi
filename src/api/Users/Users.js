import { authAxios, publicAxios } from "../config";
import { ApiKey } from "../endpoint";

/* ------------------------------
   Fetch Single User
------------------------------- */
export const fetchUserReq = async (id) => {
  try {
    const res = await publicAxios.get(`${ApiKey.User}/${id}`);
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

/* ------------------------------
   Fetch User List
------------------------------- */
export const fetchUserListReq = async () => {
  try {
    const res = await publicAxios.get(`${ApiKey.User}`);
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

/* ------------------------------
   Add New User
------------------------------- */
export const addNewUserReq = async (data) => {
  try {
    const res = await publicAxios.post(`${ApiKey.User}`, data);
    const msg = res.data.message;
    const _data = res.data;
    return { error: false, data: _data, message: msg, errorMsg: "" };
  } catch (err) {
    console.error("Full API error:", err);
    if (err.response) console.error("Error response data:", err.response.data);

    let error;
    if (err.response) {
      error =
        err.response.data.message ||
        err.response.data.error ||
        "Response error";
    } else if (err.request) error = "Request error";
    else error = "Something went wrong please try again later";

    throw { error: true, data: "", message: "", errorMsg: error };
  }
};

/* ------------------------------
   Update User
------------------------------- */
export const updateUserReq = async (data) => {
  try {
    const res = await publicAxios.put(`${ApiKey.User}`, data);
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

/* ------------------------------
   Delete User
------------------------------- */
export const deleteUserReq = async (id) => {
  try {
    const res = await publicAxios.delete(`${ApiKey.User}/${id}`);
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
