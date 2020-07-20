import React, { Component } from "react";
import { config } from "./../../../pages/environment.js";
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
  loadMemberUsersDept,
  loadReportStepSLA,
  loadWorkflowInDept,
} from "components/wfShareCmpts/wfShareFunction.js";
import { ObjTitleColumns } from "components/wfShareCmpts/wfShareModel.js";

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
  CircularProgress,
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
import WFTableRequest from "./../wfTableRequest";

export default class WFReportsRequest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowLoadingPage: true,
      TitleSearch: "",
      StatusSearch: "",
      startDateSearch: new Date(
        moment(new Date())
          .subtract(30, "day")
          .hours(0)
          .minutes(0)
          .seconds(0)
          .toDate()
      ),
      endDateSearch: new Date(
        moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
      ),
      order: "desc",
      orderBy: "DateRequest",
      page: 0,
      rowsPerPage: 10,
      lengthData: 0,
      dataSources: [],
      arrayPage: [],
      listWorkflow: this.props.listWorkflow,
      listStepWorkflow: this.props.listStepWorkflow,
      listDepartment: this.props.listDepartment,
      currentUser: this.props.currentUser,
      listWorlkflowActive: this.props.listWorkflow.filter(
        (wf) => wf.Status != 0
      ),
      listSearch_WFTable: [],
      listSearch_WFTableOld: [],
      listSearch_WFTableDeptOld: [],
      search_WFTable: "",
      list_WFTable: [],
      listSearch_MemberUsers: [],
      listSearch_MemberUsersOld: [],
      search_MemberUsers: "",
      list_MemberUsers: [],
      DepartmentTitle: "",
      DepartmentSearch: "",
      DepartmentTree: [],
      DepartmentIndexOld: {},
      VotesType: "VotesCreated",
      ReportRequest: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      },
      ReportSLA: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      },
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });

    this.changeFormInput = this.changeFormInput.bind(this);
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.changeSearchPeople = this.changeSearchPeople.bind(this);

    this.callbackNexPage = this.callbackNexPage.bind(this);
    this.callbackSort = this.callbackSort.bind(this);
    this.callbackRowPage = this.callbackRowPage.bind(this);

    this.typingTimeout = null;
    this.permissionUser = { Permission: "User", Dept: [] };
    this.startIndex = 0;
    this.endIndex = 40;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      listWorkflow: nextProps.listWorkflow,
      listStepWorkflow: nextProps.listStepWorkflow,
      listDepartment: nextProps.listDepartment,
      currentUser: nextProps.currentUser,
      listWorlkflowActive: nextProps.listWorkflow.filter(
        (wf) => wf.Status != 0
      ),
    });
  }

  componentDidMount() {
    this.setStateForm();
  }

  async setStateForm() {
    this.permissionUser = await shareService.checkPermissionUser(
      this.state.currentUser.Id,
      this.state.listDepartment
    );
    console.log(this.permissionUser);

    if (this.permissionUser.Permission == "User") {
      let listWFUser = [];

      let arrayWFByDept = loadWFByDept(
        this.permissionUser.Dept,
        this.state.listWorlkflowActive
      );
      arrayWFByDept.map((child) => {
        if (listWFUser.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          listWFUser.push(child);
        }
      });

      let wfDefault = this.state.listWorlkflowActive.filter(
        (wf) =>
          wf.WhoIsUsed == "All Users" ||
          (wf.WhoIsUsed == "Users" &&
            wf.UserDefault.indexOf(this.state.currentUser.Id) != -1)
      );
      wfDefault.map((child) => {
        if (listWFUser.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          listWFUser.push(child);
        }
      });

      await this.setState({
        listSearch_WFTable: listWFUser,
        listSearch_WFTableOld: listWFUser,
        listSearch_WFTableDeptOld: listWFUser,
      });
    } else {
      let listDept = returnArray(this.permissionUser.Dept);
      if (this.permissionUser.Permission == "Admin") {
        let listWFAdmin = returnArray(this.state.listWorlkflowActive);
        await this.setState({
          listSearch_WFTable: listWFAdmin,
          listSearch_WFTableOld: listWFAdmin,
          listSearch_WFTableDeptOld: listWFAdmin,
          DepartmentTree: listDept,
        });
      } else {
        let objDept = returnObject(listDept[0]);
        let userMembers = loadMemberUsersDept(objDept);
        let listWFManager = loadWorkflowInDept(
          objDept,
          userMembers,
          this.state.listWorlkflowActive
        );

        await this.setState({
          listSearch_WFTable: listWFManager,
          listSearch_WFTableOld: listWFManager,
          listSearch_WFTableDeptOld: listWFManager,
          listSearch_MemberUsers: userMembers,
          listSearch_MemberUsersOld: userMembers,
          DepartmentTitle: objDept.Title,
          DepartmentSearch: objDept.Code,
          DepartmentTree: listDept,
          DepartmentIndexOld: objDept,
        });
      }
    }

    this.callSearch();
  }

  async resetItem() {
    let wfTableOld = returnArray(this.state.listSearch_WFTableOld);
    let userOld = returnArray(this.state.listSearch_MemberUsersOld);
    let deptIndexOld = returnObject(this.state.DepartmentIndexOld);

    await this.setState({
      TitleSearch: "",
      StatusSearch: "",
      startDateSearch: new Date(
        moment(new Date())
          .subtract(30, "day")
          .hours(0)
          .minutes(0)
          .seconds(0)
          .toDate()
      ),
      endDateSearch: new Date(
        moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
      ),

      listSearch_WFTable: wfTableOld,
      search_WFTable: "",
      list_WFTable: [],
      listSearch_MemberUsers: userOld,
      search_MemberUsers: "",
      list_MemberUsers: [],
      DepartmentTitle: isNotNull(deptIndexOld.Title) ? deptIndexOld.Title : "",
      DepartmentSearch: isNotNull(deptIndexOld.Code) ? deptIndexOld.Code : "",

      dataSources: [],
      lengthData: 0,
      order: "desc",
      orderBy: "DateRequest",
      page: 0,
      rowsPerPage: 10,
      arrayPage: [],

      VotesType: "VotesCreated",
      ReportRequest: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      },
      ReportSLA: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      },
    });
    // this.Search();
    this.dataHistory = undefined;
    this.callSearch();
  }

  async callSearch() {
    this.Search(this.state.order, this.state.orderBy, this.state.rowsPerPage);
  }

  async Search(sort, sortBy, rowsPerPage) {
    await this.setState({ isShowLoadingPage: true });
    this.startIndex = 0;
    this.endIndex = 40;
    let objResultItem = {
      requestList: [],
      requestReport: [],
      requestSLA: {
        Dat: 0,
        KhongDat: 0,
        TrongThoiHan: 0,
        NgoaiThoiHan: 0,
        ChuaTinhSLA: 0,
      },
    };

    let listSearch = await this.searchLists(
      this.state.order,
      this.state.orderBy,
      this.state.rowsPerPage,
      objResultItem
    );
    // console.log(listSearch);

    let dataRequest = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
        },
      ],
    };

    listSearch.requestReport.map((checkD) => {
      dataRequest.labels.push(checkD.TitleReport);
      dataRequest.datasets[0].data.push(checkD.numReport);
      let color = makeRandomColor();
      dataRequest.datasets[0].backgroundColor.push(color);
    });
    // console.log(dataRequest);

    let dataSLA = {
      labels: [
        "Đạt",
        "Không Đạt",
        "Trong thời hạn",
        "Ngoài thời hạn",
        "Chưa tính SLA",
      ],
      datasets: [
        {
          data: [
            listSearch.requestSLA.Dat,
            listSearch.requestSLA.KhongDat,
            listSearch.requestSLA.TrongThoiHan,
            listSearch.requestSLA.NgoaiThoiHan,
            listSearch.requestSLA.ChuaTinhSLA,
          ],
          backgroundColor: ["green", "red", "blue", "orange", "#6c757d"],
        },
      ],
    };
    // console.log(dataSLA);

    let lengthPage = listSearch.requestList.length;
    let arrPages = [];
    let numPages = lengthPage / parseInt(rowsPerPage);
    let maxPages = parseInt(numPages);
    if (numPages.toString().split(".")[1] != undefined) {
      maxPages += 1;
    }
    for (let p = 0; p < maxPages; p++) {
      arrPages.push(p);
    }

    this.setState({
      dataSources: listSearch.requestList,
      lengthData: lengthPage,
      order: sort,
      orderBy: sortBy,
      page: 0,
      rowsPerPage: rowsPerPage,
      arrayPage: arrPages,
      ReportRequest: dataRequest,
      ReportSLA: dataSLA,
      isShowLoadingPage: false,
    });
  }

  async searchLists(sort, sortBy, rowsPerPage, objResultItem) {
    // console.log(this.state.list_WFTable);
    // console.log(this.state.listSearch_WFTable);
    if (this.state.list_WFTable.length > 0) {
      if (this.state.list_WFTable.length <= this.endIndex) {
        this.endIndex = this.state.list_WFTable.length;
      }
    } else {
      if (this.state.listSearch_WFTable.length <= this.endIndex) {
        this.endIndex = this.state.listSearch_WFTable.length;
      }
    }
    let listUsersCheck = [];
    if (this.permissionUser.Permission == "User") {
      listUsersCheck = [
        {
          UserId: this.state.currentUser.Id,
          UserTitle: this.state.currentUser.Title,
          UserEmail: this.state.currentUser.Email,
        },
      ];
    } else if (this.state.list_MemberUsers.length > 0) {
      listUsersCheck = returnArray(this.state.list_MemberUsers);
    } else {
      listUsersCheck = returnArray(this.state.listSearch_MemberUsers);
    }
    // console.log(listUsersCheck);
    objResultItem = await this.searchListItem(
      sort,
      sortBy,
      rowsPerPage,
      listUsersCheck,
      objResultItem
    );
    // arrayResult = arrayResult.concat(listItems);

    if (this.state.list_WFTable.length > this.endIndex) {
      this.startIndex += 40;
      this.endIndex += 40;
      let listItemNext = await this.searchLists(
        sort,
        sortBy,
        rowsPerPage,
        objResultItem
      );
      // arrayResult = arrayResult.concat(listItemNext);
    } else if (
      this.permissionUser.Permission == "User" &&
      this.state.list_WFTable.length == 0 &&
      this.state.VotesType == "VotesCreated" &&
      this.state.listSearch_WFTable.length > this.endIndex
    ) {
      this.startIndex += 40;
      this.endIndex += 40;
      let listItemNext = await this.searchLists(
        sort,
        sortBy,
        rowsPerPage,
        objResultItem
      );
      // arrayResult = arrayResult.concat(listItemNext);
    } else if (
      this.permissionUser.Permission != "User" &&
      this.state.list_WFTable.length == 0 &&
      this.state.VotesType == "VotesCreated" &&
      isNotNull(this.state.DepartmentSearch) &&
      this.state.listSearch_WFTable.length > this.endIndex
    ) {
      this.startIndex += 40;
      this.endIndex += 40;
      let listItemNext = await this.searchLists(
        sort,
        sortBy,
        rowsPerPage,
        objResultItem
      );
      // arrayResult = arrayResult.concat(listItemNext);
    }

    return objResultItem;
  }

  async searchListItem(
    sort,
    sortBy,
    rowsPerPage,
    listUsersCheck,
    objResultListItem
  ) {
    let items = [];
    let queryFilter = `ID ne 0`;

    if (isNotNull(this.state.TitleSearch)) {
      queryFilter +=
        ` and substringof('` + this.state.TitleSearch + `', Title)`;
    }

    if (this.state.list_WFTable.length > 0) {
      if (this.permissionUser.Permission == "User") {
        if (this.state.VotesType == "VotesProcessed") {
          queryFilter +=
            " and HistoryApprover/ID eq " + this.state.currentUser.Id + " ";
        } else {
          queryFilter +=
            " and UserCreated/ID eq " + this.state.currentUser.Id + " ";
        }
      }
      let listSelect = "";
      for (let index1 = this.startIndex; index1 < this.endIndex; index1++) {
        let itemWF = returnObject(this.state.list_WFTable[index1]);
        if (isNotNull(listSelect)) {
          listSelect += " or WFTableId eq " + itemWF.WFId + "";
        } else {
          listSelect += "WFTableId eq " + itemWF.WFId + "";
        }
      }
      queryFilter += " and (" + listSelect + ")";
    } else if (this.permissionUser.Permission != "Admin") {
      if (this.permissionUser.Permission == "User") {
        if (this.state.VotesType == "VotesProcessed") {
          queryFilter +=
            " and HistoryApprover/ID eq " + this.state.currentUser.Id + " ";
        } else {
          queryFilter +=
            " and UserCreated/ID eq " + this.state.currentUser.Id + " ";
        }
      }
      if (
        this.state.VotesType == "VotesCreated" &&
        this.state.listSearch_WFTable.length > 0
      ) {
        let listSelect = "";
        for (let index2 = this.startIndex; index2 < this.endIndex; index2++) {
          let itemWF = returnObject(this.state.listSearch_WFTable[index2]);
          if (isNotNull(listSelect)) {
            listSelect += " or WFTableId eq " + itemWF.WFId + "";
          } else {
            listSelect += "WFTableId eq " + itemWF.WFId + "";
          }
        }
        queryFilter += " and (" + listSelect + ")";
      }
    } else {
      if (
        this.state.VotesType == "VotesCreated" &&
        isNotNull(this.state.DepartmentSearch) &&
        this.state.listSearch_WFTable.length > 0
      ) {
        let listSelect = "";
        for (let index2 = this.startIndex; index2 < this.endIndex; index2++) {
          let itemWF = returnObject(this.state.listSearch_WFTable[index2]);
          if (isNotNull(listSelect)) {
            listSelect += " or WFTableId eq " + itemWF.WFId + "";
          } else {
            listSelect += "WFTableId eq " + itemWF.WFId + "";
          }
        }
        queryFilter += " and (" + listSelect + ")";
      }
    }

    if (isNotNull(this.state.StatusSearch)) {
      if (this.state.StatusSearch == 3) {
        if (isNotNull(queryFilter)) {
          queryFilter += ` and StatusRequest eq 0`;
        } else {
          queryFilter = `StatusRequest eq 0`;
        }
      } else if (this.state.StatusSearch == 4) {
        if (isNotNull(queryFilter)) {
          queryFilter += ` and StatusStep eq 3`;
        } else {
          queryFilter = `StatusStep eq 3`;
        }
      } else {
        if (isNotNull(queryFilter)) {
          queryFilter +=
            ` and StatusStep eq ` +
            this.state.StatusSearch +
            ` and StatusRequest ne 0`;
        } else {
          queryFilter =
            `StatusStep eq ` +
            this.state.StatusSearch +
            ` and StatusRequest ne 0`;
        }
      }
    }

    let start = moment(this.state.startDateSearch).startOf("day").toDate();
    let startDate = ISODateString(start);
    if (isNotNull(this.state.startDateSearch)) {
      if (isNotNull(queryFilter)) {
        queryFilter += ` and DateRequest ge '` + startDate + `'`;
      } else {
        queryFilter = `DateRequest ge '` + startDate + `'`;
      }
    }

    let end = moment(this.state.endDateSearch).endOf("day").toDate();
    let endDate = ISODateString(end);
    if (isNotNull(this.state.endDateSearch)) {
      if (isNotNull(queryFilter)) {
        queryFilter += ` and DateRequest le '` + endDate + `'`;
      } else {
        queryFilter = `DateRequest le '` + endDate + `'`;
      }
    }

    if (this.state.list_MemberUsers.length > 0) {
      let listUser = "";
      if (this.state.VotesType == "VotesProcessed") {
        this.state.list_MemberUsers.map((item) => {
          if (isNotNull(listUser)) {
            listUser += " or HistoryApprover/ID eq " + item.UserId + "";
          } else {
            listUser += "HistoryApprover/ID eq " + item.UserId + "";
          }
        });
      } else {
        this.state.list_MemberUsers.map((item) => {
          if (isNotNull(listUser)) {
            listUser += " or UserCreated/ID eq " + item.UserId + "";
          } else {
            listUser += "UserCreated/ID eq " + item.UserId + "";
          }
        });
      }
      queryFilter += " and (" + listUser + ")";
    }

    const checkSort = sort == "asc" ? true : false;
    const strSelect =
      "ID,Title,WFTableId,DateRequest,ItemIndex,indexStep,StatusStep,StatusRequest,HistoryStep," +
      "UserCreated/ID,UserCreated/Title,HistoryApprover/ID,HistoryApprover/Title,UserApproval/ID,UserApproval/Title";
    let itemLists = await sp.web.lists
      .getByTitle("WFHistory")
      .items.select(strSelect)
      .expand("UserCreated,HistoryApprover,UserApproval")
      .filter(queryFilter)
      .orderBy(sortBy, checkSort)
      .top(100)
      .getPaged();

    objResultListItem = await this.loadDataListItem(
      itemLists["results"],
      listUsersCheck,
      objResultListItem
    );

    if (itemLists.hasNext) {
      objResultListItem = await this.GetNextListItem(
        itemLists,
        listUsersCheck,
        objResultListItem
      );
      // items = items.concat(nextArray);
    }

    // console.log(items);
    return objResultListItem;
  }

  async GetNextListItem(itemNextLists, listUsersCheck, objResultListItemNext) {
    let itemWFNext = await itemNextLists.getNext();

    objResultListItemNext = await this.loadDataListItem(
      itemWFNext["results"],
      listUsersCheck,
      objResultListItemNext
    );

    if (itemWFNext.hasNext) {
      await this.GetNextListItem(
        itemWFNext,
        listUsersCheck,
        objResultListItemNext
      );
    }

    return objResultListItemNext;
  }

  async loadDataListItem(arrayListItem, listUsersCheck, objResultListItemLoad) {
    arrayListItem.forEach((element) => {
      let wfTableCheck = this.state.listWorkflow.find(
        (x) => x.WFId == element.WFTableId
      );
      let wfStepTableCheck = this.state.listStepWorkflow.find(
        (x) =>
          x.WFTableId == element.WFTableId && x.indexStep == element.indexStep
      );

      let arrayWFSTep = this.state.listStepWorkflow.filter(
        (wfStep) => wfStep.WFTableId == element.WFTableId
      );

      let StatusStep = "";
      if (element.StatusRequest == 0) {
        StatusStep = (
          <span className={formatStatusLabel(-1)}>{formatStatusText(-1)}</span>
        );
      } else {
        StatusStep = (
          <span className={formatStatusLabel(element.StatusStep)}>
            {formatStatusText(element.StatusStep)}
          </span>
        );
      }

      if (this.state.VotesType == "VotesProcessed") {
        let userProcessed = "";
        if (listUsersCheck.length > 0) {
          if (isNotNull(element.HistoryApprover)) {
            element.HistoryApprover.map((userH) => {
              if (
                listUsersCheck.findIndex((us) => us.UserId == userH.ID) != -1
              ) {
                userProcessed += userH.Title + ", ";
              }
            });
          }
        } else {
          if (isNotNull(element.HistoryApprover)) {
            element.HistoryApprover.map((userH) => {
              userProcessed += userH.Title + ", ";
            });
          }
        }
        if (isNotNull(userProcessed)) {
          let historyStep = [];
          if (isNotNull(element.HistoryStep)) {
            historyStep = JSON.parse(element.HistoryStep);
          }
          let wfTableName = "";
          let wfTableSLA = 0;
          if (isNotNull(wfTableCheck)) {
            wfTableName = CheckNull(wfTableCheck.WFTitle);
            wfTableSLA = CheckNullSetZero(wfTableCheck.SLA);
          }
          let indexReport = objResultListItemLoad.requestReport.findIndex(
            (rps) => rps.TitleReport == wfTableName
          );
          if (indexReport != -1) {
            objResultListItemLoad.requestReport[indexReport].numReport += 1;
          } else {
            objResultListItemLoad.requestReport.push({
              TitleReport: wfTableName,
              numReport: 1,
            });
          }
          let realisticSLA = 0;
          let resultSLA = "";

          if (element.StatusRequest == 0) {
            objResultListItemLoad.requestSLA.ChuaTinhSLA += 1;
            resultSLA = (
              <span className="labelAlert bg-secondary">Chưa tính SLA</span>
            );
          } else {
            if (historyStep.length > 0) {
              if (
                CheckNullSetZero(element.StatusStep) == 1 ||
                CheckNullSetZero(element.StatusStep) == 2
              ) {
                realisticSLA = 0;
                historyStep.map((history, index) => {
                  if (index > 0) {
                    let resultHSLA = loadReportStepSLA(history, arrayWFSTep);
                    realisticSLA += parseFloat(resultHSLA.RealisticSLA);
                  }
                });
                if (realisticSLA <= wfTableSLA) {
                  objResultListItemLoad.requestSLA.Dat += 1;
                  resultSLA = <span className={formatStatusLabel(1)}>Đạt</span>;
                } else {
                  objResultListItemLoad.requestSLA.KhongDat += 1;
                  resultSLA = (
                    <span className={formatStatusLabel(2)}>Không đạt</span>
                  );
                }
              } else {
                realisticSLA = 0;
                for (let ih1 = 1; ih1 < historyStep.length; ih1++) {
                  let objHistory = returnObject(historyStep[ih1]);
                  if (
                    ih1 == historyStep.length - 1 &&
                    !isNotNull(objHistory.DateFinish)
                  ) {
                    objHistory.DateFinish = new Date();
                    let resultHSLA = loadReportStepSLA(
                      objHistory,
                      arrayWFSTep,
                      true
                    );
                    realisticSLA += parseFloat(resultHSLA.RealisticSLA);
                  } else {
                    let resultHSLA = loadReportStepSLA(objHistory, arrayWFSTep);
                    realisticSLA += parseFloat(resultHSLA.RealisticSLA);
                  }
                }

                if (realisticSLA <= wfTableSLA) {
                  objResultListItemLoad.requestSLA.TrongThoiHan += 1;
                  resultSLA = (
                    <span className={formatStatusLabel(-1)}>
                      Trong thời hạn
                    </span>
                  );
                } else {
                  objResultListItemLoad.requestSLA.NgoaiThoiHan += 1;
                  resultSLA = (
                    <span className={formatStatusLabel(0)}>Ngoài thời hạn</span>
                  );
                }
              }
            } else {
              if (
                CheckNullSetZero(element.StatusStep) == 1 ||
                CheckNullSetZero(element.StatusStep) == 2
              ) {
                objResultListItemLoad.requestSLA.Dat += 1;
                resultSLA = <span className={formatStatusLabel(1)}>Đạt</span>;
              } else {
                objResultListItemLoad.requestSLA.TrongThoiHan += 1;
                resultSLA = (
                  <span className={formatStatusLabel(-1)}>Trong thời hạn</span>
                );
              }
            }
          }

          objResultListItemLoad.requestList.push({
            ItemIndex: element.ItemIndex,
            Title: (
              <a
                href={`${config.pages.wfRequestView}?WFTableId=${element.WFTableId}&ItemIndex=${element.ItemIndex}&indexStep=${element.indexStep}&PreviousPage=ReportRequest`}
              >
                {CheckNull(element.Title)}
              </a>
            ),
            WorkflowTitle: wfTableName,
            UserProcessed: userProcessed,
            IndexStepTitle: isNotNull(wfStepTableCheck)
              ? CheckNull(wfStepTableCheck.Title)
              : "",
            StatusStep: StatusStep,
            DateRequest: formatDate(element.DateRequest),
            WFTableSLA: wfTableSLA,
            RealisticSLA: realisticSLA.toFixed(2),
            ResultSLA: resultSLA,
            HistoryStep: historyStep,
          });
        }
      } else {
        let userCreated = "";
        if (listUsersCheck.length > 0) {
          if (isNotNull(element.UserCreated)) {
            if (
              listUsersCheck.findIndex(
                (us) => us.UserId == element.UserCreated.ID
              ) != -1
            ) {
              userCreated = element.UserCreated.Title;
            }
          }
        } else {
          if (isNotNull(element.UserCreated)) {
            userCreated = element.UserCreated.Title;
          }
        }
        if (isNotNull(userCreated)) {
          let historyStepCreate = [];
          if (isNotNull(element.HistoryStep)) {
            historyStepCreate = JSON.parse(element.HistoryStep);
          }
          let wfTableName = "";
          let wfTableSLA = 0;
          if (isNotNull(wfTableCheck)) {
            wfTableName = CheckNull(wfTableCheck.WFTitle);
            wfTableSLA = CheckNullSetZero(wfTableCheck.SLA);
          }
          let indexReport = objResultListItemLoad.requestReport.findIndex(
            (rps) => rps.TitleReport == wfTableName
          );
          if (indexReport != -1) {
            objResultListItemLoad.requestReport[indexReport].numReport += 1;
          } else {
            objResultListItemLoad.requestReport.push({
              TitleReport: wfTableName,
              numReport: 1,
            });
          }
          let realisticSLACreate = 0;
          let resultSLACreate = (
            <span className={formatStatusLabel(1)}>Đạt</span>
          );
          if (element.StatusRequest == 0) {
            objResultListItemLoad.requestSLA.ChuaTinhSLA += 1;
            resultSLACreate = (
              <span className="labelAlert bg-secondary">Chưa tính SLA</span>
            );
          } else {
            if (historyStepCreate.length > 0) {
              if (
                CheckNullSetZero(element.StatusStep) == 1 ||
                CheckNullSetZero(element.StatusStep) == 2
              ) {
                realisticSLACreate = 0;
                historyStepCreate.map((history1, index) => {
                  if (index > 0) {
                    let resultHSLA1 = loadReportStepSLA(history1, arrayWFSTep);
                    realisticSLACreate += parseFloat(resultHSLA1.RealisticSLA);
                  }
                });
                if (realisticSLACreate <= wfTableSLA) {
                  objResultListItemLoad.requestSLA.Dat += 1;
                  resultSLACreate = (
                    <span className={formatStatusLabel(1)}>Đạt</span>
                  );
                } else {
                  objResultListItemLoad.requestSLA.KhongDat += 1;
                  resultSLACreate = (
                    <span className={formatStatusLabel(2)}>Không đạt</span>
                  );
                }
              } else {
                realisticSLACreate = 0;
                for (let ih = 1; ih < historyStepCreate.length; ih++) {
                  let objHistoryCreate = returnObject(historyStepCreate[ih]);
                  if (
                    ih == historyStepCreate.length - 1 &&
                    !isNotNull(objHistoryCreate.DateFinish)
                  ) {
                    objHistoryCreate.DateFinish = new Date();
                    let resultHSLA2 = loadReportStepSLA(
                      objHistoryCreate,
                      arrayWFSTep,
                      true
                    );
                    realisticSLACreate += parseFloat(resultHSLA2.RealisticSLA);
                  } else {
                    let resultHSLA3 = loadReportStepSLA(
                      objHistoryCreate,
                      arrayWFSTep
                    );
                    realisticSLACreate += parseFloat(resultHSLA3.RealisticSLA);
                  }
                }

                if (realisticSLACreate <= wfTableSLA) {
                  objResultListItemLoad.requestSLA.TrongThoiHan += 1;
                  resultSLACreate = (
                    <span className={formatStatusLabel(-1)}>
                      Trong thời hạn
                    </span>
                  );
                } else {
                  objResultListItemLoad.requestSLA.NgoaiThoiHan += 1;
                  resultSLACreate = (
                    <span className={formatStatusLabel(0)}>Ngoài thời hạn</span>
                  );
                }
              }
            } else {
              if (
                CheckNullSetZero(element.StatusStep) == 1 ||
                CheckNullSetZero(element.StatusStep) == 2
              ) {
                objResultListItemLoad.requestSLA.Dat += 1;
                resultSLACreate = (
                  <span className={formatStatusLabel(1)}>Đạt</span>
                );
              } else {
                objResultListItemLoad.requestSLA.TrongThoiHan += 1;
                resultSLACreate = (
                  <span className={formatStatusLabel(-1)}>Trong thời hạn</span>
                );
              }
            }
          }

          objResultListItemLoad.requestList.push({
            ItemIndex: element.ItemIndex,
            Title: (
              <a
                href={`${config.pages.wfRequestView}?WFTableId=${element.WFTableId}&ItemIndex=${element.ItemIndex}&indexStep=${element.indexStep}&PreviousPage=ReportRequest`}
              >
                {CheckNull(element.Title)}
              </a>
            ),
            WorkflowTitle: wfTableName,
            UserCreated: userCreated,
            IndexStepTitle: isNotNull(wfStepTableCheck)
              ? CheckNull(wfStepTableCheck.Title)
              : "",
            StatusStep: StatusStep,
            DateRequest: formatDate(element.DateRequest),
            WFTableSLA: wfTableSLA,
            RealisticSLA: realisticSLACreate.toFixed(2),
            ResultSLA: resultSLACreate,
            HistoryStep: historyStepCreate,
          });
        }
      }
    });
    return objResultListItemLoad;
  }

  removeSelect(IdWF) {
    let listWFTables = returnArray(this.state.list_WFTable);
    let indexWF = listWFTables.findIndex((wf) => wf.WFId == IdWF);
    listWFTables.splice(indexWF, 1);
    this.setState({ list_WFTable: listWFTables });
  }

  changeFormInput(event) {
    let wfActive = returnArray(this.state.listWorlkflowActive);

    if (isNotNull(event.Code)) {
      // console.log(event);
      let objDept = returnObject(event);
      let userMembers = loadMemberUsersDept(objDept);

      let listWFManager = loadWorkflowInDept(objDept, userMembers, wfActive);
      // console.log(listWFManager);
      this.setState({
        DepartmentTitle: objDept.Title,
        DepartmentSearch: objDept.Code,
        listSearch_WFTable:
          this.state.VotesType == "VotesProcessed" ? wfActive : listWFManager,
        listSearch_WFTableDeptOld: listWFManager,
        listSearch_MemberUsers: userMembers,
      });
    } else {
      if (event.target.name == "search_WFTable") {
        let listWFTables = returnArray(this.state.list_WFTable);
        let searchWF = this.state.listSearch_WFTable.find(
          (wf) => wf.WFId == event.target.value
        );
        if (
          searchWF &&
          listWFTables.findIndex((wf) => wf.WFId == event.target.value) == -1
        ) {
          listWFTables.push(searchWF);
        }
        this.setState({ list_WFTable: listWFTables });
      } else if (event.target.name == "MemberUsers") {
        let listUsers = returnArray(this.state.list_MemberUsers);
        let searchUser = this.state.listSearch_MemberUsers.find(
          (user) => user.UserId == event.target.value
        );
        if (
          searchUser &&
          listUsers.findIndex((user) => user.UserId == event.target.value) == -1
        ) {
          listUsers.push(searchUser);
        }
        this.setState({ list_MemberUsers: listUsers });
      } else if (event.target.name == "VotesType") {
        if (event.target.value == "VotesProcessed") {
          this.setState({
            [event.target.name]: event.target.value,
            listSearch_WFTable: wfActive,
          });
        } else {
          let wfTableInDept = returnArray(this.state.listSearch_WFTableDeptOld);
          this.setState({
            [event.target.name]: event.target.value,
            listSearch_WFTable: wfTableInDept,
            list_WFTable: [],
          });
        }
      } else {
        this.setState({ [event.target.name]: event.target.value });
      }
    }
  }

  changeFormDateTime(nameState, event) {
    let valueState = null;
    if (event != null) {
      valueState = event["_d"];
    }
    this.setState({ [nameState]: valueState });
  }

  changeSearchPeople(event) {
    // console.log("changeSearchPeople");
    this.setState({ search_MemberUsers: event.target.value });
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  async callSearchPeople() {
    // console.log("callSearchPeople");
    let PeoplePicker = await shareService.searchPeoplePicker(
      this.state.search_MemberUsers
    );
    this.setState({
      listSearch_MemberUsers: PeoplePicker,
    });
  }

  async selectSearch(Key) {
    let listhUser = returnArray(this.state.list_MemberUsers);
    let objUser = await shareService.getInforUser(Key);
    if (
      listhUser.findIndex((us) => us.UserId == objUser.UserId) == -1 &&
      isNotNull(objUser.UserId)
    ) {
      listhUser.push(objUser);
    }
    this.setState({
      search_MemberUsers: "",
      list_MemberUsers: listhUser,
      listSearch_MemberUsers: [],
    });
  }

  removePeople(IdUser) {
    let listUsers = returnArray(this.state.list_MemberUsers);
    let index = listUsers.findIndex((x) => x.UserId == IdUser);
    listUsers.splice(index, 1);
    this.setState({ list_MemberUsers: listUsers });
  }

  callbackSort(sortBy) {
    // console.log(sortBy);
    const isAsc = this.state.orderBy === sortBy && this.state.order === "asc";
    const sort = isAsc ? "desc" : "asc";

    // this.setState({ order: sort, orderBy: sortBy, page: 0 })
    this.Search(sort, sortBy, this.state.rowsPerPage);
  }

  callbackRowPage(rowsPerPage) {
    // console.log(rowsPerPage);
    // this.setState({ rowsPerPage: rowsPerPage, page: 0 });
    this.Search(this.state.order, this.state.orderBy, rowsPerPage);
  }

  callbackNexPage(newPage) {
    // console.log(newPage);
    const arrpage = this.state.arrayPage;
    if (arrpage.indexOf(newPage) == -1) {
      this.callSearchNextPage(newPage);
    } else {
      this.setState({ page: newPage });
    }
  }

  async callSearchNextPage(newPage) {
    let listSearch = await this.SearchNextPage();
    let lengthPage = this.state.lengthData;
    if (this.dataHistory.hasNext) {
      lengthPage += listSearch.length;
    } else {
      lengthPage += listSearch.length - 1;
    }
    const listDataSources = this.state.dataSources;
    const listData = listDataSources.concat(listSearch);
    const arrPage = this.state.arrayPage;
    arrPage.push(newPage);
    this.setState({
      dataSources: listData,
      lengthData: lengthPage,
      page: newPage,
      arrayPage: arrPage,
    });
  }

  async SearchNextPage() {
    if (this.dataHistory.hasNext) {
      let items = [];

      this.dataHistory = await this.dataHistory.getNext();

      this.dataHistory["results"].forEach((element) => {
        let TypeRequest = this.state.listWorkflow.find(
          (x) => x.WFId == element.WFTableId
        );
        let indexStepTitle = this.state.listStepWorkflow.find(
          (x) =>
            x.WFTableId == element.WFTableId && x.indexStep == element.indexStep
        );
        let wfTableTitle = isNotNull(TypeRequest) ? TypeRequest.WFTitle : "";
        let indexStepname = isNotNull(indexStepTitle)
          ? indexStepTitle.Title
          : "";
        let StatusStep = "";
        if (element.StatusRequest == 0 && element.StatusStep == 0) {
          StatusStep = (
            <span className={formatStatusLabel(-1)}>
              {formatStatusText(-1)}
            </span>
          );
        } else {
          StatusStep = (
            <span className={formatStatusLabel(element.StatusStep)}>
              {formatStatusText(element.StatusStep)}
            </span>
          );
        }
        let userApp = { UserId: "", UserTitle: "" };
        if (isNotNull(element.UserApproval)) {
          userApp = {
            UserId: element.UserApproval.ID,
            UserTitle: element.UserApproval.Title,
          };
        }
        items.push({
          ItemIndex: element.ItemIndex,
          Title: (
            <a
              href={`${config.pages.wfRequestView}?WFTableId=${element.WFTableId}&ItemIndex=${element.ItemIndex}&indexStep=${element.indexStep}&PreviousPage=MyRequest`}
            >
              {element.Title}
            </a>
          ),
          wfTableTitle: wfTableTitle,
          UserApproval: userApp.UserTitle,
          indexStepname: indexStepname,
          StatusStep: StatusStep,
          DateRequest: formatDate(element.DateRequest),
        });
      });

      return items;
    }
  }

  render() {
    const {
      ReportRequest,
      ReportSLA,
      DepartmentTree,
      dataSources,
      lengthData,
      listSearch_WFTable,
      list_WFTable,
      listSearch_MemberUsers,
      list_MemberUsers,
    } = this.state;
    const options = {
      legend: {
        position: "right",
      },
    };

    const TitleColumns =
      this.state.VotesType == "VotesProcessed"
        ? ObjTitleColumns.VotesProcessed
        : ObjTitleColumns.VotesCreated;
    return (
      <Grid container>
        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={8} xs={12} md={6} xl={8}>
              <h3>Thống kê yêu cầu</h3>
            </Grid>
            <Grid item sm={12} xs={12} md={6} xl={4}>
              <div className="btnList pull-right">
                <Button
                  className="btn bg-info"
                  onClick={() => this.callSearch()}
                >
                  <i className="fa fa-search" /> Tìm kiếm
                </Button>
                <Button
                  className="btn bg-secondary"
                  onClick={() => this.resetItem()}
                >
                  <i className="fa fa-refresh" /> Làm mới
                </Button>
              </div>
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mb-30">
            {this.permissionUser.Permission == "User" ? (
              ""
            ) : (
              <Grid item sm={6} xs={12}>
                <label className="form-label">
                  Phòng ban : {this.state.DepartmentTitle}
                </label>
                <FormControl
                  fullWidth
                  className="selectForm"
                  variant="outlined"
                >
                  {CheckNull(DepartmentTree) != "" ? (
                    <DropdownTreeSelect
                      data={DepartmentTree}
                      onChange={this.changeFormInput}
                      className="mdl-demo"
                    />
                  ) : (
                    ""
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item sm={6} xs={12}>
              <label className="form-label">Loại phiếu</label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select
                  name="VotesType"
                  variant="outlined"
                  value={this.state.VotesType}
                  onChange={this.changeFormInput}
                >
                  <MenuItem value="VotesCreated">Phiếu tạo</MenuItem>
                  <MenuItem value="VotesProcessed">Phiếu xử lý</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sm={6} xs={12}>
              <label className="form-label">Quy trình</label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select
                  name="search_WFTable"
                  variant="outlined"
                  value={this.state.search_WFTable}
                  onChange={this.changeFormInput}
                >
                  <MenuItem value="">--Lựa chọn--</MenuItem>
                  {listSearch_WFTable.length == 0
                    ? ""
                    : listSearch_WFTable.map((event, akey) => (
                        <MenuItem value={event.WFId} key={akey}>
                          {event.WFTitle}
                        </MenuItem>
                      ))}
                </Select>
                {list_WFTable.length > 0 ? (
                  <div className="tagName">
                    {list_WFTable.map((item) => (
                      <div key={item.WFId} className="wrapName">
                        <a onClick={() => this.removeSelect(item.WFId)}>
                          <i className="fa fa-close text-danger"></i>
                        </a>
                        {item.WFTitle}
                      </div>
                    ))}
                  </div>
                ) : (
                  ""
                )}
              </FormControl>
            </Grid>

            {this.permissionUser.Permission == "User" ? (
              ""
            ) : isNotNull(this.state.DepartmentSearch) ? (
              <Grid item sm={6} xs={12}>
                <label className="form-label">
                  {this.state.VotesType == "VotesCreated"
                    ? "Người tạo"
                    : "Người xử lý"}
                </label>
                <FormControl
                  fullWidth
                  className="selectForm"
                  variant="outlined"
                >
                  <Select
                    name="MemberUsers"
                    variant="outlined"
                    value={this.state.search_MemberUsers}
                    onChange={this.changeFormInput}
                  >
                    <MenuItem value="">--Lựa chọn--</MenuItem>
                    {listSearch_MemberUsers.length == 0
                      ? ""
                      : listSearch_MemberUsers.map((event, akey) => (
                          <MenuItem value={event.UserId} key={akey}>
                            {event.UserTitle}
                          </MenuItem>
                        ))}
                  </Select>
                  {list_MemberUsers.length > 0 ? (
                    <div className="tagName">
                      {list_MemberUsers.map((users) => (
                        <div key={users.UserId} className="wrapName">
                          <a onClick={() => this.removePeople(users.UserId)}>
                            <i className="fa fa-close text-danger"></i>
                          </a>{" "}
                          {users.UserTitle}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </FormControl>
              </Grid>
            ) : (
              <Grid item sm={6} xs={12}>
                <label className="form-label">
                  {this.state.VotesType == "VotesCreated"
                    ? "Người tạo"
                    : "Người xử lý"}
                </label>
                <TextField
                  name="MemberUsers"
                  value={this.state.search_MemberUsers}
                  onChange={this.changeSearchPeople}
                  variant="outlined"
                  className="textField"
                  fullWidth
                />
                {listSearch_MemberUsers.length > 0 ? (
                  <div id="myInputautocomplete" className="suggesAuto">
                    {listSearch_MemberUsers.map((people) => (
                      <div
                        key={people.Key}
                        className="suggtAutoItem"
                        onClick={() => this.selectSearch(people.Key)}
                      >
                        <i className="fa fa-user"></i>
                        {people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}
                      </div>
                    ))}
                  </div>
                ) : (
                  ""
                )}

                {list_MemberUsers.length > 0 ? (
                  <div className="tagName">
                    {list_MemberUsers.map((users) => (
                      <div key={users.UserId} className="wrapName">
                        <a onClick={() => this.removePeople(users.UserId)}>
                          <i className="fa fa-close text-danger"></i>
                        </a>{" "}
                        {users.UserTitle}
                      </div>
                    ))}
                  </div>
                ) : (
                  ""
                )}
              </Grid>
            )}

            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="tieude">
                Tiêu đề
              </label>
              <TextField
                name="TitleSearch"
                variant="outlined"
                className="textField"
                fullWidth
                value={this.state.TitleSearch}
                onChange={this.changeFormInput}
              />
            </Grid>

            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="rStatus">
                Trạng thái
              </label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select
                  name="StatusSearch"
                  value={this.state.StatusSearch}
                  onChange={this.changeFormInput}
                >
                  <MenuItem value="0">Đang xử lý</MenuItem>
                  <MenuItem value="1">Hoàn thành</MenuItem>
                  <MenuItem value="2">Từ chối</MenuItem>
                  <MenuItem value="3">Đã lưu</MenuItem>
                  <MenuItem value="4">Yêu cầu chỉnh sửa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="timestart">
                Từ ngày
              </label>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  fullWidth
                  name="startDateSearch"
                  value={this.state.startDateSearch}
                  placeholder="DD-MM-YYYY"
                  inputVariant="outlined"
                  onChange={(date) =>
                    this.changeFormDateTime("startDateSearch", date)
                  }
                  format="DD-MM-YYYY"
                  InputAdornmentProps={{ position: "end" }}
                  className="datePicker"
                />
              </MuiPickersUtilsProvider>
            </Grid>

            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="timeend">
                Đến ngày
              </label>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  fullWidth
                  name="endDateSearch"
                  value={this.state.endDateSearch}
                  placeholder="DD-MM-YYYY"
                  inputVariant="outlined"
                  onChange={(date) =>
                    this.changeFormDateTime("endDateSearch", date)
                  }
                  format="DD-MM-YYYY"
                  InputAdornmentProps={{ position: "end" }}
                  className="datePicker"
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>

          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={12} xs={12}>
              <div className="btnList pull-right">
                <Button
                  className="btn bg-info"
                  onClick={() => this.callSearch()}
                >
                  <i className="fa fa-search" /> Tìm kiếm
                </Button>
                <Button
                  className="btn bg-secondary"
                  onClick={() => this.resetItem()}
                >
                  <i className="fa fa-refresh" /> Làm mới
                </Button>
              </div>
            </Grid>
          </Grid>
        </Card>

        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={12} xs={12}>
              <h3>Thống kê yêu cầu</h3>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item sm={9} xs={12}>
              {ReportRequest.labels.length > 0 ? (
                <Pie data={ReportRequest} options={options} />
              ) : (
                ""
              )}
            </Grid>
          </Grid>
        </Card>

        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={12} xs={12}>
              <h3>Thống kê SLA</h3>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item sm={8} xs={12}>
              {ReportSLA.labels.length > 0 ? (
                <Pie data={ReportSLA} options={options} />
              ) : (
                ""
              )}
            </Grid>
          </Grid>
        </Card>

        <Card className="formInput">
          <Grid>
            <WFTableRequest
              dataSources={dataSources}
              lengthData={lengthData}
              callbackSort={this.callbackSort}
              callbackRowPage={this.callbackRowPage}
              callbackNexPage={this.callbackNexPage}
              order={this.state.order}
              orderBy={this.state.orderBy}
              page={this.state.page}
              rowsPerPage={this.state.rowsPerPage}
              dataColumns={TitleColumns}
            />
          </Grid>
        </Card>

        {this.state.isShowLoadingPage ? (
          <div className="preLoader">
            <div className="loadingContent">
              <CircularProgress className="mr-10 text-primary" />
            </div>
          </div>
        ) : (
          ""
        )}
      </Grid>
    );
  }
}
