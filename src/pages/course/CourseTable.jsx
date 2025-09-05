import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseList, deleteCourse } from "../../app/redux/slice/courseSlice.js";
import AddCoursePage from "./AddCoursePage.jsx";
import "./CourseForm.css";

export default function CourseTable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Take courses from Redux
  const { data: courses = [], loading } = useSelector((state) => state.course);

  const [showModal, setShowModal] = useState(false);
  const [selectedtable, setSelectedtable] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const coursesPerPage = 5;

  useEffect(() => {
    dispatch(fetchCourseList());
  }, [dispatch]);

  const handleAddCourse = () => {
    setSelectedtable(null);
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setSelectedtable(course);
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    setShowModal(false);
    setSelectedtable(null);
    dispatch(fetchCourseList());
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteCourse(id, dispatch);
        Swal.fire("Deleted!", "Course has been deleted.", "success");
      }
    });
  };

  // ✅ Filter based on Redux courses
  const filteredCourses = courses.filter(
    (course) =>
      course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const indexOfLast = page * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <div className="list-container">
        <div className="list-header">
          <h4>Course Details</h4>
          <button onClick={handleAddCourse}>+ Add Course</button>
        </div>

        <input
          type="text"
          placeholder="Search courses..."
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
              <th>Course Name</th>
              <th>Course Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.length > 0 ? (
              currentCourses.map((course, index) => (
                <tr key={course.id}>
                  <td data-label="ID">{indexOfFirst + index + 1}</td>
                  <td data-label="Course Name">{course.courseName}</td>
                  <td data-label="Course Code">{course.courseCode}</td>
                  <td data-label="Actions" className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(course)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(course.courseID)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="mobile-only">
          {currentCourses.length > 0 ? (
            currentCourses.map((course, index) => (
              <div className="mobile-card" key={course.id}>
                <div className="mobile-field">
                  <strong>ID</strong>
                  <span>{indexOfFirst + index + 1}</span>
                </div>
                <div className="mobile-field">
                  <strong>Course Name</strong>
                  <span>{course.courseName}</span>
                </div>
                <div className="mobile-field">
                  <strong>Course Code</strong>
                  <span>{course.courseCode}</span>
                </div>
                <div className="action-buttons">
                  <strong>Actions</strong>
                  <div className="buttons-container">
                    <button className="btn-edit" onClick={() => handleEdit(course)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(course.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "1rem" }}>No courses found.</div>
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
              Page <strong>{page}</strong> of {totalPages || 1}
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

      {/* Modal Form */}
      <AddCoursePage
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        course={selectedtable}
      />
    </>
  );
}
