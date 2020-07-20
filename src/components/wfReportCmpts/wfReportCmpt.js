import React, { Component } from "react";
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
} from "../wfShareCmpts/wfShareFunction.js";
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
import "./../Containers/FormAddNew/formStyle.scss";
import { Pie } from "react-chartjs-2";
import shareService from "../wfShareCmpts/wfShareService.js";
import DropdownTreeSelect from "react-dropdown-tree-select";
import "./../Containers/FormAddNew/formStyle.scss";
const data = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: ["Red", "Blue", "Yellow"],
    },
  ],
};

export default class Reports extends Component {
  constructor(props) {
    super(props);
    this.changeFormInput = this.changeFormInput.bind(this);
    this.searchPeoplePicker = this.searchPeoplePicker.bind(this);
    this.changeFormSelectMulti = this.changeFormSelectMulti.bind(this);
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.state = {
      listItem: [],
      arrTypeRequest: [],
      TitleSearch: "",
      TypeRequestSearch: "",
      StatusSearch: "",
      startDateSearch: null,
      endDateSearch: null,
      ListTypeRequestSearch: [],
      arrindexStep: [],
      OneUser: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_OneUser: [],
      MultiUsers: [],
      search_MultiUsers: "",
      listSearch_MultiUsers: [],
      arrTypeRequestList: [],
      order: "desc",
      orderBy: "DateRequest",
      page: 0,
      rowsPerPage: 10,
      lengthData: 0,
      dataSources: [],
      arrayPage: [],
      DepartmentTitle: "",
      DepartmentSearch: "",
      dataR: {
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
    this.typingTimeout = null;
    this.fieldSearch = { FieldName: "", FieldType: "" };
    this.WFTableList = [];
    this.WFTableListOld = [];
    this.wfTable = [];
    this.wfTableDefault = [];
    this.wfMembers = [];

    this.dataHistory = {};
    this.dataColumns = [
      { FieldName: "ItemIndex", FieldTitle: "#", isSort: false },
      { FieldName: "Title", FieldTitle: "Tiêu đề", isSort: false },
      { FieldName: "wfTableTitle", FieldTitle: "Loại yêu cầu", isSort: false },
      {
        FieldName: "UserCreated",
        FieldTitle: "Người tạo",
        isSort: false,
      },
      {
        FieldName: "indexStepname",
        FieldTitle: "Bước hiện tại",
        isSort: false,
      },
      { FieldName: "StatusStep", FieldTitle: "Trạng thái", isSort: false },
      { FieldName: "DateRequest", FieldTitle: "Ngày yêu cầu", isSort: false },
    ];
    this.callbackNexPage = this.callbackNexPage.bind(this);
    this.callbackSort = this.callbackSort.bind(this);
    this.callbackRowPage = this.callbackRowPage.bind(this);

    this.permissionUser = { Permission: "User", Dept: [] };
  }

  async componentDidMount() {
    this.setStateForm();
  }

  async setStateForm() {
    this.currentUser = await sp.web.currentUser();
    console.log(this.currentUser);

    this.wfTable = await shareService.GetArrayWFTable();
    console.log(this.wfTable);

    let listDept = await shareService.GetListDepartment();
    // console.log(listDept);

    this.permissionUser = await shareService.checkPermissionUser(
      this.currentUser.Id,
      listDept
    );
    console.log(this.permissionUser);

    this.wfTableDefault = this.wfTable.filter(
      (wf) =>
        wf.Status != 0 &&
        (wf.WhoIsUsed == "All Users" ||
          (wf.WhoIsUsed == "Users" &&
            wf.UserDefault.indexOf(this.currentUser.Id) != -1))
    );

    if (this.permissionUser.Permission == "User") {
      let arrayWFByDept = loadWFByDept(this.permissionUser.Dept, this.wfTable);
      arrayWFByDept.map((child) => {
        if (this.WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          this.WFTableList.push(child);
        }
      });
      this.wfTableDefault.map((child) => {
        if (this.WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          this.WFTableList.push(child);
        }
      });
    } else {
      if (this.permissionUser.Permission == "Admin") {
        this.WFTableList = this.wfTable.filter((wf) => wf.Status != 0);
      } else {
        let objDept = returnObject(this.permissionUser.Dept[0]);
        let deptChild = [];
        deptChild.push(objDept);
        this.setState({
          DepartmentSearch: objDept.Code,
          DepartmentTitle: objDept.label,
        });

        let listMembers = listDept.find((p) => p.Code == objDept.Code);
        listMembers.UserMembers.map((k) => {
          this.wfMembers.push(k.UserId);
        });
        if (this.wfMembers.findIndex((x) => x == listMembers.Manager) == -1) {
          this.wfMembers.push(listMembers.Manager);
        }
        this.wfTableDefault.map((child) => {
          if (this.WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
            this.WFTableList.push(child);
          }
        });
        for (let i = 0; i < this.permissionUser.Dept.length; i++) {
          let objDept = returnObject(this.permissionUser.Dept[i]);
          let deptChild = loadChildBranch(objDept);
          deptChild.push(objDept);
          let arrayWFByDept = loadWFByDept(deptChild, this.wfTable);
          arrayWFByDept.map((child) => {
            if (
              this.WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1
            ) {
              this.WFTableList.push(child);
            }
          });
        }
      }
    }
    this.WFTableListOld = returnArray(this.WFTableList);
    // console.log(this.WFTableList);
    let arrStep = await shareService.GetArrayWFStepTable();
    this.setState({ arrindexStep: arrStep });

    this.callSearch();
  }

  async resetItem() {
    let wfList = returnArray(this.WFTableListOld);
    this.WFTableList = wfList;

    await this.setState({
      TitleSearch: "",
      TypeRequestSearch: "",
      StatusSearch: "",
      startDateSearch: null,
      endDateSearch: null,
      OneUser: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_OneUser: [],
      MultiUsers: [],
      search_MultiUsers: "",
      listSearch_MultiUsers: [],
      ListTypeRequestSearch: [],
      arrTypeRequest: this.wfTable,
      arrTypeRequestList: this.wfTable,
      dataSources: [],
      lengthData: 0,
      order: "desc",
      orderBy: "DateRequest",
      page: 0,
      rowsPerPage: 10,
      arrayPage: [],
      DepartmentTitle: "",
      DepartmentSearch: "",
    });
    // this.Search();
    this.dataHistory = undefined;
    this.callSearch();
  }

  callSearch() {
    this.Search(this.state.order, this.state.orderBy, this.state.rowsPerPage);
  }

  async Search(sort, sortBy, rowsPerPage) {
    let startWFTable = 0;
    let endWFTable = 39;
    let listSearch = [];
    let count = this.WFTableList.length / 40;
    if (count % 1 !== 0) {
      count = parseInt(count) + 1;
    }
    for (let k = 0; k < count; k++) {
      let listSearch1 = await this.SearchList(
        sort,
        sortBy,
        rowsPerPage,
        startWFTable,
        endWFTable
      );
      listSearch = listSearch.concat(listSearch1);
      startWFTable += 40;
      endWFTable += 40;
    }

    let lengthPage = 0;
    let arrPages = [];
    let numPages = listSearch.length / parseInt(rowsPerPage);
    let maxPages = parseInt(numPages);
    if (numPages.toString().split(".")[1] != undefined) {
      maxPages += 1;
    }
    for (let p = 0; p < maxPages; p++) {
      arrPages.push(p);
    }
    if (this.dataHistory.hasNext) {
      lengthPage = listSearch.length + 1;
    } else {
      lengthPage = listSearch.length;
    }

    let arrCheckR = [];
    listSearch.map((itemsearch) => {
      if (arrCheckR.length > 0) {
        let rr = arrCheckR.findIndex(
          (rs) => rs.Title == itemsearch.wfTableTitle
        );
        if (rr != -1) {
          arrCheckR[rr].numR += 1;
        } else {
          arrCheckR.push({
            Title: itemsearch.wfTableTitle,
            numR: 1,
          });
        }
      } else {
        arrCheckR.push({
          Title: itemsearch.wfTableTitle,
          numR: 1,
        });
      }
    });
    console.log(arrCheckR);

    let data = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
        },
      ],
    };
    arrCheckR.map((checkD) => {
      data.labels.push(checkD.Title);
      data.datasets[0].data.push(checkD.numR);
      let color = makeRandomColor();
      data.datasets[0].backgroundColor.push(color);
    });
    console.log(data);
    this.setState({
      dataSources: listSearch,
      lengthData: lengthPage,
      order: sort,
      orderBy: sortBy,
      page: 0,
      rowsPerPage: rowsPerPage,
      arrayPage: arrPages,
      dataR: data,
    });
  }

  changeFormSelectMulti(event) {
    console.log(event);
    let wfSearch = returnArray(this.state.ListTypeRequestSearch);
    let search = this.WFTableList.find((wf) => wf.WFId == event.target.value);
    if (
      search &&
      wfSearch.findIndex((wf) => wf.WFId == event.target.value) == -1
    ) {
      wfSearch.push(search);
    }
    this.setState({ ListTypeRequestSearch: wfSearch });
  }

  removeSelect(ID, Title) {
    let arrTypeRequest = this.state.arrTypeRequest;
    arrTypeRequest.push({ ID: ID, Title: Title });
    let listTypeRequestSearch = this.state.ListTypeRequestSearch.filter(
      (x) => x.ID != ID
    );
    this.setState({
      ListTypeRequestSearch: listTypeRequestSearch,
      arrTypeRequest: arrTypeRequest,
    });
  }

  changeFormInput(event) {
    if (isNotNull(event.Code)) {
      console.log(event);
      let objDept = returnObject(event);
      //  let deptChild = loadChildBranch(objDept);
      //  deptChild.push(objDept);
      this.wfMembers = [];
      objDept.UserMembers.map((k) => {
        this.wfMembers.push(k.UserId);
      });
      if (this.wfMembers.findIndex((x) => x == objDept.Manager) == -1) {
        this.wfMembers.push(objDept.Manager);
      }
      let deptChild = [];
      deptChild.push(objDept);
      console.log(deptChild);
      this.WFTableList = [];
      this.wfTableDefault.map((child) => {
        if (this.WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          this.WFTableList.push(child);
        }
      });
      let arrayWFByDept = loadWFByDept(deptChild, this.wfTable);
      console.log(arrayWFByDept);
      arrayWFByDept.map((child) => {
        if (this.WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          this.WFTableList.push(child);
        }
      });

      this.setState({
        DepartmentSearch: event.Code,
        DepartmentTitle: event.label,
      });
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
  }

  handleChangeForm(typeField, nameState, event) {
    if (typeField == "DateTime") {
      this.setState({ [nameState]: event["_d"] });
    }
  }

  callbackSort(sortBy) {
    console.log(sortBy);
    const isAsc = this.state.orderBy === sortBy && this.state.order === "asc";
    const sort = isAsc ? "desc" : "asc";

    // this.setState({ order: sort, orderBy: sortBy, page: 0 })
    this.Search(sort, sortBy, this.state.rowsPerPage);
  }

  callbackRowPage(rowsPerPage) {
    console.log(rowsPerPage);
    // this.setState({ rowsPerPage: rowsPerPage, page: 0 });
    this.Search(this.state.order, this.state.orderBy, rowsPerPage);
  }

  callbackNexPage(newPage) {
    console.log(newPage);
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

    let arrCheckR = [];
    listData.map((itemsearch) => {
      if (arrCheckR.length > 0) {
        let rr = arrCheckR.findIndex(
          (rs) => rs.Title == itemsearch.wfTableTitle
        );
        if (rr != -1) {
          arrCheckR[rr].numR += 1;
        } else {
          arrCheckR.push({
            Title: itemsearch.wfTableTitle,
            numR: 1,
          });
        }
      } else {
        arrCheckR.push({
          Title: itemsearch.wfTableTitle,
          numR: 1,
        });
      }
    });
    console.log(arrCheckR);

    let data = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
        },
      ],
    };
    arrCheckR.map((checkD) => {
      data.labels.push(checkD.Title);
      data.datasets[0].data.push(checkD.numR);
      let color = makeRandomColor();
      data.datasets[0].backgroundColor.push(color);
    });

    this.setState({
      dataSources: listData,
      lengthData: lengthPage,
      page: newPage,
      arrayPage: arrPage,
      dataR: data,
    });
  }

  async SearchNextPage() {
    if (this.dataHistory.hasNext) {
      const ListTypeRequest = this.wfTable;
      const ListIndexStep = this.state.arrindexStep;
      let items = [];

      this.dataHistory = await this.dataHistory.getNext();

      this.dataHistory["results"].forEach((element) => {
        let TypeRequest = ListTypeRequest.find(
          (x) => x.WFId == element.WFTableId
        );
        let indexStepTitle = ListIndexStep.find(
          (x) =>
            x.WFTableId == element.WFTableId && x.indexStep == element.indexStep
        );
        let wfTableTitle = isNotNull(TypeRequest) ? TypeRequest.WFTitle : "";
        let indexStepname = isNotNull(indexStepTitle)
          ? indexStepTitle.Title
          : "";
        let StatusStep = "";
        if (element.indexStep == 1 && element.StatusStep == 0) {
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
        if (isNotNull(element.UserCreated)) {
          userApp = {
            UserId: element.UserCreated.ID,
            UserTitle: element.UserCreated.Title,
          };
        }
        items.push({
          ItemIndex: element.ItemIndex,
          Title: (
            <a
              href={`${config.pages.wfRequestView}?WFTableId=${element.WFTableId}&ItemIndex=${element.ItemIndex}&indexStep=${element.indexStep}&PreviousPage=wfExecution`}
            >
              {element.Title}
            </a>
          ),
          wfTableTitle: wfTableTitle,
          UserCreated: userApp.UserTitle,
          indexStepname: indexStepname,
          StatusStep: StatusStep,
          DateRequest: formatDate(element.DateRequest),
        });
      });

      return items;
    }
  }

  render() {
    const { dataR, dataSources, lengthData } = this.state;
    const options = {
      legend: {
        position: "right",
      },
    };
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
            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="tieude">
                Tiêu đề
              </label>
              <TextField
                name={Object.keys(this.state)[2]}
                variant="outlined"
                className="textField"
                fullWidth
                value={this.state.TitleSearch}
                onChange={this.changeFormInput}
              />
            </Grid>

            {this.permissionUser.Permission == "User" ? (
              ""
            ) : (
              <Grid item sm={6} xs={12}>
                <label className="form-label" htmlFor="userRequest">
                  Người tạo
                </label>
                <TextField
                  name="MultiUsers"
                  value={this.state.search_MultiUsers}
                  onChange={this.changeSearchPeople.bind(this, "UserMulti")}
                  variant="outlined"
                  className="textField"
                  fullWidth
                />
                {this.state.listSearch_MultiUsers.length > 0 ? (
                  <div id="myInputautocomplete" className="suggesAuto">
                    {this.state.listSearch_MultiUsers.map((people) => (
                      <div
                        key={people.Key}
                        className="suggtAutoItem"
                        onClick={() =>
                          this.selectSearch(
                            people.Key,
                            "UserMulti",
                            "MultiUsers"
                          )
                        }
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

                {this.state.MultiUsers.length > 0 ? (
                  <div className="tagName">
                    {this.state.MultiUsers.map((users) => (
                      <div key={users.UserId} className="wrapName">
                        <a
                          onClick={() =>
                            this.removePeople(users.UserId, "MultiUsers")
                          }
                        >
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

            {this.permissionUser.Permission == "User" ||
            this.permissionUser.Dept.length == 0 ? (
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
                  {CheckNull(this.permissionUser.Dept) != "" ? (
                    <DropdownTreeSelect
                      data={this.permissionUser.Dept}
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
              <label className="form-label" htmlFor="typeRequest">
                Loại yêu cầu
              </label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select
                  name={Object.keys(this.state)[3]}
                  variant="outlined"
                  value={this.state.TypeRequestSearch}
                  onChange={this.changeFormSelectMulti}
                >
                  <MenuItem value=""></MenuItem>
                  {this.WFTableList.length == 0
                    ? ""
                    : this.WFTableList.map((event, akey) => (
                        <MenuItem value={event.WFId} key={akey}>
                          {event.WFTitle}
                        </MenuItem>
                      ))}
                </Select>
                {this.state.ListTypeRequestSearch.length > 0 ? (
                  <div className="tagName">
                    {this.state.ListTypeRequestSearch.map((item) => (
                      <div key={item.WFId} className="wrapName">
                        <a
                          onClick={() =>
                            this.removeSelect(item.WFId, item.Title)
                          }
                        >
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

            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="rStatus">
                Trạng thái
              </label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select
                  name={Object.keys(this.state)[4]}
                  value={this.state.StatusSearch}
                  onChange={this.changeFormInput}
                >
                  <MenuItem value="0">Đang xử lý</MenuItem>
                  <MenuItem value="1">Hoàn thành</MenuItem>
                  <MenuItem value="2">Từ chối</MenuItem>
                  {/* <MenuItem value="3">Đã lưu</MenuItem> */}
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
                  name={Object.keys(this.state)[5]}
                  value={this.state.startDateSearch}
                  placeholder="DD-MM-YYYY"
                  inputVariant="outlined"
                  onChange={(date) =>
                    this.handleChangeForm("DateTime", "startDateSearch", date)
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
                  name={Object.keys(this.state)[6]}
                  value={this.state.endDateSearch}
                  placeholder="DD-MM-YYYY"
                  inputVariant="outlined"
                  onChange={(date) =>
                    this.handleChangeForm("DateTime", "endDateSearch", date)
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

          <Grid container spacing={3}>
            <Grid item sm={8} xs={12}>
              {dataR.labels.length > 0 ? (
                <Pie data={dataR} options={options} />
              ) : (
                ""
              )}
            </Grid>
          </Grid>
        </Card>
        <Grid container item sm={12} xs={12} lg={12}>
          <Card>
            <Grid>
              <FunctionTable
                dataSources={dataSources}
                lengthData={lengthData}
                callbackSort={this.callbackSort}
                callbackRowPage={this.callbackRowPage}
                callbackNexPage={this.callbackNexPage}
                order={this.state.order}
                orderBy={this.state.orderBy}
                page={this.state.page}
                rowsPerPage={this.state.rowsPerPage}
                dataColumns={this.dataColumns}
              />
            </Grid>
          </Card>
        </Grid>
      </Grid>
    );
  }

  async SearchList(sort, sortBy, rowsPerPage, startWFTable, endWFTable) {
    // console.log(sp)
    let items = [];
    let ListTypeRequest = this.wfTable;
    let ListIndexStep = this.state.arrindexStep;
    let queryFilter = `ID ne 0`;

    if (isNotNull(this.state.TitleSearch)) {
      queryFilter +=
        ` and substringof('` + this.state.TitleSearch + `', Title)`;
    }

    if (this.state.ListTypeRequestSearch.length > 0) {
      if (this.state.ListTypeRequestSearch.length == 1) {
        queryFilter +=
          " and WFTableId eq " + this.state.ListTypeRequestSearch[0].WFId + " ";
      }

      if (this.state.ListTypeRequestSearch.length > 1) {
        let listSelect = "";
        this.state.ListTypeRequestSearch.map((item) => {
          if (isNotNull(listSelect)) {
            listSelect += " or WFTableId eq " + item.WFId + "";
          } else {
            listSelect += "WFTableId eq " + item.WFId + "";
          }
        });
        queryFilter += " and (" + listSelect + ")";
      }
    } else {
      // this.wfTableDefault.map((child) => {
      //   if (this.WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
      //     this.WFTableList.push(child);
      //   }
      // });

      if (
        this.permissionUser.Permission != "Admin" ||
        (this.permissionUser.Permission == "Admin" &&
          isNotNull(this.state.DepartmentTitle))
      ) {
        if (this.permissionUser.Permission == "User") {
          queryFilter += " and UserCreated/ID eq " + this.currentUser.Id + " ";
        }
        //  if (this.permissionUser.Permission == "Manager" || (this.permissionUser.Permission == "Admin" && isNotNull(this.state.DepartmentTitle))) {
        // if (this.wfMembers.length == 1) {
        // queryFilter += " and UserCreated/ID eq " + this.wfMembers[0] + " ";
        //  }
        // if (this.wfMembers.length > 1) {
        //   queryFilter += " and ("
        //   for (const i in this.wfMembers) {
        //     if (i < this.wfMembers.length - 1) {
        //       queryFilter += " UserCreated/ID eq " + this.wfMembers[i] + " or ";
        //     }
        //     if (i == this.wfMembers.length - 1) {
        //       queryFilter += " UserCreated/ID eq " + this.wfMembers[i] + " )";
        //     }
        //   }
        // }
      }
      if (this.WFTableList.length > 0) {
        let listSelect = "";
        for (let startWF = startWFTable; startWF < endWFTable; startWF++) {
          if (startWF < this.WFTableList.length) {
            if (isNotNull(listSelect)) {
              listSelect +=
                " or WFTableId eq " + this.WFTableList[startWF].WFId + "";
            } else {
              listSelect +=
                "WFTableId eq " + this.WFTableList[startWF].WFId + "";
            }
          }
        }
        queryFilter += " and (" + listSelect + ")";

        // this.WFTableList.map((item) => {
        //   if (isNotNull(listSelect)) {
        //     listSelect += " or WFTableId eq " + item.WFId + "";
        //   } else {
        //     listSelect += "WFTableId eq " + item.WFId + "";
        //   }
        // });
        // queryFilter += " and (" + listSelect + ")";
        //  }
      }
    }

    if (isNotNull(this.state.StatusSearch)) {
      if (this.state.StatusSearch == 4) {
        queryFilter += ` and StatusStep eq 3`;
      } else {
        queryFilter +=
          ` and StatusStep eq '` +
          this.state.StatusSearch +
          `' and StatusRequest eq 1`;
      }
      //   queryFilter += ` and StatusStep eq '` + this.state.StatusSearch + `' `;
    }
    let start = moment(this.state.startDateSearch).startOf("day").toDate();
    let startDate = ISODateString(start);
    if (isNotNull(this.state.startDateSearch)) {
      queryFilter += ` and DateRequest ge '` + startDate + `' `;
    }
    let end = moment(this.state.endDateSearch).endOf("day").toDate();
    let endDate = ISODateString(end);
    if (isNotNull(this.state.endDateSearch)) {
      queryFilter += ` and DateRequest le '` + endDate + `' `;
    }
    if (this.state.MultiUsers.length == 1) {
      queryFilter +=
        " and UserCreated/ID eq " + this.state.MultiUsers[0].UserId + " ";
    }
    if (this.state.MultiUsers.length > 1) {
      let listUser = "";
      this.state.MultiUsers.map((item) => {
        if (isNotNull(listUser)) {
          listUser += " or UserCreated/ID eq " + item.UserId + "";
        } else {
          listUser += "UserCreated/ID eq " + item.UserId + "";
        }
      });
      queryFilter += " and (" + listUser + ")";
    }

    const checkSort = sort == "asc" ? true : false;
    const strSelect =
      "ID,Title,WFTableId,DateRequest,ItemIndex,indexStep,StatusStep,StatusRequest,UserCreated/ID,UserCreated/Title";
    this.dataHistory = await sp.web.lists
      .getByTitle("WFHistory")
      .items.select(strSelect)
      .expand("UserCreated")
      .filter(queryFilter)
      .orderBy(sortBy, checkSort)
      .top(100)
      .getPaged();

    //  this.dataHistory["results"]= this.dataHistory["results"].filter(f => this.wfMembers.includes(f.UserCreated.ID));

    this.dataHistory["results"].forEach((element) => {
      let TypeRequest = ListTypeRequest.find(
        (x) => x.WFId == element.WFTableId
      );
      let indexStepTitle = ListIndexStep.find(
        (x) =>
          x.WFTableId == element.WFTableId && x.indexStep == element.indexStep
      );
      let wfTableTitle = isNotNull(TypeRequest) ? TypeRequest.WFTitle : "";
      let indexStepname = isNotNull(indexStepTitle) ? indexStepTitle.Title : "";
      let StatusStep = "";
      if (element.indexStep == 1 && element.StatusStep == 0) {
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
      let userApp = { UserId: "", UserTitle: "" };
      if (isNotNull(element.UserCreated)) {
        userApp = {
          UserId: element.UserCreated.ID,
          UserTitle: element.UserCreated.Title,
        };
      }
      let itemDetail = {
        ItemIndex: element.ItemIndex,
        Title: (
          <a
            href={`${config.pages.wfRequestView}?WFTableId=${element.WFTableId}&ItemIndex=${element.ItemIndex}&indexStep=${element.indexStep}&PreviousPage=wfExecution`}
          >
            {element.Title}
          </a>
        ),
        wfTableTitle: wfTableTitle,
        UserCreated: userApp.UserTitle,
        indexStepname: indexStepname,
        StatusStep: StatusStep,
        DateRequest: formatDate(element.DateRequest),
      };

      if (this.permissionUser.Permission == "Admin") {
        if (isNotNull(this.state.DepartmentSearch)) {
          if (
            isNotNull(element.UserCreated) &&
            this.wfMembers.findIndex((mem) => mem == element.UserCreated.ID) !=
              -1
          ) {
            items.push(itemDetail);
          }
        } else {
          items.push(itemDetail);
        }
      } else if (this.permissionUser.Permission == "Manager") {
        if (
          isNotNull(element.UserCreated) &&
          this.wfMembers.findIndex((mem) => mem == element.UserCreated.ID) != -1
        ) {
          items.push(itemDetail);
        }
      } else {
        items.push(itemDetail);
      }
    });

    if (this.dataHistory.hasNext) {
      let nextArray = await this.getNextListItem([]);
      items = items.concat(nextArray);
    }

    // console.log(items);
    return items;
  }

  async getNextListItem(array) {
    const ListTypeRequest = this.wfTable;
    const ListIndexStep = this.state.arrindexStep;

    this.dataHistory = await this.dataHistory.getNext();

    this.dataHistory["results"].forEach((element) => {
      let TypeRequest = ListTypeRequest.find(
        (x) => x.WFId == element.WFTableId
      );
      let indexStepTitle = ListIndexStep.find(
        (x) =>
          x.WFTableId == element.WFTableId && x.indexStep == element.indexStep
      );
      let wfTableTitle = isNotNull(TypeRequest) ? TypeRequest.WFTitle : "";
      let indexStepname = isNotNull(indexStepTitle) ? indexStepTitle.Title : "";
      let StatusStep = "";
      if (element.indexStep == 1 && element.StatusStep == 0) {
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
      let userApp = { UserId: "", UserTitle: "" };
      if (isNotNull(element.UserCreated)) {
        userApp = {
          UserId: element.UserCreated.ID,
          UserTitle: element.UserCreated.Title,
        };
      }
      let itemDetail = {
        ItemIndex: element.ItemIndex,
        Title: (
          <a
            href={`${config.pages.wfRequestView}?WFTableId=${element.WFTableId}&ItemIndex=${element.ItemIndex}&indexStep=${element.indexStep}&PreviousPage=wfExecution`}
          >
            {element.Title}
          </a>
        ),
        wfTableTitle: wfTableTitle,
        UserCreated: userApp.UserTitle,
        indexStepname: indexStepname,
        StatusStep: StatusStep,
        DateRequest: formatDate(element.DateRequest),
      };
      if (this.permissionUser.Permission == "Admin") {
        if (isNotNull(this.state.DepartmentSearch)) {
          if (
            isNotNull(element.UserCreated) &&
            this.wfMembers.findIndex((mem) => mem == element.UserCreated.ID) !=
              -1
          ) {
            array.push(itemDetail);
          }
        } else {
          array.push(itemDetail);
        }
      } else if (this.permissionUser.Permission == "Manager") {
        if (
          isNotNull(element.UserCreated) &&
          this.wfMembers.findIndex((mem) => mem == element.UserCreated.ID) != -1
        ) {
          array.push(itemDetail);
        }
      } else {
        array.push(itemDetail);
      }
    });

    if (this.dataHistory.hasNext) {
      await this.getNextListItem(array);
    }

    return array;
  }

  changeSearchPeople(typeUser, event) {
    this.fieldSearch = { FieldName: event.target.name, FieldType: typeUser };
    if (typeUser == "User") {
      let fieldUser = this.state[event.target.name];
      fieldUser.UserId = "";
      fieldUser.UserEmail = "";
      fieldUser.UserTitle = event.target.value;
      this.setState({ [event.target.name]: fieldUser });
    } else {
      this.setState({ [`search_` + event.target.name]: event.target.value });
    }
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  async callSearchPeople() {
    let searchValue = "";
    if (this.fieldSearch.FieldType == "User") {
      searchValue = this.state[this.fieldSearch.FieldName].UserTitle;
    } else {
      searchValue = this.state[`search_` + this.fieldSearch.FieldName];
    }
    let PeoplePicker = await this.searchPeoplePicker(searchValue);
    this.setState({
      [`listSearch_` + this.fieldSearch.FieldName]: PeoplePicker,
    });
    this.fieldSearch = { FieldName: "", FieldType: "" };
    if (PeoplePicker.length == 0) {
      this.setState({ search_MultiUsers: "", UserTitle: "" });
    }
  }

  async searchPeoplePicker(value) {
    let arrPeople = [];
    await sp.profiles
      .clientPeoplePickerSearchUser({
        MaximumEntitySuggestions: 5,
        PrincipalSource: 15,
        PrincipalType: 15,
        QueryString: value,
      })
      .then((entiries) => {
        arrPeople = entiries;
      })
      .catch((error) => {
        console.log(error);
      });
    return arrPeople;
  }

  async selectSearch(Key, typeUser, InternalName) {
    let user = await sp.web.ensureUser(Key);
    let objUser = {
      UserId: CheckNullSetZero(user["data"].Id),
      UserTitle: CheckNull(user["data"].Title),
      UserEmail: CheckNull(user["data"].Email),
    };
    if (objUser.UserId !== 0) {
      if (typeUser == "User") {
        this.setState({
          [InternalName]: objUser,
          [`listSearch_` + InternalName]: [],
        });
      } else {
        const arrPeople = this.state[InternalName];
        if (arrPeople.findIndex((x) => x.UserId == user["data"].Id) == -1) {
          arrPeople.push(objUser);
        }
        this.setState({
          [InternalName]: arrPeople,
          [`search_` + InternalName]: "",
          [`listSearch_` + InternalName]: [],
        });
      }
    } else {
      if (typeUser == "User") {
        this.setState({
          [InternalName]: { UserId: "", UserTitle: "", UserEmail: "" },
          [`listSearch_` + InternalName]: [],
        });
      } else {
        this.setState({
          [`search_` + InternalName]: "",
          [`listSearch_` + InternalName]: [],
        });
      }
    }
  }

  removePeople(IdUser, InternalName) {
    let arrPeople = this.state[InternalName];
    let index = arrPeople.findIndex((x) => x.UserId == IdUser);
    arrPeople.splice(index, 1);
    this.setState({ [InternalName]: arrPeople });
  }
}
