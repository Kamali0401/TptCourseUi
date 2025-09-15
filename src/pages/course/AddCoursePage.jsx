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
    .matches(
      /^[A-Za-z0-9 .-]+$/,
      "Course Name can only contain letters, numbers, spaces, dot and hyphen"
    )
    .max(100, "Course Name must be at most 100 characters")
    .required("Course Name is required"),

  courseCode: Yup.string()
  .matches(
    /^[A-Za-z0-9_&-]+$/,
    "Course Code can only contain letters, numbers, hyphen or underscore"
  )
    .max(20, "Course Code must be at most 20 characters")
    .required("Course Code is required"),

courseFee: Yup.string()
  .required("Course Fee is required")
 // .matches(/^\d+(\.\d{1,2})?$/, "Course Fee must be a valid number with up to 2 decimals")
  .max(10, "Course Fee cannot exceed 10 characters"),

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
    }finally {
      setSubmitting(false); // ✅ re-enable button
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
        {({ resetForm , isSubmitting}) => (
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
       onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z 0-9 &.-]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
       }}
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
        maxLength={20}
       onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z 0-9.-]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
       }}
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
  onInput={(e) => {
    let val = e.target.value;
    val = val.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts[1];
    }
    if (parts[1]?.length > 2) {
      val = parts[0] + "." + parts[1].slice(0, 2);
    }
    if (val.length > 10) {
      val = val.slice(0, 10);
    }
    e.target.value = val;
  }}
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
    <Button variant="secondary" onClick={() => resetForm
      ({
        values:{
        courseName: "",
        courseCode: "",
        courseFee: "",
        status: "UnActive"
        },
      }
    )}
     //disabled={isSubmitting} // prevent clear spam during submit
    >
      Clear
    </Button>
<Button type="submit" variant="primary" disabled={isSubmitting}>
  {isSubmitting ? (course ? "Updating..." : "Adding...") : course ? "Update" : "Add"}
</Button>

  </Modal.Footer>
</Form>

        )}
      </Formik>
    </Modal>
  );
}
