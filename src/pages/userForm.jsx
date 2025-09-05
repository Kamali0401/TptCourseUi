import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./userform.css";
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
  const navigate = useNavigate();
  const applicationform = location.state?.applicationform;

  // Initialize state based on whether we are editing or adding
  const [selectedQuals, setSelectedQuals] = useState(
    applicationform
      ? QUALIFICATIONS.map((q) => q.key).filter(
          (q) => applicationform[q] && (applicationform[q].year || applicationform[q].marks || applicationform[q].institution)
        )
      : []
  );
  const [dob, setDob] = useState(applicationform?.dob ? new Date(applicationform.dob) : null);

  const toggleQualification = (key) => {
    setSelectedQuals(prev =>
      prev.includes(key) ? prev.filter(q => q !== key) : [...prev, key]
    );
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

  const initialValues = applicationform ? {
    ...applicationform,
    dob: applicationform.dob ? new Date(applicationform.dob) : null,
    date: applicationform.date ? new Date(applicationform.date) : null,
    declaration: applicationform.declaration || false,
    ...QUALIFICATIONS.reduce((acc, qual) => {
      acc[qual.key] = applicationform[qual.key] || { year: '', marks: '', institution: '' };
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
        // Here you would handle form submission, e.g., API call
        if (applicationform) {
          console.log('Updating form:', values);
          // API call to update...
        } else {
          console.log('Submitting new form:', values);
          // API call to create...
        }
        setSubmitting(false);
        navigate('/applicationformtable'); // Navigate back to the table
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

  {/* Qualifications checkboxes */}
  <div className="checkbox-group">
    <label>
      Select Academic Qualifications <span style={{ color: 'red' }}>*</span>
    </label>
    {QUALIFICATIONS.map((qual) => (
      <label key={qual.key} style={{ display: 'block', marginBottom: '6px' }}>
        <input
          type="checkbox"
          checked={selectedQuals.includes(qual.key)}
          onChange={() => toggleQualification(qual.key)}
        />{' '}
        {qual.label}
      </label>
    ))}
  </div>

  {/* Qualification Details Section */}
  {selectedQuals.map((qualKey) => {
    const label = QUALIFICATIONS.find((q) => q.key === qualKey)?.label;
    return (
      <div key={qualKey} className="qualification-block">
        <h4>{label} Details</h4>
        <div className="form-grid">
          <div>
            <label>
              Year of Passing <span style={{ color: 'red' }}>*</span>
            </label>
            <Field name={`${qualKey}.year`} type="number" required />
          </div>

          <div>
            <label>
              % of Marks Obtained <span style={{ color: 'red' }}>*</span>
            </label>
            <Field name={`${qualKey}.marks`} type="number" required />
          </div>

          <div>
            <label>
              Name of Institution <span style={{ color: 'red' }}>*</span>
            </label>
            <Field name={`${qualKey}.institution`} type="text" required />
          </div>
        </div>
      </div>
    );
  })}

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

  <button type="submit" style={{ marginTop: 20 }}>Submit</button>
</Form>

      )}
    </Formik>
    </div>
    </div>
  );
};

export default UserForm;
