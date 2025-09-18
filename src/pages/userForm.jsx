import React, { useState, useMemo,useEffect ,useRef } from 'react';
import { Formik, Form, Field , ErrorMessage} from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./userform.css";
import { fetchCourseListReq } from '../api/course/course';
import {fetchBatchDropdownReq} from '../api/batch/batch';
import { useDispatch, useSelector } from "react-redux";
import { updateForm,updatePaymentForm ,addNewForm,fetchFormList} from '../app/redux/slice/formSlice';
import { uploadFormFilesReq,downloadFormFilesReq} from '../../src/api/form/form';
import { fetchFormListReq } from '../../src/api/form/form';
//import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import { loadRazorpay } from "../../src/utlis/razorpay"; // Adjust path accordingly
import { updatePaymentFormReq} from '../api/form/form';
import * as Yup from 'yup';
import moment from 'moment';
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
const [isSubmitClicked, setIsSubmitClicked] = useState(false);
const [isUpdateClicked, setIsUpdateClicked] = useState(false);
const [saveddata, setsaveddata] = useState(null);

  const applicationform = location.state?.applicationform;
  console.log(applicationform,"applicationform" );
  //const [isPaymentDone, setIsPaymentDone] = useState(false);
    // 🔹 State for course + batch
  //const [courses, setCourses] = useState([]);

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  console.log(selectedBatch,"selectedBatch" );
const fileInputRef = useRef(null);
//const [isNewFileSelected, setIsNewFileSelected] = useState(false);
 const [newFileSelected, setNewFileSelected] = useState(false);
// const { setFieldValue } = useFormikContext();
  const [fileSelected, setFileSelected] = useState(false);
   const [courseList, setCourseList] = useState([]);
      console.log(courseList,"courseList")

      const [admin, setAdmin] = useState(null);

    

      // Fetch courses when modal opens
    useEffect(() => {
      const loadCourses = async () => {
        try {
          debugger;
            const storedAdmin =(localStorage.getItem("role"));
        if (storedAdmin) {
            setAdmin(storedAdmin);
        }
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
      const batchList = res.data || [];
      setBatches(batchList);

      // ✅ If editing, auto-select the saved batch
      if (applicationform?.batchId) {
        const foundBatch = batchList.find(
          (b) => b.batchID === applicationform.batchId
        );
        if (foundBatch) {
          setSelectedBatch(foundBatch);
        }
      }
    });
  }
}, [applicationform?.courseID, applicationform?.batchId]);


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
  setIsSubmitClicked(false);
  setIsUpdateClicked(false);
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

const validationSchema = Yup.object({
  candidateName: Yup.string().required('Name is required').matches(/^[A-Za-z .-]+$/),
  sex: Yup.string().required('Sex is required'),
  fatherOrHusbandName: Yup.string().required('Father/Husband Name is required').matches(/^[A-Za-z .-]+$/),
contactAddress: Yup.string()
  .required("Contact Address is required")
  .min(5, "Contact Address must be at least 5 characters")
  .max(300, "Contact Address cannot exceed 300 characters"),
mobileNumber: Yup.string()
    .required('Mobile Number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
 dateOfBirth: Yup.date().required('Date of Birth is required')
 .min(new Date(1900, 0, 1), 'Year must be 1900 or later')
 .max(new Date(), 'Date cannot be in the future') .test(
      'max-age',
      'Age cannot be more than 90 years',
      function (value) {
        if (!value) return false;
        const today = new Date();
        const ninetyYearsAgo = new Date(
          today.getFullYear() - 80,
          today.getMonth(),
          today.getDate()
        );
        return value >= ninetyYearsAgo;
      }
    ),
 aadharNumber: Yup.string()
    .required('Aadhaar Number is required')
    .matches(/^[0-9]{12}$/, 'Please enter your 12 digit Aadhaar number'),
  
  modeOfAdmission: Yup.string().required('Mode of Admission is required'),
  candidateStatus: Yup.string().required('Candidate Status is required'),
  place: Yup.string().required('Place is required') .matches(/^[A-Za-z .-]+$/),
  declaration: Yup.boolean().oneOf([true], 'You must accept the declaration'),
  courseId: Yup.number().required('Course is required'),
  batchId: Yup.number().required('Batch is required'),
  //applicationDate: Yup.date().required('Date is Required'),
  });

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
    if (values.dateOfBirth) {
    submitValues.dateOfBirth = moment(values.dateOfBirth).format("YYYY-MM-DD");
  }
  if (values.applicationDate) {
    submitValues.applicationDate = moment(values.applicationDate).format("YYYY-MM-DD");
  }

    return submitValues;
  };
