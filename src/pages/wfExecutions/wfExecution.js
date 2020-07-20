import React from "react";
import ReactDOM from "react-dom";
import "../globalStyle.scss";

// import Execution from 'components/wfExecutionCmpts/wfExecutionCmpt';
// import Header from 'components/menus/Header';
// import SidebarNav from 'components/SidebarNav';
// ReactDOM.render(<Execution/>, document.getElementById('wfExecution'));
// ReactDOM.render(<Header />, document.getElementById('Header'));
// ReactDOM.render(<SidebarNav  activeClass={`isExecution`}/>, document.getElementById('SidebarNav'));

import Header from "components/menus/Header";
import SidebarNav from "components/SidebarNav";
import Execution from "components/wfExecutionCmpts/wfExecutionCmpt";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";

// ReactDOM.render(<Header />, document.getElementById('Header'));
ReactDOM.render(
  <SidebarNav activeClass={`isExecution`} />,
  document.getElementById("SidebarNav")
);
if (checkLicense(config.license)) {
  ReactDOM.render(<Execution />, document.getElementById("wfExecution"));
} else {
  ReactDOM.render(<LicenseBPM />, document.getElementById("wfExecution"));
}
