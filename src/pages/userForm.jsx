import React, { useState, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./userform.css";
import { updateForm ,addNewForm} from '../app/redux/slice/formSlice';
import { useDispatch } from "react-redux";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const applicationform = location.state?.applicationform;

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
    return submitValues;
  };

  const handleSave = async (values) => {
    const payload = prepareSubmitData(values);
    console.log("Saving new application:", payload);
    await addNewForm({ ...payload, createdBy: "AdminUser" }, dispatch);
  };

  const handleUpdate = async (values) => {
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

  <div style={{ marginTop: '10px' }}>
    <label>
      <Field type="checkbox" name="declaration" required />
      {' '}I hereby declare that the details furnished above are correct and I will adhere to the rules of the Continuing Education Centre.
    </label>
  </div>

  {/* Button Container */}
  <div className="form-buttons-container">
    <button type="submit" className="submit-button">
      {applicationform ? 'Update Application' : 'Save Application'}
    </button>
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