const initialValues = applicationform ? {
    applicationID: applicationform.applicationID || 0,
    candidateName: applicationform.candidateName || '',
    sex: applicationform.sex || '',
    fatherOrHusbandName: applicationform.fatherOrHusbandName || '',
    contactAddress: applicationform.contactAddress || '',
    mobileNumber: applicationform.mobileNumber || '',
    whatsappNumber: applicationform.whatsappNumber || null,

    dateOfBirth: applicationform?.dateOfBirth? moment(applicationform.dateOfBirth).toDate(): null,
    age: applicationform.age || '',
    aadharNumber: applicationform.aadharNumber || '',
    email: applicationform.email || null,
    modeOfAdmission: applicationform.modeOfAdmission || '',
    candidateStatus: applicationform.candidateStatus || '',
    ifEmployed_WorkingAt: applicationform.ifEmployed_WorkingAt || '',
    desgination: applicationform.desgination || '',
    declaration: applicationform.declaration || false,
    place: applicationform.place || '',
    bloodGroup:applicationform.bloodGroup || null,
    applicationDate: applicationform?.applicationDate  ? moment(applicationform.applicationDate).toDate()  : moment().toDate(),
    courseId: applicationform.courseID || '',
    batchId: applicationform.batchId || '',
    ispaymentdone : applicationform.ispaymentdone  || false,
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
    whatsappNumber: null,
    dateOfBirth: null,
    age: '',
    aadharNumber: '',
    email: null,
    modeOfAdmission: '',
    candidateStatus: '',
    ifEmployed_WorkingAt: '',
    desgination: '',
    declaration: false,
    place:'',
    bloodGroup: null,
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
    link.setAttribute("download", fileName);
 // set the original file name
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Error downloading file:", err);
    Swal.fire("Error", "Failed to download file", "error");
  }
};

