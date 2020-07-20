import React, { Component } from "react";
import style from "./wfExecutionCmpt.css";
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
// import '../../docs/css/style.scss';
import "./../Containers/FormAddNew/formStyle.scss";
import shareService from "components/wfShareCmpts/wfShareService";

export default class Execution extends Component {
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
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.typingTimeout = null;
    this.fieldSearch = { FieldName: "", FieldType: "" };
    this.WFTableList = [];
    this.wfTable = [];
    this.wfTableAll = [];

    this.dataHistory = undefined;
    this.dataColumns = [
      { FieldName: "ItemIndex", FieldTitle: "#", isSort: false },
      { FieldName: "Title", FieldTitle: "Tiêu đề", isSort: false },
      {
        FieldName: "wfTableTitle",
        FieldTitle: "Loại quy trình",
        isSort: false,
      },
      { FieldName: "UserCreated", FieldTitle: "Người tạo", isSort: false },
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
  }

  async componentDidMount() {
    this.setStateForm();
  }

  async setStateForm() {
    this.currentUser = await sp.web.currentUser();
    console.log(this.currentUser);

    this.wfTable = await this.GetWFTable();
    console.log(this.wfTable);

    this.wfTableAll = await shareService.GetArrayWFTable();

    this.wfDepartment = await this.GetListDepartment();
    // console.log(this.wfDepartment);

    this.WFTableList = [];
    for (let i = 0; i < this.wfTable.length; i++) {
      if (this.wfTable[i].WhoIsUsed == "Users") {
        if (
          this.wfTable[i].UserDefault.findIndex(
            (x) => x == this.currentUser.Id
          ) !== -1
        ) {
          this.WFTableList.push({
            ID: this.wfTable[i].ID,
            Title: this.wfTable[i].Title,
          });
        }
      } else if (this.wfTable[i].WhoIsUsed == "Department") {
        let dept = this.wfDepartment.find(
          (d) => d.Code == this.wfTable[i].Department
        );
        if (isNotNull(dept)) {
          if (
            dept.Members.findIndex((x) => x == this.currentUser.Id) !== -1 ||
            dept.Manager == this.currentUser.Id
          ) {
            this.WFTableList.push({
              ID: this.wfTable[i].ID,
              Title: this.wfTable[i].Title,
            });
          }
        }
      } else {
        this.WFTableList.push({
          ID: this.wfTable[i].ID,
          Title: this.wfTable[i].Title,
        });
      }
    }

    var arrTypeRequestList = this.wfTable;
    var arrTypeRequest = this.wfTable;

    // var arrTypeRequestList = await this.ListTypeRequest();
    // var arrTypeRequest = arrTypeRequestList;
    if (this.state.ListTypeRequestSearch.length > 0) {
      this.state.ListTypeRequestSearch.map((item) => {
        arrTypeRequest = arrTypeRequest.filter((x) => x.ID != item.ID);
      });
    }
    var arrindexStep = await this.ListIndexStep();
    this.setState({
      arrindexStep: arrindexStep,
      arrTypeRequest: arrTypeRequest,
      arrTypeRequestList: arrTypeRequestList,
    });

    this.callSearch();
  }

