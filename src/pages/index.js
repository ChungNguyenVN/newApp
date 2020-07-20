import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./globalStyle.scss";

// import Header from 'components/menus/Header';
// import Footer from 'components/Footer';
// import SidebarNav from 'components/SidebarNav';
// import Dashboard from 'components/wfDashboardCmpts/wfDashboardCmpt';
// import DatePickerForm from '../components/Containers/DatePiker';

// ReactDOM.render(<Header />, document.getElementById('Header'));
// ReactDOM.render(<Footer />, document.getElementById('Footer'));
// ReactDOM.render(<SidebarNav activeClass={`isDashboard`} />, document.getElementById('SidebarNav'));
// ReactDOM.render(<Dashboard />, document.getElementById('wfDashboard'));
// ReactDOM.render(<Alerts />, document.getElementById('Alerts'));
// ReactDOM.render(<DatePickerForm />, document.getElementById('DatePickerForm'));

import Header from "components/menus/Header";
import Footer from "components/Footer";
import SidebarNav from "components/SidebarNav";
import DashboardFeatured from "components/wfDashboardCmpts/wfDashboardCmpt";
import LandingPage from "../components/LandingPage";
import DatePickerForm from "../components/Containers/DatePiker";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import {
  checkLicense,
  getQueryParams,
} from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "./environment.js";
import ReportDashboard from "components/wfDashboardCmpts/ReportDashboard/index.js";
import "../assets/scss/theme.scss";
// ReactDOM.render(<Header />, document.getElementById("Header"));
// ReactDOM.render(<Footer />, document.getElementById("Footer"));
let param = getQueryParams(window.location.search);
let pagesType = param["TypePages"];
// let active =
//   pagesType == "ReportDashboard" ? "isReportDashboard" : "isHomeDashboard";
// ReactDOM.render(
//   <SidebarNav activeClass={active} />,
//   document.getElementById("SidebarNav")
// );
// if (checkLicense(config.license)) {
//   // ReactDOM.render(<ReportDashboard />, document.getElementById("wfDashboard"));
//   ReactDOM.render(
//     <DashboardFeatured TypePages={active} />,
//     document.getElementById("wfDashboard")
//   );
//   ReactDOM.render(<LandingPage />, document.getElementById('LandingPage'));
//   // ReactDOM.render(<DatePickerForm />, document.getElementById('DatePickerForm'));
// } else {
//   ReactDOM.render(<LicenseBPM />, document.getElementById("wfDashboard"));
// }
ReactDOM.render(<LandingPage />, document.getElementById('LandingPage'));