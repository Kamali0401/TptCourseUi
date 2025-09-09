import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../course/courseform.css";

const QUALIFICATIONS = [
  { key: 'sslc', label: 'SSLC' },
  { key: 'hsc', label: 'HSC' },
  { key: 'diploma', label: 'Diploma' },
  { key: 'degree', label: 'Degree' },
  { key: 'pg', label: 'PG' },
  { key: 'others', label: 'Others' },
];

export default function AddApplicationFormPage({ show, handleClose, onSubmit, initialData ,applicationform}) {
  const [selectedQuals, setSelectedQuals] = useState([]);
  const [dob, setDob] = useState(null);

  const toggleQualification = (key) => {
    setSelectedQuals((prev) =>
      prev.includes(key) ? prev.filter((q) => q !== key) : [...prev, key]
    );
  };

  const calculateAge = (date) => {
    if (!date) return '';
    const birthDate = new Date(date);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) years--;
    return years;
  };

  const baseInitial = {
    name: '',
    sex: '',
    fatherName: '',
    address: '',
    mobile: '',
    dob: null,
    age: '',
    aadhaar: '',
    email: '',
    admission: '',
    status: '',
    workingAt: '',
    designation: '',
    declaration: false,
    place:"",
    date:null,
    imageFile: null,   // 🔹 for upload
    imagePath: "",     // 🔹 for preview/download
    sslc: { year: '', marks: '', institution: '' },
    hsc: { year: '', marks: '', institution: '' },
    diploma: { year: '', marks: '', institution: '' },
    degree: { year: '', marks: '', institution: '' },
    pg: { year: '', marks: '', institution: '' },
    others: { year: '', marks: '', institution: '' },
  };

  useEffect(() => {
    if (initialData) {
      setDob(initialData.dob ? new Date(initialData.dob) : null);
      setSelectedQuals(initialData.qualifications || []);
    } else {
      setDob(null);
      setSelectedQuals([]);
    }
  }, [initialData, show]);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit User' : 'Add User'}</Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize
        initialValues={ initialData ? { ...baseInitial, ...initialData } : baseInitial }
        onSubmit={(values, { resetForm }) => {
          const formData = new FormData();
          Object.keys(values).forEach((key) => {
            if (key === "imageFile" && values[key]) {
              formData.append("imageFile", values[key]);
            } else {
              formData.append(key, values[key]);
            }
          });
          onSubmit(formData);
          resetForm();
          handleClose();
        }}
      >
        {({ values, setFieldValue, resetForm }) => (
          <Form>
            <Modal.Body>
              {/* Include your header card here */}
              
              {/* Form Fields */}
              <label>Name of Candidate</label>
              <Field type="text" name="name" required className="form-control"/>

              <label>Sex</label>
              <Field as="select" name="sex" required className="form-control">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </Field>

              <label>Name of Father/Husband</label>
              <Field type="text" name="fatherName" className="form-control" required />

              <label>Contact Address</label>
              <Field as="textarea" name="address" className="form-control" required />

              <label>Mobile Number</label>
              <Field type="tel" name="mobile" className="form-control" required />

              <label>Date of Birth</label>
              <DatePicker
                selected={dob}
                onChange={(date) => {
                  setDob(date);
                  setFieldValue("dob", date);
                  setFieldValue("age", calculateAge(date));
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Date of Birth"
                className="form-control"
              />

              <label>Age</label>
              <Field type="text" name="age" value={values.age} readOnly className="form-control"/>

              <label>Aadhaar Number</label>
              <Field type="text" name="aadhaar" className="form-control" required />

              <label>Email ID</label>
              <Field type="email" name="email" className="form-control" required />

              <div className="checkbox-group">
                <label>Select Qualifications</label>
                {QUALIFICATIONS.map((qual) => (
                  <label key={qual.key}>
                    <input
                      type="checkbox"
                      checked={selectedQuals.includes(qual.key)}
                      onChange={() => toggleQualification(qual.key)}
                    /> {qual.label}
                  </label>
                ))}
              </div>

              {selectedQuals.map((qualKey) => {
                const label = QUALIFICATIONS.find((q) => q.key === qualKey)?.label;
                return (
                  <div key={qualKey} className="qualification-block">
                    <h2>{label} Details</h2>
                    <div className="form-grid">
                      <div>
                        <label>Year of Passing</label>
                        <Field name={`${qualKey}.year`} type="number" className="form-control" required />
                      </div>
                      <div>
                        <label>% of Marks Obtained</label>
                        <Field name={`${qualKey}.marks`} type="number" className="form-control" required />
                      </div>
                      <div>
                        <label>Name of Institution</label>
                        <Field name={`${qualKey}.institution`} type="text" className="form-control" required />
                      </div>
                    </div>
                  </div>
                );
              })}

              <label>Mode of Admission</label>
              <Field as="select" name="admission" className="form-control">
                <option value="">Select</option>
                <option>Advertisement</option>
                <option>Friends</option>
                <option>Old Student</option>
                <option>Staff</option>
              </Field>

              <label>Status of Candidate</label>
              <Field as="select" name="status" className="form-control">
                <option value="">Select</option>
                <option>Student</option>
                <option>Unemployed</option>
                <option>Employed</option>
                <option>Business</option>
                <option>Senior Citizen</option>
              </Field>

              {values.status === 'Employed' && (
                <>
                  <label>Working At</label>
                  <Field name="workingAt" type="text" className="form-control" />

                  <label>Designation</label>
                  <Field name="designation" type="text" className="form-control" />
                </>
              )}
              
              <label>
                Place <span style={{ color: 'red' }}>*</span>
              </label>
              <Field type="text" name="place" required />
            
              <label>
                Date <span style={{ color: 'red' }}>*</span>
              </label>
              <Field type="date" name="date" required />

              {/* 🔹 File Upload & Download */}
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label htmlFor="imageFile">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    if (file) {
                      setFieldValue("imageFile", file);
                    }
                  }}
                />

                {values.imageFile && (
                  <div style={{ marginTop: "10px" }}>
                    <strong>Selected:</strong> {values.imageFile.name}
                  </div>
                )}

                {applicationform && values.imagePath && (
                  <div style={{ marginTop: "15px" }}>
                    <img
                      src={values.imagePath}
                      alt="Uploaded Preview"
                      style={{ width: "150px", border: "1px solid #ccc", marginBottom: "10px" }}
                    />
                    <div>
                      <a
                        href={values.imagePath}
                        download
                        className="btn btn-sm btn-primary"
                      >
                        Download Image
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <label>
                <Field type="checkbox" name="declaration" required />
                I hereby declare that the details furnished above are correct and I will adhere the rules of Continuing Education Centre.
              </label>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => resetForm()}> Clear </Button>
              <Button variant="primary" type="submit">
                {initialData ? "Update" : "Submit"}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
