import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./userform.css";
import { fetchCourseListReq } from '../api/course/course';
import {fetchBatchDropdownReq} from '../api/batch/batch';
import { useDispatch, useSelector } from "react-redux";
import { updateForm ,addNewForm} from '../app/redux/slice/formSlice';
//import { useDispatch } from "react-redux";

const QUALIFICATIONS = [
  { key: 'sslc', label: 'SSLC' },
  { key: 'hsc', label: 'HSC' },
  { key: 'diploma', label: 'Diploma' },
  { key: 'degree', label: 'Degree' },
  { key: 'pg', label: 'PG' },
  { key: 'others', label: 'Others' },
];const MODE_OPTIONS = [/* your mode options */];

const UserForm = () => {
  const location = useLocation();
  const applicationform = location.state?.applicationform;
  // File upload/download state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(applicationform?.uploadedFileName || '');
  const [fileUrl, setFileUrl] = useState(applicationform?.fileUrl || '');
  const fileInputRef = useRef();
  // File upload handler (simulate API upload, replace with your API call)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadedFileName(e.target.files[0].name);
    }
  };

  // Simulate upload (replace with your API call)
  const uploadFile = async () => {
    if (!selectedFile) return;
    // Example: upload to backend
    // const formData = new FormData();
    // formData.append('file', selectedFile);
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });
    // const data = await response.json();
    // setFileUrl(data.url);
    // setUploadedFileName(selectedFile.name);
    // For now, just simulate
    setFileUrl(URL.createObjectURL(selectedFile));
  };

  // Download handler (simulate, replace with your API call if needed)
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
    const dispatch = useDispatch();
  //const dispatch = useDispatch();
  const navigate = useNavigate();