const handleRazorpayPayment = (data, courseFee) => {
  try {
    console.log(data, "data");
    console.log(courseFee, "courseFee");

    const paymentData = Array.isArray(data) ? data[0] : data;
    const fee = courseFee ?? paymentData.courseFee ?? 0;

    const options = {
      key: 'rzp_test_6pwjCwtwwp3YOu', // Razorpay test key
      amount: (fee * 100).toFixed(0), // Amount in paise
      currency: 'INR',
      name: 'Thiagarajar Polytechnic College',
      description: 'Course Payment',
      prefill: {
        contact: paymentData.contactNumber || '0000000000',
        name: paymentData.name || 'Admin',
      },
      theme: { color: '#8B5CF6' },
      handler: async function (response) {
        console.log('Payment Response:', response);

        try {
          debugger;

          // Determine payment success or failure
          const isPaymentSuccess = !!response.razorpay_payment_id;
          const paymentStatus = isPaymentSuccess ? 'Success' : 'Failed';
          const data = {
            ApplicationID: paymentData.applicationID,
            PaymentResponse: JSON.stringify(response), // Store entire response as JSON
            Status: paymentStatus,
            Amount: fee,
            CreatedBy: paymentData.createdBy,
            CreatedDate: new Date(),
            isPaymentDone: isPaymentSuccess // true if success, false if failure
          };

          // Call API to update the payment status
          const apiResponse = await updatePaymentFormReq(data);
          console.log('Form updated successfully', apiResponse.data);

          if (isPaymentSuccess) {
            // Show success message and redirect
            Swal.fire({
              title: 'Success',
              text: 'Payment successful!',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              if(admin==="Admin"){
 navigate("/main/applicationtable");
              } else{
               navigate("/payment-success");  
              }
             
            });
          } else {
            // Show failure message
            Swal.fire({
              title: 'Payment Failed',
              text: 'The payment could not be processed. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }

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
     Swal.fire("Success", "Application added successfully!", "success").then(() => {
    //navigate("/main/applicationtable");  // redirect after clicking OK
  });
const savedApplication = res?.[0].applicationID;
   setsaveddata(res?.[0]);
    console.log("Saved application response:", savedApplication);
    // Pass the savedApplication to handleSubmit for file upload or other post-submit tasks
    await handleSubmit(savedApplication, values, formikHelpers);
   // setSavedApplication
    setIsSubmitClicked(true);  
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
    
     Swal.fire("Success", "Application updated successfully!", "success").then(() => {
    //navigate("/main/applicationtable"); 
  });
  
 //const savedApplication = res?.[0];
 
   // console.log("Saved application response:", savedApplication);
 
    // Pass the savedApplication to handleSubmit for file upload or other post-submit tasks
    await handleSubmit(payload.applicationID, values, formikHelpers);
    setIsUpdateClicked(true);
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
         // After upload, fetch the updated application data
     const updatedAppList = await fetchFormListReq(); // Fetch the list of all applications
  console.log("Fetched updated applications:", updatedAppList);

const applicationsArray = updatedAppList.data; // ensure this is the array
const filteredApps = applicationsArray.filter(app => app.applicationID === applicationId);

setsaveddata(filteredApps); // saveddata is now an array
console.log("Filtered application as array:", filteredApps);
  }
  } catch (err) {
    console.error("Error uploading file:", err);
    Swal.fire("Error", "Something went wrong while uploading the file", "error");
  } finally {
    setSubmitting(false);
  }
};
//Handle file change
    /*const handleFileChange = (event, setFieldValue) => {
  const file = event.currentTarget.files[0];
  if (!file) return;

  const allowedTypes = ["image/png", "image/jpeg"];
  if (!allowedTypes.includes(file.type)) {
    alert("Only PNG and JPG images are allowed!");
    event.target.value = null;
    return;
  }

  setFieldValue("photo", file);
  //setFileSelected(true);
};

const handleClear = (setFieldValue, setFileSelected, fileInputRef) => {
  setFieldValue("photo", null);
  setFileSelected(false);
  if (fileInputRef.current) {
    fileInputRef.current.value = null;
  }
};*/
const handleFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0]; // single file
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG and JPG images are allowed!");
      event.target.value = null;
      setFieldValue("photo", null);
      setFilesList([]);
      setFileSelected(false);
      setNewFileSelected(false);
      return;
    }

    setFieldValue("photo", file); // Formik field
    setFilesList([file.name]);    // display file name
    setFileSelected(true); 
    setNewFileSelected(true);       // show Clear button
  };

  const handleClear = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    setFieldValue("photo", null);
    setFilesList([]);
    setFileSelected(false);
     setNewFileSelected(false);    
  };
 return (
    <div className="form-wrapper">
      <div className="card">
        <div className="form-header">
          {admin === "Admin" && (
    <button
      type="button"
      className="close-icon"
      onClick={handleClose}
      aria-label="Close"
    >
      &times;
    </button>
  )}
          <h2>THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636005</h2>
          <h3>CONTINUING EDUCATION CENTRE</h3>
          <p>Phone: (0427) 2446219, 4099303 | Email: <a href="mailto:ciicptptc@gmail.com">ciicptptc@gmail.com</a></p>
          <p>Website: <a href="http://www.tpt.edu.in/ciicp" target="_blank" rel="noopener noreferrer">www.tpt.edu.in/ciicp</a></p>
        </div>

       <Formik
  initialValues={initialValues}
  validationSchema={validationSchema}
  enableReinitialize
onSubmit={async (values, formikHelpers) => {
  const { setSubmitting } = formikHelpers;
  try {
    if (applicationform) {
      await handleUpdate(values, formikHelpers);
    } else {
      await handleSave(values, formikHelpers);
    }
  } finally {
    setSubmitting(false);
  }
}}

>
  {({ values, setFieldValue }) => (
    <Form>
      <div>
        <label>
          Name of Candidate <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="text" name="candidateName"  maxLength={100}
        onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z .-]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
       }}/>

       <ErrorMessage name="candidateName" component="div" className="error-message"/>

      </div>

      <div>
        <label>
          Sex <span style={{ color: 'red' }}>*</span>
        </label>
        <Field as="select" name="sex" >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </Field>
<ErrorMessage
  name="sex"
  component="div"
  className="error-message"
/>      </div>

      <div>
        <label>
          Name of Father/Husband <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="text" name="fatherOrHusbandName"   maxLength={100}
                onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z .-]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
       }}/>
        <ErrorMessage name="fatherOrHusbandName" component="div" className="error-message"/>     
       </div>

      <div>
        <label>
          Contact Address <span style={{ color: 'red' }}>*</span>
        </label>
