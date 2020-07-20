import React from "react";
import ReactDOM from "react-dom";
import "../globalStyle.scss";
import "../tree.scss";
// import Header from 'components/menus/Header';
// import SidebarNav from 'components/SidebarNav';
// import Reports from 'components/wfReportCmpts/wfReportCmpt';
// ReactDOM.render(<Header />, document.getElementById('Header'));
// ReactDOM.render(<SidebarNav activeClass={`isReports`}/>, document.getElementById('SidebarNav'));
// ReactDOM.render(<Reports/>, document.getElementById('wfReport'));

import Header from "components/menus/Header";
import SidebarNav from "components/SidebarNav";
import Reports from "components/wfReportCmpts/wfReportCmpt";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";

// ReactDOM.render(<Header />, document.getElementById('Header'));
ReactDOM.render(
  <SidebarNav activeClass={`isReports`} />,
  document.getElementById("SidebarNav")
);
if (checkLicense(config.license)) {
  ReactDOM.render(<Reports />, document.getElementById("wfReport"));
} else {
  ReactDOM.render(<LicenseBPM />, document.getElementById("wfReport"));
}
