import React, { forwardRef } from 'react';
import './IDCard.css';
import logo from "../../app/assets/logo.png";
import { FiPhone } from 'react-icons/fi';
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
      {/* Front Side */}
      <div className="id-card front">
        <div className="header">
          <img
            src={logo}
            alt="Thiagarajar Polytechnic College Logo"
            style={{ height: '30px', width: 'auto', marginLeft: '0px' }}
          />
          <div style={{ textAlign: 'left', marginLeft: '4px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '9px' }}>
              THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636 005.
            </div>
            <div style={{ fontSize: '9px', textAlign: "center" }}>
              CONTINUING EDUCATION CENTRE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'center' }}>
              <span>(Estd. Under CIICP) SALEM - 636 005</span>
              <div style={{
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiPhone size={10} />
              </div>
              <span>2446219, 4099303</span>
            </div>
          </div>
        </div>

        <div className="title">STUDENT IDENTITY CARD</div>

      <div className="details">
  <div className="left-info">
    <div className="row">
      <span className="label">Name</span>
      <span className="colon">:</span>
      <span className="value">{data.candidateName}</span>
    </div>
    <div className="row">
      <span className="label">Course</span>
      <span className="colon">:</span>
      <span className="value">{data.courseName}</span>
    </div>
    <div className="row">
      <span className="label">Batch No</span>
      <span className="colon">:</span>
      <span className="value">{data.batchName}</span>
    </div>
   <div className="validity-row">
  <div className="validity-group">
    <span className="validity-label">Valid From</span>
    <span className="validity-colon">:</span>
    <div className="validity-box">
      <span className="validity-value">{formatDate(data.batchStartDate)}</span>
    </div>
  </div>

  <div className="validity-group">
    <span className="validity-label to-label">To</span>
    
    <div className="validity-box">
      <span className="validity-value">{formatDate(data.batchEndDate)}</span>
    </div>
  </div>
</div>

  </div>

  <div className="stamp-box">
    {data.stampImage ? (
      <img
        src={data.stampImage}
        alt="Stamp"
        style={{
          width: "100%",
          height: "100%",
          objectFit: 'contain'
        }}
      />
    ) : (
      <span style={{ color: "#0b2d64" }}>Stamp Image</span>
    )}
  </div>
</div>


        <div className="signature-section">
          <div>Course Director</div>
          <div>Con.Ed. Manager</div>
        </div>
      </div>

      {/* Back Side */}
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
