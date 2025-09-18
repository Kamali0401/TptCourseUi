import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserList , deleteUser } from "../../app/redux/slice/usersSlice.js"
import { useNavigate } from "react-router-dom";
import AddUserPage from "./Adduser.jsx";
import "../course/courseform.css"
export default function UserTable() {
  const dispatch = useDispatch();

  // ✅ Get users from Redux
  const { data: users = [], loading } = useSelector((state) => state.user);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    setShowModal(false);
    setSelectedUser(null);
    dispatch(fetchUserList());
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteUser(id, dispatch);
        Swal.fire("Deleted!", "User has been deleted.", "success");
      }
    });
  };

  // ✅ Filter users by name/email
const filteredUsers = users.filter(
  (user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
);


  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLast = page * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <div className="list-container">
        {/* Header */}
        <div className="list-header">
          <h4>User Details</h4>
          <button onClick={handleAddUser}>+ Add User</button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search users..."
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
      <th>Full Name</th>
      <th>User ID</th>
      <th>Role</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {currentUsers.length > 0 ? (
      currentUsers.map((user, index) => (
        <tr key={user.id}>
          <td data-label="ID">{indexOfFirst + index + 1}</td>
          <td data-label="Full Name">{user.fullName || "N/A"}</td>
          <td data-label="Email">{user.username}</td>
          <td data-label="Role">{user.role}</td>
          <td data-label="Actions" className="action-buttons">
            <button className="btn-edit" onClick={() => handleEdit(user)}>
              Edit
            </button>
            <button
              className="btn-delete"
              onClick={() => handleDelete(user.id)}
            >
              Delete
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
          No users found.
        </td>
      </tr>
    )}
  </tbody>
</table>

     {/* Mobile Card View */}
<div className="mobile-only">
  {currentUsers.length > 0 ? (
    currentUsers.map((user, index) => (
      <div className="mobile-card" key={user.id}>
        <div className="mobile-field">
          <strong>ID</strong>
          <span>{indexOfFirst + index + 1}</span>
        </div>
        <div className="mobile-field">
          <strong>Full Name</strong>
          <span>{user.fullName || "N/A"}</span>
        </div>
        <div className="mobile-field">
          <strong>User ID</strong>
          <span>{user.username}</span>
        </div>
        <div className="mobile-field">
          <strong>Role</strong>
          <span>{user.role}</span>
        </div>
        <div className="action-buttons">
          <strong>Actions</strong>
          <div className="buttons-container">
            <button className="btn-edit" onClick={() => handleEdit(user)}>
              Edit
            </button>
            <button
              className="btn-delete"
              onClick={() => handleDelete(user.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      No users found.
    </div>
  )}
</div>

        {/* Pagination */}
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
              Page <strong>{page}</strong> of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              &gt;
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>
              &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <AddUserPage
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        user={selectedUser}
      />
    </>
  );
}
