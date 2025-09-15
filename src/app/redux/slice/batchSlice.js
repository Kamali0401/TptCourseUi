import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import {
  addNewBatchReq,
  deleteBatchReq,
  fetchBatchListReq,
  updateBatchReq,
} from "../../../api/batch/batch";

export const BatchSlice = createSlice({
  name: "BatchList",
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

export const { setLoading, addData, setError } = BatchSlice.actions;
export default BatchSlice.reducer;

// Action to add a new Batch
export const addNewBatch = async (data, dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    await addNewBatchReq(data); // Call API to add a Batch
    await dispatch(fetchBatchList()); // Fetch updated list of Batchs
  
    dispatch(setError()); // Handle error if API fails
    Swal.fire({
          text: "Batch added successfully!",
          icon: "success",
        });
      }catch (error) {
  dispatch(setError());
  Swal.fire({
    title: "Error",
    text: error?.errorMsg || "Error! Try Again!",
    icon: "error",
  });
  throw error;
      }
    };

// Action to update a Batch
export const updateBatch = async (data, dispatch) => {
  try {
    debugger;
    dispatch(setLoading()); // Set loading before making the API request
    await updateBatchReq(data); // Call API to update Batch
    await dispatch(fetchBatchList()); // Fetch updated list of Batchs
   Swal.fire({
        text: "Batch updated successfully!",
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
  

// Action to delete a Batch
export const deleteBatch = async (data, dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    await deleteBatchReq(data); // Call API to delete a Batch
    await dispatch(fetchBatchList()); // Fetch updated list of Batchs
 Swal.fire({
       text: "Batch deleted successfully!",
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
// Action to fetch the Batch list
export const fetchBatchList = () => async (dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    const res = await fetchBatchListReq(); // Fetch Batch list from API
    dispatch(addData(res.data)); // Dispatch the data to Redux state
  } catch (error) {
    dispatch(setError()); // Handle error if API fails
    Swal.fire({
      text: "Failed to load Batchs",
      icon: "error",
    });
  }
};
