import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import Datetime from "react-datetime";
import moment from "moment";
import Swal from "sweetalert2";
import { addNewBatch, updateBatch } from "../../app/redux/slice/batchSlice";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import "../course/courseform.css";
import { useDispatch } from "react-redux";
import { fetchCourseListReq } from "../../api/course/course";

const validationSchema = Yup.object({
  batchName: Yup.string()
    .matches(/^[A-Za-z0-9 .-]+$/, "Batch Name can only contain letters, numbers, space, dot, hyphen")
    .max(100, "Batch Name must be at most 100 characters")
    .required("Batch Name is required"),
  courseID: Yup.string().required("Course is required"),
  startDate: Yup.date().required("Start Date is required"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "End Date cannot be before Start Date")
    .required("End Date is required"),
  instructorName: Yup.string()
    .max(100, "Instructor Name must be at most 100 characters")
    .required("Instructor Name is required") .matches(/^[A-Za-z0-9 .-]+$/),
totalSeats: Yup.number()
  .nullable()
  .transform((value, originalValue) =>
    String(originalValue).trim() === "" ? null : value
  )
  .typeError("Total Seats must be a number")
  .required("Total Seats is required")
  .min(1, "Total Seats must be greater than 0"),   // <-- added


  startTime: Yup.string().required("Start Time is required"),
   endTime: Yup.date()
    .required("End Time is required")
    .test("is-after-start", "End Time must be after Start Time and not equal", function(value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return moment(value).isAfter(moment(startTime));
    }),
   status: Yup.string()
      //.oneOf(["Active", "UnActive"], "Status must be Active or UnActive") // ✅ string validation
      .required("Status is required"),
});

