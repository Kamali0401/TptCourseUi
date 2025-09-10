import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./CourseForm.css"; // your CSS
import Swal from "sweetalert2";
import {addNewCourse,updateCourse} from "../../app/redux/slice/courseSlice";
import { useDispatch } from "react-redux";
// Validation Schema
const validationSchema = Yup.object({
  courseName: Yup.string()
    .max(100, "Course Name must be at most 100 characters")
    .required("Course Name is required"),
  courseCode: Yup.string()
    .max(10, "Course Code must be at most 10 characters")
    .required("Course Code is required"),
    courseFee: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .required("Course Fees is required"),
    

     status: Yup.string()
       .oneOf(["Active", "UnActive"], "Status must be Active or UnActive")
       .required("Status is required"),
});

export default function AddCourseModal({ show, handleClose, onSubmit, course }) {
   const dispatch = useDispatch();
  const [initialValues, setInitialValues] = useState({
    courseName: "",
    courseCode: "",
    courseFee: "",
    status:"UnActive"
  });

  // Prefill form if editing a course
  useEffect(() => {
    if (course) {
      setInitialValues({
        courseName: course.courseName || "",
        courseCode: course.courseCode || "",
        courseFee: course.courseFee || "",
       status: course.status || "UnActive",  // 🔹 Default false if null/undefined
      });
    } else {
      setInitialValues({
        courseName: "",
        courseCode: "",
        courseFee: "",
        status:"UnActive"
      });
    }
  }, [course, show]);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      debugger
       if (course) {
        // 🔹 Update course
        await updateCourse({ ...values, courseID: course.courseID ,modifiedBy: "AdminUser"},dispatch);
      } else {
        // 🔹 Add new course
        await addNewCourse({ ...values, createdBy: "AdminUser" }, dispatch);
      }

      onSubmit(); // trigger parent refresh
      resetForm();
      handleClose();
    } catch (err) {
       console.error("Error submitting course:", err);
      Swal.fire({
        title: "Submission Failed",
        text: err?.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{course ? "Edit Course" : "Add New Course"}</Modal.Title>
      </Modal.Header>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        validate={(values) => {
          try {
            validationSchema.validateSync(values, { abortEarly: false });
            return {};
          } catch (err) {
            console.log("❌ Yup validation errors:", err.inner); // 🔍 debug log
            const errors = {};
            err.inner.forEach((e) => {
              errors[e.path] = e.message;
            });
            return errors;
          }
        }}
      >
        {({ resetForm }) => (
        <Form>
  <Modal.Body>
    {/* Course Name */}
    <div className="mb-3">
      <label>
        Course Name <span style={{ color: "red" }}>*</span>
      </label>
      <Field
        type="text"
        name="courseName"
        className="form-control"
        maxLength={100}
      />
      <ErrorMessage
        name="courseName"
        component="div"
        className="error-message"
      /> 
    </div>

    {/* Course Code */}
    <div className="mb-3">
      <label>
        Course Code <span style={{ color: "red" }}>*</span>
      </label>
      <Field
        type="text"
        name="courseCode"
        className="form-control"
        maxLength={10}
      />
       <ErrorMessage
        name="courseCode"
        component="div"
        className="error-message"
      /> 
    </div>

    {/* Course Fee */}
    <div className="mb-3">
      <label>
        Course Fees <span style={{ color: "red" }}>*</span>
      </label>
      <Field
        type="text"
        name="courseFee"
        className="form-control"
        maxLength={10}
      />
      <ErrorMessage
        name="courseFee"
        component="div"
        className="error-message"
      /> 
    </div>

    {/* Course Status */}
    <div className="mb-3 form-check">
      <Field name="status">
        {({ field, form }) => (
          <input
            type="checkbox"
            id="status"
            className="form-check-input"
            checked={field.value === "Active"}
            onChange={(e) => {
              form.setFieldValue("status", e.target.checked ? "Active" : "UnActive");
            }}
          />
        )}
      </Field>
      <label htmlFor="status" className="form-check-label">
        Course Active
      </label>

      {/* Error Message for Status */}
       <ErrorMessage
        name="status"
        component="div"
        className="error-message"
      /> 
    </div>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => resetForm()}>
      Clear
    </Button>
    <Button type="submit" variant="primary">
      {course ? "Update" : "Add"}
    </Button>
  </Modal.Footer>
</Form>

        )}
      </Formik>
    </Modal>
  );
}