<Field
  as="textarea"
  name="contactAddress"
  rows={3}
  maxLength={300}
  onInput={(e) => {
    let val = e.target.value;
    val = val.replace(/[^A-Za-z0-9\s.,/-]/g, "");
    val = val.replace(/\s{2,}/g, " ");
    e.target.value = val;
  }}
/>
<ErrorMessage name="contactAddress" component="div" className="error-message" />

      </div>

 <div>
  <label>
    Mobile Number <span style={{ color: "red" }}>*</span>
  </label>
 <Field
  name="mobileNumber"
  type="tel"
  maxLength={10}
  onInput={(e) => {
    // ✅ Only digits allowed
    e.target.value = e.target.value.replace(/[^0-9]/g, "");

    // ✅ Prevent starting with 0
    if (e.target.value.startsWith("0")) {
      e.target.value = e.target.value.slice(1);
    }

    // ✅ Limit to 10 digits
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10);
    }
  }}
/>
<ErrorMessage name="mobileNumber" component="div" className="error-message" />
</div>
 <div>
  <label>
    Whatsapp Number 
  </label>
 <Field
  name="whatsappNumber"
  type="tel"
  maxLength={10}
  onInput={(e) => {
    // ✅ Only digits allowed
    e.target.value = e.target.value.replace(/[^0-9]/g, "");

    // ✅ Prevent starting with 0
    if (e.target.value.startsWith("0")) {
      e.target.value = e.target.value.slice(1);
    }

    // ✅ Limit to 10 digits
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10);
    }
  }}
/>
</div>

      <div>
    <label>
      Date of Birth <span style={{ color: 'red' }}>*</span>
    </label>
    <DatePicker
  selected={values.dateOfBirth}
  onChange={(date) => {
    setDob(date);
    setFieldValue('dateOfBirth', date); 
    setFieldValue('age', calculateAge(date));
  }}
      dateFormat="yyyy-MM-dd"
      placeholderText="yyyy-mm-dd"
      showYearDropdown
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      minDate={new Date(1900, 0, 1)}   
      maxDate={new Date()}            
      customInput={
        <input type="text" className="text-input" placeholder="yyyy/mm/dd" />
      }
    />
    <ErrorMessage name="dateOfBirth" component="div" className="error-message" />
  </div>

      <div>
        <label>Age</label>
        <Field type="text" name="age" value={values.age} readOnly />
      </div>

   <div>
  <label>
    Aadhaar Number <span style={{ color: 'red' }}>*</span>
  </label>
  <Field
    type="text"
    name="aadharNumber"
    onChange={(e) => {
              const value = e.target.value;
              // Allow only digits
              if (/^\d*$/.test(value)) {
                setFieldValue('aadharNumber', value);
              }
            }}
    maxLength={12}
  />
  <ErrorMessage
    name="aadharNumber"
    component="div"
    className="error-message"
  />
