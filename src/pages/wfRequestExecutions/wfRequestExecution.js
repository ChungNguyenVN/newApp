import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./../globalStyle.scss";

// import Header from 'components/menus/Header';
// import SidebarNav from 'components/SidebarNav';
// import RequestExecution from 'components/wfRequestExecutionCmpts/wfRequestExecutionCmpt';

//  ReactDOM.render(<Header />, document.getElementById('Header'));
//  ReactDOM.render(<SidebarNav />, document.getElementById('SidebarNav'));
//  ReactDOM.render(<RequestExecution />, document.getElementById('wfRequestExecution'));

import Header from "components/menus/Header";
import SidebarNav from "components/SidebarNav";
import RequestExecution from "components/wfRequestExecutionCmpts/wfRequestExecutionCmpt";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";

// ReactDOM.render(<Header />, document.getElementById('Header'));
ReactDOM.render(
  <SidebarNav activeClass={`isExecution`} />,
  document.getElementById("SidebarNav")
);
if (checkLicense(config.license)) {
  ReactDOM.render(
    <RequestExecution />,
    document.getElementById("wfRequestExecution")
  );
} else {
  ReactDOM.render(
    <LicenseBPM />,
    document.getElementById("wfRequestExecution")
  );
}
