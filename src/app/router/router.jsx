import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RootLayout from "../../pages/layout/rootlayout.jsx";
import AddApplicationFormPage from "../../pages/form/AddApplicationFormPage.jsx";
import AddCoursePage from "../../pages/course/AddCoursePage.jsx";
import CourseTablePage from "../../pages/course/CourseTable.jsx";
import BatchTablePage from "../../pages/Batch/BatchTable.jsx";
import BatchDetails from "../../pages/Batch/AddBatchModal.jsx";
import ApplicationFormTablePage from "../../pages/form/ApplicationFormTable.jsx";
import UserForm from "../../pages/userForm.jsx";
import Login from "../../pages/login/login.jsx";
import { routePath as RP } from "./routhpath";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Standalone Login Page */}
        <Route path={RP.login} element={<Login />} />

        {/* Protected/Main Routes */}
        <Route path={RP.main} element={<RootLayout />}>
          <Route path={RP.form} element={<AddApplicationFormPage />} />
          <Route path={RP.coursetable} element={<CourseTablePage />} />
          <Route path={RP.course} element={<AddCoursePage />} />
           <Route path={RP.batchtable} element={<BatchTablePage />} />
          <Route path={RP.batch} element={<BatchDetails />} />
          <Route path={RP.applicationtable} element={<ApplicationFormTablePage />} />
            <Route path={RP.studentApplicationForm} element={<UserForm />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