</div>
<div>
  <label>
    Email ID 
  </label>
  <Field 
    name="email" 
    type="email" 
    maxLength={100}  
    onInput={(e) => {
    e.target.value = e.target.value
    .toLowerCase().replace(/\s+/g, "")
    .replace(/[^a-z0-9@._-]/g, "");
  }}
  />
 
</div>


 <div>
  <label>
    Blood Group 
  </label>
  <Field as="select" name="bloodGroup">
    <option value="">Select Blood Group</option>
    <option value="A+">A+</option>
    <option value="A-">A-</option>
    <option value="B+">B+</option>
    <option value="B-">B-</option>
    <option value="O+">O+</option>
    <option value="O-">O-</option>
    <option value="AB+">AB+</option>
    <option value="AB-">AB-</option>
  </Field>
 
</div>


      {/* Qualification Details Section */}
      <div className="qualification-table-container">
        <h4>
          Academic Qualifications 
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
    type="text"
    disabled={!selectedQuals.includes(qual.key)}
    required={selectedQuals.includes(qual.key)}
    inputMode="numeric"
    maxLength={4}
    onInput={(e) => {
      let value = e.target.value.replace(/\D/g, ''); // digits only

      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 79;

      // Limit max length
      if (value.length > 4) value = value.slice(0, 4);

      // Prevent typing greater than current year
      if (parseInt(value, 10) > currentYear) {
        value = currentYear.toString();
      }

      // Prevent typing less than minYear if 4 digits
      if (value.length === 4 && parseInt(value, 10) < minYear) {
        value = minYear.toString();
      }

      e.target.value = value;
      e.target.defaultValue = value; // save last valid
    }}
    onBlur={(e) => {
      const errorDiv = document.getElementById(`${qual.key}-year-error`);
      if (!errorDiv) return;

      const value = e.target.value.trim();
      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 80;
      const numericValue = parseInt(value, 10);

      if (value === '') {
        errorDiv.textContent = 'Year is required';
      } else if (isNaN(numericValue)) {
        errorDiv.textContent = 'Year must be a number';
      } else if (value.length !== 4) {
        errorDiv.textContent = 'Enter a 4-digit year';
      } else if (numericValue < minYear || numericValue > currentYear) {
        errorDiv.textContent = `Year must be between ${minYear} and ${currentYear}`;
      } else {
        errorDiv.textContent = '';
      }
    }}
  />

  <div
    id={`${qual.key}-year-error`}
    className="error-message"
    style={{ color: 'red', minHeight: '1em' }}
  ></div>
</td>


    <td>
  <Field
    name={`${qual.key}.marks`}
    type="text" // using text for better control
    disabled={!selectedQuals.includes(qual.key)}
    required={selectedQuals.includes(qual.key)}
    inputMode="decimal"
    onInput={(e) => {
      let value = e.target.value;

      // Remove all except digits and one dot
      value = value.replace(/[^0-9.]/g, '');

      const parts = value.split('.');

      // Allow only one dot
      if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
      }

      // Disallow starting with zero unless it's "0."
      if (parts[0].length > 1 && parts[0].startsWith('0')) {
        parts[0] = parts[0].slice(1);
      }

      // Limit to 3 digits before the dot
      if (parts[0].length > 3) {
        parts[0] = parts[0].slice(0, 3);
      }

      // Limit to one digit after the dot
      if (parts.length === 2 && parts[1].length > 1) {
        parts[1] = parts[1].slice(0, 1);
      }

      value = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];

      // Check if numeric value exceeds 100
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 100) {
        if (value !== '100' && value !== '100.0') {
          e.target.value = e.target.defaultValue || '';
          return;
        }
      }

      // Prevent starting with 0 unless "0."
      if (parts[0].startsWith('0') && parts[0] !== '0') {
        parts[0] = parts[0].slice(1);
        value = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
      }

      e.target.value = value;
      e.target.defaultValue = value;
    }}
    onBlur={(e) => {
      let value = e.target.value.trim();
      const errorDiv = document.getElementById(`${qual.key}-marks-error`);

      if (value === '') {
        errorDiv.textContent = 'Marks are required';
        return;
      }

      const num = parseFloat(value);
      if (isNaN(num) || num < 1 || num > 100) {
        errorDiv.textContent = 'Marks must be between 1 and 100';
      } else {
        errorDiv.textContent = '';
        e.target.value = num.toFixed(1);
      }
    }}
  />
  <div id={`${qual.key}-marks-error`} className="error-message"></div>
