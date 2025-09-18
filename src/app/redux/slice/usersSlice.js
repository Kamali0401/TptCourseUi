import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import {
  addNewUserReq,
  deleteUserReq,
  fetchUserListReq,
  updateUserReq,
} from "./././../../../api/Users/Users"; // ✅ your API requests for users

export const UserSlice = createSlice({
  name: "UserList",
  initialState: {
    loading: false,
    error: false,
    data: [],
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    addData: (state, { payload }) => {
      state.loading = false;
      state.error = false;
      state.data = payload;
    },
    setError: (state) => {
      state.error = true;
      state.loading = false;
    },
  },
});

export const { setLoading, addData, setError } = UserSlice.actions;
export default UserSlice.reducer;

/* ------------------------------
   Async Actions
------------------------------- */

// ✅ Add new user
export const addNewUser = async (data, dispatch) => {
  try {
    dispatch(setLoading());
    await addNewUserReq(data);
    await dispatch(fetchUserList());
    Swal.fire({
      text: "User added successfully!",
      icon: "success",
    });
  } catch (error) {
    dispatch(setError());
    Swal.fire({
      title: "Error",
      text: error?.errorMsg || "Error! Try Again!",
      icon: "error",
    });
    throw error;
  }
};

// ✅ Update user
export const updateUser = async (data, dispatch) => {
  try {
    dispatch(setLoading());
    await updateUserReq(data);
    await dispatch(fetchUserList());
    Swal.fire({
      text: "User updated successfully!",
      icon: "success",
    });
  } catch (error) {
    dispatch(setError());
    Swal.fire({
      text: "Error! Try Again!",
      icon: "error",
    });
    throw error;
  }
};

// ✅ Delete user
export const deleteUser = async (id, dispatch) => {
  try {
    dispatch(setLoading());
    await deleteUserReq(id);
    await dispatch(fetchUserList());
    Swal.fire({
      text: "User deleted successfully!",
      icon: "success",
    });
  } catch (error) {
    dispatch(setError());
    Swal.fire({
      text: "Error! Try Again!",
      icon: "error",
    });
    throw error;
  }
};

// ✅ Fetch user list
export const fetchUserList = () => async (dispatch) => {
  try {
    dispatch(setLoading());
    const res = await fetchUserListReq();
    dispatch(addData(res.data));
  } catch (error) {
    dispatch(setError());
    Swal.fire({
      text: "Failed to load Users",
      icon: "error",
    });
  }
};
