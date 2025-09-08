import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import {
  addNewFormReq,
  deleteFormReq,
  fetchFormListReq,
  //updateFormReq,
  updateFormReq,
} from "../../../api/form/form";

export const FormSlice = createSlice({
  name: "FormList",
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

export const { setLoading, addData, setError } = FormSlice.actions;
export default FormSlice.reducer;

// Action to add a new Form
export const addNewForm = async (data, dispatch) => {
  try {
    debugger;
    dispatch(setLoading()); // Set loading before making the API request
    await addNewFormReq(data); // Call API to add a Form
    await dispatch(fetchFormList()); // Fetch updated list of Forms
  
    dispatch(setError()); // Handle error if API fails
    Swal.fire({
          text: "Form added successfully!",
          icon: "success",
        });
      } catch (error) {
        dispatch(setError()); // Handle error if API fails
        Swal.fire({
          text: "Error! Try Again!",
          icon: "error",
        });
        throw error; // Throw the error to be handled elsewhere
      }
    };

// Action to update a Form
export const updateForm = async (data, dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    await updateFormReq(data); // Call API to update Form
    await dispatch(fetchFormList()); // Fetch updated list of Forms
   Swal.fire({
        text: "Form updated successfully!",
        icon: "success",
      });
    } catch (error) {
      dispatch(setError()); // Handle error if API fails
      Swal.fire({
        text: "Error! Try Again!",
        icon: "error",
      });
      throw error; // Handle or throw the error to be handled elsewhere
    }
  };
  

// Action to delete a Form
export const deleteForm = async (data, dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    await deleteFormReq(data); // Call API to delete a Form
    await dispatch(fetchFormList()); // Fetch updated list of Forms
 Swal.fire({
       text: "Form deleted successfully!",
       icon: "success",
     });
   } catch (error) {
     dispatch(setError()); // Handle error if API fails
     Swal.fire({
       text: "Error! Try Again!",
       icon: "error",
     });
     throw error; // Handle or throw the error to be handled elsewhere
   }
 };
// Action to fetch the Form list
export const fetchFormList = () => async (dispatch) => {
  try {
    
    dispatch(setLoading()); // Set loading before making the API request
    const res = await fetchFormListReq(); // Fetch Form list from API
    dispatch(addData(res.data)); // Dispatch the data to Redux state
  } catch {
    dispatch(setError()); // Handle error if API fails
    Swal.fire({
      text: "Failed to load Forms",
      icon: "error",
    });
  }
};