  async resetItem() {
    //var arrTypeRequest = await this.ListTypeRequest();
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
    });
    // this.Search();
    this.dataHistory = undefined;
    this.callSearch();
  }

  // async Search() {
  //   let listSearch = await this.SearchList();
  //   this.setState({
  //     listItem: listSearch
  //   })

  // }

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
    let listTypeRequestSearch = this.state.ListTypeRequestSearch;
    listTypeRequestSearch.push({
      ID: event.target.value,
      Title: event.currentTarget.innerText,
    });
    let listSelect = this.state.arrTypeRequest.filter(
      (x) => x.ID != event.target.value
    );
    this.setState({
      ListTypeRequestSearch: listTypeRequestSearch,
      arrTypeRequest: listSelect,
    });
    console.log(this.state);
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
    this.setState({ [event.target.name]: event.target.value });
    console.log(this.state);
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
    // // const dataNext = await this.SearchNextPage(newPage);
    // // console.log(dataNext)
    // this.setState({page: newPage})
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
      const ListTypeRequest = this.wfTableAll;
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
        let wfTableCode = isNotNull(TypeRequest) ? TypeRequest.WFCode : "";
        let indexStepname = isNotNull(indexStepTitle)
          ? indexStepTitle.Title
          : "";
        let StatusStep = "";
        if (
          element.indexStep == wfTableTitle.WFIndexStep &&
          element.StatusStep == 0
        ) {
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
    const { listItem, dataSources, lengthData } = this.state;
    const tablehead = [
      "#",
      "Tiêu đề",
      "Loại quy trình",
      "Người yêu cầu",
      "Trạng thái",
      "Ngày yêu cầu",
    ];
    const tables = [];
    listItem
      ? listItem.map((item) => {
          tables.push({
            Title: (
              <a
                href={`${config.pages.wfRequestView}?WFTableId=${item.WFTableId}&ItemIndex=${item.ItemIndex}&indexStep=${item.indexStep}`}
              >
                {item.Title}
              </a>
            ),
            wfTableTitle: item.nameTypeRequest,
            UserCreated: item.UserCreated,
            StatusStep: (
              <span className={[formatStatusLabel(item.StatusStep)]}>
                {formatStatusText(item.StatusStep)}
              </span>
            ),
            DateRequest: item.DateRequest,
          });
        })
      : "";
    return (
      <Grid container>
        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={8} xs={12} md={6} xl={8}>
              <h3>Phiếu cần xử lý</h3>
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
                        this.selectSearch(people.Key, "UserMulti", "MultiUsers")
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
                        className={style.form_btna}
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
            <Grid item sm={6} xs={12}>
              <label className="form-label" htmlFor="typeRequest">
                Loại quy trình
              </label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select
                  name={Object.keys(this.state)[3]}
                  variant="outlined"
                  value={this.state.TypeRequestSearch}
                  onChange={this.changeFormSelectMulti}
                >
                  {this.state.arrTypeRequest ? (
                    this.state.arrTypeRequest.map((event) => (
                      <MenuItem value={event.ID} key={event.ID}>
                        {event.Title}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>-- Không có dữ kiệu --</MenuItem>
                  )}
                </Select>
                {this.state.ListTypeRequestSearch.length > 0 ? (
                  <div className="tagName">
                    {this.state.ListTypeRequestSearch.map((item) => (
                      <div
                        key={item.ID}
                        className={style.form_Text_Comment}
                        className="wrapName"
                      >
                        <a
                          className="text-danger"
                          onClick={() => this.removeSelect(item.ID, item.Title)}
                        >
                          <i className="fa fa-close"></i>
                        </a>
                        {item.Title}
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
            {/* <SimpleTable
              tablehead={tablehead}
              tablebody={tables}
            /> */}
          </Card>
        </Grid>
      </Grid>
    );
  }

  async SearchList(sort, sortBy, rowsPerPage) {
    // console.log(sp)
    let items = [];
    let ListTypeRequest = this.wfTableAll;
    let ListIndexStep = this.state.arrindexStep;
    let queryFilter = "";
    if (this.currentUser != null) {
      queryFilter +=
        "UserApproval/ID eq " +
        this.currentUser.Id +
        " and (StatusRequest eq 1 or StatusRequest eq 3) and (StatusStep eq 0 or StatusStep eq 3 ) ";
    }
    if (isNotNull(this.state.TitleSearch)) {
      queryFilter +=
        ` and substringof('` + this.state.TitleSearch + `', Title)`;
    }
    // if (isNotNull(this.state.TypeRequestSearch)) {
    //   queryFilter += ' and WFTableId eq ' + this.state.TypeRequestSearch + ' ';

    // }
    let listSelect = "";
    if (this.state.ListTypeRequestSearch.length == 1) {
      queryFilter +=
        " and WFTableId eq " + this.state.ListTypeRequestSearch[0].ID + " ";
    }
    if (this.state.ListTypeRequestSearch.length > 1) {
      this.state.ListTypeRequestSearch.map((item) => {
        if (isNotNull(listSelect)) {
          listSelect += " or WFTableId eq " + item.ID + "";
        } else {
          listSelect += "WFTableId eq " + item.ID + "";
        }
      });
      queryFilter += " and (" + listSelect + ")";
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
      .top(rowsPerPage)
      .getPaged();

    this.dataHistory["results"].forEach((element) => {
      let TypeRequest = ListTypeRequest.find(
        (x) => x.WFId == element.WFTableId
      );
      let indexStepTitle = ListIndexStep.find(
        (x) =>
          x.WFTableId == element.WFTableId && x.indexStep == element.indexStep
      );
      let wfTableTitle = isNotNull(TypeRequest) ? TypeRequest.WFTitle : "";
      let wfTableCode = isNotNull(TypeRequest) ? TypeRequest.WFCode : "";
      let indexStepname = isNotNull(indexStepTitle) ? indexStepTitle.Title : "";
      let StatusStep = "";
      if (
        element.indexStep == wfTableTitle.WFIndexStep &&
        element.StatusStep == 0
      ) {
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

    // console.log(items);
    return items;
  }
  async GetWFTable() {
    let arrStepWF = [];
    await sp.web.lists
      .getByTitle("WFTable")
      .items.select("ID,Title,Code,Created,Status,WhoIsUsed,WIUGroup,WIUId")
      .filter("Status eq 1")
      .orderBy("ID", true)
      .get()
      .then((listWFStep) => {
        // console.log(listWFStep);
        listWFStep.forEach((itemDetail) => {
          arrStepWF.push({
            ID: itemDetail.ID,
            Code: CheckNull(itemDetail["Code"]),
            Title: CheckNull(itemDetail["Title"]),
            Description: CheckNull(itemDetail["Description"]),
            WhoIsUsed: CheckNull(itemDetail["WhoIsUsed"]),
            Department: CheckNull(itemDetail["WIUGroup"]),
            UserDefault: itemDetail["WIUId"],
            Status: CheckNull(itemDetail["Status"]),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrStepWF;
  }

  async GetListDepartment() {
    let items = [];
    await sp.web.lists
      .getByTitle("ListDepartment")
      .items.select("ID,Title,DeptCode,ManagerId,MembersId")
      .get()
      .then((itemList) => {
        // console.log(itemList);
        if (itemList.length > 0) {
          itemList.forEach((element) => {
            items.push({
              ID: element.ID,
              Title: element.Title,
              Code: element.DeptCode,
              Manager: element.ManagerId,
              Members: element.MembersId,
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(items);
    return items;
  }

  async ListTypeRequest() {
    let items = [];
    await sp.web.lists
      .getByTitle("WFTable")
      .items.select("ID,Title")
      .get()
      .then((itemList) => {
        // console.log(itemList);
        itemList.forEach((element) => {
          items.push({
            ID: element.ID,
            Title: element.Title,
          });
        });
        console.log(items);
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(items);
    return items;
  }

  async ListIndexStep() {
    let items = [];
    let itemStep = await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select("ID,WFTableId,Title,indexStep")
      .top(100)
      .getPaged();
    console.log(itemStep);
    itemStep["results"].forEach((element) => {
      items.push({
        ID: element.ID,
        WFTableId: element.WFTableId,
        Title: element.Title,
        indexStep: element.indexStep,
      });
    });
    if (itemStep.hasNext) {
      let nextArray = await this.getNexStepStep(itemStep, []);
      items = items.concat(nextArray);
    }
    return items;
  }

  async getNexStepStep(itemStep, array) {
    let itemStepNext = await itemStep.getNext();
    itemStepNext["results"].forEach((element) => {
      array.push({
        ID: element.ID,
        WFTableId: element.WFTableId,
        Title: element.Title,
        indexStep: element.indexStep,
      });
    });
    if (itemStepNext.hasNext) {
      await this.getNexStepStep(itemStepNext, array);
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