</td>




                <td>
                  <Field
                    as="textarea"
                    name={`${qual.key}.institution`}
                    disabled={!selectedQuals.includes(qual.key)}
                    required={selectedQuals.includes(qual.key)}
                    maxLength={500}
                    style={{
                      height: '41px',
                      padding: '8px',
                      boxSizing: 'border-box',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      resize: 'vertical',
                      minHeight: '0px',
                    }}
   onInput={(e) => {
    // Remove anything that is not A-Z, a-z, space, dot, or hyphen
    e.target.value = e.target.value.replace(/[^A-Za-z0-9 ,.-]/g, '');
  }}
  onBlur={(e) => {
    const value = e.target.value;
    const errorDiv = document.getElementById(`${qual.key}-institution-error`);
    if (!value) {
      errorDiv.textContent = 'Institution Name is required';
    } else {
      errorDiv.textContent = '';
    }
  }}
/>
<div id={`${qual.key}-institution-error`} className="error-message"></div>
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
        <Field as="select" name="modeOfAdmission" >
          <option value="">Select</option>
          <option value="NewsPaperAdvertisement">News Paper Advertisement</option>
          <option value="Friends">Friends</option>
          <option value="OldStudent">Old Student</option>
          <option value="Staff">Staff</option>
          <option value="SocialMedia">Social Media</option>

        </Field>
<ErrorMessage
  name="modeOfAdmission"
  component="div"
  className="error-message"
/>        </div>

      <div>
        <label>
          Status of Candidate <span style={{ color: 'red' }}>*</span>
        </label>
        <Field as="select" name="candidateStatus" >
          <option value="">Select</option>
          <option value="Student">Student</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Employed">Employed</option>
          <option value="Business">Business</option>
          <option value="SeniorCitizen">Senior Citizen</option>
        </Field>
<ErrorMessage
  name="candidateStatus"
  component="div"
  className="error-message"
/>        </div>

      {values.candidateStatus === 'Employed' && (
        <>
          <div>
            <label>Working At</label>
            <Field type="text" name="ifEmployed_WorkingAt" maxLength={150} 
             onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z .-]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
       }}/>
          </div>
        <div>
            <label>Designation</label>
            <Field type="text" name="desgination" maxLength={20} 
            />
          </div>
        </>
      )}

      <div>
        <label>
          Place <span style={{ color: 'red' }}>*</span>
        </label>
        <Field type="text" name="place"  maxLength={100} 
        onInput={(e) => {
       e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
       e.target.value = e.target.value.replace(/\s{2,}/g, " ");
       }}/>

<ErrorMessage
  name="place"
  component="div"
  className="error-message"
/>       </div>
 <div>
  <label>
    Date <span style={{ color: 'red' }}>*</span>
  </label>
<Field
    type="text"
    name="applicationDate"
    value={
      values.applicationDate
        ? moment(values.applicationDate).format("DD-MM-YYYY")
        : moment().format("DD-MM-YYYY") // default to today
    }
    readOnly
    className="text-input"
  />
<ErrorMessage
  name="applicationDate"
  component="div"
  className="error-message"
