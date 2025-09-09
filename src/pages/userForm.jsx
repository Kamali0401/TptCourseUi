import React, { useState, useMemo,useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./userform.css";
import { fetchCourseListReq } from '../api/course/course';
import {fetchBatchDropdownReq} from '../api/batch/batch';
import { useDispatch, useSelector } from "react-redux";
import { updateForm ,addNewForm} from '../app/redux/slice/formSlice';
import { uploadFormFilesReq,downloadFormFilesReq} from '../../src/api/form/form';

//import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import { loadRazorpay } from "../../src/utlis/razorpay"; // Adjust path accordingly
import { updateFormReq } from '../api/form/form';
//import RazorpayCheckout, { CheckoutOptions } from 'react-native-razorpay';
//import RazorpayCheckout from 'react-native-razorpay';


const QUALIFICATIONS = [
  { key: 'sslc', label: 'SSLC' },
  { key: 'hsc', label: 'HSC' },
  { key: 'diploma', label: 'Diploma' },
  { key: 'degree', label: 'Degree' },
  { key: 'pg', label: 'PG' },
  { key: 'others', label: 'Others' },
];const MODE_OPTIONS = [/* your mode options */];

const UserForm = () => {
    const dispatch = useDispatch();
  const location = useLocation();
  //const dispatch = useDispatch();
  const navigate = useNavigate();

  const applicationform = location.state?.applicationform;
const [isPaymentDone, setIsPaymentDone] = useState(false);
    // 🔹 State for course + batch
  //const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  console.log(selectedBatch,"selectedBatch" );

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
  loadCourses();
    
    }, [dispatch]);
  // 🔹 Auto-load batches if editing (course is already selected)
