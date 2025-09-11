import React, { useEffect, useState } from "react";
import moment from "moment";

import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddBatchPage from "./AddBatchModal.jsx"; // Modal form
import "../course/courseform.css"; // CSS styles
import { fetchBatchList, deleteBatch } from "../../app/redux/slice/batchSlice.js";
import { useDispatch, useSelector } from "react-redux";


export default function BatchTable() {
    const dispatch = useDispatch();

  // ✅ Take courses from Redux
  const { data: batches = [], loading } = useSelector((state) => state.batch);

  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  //const [batches, setBatches] = useState(initialBatches);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const coursesPerPage = 5;
useEffect(() => {
    dispatch(fetchBatchList());
  }, [dispatch]);
  const handleAddBatch = () => {
      setSelectedBatch(null);
      setShowModal(true);
    };
  
    const handleEdit = (batch) => {
      setSelectedBatch(batch);
      setShowModal(true);
    };
  
    const handleModalSubmit = () => {
      setShowModal(false);
      setSelectedBatch(null);
      dispatch(fetchBatchList());
    };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async(result) => {
      if (result.isConfirmed) {
         await deleteBatch(id, dispatch);
      //  setBatches(batches.filter((b) => b.id !== id));
        Swal.fire("Deleted!", "Batch has been deleted.", "success");
      }
    });
  };

  const filteredBatches = batches.filter((batch) => {
    const query = searchQuery.toLowerCase();

    const matchesText =
      batch.batchName.toLowerCase().includes(query) ||
      batch.courseName.toLowerCase().includes(query);

    const matchesDate =
      batch.startDate.toLowerCase().includes(query) ||
      batch.endDate.toLowerCase().includes(query);

    return matchesText || matchesDate;
  });

  const totalPages = Math.ceil(filteredBatches.length / coursesPerPage);
  const indexOfLast = page * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredBatches.slice(indexOfFirst, indexOfLast);

  const Pagination = () => (
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
  );

  return (
    <>
      <div className="list-container">
        <div className="list-header">
          <h4>Batch Details</h4>
          <button
           /* onClick={() => {
              setSelectedBatch(null);
              setShowModal(true);
            }}*/
           onClick={handleAddBatch}
          >
            + Add Batch
          </button>
        </div>

        <input
          type="text"
          placeholder="Search batches..."
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

        {/* Desktop Table */}
        <table className="list-table desktop-only">
          <thead>
            <tr>
              <th>ID</th>
              <th>Batch Name</th>
              <th>Course Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.length > 0 ? (
              currentCourses.map((batch, index) => (
                <tr key={batch.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{batch.batchName}</td>
                  <td>{batch.courseName}</td>
              <td>{batch.startDate ? moment(batch.startDate).format("YYYY-MM-DD") : ""}</td>
                  <td>{batch.status}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(batch)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(batch.batchID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                  No batches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination for Desktop */}
        <div className="desktop-only">
          <Pagination />
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-only">
        {currentCourses.length > 0 ? (
          currentCourses.map((batch, index) => (
            <div
              className="mobile-card"
              key={batch.id}
              role="group"
              aria-labelledby={`actions-label-${batch.id}`}
            >
                <div className="mobile-field">
                <strong>ID</strong>
                 <span>{index + 1}</span>
              </div>
              <div className="mobile-field">
                <strong>Batch Name</strong>
                <span>{batch.batchName}</span>
              </div>
              <div className="mobile-field">
                <strong>Course Name</strong>
                <span>{batch.courseName}</span>
              </div>
              <div className="mobile-field">
                <strong>Start Date</strong>
                <span>{batch.startDate}</span>
              </div>
              <div className="mobile-field">
                <strong>End Date</strong>
                <span>{batch.endDate}</span>
              </div>
              <div className="action-buttons" id={`actions-label-${batch.id}`}>
                <strong>Actions</strong>
                <div className="buttons-container">
                  <button className="btn-edit" onClick={() => handleEdit(batch)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(batch.batchID)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "1rem" }}>
            No batches found.
          </div>
        )}

        {/* Pagination for Mobile */}
        <Pagination />
      </div>

      {/* Modal */}
      <AddBatchPage
       key={selectedBatch ? selectedBatch.batchID : "new"}
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        batch={selectedBatch}
      />
    </>
  );
}
