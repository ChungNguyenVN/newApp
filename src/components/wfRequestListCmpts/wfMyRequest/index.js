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
import FunctionTable from "components/Containers/Tables/MaterialTable/functionTable";
// import '../../docs/css/style.scss';
import "components/Containers/FormAddNew/formStyle.scss";

import DropdownTreeSelect from "react-dropdown-tree-select";
import shareService from "components/wfShareCmpts/wfShareService";
import { returnArray } from "../../wfShareCmpts/wfShareFunction.js";
// import 'react-dropdown-tree-select/dist/styles.css'

export default class WFMyRequest extends Component {
  constructor(props) {
    super(props);
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });

    this.state = {
      TitleSearch: "",
      StatusSearch: "",
      startDateSearch: null,
      endDateSearch: null,
      searchUsers: "",
      listhUsers: [],
      listSearchUsers: [],
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
      searchWFTable: "",
      listWFTable: [],
      listSearchWFTable: this.props.listWorkflow.filter((wf) => wf.Status == 1),
    };
    this.typingTimeout = null;

    this.dataHistory = undefined;
    this.dataColumns = [
      {
        FieldName: "ItemIndex",
        FieldTitle: "#",
        isSort: false,
        isLabelSort: true,
      },
      {
        FieldName: "Title",
        FieldTitle: "Tiêu đề",
        isSort: false,
        isLabelSort: true,
      },
      {
        FieldName: "wfTableTitle",
        FieldTitle: "Loại quy trình",
        isSort: false,
        isLabelSort: false,
      },
      {
        FieldName: "UserApproval",
        FieldTitle: "Người phê duyệt",
        isSort: false,
        isLabelSort: true,
      },
      {
        FieldName: "indexStepname",
        FieldTitle: "Bước hiện tại",
        isSort: false,
        isLabelSort: false,
      },
      {
        FieldName: "StatusStep",
        FieldTitle: "Trạng thái",
        isSort: false,
        isLabelSort: false,
      },
      {
        FieldName: "DateRequest",
        FieldTitle: "Ngày yêu cầu",
        isSort: false,
        isLabelSort: true,
      },
    ];
    this.callbackNexPage = this.callbackNexPage.bind(this);
    this.callbackSort = this.callbackSort.bind(this);
    this.callbackRowPage = this.callbackRowPage.bind(this);
    this.changeFormInput = this.changeFormInput.bind(this);
    this.changeFormSelectMulti = this.changeFormSelectMulti.bind(this);
    this.callSearchPeople = this.callSearchPeople.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      listWorkflow: nextProps.listWorkflow,
      listStepWorkflow: nextProps.listStepWorkflow,
      listDepartment: nextProps.listDepartment,
      currentUser: nextProps.currentUser,
      listSearchWFTable: nextProps.listWorkflow.filter((wf) => wf.Status == 1),
    });
  }

  componentDidMount() {
    this.callSearch();
  }

  async resetItem() {
    await this.setState({
      TitleSearch: "",
      StatusSearch: "",
      startDateSearch: null,
      endDateSearch: null,
      searchUsers: "",
      listhUsers: [],
      listSearchUsers: [],
      listWFTable: [],
      dataSources: [],
      lengthData: 0,
      order: "desc",
      orderBy: "DateRequest",
      page: 0,
      rowsPerPage: 10,
      arrayPage: [],
    });
    this.dataHistory = undefined;
    this.callSearch();
  }

  callSearch() {
    this.Search(this.state.order, this.state.orderBy, this.state.rowsPerPage);
  }

  async Search(sort, sortBy, rowsPerPage) {
    let listSearch = await this.SearchList(sort, sortBy, rowsPerPage);
    let lengthPage = 0;
    if (this.dataHistory.hasNext) {
      lengthPage = listSearch.length + 1;
    } else {
      lengthPage = listSearch.length;
    }
    this.setState({
      dataSources: listSearch,
      lengthData: lengthPage,
      order: sort,
      orderBy: sortBy,
      page: 0,
      rowsPerPage: rowsPerPage,
      arrayPage: [0],
    });
  }

  changeFormSelectMulti(event) {
    let wfTableListSearch = returnArray(this.state.listSearchWFTable);
    let wfTableList = returnArray(this.state.listWFTable);

    let objWF = wfTableListSearch.find((wf) => wf.WFId == event.target.value);
    if (
      isNotNull(objWF) &&
      wfTableList.findIndex((wf) => wf.WFId == objWF.WFId) == -1
    ) {
      wfTableList.push(objWF);
    }
    this.setState({ listWFTable: wfTableList });
  }

  removeSelect(ID) {
    let wfTableList = returnArray(this.state.listWFTable);
    let index = wfTableList.findIndex((wf) => wf.WFId == ID);
    wfTableList.splice(index, 1);
    this.setState({ listWFTable: wfTableList });
  }

  changeFormInput(event) {
    this.setState({ [event.target.name]: event.target.value });
    console.log(this.state);
  }

  handleChangeForm(event, nameState) {
    let dateTime = null;
    if (event != null) {
      dateTime = event["_d"];
    }
    this.setState({ [nameState]: dateTime });
  }

  async SearchList(sort, sortBy, rowsPerPage) {
    // console.log(sp)
    let items = [];

    let queryFilter = "";
    if (this.state.currentUser != null) {
      queryFilter += "UserCreated/ID eq " + this.state.currentUser.Id;
    }
    if (isNotNull(this.state.TitleSearch)) {
      queryFilter +=
        ` and substringof('` + this.state.TitleSearch + `', Title)`;
    }

    let listSelect = "";

    if (this.state.listWFTable.length > 0) {
      this.state.listWFTable.map((item) => {
        if (isNotNull(listSelect)) {
          listSelect += " or WFTableId eq " + item.WFId;
        } else {
          listSelect += " WFTableId eq " + item.WFId;
        }
      });
      queryFilter += " and (" + listSelect + ")";
    }

    if (isNotNull(this.state.StatusSearch)) {
      if (this.state.StatusSearch == 3) {
        queryFilter += ` and StatusRequest eq 0`;
      } else if (this.state.StatusSearch == 4) {
        queryFilter += ` and StatusStep eq 3`;
      } else {
        queryFilter +=
          ` and StatusStep eq '` +
          this.state.StatusSearch +
          `' and StatusRequest eq 1`;
      }
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

    if (this.state.listhUsers.length > 0) {
      let listUser = "";
      this.state.listhUsers.map((item) => {
        if (isNotNull(listUser)) {
          listUser += " or UserApproval/ID eq " + item.UserId + "";
        } else {
          listUser += "UserApproval/ID eq " + item.UserId + "";
        }
      });
      queryFilter += " and (" + listUser + ")";
    }

    const checkSort = sort == "asc" ? true : false;
    const strSelect =
      "ID,Title,WFTableId,DateRequest,ItemIndex,indexStep,StatusStep,StatusRequest,UserApproval/ID,UserApproval/Title";
    this.dataHistory = await sp.web.lists
      .getByTitle("WFHistory")
      .items.select(strSelect)
      .expand("UserApproval")
      .filter(queryFilter)
      .orderBy(sortBy, checkSort)
      .top(rowsPerPage)
      .getPaged();

    this.dataHistory["results"].forEach((element) => {
      let TypeRequest = this.state.listWorkflow.find(
        (x) => x.WFId == element.WFTableId
      );
      let indexStepTitle = this.state.listStepWorkflow.find(
        (x) =>
          x.WFTableId == element.WFTableId && x.indexStep == element.indexStep
      );
      let wfTableTitle = isNotNull(TypeRequest) ? TypeRequest.WFTitle : "";
      let indexStepname = isNotNull(indexStepTitle) ? indexStepTitle.Title : "";
      let StatusStep = "";
      if (element.StatusRequest == 0 && element.StatusStep == 0) {
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

    // console.log(items);
    return items;
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

  changeSearchPeople(event) {
    this.setState({ searchUsers: event.target.value });
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  async callSearchPeople() {
    let PeoplePicker = await shareService.searchPeoplePicker(
      this.state.searchUsers
    );
    this.setState({
      listSearchUsers: PeoplePicker,
    });
  }

  async selectSearch(Key) {
    let listhUser = returnArray(this.state.listhUsers);
    let objUser = await shareService.getInforUser(Key);
    if (
      listhUser.findIndex((us) => us.UserId == objUser.UserId) == -1 &&
      isNotNull(objUser.UserId)
    ) {
      listhUser.push(objUser);
    }
    this.setState({
      searchUsers: "",
      listhUsers: listhUser,
      listSearchUsers: [],
    });
  }

  removePeople(IdUser) {
    let listhUser = returnArray(this.state.listhUsers);
    let index = listhUser.findIndex((x) => x.UserId == IdUser);
    listhUser.splice(index, 1);
    this.setState({ listhUsers: listhUser });
  }

  render() {
    const {
      dataSources,
      lengthData,
      listWorkflow,
      listStepWorkflow,
      listDepartment,
      listhUsers,
      listSearchUsers,
      listWFTable,
      listSearchWFTable,
    } = this.state;
    console.log(this.state);
    return (
      <Grid container>
        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={8} xs={12} md={6} xl={8}>
              <h3>Phiếu đã tạo</h3>
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
                name="TitleSearch"
                variant="outlined"
                className="textField"
                fullWidth
                value={this.state.TitleSearch}
                onChange={this.changeFormInput}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="userRequest">
                Người phê duyệt
              </label>
              <TextField
                name="searchUsers"
                value={this.state.searchUsers}
                onChange={this.changeSearchPeople.bind(this)}
                variant="outlined"
                className="textField"
                fullWidth
              />
              {listSearchUsers.length > 0 ? (
                <div id="myInputautocomplete" className="suggesAuto">
                  {listSearchUsers.map((people) => (
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

              {listhUsers.length > 0 ? (
                <div className="tagName">
                  {listhUsers.map((users) => (
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
            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="typeRequest">
                Loại quy trình
              </label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select
                  name="searchWFTable"
                  variant="outlined"
                  value={this.state.searchWFTable}
                  onChange={this.changeFormSelectMulti}
                >
                  <MenuItem value="">--Select--</MenuItem>
                  {listSearchWFTable.map((event) => (
                    <MenuItem value={event.WFId} key={event.WFId}>
                      {event.WFTitle}
                    </MenuItem>
                  ))}
                </Select>
                {listWFTable.length > 0 ? (
                  <div className="tagName">
                    {listWFTable.map((item) => (
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
                  name={Object.keys(this.state)[5]}
                  value={this.state.startDateSearch}
                  placeholder="DD-MM-YYYY"
                  inputVariant="outlined"
                  onChange={(date) =>
                    this.handleChangeForm(date, "startDateSearch")
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
                    this.handleChangeForm(date, "endDateSearch")
                  }
                  format="DD-MM-YYYY"
                  InputAdornmentProps={{ position: "end" }}
                  className="datePicker"
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
          <Grid container alignItems="flex-end">
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
}
