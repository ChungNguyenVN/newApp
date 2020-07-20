import React, { Component } from "react";
import { config } from "./../../../pages/environment.js";
import {
  isNotNull,
  returnObject,
  returnArray,
} from "components/wfShareCmpts/wfShareFunction.js";
import { objField } from "components/wfShareCmpts/wfShareModel";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-groups";
import * as moment from "moment";
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
  Dialog,
} from "@material-ui/core";
import "components/Containers/FormAddNew/formStyle.scss";
import shareService from "components/wfShareCmpts/wfShareService.js";

export default class WFSubInfo extends Component {
  constructor(props) {
    super(props);

    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      ArraySubProcess: this.props.ArraySubProcess,
      isSynchronized: this.props.isSynchronized,
    };
    this.callSearchPeople = this.callSearchPeople.bind(this);

    this.typingTimeout = null;
    this.fieldSearch = undefined;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ArraySubProcess: nextProps.ArraySubProcess,
      isSynchronized: nextProps.isSynchronized,
    });
  }

  render() {
    const { ArraySubProcess, isSynchronized } = this.state;
    return (
      <div className="mainContainer" style={{ minHeight: "auto" }}>
        <div className="mainContentRouter" style={{ width: "100%" }}>
          <Grid container>
            <Card className="formInput btnForm">
              <Grid container alignItems="flex-end" className="mb-30">
                <Grid item sm={8} xs={12} md={6} xl={8}>
                  <h3>Thiết đặt người khởi tạo cho các quy trình con</h3>
                </Grid>
                {this.props.closeDialog != undefined && !isSynchronized ? (
                  <Grid item sm={12} xs={12} md={6} xl={4}>
                    <div className="btnList pull-right">
                      <Button
                        className="btn btn-text bg-secondary"
                        onClick={() => this.props.closeDialog()}
                      >
                        <i className="fa fa-times" /> Đóng
                      </Button>
                    </div>
                  </Grid>
                ) : (
                  ""
                )}
              </Grid>
              <Grid container spacing={3} className="mb-30">
                {ArraySubProcess.map((itemSub, keyItem) => (
                  <Grid
                    container
                    spacing={3}
                    className="mb-30"
                    style={{ border: "solid 1px blue" }}
                    key={keyItem}
                  >
                    <Grid item sm={4} xs={12}>
                      <h3 className="form-label">{`${itemSub.WFTableTitle} (${itemSub.StepTitle})`}</h3>
                      <label className="form-label">
                        <span
                          style={{ fontStyle: "italic", fontWeight: "500" }}
                        >
                          {itemSub.Waitting
                            ? "(Quy trình nối tiếp)"
                            : "(Quy trình song song)"}
                        </span>
                      </label>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <label className="form-label">
                        Người khởi tạo yêu cầu{" "}
                        {itemSub.Waitting && isSynchronized ? (
                          <span className="required-field">*</span>
                        ) : (
                          ""
                        )}
                      </label>
                      {itemSub.typeSearch == "Users" ||
                      itemSub.typeSearch == "Department" ? (
                        <div>
                          <FormControl
                            fullWidth
                            className="selectForm"
                            variant="outlined"
                          >
                            <Select
                              onChange={(event) =>
                                this.changeFormInput(event, keyItem)
                              }
                              name={`SubUserRequest_${keyItem}`}
                              value={itemSub.SubUserRequest.UserId}
                            >
                              <MenuItem value="">--Select--</MenuItem>
                              {itemSub.listSearch_SubUserRequest.map(
                                (user, index) => (
                                  <MenuItem value={user.UserId} key={index}>
                                    {user.UserTitle}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>

                          {itemSub.list_SubUserRequest.length > 0 ? (
                            <div className="tagName">
                              {itemSub.list_SubUserRequest.map((users) => (
                                <p key={users.UserId} className="wrapName">
                                  <a
                                    onClick={() =>
                                      this.removePeople(users.UserId, keyItem)
                                    }
                                  >
                                    <i className="fa fa-close text-danger"></i>
                                  </a>{" "}
                                  {users.UserTitle}
                                </p>
                              ))}
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      ) : (
                        <div>
                          <TextField
                            name={`SubUserRequest_${keyItem}`}
                            variant="outlined"
                            className="textField"
                            fullWidth
                            onChange={(event) =>
                              this.changeSearchPeople(event, keyItem)
                            }
                            value={itemSub.SubUserRequest.UserTitle}
                            placeholder="Tìm kiếm người dùng"
                          />
                          {itemSub.listSearch_SubUserRequest.length > 0 ? (
                            <div
                              id="myInputautocomplete"
                              className="suggesAuto"
                            >
                              {itemSub.listSearch_SubUserRequest.map(
                                (people) => (
                                  <div
                                    key={people.Key}
                                    className="suggtAutoItem"
                                    onClick={() =>
                                      this.selectSearch(people.Key, keyItem)
                                    }
                                  >
                                    <i className="fa fa-user"></i>
                                    {people.DisplayText}
                                    {` (${people.Description}`}
                                    {isNotNull(people.EntityData.Title)
                                      ? ` - ${people.EntityData.Title})`
                                      : `)`}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            ""
                          )}

                          {itemSub.list_SubUserRequest.length > 0 ? (
                            <div className="tagName">
                              {itemSub.list_SubUserRequest.map((users) => (
                                <p key={users.UserId} className="wrapName">
                                  <a
                                    onClick={() =>
                                      this.removePeople(users.UserId, keyItem)
                                    }
                                  >
                                    <i className="fa fa-close text-danger"></i>
                                  </a>{" "}
                                  {users.UserTitle}
                                </p>
                              ))}
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
              <Grid item sm={12} xs={12} className="text-center">
                <div className="btnList">
                  <Button
                    className="btn bg-primary"
                    onClick={() => this.saveSubForm()}
                  >
                    {" "}
                    <span className="icon">
                      <i className="fa fa-send"></i>
                    </span>
                    Gửi đi
                  </Button>
                </div>
              </Grid>
            </Card>
          </Grid>
        </div>
      </div>
    );
  }

  saveSubForm() {
    let checkShow = this.checkSaveSubProcess();
    if (isNotNull(checkShow)) {
      alert(
        "Bạn chưa nhập Người khởi tạo yêu cầu tại các quy trình : \n" +
          checkShow
      );
      return;
    } else {
      // console.log(this.state);
      this.props.resultSubProcess(
        this.state.ArraySubProcess,
        this.state.isSynchronized
      );
    }
  }

  changeFormInput(event, indexSub) {
    let valueState = event.target.value;
    let arraySubProcess = returnArray(this.state.ArraySubProcess);
    let itemSubProcess = returnObject(arraySubProcess[indexSub]);
    let listSearch_SubUser = returnArray(
      itemSubProcess.listSearch_SubUserRequest
    );
    let userSub = listSearch_SubUser.find((lus) => lus.UserId == valueState);
    if (isNotNull(userSub)) {
      let listSubUser = returnArray(itemSubProcess.list_SubUserRequest);
      // if (listSubUser.findIndex((ls) => ls.UserId == userSub.UserId) == -1) {
      //   listSubUser.push(userSub);
      // }
      listSubUser.push(userSub);
      itemSubProcess.list_SubUserRequest = listSubUser;

      arraySubProcess[indexSub] = itemSubProcess;
      this.setState({ ArraySubProcess: arraySubProcess });
    }
  }

  // nhập giá trị để tìm kiếm người
  changeSearchPeople(event, indexSub) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    this.fieldSearch = nameState;

    let arraySubProcess = returnArray(this.state.ArraySubProcess);
    let itemSubProcess = returnObject(arraySubProcess[indexSub]);
    let userSubProcess = returnObject(itemSubProcess.SubUserRequest);

    userSubProcess.UserId = "";
    userSubProcess.UserEmail = "";
    userSubProcess.UserTitle = valueState;

    itemSubProcess.SubUserRequest = userSubProcess;
    arraySubProcess[indexSub] = itemSubProcess;
    this.setState({ ArraySubProcess: arraySubProcess });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeople() {
    let indexSub = this.fieldSearch.split("_")[1];
    let arraySubProcess = returnArray(this.state.ArraySubProcess);
    let itemSubProcess = returnObject(arraySubProcess[indexSub]);

    let PeoplePicker = await shareService.searchPeoplePicker(
      itemSubProcess.SubUserRequest.UserTitle
    );

    itemSubProcess.listSearch_SubUserRequest = PeoplePicker;
    arraySubProcess[indexSub] = itemSubProcess;

    this.setState({ ArraySubProcess: arraySubProcess });
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearch(Key, indexSub) {
    let objUser = await shareService.getInforUser(Key);
    let arraySubProcess = returnArray(this.state.ArraySubProcess);
    let itemSubProcess = returnObject(arraySubProcess[indexSub]);
    itemSubProcess.SubUserRequest = {
      UserId: "",
      UserTitle: "",
      UserEmail: "",
    };
    itemSubProcess.listSearch_SubUserRequest = [];
    let list_SubUser = returnArray(itemSubProcess.list_SubUserRequest);
    // if (
    //   isNotNull(objUser.UserId) &&
    //   list_SubUser.findIndex((ls) => ls.UserId == objUser.UserId) == -1
    // ) {
    //   list_SubUser.push(objUser);
    // }
    list_SubUser.push(objUser);
    itemSubProcess.list_SubUserRequest = list_SubUser;
    arraySubProcess[indexSub] = itemSubProcess;
    this.setState({ ArraySubProcess: arraySubProcess });
  }

  removePeople(IdUser, indexSub) {
    let arraySubProcess = returnArray(this.state.ArraySubProcess);
    let itemSubProcess = returnObject(arraySubProcess[indexSub]);
    let list_SubUser = returnArray(itemSubProcess.list_SubUserRequest);

    let index = list_SubUser.findIndex((x) => x.UserId == IdUser);
    list_SubUser.splice(index, 1);

    itemSubProcess.list_SubUserRequest = list_SubUser;
    arraySubProcess[indexSub] = itemSubProcess;
    this.setState({ ArraySubProcess: arraySubProcess });
  }

  checkSaveSubProcess() {
    let textShow = "";
    let arraySubProcess = returnArray(this.state.ArraySubProcess);
    for (let i = 0; i < arraySubProcess.length; i++) {
      if (
        arraySubProcess[i].Waitting &&
        arraySubProcess[i].list_SubUserRequest.length == 0 &&
        this.state.isSynchronized
      ) {
        textShow += arraySubProcess[i].WFTableTitle + ", ";
      }
    }
    return textShow;
  }
}
