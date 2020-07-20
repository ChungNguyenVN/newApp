import React from "react";
import ReactDOM from "react-dom";
import "../globalStyle.scss";
import "../tree.scss";
// import MyRequest from 'components/wfMyRequestCmpts/wfMyRequestCmpt';
// import Header from 'components/menus/Header';
// import SidebarNav from 'components/SidebarNav';
// ReactDOM.render(<Header />, document.getElementById('Header'));
// ReactDOM.render(<SidebarNav activeClass={`isRequest`} />, document.getElementById('SidebarNav'));
// ReactDOM.render(<MyRequest />, document.getElementById('wfMyRequest'));

import Header from "components/menus/Header";
import SidebarNav from "components/SidebarNav";
import MyRequest from "components/wfMyRequestCmpts/wfMyRequestCmpt";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import {
  checkLicense,
  getQueryParams,
} from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";
import RequestList from "components/wfRequestListCmpts/wfRequestListCmpt";

let param = getQueryParams(window.location.search);
let RequestType = param["RequestType"];
let active =
  RequestType == "AllRequest"
    ? "isAllRequest"
    : RequestType == "ReportRequest"
    ? "isReportRequest"
    : "isMyRequest";
// ReactDOM.render(<Header />, document.getElementById("Header"));
ReactDOM.render(
  <SidebarNav activeClass={active} />,
  document.getElementById("SidebarNav")
);
if (checkLicense(config.license)) {
  ReactDOM.render(<RequestList />, document.getElementById("wfMyRequest"));
  // ReactDOM.render(<MyRequest />, document.getElementById("wfMyRequest"));
} else {
  ReactDOM.render(<LicenseBPM />, document.getElementById("wfMyRequest"));
}
