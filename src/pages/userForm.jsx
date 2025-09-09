import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { Modal, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./userform.css";
import { fetchCourseListReq } from '../api/course/course';
import { fetchBatchDropdownReq } from '../api/batch/batch';
import { useDispatch } from "react-redux";
import { updateForm, addNewForm } from '../app/redux/slice/formSlice';
import Swal from "sweetalert2";
import axios from "axios";
import { loadRazorpay } from "../../src/utlis/razorpay";
import { updateFormReq } from '../api/form/form';

const QUALIFICATIONS = [
  { key: 'sslc', label: 'SSLC' },
  { key: 'hsc', label: 'HSC' },
  { key: 'diploma', label: 'Diploma' },
  { key: 'degree', label: 'Degree' },
  { key: 'pg', label: 'PG' },
  { key: 'others', label: 'Others' },
];
const MODE_OPTIONS = [];

const UserForm = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const applicationform = location.state?.applicationform;

  const [isPaymentDone, setIsPaymentDone] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // 🔹 File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(applicationform?.uploadedFileName || '');
  const [fileUrl, setFileUrl] = useState(applicationform?.fileUrl || '');
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadedFileName(e.target.files[0].name);
      setFileUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', uploadedFileName || 'file');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    }
  };

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
    loadCourses();
  }, [dispatch]);

  const handleCourseChange = async (courseId, setFieldValue) => {
    setFieldValue("courseId", courseId);
    setFieldValue("batchId", "");
    setSelectedBatch(null);
    try {
      const response = await fetchBatchDropdownReq(courseId);
      setBatches(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const handleBatchChange = (batchId, setFieldValue) => {
    setFieldValue("batchId", batchId);
    const batch = batches.find(b => b.batchID === parseInt(batchId));
    setSelectedBatch(batch || null);
  };

  const parsedEducationDetails = useMemo(() => {
    if (!applicationform?.listEducationDetails) return {};
    try {
      const details = JSON.parse(applicationform.listEducationDetails);
      const educationMap = {};
      const educationTypeToKey = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('sslc') || lowerType.includes('10th')) return 'sslc';
        if (lowerType.includes('hsc') || lowerType.includes('12th')) return 'hsc';
        if (lowerType.includes('diploma')) return 'diploma';
        if (lowerType.includes('degree')) return 'degree';
        if (lowerType.includes('pg')) return 'pg';
        return 'others';
      };
      details.forEach(detail => {
        const key = educationTypeToKey(detail.educationType);
        educationMap[key] = {
          year: detail.yearOfPassing || '',
          marks: detail.percentage || '',
          institution: detail.institution || '',
        };
      });
      return educationMap;
    } catch (e) {
      console.error("Failed to parse education details:", e);
      return {};
    }
  }, [applicationform]);

  const [selectedQuals, setSelectedQuals] = useState(applicationform ? Object.keys(parsedEducationDetails) : []);
  const [dateOfBirth, setDob] = useState(applicationform?.dateOfBirth ? new Date(applicationform.dateOfBirth) : null);

  const toggleQualification = (key) => {
    setSelectedQuals(prev =>
      prev.includes(key) ? prev.filter(q => q !== key) : [...prev, key]
    );
  };

  const handleClose = () => {
    navigate(-1);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    return years;
  };

  const prepareSubmitData = (values) => {
    const educationDetailsList = QUALIFICATIONS
      .filter(qual => selectedQuals.includes(qual.key))
      .map(qual => {
        const detail = values[qual.key];
        if (detail && (detail.year || detail.marks || detail.institution)) {
          return {
            educationType: qual.label,
            yearOfPassing: detail.year || null,
            percentage: detail.marks || null,
            institution: detail.institution || '',
          };
        }
        return null;
      })
      .filter(Boolean);

    const submitValues = { ...values };
    QUALIFICATIONS.forEach(qual => delete submitValues[qual.key]);
    submitValues.educationDetails = educationDetailsList;
    return submitValues;
  };

  const handleSave = async (values) => {
    const payload = prepareSubmitData(values);
    await addNewForm({
      ...payload,
      courseId: Number(payload.courseId),
      batchId: Number(payload.batchId),
      createdBy: "AdminUser",
    }, dispatch);
  };

  const handleUpdate = async (values) => {
    const payload = prepareSubmitData(values);
    await updateForm({ ...payload, modifiedBy: "AdminUser" }, dispatch);
  };

  const initialValues = applicationform ? {
    candidateName: applicationform.candidateName || '',
    sex: applicationform.sex || '',
    fatherOrHusbandName: applicationform.fatherOrHusbandName || '',
    contactAddress: applicationform.contactAddress || '',
    mobileNumber: applicationform.mobileNumber || '',
    dateOfBirth: applicationform.dateOfBirth ? new Date(applicationform.dateOfBirth) : null,
    age: applicationform.age || '',
    aadharNumber: applicationform.aadharNumber || '',
    email: applicationform.email || '',
    modeOfAdmission: applicationform.modeOfAdmission || '',
    candidateStatus: applicationform.candidateStatus ? 'Employed' : '',
    ifEmployed_WorkingAt: applicationform.ifEmployed_WorkingAt || '',
    designation: applicationform.designation || '',
    declaration: applicationform.declaration || false,
    place: applicationform.place || '',
    bloodGroup: applicationform.bloodGroup || '',
    applicationDate: applicationform.applicationDate ? new Date(applicationform.applicationDate) : null,
    ...QUALIFICATIONS.reduce((acc, qual) => {
      acc[qual.key] = parsedEducationDetails[qual.key] || { year: '', marks: '', institution: '' };
      return acc;
    }, {})
  } : {
    candidateName: '',
    sex: '',
    fatherOrHusbandName: '',
    contactAddress: '',
    mobileNumber: '',
    dateOfBirth: null,
    age: '',
    aadharNumber: '',
    email: '',
    modeOfAdmission: '',
    candidateStatus: '',
    ifEmployed_WorkingAt: '',
    designation: '',
    declaration: false,
    place: '',
    applicationDate: null,
    bloodGroup: "",
    sslc: { year: '', marks: '', institution: '' },
    hsc: { year: '', marks: '', institution: '' },
    diploma: { year: '', marks: '', institution: '' },
    degree: { year: '', marks: '', institution: '' },
    pg: { year: '', marks: '', institution: '' },
    others: { year: '', marks: '', institution: '' },
  };

  const handleRazorpayPayment = (data) => {
    try {
      const options = {
        key: 'rzp_test_6pwjCwtwwp3YOu',
        amount: (selectedBatch.courseFee * 100).toFixed(0),
        currency: 'INR',
        name: 'Thiagarajar Polytechnic College',
        description: 'Course Payment',
        prefill: { contact: '0000000000', name: 'Admin' },
        theme: { color: '#8B5CF6' },
        handler: async function (response) {
          try {
            const apiResponse = await updateFormReq({ ...data, isPaymentDone: true });
            setTimeout(() => { router.navigate('/main/form'); }, 10000);
          } catch (apiError) {
            Swal.fire('Error', 'Payment succeeded but updating form failed', 'error');
          }
        },
        modal: { ondismiss: () => console.log('Payment popup closed by user') },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      Swal.fire('Error', 'Payment initiation failed', 'error');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="card">
        <div className="form-header">
          <button type="button" className="close-icon" onClick={handleClose} aria-label="Close">
            &times;
          </button>
          <h2>THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636005</h2>
          <h3>CONTINUING EDUCATION CENTRE</h3>
          <p>Phone: (0427) 2446219, 4099303 | Email: <a href="mailto:ciicptptc@gmail.com">ciicptptc@gmail.com</a></p>
          <p>Website: <a href="http://www.tpt.edu.in/ciicp" target="_blank" rel="noopener noreferrer">www.tpt.edu.in/ciicp</a></p>
        </div>

       <Formik
  initialValues={initialValues}
  enableReinitialize
  onSubmit={async (values, { setSubmitting }) => {
    if (applicationform) {
      handleUpdate(values);
    } else {
      handleSave(values);
    }
    setSubmitting(false);
  }}
>
  {({ values, setFieldValue }) => (
    <Form>
      <div>
        <label>
          Name of Candidate <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="text" name="candidateName" required />
      </div>

      <div>
        <label>
          Sex <span style={{ color: 'red' }}>*</span>
        </label>
        <Field as="select" name="sex" required>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </Field>
      </div>

      <div>
        <label>
          Name of Father/Husband <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="text" name="fatherOrHusbandName" required />
      </div>

      <div>
        <label>
          Contact Address <span style={{ color: 'red' }}>*</span>
        </label>
        <Field as="textarea" name="contactAddress" required />
      </div>

      <div>
        <label>
          Mobile Number <span style={{ color: 'red' }}>*</span>
        </label>
        <Field name="mobileNumber" type="tel" required />
      </div>

      <div>
        <label>
          Date of Birth <span style={{ color: 'red' }}>*</span>
        </label>
        <DatePicker
          selected={dateOfBirth}
          onChange={(date) => {
            setDob(date);
            setFieldValue('dateOfBirth', date);
            setFieldValue('age', calculateAge(date));
          }}
          dateFormat="yyyy-MM-dd"
          placeholderText="yyyy/mm/dd"
          customInput={
            <input type="text" className="text-input" placeholder="yyyy/mm/dd" />
          }
        />
      </div>

      <div>
        <label>Age</label>
        <Field type="text" name="age" value={values.age} readOnly />
      </div>

      <div>
        <label>
          Aadhaar Number <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="text" name="aadharNumber" required />
      </div>

      <div>
        <label>
          Email ID <span style={{ color: 'red' }}>*</span>
        </label>
        <Field name="email" type="email" required />
      </div>

      <div>
        <label>
          Blood Group <span style={{ color: 'red' }}>*</span>
        </label>
        <Field name="bloodGroup" type="text" required />
      </div>

      {/* Qualification Details Section */}
      <div className="qualification-table-container">
        <h4>
          Academic Qualifications <span style={{ color: 'red' }}>*</span>
        </h4>
        <table className="qualification-table">
          <thead>
            <tr>
              <th>Select Academic Qualification</th>
              <th>Year of Passing</th>
              <th>% of Marks Obtained</th>
              <th>Name of Institution</th>
            </tr>
          </thead>
          <tbody>
            {QUALIFICATIONS.map((qual) => (
              <tr key={qual.key}>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedQuals.includes(qual.key)}
                      onChange={() => toggleQualification(qual.key)}
                    />{' '}
                    {qual.label}
                  </label>
                </td>
                <td>
                  <Field
                    name={`${qual.key}.year`}
                    type="number"
                    disabled={!selectedQuals.includes(qual.key)}
                    required={selectedQuals.includes(qual.key)}
                  />
                </td>
                <td>
                  <Field
                    name={`${qual.key}.marks`}
                    type="number"
                    disabled={!selectedQuals.includes(qual.key)}
                    required={selectedQuals.includes(qual.key)}
                  />
                </td>
                <td>
                  <Field
                    as="textarea"
                    name={`${qual.key}.institution`}
                    disabled={!selectedQuals.includes(qual.key)}
                    required={selectedQuals.includes(qual.key)}
                    style={{
                      height: '41px',
                      padding: '8px',
                      boxSizing: 'border-box',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      resize: 'vertical',
                      minHeight: '0px',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <label>
          Mode of Admission <span style={{ color: 'red' }}>*</span>
        </label>
        <Field as="select" name="modeOfAdmission" required>
          <option value="">Select</option>
          <option value="Advertisement">Advertisement</option>
          <option value="Friends">Friends</option>
          <option value="OldStudent">Old Student</option>
          <option value="Staff">Staff</option>
        </Field>
      </div>

      <div>
        <label>
          Status of Candidate <span style={{ color: 'red' }}>*</span>
        </label>
        <Field as="select" name="candidateStatus" required>
          <option value="">Select</option>
          <option value="Student">Student</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Employed">Employed</option>
          <option value="Business">Business</option>
          <option value="SeniorCitizen">Senior Citizen</option>
        </Field>
      </div>

      {values.candidateStatus === 'Employed' && (
        <>
          <div>
            <label>Working At</label>
            <Field type="text" name="ifEmployed_WorkingAt" />
          </div>
          <div>
            <label>Designation</label>
            <Field type="text" name="designation" />
          </div>
        </>
      )}

      <div>
        <label>
          Place <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="text" name="place" required />
      </div>

      <div>
        <label>
          Date <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="date" name="applicationDate" required />
      </div>

      {/* Course Dropdown */}
      <div>
        <label>
          Course Name <span style={{ color: 'red' }}>*</span>
        </label>
        <Field
          as="select"
          name="courseId"
          onChange={(e) => handleCourseChange(e.target.value, setFieldValue)}
          value={values.courseId}
          required
        >
          <option value="">Select Course</option>
          {courseList.map((course) => (
            <option key={course.courseID} value={course.courseID}>
              {course.courseName}
            </option>
          ))}
        </Field>
      </div>

      <div>
        <label>
          Batch Name <span style={{ color: 'red' }}>*</span>
        </label>
        <Field
          as="select"
          name="batchId"
          onChange={(e) => handleBatchChange(e.target.value, setFieldValue)}
          value={values.batchId}
          required
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch.batchID} value={batch.batchID}>
              {batch.batchName}
            </option>
          ))}
        </Field>
      </div>

      {selectedBatch && (
        <div className="batch-details-card">
          <h4>Batch Details</h4>
          <p>
            <strong>Total Seats:</strong> {selectedBatch.totalSeats}
          </p>
          <p>
            <strong>Available Seats:</strong> {selectedBatch.availableSeats}
          </p>
          <p>
            <strong>Start Date:</strong> {selectedBatch.startDate}
          </p>
          <p>
            <strong>Instructor:</strong> {selectedBatch.instructorName}
          </p>
          <p>
            <strong>Course Fee:</strong> ₹{selectedBatch.courseFee}
          </p>

          {selectedBatch.availableSeats === 0 && (
            <p style={{ color: 'red', fontWeight: 'bold' }}>Batch Full</p>
          )}
        </div>
      )}

      {/* 🔹 File Upload Section (only images, above declaration) */}
      <div className="form-group" style={{ marginTop: '20px' }}>
        <label htmlFor="imageFile">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          className="form-control"
          onChange={(event) => {
            const file = event.currentTarget.files[0];
            if (file) {
              setFieldValue('imageFile', file);
            }
          }}
        />
        
        {applicationform && values.imagePath && (
          <div style={{ marginTop: '15px' }}>
            <img
              src={values.imagePath}
              alt="Uploaded Preview"
              style={{
                width: '150px',
                border: '1px solid #ccc',
                marginBottom: '10px',
              }}
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

      {/* Declaration */}
      <div style={{ marginTop: '10px' }}>
        <label>
          <Field type="checkbox" name="declaration" required /> I hereby declare
          that the details furnished above are correct and I will adhere to the
          rules of the Continuing Education Centre.
        </label>
      </div>

      {/* Buttons */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '300px',
            margin: '0 auto',
          }}
        >
          {selectedBatch && (
            <button
              type="button"
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
              }}
              onClick={() => handleRazorpayPayment(applicationform)}
            >
              Pay ₹{selectedBatch.courseFee}{' '}
              <span role="img" aria-label="lock">
                🔒
              </span>
            </button>
          )}

          <button
            type="submit"
            style={{
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {applicationform ? 'Update' : 'Submit'}
          </button>

          <button
            type="button"
            style={{
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
            }}
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </Form>
  )}
</Formik>
</div>
    </div>
  );
};

export default UserForm;
