import React from "react";
import ReactDOM from "react-dom";
import "../globalStyle.scss";

// import RequestAddNew from 'components/wfRequestAddNewCmpts/wfRequestAddNewCmpt';
// import Header from 'components/menus/Header';
// import SidebarNav from 'components/SidebarNav';

// ReactDOM.render(<Header />, document.getElementById('Header'));
// ReactDOM.render(<SidebarNav activeClass={`RequestAddNew`} />, document.getElementById('SidebarNav'));
// ReactDOM.render(<RequestAddNew />, document.getElementById('wfRequestAddNew'));

import Header from "components/menus/Header";
import SidebarNav from "components/SidebarNav";
import RequestAddNew from "components/wfRequestAddNewCmpts/wfRequestAddNewCmpt";
import LicenseBPM from "components/wfShareCmpts/wfLicenseCmpt";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";

// ReactDOM.render(<Header />, document.getElementById('Header'));
ReactDOM.render(
  <SidebarNav activeClass={`RequestAddNew`} />,
  document.getElementById("SidebarNav")
);
if (checkLicense(config.license)) {
  ReactDOM.render(
    <RequestAddNew />,
    document.getElementById("wfRequestAddNew")
  );
} else {
  ReactDOM.render(<LicenseBPM />, document.getElementById("wfRequestAddNew"));
}
