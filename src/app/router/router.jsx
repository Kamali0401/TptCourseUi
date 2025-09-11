import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "../../pages/layout/rootlayout.jsx";
import AddApplicationFormPage from "../../pages/form/AddApplicationFormPage.jsx";
import AddCoursePage from "../../pages/course/AddCoursePage.jsx";
import CourseTablePage from "../../pages/course/CourseTable.jsx";
import BatchTablePage from "../../pages/Batch/BatchTable.jsx";
import BatchDetails from "../../pages/Batch/AddBatchModal.jsx";
import ApplicationFormTablePage from "../../pages/form/ApplicationFormTable.jsx";
import UserForm from "../../pages/userForm.jsx";
import Sucess from "../../pages/paymentsuccess.jsx";
import Login from "../../pages/login/login.jsx";
import { routePath as RP } from "./routhpath";
import ReportFilterPage from "../../pages/Report/Reporttable.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirect to Login */}
        <Route path="/" element={<Navigate to={RP.login} replace />} />

        {/* Standalone Login Page */}
        <Route path={RP.login} element={<Login />} />

        {/* Protected/Main Route */}
        <Route path={RP.main} element={<RootLayout />}>
          <Route path={RP.form} element={<AddApplicationFormPage />} />
          <Route path={RP.coursetable} element={<CourseTablePage />} />
          <Route path={RP.course} element={<AddCoursePage />} />
          <Route path={RP.batchtable} element={<BatchTablePage />} />
          <Route path={RP.batch} element={<BatchDetails />} />
          <Route path={RP.applicationtable} element={<ApplicationFormTablePage />} />
          <Route path={RP.studentApplicationForm} element={<UserForm />} />
          <Route path={RP.Reporttable} element={<ReportFilterPage/>} />
          
        </Route>
         <Route path={RP.success} element={<Sucess />} />
      </Routes>
    </Router>
  );
};

export default App;
