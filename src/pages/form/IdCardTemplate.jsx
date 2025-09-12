import React, { forwardRef } from 'react';
import './IDCard.css';
import logo from "../../app/assets/logo.png";
const IDCardTemplate = forwardRef((props, ref) => {
    debugger;

    const { data } = props;
    if (!data) {
    return null; // nothing to render
  }
  const formatDate = (dateStr) => new Date(dateStr).toISOString().split("T")[0]; // yyyy-MM-dd

  return (
    <div ref={ref}>
      <div id="print-id-card" className="id-card-container">
        {/* Front of the ID card */}
        <div className="id-card front">
         {/* <div className="header" style={{ display: 'flex', gap: '1px' }}>
    <img
      src={logo} // Replace with the actual logo path or import
      alt="Thiagarajar Polytechnic College Logo"
      style={{ height: '30px', width: 'auto' }}
    />
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontWeight: 'bold', fontSize: '9px' }}>
        THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636 005.
      </div>
      <div style={{ fontSize: '9px',textAlign:"center" }}>CONTINUING EDUCATION CENTRE</div>
      <div style={{ fontSize: '9px' }}>
        (Estd. Under CIICP), SALEM - 636 005 📞 2446219, 4099303
      </div>
    </div>
  </div>*/}
  <div className="header">
  <img
    src={logo} // Replace with actual logo path or import
    alt="Thiagarajar Polytechnic College Logo"
    style={{ height: '30px', width: 'auto', marginLeft: '0px' }} // Ensure no left margin
  />
  <div style={{ textAlign: 'left', marginLeft: '4px' }}> {/* Small space between logo and text */}
    <div style={{ fontWeight: 'bold', fontSize: '9px' }}>
      THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636 005.
    </div>
    <div style={{ fontSize: '9px', textAlign: "center" }}>
      CONTINUING EDUCATION CENTRE
    </div>
    <div style={{ fontSize: '9px' }}>
      (Estd. Under CIICP), SALEM - 636 005 📞 2446219, 4099303
    </div>
  </div>
</div>
          <div className="title" style={{borderBottom:"1px solid #0b2d64"}}>STUDENT IDENTITY CARD</div>
          
          <div className="details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',marginBottom: '30px' }}>
  {/* <div className="photo-box">...</div> */} {/* commented out photo box */}

  <div className="right-info" style={{ flex: 1 }}>
    <div><strong>Name :</strong> {data.candidateName}</div>
    <div><strong>Course :</strong> {data.courseName}</div>
    <div><strong>Batch No :</strong> {data.batchName}</div>
   <div className="validity">
  <strong>Valid From :</strong> {formatDate(data.batchStartDate)} 
  <strong>To</strong> {formatDate(data.batchEndDate)}
</div>
  </div>

  <div
    className="stamp-box"
    style={{
      width: '2cm',
      height: '2.5cm',
      border: '1px solid #0b2d64',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
       overflow: 'hidden',
     paddingLeft: '0.5mm',     // 👈 Reduced from 1mm
    paddingRight: '0.5mm',
    paddingTop: 0,
    paddingBottom: 0, // 👈 small padding to separate image from border
    boxSizing: 'border-box', // ensures padding doesn't increase size
      overflow: 'hidden',
      backgroundColor: 'white', // optional
    }}
  >
    {/* Paste your stamp image here */}
    {data.stampImage ? (
      <img
        src={data.stampImage}
        alt="Stamp"
        style={{   width: "100%",       
      height: "100%",      
     objectFit: 'contain' }}
      // style={{ width: '2cm', height: '2.5cm', objectFit: 'fill' }}
      />
    ) : (
      <span style={{color:" #0b2d64"}}>Stamp Image</span>
    )}
  </div>
</div>

          <div className="signature-section">
            <div>Course Director</div>
            <div>Con.Ed. Manager</div>
          </div>
        </div>

        {/* Back of the ID card */}
        <div className="id-card back">
          <div className="field">
            <strong>Blood Group :</strong> {data.bloodGroup}
          </div>
          <div className="field">
            <strong>Address for Communication :</strong><br />
            {data.contactAddress}
          </div>
          <div className="field">
            <strong>Phone / Cell No.</strong> {data.mobileNumber}
          </div>

          <div className="signature-section">
            <div>Parent / Guardian's Signature</div>
            <div>Student Signature</div>
          </div>
        </div>
      </div>
   </div>
  );
});


export default IDCardTemplate;