/>    </div>


      {/* Course Dropdown */}
  <div>
  <label>
    Course Name <span style={{ color: 'red' }}>*</span>
  </label>
  {applicationform ? (
    <input
      type="text"
      value={applicationform.courseName}
      disabled
      className="text-input"
    />
  ) : (
    <Field
      as="select"
      name="courseId"
      onChange={(e) => handleCourseChange(e.target.value, setFieldValue)}
      value={values.courseId}
      className="text-input"
    >
      <option value="">Select Course</option>
      {courseList.map((course) => (
        <option key={course.courseID} value={course.courseID}>
          {course.courseName}
        </option>
      ))}
    </Field>
  )}
  <ErrorMessage name="courseId" component="div" className="error-message" />
</div>

<div>
  <label>
    Batch Name <span style={{ color: 'red' }}>*</span>
  </label>
  {applicationform ? (
    <input
      type="text"
      value={applicationform.batchName}
      disabled
      className="text-input"
    />
  ) : (
    <Field
      as="select"
      name="batchId"
      onChange={(e) => handleBatchChange(e.target.value, setFieldValue)}
      value={values.batchId}
      className="text-input"
    >
      <option value="">Select Batch</option>
      {batches.map((batch) => (
        <option key={batch.batchID} value={batch.batchID}>
          {batch.batchName}
        </option>
      ))}
    </Field>
  )}
  <ErrorMessage name="batchId" component="div" className="error-message" />
