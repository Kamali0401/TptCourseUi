import React, { useState, useEffect } from "react";
import { fetchCourseListReq } from "../../api/course/course";
import { fetchBatchDropdownReq,fetchBatchReqById } from "../../api/batch/batch";
import Swal from "sweetalert2";
import { publicAxios } from "../../api/config";
import { ApiKey } from "../../api/endpoint";
//const mealTypes = ["Breakfast", "Lunch", "Dinner"];
export default function ReportFilterPage() {
  const [startDate, setStartDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showReportButtons, setShowReportButtons] = useState(false);

  // Fetch all courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetchCourseListReq();
        setCourses(res.data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        Swal.fire("Error", "Failed to load courses", "error");
      }
    };
    loadCourses();
  }, []);

  // Fetch batches when course changes
 const handleCourseChange = async (id) => {
    debugger;
    const courseIdInt = parseInt(id, 10); // Convert id to integer

    if (isNaN(courseIdInt)) {
        console.error("Invalid Course ID:", id);
        return;
    }

    setCourseId(courseIdInt);
    setBatchId(""); // reset batch

    if (!courseIdInt) {
        setBatches([]);
        return;
    }

    try {
        const res = await fetchBatchReqById(courseIdInt);
        setBatches(res.data || []);
    } catch (err) {
        console.error("Error fetching batches:", err);
        Swal.fire("Error", "Failed to load batches", "error");
    }
};


   // Call Report API-
  const handleSubmit = async () => {
    debugger;
  try {
    const response = await publicAxios.get(ApiKey.Report, {
      params: {
        startDate: startDate || null,
        course: courseId || null,
        batch: batchId || null
      },
      responseType: "blob"
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Report.xlsx"; // 👈 filename
    link.click();

    Swal.fire("Success", "Report downloaded successfully!", "success");
  } catch (error) {
    console.error("Failed to download report:", error);
    Swal.fire("Error", "Failed to download report", "error");
  }
};


  return (
    <div className="custom-container border border-dark rounded p-4 mt-4 mx-5">
      <div className="row mb-4">
        {/* Start Date */}
        <div className="col-lg-4 mb-3">
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Course Name */}
        <div className="col-lg-4 mb-3">
          <label>Course Name</label>
          <select
            className="form-control"
            value={courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.courseID} value={course.courseID}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Name*/}
        <div className="col-lg-4 mb-3">
          <label>Batch Name</label>
          <select
            className="form-control"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            disabled={!courseId}
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch.batchID} value={batch.batchID}>
                {batch.batchName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Get Reports Button */}
      <div className="row mb-4">
        <div className="col-lg-3">
          <button className="btn btn-success" onClick={handleSubmit}>
            Get Reports
          </button>
        </div>
      </div>
    </div>
  );
}
