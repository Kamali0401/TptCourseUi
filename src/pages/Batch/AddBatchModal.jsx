import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import Datetime from "react-datetime";
import moment from "moment";
import Swal from "sweetalert2";
import {addNewBatch,updateBatch} from "../../app/redux/slice/batchSlice";
//import { useDispatch } from "react-redux";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import "../course/courseform.css"; // Reuse same CSS if shared
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseListReq} from "../../api/course/course";
const validationSchema = Yup.object({
  batchName: Yup.string()
  .matches(/^[A-Za-z0-9 .-]+$/, "Batch Name can only contain letters, numbers, space, dot, hyphen")
  .max(100, "Batch Name must be at most 100 characters")
  .required("Batch Name is required"),
//  courseName: Yup.string().required("Course Name is required"),
 courseID: Yup.string().required("Course is required"), // 🔹 use courseID
  startDate: Yup.date().required("Start Date is required"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "End Date cannot be before Start Date")
    .required("End Date is required"),
  instructorName: Yup.string()
    .max(100, "Instructor Name must be at most 100 characters")
    .required("Instructor Name is required") .matches(/^[A-Za-z0-9 .-]+$/),
totalSeats: Yup.number()
  .nullable() // allow null while typing
  .transform((value, originalValue) =>
    String(originalValue).trim() === "" ? null : value
  )
  .typeError("Total Seats must be a number")
  .required("Total Seats is required"),

  startTime: Yup.string().required("Start Time is required"),
  endTime: Yup.string().required("End Time is required"),
   status: Yup.string()
      //.oneOf(["Active", "UnActive"], "Status must be Active or UnActive") // ✅ string validation
      .required("Status is required"),
});

