import React from "react";

const PaymentSuccess = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
       <div className="form-header">
          
          <h2>THIAGARAJAR POLYTECHNIC COLLEGE, SALEM-636005</h2>
          <h3>CONTINUING EDUCATION CENTRE</h3>
          <p>Phone: (0427) 2446219, 4099303 | Email: <a href="mailto:ciicptptc@gmail.com">ciicptptc@gmail.com</a></p>
          <p>Website: <a href="http://www.tpt.edu.in/ciicp" target="_blank" rel="noopener noreferrer">www.tpt.edu.in/ciicp</a></p>
        </div>
     <div style={{
  border: '1px solid #ccc',
  borderRadius: '10px',
  padding: '20px',
  maxWidth: '400px',
  margin: '50px auto',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
  textAlign: 'center'
}}>
  <h2 style={{ color: 'green', marginBottom: '15px' }}>Payment Successful!</h2>
  <p>Please contact the front office desk or reception for your receipt and ID card.</p>
</div>
        </div>
  );
};

export default PaymentSuccess;
