import React, { useEffect, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddApplicationFormPage from "../form/AddApplicationFormPage";
import "../course/courseform.css"; // CSS styles for table/card responsiveness
import IDCardTemplate from './IdCardTemplate.jsx';
import { useReactToPrint } from 'react-to-print';
import { useDispatch, useSelector } from "react-redux";
import { fetchFormList, deleteForm } from "../../app/redux/slice/formSlice.js";
import {fetchAttachmentReq} from "../../api/form/form.js"
/*const initialApplicationform = [
  { id: 1, name: "Mathematics", sex: "Male" },
  { id: 2, name: "Physics", sex: "Male" },
  { id: 3, name: "Chemistry", sex: "Male" },
];*/

export default function ApplicationFormTable() {
  const dispatch = useDispatch();
  
    // ✅ Take courses from Redux
    const { data:  Applicationform= []} = useSelector((state) => state.form);
      const [searchQuery, setSearchQuery] = useState("");
      const [page, setPage] = useState(1);
      const ApplicationformPerPage = 5;
      const [showModal, setShowModal] = useState(false);
        const [selectedtable, setSelectedtable] = useState(null);
   /*const [selectedApplication, setSelectedApplication] = useState(null);
  const [readyToPrint, setReadyToPrint] = useState(false);
  const componentRef = useRef();

  // ✅ Step 1: Setup the print function
  const print = useReactToPrint({
    content: () => componentRef.current,
  });

  // ✅ Step 2: Effect to trigger printing after DOM update
  useEffect(() => {
    if (readyToPrint && componentRef.current) {
      print();
      setReadyToPrint(false); // reset
    }
  }, [readyToPrint, componentRef.current]);

  // ✅ Step 3: Call this to print
  const handlePrint = (applicationData) => {
    setSelectedApplication(applicationData); // set data to print
    setReadyToPrint(true); // trigger print
  };*/

  /*const idRef = useRef();
  const [selectedApplication, setSelectedApplication] = useState(null);

  //const idRef = useRef();

const handlePrint = (application) => {
  setSelectedApplication(application);

  // Open new window immediately (inside user click)
  const printWindow = window.open("", "_blank");

  // Delay rendering until state updates
  setTimeout(() => {
    if (!idRef.current) return; // safeguard

    const printContents = idRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card</title>
          <style>
            @page { margin: 0; }
            body { font-family: Arial, sans-serif; padding: 20px; }
           
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 100);
};*/

 const idRef = useRef();
 const navigate = useNavigate();

  const [selectedApplication, setSelectedApplication] = useState(null);

  const handlePrint = useReactToPrint({
    //content: () => idRef.current,
    documentTitle: "ID Card",
    contentRef: idRef
  });

  const fetchAttachment = async (id, type) => {
    try {
      debugger;
      const response = await fetchAttachmentReq(id,type);
      /*if (!response.ok) {
        throw new Error("Failed to fetch attachment");
      }*/
     /* const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;*/
    /*  const result = await response.json();

    if (result.error || !result.data.length) {
      throw new Error("No attachments found");
    }*/

    const attachment = response.data[0]; // take the first attachment
    const base64Data = attachment.blobData;

    // Convert base64 string into image URL
    const imageUrl = `data:image/png;base64,${base64Data}`;
    return imageUrl;
      console.log(imageUrl,"return imageUrl");
    } catch (error) {
      console.error("Error fetching attachment:", error);
      return null;
    }
  };

  /*const printApplication = (application) => {
    setSelectedApplication(application);
    setTimeout(() => handlePrint(), 100);
  };*/
  
  const printApplication = async (application) => {
    try {
      const imageUrl = await fetchAttachment(application.applicationID, 'Students');
      setSelectedApplication({
        ...application,
        stampImage: imageUrl // Add the image URL to the data
      });

      setTimeout(() => {
        handlePrint();
        // Optional cleanup
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
      }, 100);
    } catch (error) {
      console.error("Error preparing print:", error);
    }
  };

    useEffect(() => {
      dispatch(fetchFormList());
    }, [dispatch]);
  const handleAddCourse = () => {
    navigate("/main/studentapplicationform");
  };
    const handleEdit = (applicationform) => {
      
    navigate("/main/studentapplicationform", { state: { applicationform } });
  };

  // const handleAddCourse = () => {
  //   setSelectedtable(null);
  //   setShowModal(true);
  // };

  // const handleEdit = (applicationform) => {
  //   setSelectedtable(applicationform);
  //   setShowModal(true);
  // };

  const handleModalSubmit = () => {
    setShowModal(false);
    setSelectedtable(null);
    dispatch(fetchFormList());
  };

  const handleDelete = (id) => {
    debugger;
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async(result) => {
    if (result.isConfirmed) {
        await deleteForm(id, dispatch);
        Swal.fire("Deleted!", "Application has been deleted.", "success");
      }
    });
  };

  const filteredApplicationform = Applicationform.filter(
    (applicationform) =>
      applicationform.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicationform.sex.toLowerCase().includes(searchQuery.toLowerCase() || 
      applicationform.courseName.toLowerCase().includes(searchQuery.toLocaleLowerCase)
  ));

  const totalPages = Math.ceil(filteredApplicationform.length / ApplicationformPerPage);
  const indexOfLast = page * ApplicationformPerPage;
  const indexOfFirst = indexOfLast - ApplicationformPerPage;
  const currentApplicationform = filteredApplicationform.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <div className="list-container">
        <div className="list-header">
          <h4>Application Form Details</h4>
          <button onClick={handleAddCourse}>+ Add New Application</button>
        </div>

        <input
          type="text"
          placeholder="Search applicationform..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "0.5rem 1rem",
            marginBottom: "1rem",
            width: "100%",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />

        {/* Desktop Table View */}
        <table className="list-table desktop-only">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name of Candidate</th>
              <th>Sex</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentApplicationform.length > 0 ? (
              currentApplicationform.map((applicationform, index) => (
                <tr key={applicationform.id}>
                  <td data-label="ID">{index + 1}</td>
                  <td data-label="Name of Candidate">{applicationform.candidateName}</td>
                  <td data-label="Sex">{applicationform.sex}</td>
                  <td data-label="courseName">{applicationform.courseName}</td>   
                  <td data-label="Actions" className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(applicationform)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(applicationform.applicationID)}>
                     Delete
                    </button>
                   
                  <button className="btn-delete" onClick={() => printApplication(applicationform)}> Id's Print</button>
                    {/* This part is hidden on screen, but used for printing */}
      

   
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>
                  No Applicationform found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Mobile Card jView */}
    {/* Mobile Card View */}
<div className="mobile-only">
  {currentApplicationform.length > 0 ? (
    currentApplicationform.map((applicationform, index) => (
      <div className="mobile-card" key={applicationform.id} role="group" aria-labelledby={`actions-label-${applicationform.id}`}>
        <div className="mobile-field">
          <strong>ID</strong>
          <span>{index + 1}</span>
        </div>
        <div className="mobile-field">
          <strong>Name</strong>
          <span>{applicationform.name}</span>
        </div>
        <div className="mobile-field">
          <strong>Sex</strong>
          <span>{applicationform.sex}</span>
        </div>
          <div className="mobile-field">
          <strong>Course</strong>
          <span>{applicationform.courseName}</span>
        </div>
        <div className="action-buttons" id={`actions-label-${applicationform.id}`}>
    <strong>Actions</strong>
    <div className="buttons-container">
      <button
        className="btn-edit"
        onClick={() => handleEdit(applicationform)}
        aria-label={`Edit ${applicationform.name} applicationform`}
      >
        Edit
      </button>
      <button
        className="btn-delete"
        onClick={() => handleDelete(applicationform.applicationID)}
        aria-label={`Delete ${applicationform.name} applicationform`}
      >
        Delete
      </button>
 <button className="btn-delete" onClick={() => printApplication(applicationform)}> Id's Print</button>

    </div>
  </div>
      </div>
    ))
  ) : (
    <div style={{ textAlign: "center", padding: "1rem" }}>No Applicationform found.</div>
  )}
</div>


        <div className="pagination-container">
          <div className="pagination">
            <button onClick={() => setPage(1)} disabled={page === 1}>
              &laquo;
            </button>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              &lt;
            </button>
            <span>
              Page <strong>{page}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              &gt;
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
<div style={{ display: "none" }}>
       
          
            <IDCardTemplate  ref={idRef} data={selectedApplication} />
          
        
      </div>
      {/* Modal Forms */}
      <AddApplicationFormPage
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        applicationform={selectedtable}
        initialData={selectedtable ? { ...selectedtable, imagePath: selectedtable.imagePath || "" } : null}  /* 🔹 added for file preview/download */
      />
    </>
  );
}