export default function AddBatchModal({ show, handleClose, onSubmit, batch }) {
    const dispatch = useDispatch();
   const [courseList, setCourseList] = useState([]);
    console.log(courseList,"courseList")
    // Fetch courses when modal opens
  useEffect(() => {
    const loadCourses = async () => {
      try {
        debugger;
        const response = await fetchCourseListReq(); // 🔹 call API
        if (response) {
          setCourseList(response.data); // 🔹 store in state
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        Swal.fire("Error", "Failed to load courses", "error");
      }
    };

    if (show) {
      loadCourses();
    }
  }, [dispatch, show]);
  const [initialValues, setInitialValues] = useState({
    batchName: "",
     courseID: "",  
    startDate: null,
    endDate: null,
    totalSeats:0,
    availableSeats:0,
    instructorName: "",
    startTime: "",
    endTime: "",
    status:"UnActive"
  });

  // Prefill values for editing
  useEffect(() => {
    if (batch) {
      debugger;
      setInitialValues({
        batchName: batch.batchName || "",
         courseID: batch.courseID || "",
        startDate: batch.startDate ? new Date(batch.startDate) : null,
        endDate: batch.endDate ? new Date(batch.endDate) : null,
        totalSeats:batch.totalSeats ||0,
        availableSeats:batch.availableSeats ||0,
        instructorName: batch.instructorName || "",
        startTime: batch.startTime || "", 
        endTime: batch.endTime || "",
         status: batch.status || "UnActive",
      });
    } else {
      setInitialValues({
        batchName: "",
        courseID: "",
        startDate: null,
        endDate: null,
        totalSeats:"",
        availableSeats:0,
        instructorName: "",
        startTime: "",
        endTime: "",
        status:""
      });
    }
  }, [batch, show]);

  const handleFormSubmit =async (values, { resetForm }) => {
     console.log("✅ Final Form Values:", values);
    debugger;
    try{
       const finalValues = {
    ...values,
     courseID: Number(values.courseID),
  startDate: values.startDate
    ? moment(values.startDate).format("YYYY-MM-DD")
    : null,
  endDate: values.endDate
    ? moment(values.endDate).format("YYYY-MM-DD")
    : null,
    startTime: values.startTime 
      ? moment(values.startTime, "hh:mm A").format("HH:mm:ss")
      : null,
    endTime: values.endTime
      ? moment(values.endTime, "hh:mm A").format("HH:mm:ss")
      : null,
  };
      debugger;
     if (batch) {
            // 🔹 Update course
            await updateBatch({ ...finalValues, batchID: batch.batchID ,modifiedBy: "AdminUser"},dispatch);
          } else {
            // 🔹 Add new course
            await addNewBatch({ ...finalValues, createdBy: "AdminUser" }, dispatch);
          }
    
          onSubmit(); // trigger parent refresh
          resetForm();
          handleClose();
        } catch (err) {
           console.error("Error submitting batch:", err);
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
        <Modal.Title>{batch ? "Edit Batch" : "Add New Batch"}</Modal.Title>
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
        {({ values, setFieldValue, resetForm }) => (
          useEffect(() => {
            if (!batch) {
              setFieldValue("availableSeats", values.totalSeats || 0);
            }
            
          }, [values.totalSeats, batch, setFieldValue]),
          <Form>
            <Modal.Body>
              <div className="mb-3">
                <label>Batch Name <span style={{ color: "red" }}>*</span></label>
                <Field type="text" name="batchName" className="form-control" />
 <ErrorMessage
        name="batchName"
        component="div"
        className="error-message"
      />               </div>

             {/* ✅ Course Name Dropdown */}
              <div className="mb-3">
                <label>Course Name <span style={{ color: "red" }}>*</span></label>
                <Field as="select" name="courseID" className="form-control">
                  <option value="">-- Select Course --</option>
                  {courseList.map((course) => (
                    <option key={course.courseID} value={course.courseID}>
                      {course.courseName}
                    </option>
                  ))}
                </Field>
 <ErrorMessage
        name="courseID"
        component="div"
        className="error-message"
      />               </div>

              <div className="mb-3">
                <label>Start Date <span style={{ color: "red" }}>*</span></label>
                <DatePicker
                  selected={values.startDate}
                  onChange={(date) => setFieldValue("startDate", date)}
                  className="form-control"
                  minDate={new Date()}
                  placeholderText="Select Start Date"
                />
 <ErrorMessage
        name="startDate"
        component="div"
        className="error-message"
      />               </div>

              <div className="mb-3">
                <label>End Date <span style={{ color: "red" }}>*</span></label>
                <DatePicker
                  selected={values.endDate}
                  onChange={(date) => setFieldValue("endDate", date)}
                  minDate={values.startDate || new Date()}
                  className="form-control"
                  placeholderText="Select End Date"
                />
 <ErrorMessage
        name="endDate"
        component="div"
        className="error-message"
      />               
      </div>

        <div className="mb-3">
        <label>Total Seats <span style={{ color: "red" }}>*</span></label>
        <Field type="number" name="totalSeats" className="form-control"
          onInput={(e) => {
    // Allow only first 3 digits
    e.target.value = e.target.value.slice(0, 3);
  }}
        />
        
       <ErrorMessage
        name="totalSeats"
        component="div"
        className="error-message"
      />               </div>
               <div className="mb-3">
        <label>Available Seats</label>
        <Field
          type="text"
          name="availableSeats"
          className="form-control"
          readOnly
        />
         <ErrorMessage
        name="availableSeats"
        component="div"
        className="error-message"
      /> 
      </div>

              
              <div className="mb-3">
                <label>Instructor Name <span style={{ color: "red" }}>*</span></label>
                <Field type="text" name="instructorName" className="form-control" />
 <ErrorMessage
        name="instructorName"
        component="div"
        className="error-message"
      />               </div>

              <div className="mb-3">
                <label>Start Time <span style={{ color: "red" }}>*</span></label>
                <Datetime
                  dateFormat={false}
                  timeFormat="hh:mm A"
                  value={values.startTime ? moment(values.startTime, "hh:mm A") : null}
                  onChange={(val) => setFieldValue("startTime", val.format("hh:mm A"))}
                  inputProps={{
                    className: "form-control",
                    placeholder: "Select Start Time",
                   // style: { textAlign: "center" },
                  }}
                />
 <ErrorMessage
        name="startTime"
        component="div"
        className="error-message"
      />               </div>

              <div className="mb-3">
                <label>End Time <span style={{ color: "red" }}>*</span></label>
                <Datetime
                  dateFormat={false}
                  timeFormat="hh:mm A"
                  value={values.endTime ? moment(values.endTime, "hh:mm A") : null}
                  onChange={(val) => setFieldValue("endTime", val.format("hh:mm A"))}
                  inputProps={{
                    className: "form-control",
                    placeholder: "Select End Time",
                   // style: { textAlign: "center" },
                  }}
                />
 <ErrorMessage
        name="endTime"
        component="div"
        className="error-message"
      />               </div>
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
                      Batch Active
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
                {batch ? "Update" : "Add"}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
