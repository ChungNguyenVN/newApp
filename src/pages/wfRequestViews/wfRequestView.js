import React from "react";
import ReactDOM from "react-dom";
import "../globalStyle.scss";

// import Header from 'components/menus/Header';
// import SidebarNav from 'components/SidebarNav';
// import RequestView from 'components/wfRequestViewCmpts/wfRequestViewCmpt';
// ReactDOM.render(<Header />, document.getElementById('Header'));
// ReactDOM.render(<SidebarNav />, document.getElementById('SidebarNav'));
// ReactDOM.render(<RequestView />, document.getElementById('wfRequestView'));

import Header from "components/menus/Header";
import SidebarNav from "components/SidebarNav";
import RequestView from "components/wfRequestViewCmpts/wfRequestViewCmpt";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";

ReactDOM.render(<Header />, document.getElementById("Header"));
ReactDOM.render(
  <SidebarNav activeClass={`isDashboard`} />,
  document.getElementById("SidebarNav")
);
if (checkLicense(config.license)) {
  ReactDOM.render(<RequestView />, document.getElementById("wfRequestView"));
} else {
  ReactDOM.render(<LicenseBPM />, document.getElementById("wfRequestView"));
}
