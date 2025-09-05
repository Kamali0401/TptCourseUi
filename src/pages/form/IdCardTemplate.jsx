import React, { forwardRef } from 'react';
import './IDCard.css';

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
          <div className="header">
            THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636 005.<br />
            CONTINUING EDUCATION CENTRE<br />
            (Estd. Under CIICP), SALEM - 636 005 📞 2446219, 4099303
          </div>
          <div className="title" style={{borderBottom:"1px solid black"}}>STUDENT IDENTITY CARD</div>
          
          <div className="details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',marginBottom: '30px' }}>
  {/* <div className="photo-box">...</div> */} {/* commented out photo box */}

  <div className="right-info" style={{ flex: 1 }}>
    <div><strong>Name:</strong> {data.candidateName}</div>
    <div><strong>Course:</strong> {data.course}</div>
    <div><strong>Batch No.:</strong> {data.batchName}</div>
   <div className="validity">
  <strong>Valid From:</strong> {formatDate(data.batchStartDate)} 
  <strong>To:</strong> {formatDate(data.batchEndDate)}
</div>
  </div>

  <div
    className="stamp-box"
    style={{
      width: '2cm',
      height: '2.5cm',
      border: '1px solid black',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}
  >
    {/* Paste your stamp image here */}
    {data.stampImage ? (
      <img
        src={data.stampImage}
        alt="Stamp"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    ) : (
      <span>Stamp Image</span>
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
            <strong>Blood Group:</strong> {data.bloodGroup}
          </div>
          <div className="field">
            <strong>Address for Communication:</strong><br />
            {data.contactAddress}
          </div>
          <div className="field">
            <strong>Phone / Cell No.:</strong> {data.mobileNumber}
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