export default function AddBatchModal({ show, handleClose, onSubmit, batch }) {
  const dispatch = useDispatch();
  const [courseList, setCourseList] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetchCourseListReq();
        if (response) {
          setCourseList(response.data);
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
    totalSeats: "",
    availableSeats: 0,
    instructorName: "",
    startTime: null,
    endTime: null,
    status: "UnActive",
  });

  useEffect(() => {
    if (batch) {
      setInitialValues({
        batchName: batch.batchName || "",
        courseID: batch.courseID || "",
        startDate: batch.startDate ? new Date(batch.startDate) : null,
        endDate: batch.endDate ? new Date(batch.endDate) : null,
        totalSeats: batch.totalSeats || "",
        availableSeats: batch.availableSeats || 0,
        instructorName: batch.instructorName || "",
        startTime: batch.startTime
          ? new Date(`1970-01-01T${batch.startTime}`)
          : null,
        endTime: batch.endTime
          ? new Date(`1970-01-01T${batch.endTime}`)
          : null,
        status: batch.status || "UnActive",
      });
    } else {
      setInitialValues({
        batchName: "",
        courseID: "",
        startDate: null,
        endDate: null,
        totalSeats: "",
        availableSeats: 0,
        instructorName: "",
        startTime: null,
        endTime: null,
        status: "UnActive",
      });
    }
  }, [batch, show]);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const finalValues = {
        ...values,
        courseID: Number(values.courseID),
        startDate: values.startDate ? moment(values.startDate).format("YYYY-MM-DD") : null,
        endDate: values.endDate ? moment(values.endDate).format("YYYY-MM-DD") : null,
        startTime: values.startTime ? moment(values.startTime).format("HH:mm:ss") : null,
        endTime: values.endTime ? moment(values.endTime).format("HH:mm:ss") : null,
      };

      if (batch) {
        await updateBatch({ ...finalValues, batchID: batch.batchID, modifiedBy: "AdminUser" }, dispatch);
      } else {
        await addNewBatch({ ...finalValues, createdBy: "AdminUser" }, dispatch);
      }

      onSubmit();
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
      >
        {({ values, setFieldValue, resetForm , isSubmitting,errors,setFieldError}) => (
          useEffect(() => {
            if (!batch) {
              setFieldValue("availableSeats", values.totalSeats || 0);
            }
            
          }, [values.totalSeats, batch, setFieldValue]),
          <Form>
            <Modal.Body>
              <div className="mb-3">
                <label>Batch Name <span style={{ color: "red" }}>*</span></label>
                <Field type="text" name="batchName" className="form-control" 
        maxlength={100}
        onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z 0-9.-]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
       }}/>
        <ErrorMessage
        name="batchName"
        component="div"
        className="error-message"
      />               </div>

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
                <ErrorMessage name="courseID" component="div" className="error-message" />
              </div>

              <div className="mb-3">
                <label>Start Date <span style={{ color: "red" }}>*</span></label>
                <DatePicker
                  selected={values.startDate}
                  onChange={(date) => setFieldValue("startDate", date)}
                  className="form-control"
                  minDate={new Date()}
                  placeholderText="Select Start Date"
                />
                <ErrorMessage name="startDate" component="div" className="error-message" />
              </div>

              <div className="mb-3">
                <label>End Date <span style={{ color: "red" }}>*</span></label>
                <DatePicker
                  selected={values.endDate}
                  onChange={(date) => setFieldValue("endDate", date)}
                  minDate={values.startDate || new Date()}
                  className="form-control"
                  placeholderText="Select End Date"
                />
                <ErrorMessage name="endDate" component="div" className="error-message" />
              </div>

              <div className="mb-3">
                <label>Total Seats <span style={{ color: "red" }}>*</span></label>
                <Field
                  type="number"
                  name="totalSeats"
                  className="form-control"
                  onInput={(e) => {
                    e.target.value = e.target.value.slice(0, 3);
                     const value = e.target.value;
      setFieldValue("totalSeats", value);
      setFieldValue("availableSeats", value); // Sync Available Seats
                  }}
                />
                <ErrorMessage name="totalSeats" component="div" className="error-message" />
              </div>

              <div className="mb-3">
                <label>Available Seats</label>
                <Field type="text" name="availableSeats" className="form-control" readOnly />
                <ErrorMessage name="availableSeats" component="div" className="error-message" />
              </div>

              <div className="mb-3">
                <label>Instructor Name <span style={{ color: "red" }}>*</span></label>
                <Field type="text" name="instructorName" className="form-control"   
            onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z .-]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
            }}/>
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
                  value={values.startTime ? moment(values.startTime).toDate() : null}
                  onChange={(val) => {
                    const dateObj = val.toDate ? val.toDate() : val;
                    setFieldValue("startTime", dateObj);
                    setFieldError("startTime", "");

                    if (values.endTime) {
                      const start = moment(dateObj);
                      const end = moment(values.endTime);
                      if (!end.isAfter(start)) {
                        setFieldError("endTime", "End Time must be after Start Time and not equal");
                      } else {
                        setFieldError("endTime", "");
                      }
                    }
                  }}
                  inputProps={{
                    className: "form-control",
                    placeholder: "Select Start Time",
                  }}
                />
                <ErrorMessage name="startTime" component="div" className="error-message" />
              </div>

              <div className="mb-3">
                <label>End Time <span style={{ color: "red" }}>*</span></label>
                <Datetime
                  dateFormat={false}
                  timeFormat="hh:mm A"
                  value={values.endTime ? moment(values.endTime).toDate() : null}
                  onChange={(val) => {
                    if (!values.startTime) {
                      setFieldValue("endTime", null);
                      setFieldError("endTime", "Select Start Time first");
                      return;
                    }

                    const dateObj = val.toDate ? val.toDate() : val;
                    const start = moment(values.startTime);
                    const end = moment(dateObj);

                    if (!end.isAfter(start)) {
                      setFieldError("endTime", "End Time must be after Start Time and not equal");
                      return;
                    }

                    setFieldValue("endTime", dateObj);
                    setFieldError("endTime", "");
                  }}
                  inputProps={{
                    className: "form-control",
                    placeholder: "Select End Time",
                  }}
                />
                <ErrorMessage name="endTime" component="div" className="error-message" />
              </div>

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
                <label htmlFor="status" className="form-check-label">Batch Active</label>
                <ErrorMessage name="status" component="div" className="error-message" />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => resetForm
                ({
               values:{
               batchName: "",
               courseID: "",
               startDate: "",
               endDate: "",
               totalSeats: "",
               availableSeats: "",
               instructorName: "",
               startTime: null,
               endTime: null,
               status:"",
               
               },
              }
              )}>
                Clear
              </Button>
<Button type="submit" variant="primary" disabled={isSubmitting}>
  {isSubmitting ? (batch ? "Updating..." : "Adding...") : batch ? "Update" : "Add"}
</Button>

            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
