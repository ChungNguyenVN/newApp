import React from "react";
import ReactDOM from "react-dom";
import "../globalStyle.scss";

// import HistoryApprove from 'components/wfHistoryApproveCmpts/wfHistoryApproveCmpt';
// import Header from 'components/menus/Header';
// import SidebarNav from 'components/SidebarNav';
// ReactDOM.render(<HistoryApprove />, document.getElementById('wfHistoryApprove'));
// ReactDOM.render(<Header />, document.getElementById('Header'));
// ReactDOM.render(<SidebarNav activeClass={`isHistoryApprove`}/>, document.getElementById('SidebarNav'));

import Header from "components/menus/Header";
import SidebarNav from "components/SidebarNav";
import HistoryApprove from "components/wfHistoryApproveCmpts/wfHistoryApproveCmpt";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";

// ReactDOM.render(<Header />, document.getElementById('Header'));
ReactDOM.render(
  <SidebarNav activeClass={`isHistoryApprove`} />,
  document.getElementById("SidebarNav")
);
if (checkLicense(config.license)) {
  ReactDOM.render(
    <HistoryApprove />,
    document.getElementById("wfHistoryApprove")
  );
} else {
  ReactDOM.render(<LicenseBPM />, document.getElementById("wfHistoryApprove"));
}