useEffect(() => {
  if (applicationform?.courseID) {
    fetchBatchDropdownReq(applicationform.courseID).then((res) => {
      setBatches(res.data || []);
    });
  }
}, [applicationform?.courseID]);


  // 🔹 When course changes, fetch batches
  const handleCourseChange = async (courseId, setFieldValue) => {
    debugger;
    setFieldValue("courseId", courseId);
    setFieldValue("batchId", "");
    setSelectedBatch(null);
    try {
      const response = await fetchBatchDropdownReq(courseId); // 🔹 your batch API
      setBatches(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  // 🔹 When batch changes, update selected batch details
  const handleBatchChange = (batchId, setFieldValue) => {
    setFieldValue("batchId", batchId);
    const batch = batches.find(b => b.batchID === parseInt(batchId));
    setSelectedBatch(batch || null);
  };
  // Helper to parse education details from the application form
  const parsedEducationDetails = useMemo(() => {
    if (!applicationform?.educationDetails) return {};
    try {
      const details = JSON.parse(applicationform.educationDetails);
      const educationMap = {};

      const educationTypeToKey = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('sslc') || lowerType.includes('10th')) return 'sslc';
        if (lowerType.includes('hsc') || lowerType.includes('12th')) return 'hsc';
        if (lowerType.includes('diploma')) return 'diploma';
        if (lowerType.includes('degree') || lowerType.includes('b.sc') || lowerType.includes('bsc') || lowerType.includes('b.e')) return 'degree';
        if (lowerType.includes('pg') || lowerType.includes('master')) return 'pg';
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

  // Initialize state based on whether we are editing or adding
  const [selectedQuals, setSelectedQuals] = useState(applicationform ? Object.keys(parsedEducationDetails) : []);
  const [dateOfBirth, setDob] = useState(applicationform?.dateOfBirth ? new Date(applicationform.dateOfBirth) : null);

  const toggleQualification = (key) => {
    setSelectedQuals(prev =>
      prev.includes(key) ? prev.filter(q => q !== key) : [...prev, key]
    );
  };

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
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
  const [applicationDate, setApplicationDate] = useState(
  applicationform?.applicationDate ? new Date(applicationform.applicationDate) : null
);


  const prepareSubmitData = (values) => {
    const educationDetailsList = QUALIFICATIONS
      .filter(qual => selectedQuals.includes(qual.key))
      .map(qual => {
        const detail = values[qual.key];
        // Only include if at least one field has a value
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
      .filter(Boolean); // remove nulls if any

    const submitValues = { ...values };
    QUALIFICATIONS.forEach(qual => delete submitValues[qual.key]);
    submitValues.educationDetails = JSON.stringify(educationDetailsList);
     // ✅ Pass as array, not string
    //submitValues.educationDetails = educationDetailsList;
    return submitValues;
  };



  /*const handleSave = async (values) => {
    debugger;
    const payload = prepareSubmitData(values);
    console.log("Saving new application:", payload);
    await addNewForm({ ...payload,
      courseId: Number(payload.courseId),  // convert to integer
    batchId: Number(payload.batchId),    // convert to integer
      createdBy: "AdminUser" }, dispatch);
debugger;
      await handleSubmit(values);
  };*/

  

  const initialValues = applicationform ? {
    applicationID: applicationform.applicationID || 0,
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
    candidateStatus: applicationform.candidateStatus || '',
    ifEmployed_WorkingAt: applicationform.ifEmployed_WorkingAt || '',
    desgination: applicationform.desgination || '',
    declaration: applicationform.declaration || false,
    place: applicationform.place || '',
    bloodGroup:applicationform.bloodGroup || '',
    applicationDate: applicationform.applicationDate ? new Date(applicationform.applicationDate) : null,
    courseId: applicationform.courseID || '',
    batchId: applicationform.batchId || '',
    isPaymentDone: applicationform.isPaymentDone || false,
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
    desgination: '',
    declaration: false,
    place:'',
    applicationDate:null,
    bloodGroup: '',
    courseId: '',
    batchId: '',
    isPaymentDone: false,


    sslc: { year: '', marks: '', institution: '' },
    hsc: { year: '', marks: '', institution: '' },
    diploma: { year: '', marks: '', institution: '' },
    degree: { year: '', marks: '', institution: '' },
    pg: { year: '', marks: '', institution: '' },
    others: { year: '', marks: '', institution: '' },
  };



/*const [filesList, setFilesList] = useState([]);

  const handleFileChange = (event, setFieldValue) => {
  const file = event.currentTarget.files[0];
  if (file) {
    debugger;
    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG and JPG images are allowed!");
      event.target.value = null;
      return;
    }
    setFieldValue("photo", file); // Formik value
    setFilesList([file.name]);
  }
};*/
const [filesList, setFilesList] = useState(applicationform?.files || []);

// Handle file change for new uploads
const handleFileChange = (event, setFieldValue) => {
  const file = event.currentTarget.files[0];
  if (file) {
    debugger;
    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG and JPG images are allowed!");
      event.target.value = null;
      return;
    }

    // Update Formik field
    setFieldValue("photo", file);

    // Append new file to existing list
    setFilesList((prev) => [...prev, file.name]);
  }
};

// Handler for download button
const handleDownload = async (fileName, id) => {
  if (!fileName || !applicationform?.applicationID) return;

  try {
    debugger;
    const res = await downloadFormFilesReq({
      id: id,
      type: "Students",
      filename: fileName
    });

    // Create a Blob from response data
    const blob = new Blob([res.data], { type: res.headers["content-type"] });

    // Create a temporary link to download the file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName); // set the original file name
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Error downloading file:", err);
    Swal.fire("Error", "Failed to download file", "error");
  }
};

const handleRazorpayPayment = (data) => {
  try {
    const options = {
      key: 'rzp_test_6pwjCwtwwp3YOu', // Razorpay test key
      amount: (selectedBatch.courseFee * 100).toFixed(0), // in paise
      currency: 'INR',
      name: 'Thiagarajar Polytechnic College',
      description: 'Course Payment',
      prefill: {
        contact: '0000000000',
        name: 'Admin',
      },
      theme: { color: '#8B5CF6' },
      handler: async function (response) {
        // Payment succeeded
        console.log('Payment ID:', response.razorpay_payment_id);

        try {
          // Call your API to update the form/payment status
          const apiResponse = await updateFormReq({
            ...data,
            isPaymentDone: true,
           // paymentRefereceNo: response.razorpay_payment_id,
          });

          console.log('Form updated successfully', apiResponse.data);

          // Redirect after 10 seconds
          setTimeout(() => {
            router.navigate('/main/form');
          }, 10000);
        } catch (apiError) {
          console.error('API error:', apiError);
          Swal.fire('Error', 'Payment succeeded but updating form failed', 'error');
        }
      },
      modal: {
        ondismiss: function () {
          console.log('Payment popup closed by user');
        },
      },
    };

    // Open Razorpay checkout
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment initiation error:', error);
    Swal.fire('Error', 'Payment initiation failed', 'error');
  }
};
// 1️⃣ Save form data first
const handleSave = async (values, formikHelpers) => {
  const { setSubmitting } = formikHelpers;
  try {
    debugger;
    const payload = prepareSubmitData(values);
    console.log("Saving new application:", payload);

    // Call your addNewForm API
    const res = await addNewForm(
      {
        ...payload,
        courseId: Number(payload.courseId),
        batchId: Number(payload.batchId),
        createdBy: "AdminUser",
      },
      dispatch
    );

    // res.data should contain the saved application including ApplicationID
    const savedApplication = res?.[0].applicationID;

    console.log("Saved application response:", savedApplication);

    // Pass the savedApplication to handleSubmit for file upload or other post-submit tasks
    await handleSubmit(savedApplication, values, formikHelpers);
  } catch (err) {
    console.error("Error saving application:", err);
    Swal.fire("Error", "Something went wrong while saving the form", "error");
  }
};

const handleUpdate = async (values, formikHelpers) => {
  const { setSubmitting } = formikHelpers;
    try{
      debugger;
    const payload = prepareSubmitData(values);
    console.log("Updating application:", payload);
 
    // Call your addNewForm API
     await updateForm({ ...payload, courseId: Number(payload.courseId),  // convert to integer
    batchId: Number(payload.batchId),modifiedBy: "AdminUser" }, dispatch);
  
   
     //const savedApplication = res?.[0];

   // console.log("Saved application response:", savedApplication);

    // Pass the savedApplication to handleSubmit for file upload or other post-submit tasks
    await handleSubmit(payload.applicationID, values, formikHelpers);
  } catch (err) {
    console.error("Error saving application:", err);
    Swal.fire("Error", "Something went wrong while saving the form", "error");
  }
  };

// 2️⃣ Upload file (called after save)
const handleSubmit = async (savedApp, formikValues, { setSubmitting }) => {
  try {
    debugger;
    const applicationId = savedApp;
      if (formikValues.photo) {
        const formData = new FormData();
        formData.append("Id", applicationId);
        formData.append("TypeofUser", "students");
        //formData.append("FormFiles", formikValues.photo);
// formData.append("FormFiles", formikValues.photo, formikValues.photo.name);
const filesArray = [formikValues.photo];
      filesArray.forEach((file) => {
        formData.append("FormFiles", file);
      });
for (let [key, value] of formData.entries()) {
  console.log(key, value);
}
  
       
        const res = await uploadFormFilesReq(formData); // your API call
        console.log("File uploaded successfully:", res);
      }
  } catch (err) {
    console.error("Error uploading file:", err);
    Swal.fire("Error", "Something went wrong while uploading the file", "error");
  } finally {
    setSubmitting(false);
  }
};


  return (
     <div className="form-wrapper">
    {/* Single Card for Header + Form */}
    <div className="card">
      {/* Header Section */}
      <div className="form-header">
        <button type="button" className="close-icon" onClick={handleClose} aria-label="Close">
          &times;
        </button>
        <h2>
          THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636005
        </h2>
        <h3>
          CONTINUING EDUCATION CENTRE
        </h3>
        <p>
          Phone: (0427) 2446219, 4099303 | 
          Email: <a href="mailto:ciicptptc@gmail.com">ciicptptc@gmail.com</a>
        </p>
        <p>
          Website: <a href="http://www.tpt.edu.in/ciicp" target="_blank" rel="noopener noreferrer">
            www.tpt.edu.in/ciicp
          </a>
        </p>
      </div>
      
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={(values, { setSubmitting }) => {
        if (applicationform) {
          handleUpdate(values,{setSubmitting});
        } else {
           handleSave(values, { setSubmitting })
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

  {/* Qualification Details Section as a Table */}
  <div className="qualification-table-container">
    <h4>Academic Qualifications <span style={{ color: 'red' }}>*</span></h4>
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
      height:'41px',
      padding: '8px',
      boxSizing: 'border-box',
      border: '1px solid #ccc',
      borderRadius: '4px',
      resize: 'vertical', // allow user to resize vertically
      minHeight: '0px'   // optional: make it taller by default
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
        <Field type="text" name="desgination" />
      </div>
    </>
  )}
<label>
  Place <span style={{ color: 'red' }}>*</span>
</label>
<Field type="text" name="place" required />

  <div>
  <label>
    Date <span style={{ color: 'red' }}>*</span>
  </label>
  <DatePicker
    selected={applicationDate}
    onChange={(date) => {
      setApplicationDate(date);
      setFieldValue('applicationDate', date);
    }}
    dateFormat="dd-MM-yyyy"
    placeholderText="dd/mm/yyyy"
    customInput={
      <input type="text" className="text-input" placeholder="yyyy/mm/dd" />
    }
  />
</div>


 {/* 🔹 Course Dropdown */}
              <div>
                <label>Course Name <span style={{ color: 'red' }}>*</span></label>
                <Field
                  as="select"
                  name="courseId"
                  onChange={(e) => handleCourseChange(e.target.value, setFieldValue)}
                  value={values.courseId}
                  required
                >
                  <option value="">Select Course</option>
                  {courseList.map(course => (
                    <option key={course.courseID} value={course.courseID}>
                      {course.courseName}
                    </option>
                  ))}
                </Field>
              </div>
               <div>
                  <label>Batch Name <span style={{ color: 'red' }}>*</span></label>
                  <Field
                    as="select"
                    name="batchId"
                    onChange={(e) => handleBatchChange(e.target.value, setFieldValue)}
                    value={values.batchId}
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.batchID} value={batch.batchID}>
                        {batch.batchName}
                      </option>
                    ))}
                  </Field>
                </div>
                {selectedBatch && (
  <div className="batch-details-card">
    <h4>Batch Details</h4>
    <p><strong>Total Seats:</strong> {selectedBatch.totalSeats}</p>
    <p><strong>Available Seats:</strong> {selectedBatch.availableSeats}</p>
    <p><strong>Start Date:</strong> {selectedBatch.startDate}</p>
    <p><strong>Instructor:</strong> {selectedBatch.instructorName}</p>
    <p><strong>Course Fee:</strong> ₹{selectedBatch.courseFee}</p>

    {selectedBatch.availableSeats === 0 && (
      <p style={{ color: "red", fontWeight: "bold" }}>Batch Full</p>
    )}
  </div>
)}
  {/*<div style={{ marginTop: '10px' }}>
    <label>
      <Field type="checkbox" name="declaration" required />
      {' '}I hereby declare that the details furnished above are correct and I will adhere to the rules of the Continuing Education Centre.
    </label>
  </div>

  <button type="submit" style={{ marginTop: 20 }}>Submit</button>*/}
  {/* Buttons */}
<div className="col-xs-6 col-md-6 col-lg-6 col-sm-12 form-group">
  <label>Upload Photo (JPG/PNG only)</label>
  <input
    className="form-control"
    type="file"
    id="formFileMultiple"
    accept="image/png, image/jpeg"
    multiple
    onChange={(e) => handleFileChange(e, setFieldValue)}
  />

  {filesList?.length > 0 && (
    <div className="d-flex flex-column mt-2 rounded">
      {filesList.map((fileName, index) => (
        <div key={index} className="d-flex align-items-center justify-content-between border rounded p-2 mb-1">
          <span>{fileName || "No File Name"}</span>
          <button
            className="btn btn-sm btn-primary"
            type="button"
            onClick={() => handleDownload(fileName,applicationform.applicationID)}
          >
            Download
          </button>
        </div>
      ))}
    </div>
  )}
</div>


  <div style={{ marginTop: '10px' }}>
  <label>
    <Field type="checkbox" name="declaration" required />
    {' '}I hereby declare that the details furnished above are correct and I will adhere to the rules of the Continuing Education Centre.
  </label>
</div>
<div style={{ marginTop: 20, textAlign: 'center' }}>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '300px',
    margin: '0 auto'
  }}>
    {/* Show Pay button if declaration is checked and payment is not done */}
    {selectedBatch && (
      <button
        type="button"
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "12px 20px",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          width: "100%",
        }}
       /* onClick={() => {
          Swal.fire("Success", "Payment completed successfully!", "success");
          setIsPaymentDone(true);
        }}*/
        //onClick={handleRazorpayPayment}
         onClick={() => handleRazorpayPayment(applicationform)}
      >
        Pay ₹{selectedBatch.courseFee}
        <span role="img" aria-label="lock">🔒</span>
      </button>
    )}

    {/* Show Submit button only after payment is done */}
   
      <button
        type="submit"
        style={{
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          padding: "12px 20px",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        {applicationform ? 'Update' : 'Submit'}
      </button>
    

    {/* Show Close button always */}
    <button
      type="button"
      style={{
        backgroundColor: "#6c757d",
        color: "#fff",
        border: "none",
        padding: "12px 20px",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        width: "100%"
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
