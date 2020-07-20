import React, { Component, Fragment } from "react";
import { config } from "./../../pages/environment.js";
import * as moment from "moment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  ISODateString,
  formatDate,
  formatStatusText,
  formatStatusLabel,
  makeRandomColor,
  returnArray,
  returnObject,
  loadBranch,
  loadChildBranch,
  loadWFByDept,
  getQueryParams,
} from "components/wfShareCmpts/wfShareFunction.js";
import Card from "components/Card";
import {
  Grid,
  TextField,
  OutlinedInput,
  FormControl,
  Select,
  Button,
  MenuItem,
  FormGroup,
  FormControlLabel,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import SimpleTable from "components/Card/simpleTable";
import FunctionTable from "components/Containers/Tables/MaterialTable/functionTable";
import "components/Containers/FormAddNew/formStyle.scss";
import { Pie } from "react-chartjs-2";
import shareService from "components/wfShareCmpts/wfShareService.js";
import DropdownTreeSelect from "react-dropdown-tree-select";
import "components/Containers/FormAddNew/formStyle.scss";
import WFMyRequest from "./wfMyRequest";
import WFAllRequest from "./wfAllRequest";
import WFReportsRequest from "./wfReportRequest";

export default class RequestList extends Component {
  constructor(props) {
    super(props);
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      listWorkflow: [],
      listStepWorkflow: [],
      listDepartment: [],
      isShowForm: false,
    };
    this.currentUser = undefined;
  }

  componentDidMount() {
    let param = getQueryParams(window.location.search);
    // console.log(param);
    this.RequestType = param["RequestType"];
    this.setStateForm();
  }

  async setStateForm() {
    this.currentUser = await sp.web.currentUser();
    console.log(this.currentUser);

    let wfTable = await shareService.GetArrayWFTable();
    // console.log(wfTable);

    let wfStepTable = await shareService.GetArrayWFStepTable();
    // console.log(wfTableAll);

    let wfDepartment = await shareService.GetListDepartment();
    // console.log(wfDepartment);

    this.setState({
      listWorkflow: wfTable,
      listStepWorkflow: wfStepTable,
      listDepartment: wfDepartment,
      isShowForm: true,
    });
  }

  render() {
    const {
      listWorkflow,
      listStepWorkflow,
      listDepartment,
      isShowForm,
    } = this.state;
    return (
      <Fragment>
        {!isShowForm ? (
          ""
        ) : this.RequestType == "AllRequest" ? (
          <WFAllRequest
            listWorkflow={listWorkflow}
            listStepWorkflow={listStepWorkflow}
            listDepartment={listDepartment}
            currentUser={this.currentUser}
          />
        ) : this.RequestType == "ReportRequest" ? (
          <WFReportsRequest
            listWorkflow={listWorkflow}
            listStepWorkflow={listStepWorkflow}
            listDepartment={listDepartment}
            currentUser={this.currentUser}
          />
        ) : (
          <WFMyRequest
            listWorkflow={listWorkflow}
            listStepWorkflow={listStepWorkflow}
            listDepartment={listDepartment}
            currentUser={this.currentUser}
          />
        )}
      </Fragment>
    );
  }
}