</div>



 {(selectedBatch || applicationform) && (
  <div className="batch-details-card">
  <h4>Batch Details</h4>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
    <div style={{ flex: '1 1 45%' }}>
      <p><strong>Total Seats:</strong> {applicationform?.totalSeats ?? selectedBatch?.totalSeats}</p>
    </div>
    <div style={{ flex: '1 1 45%' }}>
      <p><strong>Available Seats:</strong> {applicationform?.availableSeats ?? selectedBatch?.availableSeats}</p>
    </div>
    <div style={{ flex: '1 1 45%' }}>
      <p><strong>Start Date:</strong> {moment(applicationform?.batchStartDate || selectedBatch?.startDate).format("YYYY/MM/DD")}</p>
    </div>
    <div style={{ flex: '1 1 45%' }}>
      <p><strong>End Date:</strong> {moment(applicationform?.batchEndDate || selectedBatch?.endDate).format("YYYY/MM/DD")}</p>
    </div>
   <div style={{ flex: '1 1 45%' }}>
  <p>
    <strong>Start Time:</strong>{" "}
    {applicationform?.batchStartTime || selectedBatch?.startTime
      ? moment(applicationform?.batchStartTime || selectedBatch?.startTime, "HH:mm").format("hh:mm A")
      : ""}
  </p>
</div>
<div style={{ flex: '1 1 45%' }}>
  <p>
    <strong>End Time:</strong>{" "}
    {applicationform?.batchEndTime || selectedBatch?.endTime
      ? moment(applicationform?.batchEndTime || selectedBatch?.endTime, "HH:mm").format("hh:mm A")
      : ""}
  </p>
</div>
    <div style={{ flex: '1 1 45%' }}>
      <p><strong>Instructor:</strong> {applicationform?.instructorName ?? selectedBatch?.instructorName}</p>
    </div>
    <div style={{ flex: '1 1 45%' }}>
      <p><strong>Course Fee:</strong> ₹{applicationform?.courseFee ?? selectedBatch?.courseFee}</p>
    </div>
    {(applicationform?.availableSeats === 0 || selectedBatch?.availableSeats === 0) && (
      <div style={{ flex: '1 1 100%' }}>
        <p style={{ color: "red", fontWeight: "bold" }}>Batch Full</p>
      </div>
    )}
  </div>
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
{/*<div className="col-xs-6 col-md-6 col-lg-6 col-sm-12 form-group">
  <label>Upload Photo (JPG/PNG only)</label>
  <input
    className="form-control"
    type="file"
    id="formFileMultiple"
    accept="image/png, image/jpeg"
  //  multiple
     ref={fileInputRef}
       onChange={(e) => handleFileChange(e, setFieldValue)}
  />
   
 
    {fileInputRef.current?.files?.length > 0 && (
    <button
      type="button"
      className="btn btn-sm btn-danger mt-2"
      onClick={() => {
        // Clear the input value
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        // Clear Formik field if used
        setFieldValue("files", []);
      }}
    >
      Clear
    </button>
  )}
  
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
</div>*/}
<div className="col-xs-6 col-md-6 col-lg-6 col-sm-12 form-group">
      <label>Upload Photo (JPG/PNG only)</label>
      <input
        className="form-control"
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        //onChange={handleFileChange}
          onChange={(e) => handleFileChange(e, setFieldValue)}
      />

      {/* Clear Button appears immediately when a file is selected */}
      {fileSelected && (
        <button type="button" className="btn btn-sm btn-danger mt-2" onClick={handleClear}>
          Clear
        </button>
      )}

      {/* Display filesList only if no new file is selected */}
      {!newFileSelected && applicationform?.files?.length > 0 && (
        <div className="d-flex flex-column mt-2 rounded">
          {filesList.map((fileName, index) => (
            <div
              key={index}
              className="d-flex align-items-center justify-content-between border rounded p-2 mb-1"
            >
              <span>{fileName || "No File Name"}</span>
              <button
                className="btn btn-sm btn-primary"
                type="button"
                onClick={() => handleDownload(fileName, applicationform.applicationID)}
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
    <Field type="checkbox" name="declaration"  />
    {' '}I hereby declare that the details furnished above are correct and I will adhere to the rules of the Continuing Education Centre.
  </label>
<ErrorMessage
  name="declaration"
  component="div"
  className="error-message"
/> 
</div>
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
   
    
{isSubmitClicked && !isUpdateClicked && !values.ispaymentdone && (
  <div
    style={{
      border: "1px solid black",
      padding: "20px",
      borderRadius: "8px",
      marginTop: "20px",
      maxWidth: "400px",
    }}
  >
    {/* Payment Mode */}
    <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
      <label>
        <Field type="radio" name="paymentMode" value="cash" />
        Cash
      </label>
      <label>
        <Field type="radio" name="paymentMode" value="card" />
        Card
      </label>
    </div>

    {/* Full Payment */}
    <div style={{ marginBottom: "10px" }}>
      <label>
        <Field type="checkbox" name="fullPayment" />
        Full Payment
      </label>
      <Field
        type="number"
        name="fullAmount"
        disabled={!values.fullPayment}
        style={{
          marginLeft: "10px",
          width: "100px",
          textAlign: "right",
        }}
      />
    </div>

    {/* Split Payment */}
    <div style={{ marginBottom: "10px" }}>
      <label>
        <Field type="checkbox" name="splitPayment" />
        Split
      </label>
      {values.splitPayment && (
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <Field
            type="number"
            name="split1"
            placeholder="1000"
            style={{ width: "100px", textAlign: "right" }}
          />
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>+</span>
          <Field
            type="number"
            name="split2"
            placeholder="1000"
            style={{ width: "100px", textAlign: "right" }}
          />
        </div>
      )}
    </div>

    {/* Balance */}
    <div style={{ marginTop: "10px", color: "red", fontWeight: "bold" }}>
      Balance: {selectedBatch?.courseFee || 0}
    </div>

    {/* Pay Button */}
    <div style={{ marginTop: "15px" }}>
      <button
        type="button"
        style={{
          border: "1px solid red",
          padding: "8px 20px",
          background: "white",
          color: "red",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() =>
          handleRazorpayPayment(
            saveddata,
            values.fullPayment
              ? values.fullAmount
              : Number(values.split1 || 0) + Number(values.split2 || 0)
          )
        }
      >
        Pay
      </button>
    </div>
  </div>
)}

   {admin === "Admin" && (
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
   )}
        </div>
)}
   
 
    {/* Show Submit/Update + Close only if Pay button is not being shown */}
    {!(isSubmitClicked || isUpdateClicked) && (
      <>
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
  {admin === "Admin" && (
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
  )}
      </>
    )}
  </div>


</Form>

      
    </Formik>
    </div>
    </div>

    
  );
};

export default UserForm;
