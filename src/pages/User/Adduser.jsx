import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../course/courseform.css";
import Swal from "sweetalert2";
import { addNewUser, updateUser } from "./../../app/redux/slice/usersSlice";
import { useDispatch } from "react-redux";

// ✅ Validation Schema
const getValidationSchema = (isEdit) =>
  Yup.object({
    fullName: Yup.string()
      .matches(/^[A-Za-z .'-]+$/, "Full Name can only contain letters and spaces")
      .max(100, "Max 100 characters")
      .required("Full Name is required"),

    username: Yup.string()
      .max(50, "Max 50 characters")
      .required("Username is required"),

    password: isEdit
      ? Yup.string() // optional in edit
      : Yup.string()
          .min(6, "Minimum 6 characters")
          .max(50, "Max 50 characters")
          .required("Password is required"),

    address: Yup.string()
      .max(200, "Max 200 characters")
      .required("Address is required"),

    role: Yup.string()
      .oneOf(["Admin", "User"], "Invalid role")
      .required("Role is required"),

    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Must be 10 digits")
      .required("Phone Number is required"),
  });

export default function AddUserPage({ show, handleClose, onSubmit, user }) {
  const dispatch = useDispatch();

  const [initialValues, setInitialValues] = useState({
    fullName: "",
    username: "",
    password: "",
    address: "",
    role: "",
    phoneNumber: "",
  });

  // ✅ Prefill (NO password for edit)
  useEffect(() => {
    if (user) {
      setInitialValues({
        fullName: user.fullName || "",
        username: user.username || "",
        password: "", // ❌ never prefill
        address: user.address || "",
        role: user.role || "",
        phoneNumber: user.phoneNumber || "",
      });
    } else {
      setInitialValues({
        fullName: "",
        username: "",
        password: "",
        address: "",
        role: "",
        phoneNumber: "",
      });
    }
  }, [user, show]);

  const handleFormSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (user) {
        // ✅ Remove password during update
        const { password, ...rest } = values;

        const payload = {
          ...rest,
          Id: user.id,
          modifiedBy: "AdminUser",
        };

        await updateUser(payload, dispatch);
      } else {
        // ✅ Add with password
        await addNewUser({ ...values, createdBy: "AdminUser" }, dispatch);
      }

      onSubmit();
      resetForm();
      handleClose();
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        title: "Error",
        text: err?.errorMsg || "Something went wrong",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{user ? "Edit User" : "Add New User"}</Modal.Title>
      </Modal.Header>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={getValidationSchema(!!user)}
        onSubmit={handleFormSubmit}
      >
        {({ resetForm, isSubmitting }) => (
          <Form>
            <Modal.Body>
              {/* Full Name */}
              <div className="mb-3">
                <label>
                  Full Name <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  type="text"
                  name="fullName"
                  className="form-control"
                  maxLength={100}
                />
                <ErrorMessage name="fullName" component="div" className="error-message" />
              </div>

              {/* Username */}
              <div className="mb-3">
                <label>
                  Username <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  type="text"
                  name="username"
                  className="form-control"
                  maxLength={50}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z 0-9 @ .]/g, "");
                    e.target.value = e.target.value.replace(/\s{2,}/g, " ");
                  }}
                />
                <ErrorMessage name="username" component="div" className="error-message" />
              </div>

              {/* ✅ Password (ONLY for Add) */}
              {!user && (
                <div className="mb-3">
                  <label>
                    Password <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className="form-control"
                    maxLength={50}
                  />
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>
              )}

              {/* Address */}
              <div className="mb-3">
                <label>
                  Address <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  as="textarea"
                  name="address"
                  className="form-control"
                  maxLength={200}
                  rows="2"
                />
                <ErrorMessage name="address" component="div" className="error-message" />
              </div>

              {/* Role */}
              <div className="mb-3">
                <label>
                  Role <span style={{ color: "red" }}>*</span>
                </label>
                <Field as="select" name="role" className="form-control">
                  <option value="">-- Select Role --</option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </Field>
                <ErrorMessage name="role" component="div" className="error-message" />
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label>
                  Phone Number <span style={{ color: "red" }}>*</span>
                </label>
                <Field
                  type="text"
                  name="phoneNumber"
                  className="form-control"
                  maxLength={10}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");

                    if (e.target.value.startsWith("0")) {
                      e.target.value = e.target.value.slice(1);
                    }

                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
                    }
                  }}
                />
                <ErrorMessage name="phoneNumber" component="div" className="error-message" />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() =>
                  resetForm({
                    values: {
                      fullName: "",
                      username: "",
                      password: "",
                      address: "",
                      role: "",
                      phoneNumber: "",
                    },
                  })
                }
              >
                Clear
              </Button>

              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? user
                    ? "Updating..."
                    : "Adding..."
                  : user
                  ? "Update"
                  : "Add"}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}