const [isPaymentDone, setIsPaymentDone] = useState(false);
    // 🔹 State for course + batch
  //const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

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
  const [dob, setDob] = useState(applicationform?.dateOfBirth ? new Date(applicationform.dateOfBirth) : null);

  const toggleQualification = (key) => {
    setSelectedQuals(prev =>
      prev.includes(key) ? prev.filter(q => q !== key) : [...prev, key]
    );
  };

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
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
    // Attach file info if uploaded
    if (uploadedFileName) {
      submitValues.uploadedFileName = uploadedFileName;
      submitValues.fileUrl = fileUrl;
    }
    return submitValues;
  };

  const handleSave = async (values) => {
    // Upload file first if selected
    if (selectedFile && !fileUrl) {
      await uploadFile();
    }
    const payload = prepareSubmitData(values);
    console.log("Saving new application:", payload);
    await addNewForm({ ...payload, createdBy: "AdminUser" }, dispatch);
  };

  const handleUpdate = async (values) => {
    if (selectedFile && !fileUrl) {
      await uploadFile();
    }
    const payload = prepareSubmitData(values);
    console.log("Updating application:", payload);
    await updateForm({ ...payload, modifiedBy: "AdminUser" }, dispatch);
  };

  const initialValues = applicationform ? {
    name: applicationform.candidateName || '',
    sex: applicationform.sex || '',
    fatherName: applicationform.fatherOrHusbandName || '',
    address: applicationform.contactAddress || '',
    mobile: applicationform.mobileNumber || '',
    dob: applicationform.dateOfBirth ? new Date(applicationform.dateOfBirth) : null,
    age: applicationform.age || '',
    aadhaar: applicationform.aadharNumber || '',
    email: applicationform.email || '',
    admission: applicationform.modeOfAdmission || '',
    status: applicationform.ifEmployed_WorkingAt ? 'Employed' : '',
    workingAt: applicationform.ifEmployed_WorkingAt || '',
    designation: applicationform.designation || '',
    declaration: applicationform.declaration || false,
    place: applicationform.place || '',
    date: applicationform.applicationDate ? new Date(applicationform.applicationDate) : null,
    ...QUALIFICATIONS.reduce((acc, qual) => {
      acc[qual.key] = parsedEducationDetails[qual.key] || { year: '', marks: '', institution: '' };
      return acc;
    }, {})
  } : {
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
    place:'',
    date:null,
    sslc: { year: '', marks: '', institution: '' },
    hsc: { year: '', marks: '', institution: '' },
    diploma: { year: '', marks: '', institution: '' },
    degree: { year: '', marks: '', institution: '' },
    pg: { year: '', marks: '', institution: '' },
    others: { year: '', marks: '', institution: '' },
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
    <Field type="text" name="name" required />
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
    <Field type="text" name="fatherName" required />
  </div>

  <div>
    <label>
      Contact Address <span style={{ color: 'red' }}>*</span>
    </label>
    <Field as="textarea" name="address" required />
  </div>

  <div>
    <label>
      Mobile Number <span style={{ color: 'red' }}>*</span>
    </label>
    <Field name="mobile" type="tel" required />
  </div>

  <div>
    <label>
      Date of Birth <span style={{ color: 'red' }}>*</span>
    </label>
    <DatePicker
      selected={dob}
      onChange={(date) => {
        setDob(date);
        setFieldValue('dob', date);
        setFieldValue('age', calculateAge(date));
      }}
      dateFormat="yyyy-MM-dd"
      placeholderText="yyyy/mm/dd"
      showYearDropdown
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      maxDate={new Date()}
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
    <Field type="text" name="aadhaar" required />
  </div>

  <div>
    <label>
      Email ID <span style={{ color: 'red' }}>*</span>
    </label>
    <Field name="email" type="email" required />
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
                name={`${qual.key}.institution`}
                type="text"
                disabled={!selectedQuals.includes(qual.key)}
                required={selectedQuals.includes(qual.key)}
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
    <Field as="select" name="admission" required>
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
    <Field as="select" name="status" required>
      <option value="">Select</option>
      <option value="Student">Student</option>
      <option value="Unemployed">Unemployed</option>
      <option value="Employed">Employed</option>
      <option value="Business">Business</option>
      <option value="SeniorCitizen">Senior Citizen</option>
    </Field>
  </div>

  {values.status === 'Employed' && (
    <>
      <div>
        <label>Working At</label>
        <Field type="text" name="workingAt" />
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
    <Field type="date" name="date" required />
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
  {/* File Upload Section */}
  <div style={{ marginTop: '10px' }}>
    <label>Upload Document (optional):</label>
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
    />
    {uploadedFileName && (
      <div style={{ marginTop: 8 }}>
        <span style={{ marginRight: 12 }}>{uploadedFileName}</span>
        {fileUrl && (
          <button type="button" onClick={handleDownload} style={{ marginRight: 8 }}>
            Download
          </button>
        )}
        {selectedFile && !fileUrl && (
          <button type="button" onClick={uploadFile}>
            Upload
          </button>
        )}
      </div>
    )}
  </div>

  <div style={{ marginTop: '10px' }}>
  <label>
    <Field type="checkbox" name="declaration" required />
    {' '}I hereby declare that the details furnished above are correct and I will adhere to the rules of the Continuing Education Centre.
  </label>
</div>
<div style={{ marginTop: 20 }}>
  {/* Show Pay button if declaration is checked and payment is not done */}
  {values.declaration && !isPaymentDone && selectedBatch && (
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
      onClick={() => {
        // simulate payment success
        Swal.fire("Success", "Payment completed successfully!", "success");
        setIsPaymentDone(true);
      }}
    >
      Pay ₹{selectedBatch.courseFee}
      <span role="img" aria-label="lock">🔒</span>
    </button>
  )}

  {/* Show Submit button only after payment is done */}
  {isPaymentDone && (
    <button type="submit" className="submit-button">
      {applicationform ? 'Update Application' : 'Submit Application'}
    </button>
  )}

  {/* Show Close button always */}
  <button type="button" className="close-button" onClick={handleClose}>
    Close
  </button>
</div>
</Form>

      )}
    </Formik>
    </div>
    </div>
  );
};

export default UserForm;
