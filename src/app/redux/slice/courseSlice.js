import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import {
  addNewCourseReq,
  deleteCourseReq,
  fetchCourseListReq,
  updateCourseReq,
} from "../../../api/course/course";

export const CourseSlice = createSlice({
  name: "CourseList",
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

export const { setLoading, addData, setError } = CourseSlice.actions;
export default CourseSlice.reducer;

// Action to add a new Course
export const addNewCourse = async (data, dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    await addNewCourseReq(data); // Call API to add a Course
    await dispatch(fetchCourseList()); // Fetch updated list of Courses
  
    dispatch(setError()); // Handle error if API fails
    Swal.fire({
          text: "Course added successfully!",
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

// Action to update a Course
export const updateCourse = async (data, dispatch) => {
  try {
    debugger;
    dispatch(setLoading()); // Set loading before making the API request
    await updateCourseReq(data); // Call API to update Course
    await dispatch(fetchCourseList()); // Fetch updated list of Courses
   Swal.fire({
        text: "Course updated successfully!",
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
  

// Action to delete a Course
export const deleteCourse = async (data, dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    await deleteCourseReq(data); // Call API to delete a Course
    await dispatch(fetchCourseList()); // Fetch updated list of Courses
 Swal.fire({
       text: "Course deleted successfully!",
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
// Action to fetch the Course list
export const fetchCourseList = () => async (dispatch) => {
  try {
    dispatch(setLoading()); // Set loading before making the API request
    const res = await fetchCourseListReq(); // Fetch Course list from API
    dispatch(addData(res.data)); // Dispatch the data to Redux state
  } catch (error) {
    dispatch(setError()); // Handle error if API fails
    Swal.fire({
      text: "Failed to load Courses",
      icon: "error",
    });
  }
};
