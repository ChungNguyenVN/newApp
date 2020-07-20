import React, { Component, Fragment } from "react";
import { config } from "./../../pages/environment.js";
import {
  objField,
  objDataTransfer,
  arrayDataTransfer,
  arrayTimeInWorks,
} from "./../wfShareCmpts/wfShareModel";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  formatDate,
  formatStatusText,
  CalculateDate,
  CalculateNumber,
  CompareNumber,
  CompareDate,
  CompareText,
  formatTypeCompare,
  formatStatusLabel,
  formatStatusTextLine,
  getFileBuffer,
  ReplaceFieldMail,
  ISODateString,
  returnObject,
  returnArray,
  isValidURL,
  checkFieldStepCondition,
  calculationField,
  checkConditionNextStep,
  FindTitleById,
  loadChildBranch,
  loadWFByDept,
  loadReportStepSLA,
  backToPages,
  loadMemberUsersDept,
  loadWorkflowInDept,
  loadModifiedDate,
  checkUpdateData,
} from "./../wfShareCmpts/wfShareFunction.js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-groups";
import * as moment from "moment";
import imgUserDefault from "./../default-user-image.png";

import Card from "components/Card";
import {
  Grid,
  TextField,
  OutlinedInput,
  FormControl,
  Select,
  Button,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  Dialog,
  CircularProgress,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import "./../Containers/FormAddNew/formStyle.scss";
import { withStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  TableContainer,
  TablePagination,
  Paper,
} from "@material-ui/core";
import FileAttach from "components/Containers/FileAttachments";
import SubFormApprove from "components/wfRequestViewCmpts/subFormApprove";
import shareService from "../wfShareCmpts/wfShareService.js";
import WFSubInfo from "components/wfRequestListCmpts/wfSubFormProcess";
import WFLoadingControl from "components/wfRequestListCmpts/wfLoadingControl";

const GreenRadio = withStyles({
  root: {
    color: green[400],
    "&$checked": {
      color: green[600],
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const GreenCheckBox = withStyles({
  root: {
    color: green[400],
    "&$checked": {
      color: green[600],
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

export default class RequestView extends Component {
  constructor(props) {
    super(props);

    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });

    this.state = {
      isShowLoadingPage: true,
      detailItem: "",
      isForm: false,
      textPermiss: "",
      detailHistory: "",
      search_AssignToComment: "",
      listSearch_AssignToComment: [],
      list_AssignToComment: [],
      UserReAssign: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserReAssign: [],
      Chat_Comments: "",
      AttachmentComment: [],
      listComments: [],
      isFormApprove: false,
      ReasonStep: "",
      ArrStatusStepLine: [],
      AttachmentRequest: [],
      wfBackStep: [],
      BackStep: "",
      isUserApprovalStep: false,
      IsEditApproverStep: false,
      TypeUserApproval: "",
      NameGroup: "",
      UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApprovalStep: [],
      listSelect_UserApprovalStep: [],
      IsEditApproverBackStep: false,
      UserApproveBackStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApproveBackStep: [],
      listSelect_UserApproveBackStep: [],
      isView: false,
      ArraySubProcess: [],
      infoSubProcess: false,
      isSynchronized: false,
      ArraySynchronized: [],
      ArrayAsynchronous: [],
      isInformSubProcess: false,
      ArrayInformSubProcess: [],
      SearchInformSub: "",
    };

    this.changeFormInput = this.changeFormInput.bind(this);
    this.changeFormDateTime = this.changeFormDateTime.bind(this);
    this.changeFormCheckBox = this.changeFormCheckBox.bind(this);
    this.changeSearchPeople = this.changeSearchPeople.bind(this);
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.selectSearch = this.selectSearch.bind(this);
    this.removePeople = this.removePeople.bind(this);

    this.itemApproval = this.itemApproval.bind(this);
    this.itemReject = this.itemReject.bind(this);
    this.itemReAssign = this.itemReAssign.bind(this);
    this.itemBackStep = this.itemBackStep.bind(this);
    this.itemSave = this.itemSave.bind(this);
    this.resultSubProcess = this.resultSubProcess.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.SLAByStream = 0;
    this.ItemIndex = undefined;
    this.indexStep = undefined;
    this.PreviousPage = undefined;
    this.WFTable = { WFId: "", WFCode: "", WFTitle: "", WFIndexStep: "" };
    this.currentUser = undefined;
    this.wfStepTable = [];
    this.wfStepField = [];
    this.wfStepFieldInput = [];
    this.ArrButtonApprove = [];
    this.ArrayStatusStepLine = [];
    this.urlAttachment = config.url.API_URL.split("/sites/", 1);
    this.typingTimeout = null;
    this.fieldSearch = { FieldName: "", FieldType: "", subForm: "" };
    this.Status = "Inprogress";
    this.isAttachments = false;
    this.isViewAttachments = false;
    this.isEditAttachments = false;
    this.StatusSendEmail = { isFinish: false, Status: 0 };
    this.wfStepFieldAll = [];
    this.EmailComment = "";
    this.listFieldSPLink = [];
    this.listBackStep = {};
    this.ArraySubProcessView = [];
    this.ArrayHistoryStep = [];
    this.realisticSLA = 0;
    this.EmailSendToSubProcess = "";
    this.permissionOfUser = {
      ID: 0,
      Title: "",
      RoleCode: "",
      PriorityPoint: 0,
      Submit: false,
      Save: false,
      Approve: false,
      ReAssigment: false,
      View: false,
      Reject: false,
      MoveTo: false,
      InformTo: false,
    };
    this.objStepParentConfig = "";
    this.WFHistoryId = 0;
    this.HistoryStepUpdate = [];
    this.WFStepFieldAdd = [];
    this.WFStepFieldView = [];
  }

  componentDidMount() {
    let param = getQueryParams(window.location.search);
    console.log(param);
    this.WFTable.WFId = param["WFTableId"];
    this.ItemIndex = param["ItemIndex"];
    this.indexStep = param["indexStep"];
    this.PreviousPage = param["PreviousPage"];

    // console.log(
    //   "this.WFTable: " +
    //     this.WFTable.WFId +
    //     " this.ItemIndex: " +
    //     this.ItemIndex +
    //     " this.indexStep: " +
    //     this.indexStep
    // );

    this.setStateForm();
  }

  async setStateForm() {
    this.currentUser = await sp.web.currentUser();
    // console.log(this.currentUser);

    this.WFTable = await shareService.GetWFTable(this.WFTable.WFId);
    // console.log(this.WFTable);

    this.wfStepTable = await shareService.GetWFStepTable(this.WFTable.WFId);
    console.log(this.wfStepTable);

    this.EmailComment = await shareService.GetWFTemplateEmail(0);
    // console.log(this.EmailComment);

    this.EmailSendToSubProcess = await shareService.GetWFTemplateEmail(4);
    // console.log(this.EmailSendToSubProcess);

    // this.wfStepField = await shareService.GetWFFormField();
    // console.log(this.wfStepField);
    const stepField = await shareService.GetWFFormField(this.WFTable.WFId);
    console.log(stepField);

    this.permissionOfUser = await shareService.GetPermissonByRole(
      this.currentUser
    );
    console.log(this.permissionOfUser);

    this.wfStepFieldAll = stepField;
    this.wfStepFieldInput = [];
    this.wfStepField = [];

    let strSelect =
        "ID,AttachmentFiles,UserRequest/Id,UserRequest/Title,UserRequest/Name,UserApproval/Id,UserApproval/Title,UserApproval/Name," +
        "ListUser/Id,ListUser/Title,ListUser/Name,indexStep,StatusStep,StatusRequest,HistoryStep,Reason,ObjParentWF,ObjSubWF",
      strExpand = "UserRequest,UserApproval,ListUser,AttachmentFiles";
    let strFilter =
      `UserRequest/Id eq ` +
      this.currentUser.Id +
      ` or ` +
      `UserApproval/Id eq ` +
      this.currentUser.Id +
      ` or ` +
      `ListUser/Id eq ` +
      this.currentUser.Id;
    let step = this.wfStepTable.find((x) => x.indexStep == this.indexStep);
    let ArrFieldInput = [];
    let ArrFieldView = [];

    if (isNotNull(step)) {
      this.isAttachments = step.ObjFieldStep.isAttachments;
      this.isViewAttachments = step.ObjFieldStep.isViewAttachments;
      if (step.ObjFieldStep.isEditAttachments != undefined) {
        this.isEditAttachments = step.ObjFieldStep.isEditAttachments;
      }
      ArrFieldView = step.ObjFieldStep.FieldView;
      this.ArrButtonApprove = step.btnAction;
      ArrFieldInput = step.ObjFieldStep.FieldInput;

      if (step.StepWFType == "Quy trình" && isNotNull(step.ObjStepWFId)) {
        let arrSub = returnArray(step.ObjStepWFId);
        let arraySub = await shareService.loadControlSub(
          arrSub,
          this.indexStep,
          step.Title
        );
        let arrSynchronized = arraySub.filter((sub) => sub.Waitting == true);
        let arrAsynchronous = arraySub.filter((sub) => sub.Waitting == false);
        this.setState({
          ArraySubProcess: arraySub,
          ArraySynchronized: arrSynchronized,
          ArrayAsynchronous: arrAsynchronous,
        });
      }
    } else {
      step = this.wfStepTable.find((x) => x.indexStep == 1);
      if (isNotNull(step)) {
        ArrFieldView = step.ObjFieldStep.FieldView;
      }
    }

    for (let fs = 0; fs < stepField.length; fs++) {
      let indexFieldInput = ArrFieldInput.findIndex(
        (flc) => flc.InternalName == stepField[fs].InternalName
      );

      let indexFieldVew = ArrFieldView.indexOf(stepField[fs].InternalName);

      if (indexFieldInput != -1) {
        this.wfStepFieldInput.push(stepField[fs]);

        if (stepField[fs].FieldType == "User") {
          if (isNotNull(stepField[fs].DefaultValue)) {
            let UserDefault = JSON.parse(stepField[fs].DefaultValue);
            Object.assign(this.state, {
              [stepField[fs].InternalName]: {
                UserId: UserDefault.UserId,
                UserTitle: UserDefault.UserTitle,
                UserEmail: UserDefault.UserEmail,
              },
              [`listSearch_` + stepField[fs].InternalName]: [],
            });
          } else {
            Object.assign(this.state, {
              [stepField[fs].InternalName]: {
                UserId: "",
                UserTitle: "",
                UserEmail: "",
              },
              [`listSearch_` + stepField[fs].InternalName]: [],
            });
          }
        } else if (stepField[fs].FieldType == "UserMulti") {
          Object.assign(this.state, {
            [`list_` + stepField[fs].InternalName]: [],
            [`search_` + stepField[fs].InternalName]: "",
            [`listSearch_` + stepField[fs].InternalName]: [],
          });
        } else if (stepField[fs].FieldType == "DateTime") {
          Object.assign(this.state, { [stepField[fs].InternalName]: null });
        } else if (stepField[fs].FieldType == "YesNo") {
          Object.assign(this.state, {
            [stepField[fs].InternalName]: false,
          });
        } else if (
          stepField[fs].FieldType == "CheckBox" ||
          stepField[fs].FieldType == "RadioButton"
        ) {
          let arrCheck = [];
          const arrChoice = stepField[fs].ObjSPField.ObjField.ChoiceField;
          for (let inChoice = 0; inChoice < arrChoice.length; inChoice++) {
            arrCheck.push({ isChecked: false, Value: arrChoice[inChoice] });
          }
          Object.assign(this.state, {
            [stepField[fs].InternalName]: arrCheck,
          });
        } else if (stepField[fs].FieldType == "SPLinkWF") {
          this.listFieldSPLink.push(stepField[fs]);

          Object.assign(this.state, {
            [stepField[fs].InternalName]: [],
            [stepField[fs].InternalName + "|SearchWorkflow"]: [],
            [stepField[fs].InternalName + "|DateStart"]: new Date(
              moment(new Date())
                .subtract(30, "day")
                .hours(0)
                .minutes(0)
                .seconds(0)
                .toDate()
            ),
            [stepField[fs].InternalName + "|DateEnd"]: new Date(
              moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
            ),
          });

          Object.assign(this.state, {
            [stepField[fs].InternalName + "|WFCode"]: CheckNull(
              stepField[fs].ObjSPField.ObjField.ObjSPLink.wfTableCode
            ),
            [stepField[fs].InternalName + "|WFId"]: CheckNull(
              stepField[fs].ObjSPField.ObjField.ObjSPLink.wfTableId
            ),
          });
        } else {
          if (isNotNull(stepField[fs].DefaultValue)) {
            Object.assign(this.state, {
              [stepField[fs].InternalName]: stepField[fs].DefaultValue,
            });
          } else {
            Object.assign(this.state, { [stepField[fs].InternalName]: "" });
          }
        }
      }
      if (indexFieldVew != -1) {
        this.wfStepField.push(stepField[fs]);
      }

      if (
        stepField[fs].FieldType == "User" ||
        stepField[fs].FieldType == "UserMulti"
      ) {
        strExpand += "," + stepField[fs].InternalName;
        strSelect +=
          "," +
          stepField[fs].InternalName +
          "/Id," +
          stepField[fs].InternalName +
          "/Title," +
          stepField[fs].InternalName +
          "/Name";
        strFilter +=
          ` or ` + stepField[fs].InternalName + `/Id eq ` + this.currentUser.Id;
      } else {
        strSelect += "," + stepField[fs].InternalName;
      }
    }

    this.WFStepFieldAdd = [];
    ArrFieldInput.map((fields) => {
      let checkField = stepField.find(
        (fs) => fs.InternalName == fields.InternalName
      );
      if (isNotNull(checkField)) {
        let newField = returnObject(checkField);
        Object.assign(newField, { ConfigField: fields });
        if (fields.IsFirstColumn) {
          this.WFStepFieldAdd.push([newField]);
        } else {
          if (this.WFStepFieldAdd.length > 0) {
            let arrFieldIndex = returnArray(
              this.WFStepFieldAdd[this.WFStepFieldAdd.length - 1]
            );
            let totalColspan = 0;
            arrFieldIndex.map((col) => {
              totalColspan += CheckNullSetZero(col.ConfigField.Colspan);
            });
            if (totalColspan + CheckNullSetZero(fields.Colspan) > 12) {
              this.WFStepFieldAdd.push([newField]);
            } else {
              arrFieldIndex.push(newField);
              this.WFStepFieldAdd[
                this.WFStepFieldAdd.length - 1
              ] = arrFieldIndex;
            }
          } else {
            this.WFStepFieldAdd.push([newField]);
          }
        }
      }
    });
    
    this.WFStepFieldView = [];
    ArrFieldView.map((fields) => {
      let checkFieldView = stepField.find(
        (fs) => fs.InternalName == fields.InternalName
      );
      if (isNotNull(checkFieldView)) {
        let newField = returnObject(checkFieldView);
        Object.assign(newField, { ConfigField: fields });
        if (fields.IsFirstColumn) {
          this.WFStepFieldView.push([newField]);
        } else {
          if (this.WFStepFieldView.length > 0) {
            let arrFieldIndex = returnArray(
              this.WFStepFieldView[this.WFStepFieldView.length - 1]
            );
            let totalColspan = 0;
            arrFieldIndex.map((col) => {
              totalColspan += CheckNullSetZero(col.ConfigField.Colspan);
            });
            if (totalColspan + CheckNullSetZero(fields.Colspan) > 12) {
              this.WFStepFieldView.push([newField]);
            } else {
              arrFieldIndex.push(newField);
              this.WFStepFieldView[
                this.WFStepFieldView.length - 1
              ] = arrFieldIndex;
            }
          } else {
            this.WFStepFieldView.push([newField]);
          }
        }
      }
    });
    console.log(this.WFStepFieldView);

    let itemDetail = await this.GetDetailItem(strSelect, strExpand);
    this.setState({ detailItem: itemDetail });
    if (isNotNull(itemDetail.ObjSubWF)) {
      this.ArraySubProcessView = await shareService.loadInfoSub(
        itemDetail.ObjSubWF
      );
      // console.log(this.ArraySubProcessView);
    }
    for (let subWF = 0; subWF < itemDetail.ObjSubWF.length; subWF++) {
      Object.assign(this.ArraySubProcessView[subWF], {
        SLA: itemDetail.ObjSubWF[subWF].wfTable.SLA,
      });
      let SLAByStreamSub = 0;
      let realisticSLASub = 0;
      if (this.ArraySubProcessView[subWF].HistoryStep.length > 1) {
        console.log(this.ArraySubProcessView[subWF].HistoryStep);
        this.ArraySubProcessView[subWF].HistoryStep.filter(
          (y) => y.indexStep != itemDetail.ObjSubWF[subWF].indexStep
        ).map((k) => {
          SLAByStreamSub += k.SLA;
        });
        let arrHistoryStepSub = [];
        this.ArraySubProcessView[subWF].HistoryStep.map((historySub, index) => {
          let stepHSub = loadReportStepSLA(
            historySub,
            this.ArraySubProcessView[subWF].wfStepTable
          );
          arrHistoryStepSub.push(stepHSub);
        });
        arrHistoryStepSub.map((h) => {
          realisticSLASub += parseFloat(h.RealisticSLA);
        });
      }
      Object.assign(this.ArraySubProcessView[subWF], {
        SLAByStreamSub: SLAByStreamSub,
      });
      Object.assign(this.ArraySubProcessView[subWF], {
        realisticSLASub: realisticSLASub,
      });
    }
    if (isNotNull(itemDetail.HistoryStep)) {
      let arraySubInform = await this.loadConfigInformSub(
        itemDetail.HistoryStep,
        this.wfStepTable,
        this.indexStep,
        itemDetail.StatusStep,
        itemDetail.ObjSubWF
      );
      // console.log(arraySubInform);
      this.setState({ ArrayInformSubProcess: arraySubInform });

      let arrayHistoryStep = returnArray(itemDetail.HistoryStep);
      arrayHistoryStep.map((history, index) => {
        if (index > 0) {
          let stepH = loadReportStepSLA(history, this.wfStepTable);
          this.ArrayHistoryStep.push(stepH);
        } else {
          let historyStepOld = returnObject(history);
          Object.assign(historyStepOld, { RealisticSLA: 0 });
          this.ArrayHistoryStep.push(historyStepOld);
        }
      });
      if (this.ArrayHistoryStep.length > 0) {
        this.ArrayHistoryStep.map((y) => {
          if (isNotNull(y.RealisticSLA)) {
            this.realisticSLA += parseFloat(y.RealisticSLA);
          }
        });
      }
      // console.log(this.ArrayHistoryStep);
    }

    // console.log(this.objStepParentConfig);
    // console.log(strFilter);
    const checkView = await this.CheckViewRequest(strFilter);
    // console.log(checkView);

    const checkComment = await this.CheckViewComment();
    // console.log(checkComment);

    const checkPermissView = await this.checkPermissionView(itemDetail);
    // console.log(checkView);

    let itemDetailHistory = await this.GetDetailHistory(
      this.WFTable.WFId,
      this.ItemIndex,
      this.indexStep
    );
    // console.log(itemDetailHistory);
    if (
      isNotNull(itemDetailHistory) &&
      ((this.permissionOfUser.Approve &&
        this.ArrButtonApprove.findIndex((btn) => btn == "Approval") != -1) ||
        (this.permissionOfUser.Submit &&
          this.ArrButtonApprove.findIndex((btn) => btn == "Submit") != -1) ||
        (this.permissionOfUser.Save &&
          this.ArrButtonApprove.findIndex((btn) => btn == "Save") != -1) ||
        (this.permissionOfUser.ReAssigment &&
          this.ArrButtonApprove.findIndex((btn) => btn == "ReAssign") != -1) ||
        (this.permissionOfUser.Reject &&
          this.ArrButtonApprove.findIndex((btn) => btn == "Reject") != -1) ||
        (this.permissionOfUser.MoveTo &&
          this.ArrButtonApprove.findIndex((btn) => btn == "BackStep") != -1))
    ) {
      this.WFHistoryId = itemDetailHistory.HistoryId;
      this.setState({
        isForm: true,
        detailHistory: itemDetailHistory,
        isFormApprove: true,
      });

      // load thông tin cũ đã có trong request lên form nhập bước hiện tại
      if (isNotNull(ArrFieldInput)) {
        ArrFieldInput.map((item) => {
          const field = stepField.find((x) => x.InternalName == item);
          // console.log(this.state)
          const data = itemDetail[item];
          if (isNotNull(data)) {
            if (field.FieldType == "UserMulti") {
              this.setState({ [`list_` + item]: data });
            } else {
              this.setState({ [item]: data });
            }
          }
          // console.log(this.state);
        });
      }

      this.ArrayStatusStepLine = await shareService.GetArrayConfigStepLine(
        this.indexStep,
        this.wfStepTable,
        this.wfStepFieldInput,
        this.state,
        this.state.detailItem,
        this.currentUser,
        this.WFTable.WFIndexStep,
        isNotNull(this.state.detailItem.HistoryStep)
          ? this.state.detailItem.HistoryStep
          : []
      );
      this.SLAByStream = 0;
      let arrSLAIndex = [];
      for (let i = 1; i < this.ArrayStatusStepLine.length; i++) {
        if (arrSLAIndex.indexOf(this.ArrayStatusStepLine[i].indexStep) == -1) {
          this.SLAByStream += this.ArrayStatusStepLine[i].SLAStep;
          arrSLAIndex.push(this.ArrayStatusStepLine[i].indexStep);
        }
      }
      // console.log(this.ArrayStatusStepLine);

      const wfComment = await this.GetComment();
      // console.log(wfComment);

      this.setState({
        ArrStatusStepLine: this.ArrayStatusStepLine,
        listComments: wfComment,
      });

      let checkMapUser = await shareService.checkGetMapUserNextStep(
        this.indexStep,
        this.wfStepTable,
        this.wfStepFieldAll,
        this.state,
        this.state.detailItem,
        this.currentUser.Id,
        this.WFTable.WFIndexStep
      );
      console.log(checkMapUser);
      this.setState({
        UserApprovalStep: checkMapUser.UserApprovalNextStep,
        listSelect_UserApprovalStep: checkMapUser.listUserApprovalNextStep,
        isUserApprovalStep: checkMapUser.isApproveNextStep,
        IsEditApproverStep: checkMapUser.IsEditApproval,
        TypeUserApproval: checkMapUser.TypeUserApproval,
        NameGroup: checkMapUser.NameGroup,
      });

      this.listBackStep = this.wfStepTable.find(
        (x) => x.indexStep == itemDetail.indexStep
      );
      if (isNotNull(this.listBackStep.ObjBackStep)) {
        let wfBackStep = [];
        if (this.listBackStep.ObjBackStep.length == 1) {
          let valueBack = this.listBackStep.ObjBackStep[0];
          let backStep = this.wfStepTable.find((y) => y.indexStep == valueBack);
          if (isNotNull(backStep) && CheckNullSetZero(valueBack) > 0) {
            wfBackStep.push(backStep);

            if (valueBack == 1) {
              await this.setState({
                BackStep: valueBack,
                UserApproveBackStep: itemDetail.UserRequest,
                listSelect_UserApproveBackStep: [itemDetail.UserRequest],
                IsEditApproverBackStep: false,
              });
            } else if (valueBack > this.indexStep) {
              let checkMapUser = await shareService.GetMapUserApproverNextStep(
                valueBack,
                this.wfStepTable,
                this.state.detailItem,
                this.currentUser.Id,
                this.WFTable.WFIndexStep
              );
              await this.setState({
                BackStep: valueBack,
                UserApproveBackStep: checkMapUser.UserApprovalNextStep,
                listSelect_UserApproveBackStep:
                  checkMapUser.listUserApprovalNextStep,
                IsEditApproverBackStep: checkMapUser.IsEditApproval,
              });
            } else {
              let historyStep = itemDetail.HistoryStep;
              const arrHistoryStep = historyStep.filter(
                (ht) => ht.indexStep == valueBack
              );
              if (arrHistoryStep.length > 0) {
                await this.setState({
                  BackStep: valueBack,
                  UserApproveBackStep:
                    arrHistoryStep[arrHistoryStep.length - 1].UserApproval,
                  listSelect_UserApproveBackStep: [
                    arrHistoryStep[arrHistoryStep.length - 1].UserApproval,
                  ],
                  IsEditApproverBackStep: false,
                });
              } else {
                let checkMapUser = await shareService.GetMapUserApproverNextStep(
                  valueBack,
                  this.wfStepTable,
                  this.state.detailItem,
                  this.currentUser.Id,
                  this.WFTable.WFIndexStep
                );
                await this.setState({
                  BackStep: valueBack,
                  UserApproveBackStep: checkMapUser.UserApprovalNextStep,
                  listSelect_UserApproveBackStep:
                    checkMapUser.listUserApprovalNextStep,
                  IsEditApproverBackStep: checkMapUser.IsEditApproval,
                });
              }
            }
          } else {
            await this.setState({
              BackStep: 0,
            });
          }
        } else {
          this.listBackStep.ObjBackStep.map((x) => {
            if (isNotNull(this.wfStepTable.find((y) => y.indexStep == x))) {
              wfBackStep.push(this.wfStepTable.find((y) => y.indexStep == x));
            }
          });
        }
        this.setState({ wfBackStep: wfBackStep });
      }

      let fieldSPLink1 = new Set(ArrFieldView);
      let fieldSPLink2 = stepField.filter(
        (fsp) => fsp.FieldType == objField.SPLinkWF
      );
      let fieldSPLink = fieldSPLink2.filter((item) =>
        fieldSPLink1.has(item.InternalName)
      );
      for (let fspl1 = 0; fspl1 < fieldSPLink.length; fspl1++) {
        if (
          this.listFieldSPLink.findIndex(
            (lf) => lf.InternalName == fieldSPLink[fspl1].InternalName
          ) == -1
        ) {
          this.listFieldSPLink.push(fieldSPLink[fspl1]);
        }
      }
      // console.log(this.listFieldSPLink);
      for (let fspl2 = 0; fspl2 < this.listFieldSPLink.length; fspl2++) {
        // const textField = this.listFieldSPLink[
        //   fspl2
        // ].ObjSPField.TextField.split("|");
        let textField = this.listFieldSPLink[fspl2].ObjSPField.ObjField
          .ObjSPLink.wfTableCode;
        await this.selectItemRequest(
          textField,
          this.listFieldSPLink[fspl2].InternalName
        );
      }
    } else {
      this.WFHistoryId = await this.GetWFHistoryID(
        this.WFTable.WFId,
        this.ItemIndex
      );

      let checkInform = false;
      let UserDefaultInform = this.wfStepTable.find(
        (x) => x.indexStep == itemDetail.indexStep
      ).ObjEmailCfg.EmailSendInform;
      if (
        UserDefaultInform.ObjUserDefault.length > 0 &&
        UserDefaultInform.IsActive == true
      ) {
        const check = UserDefaultInform.ObjUserDefault.findIndex(
          (x) => x.UserId == this.currentUser.Id
        );
        if (check >= 0) {
          checkInform = true;
        }
      }

      if (
        checkView ||
        checkComment ||
        checkInform ||
        checkPermissView ||
        this.permissionOfUser.View
      ) {
        this.setState({ detailItem: itemDetail, isForm: true });

        // load thông tin cũ đã có trong request lên form nhập bước hiện tại
        if (isNotNull(ArrFieldInput)) {
          ArrFieldInput.map((item) => {
            const field = stepField.find((x) => x.InternalName == item);
            // console.log(this.state);
            const data = itemDetail[item];
            if (isNotNull(data)) {
              if (field.FieldType == "UserMulti") {
                this.setState({ [`list_` + item]: data });
              } else {
                this.setState({ [item]: data });
              }
            }
            // console.log(this.state);
          });
        }

        this.ArrayStatusStepLine = await shareService.GetArrayConfigStepLine(
          this.indexStep,
          this.wfStepTable,
          this.wfStepFieldInput,
          this.state,
          this.state.detailItem,
          this.currentUser,
          this.WFTable.WFIndexStep,
          isNotNull(this.state.detailItem.HistoryStep)
            ? this.state.detailItem.HistoryStep
            : []
        );
        console.log(this.ArrayStatusStepLine);
        this.SLAByStream = 0;
        let arrSLAIndex = [];
        for (let i = 1; i < this.ArrayStatusStepLine.length; i++) {
          if (
            arrSLAIndex.indexOf(this.ArrayStatusStepLine[i].indexStep) == -1
          ) {
            this.SLAByStream += this.ArrayStatusStepLine[i].SLAStep;
            arrSLAIndex.push(this.ArrayStatusStepLine[i].indexStep);
          }
        }
        const wfComment = await this.GetComment();
        // console.log(wfComment);

        this.setState({
          ArrStatusStepLine: this.ArrayStatusStepLine,
          listComments: wfComment,
        });

        let checkMapUser = await shareService.checkGetMapUserNextStep(
          this.indexStep,
          this.wfStepTable,
          this.wfStepFieldAll,
          this.state,
          this.state.detailItem,
          this.currentUser.Id,
          this.WFTable.WFIndexStep
        );

        this.setState({
          UserApprovalStep: checkMapUser.UserApprovalNextStep,
          listSelect_UserApprovalStep: checkMapUser.listUserApprovalNextStep,
          isUserApprovalStep: checkMapUser.isApproveNextStep,
          IsEditApproverStep: checkMapUser.IsEditApproval,
          TypeUserApproval: checkMapUser.TypeUserApproval,
          NameGroup: checkMapUser.NameGroup,
        });

        let fieldSPLink1 = new Set(ArrFieldView);
        let fieldSPLink2 = stepField.filter(
          (fsp) => fsp.FieldType == objField.SPLinkWF
        );
        let fieldSPLink = fieldSPLink2.filter((item) =>
          fieldSPLink1.has(item.InternalName)
        );
        for (let fspl1 = 0; fspl1 < fieldSPLink.length; fspl1++) {
          if (
            this.listFieldSPLink.findIndex(
              (lf) => lf.InternalName == fieldSPLink[fspl1].InternalName
            ) == -1
          ) {
            this.listFieldSPLink.push(fieldSPLink[fspl1]);
          }
        }
        // console.log(this.listFieldSPLink);
        for (let fspl2 = 0; fspl2 < this.listFieldSPLink.length; fspl2++) {
          // const textField = this.listFieldSPLink[
          //   fspl2
          // ].ObjSPField.TextField.split("|");
          let textField = this.listFieldSPLink[fspl2].ObjSPField.ObjField
            .ObjSPLink.wfTableCode;
          await this.selectItemRequest(
            textField,
            this.listFieldSPLink[fspl2].InternalName
          );
        }
      } else {
        this.setState({
          textPermiss: "Bạn không có quyền truy cập yêu cầu này",
          isForm: false,
        });
      }
    }
    this.hideLoadingPage();
    // console.log(this.state);
  }

  async selectItemRequest(WFCode, InternalName) {
    let objDetailItem, arrSPLink;
    let isShow = { isDetail: false, isApprove: false };
    if (
      this.state.detailItem[InternalName] == undefined &&
      this.state[InternalName] == undefined
    ) {
      return;
    }
    if (this.state.detailItem[InternalName] != undefined) {
      objDetailItem = returnObject(this.state.detailItem);
      arrSPLink = returnArray(this.state.detailItem[InternalName]);
      isShow.isDetail = true;
    }
    if (this.state[InternalName] != undefined) {
      arrSPLink = returnArray(this.state[InternalName]);
      isShow.isApprove = true;
    }

    // if (this.state.detailItem[InternalName] != undefined) {
    // let objDetailItem = returnObject(this.state.detailItem);
    // let arrSPLink = returnArray(objDetailItem[InternalName]);
    for (let index = 0; index < arrSPLink.length; index++) {
      let objSPLink = returnObject(arrSPLink[index]);

      const wfTitle = await shareService.GetWFTable(objSPLink.WFId);
      Object.assign(objSPLink, { WFTitle: CheckNull(wfTitle.WFTitle) });

      Object.assign(objSPLink, {
        WFCode: WFCode,
        StatusSendEmail: { isFinish: false, Status: 0 },
      });

      const listStep = await shareService.GetWFStepTable(objSPLink.WFId);
      Object.assign(objSPLink, { wfStepTable: listStep });

      const listField = await shareService.GetWFFormField(objSPLink.WFId);
      Object.assign(objSPLink, { wfFieldTable: listField });

      const stepN = await this.GetIndexStepRequest(
        WFCode,
        objSPLink.ItemId,
        objSPLink.indexStep
      );
      if (CheckNullSetZero(stepN) > 0) {
        objSPLink.indexStep = stepN;
      }

      let arrFieldView = [],
        arrFieldInput = [],
        arrButtonApprove = [];
      const stepIndex1 = listStep.find(
        (st) => st.indexStep == objSPLink.indexStep
      );
      let wfBackStepLink = [];
      let arrwfBackStep = [];
      if (isNotNull(stepIndex1.ObjBackStep)) {
        stepIndex1.ObjBackStep.map((x) => {
          if (isNotNull(listStep.find((y) => y.indexStep == x))) {
            wfBackStepLink.push(listStep.find((y) => y.indexStep == x));
          }
        });
        arrwfBackStep = stepIndex1.ObjBackStep;
      }
      let detailInput = {
        isFormApprove: false,
        ReasonStep: "",
        wfBackStep: wfBackStepLink,
        BackStep: "",
        isUserApprovalStep: false,
        IsEditApproverStep: false,
        TypeUserApproval: "",
        NameGroup: "",
        UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
        listSearch_UserApprovalStep: [],
        listSelect_UserApprovalStep: [],
        IsEditApproverBackStep: false,
        UserApproveBackStep: { UserId: "", UserTitle: "", UserEmail: "" },
        listSearch_UserApproveBackStep: [],
        listSelect_UserApproveBackStep: [],
        UserReAssign: { UserId: "", UserTitle: "", UserEmail: "" },
        listSearch_UserReAssign: [],
        wfArrayBackStep: arrwfBackStep,
      };
      if (isNotNull(stepIndex1)) {
        let FieldInput = stepIndex1.ObjFieldStep.FieldInput;
        arrButtonApprove = stepIndex1.btnAction;
        let FieldView = new Set(stepIndex1.ObjFieldStep.FieldView);

        arrFieldView = listField.filter((item) =>
          FieldView.has(item.InternalName)
        );
        for (let fi = 0; fi < FieldInput.length; fi++) {
          for (let fl = 0; fl < listField.length; fl++) {
            if (listField[fl].InternalName == FieldInput[fi]) {
              arrFieldInput.push(listField[fl]);
              if (listField[fl].FieldType == "User") {
                if (isNotNull(listField[fl].DefaultValue)) {
                  let UserDefault = JSON.parse(listField[fl].DefaultValue);
                  Object.assign(detailInput, {
                    [listField[fl].InternalName]: {
                      UserId: UserDefault.UserId,
                      UserTitle: UserDefault.UserTitle,
                      UserEmail: UserDefault.UserEmail,
                    },
                    [`listSearch_` + listField[fl].InternalName]: [],
                  });
                } else {
                  Object.assign(detailInput, {
                    [listField[fl].InternalName]: {
                      UserId: "",
                      UserTitle: "",
                      UserEmail: "",
                    },
                    [`listSearch_` + listField[fl].InternalName]: [],
                  });
                }
              } else if (listField[fl].FieldType == "UserMulti") {
                Object.assign(detailInput, {
                  [`list_` + listField[fl].InternalName]: [],
                  [`search_` + listField[fl].InternalName]: "",
                  [`listSearch_` + listField[fl].InternalName]: [],
                });
              } else if (listField[fl].FieldType == "DateTime") {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: null,
                });
              } else if (listField[fl].FieldType == "YesNo") {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: false,
                });
              } else if (
                listField[fl].FieldType == "CheckBox" ||
                listField[fl].FieldType == "RadioButton"
              ) {
                let arrCheck = [];
                const arrChoice = listField[fl].ObjSPField.ObjField.ChoiceField;
                for (
                  let inChoice = 0;
                  inChoice < arrChoice.length;
                  inChoice++
                ) {
                  arrCheck.push({
                    isChecked: false,
                    Value: arrChoice[inChoice],
                  });
                }
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: arrCheck,
                });
              } else {
                if (isNotNull(listField[fl].DefaultValue)) {
                  Object.assign(detailInput, {
                    [listField[fl].InternalName]: listField[fl].DefaultValue,
                  });
                } else {
                  Object.assign(detailInput, {
                    [listField[fl].InternalName]: "",
                  });
                }
              }
              break;
            }
          }
        }
        FieldInput = new Set(stepIndex1.ObjFieldStep.FieldInput);
        arrFieldInput = listField.filter((item) =>
          FieldInput.has(item.InternalName)
        );
      } else {
        const stepIndex2 = listStep.find((st) => st.indexStep == 1);
        if (isNotNull(stepIndex2)) {
          let FieldView = new Set(stepIndex2.ObjFieldStep.FieldView);
          arrFieldView = listField.filter((item) =>
            FieldView.has(item.InternalName)
          );
        }
      }
      Object.assign(objSPLink, {
        FieldView: arrFieldView,
        FieldInput: arrFieldInput,
        ButtonApprove: arrButtonApprove,
      });
      const detailItemRequest = await this.GetDetailItemRequest(
        arrFieldView,
        WFCode,
        objSPLink.ItemId
      );

      arrFieldInput.map((item) => {
        const data = detailItemRequest[item.InternalName];
        if (isNotNull(data)) {
          if (item.FieldType == "UserMulti") {
            detailInput[`list_` + item.InternalName] = data;
          } else {
            detailInput[item.InternalName] = data;
          }
        }
      });

      // const checkMapUser = await this.checkGetMapUserSubForm(
      //   objSPLink.indexStep,
      //   listStep,
      //   arrFieldInput,
      //   detailItemRequest,
      //   detailInput
      // );
      // detailInput.UserApprovalStep = checkMapUser.UserApprovalStep;
      // detailInput.listSelect_UserApprovalStep =
      //   checkMapUser.listSearch_UserApprovalStep;
      // detailInput.IsEditApproverStep = checkMapUser.IsEditApprover;
      // detailInput.isUserApprovalStep = checkMapUser.isApproveNext;

      Object.assign(objSPLink, {
        detailRequest: detailItemRequest,
        detailInput: detailInput,
      });

      const detailHistoryRequest = await this.GetDetailHistory(
        objSPLink.WFId,
        objSPLink.ItemId,
        objSPLink.indexStep
      );
      // console.log(detailHistoryRequest);
      Object.assign(objSPLink, { detailHistoryRequest: detailHistoryRequest });

      // console.log(objSPLink);
      arrSPLink[index] = objSPLink;
    }
    console.log(arrSPLink);
    if (isShow.isDetail && isShow.isApprove) {
      objDetailItem[InternalName] = arrSPLink;
      await this.setState({
        detailItem: objDetailItem,
        [InternalName]: arrSPLink,
      });
    } else if (isShow.isDetail) {
      objDetailItem[InternalName] = arrSPLink;
      await this.setState({ detailItem: objDetailItem });
    } else if (isShow.isApprove) {
      await this.setState({ [InternalName]: arrSPLink });
    }
  }

  async GetIndexStepRequest(WFCode, ItemId, indexStep) {
    let step = indexStep;
    await sp.web.lists
      .getByTitle(WFCode)
      .items.getById(ItemId)
      .select("ID,indexStep")
      .get()
      .then((listWF) => {
        if (isNotNull(listWF)) {
          step = CheckNullSetZero(listWF["indexStep"]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return step;
  }

  async GetDetailItemRequest(FieldView, WFCode, ItemId) {
    let detail = {
      ID: "",
      UserRequest: { UserId: "", UserTitle: "", UserEmail: "" },
      UserApproval: { UserId: "", UserTitle: "", UserEmail: "" },
      Reason: "",
      ListUser: [],
      indexStep: "",
      StatusStep: "",
      StatusRequest: "",
      HistoryStep: [],
      ObjParentWF: "",
      ObjSubWF: [],
    };
    let strSelect =
        "ID,UserRequest/Id,UserRequest/Title,UserRequest/Name,UserApproval/Id,UserApproval/Title,UserApproval/Name,ListUser/Id,ListUser/Title,ListUser/Name,indexStep,StatusStep,StatusRequest,HistoryStep,Reason,ObjParentWF,ObjSubWF",
      strExpand = "UserRequest,UserApproval,ListUser";

    for (let inItem = 0; inItem < FieldView.length; inItem++) {
      if (FieldView[inItem].FieldType == "User") {
        Object.assign(detail, {
          [FieldView[inItem].InternalName]: {
            UserId: "",
            UserTitle: "",
            UserEmail: "",
          },
        });
        strSelect +=
          "," +
          FieldView[inItem].InternalName +
          "/Id," +
          FieldView[inItem].InternalName +
          "/Title," +
          FieldView[inItem].InternalName +
          "/Name";
        strExpand += "," + FieldView[inItem].InternalName;
      }
      if (FieldView[inItem].FieldType == "DateTime") {
        Object.assign(detail, { [FieldView[inItem].InternalName]: null });
        strSelect += "," + FieldView[inItem].InternalName;
      }
      if (FieldView[inItem].FieldType == "UserMulti") {
        Object.assign(detail, { [FieldView[inItem].InternalName]: [] });
        strSelect +=
          "," +
          FieldView[inItem].InternalName +
          "/Id," +
          FieldView[inItem].InternalName +
          "/Title," +
          FieldView[inItem].InternalName +
          "/Name";
        strExpand += "," + FieldView[inItem].InternalName;
      } else if (
        FieldView[inItem].FieldType == "CheckBox" ||
        FieldView[inItem].FieldType == "RadioButton"
      ) {
        let arrCheck = [];
        if (isNotNull(FieldView[inItem].ObjSPField.ObjField.ChoiceField)) {
          const array = FieldView[inItem].ObjSPField.ObjField.ChoiceField;
          for (let incheck = 0; incheck < array.length; incheck++) {
            arrCheck.push({ isChecked: false, Value: array[incheck] });
          }
        }
        Object.assign(detail, { [FieldView[inItem].InternalName]: arrCheck });
        strSelect += "," + FieldView[inItem].InternalName;
      } else if (FieldView[inItem].FieldType == "YesNo") {
        Object.assign(detail, { [FieldView[inItem].InternalName]: false });
        strSelect += "," + FieldView[inItem].InternalName;
      } else if (FieldView[inItem].FieldType == objField.SPLinkWF) {
        Object.assign(detail, { [FieldView[inItem].InternalName]: [] });
        strSelect += "," + FieldView[inItem].InternalName;
      } else {
        Object.assign(detail, { [FieldView[inItem].InternalName]: "" });
        strSelect += "," + FieldView[inItem].InternalName;
      }
    }
    await sp.web.lists
      .getByTitle(WFCode)
      .items.getById(ItemId)
      .select(strSelect)
      .expand(strExpand)
      .get()
      .then((listWF) => {
        if (isNotNull(listWF)) {
          if (isNotNull(listWF["UserRequest"])) {
            detail.UserRequest = {
              UserId: listWF["UserRequest"].Id,
              UserTitle: listWF["UserRequest"].Title,
              UserEmail: listWF["UserRequest"].Name.split("|")[2],
            };
          }
          if (isNotNull(listWF["UserApproval"])) {
            detail.UserApproval = {
              UserId: listWF["UserApproval"].Id,
              UserTitle: listWF["UserApproval"].Title,
              UserEmail: listWF["UserApproval"].Name.split("|")[2],
            };
          }
          if (isNotNull(listWF["ListUser"])) {
            listWF["ListUser"].forEach((item) => {
              detail.ListUser.push(item["Id"]);
            });
          }
          detail.indexStep = CheckNullSetZero(listWF["indexStep"]);
          detail.StatusStep = CheckNullSetZero(listWF["StatusStep"]);
          detail.Reason = CheckNull(listWF["Reason"]);

          if (isNotNull(listWF["HistoryStep"])) {
            detail.HistoryStep = JSON.parse(listWF["HistoryStep"]);
          }

          if (
            CheckNullSetZero(listWF["indexStep"]) == 1 &&
            CheckNullSetZero(listWF["StatusStep"]) == 0
          ) {
            detail.StatusRequest = -1;
          } else {
            detail.StatusRequest = CheckNullSetZero(listWF["StatusStep"]);
          }

          if (isNotNull(listWF["ObjParentWF"])) {
            detail.ObjParentWF = JSON.parse(listWF["ObjParentWF"]);
          }
          if (isNotNull(listWF["ObjSubWF"])) {
            detail.ObjSubWF = JSON.parse(listWF["ObjSubWF"]);
          }

          for (let outItem = 0; outItem < FieldView.length; outItem++) {
            if (FieldView[outItem].FieldType == "User") {
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                detail[FieldView[outItem].InternalName] = {
                  UserId: listWF[FieldView[outItem].InternalName].Id,
                  UserTitle: listWF[FieldView[outItem].InternalName].Title,
                  UserEmail: listWF[FieldView[outItem].InternalName].Name,
                };
              }
            } else if (FieldView[outItem].FieldType == "UserMulti") {
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                let userMulti = "";
                listWF[FieldView[outItem].InternalName].forEach((item) => {
                  userMulti += item["Title"] + ", ";
                  detail[FieldView[outItem].InternalName].push({
                    UserId: item["Id"],
                    UserTitle: item["Title"],
                    UserEmail: item["Name"].split("|")[2],
                  });
                });
              }
            } else if (FieldView[outItem].FieldType == "Number") {
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                detail[FieldView[outItem].InternalName] = CheckNullSetZero(
                  listWF[FieldView[outItem].InternalName]
                );
              }
            } else if (FieldView[outItem].FieldType == "DateTime") {
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                detail[FieldView[outItem].InternalName] = moment(
                  listWF[FieldView[outItem].InternalName]
                );
              }
            } else if (FieldView[outItem].FieldType == "RadioButton") {
              const txtRadio = listWF[FieldView[outItem].InternalName];
              if (isNotNull(txtRadio)) {
                for (
                  let ischeck = 0;
                  ischeck < detail[FieldView[outItem].InternalName].length;
                  ischeck++
                ) {
                  if (
                    detail[FieldView[outItem].InternalName][ischeck].Value ==
                    txtRadio
                  ) {
                    detail[FieldView[outItem].InternalName][
                      ischeck
                    ].isChecked = true;
                    break;
                  }
                }
              }
            } else if (FieldView[outItem].FieldType == "CheckBox") {
              const arrCheck = listWF[FieldView[outItem].InternalName];
              if (isNotNull(arrCheck)) {
                for (let index = 0; index < arrCheck.length; index++) {
                  for (
                    let ischeck = 0;
                    ischeck < detail[FieldView[outItem].InternalName].length;
                    ischeck++
                  ) {
                    if (
                      detail[FieldView[outItem].InternalName][ischeck].Value ==
                      arrCheck[index]
                    ) {
                      detail[FieldView[outItem].InternalName][
                        ischeck
                      ].isChecked = true;
                    }
                  }
                }
              }
            } else if (FieldView[outItem].FieldType == "YesNo") {
              detail[FieldView[outItem].InternalName] = CheckNull(
                listWF[FieldView[outItem].InternalName]
              );
            } else if (FieldView[outItem].FieldType == "SPLinkWF") {
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                detail[FieldView[outItem].InternalName] = JSON.parse(
                  listWF[FieldView[outItem].InternalName]
                );
              }
            } else if (FieldView[outItem].FieldType == objField.Hyperlink) {
              let spLink = "";
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                spLink = listWF[FieldView[outItem].InternalName].Url;
              }
              detail[FieldView[outItem].InternalName] = spLink;
            } else if (FieldView[outItem].FieldType == objField.PictureLink) {
              let spLink = "";
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                spLink = listWF[FieldView[outItem].InternalName].Url;
              }
              detail[FieldView[outItem].InternalName] = spLink;
            } else {
              detail[FieldView[outItem].InternalName] = CheckNull(
                listWF[FieldView[outItem].InternalName]
              );
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(detail);
    return detail;
  }

  closeBackPage() {
    if (isNotNull(this.PreviousPage)) {
      // window.location.href = config.pages[this.PreviousPage];
      backToPages(this.PreviousPage);
    } else {
      if (this.state.isFormApprove) {
        window.location.href = config.pages.wfExecution;
      } else {
        // window.location.href = config.pages.wfMyRequest;
        backToPages("MyRequest");
      }
    }
  }

  render() {
    const {
      detailItem,
      isForm,
      AttachmentRequest,
      AttachmentComment,
      isFormApprove,
      ArrStatusStepLine,
      wfBackStep,
      listSearch_UserApprovalStep,
      listSelect_UserApprovalStep,
      listSearch_UserApproveBackStep,
      listSelect_UserApproveBackStep,
      IsEditApproverBackStep,
      IsEditApproverStep,
      ArraySubProcess,
      infoSubProcess,
      isSynchronized,
      ArraySynchronized,
      ArrayAsynchronous,
      isInformSubProcess,
      ArrayInformSubProcess,
    } = this.state;
    // console.log(detailItem["LinkWF"]);
    // console.log(ArrStatusStepLine);
    return (
      <Fragment>
        <Grid item xl={12} xs={12}>
          <Card className="formInput">
            <Grid container alignItems="flex-end" className="mb-30">
              <Grid item sm={8} xs={12} md={6} xl={8}>
                <h3>
                  {isNotNull(this.WFTable.WFTitle)
                    ? this.WFTable.WFTitle
                    : "Chi tiết Yêu cầu"}
                </h3>
              </Grid>
              <Grid item sm={12} xs={12} md={6} xl={4}>
                <div className="btnList pull-right">
                  <Button
                    className="btn bg-secondary"
                    onClick={() => this.closeBackPage()}
                  >
                    <i className="fa fa-times" /> Đóng
                  </Button>
                </div>
              </Grid>
            </Grid>
            {isForm ? (
              <Grid container spacing={3}>
                {this.WFStepFieldView.map((rows, indexRow) => (
                  <Grid
                    container
                    alignItems="flex-end"
                    spacing={3}
                    style={{ margin: 0, marginBottom: "15px" }}
                    key={indexRow}
                  >
{rows.map((field) => {
                  switch (field.FieldType) {
                    case objField.Text:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailItem[field.InternalName]}</p>
                        </Grid>
                      );
                    case objField.TextArea:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {/* <p>{detailItem[field.InternalName]}</p> */}
                          {isNotNull(detailItem[field.InternalName]) ? (
                            <textarea
                              variant="outlined"
                              className="textArea"
                              value={detailItem[field.InternalName]}
                              rows="4"
                              readOnly
                            />
                          ) : (
                            ""
                          )}
                        </Grid>
                      );
                    case objField.Number:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailItem[field.InternalName]}</p>
                        </Grid>
                      );
                    case objField.DateTime:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{formatDate(detailItem[field.InternalName])}</p>
                        </Grid>
                      );
                    case objField.User:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailItem[field.InternalName].UserTitle}</p>
                        </Grid>
                      );
                    case objField.UserMulti:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailItem[field.InternalName].length > 0
                              ? detailItem[field.InternalName].map(
                                  (itemUser) => itemUser.UserTitle + ", "
                                )
                              : ""}
                          </p>
                        </Grid>
                      );
                    case objField.YesNo:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailItem[field.InternalName] ? "Có" : "Không"}
                          </p>
                        </Grid>
                      );
                    case objField.Dropdown:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailItem[field.InternalName]}</p>
                        </Grid>
                      );
                    case objField.RadioButton:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailItem[field.InternalName].length > 0
                              ? detailItem[
                                  field.InternalName
                                ].map((itemCheck) =>
                                  itemCheck.isChecked
                                    ? itemCheck.Value + ", "
                                    : ""
                                )
                              : ""}
                          </p>
                        </Grid>
                      );
                    case objField.CheckBox:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailItem[field.InternalName].length > 0
                              ? detailItem[
                                  field.InternalName
                                ].map((itemCheck) =>
                                  itemCheck.isChecked
                                    ? itemCheck.Value + ", "
                                    : ""
                                )
                              : ""}
                          </p>
                        </Grid>
                      );
                    case objField.SPLinkWF:
                      return (
                        <Grid
                          item
                          sm={12}
                          xs={12}
                          key={field.InternalName}
                          style={{
                            margin: 0,
                            border: "solid 1px blue",
                            marginBottom: "15px",
                          }}
                        >
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {detailItem[field.InternalName].length > 0 ? (
                            field.ObjSPField.ObjField.ObjSPLink.typeSPLink ==
                            "ViewDetail" ? (
                              <Grid item sm={12} xs={12}>
                                {detailItem[field.InternalName].map(
                                  (itemLink, keyLink) => (
                                    <Grid
                                      item
                                      sm={12}
                                      xs={12}
                                      key={keyLink}
                                      style={{
                                        border: "solid 1px green",
                                        marginBottom: "15px",
                                      }}
                                    >
                                      <WFLoadingControl
                                        FieldView={itemLink.FieldView}
                                        detailRequest={itemLink.detailRequest}
                                        wfStepTable={itemLink.wfStepTable}
                                        indexStep={itemLink.indexStep}
                                        Title={itemLink.Title}
                                      />
                                    </Grid>
                                  )
                                )}
                              </Grid>
                            ) : (
                              <Grid item sm={12} xs={12}>
                                <div className="tagName">
                                  {detailItem[field.InternalName].map(
                                    (spLink, keySPLink) => (
                                      <p key={keySPLink} className="wrapName">
                                        <a
                                          href={`${config.pages.wfRequestView}?WFTableId=${spLink.WFId}&ItemIndex=${spLink.ItemId}&indexStep=${spLink.indexStep}`}
                                          target="_blank"
                                          style={{
                                            textDecoration: "underline",
                                          }}
                                        >
                                          {spLink.Title}
                                        </a>
                                      </p>
                                    )
                                  )}
                                </div>
                              </Grid>
                            )
                          ) : (
                            ""
                          )}
                        </Grid>
                      );
                    case objField.Label:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {isNotNull(detailItem[field.InternalName]) ? (
                            <textarea
                              variant="outlined"
                              className="textArea"
                              value={detailItem[field.InternalName]}
                              rows="4"
                              readOnly
                            />
                          ) : (
                            ""
                          )}
                        </Grid>
                      );
                    case objField.Hyperlink:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {isNotNull(detailItem[field.InternalName]) ? (
                            <a
                              style={{ wordBreak: "break-all" }}
                              target="_blank"
                              href={detailItem[field.InternalName]}
                            >
                              {detailItem[field.InternalName]}
                            </a>
                          ) : (
                            ""
                          )}
                        </Grid>
                      );
                    case objField.PictureLink:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {isNotNull(detailItem[field.InternalName]) ? (
                            <a
                              target="_blank"
                              href={detailItem[field.InternalName]}
                            >
                              <img
                                style={{ width: "100px", height: "100px" }}
                                src={detailItem[field.InternalName]}
                              />
                            </a>
                          ) : (
                            ""
                          )}
                        </Grid>
                      );
                    case objField.Average:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailItem[field.InternalName]}</p>
                        </Grid>
                      );
                    case objField.Percent:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {!isNotNull(detailItem[field.InternalName])
                              ? ""
                              : detailItem[field.InternalName] + " %"}
                          </p>
                        </Grid>
                      );
                    default:
                      return (
                        <Grid item sm={CheckNullSetZero(field.ConfigField.Colspan) == 0
                          ? 6
                          : CheckNullSetZero(field.ConfigField.Colspan)} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailItem[field.InternalName]}</p>
                        </Grid>
                      );
                  }
                })}
                </Grid>
                ))}

                {detailItem.UserRequest.UserTitle ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Người yêu cầu</label>
                    <p>{detailItem.UserRequest.UserTitle}</p>
                  </Grid>
                ) : (
                  ""
                )}

                {detailItem.UserApproval.UserTitle ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Người phê duyệt</label>
                    <p>{detailItem.UserApproval.UserTitle}</p>
                  </Grid>
                ) : (
                  ""
                )}

                {detailItem ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Trạng thái</label>
                    <p>
                      <span
                        className={formatStatusLabel(detailItem.StatusRequest)}
                      >
                        {formatStatusText(detailItem.StatusRequest)}
                      </span>
                    </p>
                  </Grid>
                ) : (
                  ""
                )}

                {detailItem ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Lý do</label>
                    <p>{detailItem.Reason}</p>
                  </Grid>
                ) : (
                  ""
                )}
                <Grid item sm={6} xs={12}>
                  <label className="form-label">SLA</label>
                  {this.WFTable.SLA}
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label">
                    SLA theo luồng trạng thái
                  </label>
                  {this.SLAByStream}
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label">SLA thực tế</label>
                  {this.realisticSLA <= this.WFTable.SLA ? (
                    <span className="labelAlert label_success">
                      {this.realisticSLA.toFixed(2)}
                    </span>
                  ) : (
                    <span className="labelAlert label_danger">
                      {this.realisticSLA.toFixed(2)}
                    </span>
                  )}
                </Grid>
                {ArrayInformSubProcess.length == 0 &&
                this.ArraySubProcessView.length == 0 ? (
                  ""
                ) : (
                  <Grid
                    item
                    sm={12}
                    xs={12}
                    style={{ border: "solid 1px blue", marginBottom: "15px" }}
                  >
                    <label className="form-label">Quy trình con</label>
                    {this.ArraySubProcessView.length == 0 ? (
                      ""
                    ) : (
                      <div style={{ marginBottom: "15px" }}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Tên quy trình</TableCell>
                                <TableCell>Loại quy trình</TableCell>
                                <TableCell>Tên yêu cầu</TableCell>
                                <TableCell>Bước hiện tại</TableCell>
                                <TableCell>Người tạo</TableCell>
                                <TableCell>
                                  Bước khởi tạo trên quy trình cha
                                </TableCell>
                                <TableCell>SLA</TableCell>
                                <TableCell>SLA theo luồng trạng thái</TableCell>
                                <TableCell>SLA thực tế</TableCell>
                                <TableCell>Trạng thái</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {this.ArraySubProcessView.map((item, keySub) => (
                                <TableRow key={keySub}>
                                  <TableCell>{keySub + 1}</TableCell>
                                  <TableCell>{item.WFTitle}</TableCell>
                                  <TableCell>
                                    {item.isWaitting ? (
                                      <span
                                        style={{ fontStyle: "italic" }}
                                        className="labelAlert label_success"
                                      >
                                        Quy trình nối tiếp
                                      </span>
                                    ) : (
                                      <span
                                        style={{ fontStyle: "italic" }}
                                        className="labelAlert label_warning"
                                      >
                                        Quy trình song song
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <a
                                      target="_blank"
                                      href={`${config.pages.wfRequestView}?WFTableId=${item.WFId}&ItemIndex=${item.ItemIndex}&indexStep=${item.indexStep}`}
                                    >
                                      {item.Title}
                                    </a>
                                  </TableCell>
                                  <TableCell>
                                    {FindTitleById(
                                      item.wfStepTable,
                                      "indexStep",
                                      item.indexStep,
                                      "Title"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {item.UserRequest.UserTitle}
                                  </TableCell>
                                  <TableCell>
                                    {isNotNull(item.ObjParentWF.createStep)
                                      ? this.wfStepTable.find(
                                          (x) =>
                                            x.indexStep ==
                                            item.ObjParentWF.createStep
                                        ).Title
                                      : this.wfStepTable.find(
                                          (x) =>
                                            x.indexStep ==
                                            this.WFTable.WFIndexStep
                                        ).Title}
                                  </TableCell>
                                  <TableCell>{item.SLA}</TableCell>
                                  <TableCell>{item.SLAByStreamSub}</TableCell>
                                  <TableCell>{item.realisticSLASub}</TableCell>
                                  <TableCell>
                                    <span
                                      className={formatStatusLabel(
                                        item.StatusRequest
                                      )}
                                    >
                                      {formatStatusText(item.StatusRequest)}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    )}

                    {ArrayInformSubProcess.length > 0 ? (
                      <Grid item sm={12} xs={12}>
                        <div className="btnList pull-right">
                          <Button
                            className="btn bg-secondary"
                            onClick={() => this.dialogOpenClose()}
                          >
                            <i className="fa fa-plus" /> Tạo yêu cầu quy trình
                            con
                          </Button>
                        </div>
                      </Grid>
                    ) : (
                      ""
                    )}
                  </Grid>
                )}

                {this.ArrayHistoryStep.length > 0 ? (
                  <Grid
                    item
                    sm={12}
                    xs={12}
                    style={{ border: "solid 1px blue" }}
                  >
                    <label className="form-label">Lịch sử phê duyệt</label>
                    <div>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Người yêu cầu</TableCell>
                              <TableCell>Người xử lý</TableCell>
                              <TableCell>Tên bước</TableCell>
                              <TableCell>Thời gian bắt đầu</TableCell>
                              <TableCell>Thời gian hoàn thành</TableCell>
                              <TableCell>SLA</TableCell>
                              <TableCell>SLA thực tế</TableCell>
                              <TableCell>Lý do</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.ArrayHistoryStep.map((item, keyHis) => (
                              <TableRow key={keyHis}>
                                <TableCell>
                                  {item.UserRequest.UserTitle}
                                </TableCell>
                                <TableCell>
                                  {item.UserApproval.UserTitle}
                                </TableCell>
                                <TableCell>{item.TitleStep}</TableCell>
                                <TableCell>
                                  {isNotNull(item.DateRequest)
                                    ? moment(item.DateRequest).format(
                                        "DD/MM/YYYY HH:mm:ss"
                                      )
                                    : ""}
                                </TableCell>
                                <TableCell>
                                  {isNotNull(item.DateFinish)
                                    ? moment(item.DateFinish).format(
                                        "DD/MM/YYYY HH:mm:ss"
                                      )
                                    : ""}
                                </TableCell>
                                <TableCell>{item.SLA}</TableCell>
                                <TableCell>{item.RealisticSLA}</TableCell>
                                <TableCell>
                                  {CheckNull(item.ReasonStep)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </Grid>
                ) : (
                  ""
                )}
                {ArrStatusStepLine.length > 0 ? (
                  <Grid
                    item
                    sm={12}
                    xs={12}
                    style={{ border: "solid 1px blue", marginTop: "15px" }}
                  >
                    <label className="form-label">Luồng trạng thái</label>
                    <div>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              {ArrStatusStepLine.map((stepLine1, line1) => (
                                <TableCell key={line1}>
                                  {stepLine1.TitleStep}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              {ArrStatusStepLine.map((stepLine2, line2) => (
                                <TableCell key={line2}>
                                  {stepLine2.UserStep}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              {ArrStatusStepLine.map((stepLine3, line3) => (
                                <TableCell key={line3}>
                                  <span className={stepLine3.LabelStep}>
                                    {stepLine3.StatusStep}
                                  </span>
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </Grid>
                ) : (
                  ""
                )}

                {this.isViewAttachments || this.isEditAttachments ? (
                  <Grid item sm={12} xs={12}>
                    <label className="form-label">Tài liệu đính kèm</label>
                    <div>
                      {detailItem.AttachmentFiles.map((attach) => (
                        // <FileAttach urlFile={attach.urlFile} nameFile={attach.name}/>
                        <div key={attach.name}>
                          <FileAttach
                            urlFile={attach.urlFile}
                            nameFile={attach.name}
                            typeOffice={attach.typeOffice}
                            isEditFile={
                              isFormApprove && this.isEditAttachments
                                ? true
                                : false
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </Grid>
                ) : (
                  ""
                )}
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item sm={12} xs={12}>
                  <p>{this.state.textPermiss}</p>
                </Grid>
              </Grid>
            )}
          </Card>

          {/* {isFormApprove && detailItem.indexStep != 1 ? ( */}
          {isFormApprove ? (
            <Card
              title={detailItem.StatusItem == 0 ? "Chỉnh sửa" : "Phê duyệt"}
              className="formInput"
            >
              <Grid container spacing={3}>
                {this.WFStepFieldAdd.map((rows, indexRow) => (
                  <Grid
                    container
                    alignItems="flex-end"
                    spacing={3}
                    style={{ margin: 0, marginBottom: "15px" }}
                    key={indexRow}
                  >
                    {rows.map((field) => {
                      switch (field.FieldType) {
                        case objField.Text:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <TextField
                                variant="outlined"
                                className="textField"
                                fullWidth
                                name={field.InternalName}
                                onChange={this.changeFormInput}
                                value={this.state[field.InternalName]}
                              />
                            </Grid>
                          );

                        case objField.TextArea:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <textarea
                                variant="outlined"
                                className="textArea"
                                rows="3"
                                name={field.InternalName}
                                onChange={this.changeFormInput}
                                value={this.state[field.InternalName]}
                              />
                            </Grid>
                          );

                        case objField.Number:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <TextField
                                variant="outlined"
                                className="textField"
                                type="number"
                                fullWidth
                                name={field.InternalName}
                                onChange={this.changeFormInput}
                                value={this.state[field.InternalName]}
                                disabled={
                                  field.ObjValidation.CalculateCondition
                                    .isCalculate
                                    ? true
                                    : false
                                }
                              />
                            </Grid>
                          );

                        case objField.DateTime:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <MuiPickersUtilsProvider utils={MomentUtils}>
                                <KeyboardDatePicker
                                  fullWidth
                                  name={field.InternalName}
                                  value={this.state[field.InternalName]}
                                  inputVariant="outlined"
                                  onChange={(date) =>
                                    this.changeFormDateTime(
                                      field.InternalName,
                                      date
                                    )
                                  }
                                  format="DD-MM-YYYY"
                                  InputAdornmentProps={{ position: "end" }}
                                  className="datePicker"
                                />
                              </MuiPickersUtilsProvider>
                            </Grid>
                          );

                        case objField.Dropdown:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <FormControl
                                fullWidth
                                className="selectForm"
                                variant="outlined"
                              >
                                <Select
                                  name={field.InternalName}
                                  onChange={(event) =>
                                    this.changeFormInput(event)
                                  }
                                  value={this.state[field.InternalName]}
                                >
                                  <MenuItem value="">--Select--</MenuItem>
                                  {field.ObjSPField.ObjField.ChoiceField.map(
                                    (op) => (
                                      <MenuItem value={op} key={op}>
                                        {op}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                            </Grid>
                          );

                        case objField.User:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <TextField
                                variant="outlined"
                                className="textField"
                                fullWidth
                                placeholder="Tìm kiếm người dùng"
                                name={field.InternalName}
                                onChange={this.changeSearchPeople.bind(
                                  this,
                                  objField.User
                                )}
                                value={this.state[field.InternalName].UserTitle}
                              />
                              {this.state[`listSearch_` + field.InternalName]
                                .length > 0 ? (
                                <div
                                  id="myInputautocomplete"
                                  className="suggesAuto"
                                >
                                  {this.state[
                                    `listSearch_` + field.InternalName
                                  ].map((people) => (
                                    <p
                                      key={people.Key}
                                      className="suggtAutoItem"
                                      onClick={() =>
                                        this.selectSearch(
                                          people.Key,
                                          "User",
                                          field.InternalName
                                        )
                                      }
                                    >
                                      <i className="fa fa-user"></i>{" "}
                                      {people.DisplayText}
                                      {` (${people.Description}`}
                                      {isNotNull(people.EntityData.Title)
                                        ? ` - ${people.EntityData.Title})`
                                        : `)`}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                ""
                              )}
                            </Grid>
                          );

                        case objField.UserMulti:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <TextField
                                variant="outlined"
                                className="textField"
                                fullWidth
                                placeholder="Tìm kiếm người dùng"
                                name={field.InternalName}
                                onChange={this.changeSearchPeople.bind(
                                  this,
                                  objField.UserMulti
                                )}
                                value={
                                  this.state[`search_` + field.InternalName]
                                }
                              />
                              {this.state[`listSearch_` + field.InternalName]
                                .length > 0 ? (
                                <div
                                  id="myInputautocomplete"
                                  className="suggesAuto"
                                >
                                  {this.state[
                                    `listSearch_` + field.InternalName
                                  ].map((people) => (
                                    <p
                                      key={people.Key}
                                      className="suggtAutoItem"
                                      onClick={() =>
                                        this.selectSearch(
                                          people.Key,
                                          "UserMulti",
                                          field.InternalName
                                        )
                                      }
                                    >
                                      <i className="fa fa-user"></i>{" "}
                                      {people.DisplayText}
                                      {` (${people.Description}`}
                                      {isNotNull(people.EntityData.Title)
                                        ? ` - ${people.EntityData.Title})`
                                        : `)`}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                ""
                              )}

                              {this.state[`list_` + field.InternalName].length >
                              0 ? (
                                <div className="tagName">
                                  {this.state[`list_` + field.InternalName].map(
                                    (users) => (
                                      <p
                                        key={users.UserId}
                                        className="wrapName"
                                      >
                                        <a
                                          onClick={() =>
                                            this.removePeople(
                                              users.UserId,
                                              field.InternalName
                                            )
                                          }
                                        >
                                          <i className="fa fa-close text-danger"></i>
                                        </a>{" "}
                                        {users.UserTitle}
                                      </p>
                                    )
                                  )}
                                </div>
                              ) : (
                                ""
                              )}
                            </Grid>
                          );

                        case objField.YesNo:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <FormGroup row>
                                <FormControlLabel
                                  control={
                                    <GreenCheckBox
                                      name={field.InternalName}
                                      onChange={(event) =>
                                        this.changeFormCheckBox("YesNo", event)
                                      }
                                      checked={this.state[field.InternalName]}
                                    />
                                  }
                                />
                              </FormGroup>
                            </Grid>
                          );

                        case objField.RadioButton:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              {this.state[field.InternalName].length > 0 ? (
                                <RadioGroup row>
                                  {this.state[field.InternalName].map(
                                    (check, keyIn) => (
                                      <FormControlLabel
                                        key={keyIn}
                                        control={
                                          <GreenRadio
                                            name={
                                              field.InternalName + `|` + keyIn
                                            }
                                            onClick={(event) =>
                                              this.changeFormCheckBox(
                                                "RadioButton",
                                                event
                                              )
                                            }
                                            value={check.Value}
                                            checked={check.isChecked}
                                          />
                                        }
                                        label={check.Value}
                                      />
                                    )
                                  )}
                                </RadioGroup>
                              ) : (
                                ""
                              )}
                            </Grid>
                          );

                        case objField.CheckBox:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              {this.state[field.InternalName].length > 0 ? (
                                <FormGroup row>
                                  {this.state[field.InternalName].map(
                                    (check, keyIn) => (
                                      <FormControlLabel
                                        key={keyIn}
                                        control={
                                          <GreenCheckBox
                                            name={
                                              field.InternalName + `|` + keyIn
                                            }
                                            onChange={(event) =>
                                              this.changeFormCheckBox(
                                                "CheckBox",
                                                event
                                              )
                                            }
                                            value={check.Value}
                                            checked={check.isChecked}
                                          />
                                        }
                                        label={check.Value}
                                      />
                                    )
                                  )}
                                </FormGroup>
                              ) : (
                                ""
                              )}
                            </Grid>
                          );

                        case objField.SPLinkWF:
                          return (
                            <Grid
                              container
                              alignItems="flex-end"
                              spacing={3}
                              style={{
                                margin: 0,
                                border: "solid 1px blue",
                                marginBottom: "15px",
                              }}
                              key={field.InternalName}
                            >
                              <Grid item sm={2} xs={12}>
                                <label className="form-label">Từ ngày</label>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                  <KeyboardDatePicker
                                    fullWidth
                                    name={field.InternalName + "|DateStart"}
                                    value={
                                      this.state[
                                        field.InternalName + "|DateStart"
                                      ] != ""
                                        ? this.state[
                                            field.InternalName + "|DateStart"
                                          ]
                                        : null
                                    }
                                    inputVariant="outlined"
                                    onChange={(date) =>
                                      this.changeFormDateTime(
                                        field.InternalName + "|DateStart",
                                        date
                                      )
                                    }
                                    placeholder="DD-MM-YYYY"
                                    format="DD-MM-YYYY"
                                    InputAdornmentProps={{ position: "end" }}
                                    className="datePicker"
                                  />
                                </MuiPickersUtilsProvider>
                              </Grid>
                              <Grid item sm={2} xs={12}>
                                <label className="form-label">Đến ngày</label>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                  <KeyboardDatePicker
                                    fullWidth
                                    name={field.InternalName + "|DateEnd"}
                                    value={
                                      this.state[
                                        field.InternalName + "|DateEnd"
                                      ] != ""
                                        ? this.state[
                                            field.InternalName + "|DateEnd"
                                          ]
                                        : null
                                    }
                                    inputVariant="outlined"
                                    onChange={(date) =>
                                      this.changeFormDateTime(
                                        field.InternalName + "|DateEnd",
                                        date
                                      )
                                    }
                                    placeholder="DD-MM-YYYY"
                                    format="DD-MM-YYYY"
                                    InputAdornmentProps={{ position: "end" }}
                                    className="datePicker"
                                  />
                                </MuiPickersUtilsProvider>
                              </Grid>
                              <Grid item sm={2} xs={12}>
                                <Button
                                  className="btn bg-primary"
                                  onClick={() =>
                                    this.searchWFRequest(
                                      this.state[
                                        field.InternalName + "|WFCode"
                                      ],
                                      this.state[field.InternalName + "|WFId"],
                                      field.InternalName
                                    )
                                  }
                                >
                                  <span className="icon">
                                    {" "}
                                    <i className="fa fa-save"></i>
                                  </span>{" "}
                                  Tìm kiếm
                                </Button>
                              </Grid>
                              <Grid item sm={6} xs={12}>
                                <label className="form-label">
                                  {field.Title}{" "}
                                  {field.Required == 1 ? (
                                    <span className="required-field">*</span>
                                  ) : (
                                    ""
                                  )}
                                </label>
                                <FormControl
                                  fullWidth
                                  className="selectForm"
                                  variant="outlined"
                                >
                                  <Select
                                    name={field.InternalName}
                                    value=""
                                    onChange={(event) =>
                                      this.changeFormCheckBox("SPLinkWF", event)
                                    }
                                  >
                                    <MenuItem value="">--Select--</MenuItem>
                                    {this.state[
                                      field.InternalName + "|SearchWorkflow"
                                    ].map((itemS, keyS) => (
                                      <MenuItem value={keyS} key={keyS}>
                                        {itemS.Title}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item sm={12} xs={12}>
                                {this.state[field.InternalName].length > 0 ? (
                                  <div className="tagName">
                                    {this.state[field.InternalName].map(
                                      (spLink, keySPLink) => (
                                        <p key={keySPLink} className="wrapName">
                                          <a
                                            onClick={() =>
                                              this.removeSPLink(
                                                keySPLink,
                                                field.InternalName
                                              )
                                            }
                                          >
                                            <i className="fa fa-close text-danger"></i>
                                          </a>{" "}
                                          <a
                                            href={`${config.pages.wfRequestView}?WFTableId=${spLink.WFId}&ItemIndex=${spLink.ItemId}&indexStep=${spLink.indexStep}`}
                                            target="_blank"
                                            style={{
                                              textDecoration: "underline",
                                            }}
                                          >
                                            {spLink.Title}
                                          </a>
                                        </p>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  ""
                                )}
                              </Grid>
                              <Grid item sm={12} xs={12}>
                                {this.state[field.InternalName].length > 0 &&
                                field.ObjSPField.ObjField.ObjSPLink
                                  .typeSPLink == "ViewDetail" ? (
                                  <Grid item sm={12} xs={12}>
                                    {this.state[field.InternalName].map(
                                      (itemLink, keyLink) => (
                                        <Grid
                                          item
                                          sm={12}
                                          xs={12}
                                          key={keyLink}
                                          style={{
                                            border: "solid 1px green",
                                            marginBottom: "15px",
                                          }}
                                        >
                                          <WFLoadingControl
                                            FieldView={itemLink.FieldView}
                                            detailRequest={
                                              itemLink.detailRequest
                                            }
                                            wfStepTable={itemLink.wfStepTable}
                                            indexStep={itemLink.indexStep}
                                            Title={itemLink.Title}
                                          />
                                        </Grid>
                                      )
                                    )}
                                  </Grid>
                                ) : (
                                  ""
                                )}
                              </Grid>
                            </Grid>
                          );

                        case objField.Label:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <textarea
                                variant="outlined"
                                className="textArea"
                                rows="3"
                                name={field.InternalName}
                                onChange={this.changeFormInput}
                                value={this.state[field.InternalName]}
                                readOnly
                              />
                            </Grid>
                          );

                        case objField.Hyperlink:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <textarea
                                variant="outlined"
                                className="textArea"
                                rows="3"
                                name={field.InternalName}
                                onChange={this.changeFormInput}
                                value={this.state[field.InternalName]}
                              />
                            </Grid>
                          );

                        case objField.PictureLink:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label className="form-label">
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <textarea
                                variant="outlined"
                                className="textArea"
                                rows="3"
                                name={field.InternalName}
                                onChange={this.changeFormInput}
                                value={this.state[field.InternalName]}
                              />
                              {CheckNull(this.state[field.InternalName]) !=
                              "" ? (
                                <img src={this.state[field.InternalName]}></img>
                              ) : (
                                ""
                              )}
                            </Grid>
                          );

                        default:
                          return (
                            <Grid
                              item
                              sm={
                                CheckNullSetZero(field.ConfigField.Colspan) == 0
                                  ? 6
                                  : CheckNullSetZero(field.ConfigField.Colspan)
                              }
                              xs={12}
                              key={field.InternalName}
                            >
                              <label>
                                {field.Title}{" "}
                                {field.Required == 1 ? (
                                  <span className="required-field">*</span>
                                ) : (
                                  ""
                                )}
                              </label>
                              <TextField
                                variant="outlined"
                                className="textField"
                                fullWidth
                                name={field.InternalName}
                                onChange={this.changeFormInput}
                                value={this.state[field.InternalName]}
                              />
                            </Grid>
                          );
                      }
                    })}
                  </Grid>
                ))}
                {detailItem.StatusItem == 0 ? (
                  ""
                ) : (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Lý do</label>
                    <textarea
                      variant="outlined"
                      className="textArea"
                      rows="3"
                      name="ReasonStep"
                      onChange={this.changeFormInput}
                      value={this.state.ReasonStep}
                    />
                  </Grid>
                )}
                {!this.state.isUserApprovalStep &&
                this.ArrButtonApprove.findIndex((x) => x == "Approval") !=
                  -1 ? (
                  ""
                ) : (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">
                      Người phê duyệt tiếp theo{" "}
                      <span className="required-field">*</span>
                    </label>
                    {listSelect_UserApprovalStep.length > 1 ? (
                      <FormControl
                        fullWidth
                        className="selectForm"
                        variant="outlined"
                      >
                        <Select
                          onChange={(event) => this.changeFormInput(event)}
                          name="UserApprovalStep"
                          value={this.state.UserApprovalStep.UserId}
                        >
                          <MenuItem value="">--Select--</MenuItem>
                          {listSelect_UserApprovalStep.map((user, index) => (
                            <MenuItem value={user.UserId} key={index}>
                              {user.UserTitle}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <div>
                        <TextField
                          name="UserApprovalStep"
                          variant="outlined"
                          className="textField"
                          fullWidth
                          onChange={this.changeSearchPeople.bind(
                            this,
                            objField.User
                          )}
                          value={this.state.UserApprovalStep.UserTitle}
                          placeholder="Tìm kiếm người dùng"
                          disabled={IsEditApproverStep ? false : true}
                        />
                        {listSearch_UserApprovalStep.length > 0 ? (
                          <div id="myInputautocomplete" className="suggesAuto">
                            {listSearch_UserApprovalStep.map((people) => (
                              <div
                                key={people.Key}
                                className="suggtAutoItem"
                                onClick={() =>
                                  this.selectSearch(
                                    people.Key,
                                    "User",
                                    "UserApprovalStep"
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
                      </div>
                    )}
                  </Grid>
                )}

                {this.ArrButtonApprove.findIndex((x) => x == "ReAssign") !=
                -1 ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">
                      Giao lại cho người khác
                    </label>
                    <TextField
                      variant="outlined"
                      className="textField"
                      fullWidth
                      placeholder="Tìm kiếm người dùng"
                      name="UserReAssign"
                      onChange={this.changeSearchPeople.bind(this, "User")}
                      value={this.state.UserReAssign.UserTitle}
                    />
                    {this.state.listSearch_UserReAssign.length > 0 ? (
                      <div id="myInputautocomplete" className="suggesAuto">
                        {this.state.listSearch_UserReAssign.map((people) => (
                          <p
                            key={people.Key}
                            className="suggtAutoItem"
                            onClick={() =>
                              this.selectSearch(
                                people.Key,
                                "User",
                                "UserReAssign"
                              )
                            }
                          >
                            <i className="fa fa-user"></i>
                            {people.DisplayText}
                            {` (${people.Description}`}
                            {isNotNull(people.EntityData.Title)
                              ? ` - ${people.EntityData.Title})`
                              : `)`}
                          </p>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </Grid>
                ) : (
                  ""
                )}
                {this.ArrButtonApprove.findIndex((x) => x == "BackStep") !=
                  -1 && isNotNull(this.listBackStep.ObjBackStep) ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Chuyển bước</label>

                    {this.listBackStep.ObjBackStep.length == 1 &&
                    wfBackStep.length > 0 ? (
                      <div>
                        <TextField
                          name="BackStep"
                          variant="outlined"
                          className="textField"
                          fullWidth
                          value={wfBackStep[0].Title}
                          disabled={true}
                        />
                      </div>
                    ) : this.listBackStep.ObjBackStep.length == 1 &&
                      wfBackStep.length == 0 ? (
                      <div>
                        <TextField
                          name="BackStep"
                          variant="outlined"
                          className="textField"
                          fullWidth
                          value="Hoàn thành"
                          disabled={true}
                        />
                      </div>
                    ) : (
                      <FormControl
                        fullWidth
                        className="selectForm"
                        variant="outlined"
                      >
                        <Select
                          onChange={(event) => this.changeFormInput(event)}
                          name="BackStep"
                          value={this.state.BackStep}
                        >
                          <MenuItem value="">--Select--</MenuItem>
                          {wfBackStep.length > 0
                            ? wfBackStep.map((op) => (
                                <MenuItem value={op.indexStep} key={op.ID}>
                                  {op.Title}
                                </MenuItem>
                              ))
                            : ""}
                          {this.listBackStep.ObjBackStep.findIndex(
                            (x) => x == 0
                          ) != -1 ? (
                            <MenuItem value="0">Hoàn thành</MenuItem>
                          ) : (
                            ""
                          )}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                ) : (
                  ""
                )}
                {this.ArrButtonApprove.findIndex((x) => x == "BackStep") !=
                  -1 && this.state.BackStep != 0 ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">
                      Người xử lý tại bước chuyển{" "}
                    </label>
                    {listSelect_UserApproveBackStep.length > 1 ? (
                      <FormControl
                        fullWidth
                        className="selectForm"
                        variant="outlined"
                      >
                        <Select
                          onChange={(event) => this.changeFormInput(event)}
                          name="UserApproveBackStep"
                          value={this.state.UserApproveBackStep.UserId}
                        >
                          <MenuItem value="">--Select--</MenuItem>
                          {this.state.listSelect_UserApproveBackStep.map(
                            (user, index) => (
                              <MenuItem value={user.UserId} key={index}>
                                {user.UserTitle}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    ) : (
                      <div>
                        <TextField
                          name="UserApproveBackStep"
                          variant="outlined"
                          className="textField"
                          fullWidth
                          onChange={this.changeSearchPeople.bind(
                            this,
                            objField.User
                          )}
                          value={this.state.UserApproveBackStep.UserTitle}
                          placeholder="Tìm kiếm người dùng"
                          disabled={IsEditApproverBackStep ? false : true}
                        />
                        {listSearch_UserApproveBackStep.length > 0 ? (
                          <div id="myInputautocomplete" className="suggesAuto">
                            {listSearch_UserApproveBackStep.map((people) => (
                              <div
                                key={people.Key}
                                className="suggtAutoItem"
                                onClick={() =>
                                  this.selectSearch(
                                    people.Key,
                                    "User",
                                    "UserApproveBackStep"
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
                      </div>
                    )}
                  </Grid>
                ) : (
                  ""
                )}
                {this.isAttachments ? (
                  <Grid item sm={12} xs={12}>
                    <label className="form-label">Tài liệu đính kèm</label>
                    <div>
                      <Button
                        className="btn bg-info"
                        onClick={() => this.callChangeFile("AttachmentRequest")}
                      >
                        <span className="icon">
                          <i className="fa fa-file"></i>
                        </span>
                        Thêm tập tin
                      </Button>
                      <input
                        hidden
                        onChange={this.changeFile.bind(
                          this,
                          "AttachmentRequest"
                        )}
                        type="file"
                        id="fileUploadRequest"
                      />
                    </div>
                    {AttachmentRequest.length > 0 ? (
                      <div>
                        {AttachmentRequest.map((itemFile, infile) => (
                          <div key={itemFile.name} className="wrapName">
                            <a
                              onClick={() =>
                                this.removeFile(infile, "AttachmentRequest")
                              }
                            >
                              <i className="fa fa-close text-danger"></i>
                            </a>
                            {itemFile.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </Grid>
                ) : (
                  ""
                )}

                <Grid item sm={12} xs={12}>
                  {this.ArrButtonApprove.length > 0
                    ? this.ArrButtonApprove.map((btnApp) => {
                        if (
                          btnApp == "Approval" &&
                          this.permissionOfUser.Approve
                        ) {
                          return (
                            <Button
                              className="btn bg-success"
                              style={{ margin: "5px" }}
                              onClick={() => this.itemApproval()}
                              key={btnApp}
                            >
                              <span className="icon">
                                <i className="fa fa-send"></i>
                              </span>
                              Phê duyệt
                            </Button>
                          );
                        } else if (
                          btnApp == "Submit" &&
                          this.permissionOfUser.Submit
                        ) {
                          return (
                            <Button
                              className="btn bg-success"
                              style={{ margin: "5px" }}
                              onClick={() => this.itemApproval()}
                              key={btnApp}
                            >
                              <span className="icon">
                                <i className="fa fa-send"></i>
                              </span>
                              Gửi đi
                            </Button>
                          );
                        } else if (
                          btnApp == "Reject" &&
                          detailItem.StatusItem != 0 &&
                          this.permissionOfUser.Reject
                        ) {
                          return (
                            <Button
                              className="btn bg-danger"
                              style={{ margin: "5px" }}
                              onClick={() => this.itemReject()}
                              key={btnApp}
                            >
                              <span className="icon">
                                <i className="fa fa-lock"></i>
                              </span>
                              Từ chối
                            </Button>
                          );
                        } else if (
                          btnApp == "ReAssign" &&
                          this.permissionOfUser.ReAssigment
                        ) {
                          return (
                            <Button
                              className="btn bg-warning"
                              style={{ margin: "5px" }}
                              onClick={() => this.itemReAssign()}
                              key={btnApp}
                            >
                              <span className="icon">
                                <i className="fa fa-arrow-circle-left"></i>
                              </span>
                              Giao lại
                            </Button>
                          );
                        } else if (
                          btnApp == "BackStep" &&
                          this.permissionOfUser.MoveTo
                        ) {
                          return (
                            <Button
                              className="btn badge-default"
                              style={{ margin: "5px" }}
                              onClick={() => this.itemBackStep()}
                              key={btnApp}
                            >
                              <span className="icon">
                                <i className="fa fa-arrow-circle-right"></i>
                              </span>
                              Chuyển bước
                            </Button>
                          );
                        } else if (
                          btnApp == "Save" &&
                          this.permissionOfUser.Save
                        ) {
                          return (
                            <Button
                              className="btn bg-primary"
                              style={{ margin: "5px" }}
                              onClick={() => this.itemSave()}
                              key={btnApp}
                            >
                              <span className="icon">
                                <i className="fa fa-save"></i>
                              </span>
                              Lưu
                            </Button>
                          );
                        } else if (
                          btnApp == "Reset" &&
                          detailItem.StatusItem == 0
                        ) {
                          return (
                            <Button
                              className="btn bg-secondary"
                              onClick={() => this.resetItem()}
                              key={btnApp}
                            >
                              {" "}
                              <span className="icon">
                                <i className="fa fa-refresh "></i>
                              </span>
                              Làm mới
                            </Button>
                          );
                        }
                      })
                    : ""}
                  {ArrayAsynchronous.length > 0 ? (
                    <Button
                      className="btn bg-success"
                      style={{ margin: "5px" }}
                      onClick={() => this.startSubProcess()}
                    >
                      <span className="icon">
                        <i className="fa fa-send"></i>
                      </span>
                      Khởi tạo quy trình con
                    </Button>
                  ) : (
                    ""
                  )}
                </Grid>
              </Grid>
            </Card>
          ) : (
            ""
          )}

          {isForm ? (
            <Card className="formInput" title="Bình luận">
              <Grid container spacing={3}>
                <Grid item sm={6} xs={12}>
                  <label className="form-label">Thông báo cho</label>
                  <TextField
                    variant="outlined"
                    className="textField"
                    fullWidth
                    placeholder="Tìm kiếm người dùng"
                    name="AssignToComment"
                    onChange={this.changeSearchPeople.bind(this, "UserMulti")}
                    value={this.state.search_AssignToComment}
                  />
                  {this.state.listSearch_AssignToComment.length > 0 ? (
                    <div id="myInputautocomplete" className="suggesAuto">
                      {this.state.listSearch_AssignToComment.map((people) => (
                        <p
                          key={people.Key}
                          className="suggtAutoItem"
                          onClick={() =>
                            this.selectSearch(
                              people.Key,
                              "UserMulti",
                              "AssignToComment"
                            )
                          }
                        >
                          <i className="fa fa-user"></i>
                          {people.DisplayText}
                          {` (${people.Description}`}
                          {isNotNull(people.EntityData.Title)
                            ? ` - ${people.EntityData.Title})`
                            : `)`}
                        </p>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                  {this.state.list_AssignToComment.length > 0 ? (
                    <div className="tagName">
                      {this.state.list_AssignToComment.map((users) => (
                        <p key={users.UserId} className="wrapName">
                          <a
                            onClick={() =>
                              this.removePeople(users.UserId, "AssignToComment")
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
                </Grid>

                <Grid item sm={12} xs={12}>
                  <label className="form-label">
                    Nội dung <span className="required-field">*</span>
                  </label>
                  <textarea
                    variant="outlined"
                    className="textArea"
                    rows="4"
                    name="Chat_Comments"
                    onChange={this.changeFormInput}
                    value={this.state.Chat_Comments}
                  />
                </Grid>

                <Grid item sm={12} xs={12}>
                  <label className="form-label">Tài liệu đính kèm</label>
                  <div>
                    <Button
                      className="btn bg-info"
                      onClick={() => this.callChangeFile("AttachmentComment")}
                    >
                      <span className="icon">
                        <i className="fa fa-file"></i>
                      </span>
                      Thêm tập tin
                    </Button>
                    <input
                      hidden
                      onChange={this.changeFile.bind(this, "AttachmentComment")}
                      type="file"
                      id="fileUploadComment"
                    />
                  </div>
                </Grid>
                {AttachmentComment.length > 0 ? (
                  <Grid item sm={12} xs={12}>
                    {AttachmentComment.map((itemFile, infile) => (
                      <div key={itemFile.name} className="wrapName">
                        <a
                          onClick={() =>
                            this.removeFile(infile, "AttachmentComment")
                          }
                        >
                          <i className="fa fa-close text-danger"></i>
                        </a>
                        {itemFile.name}
                      </div>
                    ))}
                  </Grid>
                ) : (
                  ""
                )}

                <Grid item sm={12} xs={12}>
                  <Button
                    className="btn bg-success"
                    onClick={() => this.saveComment()}
                  >
                    <span className="icon">
                      <i className="fa fa-send"></i>
                    </span>
                    Gửi
                  </Button>
                </Grid>
              </Grid>
              <Grid container spacing={3} style={{ marginTop: "25px" }}>
                {this.state.listComments.length > 0
                  ? this.state.listComments.map((comment, idcomment) => (
                      <Grid
                        item
                        sm={12}
                        xs={12}
                        key={idcomment}
                        className="div_Form_Comment"
                      >
                        <div className="divImgComment">
                          <img
                            className="imgComment"
                            src={comment.UserPicture}
                          />
                        </div>
                        <div className="divContentComment">
                          <p className="form_Text_Comment">
                            {comment.UserComment} {comment.Created}
                          </p>
                          <p className="form_Text_Comment">
                            {comment.AssignTo}
                          </p>
                          {/* <p className="form_Text_Comment">{comment.Chat_Comments}</p> */}
                          <textarea
                            variant="outlined"
                            className="textArea"
                            value={comment.Chat_Comments}
                            rows="4"
                            readOnly
                          />
                          <div>
                            {comment.AttachmentFiles.map((attach) => (
                              <div key={attach.name}>
                                <FileAttach
                                  urlFile={attach.urlFile}
                                  nameFile={attach.name}
                                  typeOffice={attach.typeOffice}
                                  isEditFile={true}
                                />
                                {/* <a href={attach.urlFile} target="_blank">{attach.name}</a> */}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Card>
          ) : (
            ""
          )}

          {!infoSubProcess ? (
            ""
          ) : (
            <Dialog open={infoSubProcess} fullWidth maxWidth="xl">
              <WFSubInfo
                ArraySubProcess={
                  isSynchronized ? ArraySynchronized : ArrayAsynchronous
                }
                resultSubProcess={this.resultSubProcess}
                isSynchronized={isSynchronized}
                closeDialog={this.closeDialog}
              />
            </Dialog>
          )}

          {!isInformSubProcess ? (
            ""
          ) : (
            <Dialog open={isInformSubProcess} fullWidth maxWidth="xl">
              <WFSubInfo
                ArraySubProcess={ArrayInformSubProcess}
                resultSubProcess={this.resultSubProcess}
                isSynchronized={isSynchronized}
                closeDialog={this.closeDialog}
              />
            </Dialog>
          )}

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
      </Fragment>
    );
  }

  resetItem() {
    console.log(this.state);
    for (let i = 0; i < this.wfStepField.length; i++) {
      if (this.wfStepField[i].FieldType == "User") {
        this.setState({
          [this.wfStepField[i].InternalName]: {
            UserId: "",
            UserTitle: "",
            UserEmail: "",
          },
          [`listSearch_` + this.wfStepField[i].InternalName]: [],
        });
      } else if (this.wfStepField[i].FieldType == "UserMulti") {
        this.setState({
          [`list_` + this.wfStepField[i].InternalName]: [],
          [`search_` + this.wfStepField[i].InternalName]: "",
          [`listSearch_` + this.wfStepField[i].InternalName]: [],
        });
      } else if (this.wfStepField[i].FieldType == objField.DateTime) {
        this.setState({ [this.wfStepField[i].InternalName]: null });
      } else if (this.wfStepField[i].FieldType == "YesNo") {
        this.setState({ [this.wfStepField[i].InternalName]: false });
      } else if (this.wfStepField[i].FieldType == "CheckBox") {
        let arrCheck = this.state[this.wfStepField[i].InternalName];
        for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
          arrCheck[inChoice].isChecked = false;
        }
        this.setState({ [this.wfStepField[i].InternalName]: arrCheck });
      } else if (this.wfStepField[i].FieldType == "RadioButton") {
        let arrRadio = this.state[this.wfStepField[i].InternalName];
        for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
          arrRadio[inChoice].isChecked = false;
        }
        this.setState({ [this.wfStepField[i].InternalName]: arrRadio });
      } else if (this.wfStepField[i].FieldType == "SPLinkWF") {
        this.setState({
          [this.wfStepField[i].InternalName]: [],
          [this.wfStepField[i].InternalName + "|SearchWorkflow"]: [],
          [this.wfStepField[i].InternalName + "|DateStart"]: null,
          [this.wfStepField[i].InternalName + "|DateEnd"]: null,
        });
      } else {
        this.setState({ [this.wfStepField[i].InternalName]: "" });
      }
    }
    this.setState({
      outputFile: [],
      UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
      BackStep: "",
      UserApproveBackStep: { UserId: "", UserTitle: "", UserEmail: "" },
    });
  }

  callChangeFile(type) {
    console.log(type);
    if (type == "AttachmentRequest") {
      document.getElementById("fileUploadRequest").click();
    } else if (type == "AttachmentComment") {
      document.getElementById("fileUploadComment").click();
    }
  }

  async changeFormInput(event, subForm) {
    if (CheckNull(subForm) == "") {
      if (event.target.name == "UserApprovalStep") {
        let userStep = { UserId: "", UserTitle: "", UserEmail: "" };
        const itemStep = this.state.listSelect_UserApprovalStep.find(
          (x) => x.UserId == event.target.value
        );
        if (isNotNull(itemStep)) {
          userStep = itemStep;
        }
        await this.setState({ [event.target.name]: userStep });
      } else if (event.target.name == "UserApproveBackStep") {
        let userStep = { UserId: "", UserTitle: "", UserEmail: "" };
        const itemStep = this.state.listSelect_UserApproveBackStep.find(
          (x) => x.UserId == event.target.value
        );
        if (isNotNull(itemStep)) {
          userStep = itemStep;
        }
        await this.setState({ [event.target.name]: userStep });
      } else if (event.target.name == "BackStep") {
        let valueBack = event.target.value;
        await this.setState({ [event.target.name]: valueBack });
        if (CheckNullSetZero(valueBack) > 0) {
          if (valueBack > this.indexStep || valueBack == 1) {
            let checkMapUser = await shareService.GetMapUserApproverNextStep(
              valueBack,
              this.wfStepTable,
              this.state.detailItem,
              this.currentUser.Id,
              this.WFTable.WFIndexStep
            );
            await this.setState({
              BackStep: valueBack,
              UserApproveBackStep: checkMapUser.UserApprovalNextStep,
              listSelect_UserApproveBackStep:
                checkMapUser.listUserApprovalNextStep,
              IsEditApproverBackStep: checkMapUser.IsEditApproval,
            });
          } else {
            let historyStep = this.state.detailItem.HistoryStep;
            const arrHistoryStep = historyStep.filter(
              (ht) => ht.indexStep == valueBack
            );
            console.log(historyStep);
            console.log(arrHistoryStep);
            if (arrHistoryStep.length > 0) {
              await this.setState({
                UserApproveBackStep:
                  arrHistoryStep[arrHistoryStep.length - 1].UserApproval,
                listSelect_UserApproveBackStep: [
                  arrHistoryStep[arrHistoryStep.length - 1].UserApproval,
                ],
                IsEditApproverBackStep: false,
              });
            } else {
              let checkMapUser = await shareService.GetMapUserApproverNextStep(
                valueBack,
                this.wfStepTable,
                this.state.detailItem,
                this.currentUser.Id,
                this.WFTable.WFIndexStep
              );
              await this.setState({
                BackStep: valueBack,
                UserApproveBackStep: checkMapUser.UserApprovalNextStep,
                listSelect_UserApproveBackStep:
                  checkMapUser.listUserApprovalNextStep,
                IsEditApproverBackStep: checkMapUser.IsEditApproval,
              });
            }
          }
        }
      } else {
        let nameState = event.target.name;
        let valueState = event.target.value;

        let fieldCalculate = calculationField(
          nameState,
          valueState,
          this.wfStepFieldInput,
          this.state
        );
        // console.log(fieldCalculate);
        if (isNotNull(fieldCalculate.Value)) {
          await this.setState({
            [nameState]: valueState,
            [fieldCalculate.Name]: fieldCalculate.Value,
          });
        } else {
          if (
            isNotNull(fieldCalculate.Name) &&
            this.state[fieldCalculate.Name] != undefined &&
            (isNotNull(fieldCalculate.FieldNameStart) ||
              isNotNull(fieldCalculate.FieldNameEnd))
          ) {
            await this.setState({
              [nameState]: valueState,
              [fieldCalculate.Name]: "",
            });
          } else {
            await this.setState({ [nameState]: valueState });
          }
        }

        if (
          checkFieldStepCondition(this.indexStep, nameState, this.wfStepTable)
        ) {
          let checkMapUser = await shareService.checkGetMapUserNextStep(
            this.indexStep,
            this.wfStepTable,
            this.wfStepFieldAll,
            this.state,
            this.state.detailItem,
            this.currentUser.Id,
            this.WFTable.WFIndexStep
          );

          this.setState({
            UserApprovalStep: checkMapUser.UserApprovalNextStep,
            listSelect_UserApprovalStep: checkMapUser.listUserApprovalNextStep,
            isUserApprovalStep: checkMapUser.isApproveNextStep,
            IsEditApproverStep: checkMapUser.IsEditApproval,
            TypeUserApproval: checkMapUser.TypeUserApproval,
            NameGroup: checkMapUser.NameGroup,
          });
        }
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }
      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);
      // console.log(objDetailField);
      let objDetailInput = returnObject(objDetailField.detailInput);
      // objDetailInput[event.target.name] = event.target.value;

      if (event.target.name == "UserApprovalStep") {
        let userStep = { UserId: "", UserTitle: "", UserEmail: "" };
        const itemStep = objDetailInput.listSelect_UserApprovalStep.find(
          (x) => x.UserId == event.target.value
        );
        if (isNotNull(itemStep)) {
          userStep = itemStep;
        }
        objDetailInput[event.target.name] = userStep;
      } else if (event.target.name == "UserApproveBackStep") {
        let userStep = { UserId: "", UserTitle: "", UserEmail: "" };
        const itemStep = objDetailInput.listSelect_UserApproveBackStep.find(
          (x) => x.UserId == event.target.value
        );
        if (isNotNull(itemStep)) {
          userStep = itemStep;
        }
        objDetailInput[event.target.name] = userStep;
      } else if (event.target.name == "BackStep") {
        let valueBack = event.target.value;
        objDetailInput[event.target.name] = valueBack;

        if (CheckNullSetZero(valueBack) > 0) {
          if (valueBack > objDetailField.indexStep || valueBack == 1) {
            const checkMapUser = await this.GetMapUserApproverSubForm(
              valueBack,
              objDetailField.wfStepTable,
              objDetailField.detailRequest
            );
            objDetailInput.UserApproveBackStep = checkMapUser.UserApprovalStep;
            objDetailInput.listSelect_UserApproveBackStep =
              checkMapUser.listSearch_UserApprovalStep;
            objDetailInput.IsEditApproverBackStep = checkMapUser.IsEditApprover;
          } else {
            let historyStep = objDetailField.detailRequest.HistoryStep;
            const arrHistoryStep = historyStep.filter(
              (ht) => ht.indexStep == valueBack
            );
            if (arrHistoryStep.length > 0) {
              await this.setState({
                UserApproveBackStep:
                  arrHistoryStep[arrHistoryStep.length - 1].UserApproval,
                listSelect_UserApproveBackStep: [
                  arrHistoryStep[arrHistoryStep.length - 1].UserApproval,
                ],
                IsEditApproverBackStep: false,
              });
            } else {
              const checkMapUser = await this.GetMapUserApproverSubForm(
                valueBack,
                objDetailField.wfStepTable,
                objDetailField.detailRequest
              );
              objDetailInput.UserApproveBackStep =
                checkMapUser.UserApprovalStep;
              objDetailInput.listSelect_UserApproveBackStep =
                checkMapUser.listSearch_UserApprovalStep;
              objDetailInput.IsEditApproverBackStep =
                checkMapUser.IsEditApprover;
            }
          }
        }
      } else {
        let nameState = event.target.name;
        objDetailInput[nameState] = event.target.value;
        if (
          checkFieldStepCondition(
            objDetailField.indexStep,
            nameState,
            objDetailField.wfStepTable
          )
        ) {
          const checkMapUser = await this.checkGetMapUserSubForm(
            objDetailField.indexStep,
            objDetailField.wfStepTable,
            objDetailField.FieldInput,
            objDetailField.detailRequest,
            objDetailField.detailInput
          );
          objDetailInput.UserApprovalStep = checkMapUser.UserApprovalStep;
          objDetailInput.listSelect_UserApprovalStep =
            checkMapUser.listSearch_UserApprovalStep;
          objDetailInput.IsEditApproverStep = checkMapUser.IsEditApprover;
          objDetailInput.isUserApprovalStep = checkMapUser.isApproveNext;
        }
      }

      objDetailField.detailInput = objDetailInput;
      arrDetailField[keyDetail[1]] = objDetailField;
      if (isIndexState.isApprove) {
        await this.setState({ [keyDetail[0]]: arrDetailField });
      } else if (isIndexState.isDetail) {
        objDetail[keyDetail[0]] = arrDetailField;
        await this.setState({ detailItem: objDetail });
      }

      // console.log(this.state);
    }
  }

  async changeFormDateTime(nameState, event, subForm) {
    // console.log(subForm);
    if (CheckNull(subForm) == "") {
      let valueState = null;
      if (event != null) {
        valueState = event["_d"];
      }

      let fieldCalculate = calculationField(
        nameState,
        valueState,
        this.wfStepFieldInput,
        this.state
      );
      // console.log(fieldCalculate);
      if (isNotNull(fieldCalculate.Value)) {
        await this.setState({
          [nameState]: valueState,
          [fieldCalculate.Name]: fieldCalculate.Value,
        });
      } else {
        if (
          isNotNull(fieldCalculate.Name) &&
          this.state[fieldCalculate.Name] != undefined &&
          (isNotNull(fieldCalculate.FieldNameStart) ||
            isNotNull(fieldCalculate.FieldNameEnd))
        ) {
          await this.setState({
            [nameState]: valueState,
            [fieldCalculate.Name]: "",
          });
        } else {
          await this.setState({ [nameState]: valueState });
        }
      }

      if (
        checkFieldStepCondition(this.indexStep, nameState, this.wfStepTable)
      ) {
        let checkMapUser = await shareService.checkGetMapUserNextStep(
          this.indexStep,
          this.wfStepTable,
          this.wfStepFieldAll,
          this.state,
          this.state.detailItem,
          this.currentUser.Id,
          this.WFTable.WFIndexStep
        );

        this.setState({
          UserApprovalStep: checkMapUser.UserApprovalNextStep,
          listSelect_UserApprovalStep: checkMapUser.listUserApprovalNextStep,
          isUserApprovalStep: checkMapUser.isApproveNextStep,
          IsEditApproverStep: checkMapUser.IsEditApproval,
          TypeUserApproval: checkMapUser.TypeUserApproval,
          NameGroup: checkMapUser.NameGroup,
        });
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);
      // console.log(objDetailField);
      let objDetailInput = returnObject(objDetailField.detailInput);
      if (event != null) {
        objDetailInput[nameState] = event["_d"];
      } else {
        objDetailInput[nameState] = null;
      }

      if (
        checkFieldStepCondition(
          objDetailField.indexStep,
          nameState,
          objDetailField.wfStepTable
        )
      ) {
        const checkMapUser = await this.checkGetMapUserSubForm(
          objDetailField.indexStep,
          objDetailField.wfStepTable,
          objDetailField.FieldInput,
          objDetailField.detailRequest,
          objDetailField.detailInput
        );
        objDetailInput.UserApprovalStep = checkMapUser.UserApprovalStep;
        objDetailInput.listSelect_UserApprovalStep =
          checkMapUser.listSearch_UserApprovalStep;
        objDetailInput.IsEditApproverStep = checkMapUser.IsEditApprover;
        objDetailInput.isUserApprovalStep = checkMapUser.isApproveNext;
      }

      objDetailField.detailInput = objDetailInput;
      arrDetailField[keyDetail[1]] = objDetailField;

      if (isIndexState.isApprove) {
        await this.setState({ [keyDetail[0]]: arrDetailField });
      } else if (isIndexState.isDetail) {
        objDetail[keyDetail[0]] = arrDetailField;
        await this.setState({ detailItem: objDetail });
      }
    }
  }

  async changeFormCheckBox(typeField, event, subForm) {
    let nameState = event.target.name;
    if (CheckNull(subForm) == "") {
      if (typeField == "YesNo") {
        await this.setState({ [nameState]: event.target.checked });
      } else if (typeField == "CheckBox") {
        const fieldCheck = nameState.split("|");
        let arrCheck = this.state[fieldCheck[0]];
        const indexCheck = fieldCheck[1];
        arrCheck[indexCheck].isChecked = event.target.checked;
        await this.setState({ [fieldCheck[0]]: arrCheck });
      } else if (typeField == "RadioButton") {
        const fieldCheck = nameState.split("|");
        let arrRadio = this.state[fieldCheck[0]];
        for (let rd = 0; rd < arrRadio.length; rd++) {
          if (rd == fieldCheck[1]) {
            if (arrRadio[rd].isChecked) {
              arrRadio[rd].isChecked = false;
            } else {
              arrRadio[rd].isChecked = event.target.checked;
            }
          } else {
            arrRadio[rd].isChecked = false;
          }
        }
        await this.setState({ [fieldCheck[0]]: arrRadio });
      } else if (typeField == "SPLinkWF") {
        let arrSPLinkIndex = returnArray(this.state[nameState]);
        // console.log(arrSPLinkIndex);
        let arrSearch = returnArray(this.state[nameState + "|SearchWorkflow"]);
        // console.log(arrSearch);
        if (
          isNotNull(event.target.value) &&
          arrSPLinkIndex.findIndex(
            (xf) => xf.ItemId == arrSearch[event.target.value].ItemId
          ) == -1
        ) {
          // console.log(event.target.value);
          let objSPLNew = await this.selectWFRequest(
            arrSearch[event.target.value],
            arrSPLinkIndex[0]
          );
          // console.log(objSPLNew);
          arrSPLinkIndex.push(objSPLNew);
          await this.setState({ [nameState]: arrSPLinkIndex });
        }
      }

      if (
        checkFieldStepCondition(this.indexStep, nameState, this.wfStepTable)
      ) {
        let checkMapUser = await shareService.checkGetMapUserNextStep(
          this.indexStep,
          this.wfStepTable,
          this.wfStepFieldAll,
          this.state,
          this.state.detailItem,
          this.currentUser.Id,
          this.WFTable.WFIndexStep
        );

        this.setState({
          UserApprovalStep: checkMapUser.UserApprovalNextStep,
          listSelect_UserApprovalStep: checkMapUser.listUserApprovalNextStep,
          isUserApprovalStep: checkMapUser.isApproveNextStep,
          IsEditApproverStep: checkMapUser.IsEditApproval,
          TypeUserApproval: checkMapUser.TypeUserApproval,
          NameGroup: checkMapUser.NameGroup,
        });
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);
      let objDetailInput = returnObject(objDetailField.detailInput);
      objDetailInput[nameState] = event.target.value;

      if (typeField == "YesNo") {
        objDetailInput[nameState] = event.target.checked;
      } else if (typeField == "CheckBox") {
        const fieldCheck = nameState.split("|");
        let arrCheck = objDetailInput[fieldCheck[0]];
        const indexCheck = fieldCheck[1];
        arrCheck[indexCheck].isChecked = event.target.checked;
        objDetailInput[fieldCheck[0]] = arrCheck;
      } else if (typeField == "RadioButton") {
        const fieldCheck = nameState.split("|");
        let arrRadio = objDetailInput[fieldCheck[0]];
        for (let rd = 0; rd < arrRadio.length; rd++) {
          if (rd == fieldCheck[1]) {
            if (arrRadio[rd].isChecked) {
              arrRadio[rd].isChecked = false;
            } else {
              arrRadio[rd].isChecked = event.target.checked;
            }
          } else {
            arrRadio[rd].isChecked = false;
          }
        }
        objDetailInput[fieldCheck[0]] = arrRadio;
      }

      if (
        checkFieldStepCondition(
          objDetailField.indexStep,
          nameState,
          objDetailField.wfStepTable
        )
      ) {
        const checkMapUser = await this.checkGetMapUserSubForm(
          objDetailField.indexStep,
          objDetailField.wfStepTable,
          objDetailField.FieldInput,
          objDetailField.detailRequest,
          objDetailField.detailInput
        );
        objDetailInput.UserApprovalStep = checkMapUser.UserApprovalStep;
        objDetailInput.listSelect_UserApprovalStep =
          checkMapUser.listSearch_UserApprovalStep;
        objDetailInput.IsEditApproverStep = checkMapUser.IsEditApprover;
        objDetailInput.isUserApprovalStep = checkMapUser.isApproveNext;
      }

      objDetailField.detailInput = objDetailInput;
      arrDetailField[keyDetail[1]] = objDetailField;

      if (isIndexState.isApprove) {
        await this.setState({ [keyDetail[0]]: arrDetailField });
      } else if (isIndexState.isDetail) {
        objDetail[keyDetail[0]] = arrDetailField;
        await this.setState({ detailItem: objDetail });
      }
      // objDetail[keyDetail[0]] = arrDetailField;
      // await this.setState({detailItem: objDetail});
    }
  }

  async CheckViewRequest(strFilter) {
    strFilter = `ID eq ` + this.ItemIndex + ` and ( ` + strFilter + `)`;
    // console.log(strFilter);
    let viewCheck = false;
    await sp.web.lists
      .getByTitle(this.WFTable.WFCode)
      .items.select("ID")
      .filter(strFilter)
      .get()
      .then((listWFRequest) => {
        if (listWFRequest.length > 0) {
          viewCheck = true;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return viewCheck;
  }

  async GetDetailItem(strSelect, strExpand) {
    let detail = {
      ID: "",
      UserRequest: { UserId: "", UserTitle: "", UserEmail: "" },
      UserApproval: { UserId: "", UserTitle: "", UserEmail: "" },
      Reason: "",
      ListUser: [],
      indexStep: "",
      StatusStep: "",
      StatusRequest: "",
      HistoryStep: [],
      AttachmentFiles: [],
      StatusItem: "",
      ObjParentWF: "",
      ObjSubWF: [],
    };

    for (let inItem = 0; inItem < this.wfStepFieldAll.length; inItem++) {
      if (this.wfStepFieldAll[inItem].FieldType == "User") {
        Object.assign(detail, {
          [this.wfStepFieldAll[inItem].InternalName]: {
            UserId: "",
            UserTitle: "",
            UserEmail: "",
          },
        });
      }
      if (this.wfStepFieldAll[inItem].FieldType == "DateTime") {
        Object.assign(detail, {
          [this.wfStepFieldAll[inItem].InternalName]: null,
        });
      }
      if (this.wfStepFieldAll[inItem].FieldType == "UserMulti") {
        Object.assign(detail, {
          [this.wfStepFieldAll[inItem].InternalName]: [],
        });
      } else if (
        this.wfStepFieldAll[inItem].FieldType == "CheckBox" ||
        this.wfStepFieldAll[inItem].FieldType == "RadioButton"
      ) {
        let arrCheck = [];
        if (
          isNotNull(this.wfStepFieldAll[inItem].ObjSPField.ObjField.ChoiceField)
        ) {
          const array = this.wfStepFieldAll[inItem].ObjSPField.ObjField
            .ChoiceField;
          for (let incheck = 0; incheck < array.length; incheck++) {
            arrCheck.push({ isChecked: false, Value: array[incheck] });
          }
        }
        Object.assign(detail, {
          [this.wfStepFieldAll[inItem].InternalName]: arrCheck,
        });
      } else if (this.wfStepFieldAll[inItem].FieldType == "YesNo") {
        Object.assign(detail, {
          [this.wfStepFieldAll[inItem].InternalName]: false,
        });
      } else {
        Object.assign(detail, {
          [this.wfStepFieldAll[inItem].InternalName]: "",
        });
      }
    }
    let title = { WFCode: "", WFTitle: "" };
    await sp.web.lists
      .getByTitle(this.WFTable.WFCode)
      .items.getById(this.ItemIndex)
      .select(strSelect)
      .expand(strExpand)
      .get()
      .then((listWF) => {
        // title = {WFId: this.WFTable.WFId, WFCode: CheckNull(listWF["Code"]), WFTitle: CheckNull(listWF["Title"])}
        // console.log(listWF);
        if (isNotNull(listWF)) {
          if (isNotNull(listWF["UserRequest"])) {
            detail.UserRequest = {
              UserId: listWF["UserRequest"].Id,
              UserTitle: listWF["UserRequest"].Title,
              UserEmail: listWF["UserRequest"].Name.split("|")[2],
            };
          }
          if (isNotNull(listWF["UserApproval"])) {
            detail.UserApproval = {
              UserId: listWF["UserApproval"].Id,
              UserTitle: listWF["UserApproval"].Title,
              UserEmail: listWF["UserApproval"].Name.split("|")[2],
            };
          }
          if (isNotNull(listWF["ListUser"])) {
            listWF["ListUser"].forEach((item) => {
              detail.ListUser.push(item["Id"]);
            });
          }
          detail.indexStep = CheckNullSetZero(listWF["indexStep"]);
          detail.StatusStep = CheckNullSetZero(listWF["StatusStep"]);
          detail.StatusItem = CheckNullSetZero(listWF["StatusRequest"]);
          detail.Reason = CheckNull(listWF["Reason"]);
          if (isNotNull(listWF["HistoryStep"])) {
            detail.HistoryStep = JSON.parse(listWF["HistoryStep"]);
          } else {
            detail.HistoryStep = [];
          }
          // detail.HistoryStep = CheckNull(listWF["HistoryStep"]);
          if (
            CheckNullSetZero(listWF["indexStep"]) == this.WFTable.WFIndexStep &&
            CheckNullSetZero(listWF["StatusStep"]) == 0
          ) {
            detail.StatusRequest = -1;
          } else {
            detail.StatusRequest = CheckNullSetZero(listWF["StatusStep"]);
          }

          for (
            let outItem = 0;
            outItem < this.wfStepFieldAll.length;
            outItem++
          ) {
            if (this.wfStepFieldAll[outItem].FieldType == "User") {
              if (
                isNotNull(listWF[this.wfStepFieldAll[outItem].InternalName])
              ) {
                detail[this.wfStepFieldAll[outItem].InternalName] = {
                  UserId: listWF[this.wfStepFieldAll[outItem].InternalName].Id,
                  UserTitle:
                    listWF[this.wfStepFieldAll[outItem].InternalName].Title,
                  UserEmail:
                    listWF[this.wfStepFieldAll[outItem].InternalName].Name,
                };
              }
            } else if (this.wfStepFieldAll[outItem].FieldType == "UserMulti") {
              if (
                isNotNull(listWF[this.wfStepFieldAll[outItem].InternalName])
              ) {
                let userMulti = "";
                listWF[this.wfStepFieldAll[outItem].InternalName].forEach(
                  (item) => {
                    userMulti += item["Title"] + ", ";
                    detail[this.wfStepFieldAll[outItem].InternalName].push({
                      UserId: item["Id"],
                      UserTitle: item["Title"],
                      UserEmail: item["Name"].split("|")[2],
                    });
                  }
                );

                // detail[this.wfStepFieldAll[outItem].InternalName] = userMulti;
              }
            } else if (this.wfStepFieldAll[outItem].FieldType == "Number") {
              if (
                isNotNull(listWF[this.wfStepFieldAll[outItem].InternalName])
              ) {
                detail[
                  this.wfStepFieldAll[outItem].InternalName
                ] = CheckNullSetZero(
                  listWF[this.wfStepFieldAll[outItem].InternalName]
                );
              }
            } else if (this.wfStepFieldAll[outItem].FieldType == "DateTime") {
              if (
                isNotNull(listWF[this.wfStepFieldAll[outItem].InternalName])
              ) {
                detail[this.wfStepFieldAll[outItem].InternalName] = moment(
                  listWF[this.wfStepFieldAll[outItem].InternalName]
                );
              }
            } else if (
              this.wfStepFieldAll[outItem].FieldType == "RadioButton"
            ) {
              const txtRadio =
                listWF[this.wfStepFieldAll[outItem].InternalName];
              if (isNotNull(txtRadio)) {
                for (
                  let ischeck = 0;
                  ischeck <
                  detail[this.wfStepFieldAll[outItem].InternalName].length;
                  ischeck++
                ) {
                  if (
                    detail[this.wfStepFieldAll[outItem].InternalName][ischeck]
                      .Value == txtRadio
                  ) {
                    detail[this.wfStepFieldAll[outItem].InternalName][
                      ischeck
                    ].isChecked = true;
                    break;
                  }
                }
              }
            } else if (this.wfStepFieldAll[outItem].FieldType == "CheckBox") {
              const arrCheck =
                listWF[this.wfStepFieldAll[outItem].InternalName];
              if (isNotNull(arrCheck)) {
                for (let index = 0; index < arrCheck.length; index++) {
                  for (
                    let ischeck = 0;
                    ischeck <
                    detail[this.wfStepFieldAll[outItem].InternalName].length;
                    ischeck++
                  ) {
                    if (
                      detail[this.wfStepFieldAll[outItem].InternalName][ischeck]
                        .Value == arrCheck[index]
                    ) {
                      detail[this.wfStepFieldAll[outItem].InternalName][
                        ischeck
                      ].isChecked = true;
                    }
                  }
                }
              }
            } else if (this.wfStepFieldAll[outItem].FieldType == "YesNo") {
              detail[this.wfStepFieldAll[outItem].InternalName] = CheckNull(
                listWF[this.wfStepFieldAll[outItem].InternalName]
              );
            } else if (this.wfStepFieldAll[outItem].FieldType == "SPLinkWF") {
              let spLink = CheckNull(
                listWF[this.wfStepFieldAll[outItem].InternalName]
              );
              if (isNotNull(spLink)) {
                detail[this.wfStepFieldAll[outItem].InternalName] = JSON.parse(
                  spLink
                );
              } else {
                detail[this.wfStepFieldAll[outItem].InternalName] = [];
              }
            } else if (
              this.wfStepFieldAll[outItem].FieldType == objField.Hyperlink
            ) {
              let spLink = "";
              if (
                isNotNull(listWF[this.wfStepFieldAll[outItem].InternalName])
              ) {
                spLink = listWF[this.wfStepFieldAll[outItem].InternalName].Url;
              }
              detail[this.wfStepFieldAll[outItem].InternalName] = spLink;
            } else if (
              this.wfStepFieldAll[outItem].FieldType == objField.PictureLink
            ) {
              let spLink = "";
              if (
                isNotNull(listWF[this.wfStepFieldAll[outItem].InternalName])
              ) {
                spLink = listWF[this.wfStepFieldAll[outItem].InternalName].Url;
              }
              detail[this.wfStepFieldAll[outItem].InternalName] = spLink;
            } else if (
              this.wfStepFieldAll[outItem].FieldType == objField.Average ||
              this.wfStepFieldAll[outItem].FieldType == objField.Percent
            ) {
              if (
                isNotNull(listWF[this.wfStepFieldAll[outItem].InternalName])
              ) {
                detail[
                  this.wfStepFieldAll[outItem].InternalName
                ] = CheckNullSetZero(
                  listWF[this.wfStepFieldAll[outItem].InternalName]
                ).toFixed(2);
              }
            } else {
              detail[this.wfStepFieldAll[outItem].InternalName] = CheckNull(
                listWF[this.wfStepFieldAll[outItem].InternalName]
              );
            }
          }

          if (listWF["AttachmentFiles"].length > 0) {
            console.log(listWF["AttachmentFiles"]);
            listWF["AttachmentFiles"].forEach((element) => {
              const fileName = element.FileName;
              let isWorldExcel = 0;
              if (
                fileName.indexOf(".docx") > -1 ||
                fileName.indexOf(".doc") > -1 ||
                fileName.indexOf(".dotx") > -1
              ) {
                isWorldExcel = 1;
              }
              if (
                fileName.indexOf(".xlsx") > -1 ||
                fileName.indexOf(".xls") > -1 ||
                fileName.indexOf(".xlsb") > -1 ||
                fileName.indexOf(".xlsm") > -1
              ) {
                isWorldExcel = 2;
              }
              detail.AttachmentFiles.push({
                name: fileName,
                urlFile: this.urlAttachment + element.ServerRelativeUrl,
                // urlFile: "https://tsgvietnam.sharepoint.com/" + element.ServerRelativeUrl,
                typeOffice: isWorldExcel,
              });
            });
          }

          if (isNotNull(listWF["ObjParentWF"])) {
            detail.ObjParentWF = JSON.parse(listWF["ObjParentWF"]);
          }
          if (isNotNull(listWF["ObjSubWF"])) {
            detail.ObjSubWF = JSON.parse(listWF["ObjSubWF"]);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(detail);
    return detail;
  }

  async GetWFHistoryID(WFId, ItemIndex) {
    let IdHistory = 0;
    const strSelect = `ID,Title`;
    let strFilter = `WFTableId eq ` + WFId + ` and ItemIndex eq ` + ItemIndex;
    await sp.web.lists
      .getByTitle("WFHistory")
      .items.select(strSelect)
      .filter(strFilter)
      .get()
      .then((listWFHistory) => {
        if (listWFHistory.length > 0) {
          IdHistory = listWFHistory[0].Id;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return IdHistory;
  }

  async GetDetailHistory(WFId, ItemIndex, indexStep) {
    let detail;
    const strSelect = `ID,ListUser/Id,DateRequest,HistoryApprover/Id,UserRequest/Id,UserRequest/Title,UserRequest/Name`;
    const strExpand = `ListUser,HistoryApprover,UserRequest`;
    let strFilter = "";
    if (this.state.detailItem.StatusItem == 0) {
      strFilter =
        `WFTableId eq ` +
        WFId +
        ` and ItemIndex eq ` +
        ItemIndex +
        ` and (StatusStep eq 0 or StatusStep eq 3)` +
        ` and indexStep eq ` +
        indexStep +
        ` and ( UserCreated/Id eq ` +
        this.currentUser.Id +
        ` or UserRequest/Id eq ` +
        this.currentUser.Id +
        ` )`;
    } else {
      strFilter =
        `WFTableId eq ` +
        WFId +
        ` and ItemIndex eq ` +
        ItemIndex +
        ` and (StatusStep eq 0 or StatusStep eq 3)` +
        ` and indexStep eq ` +
        indexStep +
        ` and UserApproval/Id eq ` +
        this.currentUser.Id;
    }

    await sp.web.lists
      .getByTitle("WFHistory")
      .items.select(strSelect)
      .expand(strExpand)
      .filter(strFilter)
      .get()
      .then((listWFHistory) => {
        // title = {WFId: this.WFTable.WFId, WFCode: CheckNull(listWF["Code"]), WFTitle: CheckNull(listWF["Title"])}
        if (listWFHistory.length > 0) {
          detail = {
            HistoryId: listWFHistory[0].Id,
            ListUser: [],
            HistoryApprover: [],
            DateRequest: listWFHistory[0].DateRequest,
            UserRequest: {
              UserId: listWFHistory[0].UserRequest.Id,
              UserTitle: listWFHistory[0].UserRequest.Title,
              UserEmail: listWFHistory[0].UserRequest.Name.split("|")[2],
            },
          };

          if (isNotNull(listWFHistory[0].ListUser)) {
            listWFHistory[0].ListUser.forEach((listUser) => {
              detail.ListUser.push(listUser.Id);
            });
          }

          if (isNotNull(listWFHistory[0].HistoryApprover)) {
            listWFHistory[0].HistoryApprover.forEach((listApprover) => {
              detail.HistoryApprover.push(listApprover.Id);
            });
          }
        }
        // console.log(listWFHistory);
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return detail;
  }

  async CheckViewComment() {
    const strFilter =
      `KeyList eq '` +
      this.WFTable.WFCode +
      "_" +
      this.ItemIndex +
      `' and ( UserComment/Id eq ` +
      this.currentUser.Id +
      ` or AssignTo/Id eq ` +
      this.currentUser.Id +
      ` )`;
    let viewCheck = false;
    await sp.web.lists
      .getByTitle("WFComments")
      .items.select("ID")
      .filter(strFilter)
      .get()
      .then((listWFComment) => {
        if (listWFComment.length > 0) {
          viewCheck = true;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return viewCheck;
  }

  // post comment
  saveComment() {
    console.log(this.state);
    if (!isNotNull(this.state.Chat_Comments)) {
      alert("Bạn chưa nhập nội dung trao đổi");
      return;
    }
    const dataComment = {
      Title: this.WFTable.WFCode,
      KeyList: this.WFTable.WFCode + "_" + this.ItemIndex,
      Chat_Comments: this.state.Chat_Comments,
      UserCommentId: this.currentUser.Id,
    };
    if (this.state.list_AssignToComment.length > 0) {
      let userC = [];
      for (
        let index = 0;
        index < this.state.list_AssignToComment.length;
        index++
      ) {
        userC.push(this.state.list_AssignToComment[index].UserId);
      }
      Object.assign(dataComment, { AssignToId: { results: userC } });
    }
    if (window["base-url"] != undefined) {
      let urlDomain = window["base-url"];
      if (window["base-url"].indexOf("-") !== -1) {
        urlDomain = window["base-url"].replace(
          window["base-url"].substring(
            window["base-url"].indexOf("-"),
            window["base-url"].indexOf(".sharepoint")
          ),
          ""
        );
      }
      const urlPicture =
        urlDomain +
        "/_layouts/15/userphoto.aspx?size=M&username=" +
        this.currentUser.Email;
      Object.assign(dataComment, { UserPicture: urlPicture });
    }
    sp.web.lists
      .getByTitle("WFComments")
      .items.add(dataComment)
      .then((commentItem) => {
        console.log(commentItem);
        // this.setState({
        //   search_AssignToComment: '', listSearch_AssignToComment: [], list_AssignToComment: [],
        //   Chat_Comments: ''
        // });
        if (this.state.AttachmentComment.length > 0) {
          this.saveFileAttachments(
            commentItem["data"].ID,
            "WFComments",
            "AttachmentComment",
            "",
            0,
            ""
          );
        } else {
          this.setFormComment(commentItem["data"].ID);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async setFormComment(Id) {
    if (
      isNotNull(this.EmailComment) &&
      this.state.list_AssignToComment.length > 0
    ) {
      let objBody = {
        HomeUrl: config.pages.wfDashboard,
        ItemUrl:
          config.pages.wfRequestView +
          `?WFTableId=` +
          this.WFTable.WFId +
          `&ItemIndex=` +
          this.ItemIndex +
          `&indexStep=` +
          this.indexStep,
      };

      let userComment = { UserTitle: "", UserEmail: "" };
      for (
        let index = 0;
        index < this.state.list_AssignToComment.length;
        index++
      ) {
        if (isNotNull(userComment.UserEmail)) {
          userComment.UserEmail +=
            ";" + this.state.list_AssignToComment[index].UserEmail;
          userComment.UserTitle +=
            ", " + this.state.list_AssignToComment[index].UserTitle;
        } else {
          userComment.UserEmail = this.state.list_AssignToComment[
            index
          ].UserEmail;
          userComment.UserTitle = this.state.list_AssignToComment[
            index
          ].UserTitle;
        }
      }
      Object.assign(objBody, { DearUsers: userComment.UserTitle });

      const fieldRep = this.EmailComment.FieldReplateText.split(",");
      for (let i = 0; i < fieldRep.length; i++) {
        if (isNotNull(fieldRep[i])) {
          Object.assign(objBody, {
            [fieldRep[i]]: CheckNull(this.state[fieldRep[i]]),
          });
        }
      }

      const dataEmailComment = {
        Title: "WFComments",
        IndexItem: Id,
        Step: 0,
        KeyList: "WFComments_" + Id,
        SubjectMail: this.EmailComment.SubjectEmail,
        BodyMail: ReplaceFieldMail(objBody, this.EmailComment.BodyEmail),
        SendMailTo: userComment.UserEmail,
        TypeEmail: this.EmailComment.Title,
      };
      console.log(dataEmailComment);

      await this.SendEmail(dataEmailComment);
    }
    const wfComment = await this.GetComment();
    // console.log(wfComment);
    this.setState({
      listComments: wfComment,
      AttachmentComment: [],
      Chat_Comments: "",
      search_AssignToComment: "",
      listSearch_AssignToComment: [],
      list_AssignToComment: [],
    });
  }

  async GetComment() {
    let listComment = [];
    const strGet = {
      strSelect: `ID,Title,KeyList,Chat_Comments,UserComment/Title,AssignTo/Title,AssignTo/ID,UserPicture,Created,AttachmentFiles`,
      strExpand: `UserComment,AssignTo,AttachmentFiles`,
      strFilter:
        `KeyList eq '` + this.WFTable.WFCode + `_` + this.ItemIndex + `'`,
    };
    await sp.web.lists
      .getByTitle("WFComments")
      .items.select(strGet.strSelect)
      .expand(strGet.strExpand)
      .filter(strGet.strFilter)
      .orderBy("ID", false)
      .get()
      .then((commentList) => {
        // console.log(commentList);
        commentList.forEach((itemComment) => {
          let usComment = "";
          if (isNotNull(itemComment.UserComment)) {
            usComment = itemComment.UserComment.Title;
          }
          let usAssignTo = "";
          let arrUserComment = [];
          if (isNotNull(itemComment.AssignTo)) {
            itemComment.AssignTo.forEach((element) => {
              usAssignTo += "@" + element.Title + ", ";
              arrUserComment.push(element.ID);
            });
          }
          let attachments = [];
          if (isNotNull(itemComment.AttachmentFiles)) {
            itemComment.AttachmentFiles.forEach((elementF) => {
              const fileName = elementF.FileName;
              let isWorldExcel = 0;
              if (
                fileName.indexOf(".docx") > -1 ||
                fileName.indexOf(".doc") > -1 ||
                fileName.indexOf(".dotx") > -1
              ) {
                isWorldExcel = 1;
              }
              if (
                fileName.indexOf(".xlsx") > -1 ||
                fileName.indexOf(".xls") > -1 ||
                fileName.indexOf(".xlsb") > -1 ||
                fileName.indexOf(".xlsm") > -1
              ) {
                isWorldExcel = 2;
              }
              attachments.push({
                name: elementF.FileName,
                urlFile: this.urlAttachment + elementF.ServerRelativeUrl,
                typeOffice: isWorldExcel,
              });
            });
          }

          let urlPicture = imgUserDefault;
          if (isNotNull(itemComment.UserPicture)) {
            urlPicture = itemComment.UserPicture;
          }

          listComment.push({
            Chat_Comments: CheckNull(itemComment.Chat_Comments),
            UserComment: usComment,
            AssignTo: usAssignTo,
            UserPicture: urlPicture,
            arrUserComment: arrUserComment,
            Created: moment(itemComment.Created).format("DD/MM/YYYY HH:mm:ss"),
            AttachmentFiles: attachments,
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return listComment;
  }

  async GetMapEmployee(strFilter) {
    let listEm = [];
    const strSelect = `ID,Title,User/Id,User/Title,User/Name,ApproveCode,RoleCode,DeptCode,LeaderId`;
    await sp.web.lists
      .getByTitle("ListMapEmployee")
      .items.select(strSelect)
      .expand("User")
      .filter(strFilter)
      .get()
      .then((employees) => {
        employees.forEach((element) => {
          let userEm = { UserId: "", UserTitle: "", UserEmail: "" };
          if (isNotNull(element.User)) {
            userEm = {
              UserId: element.User["Id"],
              UserTitle: element.User["Title"],
              UserEmail: element.User["Name"].split("|")[2],
            };
          }
          listEm.push({
            ID: element.ID,
            Title: CheckNull(element.Title),
            User: userEm,
            ApproveCode: CheckNull(element.ApproveCode),
            RoleCode: CheckNull(element.RoleCode),
            DeptCode: CheckNull(element.DeptCode),
            LeaderId: CheckNull(element.LeaderId),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return listEm;
  }

  changeFile(typeFile, event) {
    event.preventDefault();
    let file = event.target.files[0];
    let files = this.state[typeFile];

    const name = file.name;
    let ListCharacters = [
      "&#92;",
      "/",
      ":",
      "*",
      "?",
      '"',
      "&#60;",
      "&#62;",
      "|",
      "#",
      "%",
      "~",
      "&#123;",
      "&#125;",
      "&#38;",
    ];
    let check = false;
    for (const item of ListCharacters) {
      if (name.indexOf(item) != -1) {
        check = true;
        alert("Tên file không được chứa các kí tự đặc biệt");
        break;
      }
    }
    if (!check) {
      if (files.length > 0) {
        if (files.findIndex((x) => x.name == file.name) === -1) {
          files.push(file);
        }
      } else {
        files.push(file);
      }
      this.setState({ [typeFile]: files });
    }
    event.target.value = null;
  }

  removeFile(item, typeFile) {
    let arrFile = this.state[typeFile];
    // arrFile.splice(arrFile.indexOf(item), 1);
    arrFile.splice(item, 1);
    this.setState({ [typeFile]: arrFile });
  }

  saveFileAttachments(
    ItemIndex,
    WFTable,
    typeFile,
    dataHistoryUpdate,
    index,
    objStepConfig
  ) {
    try {
      const file = this.state[typeFile];
      this.buffer = getFileBuffer(file[index]);
      console.log(this.buffer);
      this.buffer.onload = (e) => {
        console.log(e.target.result);
        const dataFile = e.target.result;
        sp.web.lists
          .getByTitle(WFTable)
          .items.getById(ItemIndex)
          .attachmentFiles.add(file[index].name, dataFile)
          .then((fileItem) => {
            // console.log("add file success");
            console.log(fileItem);
            if (file.length - 1 > index) {
              this.saveFileAttachments(
                ItemIndex,
                WFTable,
                typeFile,
                dataHistoryUpdate,
                index + 1,
                objStepConfig
              );
            } else {
              if (typeFile == "AttachmentRequest") {
                this.updateItemHistory(
                  dataHistoryUpdate,
                  objStepConfig,
                  "",
                  ""
                );
              } else {
                this.setState({ AttachmentComment: [] });
                this.setFormComment(ItemIndex);
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
      };
    } catch (error) {
      console.log("saveItemAttachment error: " + error);
    }
  }

  async changeSearchPeople(typeUser, event, subForm) {
    const nameState = event.target.name;
    if (CheckNull(subForm) == "") {
      this.fieldSearch = {
        FieldName: nameState,
        FieldType: typeUser,
        subForm: "",
      };
      if (typeUser == "User") {
        // let fieldUser = this.state[nameState];
        let fieldUser = returnObject(this.state[nameState]);
        fieldUser.UserId = "";
        fieldUser.UserEmail = "";
        fieldUser.UserTitle = event.target.value;
        await this.setState({ [nameState]: fieldUser });
      } else {
        await this.setState({ [`search_` + nameState]: event.target.value });
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);
      // console.log(objDetailField);
      let objDetailInput = returnObject(objDetailField.detailInput);

      this.fieldSearch = {
        FieldName: nameState,
        FieldType: typeUser,
        subForm: subForm,
      };
      if (typeUser == "User") {
        let fieldUser = returnObject(objDetailInput[nameState]);
        fieldUser.UserId = "";
        fieldUser.UserEmail = "";
        fieldUser.UserTitle = event.target.value;
        objDetailInput[nameState] = fieldUser;
      } else {
        objDetailInput[`search_` + nameState] = event.target.value;
      }
      objDetailField.detailInput = objDetailInput;
      arrDetailField[keyDetail[1]] = objDetailField;

      if (isIndexState.isApprove) {
        await this.setState({ [keyDetail[0]]: arrDetailField });
      } else if (isIndexState.isDetail) {
        objDetail[keyDetail[0]] = arrDetailField;
        await this.setState({ detailItem: objDetail });
      }
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  async callSearchPeople() {
    if (CheckNull(this.fieldSearch.subForm) == "") {
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
      this.fieldSearch = { FieldName: "", FieldType: "", subForm: "" };
    } else {
      const keyDetail = this.fieldSearch.subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);
      let objDetailInput = returnObject(objDetailField.detailInput);

      let searchValue = "";
      if (this.fieldSearch.FieldType == "User") {
        searchValue = objDetailInput[this.fieldSearch.FieldName].UserTitle;
      } else {
        searchValue = objDetailInput[`search_` + this.fieldSearch.FieldName];
      }
      let PeoplePicker = await this.searchPeoplePicker(searchValue);
      objDetailInput[`listSearch_` + this.fieldSearch.FieldName] = PeoplePicker;
      // this.fieldSearch = { FieldName: '', FieldType: '', subForm: '' };

      objDetailField.detailInput = objDetailInput;
      arrDetailField[keyDetail[1]] = objDetailField;

      if (isIndexState.isApprove) {
        await this.setState({ [keyDetail[0]]: arrDetailField });
      } else if (isIndexState.isDetail) {
        objDetail[keyDetail[0]] = arrDetailField;
        await this.setState({ detailItem: objDetail });
      }

      // objDetail[keyDetail[0]] = arrDetailField;
      // await this.setState({detailItem: objDetail});
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

  async selectSearch(Key, typeUser, InternalName, subForm) {
    let user = await sp.web.ensureUser(Key);
    let objUser = {
      UserId: CheckNullSetZero(user["data"].Id),
      UserTitle: CheckNull(user["data"].Title),
      UserEmail: CheckNull(user["data"].Email),
    };

    if (CheckNull(subForm) == "") {
      if (objUser.UserId !== 0) {
        if (typeUser == "User") {
          this.setState({
            [InternalName]: objUser,
            [`listSearch_` + InternalName]: [],
          });
        } else {
          const arrPeople = this.state[`list_` + InternalName];
          if (arrPeople.findIndex((x) => x.UserId == user["data"].Id) == -1) {
            arrPeople.push(objUser);
          }
          this.setState({
            [`list_` + InternalName]: arrPeople,
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
    } else {
      const keyDetail = this.fieldSearch.subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);
      let objDetailInput = returnObject(objDetailField.detailInput);

      if (objUser.UserId !== 0) {
        if (typeUser == "User") {
          objDetailInput[InternalName] = objUser;
          objDetailInput[`listSearch_` + InternalName] = [];
        } else {
          const arrPeople = objDetailInput[`list_` + InternalName];
          if (arrPeople.findIndex((x) => x.UserId == user["data"].Id) == -1) {
            arrPeople.push(objUser);
          }
          objDetailInput[`list_` + InternalName] = arrPeople;
          objDetailInput[`search_` + InternalName] = "";
          objDetailInput[`listSearch_` + InternalName] = [];
        }
      } else {
        if (typeUser == "User") {
          objDetailInput[InternalName] = {
            UserId: "",
            UserTitle: "",
            UserEmail: "",
          };
          objDetailInput[`listSearch_` + InternalName] = [];
        } else {
          objDetailInput[`search_` + InternalName] = "";
          objDetailInput[`listSearch_` + InternalName] = [];
        }
      }

      objDetailField.detailInput = objDetailInput;
      arrDetailField[keyDetail[1]] = objDetailField;

      if (isIndexState.isApprove) {
        await this.setState({ [keyDetail[0]]: arrDetailField });
      } else if (isIndexState.isDetail) {
        objDetail[keyDetail[0]] = arrDetailField;
        await this.setState({ detailItem: objDetail });
      }

      // objDetail[keyDetail[0]] = arrDetailField;
      // this.setState({detailItem: objDetail});
    }
  }

  removePeople(IdUser, InternalName, subForm) {
    if (CheckNull(subForm) == "") {
      let arrPeople = this.state[`list_` + InternalName];
      let index = arrPeople.findIndex((x) => x.UserId == IdUser);
      arrPeople.splice(index, 1);
      this.setState({ [`list_` + InternalName]: arrPeople });
    } else {
      const keyDetail = this.fieldSearch.subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);
      let objDetailInput = returnObject(objDetailField.detailInput);

      let arrPeople = objDetailInput[`list_` + InternalName];
      let index = arrPeople.findIndex((x) => x.UserId == IdUser);
      arrPeople.splice(index, 1);
      objDetailInput[`list_` + InternalName] = arrPeople;

      objDetailField.detailInput = objDetailInput;
      arrDetailField[keyDetail[1]] = objDetailField;

      if (isIndexState.isApprove) {
        this.setState({ [keyDetail[0]]: arrDetailField });
      } else if (isIndexState.isDetail) {
        objDetail[keyDetail[0]] = arrDetailField;
        this.setState({ detailItem: objDetail });
      }

      // objDetail[keyDetail[0]] = arrDetailField;
      // this.setState({detailItem: objDetail});
    }
  }

  // kiểm tra validation và Compare condition field
  checkSaveForm(status, wfStepFieldInput, detailInput) {
    let txtCheck = { txtRequired: "", txtCompare: "" };
    for (let i = 0; i < wfStepFieldInput.length; i++) {
      if (wfStepFieldInput[i].FieldType == "UserMulti") {
        if (
          detailInput[`list_` + wfStepFieldInput[i].InternalName].length == 0 &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "User") {
        if (
          !isNotNull(detailInput[wfStepFieldInput[i].InternalName].UserId) &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "YesNo") {
        if (
          !detailInput[wfStepFieldInput[i].InternalName] &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "CheckBox") {
        let arrCheck = detailInput[wfStepFieldInput[i].InternalName];
        let ischeck = false;
        for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
          if (arrCheck[inChoice].isChecked) {
            ischeck = true;
          }
        }
        if (!ischeck && wfStepFieldInput[i].Required == 1) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "RadioButton") {
        let arrRadio = detailInput[wfStepFieldInput[i].InternalName];
        let ischeck = false;
        for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
          if (arrRadio[inChoice].isChecked) {
            ischeck = true;
          }
        }
        if (!ischeck && wfStepFieldInput[i].Required == 1) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (
        wfStepFieldInput[i].FieldType == objField.Hyperlink ||
        wfStepFieldInput[i].FieldType == objField.PictureLink
      ) {
        if (wfStepFieldInput[i].Required == 1) {
          if (!isNotNull(detailInput[wfStepFieldInput[i].InternalName])) {
            txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
          } else if (
            isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
            !isValidURL(detailInput[wfStepFieldInput[i].InternalName])
          ) {
            txtCheck.txtRequired +=
              wfStepFieldInput[i].Title + " phải là 1 đường dẫn, ";
          }
        } else {
          if (
            isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
            !isValidURL(detailInput[wfStepFieldInput[i].InternalName])
          ) {
            txtCheck.txtRequired +=
              wfStepFieldInput[i].Title + " phải là 1 đường dẫn, ";
          }
        }
      } else {
        if (
          !isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      }
      // check condition field
      let validation = wfStepFieldInput[i].ObjValidation.CompareCondition;
      if (validation.length > 0) {
        for (let j = 0; j < validation.length; j++) {
          if (
            isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
            CheckNull(validation[j].ConditionType == "FieldCompare")
          ) {
            if (wfStepFieldInput[i].FieldType == "DateTime") {
              if (
                !CompareDate(
                  detailInput[wfStepFieldInput[i].InternalName],
                  detailInput[validation[j].FieldCompare],
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].Field +
                  " \n ";
              }
            } else if (wfStepFieldInput[i].FieldType == "Number") {
              if (
                !CompareNumber(
                  detailInput[wfStepFieldInput[i].InternalName],
                  detailInput[validation[j].FieldCompare],
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].FieldCompare +
                  " \n ";
              }
            }
          } else if (
            isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
            CheckNull(validation[j].ConditionType == "FieldValue")
          ) {
            if (wfStepFieldInput[i].FieldType == "DateTime") {
              if (
                !CompareDate(
                  detailInput[wfStepFieldInput[i].InternalName],
                  validation[j].Value,
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  moment(validation[j].Value).format("DD/MM/YYYY") +
                  " \n ";
              }
            } else if (wfStepFieldInput[i].FieldType == "Number") {
              if (
                !CompareNumber(
                  detailInput[wfStepFieldInput[i].InternalName],
                  validation[j].Value,
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].Value +
                  " \n ";
              }
            }
          }
        }
      }
    }
    if (
      status == 1 &&
      !isNotNull(detailInput.UserApprovalStep.UserId) &&
      detailInput.isUserApprovalStep
    ) {
      txtCheck.txtRequired += "Người phê duyệt tiếp theo, ";
    }
    return txtCheck;
  }

  itemApproval(subForm) {
    if (CheckNull(subForm) == "") {
      const txtAlert = this.checkSaveForm(1, this.wfStepFieldInput, this.state);
      if (txtAlert.txtRequired == "" && txtAlert.txtCompare == "") {
        if (this.state.ArraySynchronized.length > 0) {
          this.setState({ infoSubProcess: true, isSynchronized: true });
        } else {
          this.updateItem(1);
        }
      } else {
        let txtShow = "";
        if (isNotNull(txtAlert.txtRequired)) {
          txtShow =
            "Bạn chưa nhập các trường dữ liệu bắt buộc: " +
            txtAlert.txtRequired +
            " \n ";
        }
        if (isNotNull(txtAlert.txtCompare)) {
          txtShow += txtAlert.txtCompare;
        }
        alert(txtShow);
        return;
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);

      const txtAlert = this.checkSaveForm(
        1,
        objDetailField.FieldInput,
        objDetailField.detailInput
      );
      if (txtAlert.txtRequired == "" && txtAlert.txtCompare == "") {
        this.updateItemSubForm(1, objDetailField, subForm);
      } else {
        let txtShow = "";
        if (isNotNull(txtAlert.txtRequired)) {
          txtShow =
            "Bạn chưa nhập các trường dữ liệu bắt buộc: " +
            txtAlert.txtRequired +
            " \n ";
        }
        if (isNotNull(txtAlert.txtCompare)) {
          txtShow += txtAlert.txtCompare;
        }
        alert(txtShow);
        return;
      }
    }
  }

  itemReject(subForm) {
    if (CheckNull(subForm) == "") {
      if (isNotNull(this.state.ReasonStep)) {
        this.updateItem(2);
      } else {
        alert("Bạn chưa nhập lý do từ chối yêu cầu");
        return;
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);

      if (isNotNull(objDetailField.detailInput.ReasonStep)) {
        this.updateItemSubForm(2, objDetailField, subForm);
      } else {
        alert("Bạn chưa nhập lý do từ chối yêu cầu");
        return;
      }
    }
  }

  itemReAssign(subForm) {
    if (CheckNull(subForm) == "") {
      if (isNotNull(this.state.UserReAssign.UserId)) {
        this.updateItem(0);
      } else {
        alert("Bạn chưa nhập người nhận xử lý yêu cầu này");
        return;
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);

      if (isNotNull(objDetailField.detailInput.UserReAssign.UserId)) {
        this.updateItemSubForm(0, objDetailField, subForm);
      } else {
        alert("Bạn chưa nhập người nhận xử lý yêu cầu này");
        return;
      }
    }
  }

  itemBackStep(subForm) {
    if (CheckNull(subForm) == "") {
      if (!isNotNull(this.state.BackStep)) {
        alert("Bạn chưa chọn bước chuyển");
        return;
      }
      if (
        isNotNull(this.state.BackStep) &&
        this.state.BackStep != 0 &&
        !isNotNull(this.state.UserApproveBackStep.UserId)
      ) {
        alert("Bạn chưa nhập Người xử lý tại bước chuyển");
        return;
      }
      if (
        !isNotNull(this.state.ReasonStep) &&
        CheckNullSetZero(this.state.detailItem.StatusItem) != 0
      ) {
        alert("Bạn chưa nhập lý do để chuyển bước");
        return;
      } else {
        this.updateItem(3);
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);

      if (!isNotNull(objDetailField.detailInput.BackStep)) {
        alert("Bạn chưa chọn bước chuyển");
        return;
      }
      if (
        isNotNull(objDetailField.detailInput.BackStep) &&
        objDetailField.detailInput.BackStep != 0 &&
        !isNotNull(objDetailField.detailInput.UserApproveBackStep.UserId)
      ) {
        alert("Bạn chưa nhập Người xử lý tại bước chuyển");
        return;
      } else {
        this.updateItemSubForm(3, objDetailField, subForm);
      }
    }
  }

  itemSave(subForm) {
    if (CheckNull(subForm) == "") {
      const txtAlert = this.checkSaveForm(
        -1,
        this.wfStepFieldInput,
        this.state
      );
      if (txtAlert.txtRequired == "" && txtAlert.txtCompare == "") {
        this.updateItem(-1);
      } else {
        let txtShow = "";
        if (isNotNull(txtAlert.txtRequired)) {
          txtShow =
            "Bạn chưa nhập các trường dữ liệu bắt buộc: " +
            txtAlert.txtRequired +
            " \n ";
        }
        if (isNotNull(txtAlert.txtCompare)) {
          txtShow += txtAlert.txtCompare;
        }
        alert(txtShow);
        return;
      }
    } else {
      const keyDetail = subForm.split("|");

      let isIndexState = { isApprove: false, isDetail: false };
      let objDetail;
      let arrDetailField = [];
      if (keyDetail.length == undefined) {
        return;
      }
      if (CheckNull(keyDetail[2]) == "detail") {
        isIndexState.isDetail = true;
        objDetail = returnObject(this.state.detailItem);
        arrDetailField = returnArray(objDetail[keyDetail[0]]);
      } else if (CheckNull(keyDetail[2]) == "approve") {
        isIndexState.isApprove = true;
        arrDetailField = returnArray(this.state[keyDetail[0]]);
      }

      // let objDetail = returnObject(this.state.detailItem);
      // let arrDetailField = returnArray(objDetail[keyDetail[0]]);
      let objDetailField = returnObject(arrDetailField[keyDetail[1]]);

      const txtAlert = this.checkSaveForm(
        1,
        objDetailField.FieldInput,
        objDetailField.detailInput
      );
      if (txtAlert.txtRequired == "" && txtAlert.txtCompare == "") {
        this.updateItemSubForm(-1, objDetailField, subForm);
      } else {
        let txtShow = "";
        if (isNotNull(txtAlert.txtRequired)) {
          txtShow =
            "Bạn chưa nhập các trường dữ liệu bắt buộc: " +
            txtAlert.txtRequired +
            " \n ";
        }
        if (isNotNull(txtAlert.txtCompare)) {
          txtShow += txtAlert.txtCompare;
        }
        alert(txtShow);
        return;
      }
    }
  }

  async getInfoUserById(id) {
    let InfoUser = { Title: "", Email: "" };
    await sp.web.siteUsers
      .getById(id)
      .get()
      .then((item) => {
        InfoUser.Title = item.Title;
        InfoUser.Email = item.Email;
      });
    return InfoUser;
  }

  async updateItem(status) {
    this.showLoadingPage();
    let stepTitle = this.wfStepTable.find((x) => x.indexStep == this.indexStep);
    let historyStep = this.state.detailItem.HistoryStep;

    if (historyStep.length > 0) {
      let lastObjHistory = returnObject(historyStep[historyStep.length - 1]);
      if (status == 0) {
        lastObjHistory.StatusStep = 1;
      } else {
        lastObjHistory.StatusStep = status;
      }
      lastObjHistory.indexStep = this.indexStep;
      lastObjHistory.DateFinish = new Date();
      lastObjHistory.UserApproval = {
        UserId: this.currentUser.Id,
        UserTitle: this.currentUser.Title,
        UserEmail: this.currentUser.Email,
      };
      lastObjHistory.HistoryId = this.WFHistoryId;
      if (lastObjHistory.ReasonStep == undefined) {
        Object.assign(lastObjHistory, { ReasonStep: this.state.ReasonStep });
      } else {
        lastObjHistory.ReasonStep = this.state.ReasonStep;
      }
      historyStep[historyStep.length - 1] = lastObjHistory;
    } else {
      historyStep = [
        {
          HistoryId: this.WFHistoryId,
          DateRequest: this.state.detailHistory.DateRequest,
          DateFinish: new Date(),
          indexStep: this.indexStep,
          StatusStep: status,
          UserRequest: this.state.detailHistory.UserRequest,
          UserApproval: {
            UserId: this.currentUser.Id,
            UserTitle: this.currentUser.Title,
            UserEmail: this.currentUser.Email,
          },
          TitleStep: stepTitle.Title,
          SLA: 0,
          ReasonStep: this.state.ReasonStep,
        },
      ];
      if (status == 0) {
        historyStep[0].StatusStep = 1;
      }
    }

    let historyApprover = this.state.detailHistory.HistoryApprover;
    historyApprover.push(this.currentUser.Id);
    let dataHistoryUpdate = {};
    let dataItemUpdate = {};
    if (this.state.detailItem.StatusItem == 0) {
      dataItemUpdate = {
        Reason: this.state.ReasonStep,
        StatusRequest: status == 3 ? 1 : status,
      };
      dataHistoryUpdate = {
        HistoryApproverId: { results: historyApprover },
        StatusRequest: status == 3 ? 1 : status,
      };
    } else {
      dataItemUpdate = { Reason: this.state.ReasonStep };
      dataHistoryUpdate = { HistoryApproverId: { results: historyApprover } };
    }
    let objStepConfig = "";
    let objStepConfigOld = "";
    this.StatusSendEmail.Status = status;

    for (let i = 0; i < this.wfStepFieldInput.length; i++) {
      if (this.wfStepFieldInput[i].FieldType == "User") {
        if (
          isNotNull(this.state[this.wfStepFieldInput[i].InternalName].UserId)
        ) {
          Object.assign(dataItemUpdate, {
            [this.wfStepFieldInput[i].InternalName + `Id`]: this.state[
              this.wfStepFieldInput[i].InternalName
            ].UserId,
          });
        } else {
          Object.assign(dataItemUpdate, {
            [this.wfStepFieldInput[i].InternalName + `Id`]: null,
          });
        }
      } else if (this.wfStepFieldInput[i].FieldType == "UserMulti") {
        let userDefault = [];
        const listPeople = this.state[
          `list_` + this.wfStepFieldInput[i].InternalName
        ];
        for (let i = 0; i < listPeople.length; i++) {
          userDefault.push(listPeople[i].UserId);
        }
        //if (userDefault.length > 0) {
        Object.assign(dataItemUpdate, {
          [this.wfStepFieldInput[i].InternalName + `Id`]: {
            results: userDefault,
          },
        });
        // }
      } else if (this.wfStepFieldInput[i].FieldType == "CheckBox") {
        let arrCheck = this.state[this.wfStepFieldInput[i].InternalName];
        let arrInput = [];
        for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
          if (arrCheck[inChoice].isChecked) {
            arrInput.push(arrCheck[inChoice].Value);
          }
        }
        if (arrInput.length > 0) {
          Object.assign(dataItemUpdate, {
            [this.wfStepFieldInput[i].InternalName]: { results: arrInput },
          });
        } else {
          Object.assign(dataItemUpdate, {
            [this.wfStepFieldInput[i].InternalName]: { results: [] },
          });
        }
      } else if (this.wfStepFieldInput[i].FieldType == "RadioButton") {
        let arrRadio = this.state[this.wfStepFieldInput[i].InternalName];
        let textRadio = "";
        for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
          if (arrRadio[inChoice].isChecked) {
            textRadio = arrRadio[inChoice].Value;
            break;
          }
        }
        Object.assign(dataItemUpdate, {
          [this.wfStepFieldInput[i].InternalName]: textRadio,
        });
      } else if (
        this.wfStepFieldInput[i].FieldType == "YesNo" ||
        this.wfStepFieldInput[i].FieldType == "DateTime"
      ) {
        Object.assign(dataItemUpdate, {
          [this.wfStepFieldInput[i].InternalName]: this.state[
            this.wfStepFieldInput[i].InternalName
          ],
        });
      } else if (this.wfStepFieldInput[i].FieldType == objField.SPLinkWF) {
        let arrSPLink = this.state[this.wfStepFieldInput[i].InternalName];
        let arrInputSPLink = [];
        for (let inSP = 0; inSP < arrSPLink.length; inSP++) {
          arrInputSPLink.push({
            WFId: arrSPLink[inSP].WFId,
            ItemId: arrSPLink[inSP].ItemId,
            indexStep: arrSPLink[inSP].indexStep,
            Title: arrSPLink[inSP].Title,
          });
        }
        Object.assign(dataItemUpdate, {
          [this.wfStepFieldInput[i].InternalName]: JSON.stringify(
            arrInputSPLink
          ),
        });
      } else if (this.wfStepFieldInput[i].FieldType == objField.Hyperlink) {
        let spLink = { Url: null };
        if (isNotNull(this.state[this.wfStepFieldInput[i].InternalName])) {
          spLink.Url = this.state[this.wfStepFieldInput[i].InternalName];
        }
        Object.assign(dataItemUpdate, {
          [this.wfStepFieldInput[i].InternalName]: spLink,
        });
      } else if (this.wfStepFieldInput[i].FieldType == objField.PictureLink) {
        let spLink = { Url: null };
        if (isNotNull(this.state[this.wfStepFieldInput[i].InternalName])) {
          spLink.Url = this.state[this.wfStepFieldInput[i].InternalName];
        }
        Object.assign(dataItemUpdate, {
          [this.wfStepFieldInput[i].InternalName]: spLink,
        });
      } else {
        if (isNotNull(this.state[this.wfStepFieldInput[i].InternalName])) {
          Object.assign(dataItemUpdate, {
            [this.wfStepFieldInput[i].InternalName]: this.state[
              this.wfStepFieldInput[i].InternalName
            ],
          });
        } else {
          Object.assign(dataItemUpdate, {
            [this.wfStepFieldInput[i].InternalName]: null,
          });
        }
      }
    }

    let titleUpdate = this.wfStepFieldInput.find(
      (fu) => fu.InternalName == "Title"
    );
    if (titleUpdate && isNotNull(this.state["Title"])) {
      Object.assign(dataHistoryUpdate, { Title: this.state["Title"] });
    }

    let dataParentInput = returnObject(dataItemUpdate);
    let dataParentView = returnObject(this.state.detailItem);

    if (status == 1) {
      const stepNext = checkConditionNextStep(
        this.indexStep,
        this.wfStepTable,
        this.wfStepFieldInput,
        this.state,
        this.state.detailItem
      );
      if (isNotNull(stepNext)) {
        objStepConfigOld = this.wfStepTable.find(
          (x) => x.indexStep == stepNext
        );
      }
      if (isNotNull(objStepConfigOld)) {
        objStepConfigOld.UserApprover = this.state.UserApprovalStep;
        objStepConfig = returnObject(objStepConfigOld);
        if (this.state.ArraySynchronized.length > 0) {
          historyStep.push({
            HistoryId: this.WFHistoryId,
            DateRequest: new Date(),
            DateFinish: "",
            indexStep: objStepConfig.indexStep,
            StatusStep: 0,
            UserRequest: {
              UserId: this.currentUser.Id,
              UserTitle: this.currentUser.Title,
              UserEmail: this.currentUser.Email,
            },
            UserApproval: {
              UserId: "",
              UserTitle: "",
              UserEmail: "",
            },
            TitleStep: objStepConfig.Title,
            SLA: objStepConfig.SLA,
            ReasonStep: "",
          });
          let arrInforSub = returnArray(this.state.detailItem.ObjSubWF);
          for (
            let index = 0;
            index < this.state.ArraySynchronized.length;
            index++
          ) {
            let itemSubProcess = returnObject(
              this.state.ArraySynchronized[index]
            );

            let subInfo = await shareService.addNewSubWF(
              this.ItemIndex,
              this.WFHistoryId,
              this.indexStep,
              dataParentInput,
              dataParentView,
              objStepConfig,
              stepTitle,
              false,
              historyStep,
              this.WFTable,
              this.currentUser,
              this.wfStepFieldAll,
              this.state,
              itemSubProcess,
              this.EmailSendToSubProcess,
              ""
            );
            subInfo.map((infor) => {
              arrInforSub.push(infor);
            });
          }

          Object.assign(dataItemUpdate, {
            ObjSubWF: JSON.stringify(arrInforSub),
          });

          objStepConfig.UserApprover = {
            UserId: null,
            UserTitle: "",
            UserEmail: "",
          };
        } else {
          historyStep.push({
            HistoryId: this.WFHistoryId,
            DateRequest: new Date(),
            DateFinish: "",
            indexStep: objStepConfig.indexStep,
            StatusStep: 0,
            UserRequest: {
              UserId: this.currentUser.Id,
              UserTitle: this.currentUser.Title,
              UserEmail: this.currentUser.Email,
            },
            UserApproval: objStepConfig.UserApprover,
            TitleStep: objStepConfig.Title,
            SLA: objStepConfig.SLA,
            ReasonStep: "",
          });
        }

        let listUserItem = this.state.detailItem.ListUser;
        if (listUserItem.findIndex((us) => us == this.currentUser.Id) == -1) {
          listUserItem.push(this.currentUser.Id);
        }

        if (
          isNotNull(objStepConfigOld.UserApprover.UserId) &&
          listUserItem.findIndex(
            (us) => us == objStepConfigOld.UserApprover.UserId
          ) == -1
        ) {
          listUserItem.push(objStepConfigOld.UserApprover.UserId);
        }
        Object.assign(dataItemUpdate, {
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserItem },
          indexStep: objStepConfig.indexStep,
          StatusStep: 0,
        });

        Object.assign(dataHistoryUpdate, {
          UserRequestId: this.currentUser.Id,
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserItem },
          indexStep: objStepConfig.indexStep,
          StatusStep: 0,
        });
      } else {
        Object.assign(dataItemUpdate, {
          indexStep: this.indexStep,
          StatusStep: status,
        });
        Object.assign(dataHistoryUpdate, {
          indexStep: this.indexStep,
          StatusStep: status,
        });
        this.StatusSendEmail.isFinish = true;

        if (this.state.ArraySynchronized.length > 0) {
          let arrInforSub = returnArray(this.state.detailItem.ObjSubWF);
          for (
            let index = 0;
            index < this.state.ArraySynchronized.length;
            index++
          ) {
            let itemSubProcess = returnObject(
              this.state.ArraySynchronized[index]
            );

            let subInfo = await shareService.addNewSubWF(
              this.ItemIndex,
              this.WFHistoryId,
              this.indexStep,
              dataParentInput,
              dataParentView,
              objStepConfig,
              stepTitle,
              true,
              historyStep,
              this.WFTable,
              this.currentUser,
              this.wfStepFieldAll,
              this.state,
              itemSubProcess,
              this.EmailSendToSubProcess,
              ""
            );
            subInfo.map((infor) => {
              arrInforSub.push(infor);
            });
          }

          Object.assign(dataItemUpdate, {
            ObjSubWF: JSON.stringify(arrInforSub),
          });
        }
      }
    } else if (status == 0) {
      let listUserHistory = this.state.detailItem.ListUser;
      if (
        listUserHistory.findIndex(
          (us) => us == this.state.UserReAssign.UserId
        ) == -1
      ) {
        listUserHistory.push(this.state.UserReAssign.UserId);
        listUserHistory.push(this.currentUser.Id);
      }

      Object.assign(dataItemUpdate, {
        indexStep: this.indexStep,
        StatusStep: 0,
        UserApprovalId: this.state.UserReAssign.UserId,
        ListUserId: { results: listUserHistory },
      });
      Object.assign(dataHistoryUpdate, {
        indexStep: this.indexStep,
        StatusStep: 0,
        UserApprovalId: this.state.UserReAssign.UserId,
        ListUserId: { results: listUserHistory },
      });
      historyStep.push({
        HistoryId: this.WFHistoryId,
        DateRequest: new Date(),
        DateFinish: "",
        indexStep: this.indexStep,
        StatusStep: 0,
        UserRequest: {
          UserId: this.currentUser.Id,
          UserTitle: this.currentUser.Title,
          UserEmail: this.currentUser.Email,
        },
        UserApproval: this.state.UserReAssign,
        TitleStep: stepTitle.Title,
        SLA: objStepConfig.SLA,
        ReasonStep: "",
      });
    } else if (status == 3) {
      let listUserStep = this.state.detailItem.ListUser;
      if (listUserStep.findIndex((us) => us == this.currentUser.Id) == -1) {
        listUserStep.push(this.currentUser.Id);
      }

      if (isNotNull(this.state.BackStep)) {
        objStepConfigOld = this.wfStepTable.find(
          (x) => x.indexStep == this.state.BackStep
        );
      }
      if (isNotNull(objStepConfigOld)) {
        objStepConfig = returnObject(objStepConfigOld);
        objStepConfig.UserApprover = this.state.UserApproveBackStep;
        Object.assign(dataItemUpdate, {
          indexStep: this.state.BackStep,
          StatusStep: this.indexStep > this.state.BackStep ? 3 : 0,
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserStep },
        });
        Object.assign(dataHistoryUpdate, {
          indexStep: this.state.BackStep,
          StatusStep: this.indexStep > this.state.BackStep ? 3 : 0,
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserStep },
        });

        historyStep.push({
          HistoryId: this.WFHistoryId,
          DateRequest: new Date(),
          DateFinish: "",
          indexStep: objStepConfig.indexStep,
          StatusStep: 0,
          UserRequest: {
            UserId: this.currentUser.Id,
            UserTitle: this.currentUser.Title,
            UserEmail: this.currentUser.Email,
          },
          UserApproval: objStepConfig.UserApprover,
          TitleStep: objStepConfig.Title,
          SLA: objStepConfig.SLA,
          ReasonStep: "",
        });
      } else {
        Object.assign(dataItemUpdate, {
          indexStep: this.indexStep,
          StatusStep: 1,
        });
        Object.assign(dataHistoryUpdate, {
          indexStep: this.indexStep,
          StatusStep: 1,
        });
        this.StatusSendEmail.isFinish = true;
      }
    } else if (status == -1) {
      let listUserStep1 = this.state.detailItem.ListUser;
      if (listUserStep1.findIndex((us) => us == this.currentUser.Id) == -1) {
        listUserStep1.push(this.currentUser.Id);
      }
      Object.assign(dataItemUpdate, {
        indexStep: this.indexStep,
        StatusStep: 0,
        ListUserId: { results: listUserStep1 },
      });
      Object.assign(dataHistoryUpdate, {
        indexStep: this.indexStep,
        StatusStep: 0,
        ListUserId: { results: listUserStep1 },
      });
    } else {
      let listUserStep2 = this.state.detailItem.ListUser;
      if (listUserStep2.findIndex((us) => us == this.currentUser.Id) == -1) {
        listUserStep2.push(this.currentUser.Id);
      }
      Object.assign(dataItemUpdate, {
        indexStep: this.indexStep,
        StatusStep: status,
        ListUserId: { results: listUserStep2 },
      });
      Object.assign(dataHistoryUpdate, {
        indexStep: this.indexStep,
        StatusStep: status,
        ListUserId: { results: listUserStep2 },
      });
    }
    this.HistoryStepUpdate = returnArray(historyStep);
    Object.assign(dataItemUpdate, { HistoryStep: JSON.stringify(historyStep) });
    Object.assign(dataHistoryUpdate, {
      HistoryStep: JSON.stringify(historyStep),
    });
    console.log(dataItemUpdate);
    console.log(dataHistoryUpdate);
    console.log(objStepConfig);
    // this.SendEmailRequest(this.indexStep, objStepConfig);

    let itemRequest = await shareService.UpdateItem(
      this.WFTable.WFCode,
      this.ItemIndex,
      dataItemUpdate
    );
    if (isNotNull(itemRequest.success)) {
      let detailUpdate = await shareService.GetItemDetailByID(
        this.WFTable.WFCode,
        this.ItemIndex,
        []
      );
      let NewHistoryModified = returnArray(this.HistoryStepUpdate);
      NewHistoryModified = loadModifiedDate(
        NewHistoryModified,
        detailUpdate.DateModified,
        dataItemUpdate.StatusStep
      );
      let dataUpdate = { HistoryStep: JSON.stringify(NewHistoryModified) };
      await shareService.UpdateItem(
        this.WFTable.WFCode,
        this.ItemIndex,
        dataUpdate
      );
      Object.assign(dataHistoryUpdate, {
        HistoryStep: JSON.stringify(NewHistoryModified),
      });

      if (
        isNotNull(this.state.detailItem.ObjParentWF) &&
        dataItemUpdate.StatusStep == 1
      ) {
        // if (this.state.detailItem.ObjParentWF.isWaitting) {
        await this.updateParrent(
          this.state.detailItem.ObjParentWF,
          dataParentInput,
          dataParentView,
          detailUpdate.DateModified
        );
        // }
      }

      if (this.state.AttachmentRequest.length > 0) {
        this.saveFileAttachments(
          this.ItemIndex,
          this.WFTable.WFCode,
          "AttachmentRequest",
          dataHistoryUpdate,
          0,
          objStepConfig
        );
      } else {
        this.updateItemHistory(dataHistoryUpdate, objStepConfig, "", "");
      }
    } else {
      console.log(itemRequest.errors);
      this.hideLoadingPage();
      alert("Error: " + itemRequest.errors);
    }
  }

  updateItemSubForm(status, objDetailField, subForm) {
    let stepTitle = objDetailField.wfStepTable.find(
      (x) => x.indexStep == objDetailField.indexStep
    );
    let historyStep = objDetailField.detailRequest.HistoryStep;

    if (historyStep.length > 0) {
      if (status == 0) {
        historyStep[historyStep.length - 1].StatusStep = 1;
      } else {
        historyStep[historyStep.length - 1].StatusStep = status;
      }
      historyStep[historyStep.length - 1].indexStep = objDetailField.indexStep;
      historyStep[historyStep.length - 1].DateFinish = new Date();
      historyStep[historyStep.length - 1].UserApproval = {
        UserId: this.currentUser.Id,
        UserTitle: this.currentUser.Title,
        UserEmail: this.currentUser.Email,
      };
      historyStep[historyStep.length - 1].HistoryId =
        objDetailField.detailHistoryRequest.HistoryId;
    } else {
      historyStep = [
        {
          HistoryId: objDetailField.detailHistoryRequest.HistoryId,
          DateRequest: objDetailField.detailHistoryRequest.DateRequest,
          DateFinish: new Date(),
          indexStep: objDetailField.indexStep,
          StatusStep: status,
          UserRequest: objDetailField.detailHistoryRequest.UserRequest,
          UserApproval: {
            UserId: this.currentUser.Id,
            UserTitle: this.currentUser.Title,
            UserEmail: this.currentUser.Email,
          },
          TitleStep: stepTitle.Title,
          SLA: 0,
          ReasonStep: "",
        },
      ];
      if (status == 0) {
        historyStep[0].StatusStep = 1;
      }
    }

    let historyApprover = objDetailField.detailHistoryRequest.HistoryApprover;
    if (historyApprover.indexOf(this.currentUser.Id) == -1) {
      historyApprover.push(this.currentUser.Id);
    }
    let dataHistoryUpdate = { HistoryApproverId: { results: historyApprover } };
    let dataItemUpdate = { Reason: objDetailField.detailInput.ReasonStep };

    let objStepConfig = "";
    objDetailField.StatusSendEmail.Status = status;

    if (status == 1) {
      const stepNext = checkConditionNextStep(
        objDetailField.indexStep,
        objDetailField.wfStepTable,
        objDetailField.FieldInput,
        objDetailField.detailInput,
        objDetailField.detailRequest
      );
      if (isNotNull(stepNext)) {
        objStepConfig = objDetailField.wfStepTable.find(
          (x) => x.indexStep == stepNext
        );
      }
      if (isNotNull(objStepConfig)) {
        objStepConfig.UserApprover =
          objDetailField.detailInput.UserApprovalStep;

        let listUserItem = objDetailField.detailRequest.ListUser;
        if (
          listUserItem.findIndex(
            (us) => us == objStepConfig.UserApprover.UserId
          ) == -1
        ) {
          listUserItem.push(objStepConfig.UserApprover.UserId);
        }
        Object.assign(dataItemUpdate, {
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserItem },
          indexStep: objStepConfig.indexStep,
          StatusStep: 0,
        });

        Object.assign(dataHistoryUpdate, {
          UserRequestId: this.currentUser.Id,
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserItem },
          indexStep: objStepConfig.indexStep,
          StatusStep: 0,
        });

        historyStep.push({
          HistoryId: objDetailField.detailHistoryRequest.HistoryId,
          DateRequest: new Date(),
          DateFinish: "",
          indexStep: objStepConfig.indexStep,
          StatusStep: 0,
          UserRequest: {
            UserId: this.currentUser.Id,
            UserTitle: this.currentUser.Title,
            UserEmail: this.currentUser.Email,
          },
          UserApproval: objStepConfig.UserApprover,
          TitleStep: objStepConfig.Title,
          SLA: objStepConfig.SLA,
          ReasonStep: "",
        });
      } else {
        Object.assign(dataItemUpdate, {
          indexStep: objDetailField.indexStep,
          StatusStep: status,
        });
        Object.assign(dataHistoryUpdate, {
          indexStep: objDetailField.indexStep,
          StatusStep: status,
        });
        objDetailField.StatusSendEmail.isFinish = true;
      }
    } else if (status == 0) {
      let listUserHistory = objDetailField.detailRequest.ListUser;
      if (
        listUserHistory.findIndex(
          (us) => us == objDetailField.detailInput.UserReAssign.UserId
        ) == -1
      ) {
        listUserHistory.push(objDetailField.detailInput.UserReAssign.UserId);
      }

      Object.assign(dataItemUpdate, {
        indexStep: objDetailField.indexStep,
        StatusStep: 0,
        UserApprovalId: objDetailField.detailInput.UserReAssign.UserId,
        ListUserId: { results: listUserHistory },
      });
      Object.assign(dataHistoryUpdate, {
        indexStep: objDetailField.indexStep,
        StatusStep: 0,
        UserApprovalId: objDetailField.detailInput.UserReAssign.UserId,
        ListUserId: { results: listUserHistory },
      });
      historyStep.push({
        HistoryId: objDetailField.detailHistoryRequest.HistoryId,
        DateRequest: new Date(),
        DateFinish: "",
        indexStep: objDetailField.indexStep,
        StatusStep: 0,
        UserRequest: {
          UserId: this.currentUser.Id,
          UserTitle: this.currentUser.Title,
          UserEmail: this.currentUser.Email,
        },
        UserApproval: objDetailField.detailInput.UserReAssign,
        TitleStep: stepTitle.Title,
        SLA: objStepConfig.SLA,
        ReasonStep: "",
      });
    } else if (status == 3) {
      let listUserStep = objDetailField.detailRequest.ListUser;
      if (listUserStep.findIndex((us) => us == this.currentUser.Id) == -1) {
        listUserStep.push(this.currentUser.Id);
      }
      if (isNotNull(objDetailField.detailInput.BackStep)) {
        objStepConfig = objDetailField.wfStepTable.find(
          (x) => x.indexStep == objDetailField.detailInput.BackStep
        );
      }
      if (isNotNull(objStepConfig)) {
        objStepConfig.UserApprover =
          objDetailField.detailInput.UserApproveBackStep;
        Object.assign(dataItemUpdate, {
          indexStep: objDetailField.detailInput.BackStep,
          StatusStep:
            objDetailField.indexStep > objDetailField.detailInput.BackStep
              ? 3
              : 0,
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserStep },
        });
        Object.assign(dataHistoryUpdate, {
          indexStep: objDetailField.detailInput.BackStep,
          StatusStep:
            objDetailField.indexStep > objDetailField.detailInput.BackStep
              ? 3
              : 0,
          UserApprovalId: objStepConfig.UserApprover.UserId,
          ListUserId: { results: listUserStep },
        });

        historyStep.push({
          HistoryId: objDetailField.detailHistoryRequest.HistoryId,
          DateRequest: new Date(),
          DateFinish: "",
          indexStep: objStepConfig.indexStep,
          StatusStep: 0,
          UserRequest: {
            UserId: this.currentUser.Id,
            UserTitle: this.currentUser.Title,
            UserEmail: this.currentUser.Email,
          },
          UserApproval: objStepConfig.UserApprover,
          TitleStep: objStepConfig.Title,
          SLA: objStepConfig.SLA,
          ReasonStep: "",
        });
      } else {
        Object.assign(dataItemUpdate, {
          indexStep: objDetailField.indexStep,
          StatusStep: 1,
        });
        Object.assign(dataHistoryUpdate, {
          indexStep: objDetailField.indexStep,
          StatusStep: 1,
        });
        objDetailField.StatusSendEmail.isFinish = true;
      }
    } else if (status == -1) {
      let listUserStep1 = objDetailField.detailRequest.ListUser;
      if (listUserStep1.findIndex((us) => us == this.currentUser.Id) == -1) {
        listUserStep1.push(this.currentUser.Id);
      }
      Object.assign(dataItemUpdate, {
        indexStep: objDetailField.indexStep,
        StatusStep: 0,
        ListUserId: { results: listUserStep1 },
      });
      Object.assign(dataHistoryUpdate, {
        indexStep: objDetailField.indexStep,
        StatusStep: 0,
        ListUserId: { results: listUserStep1 },
      });
    } else {
      let listUserStep2 = objDetailField.detailRequest.ListUser;
      if (listUserStep2.findIndex((us) => us == this.currentUser.Id) == -1) {
        listUserStep2.push(this.currentUser.Id);
      }
      Object.assign(dataItemUpdate, {
        indexStep: objDetailField.indexStep,
        StatusStep: status,
        ListUserId: { results: listUserStep2 },
      });
      Object.assign(dataHistoryUpdate, {
        indexStep: objDetailField.indexStep,
        StatusStep: status,
        ListUserId: { results: listUserStep2 },
      });
    }

    for (let i = 0; i < objDetailField.FieldInput.length; i++) {
      if (objDetailField.FieldInput[i].FieldType == "User") {
        if (
          isNotNull(
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ].UserId
          )
        ) {
          Object.assign(dataItemUpdate, {
            [objDetailField.FieldInput[i].InternalName + `Id`]: objDetailField
              .detailInput[objDetailField.FieldInput[i].InternalName].UserId,
          });
        } else {
          Object.assign(dataItemUpdate, {
            [objDetailField.FieldInput[i].InternalName + `Id`]: null,
          });
        }
      } else if (objDetailField.FieldInput[i].FieldType == "UserMulti") {
        let userDefault = [];
        const listPeople =
          objDetailField.detailInput[
            `list_` + objDetailField.FieldInput[i].InternalName
          ];
        for (let i = 0; i < listPeople.length; i++) {
          userDefault.push(listPeople[i].UserId);
        }
        //if (userDefault.length > 0) {
        Object.assign(dataItemUpdate, {
          [objDetailField.FieldInput[i].InternalName + `Id`]: {
            results: userDefault,
          },
        });
        // }
      } else if (objDetailField.FieldInput[i].FieldType == "CheckBox") {
        let arrCheck =
          objDetailField.detailInput[objDetailField.FieldInput[i].InternalName];
        let arrInput = [];
        for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
          if (arrCheck[inChoice].isChecked) {
            arrInput.push(arrCheck[inChoice].Value);
          }
        }
        if (arrInput.length > 0) {
          Object.assign(dataItemUpdate, {
            [objDetailField.FieldInput[i].InternalName]: { results: arrInput },
          });
        } else {
          Object.assign(dataItemUpdate, {
            [objDetailField.FieldInput[i].InternalName]: { results: [] },
          });
        }
      } else if (objDetailField.FieldInput[i].FieldType == "RadioButton") {
        let arrRadio =
          objDetailField.detailInput[objDetailField.FieldInput[i].InternalName];
        let textRadio = "";
        for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
          if (arrRadio[inChoice].isChecked) {
            textRadio = arrRadio[inChoice].Value;
            break;
          }
        }
        Object.assign(dataItemUpdate, {
          [objDetailField.FieldInput[i].InternalName]: textRadio,
        });
      } else if (
        objDetailField.FieldInput[i].FieldType == "YesNo" ||
        objDetailField.FieldInput[i].FieldType == "DateTime"
      ) {
        Object.assign(dataItemUpdate, {
          [objDetailField.FieldInput[i].InternalName]:
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ],
        });
      } else if (objDetailField.FieldInput[i].FieldType == objField.SPLinkWF) {
        let arrSPLink =
          objDetailField.detailInput[objDetailField.FieldInput[i].InternalName];
        let arrInputSPLink = [];
        for (let inSP = 0; inSP < arrSPLink.length; inSP++) {
          arrInputSPLink.push({
            WFId: arrSPLink[inSP].WFId,
            ItemId: arrSPLink[inSP].ItemId,
            indexStep: arrSPLink[inSP].indexStep,
            Title: arrSPLink[inSP].Title,
          });
        }
        Object.assign(dataItemUpdate, {
          [objDetailField.FieldInput[i].InternalName]: JSON.stringify(
            arrInputSPLink
          ),
        });
      } else if (objDetailField.FieldInput[i].FieldType == objField.Hyperlink) {
        let spLink = { Url: null };
        if (
          isNotNull(
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ]
          )
        ) {
          spLink.Url =
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ];
        }
        Object.assign(dataItemUpdate, {
          [objDetailField.FieldInput[i].InternalName]: spLink,
        });
      } else if (
        objDetailField.FieldInput[i].FieldType == objField.PictureLink
      ) {
        let spLink = { Url: null };
        if (
          isNotNull(
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ]
          )
        ) {
          spLink.Url =
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ];
        }
        Object.assign(dataItemUpdate, {
          [objDetailField.FieldInput[i].InternalName]: spLink,
        });
      } else {
        if (
          isNotNull(
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ]
          )
        ) {
          Object.assign(dataItemUpdate, {
            [objDetailField.FieldInput[i].InternalName]:
              objDetailField.detailInput[
                objDetailField.FieldInput[i].InternalName
              ],
          });
        } else {
          Object.assign(dataItemUpdate, {
            [objDetailField.FieldInput[i].InternalName]: null,
          });
        }
      }
    }

    Object.assign(dataItemUpdate, { HistoryStep: JSON.stringify(historyStep) });
    Object.assign(dataHistoryUpdate, {
      HistoryStep: JSON.stringify(historyStep),
    });

    console.log(dataItemUpdate);
    console.log(dataHistoryUpdate);
    console.log(objStepConfig);
    console.log(objDetailField);
    console.log(subForm);

    // this.SendEmailRequest(2, objStepConfig, 3, objDetailField, subForm);

    sp.web.lists
      .getByTitle(objDetailField.WFCode)
      .items.getById(objDetailField.ItemId)
      .update(dataItemUpdate)
      .then((items) => {
        console.log("Approve Request Success");
        this.updateItemHistory(
          dataHistoryUpdate,
          objStepConfig,
          objDetailField,
          subForm
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  updateItemHistory(dataHistoryUpdate, objStepConfig, objDetailField, subForm) {
    if (CheckNull(objDetailField) == "") {
      console.log(dataHistoryUpdate);
      sp.web.lists
        .getByTitle("WFHistory")
        .items.getById(this.WFHistoryId)
        .update(dataHistoryUpdate)
        .then((items) => {
          console.log("Add history Success");
          this.callbackSendEmail(dataHistoryUpdate, objStepConfig, "", "");
        })
        .catch((error) => {
          console.log(error);
          this.hideLoadingPage();
        });
    } else {
      console.log(dataHistoryUpdate);
      sp.web.lists
        .getByTitle("WFHistory")
        .items.getById(objDetailField.detailHistoryRequest.HistoryId)
        .update(dataHistoryUpdate)
        .then((items) => {
          console.log("update history Success");
          // this.reloadSPLink(objDetailField, subForm);
          this.callbackSendEmail(
            dataHistoryUpdate,
            objStepConfig,
            objDetailField,
            subForm
          );
        })
        .catch((error) => {
          console.log(error);
          this.hideLoadingPage();
        });
    }
  }

  async callbackSendEmail(
    dataHistoryUpdate,
    objStepConfig,
    objDetailField,
    subForm
  ) {
    if (CheckNull(objDetailField) == "") {
      if (this.StatusSendEmail.Status != -1) {
        await this.SendEmailRequest(
          this.indexStep,
          objStepConfig,
          dataHistoryUpdate.indexStep
        );
        window.location.href =
          config.pages.wfRequestView +
          `?WFTableId=` +
          this.WFTable.WFId +
          `&ItemIndex=` +
          this.ItemIndex +
          `&indexStep=` +
          dataHistoryUpdate.indexStep;
      } else {
        window.location.href =
          config.pages.wfRequestView +
          `?WFTableId=` +
          this.WFTable.WFId +
          `&ItemIndex=` +
          this.ItemIndex +
          `&indexStep=` +
          dataHistoryUpdate.indexStep;
      }
    } else {
      if (objDetailField.StatusSendEmail.Status != -1) {
        await this.SendEmailRequest(
          objDetailField.indexStep,
          objStepConfig,
          dataHistoryUpdate.indexStep,
          objDetailField
        );
        this.reloadSPLink(subForm);
      }
    }
  }

  async SendEmailRequest(indexStep, objStepConfig, nextStep, objDetailField) {
    let wfStepTable,
      detailItem,
      detailInput,
      StatusSendEmail,
      wfStepFieldAll = [];
    let ItemIndex = "",
      WFId = "",
      WFTitle = "",
      WFCode = "";
    if (CheckNull(objDetailField) == "") {
      wfStepTable = this.wfStepTable;
      detailItem = returnObject(this.state.detailItem);
      detailInput = returnObject(this.state);
      StatusSendEmail = this.StatusSendEmail;
      wfStepFieldAll = this.wfStepFieldAll;
      ItemIndex = this.ItemIndex;
      WFId = this.WFTable.WFId;
      WFTitle = this.WFTable.WFTitle;
      WFCode = this.WFTable.WFCode;
    } else {
      wfStepTable = objDetailField.wfStepTable;
      detailItem = returnObject(objDetailField.detailRequest);
      detailInput = returnObject(objDetailField.detailInput);
      StatusSendEmail = objDetailField.StatusSendEmail;
      wfStepFieldAll = objDetailField.wfFieldTable;
      ItemIndex = objDetailField.ItemId;
      WFId = objDetailField.WFId;
      WFTitle = objDetailField.WFTitle;
      WFCode = objDetailField.WFCode;
    }
    let configStep = wfStepTable.find((x) => x.indexStep == indexStep);
    if (isNotNull(configStep)) {
      let statustitle = "";
      let userR = this.currentUser.Title;
      if (CheckNull(detailItem.UserRequest.UserTitle) != "") {
        userR = CheckNull(detailItem.UserRequest.UserTitle);
      }
      let inforEmailDefault = {
        UserRequest: userR,
        ItemIndex: ItemIndex,
        HomeUrl: config.pages.wfDashboard,
        WorkflowTitleRequest: WFTitle,
        ItemUrl:
          config.pages.wfRequestView +
          `?WFTableId=` +
          WFId +
          `&ItemIndex=` +
          ItemIndex +
          `&indexStep=` +
          nextStep,
      };
      let objApprover = { UserTitle: "", UserEmail: "" };
      let dataSendEmail = { UserRequest: "", UserApprover: "", UserInform: "" };
      if (StatusSendEmail.Status == 1) {
        if (StatusSendEmail.isFinish) {
          statustitle =
            '<font color="#4CAF50" style="font-weight:bold">HOÀN THÀNH</font';
          Object.assign(inforEmailDefault, {
            UserApproval: CheckNull(detailItem.UserApproval.UserTitle),
          });
        } else {
          statustitle =
            '<font color="#4CAF50" style="font-weight:bold">CHẤP THUẬN</font>';

          if (isNotNull(objStepConfig)) {
            if (
              isNotNull(objStepConfig.UserApprover.UserId) &&
              isNotNull(objStepConfig.UserApprover.UserTitle) &&
              isNotNull(objStepConfig.UserApprover.UserEmail)
            ) {
              objApprover.UserEmail = objStepConfig.UserApprover.UserEmail;
              objApprover.UserTitle = objStepConfig.UserApprover.UserTitle;

              Object.assign(inforEmailDefault, {
                UserApproval: objStepConfig.UserApprover.UserTitle,
              });
            }
          } else {
            Object.assign(inforEmailDefault, {
              UserApproval: CheckNull(detailItem.UserApproval.UserTitle),
            });
          }
        }
      } else if (StatusSendEmail.Status == 0) {
        statustitle =
          '<font color="#e86214" style="font-weight:bold">CHUYỂN XỬ LÝ</font>';
        objApprover.UserEmail = detailInput.UserReAssign.UserEmail;
        objApprover.UserTitle = detailInput.UserReAssign.UserTitle;

        Object.assign(inforEmailDefault, {
          UserApproval: detailInput.UserReAssign.UserTitle,
        });
      } else if (StatusSendEmail.Status == 3) {
        if (StatusSendEmail.isFinish) {
          statustitle =
            '<font color="#4CAF50" style="font-weight:bold">HOÀN THÀNH</font';
          Object.assign(inforEmailDefault, {
            UserApproval: CheckNull(detailItem.UserApproval.UserTitle),
          });
        } else {
          if (CheckNullSetZero(indexStep) > CheckNullSetZero(nextStep)) {
            statustitle =
              '<font color="#4CAF50" style="font-weight:bold">YÊU CẦU CHỈNH SỬA LẠI</font>';
          } else {
            statustitle =
              '<font color="#4CAF50" style="font-weight:bold">CHUYỂN BƯỚC</font>';
          }

          if (isNotNull(objStepConfig)) {
            if (
              isNotNull(objStepConfig.UserApprover.UserId) &&
              isNotNull(objStepConfig.UserApprover.UserTitle) &&
              isNotNull(objStepConfig.UserApprover.UserEmail)
            ) {
              objApprover.UserEmail = objStepConfig.UserApprover.UserEmail;
              objApprover.UserTitle = objStepConfig.UserApprover.UserTitle;

              Object.assign(inforEmailDefault, {
                UserApproval: objStepConfig.UserApprover.UserTitle,
              });
            }
          }
        }
      } else {
        statustitle =
          '<font color="#fb0505" style="font-weight:bold">TỪ CHỐI</font>';
        Object.assign(inforEmailDefault, {
          UserApproval: CheckNull(detailItem.UserApproval.UserTitle),
        });
      }
      Object.assign(inforEmailDefault, { StatusTitleRequest: statustitle });

      // Gửi email đến người phê duyệt
      if (
        configStep.ObjEmailCfg.EmailSendApprover.IsActive &&
        isNotNull(objApprover.UserEmail)
      ) {
        const configEmail = await shareService.GetTemplateEmail(
          configStep.ObjEmailCfg.EmailSendApprover.ObjEmailTemplate.TemplateId
        );
        if (
          isNotNull(configEmail.SubjectEmail) &&
          isNotNull(configEmail.BodyEmail) &&
          isNotNull(configEmail.FieldReplateText)
        ) {
          let inforEmailApprover = await shareService.loadInfoEmail(
            inforEmailDefault,
            wfStepFieldAll,
            detailInput,
            detailItem,
            configEmail.FieldReplateText.split(",")
          );

          Object.assign(inforEmailApprover, {
            DearUsers: objApprover.UserTitle,
          });

          console.log(inforEmailApprover);
          dataSendEmail.UserApprover = {
            Title: WFCode,
            IndexItem: ItemIndex,
            Step: indexStep,
            KeyList: WFCode + "_" + ItemIndex,
            SubjectMail: ReplaceFieldMail(
              inforEmailApprover,
              configEmail.SubjectEmail
            ),
            BodyMail: ReplaceFieldMail(
              inforEmailApprover,
              configEmail.BodyEmail
            ),
            SendMailTo: objApprover.UserEmail,
            TypeEmail:
              configStep.ObjEmailCfg.EmailSendApprover.ObjEmailTemplate
                .TemplateTitle,
          };
          console.log(dataSendEmail);
          await this.SendEmail(dataSendEmail.UserApprover);
        }
      }

      //Gửi email dến người yêu cầu
      if (configStep.ObjEmailCfg.EmailSendUserRequest.IsActive) {
        let configEmail = await shareService.GetTemplateEmail(
          configStep.ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate
            .TemplateId
        );
        if (
          isNotNull(configEmail.SubjectEmail) &&
          isNotNull(configEmail.BodyEmail) &&
          isNotNull(configEmail.FieldReplateText)
        ) {
          let inforEmailUserRequest = await shareService.loadInfoEmail(
            inforEmailDefault,
            wfStepFieldAll,
            detailInput,
            detailItem,
            configEmail.FieldReplateText.split(",")
          );

          Object.assign(inforEmailUserRequest, {
            DearUsers: detailItem.UserRequest.UserTitle,
          });

          console.log(inforEmailUserRequest);
          dataSendEmail.UserRequest = {
            Title: WFCode,
            IndexItem: ItemIndex,
            Step: indexStep,
            KeyList: WFCode + "_" + ItemIndex,
            SubjectMail: ReplaceFieldMail(
              inforEmailUserRequest,
              configEmail.SubjectEmail
            ),
            BodyMail: ReplaceFieldMail(
              inforEmailUserRequest,
              configEmail.BodyEmail
            ),
            SendMailTo: detailItem.UserRequest.UserEmail,
            TypeEmail:
              configStep.ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate
                .TemplateTitle,
          };

          console.log(dataSendEmail);
          await this.SendEmail(dataSendEmail.UserRequest);
        }
      }

      if (configStep.ObjEmailCfg.EmailSendInform.IsActive) {
        const configEmail = await shareService.GetTemplateEmail(
          configStep.ObjEmailCfg.EmailSendInform.ObjEmailTemplate.TemplateId
        );
        if (
          isNotNull(configEmail.SubjectEmail) &&
          isNotNull(configEmail.BodyEmail) &&
          isNotNull(configEmail.FieldReplateText)
        ) {
          let inforEmailUserInform = await shareService.loadInfoEmail(
            inforEmailDefault,
            wfStepFieldAll,
            detailInput,
            detailItem,
            configEmail.FieldReplateText.split(",")
          );

          console.log(inforEmailUserInform);
          let informUsers = { UserTitle: "", UserEmail: "" };
          const objUserDefault =
            configStep.ObjEmailCfg.EmailSendInform.ObjUserDefault;
          const objUserField =
            configStep.ObjEmailCfg.EmailSendInform.ObjUserField;
          if (isNotNull(objUserDefault)) {
            for (let ud = 0; ud < objUserDefault.length; ud++) {
              if (isNotNull(informUsers.UserEmail)) {
                if (
                  informUsers.UserEmail.indexOf(objUserDefault[ud].UserEmail) ==
                  -1
                ) {
                  informUsers.UserTitle += "," + objUserDefault[ud].UserTitle;
                  informUsers.UserEmail += ";" + objUserDefault[ud].UserEmail;
                }
              } else {
                informUsers.UserTitle = objUserDefault[ud].UserTitle;
                informUsers.UserEmail = objUserDefault[ud].UserEmail;
              }
            }
          }
          if (isNotNull(objUserField)) {
            for (let uf = 0; uf < objUserField.length; uf++) {
              for (let ufs = 0; ufs < wfStepFieldAll.length; ufs++) {
                if (
                  wfStepFieldAll[ufs].InternalName ==
                    objUserField[uf].InternalName &&
                  objUserField[uf].FieldType == "User"
                ) {
                  if (isNotNull(detailInput[objUserField[uf].InternalName])) {
                    if (isNotNull(informUsers.UserEmail)) {
                      if (
                        informUsers.UserEmail.indexOf(
                          detailInput[wfStepFieldAll[ufs].InternalName]
                            .UserEmail
                        ) == -1
                      ) {
                        informUsers.UserTitle +=
                          "," +
                          detailInput[wfStepFieldAll[ufs].InternalName]
                            .UserTitle;
                        informUsers.UserEmail +=
                          ";" +
                          detailInput[wfStepFieldAll[ufs].InternalName]
                            .UserEmail;
                      }
                    } else {
                      informUsers.UserTitle =
                        detailInput[wfStepFieldAll[ufs].InternalName].UserTitle;
                      informUsers.UserEmail =
                        detailInput[wfStepFieldAll[ufs].InternalName].UserEmail;
                    }
                    break;
                  } else if (
                    isNotNull(detailItem[objUserField[uf].InternalName])
                  ) {
                    if (isNotNull(informUsers.UserEmail)) {
                      if (
                        informUsers.UserEmail.indexOf(
                          detailItem[wfStepFieldAll[ufs].InternalName].UserEmail
                        ) == -1
                      ) {
                        informUsers.UserTitle +=
                          "," +
                          detailItem[wfStepFieldAll[ufs].InternalName]
                            .UserTitle;
                        informUsers.UserEmail +=
                          ";" +
                          detailItem[wfStepFieldAll[ufs].InternalName]
                            .UserEmail;
                      }
                    } else {
                      informUsers.UserTitle =
                        detailItem[wfStepFieldAll[ufs].InternalName].UserTitle;
                      informUsers.UserEmail =
                        detailItem[wfStepFieldAll[ufs].InternalName].UserEmail;
                    }
                    break;
                  }
                } else if (
                  wfStepFieldAll[ufs].InternalName ==
                    objUserField[uf].InternalName &&
                  objUserField[uf].FieldType == "UserMulti"
                ) {
                  if (
                    isNotNull(
                      detailInput[`list_` + objUserField[uf].InternalName]
                    )
                  ) {
                    detailInput[
                      `list_` + wfStepFieldAll[ufs].InternalName
                    ].forEach((element) => {
                      if (isNotNull(informUsers.UserEmail)) {
                        if (
                          informUsers.UserEmail.indexOf(element.UserEmail) == -1
                        ) {
                          informUsers.UserTitle += "," + element.UserTitle;
                          informUsers.UserEmail += ";" + element.UserEmail;
                        }
                      } else {
                        informUsers.UserTitle = element.UserTitle;
                        informUsers.UserEmail = element.UserEmail;
                      }
                    });
                    break;
                  } else if (
                    isNotNull(detailItem[objUserField[uf].InternalName])
                  ) {
                    detailItem[wfStepFieldAll[ufs].InternalName].forEach(
                      (element) => {
                        if (isNotNull(informUsers.UserEmail)) {
                          if (
                            informUsers.UserEmail.indexOf(element.UserEmail) ==
                            -1
                          ) {
                            informUsers.UserTitle += "," + element.UserTitle;
                            informUsers.UserEmail += ";" + element.UserEmail;
                          }
                        } else {
                          informUsers.UserTitle = element.UserTitle;
                          informUsers.UserEmail = element.UserEmail;
                        }
                      }
                    );
                    break;
                  }
                }
              }
            }
          }
          if (isNotNull(informUsers.UserEmail)) {
            Object.assign(inforEmailUserInform, {
              DearUsers: informUsers.UserTitle,
            });
            dataSendEmail.UserInform = {
              Title: WFCode,
              IndexItem: ItemIndex,
              Step: indexStep,
              KeyList: WFCode + "_" + ItemIndex,
              SubjectMail: ReplaceFieldMail(
                inforEmailUserInform,
                configEmail.SubjectEmail
              ),
              BodyMail: ReplaceFieldMail(
                inforEmailUserInform,
                configEmail.BodyEmail
              ),
              SendMailTo: informUsers.UserEmail,
              TypeEmail:
                configStep.ObjEmailCfg.EmailSendInform.ObjEmailTemplate
                  .TemplateTitle,
            };

            console.log(dataSendEmail);
            await this.SendEmail(dataSendEmail.UserInform);
          }
        }
      }
    }
  }

  async SendEmail(dataEmail) {
    await sp.web.lists
      .getByTitle("ListRequestSendMail")
      .items.add(dataEmail)
      .then((itemEmail) => {
        console.log(itemEmail);
      })
      .catch((error) => {
        console.log(error);
        this.hideLoadingPage();
      });
  }

  async searchWFRequest(WFCode, WFId, fieldName) {
    // console.log(WFCode + " , " + WFId + " , " + fieldName + " , " + IdItem)
    let strSelect = `ID,Title,indexStep`;
    let strFilter = ``;

    let start = moment(this.state[fieldName + "|DateStart"])
      .startOf("day")
      .toDate();
    let startDate = ISODateString(start);
    if (isNotNull(this.state[fieldName + "|DateStart"])) {
      if (isNotNull(strFilter)) {
        strFilter += ` and Created ge '` + startDate + `'`;
      } else {
        strFilter = `Created ge '` + startDate + `'`;
      }
    }

    let end = moment(this.state[fieldName + "|DateEnd"])
      .endOf("day")
      .toDate();
    let endDate = ISODateString(end);
    if (isNotNull(this.state[fieldName + "|DateEnd"])) {
      if (isNotNull(strFilter)) {
        strFilter += ` and Created le '` + endDate + `'`;
      } else {
        strFilter = `Created le '` + endDate + `'`;
      }
    }

    let arrList = [];
    await sp.web.lists
      .getByTitle(WFCode)
      .items.select(strSelect)
      .filter(strFilter)
      .get()
      .then((listWF) => {
        listWF.forEach((element) => {
          arrList.push({
            WFId: WFId,
            WFCode: WFCode,
            ItemId: element.ID,
            indexStep: CheckNull(element.indexStep),
            Title: CheckNull(element.Title),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(arrList);
    await this.setState({ [fieldName + "|SearchWorkflow"]: arrList });
  }

  async selectWFRequest(objSPLinkNew, objSPLinkOld) {
    let objSPLink = returnObject(objSPLinkNew);
    let wfTitle = "",
      listStep = [],
      listField = [];
    if (isNotNull(objSPLinkOld)) {
      wfTitle = objSPLinkOld.WFTitle;
      listStep = objSPLinkOld.wfStepTable;
      listField = objSPLinkOld.wfFieldTable;
    } else {
      const wftable = await shareService.GetWFTable(objSPLink.WFId);
      wfTitle = CheckNull(wftable.WFTitle);
      listStep = await shareService.GetWFStepTable(objSPLink.WFId);
      listField = await shareService.GetWFFormField(objSPLink.WFId);
    }
    Object.assign(objSPLink, {
      WFTitle: CheckNull(wfTitle),
      wfStepTable: listStep,
      wfFieldTable: listField,
      StatusSendEmail: { isFinish: false, Status: 0 },
    });

    let arrFieldView = [],
      arrFieldInput = [],
      arrButtonApprove = [];
    const stepIndex1 = listStep.find(
      (st) => st.indexStep == objSPLink.indexStep
    );
    let wfBackStepLink = [];
    let arrwfBackStep = [];
    if (isNotNull(stepIndex1.ObjBackStep)) {
      stepIndex1.ObjBackStep.map((x) => {
        if (isNotNull(listStep.find((y) => y.indexStep == x))) {
          wfBackStepLink.push(listStep.find((y) => y.indexStep == x));
        }
      });
      arrwfBackStep = stepIndex1.ObjBackStep;
    }
    let detailInput = {
      isFormApprove: false,
      ReasonStep: "",
      wfBackStep: wfBackStepLink,
      BackStep: "",
      isUserApprovalStep: false,
      IsEditApproverStep: false,
      TypeUserApproval: "",
      NameGroup: "",
      UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApprovalStep: [],
      listSelect_UserApprovalStep: [],
      IsEditApproverBackStep: false,
      UserApproveBackStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApproveBackStep: [],
      listSelect_UserApproveBackStep: [],
      UserReAssign: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserReAssign: [],
      wfArrayBackStep: arrwfBackStep,
    };
    if (isNotNull(stepIndex1)) {
      let FieldInput = stepIndex1.ObjFieldStep.FieldInput;
      arrButtonApprove = stepIndex1.btnAction;
      let FieldView = new Set(stepIndex1.ObjFieldStep.FieldView);

      arrFieldView = listField.filter((item) =>
        FieldView.has(item.InternalName)
      );
      for (let fi = 0; fi < FieldInput.length; fi++) {
        for (let fl = 0; fl < listField.length; fl++) {
          if (listField[fl].InternalName == FieldInput[fi]) {
            arrFieldInput.push(listField[fl]);
            if (listField[fl].FieldType == "User") {
              if (isNotNull(listField[fl].DefaultValue)) {
                let UserDefault = JSON.parse(listField[fl].DefaultValue);
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: {
                    UserId: UserDefault.UserId,
                    UserTitle: UserDefault.UserTitle,
                    UserEmail: UserDefault.UserEmail,
                  },
                  [`listSearch_` + listField[fl].InternalName]: [],
                });
              } else {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: {
                    UserId: "",
                    UserTitle: "",
                    UserEmail: "",
                  },
                  [`listSearch_` + listField[fl].InternalName]: [],
                });
              }
            } else if (listField[fl].FieldType == "UserMulti") {
              Object.assign(detailInput, {
                [`list_` + listField[fl].InternalName]: [],
                [`search_` + listField[fl].InternalName]: "",
                [`listSearch_` + listField[fl].InternalName]: [],
              });
            } else if (listField[fl].FieldType == "DateTime") {
              Object.assign(detailInput, {
                [listField[fl].InternalName]: null,
              });
            } else if (listField[fl].FieldType == "YesNo") {
              Object.assign(detailInput, {
                [listField[fl].InternalName]: false,
              });
            } else if (
              listField[fl].FieldType == "CheckBox" ||
              listField[fl].FieldType == "RadioButton"
            ) {
              let arrCheck = [];
              const arrChoice = listField[fl].ObjSPField.ObjField.ChoiceField;
              for (let inChoice = 0; inChoice < arrChoice.length; inChoice++) {
                arrCheck.push({ isChecked: false, Value: arrChoice[inChoice] });
              }
              Object.assign(detailInput, {
                [listField[fl].InternalName]: arrCheck,
              });
            } else {
              if (isNotNull(listField[fl].DefaultValue)) {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: listField[fl].DefaultValue,
                });
              } else {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: "",
                });
              }
            }
            break;
          }
        }
      }
      FieldInput = new Set(stepIndex1.ObjFieldStep.FieldInput);
      arrFieldInput = listField.filter((item) =>
        FieldInput.has(item.InternalName)
      );
    } else {
      const stepIndex2 = listStep.find((st) => st.indexStep == 1);
      // if (isNotNull(stepIndex2)) {
      //   let FieldView = stepIndex2.ObjFieldStep.FieldView;
      //   for (let fv = 0; fv < FieldView.length; fv++) {
      //     for (let fl = 0; fl < listField.length; fl++) {
      //       if (listField[fl].InternalName == FieldView[fv]) {
      //         arrFieldView.push(listField[fl]);
      //       }
      //     }
      //   }
      // }
      if (isNotNull(stepIndex2)) {
        let FieldView = new Set(stepIndex2.ObjFieldStep.FieldView);
        arrFieldView = listField.filter((item) =>
          FieldView.has(item.InternalName)
        );
      }
    }
    Object.assign(objSPLink, {
      FieldView: arrFieldView,
      FieldInput: arrFieldInput,
      ButtonApprove: arrButtonApprove,
    });
    const detailItemRequest = await this.GetDetailItemRequest(
      arrFieldView,
      objSPLink.WFCode,
      objSPLink.ItemId
    );
    arrFieldInput.map((item) => {
      const data = detailItemRequest[item.InternalName];
      if (isNotNull(data)) {
        if (item.FieldType == "UserMulti") {
          detailInput[`list_` + item.InternalName] = data;
        } else {
          detailInput[item.InternalName] = data;
        }
      }
    });

    const checkMapUser = await this.checkGetMapUserSubForm(
      objSPLink.indexStep,
      listStep,
      arrFieldInput,
      detailItemRequest,
      detailInput
    );
    detailInput.UserApprovalStep = checkMapUser.UserApprovalStep;
    detailInput.listSelect_UserApprovalStep =
      checkMapUser.listSearch_UserApprovalStep;
    detailInput.IsEditApproverStep = checkMapUser.IsEditApprover;
    detailInput.isUserApprovalStep = checkMapUser.isApproveNext;

    Object.assign(objSPLink, {
      detailRequest: detailItemRequest,
      detailInput: detailInput,
    });

    const detailHistoryRequest = await this.GetDetailHistory(
      objSPLink.WFId,
      objSPLink.ItemId,
      objSPLink.indexStep
    );
    // console.log(detailHistoryRequest);
    Object.assign(objSPLink, { detailHistoryRequest: detailHistoryRequest });

    return objSPLink;
  }

  async removeSPLink(indexSP, InternalName) {
    let arrSPLinkIndex = returnArray(this.state[InternalName]);
    arrSPLinkIndex.splice(indexSP, 1);
    this.setState({ [InternalName]: arrSPLinkIndex });
  }

  // kiểm tra validation và Compare condition field
  checkSaveSubForm(status, wfStepFieldInput, detailInput) {
    let txtCheck = { txtRequired: "", txtCompare: "" };
    for (let i = 0; i < wfStepFieldInput.length; i++) {
      if (wfStepFieldInput[i].FieldType == "UserMulti") {
        if (
          detailInput[`list_` + wfStepFieldInput[i].InternalName].length == 0 &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "User") {
        if (
          !isNotNull(detailInput[wfStepFieldInput[i].InternalName].UserId) &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "YesNo") {
        if (
          !detailInput[wfStepFieldInput[i].InternalName] &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "CheckBox") {
        let arrCheck = detailInput[wfStepFieldInput[i].InternalName];
        let ischeck = false;
        for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
          if (arrCheck[inChoice].isChecked) {
            ischeck = true;
          }
        }
        if (!ischeck && wfStepFieldInput[i].Required == 1) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else if (wfStepFieldInput[i].FieldType == "RadioButton") {
        let arrRadio = detailInput[wfStepFieldInput[i].InternalName];
        let ischeck = false;
        for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
          if (arrRadio[inChoice].isChecked) {
            ischeck = true;
          }
        }
        if (!ischeck && wfStepFieldInput[i].Required == 1) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      } else {
        if (
          !isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
          wfStepFieldInput[i].Required == 1
        ) {
          txtCheck.txtRequired += wfStepFieldInput[i].Title + ", ";
        }
      }
      // check condition field
      let validation = wfStepFieldInput[i].ObjValidation.CompareCondition;
      if (validation.length > 0) {
        for (let j = 0; j < validation.length; j++) {
          if (
            isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
            CheckNull(validation[j].ConditionType == "FieldCompare")
          ) {
            if (wfStepFieldInput[i].FieldType == "DateTime") {
              if (
                !CompareDate(
                  detailInput[wfStepFieldInput[i].InternalName],
                  detailInput[validation[j].FieldCompare],
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].Field +
                  " \n ";
              }
            } else if (wfStepFieldInput[i].FieldType == "Number") {
              if (
                !CompareNumber(
                  detailInput[wfStepFieldInput[i].InternalName],
                  detailInput[validation[j].FieldCompare],
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].FieldCompare +
                  " \n ";
              }
            }
          } else if (
            isNotNull(detailInput[wfStepFieldInput[i].InternalName]) &&
            CheckNull(validation[j].ConditionType == "FieldValue")
          ) {
            if (wfStepFieldInput[i].FieldType == "DateTime") {
              if (
                !CompareDate(
                  detailInput[wfStepFieldInput[i].InternalName],
                  validation[j].Value,
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  moment(validation[j].Value).format("DD/MM/YYYY") +
                  " \n ";
              }
            } else if (wfStepFieldInput[i].FieldType == "Number") {
              if (
                !CompareNumber(
                  detailInput[wfStepFieldInput[i].InternalName],
                  validation[j].Value,
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  wfStepFieldInput[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].Value +
                  " \n ";
              }
            }
          }
        }
      }
    }
    if (
      status == 1 &&
      !isNotNull(detailInput.UserApprovalStep.UserId) &&
      detailInput.isUserApprovalStep
    ) {
      txtCheck.txtRequired += "Người phê duyệt tiếp theo, ";
    }
    return txtCheck;
  }
  // Điều kiện chuyển hướng quy trình
  checkConditionStepSubForm(
    indexStep,
    wfStepTable,
    wfStepFieldInput,
    detailItem,
    detailInput
  ) {
    try {
      let stepIndex = wfStepTable.find((x) => x.indexStep == indexStep);
      let StepNext = stepIndex.StepNextDefault.StepNextDefaultId;
      let conNextStep = false;

      if (stepIndex.ObjStepCondition.IsActive) {
        // conNextStep = true;
        let ArrObjCondition = stepIndex.ObjStepCondition.ObjCondition;
        if (stepIndex.ObjStepCondition.TypeCondition == "Calculate") {
          console.log(wfStepFieldInput);
          for (let i = 0; i < ArrObjCondition.length; i++) {
            let FieldStart = "",
              FieldEnd = "",
              FieldCompare = "";
            if (
              wfStepFieldInput.findIndex(
                (f) => f.InternalName == ArrObjCondition[i].Field.FieldNameStart
              ) != -1
            ) {
              FieldStart = detailInput[ArrObjCondition[i].Field.FieldNameStart];
            } else if (
              detailItem[ArrObjCondition[i].Field.FieldNameStart] != undefined
            ) {
              FieldStart = detailItem[ArrObjCondition[i].Field.FieldNameStart];
            } else {
              FieldStart = undefined;
            }

            if (
              wfStepFieldInput.findIndex(
                (f) => f.InternalName == ArrObjCondition[i].Field.FieldNameEnd
              ) != -1
            ) {
              FieldEnd = detailInput[ArrObjCondition[i].Field.FieldNameEnd];
            } else if (
              detailItem[ArrObjCondition[i].Field.FieldNameEnd] != undefined
            ) {
              FieldEnd = detailItem[ArrObjCondition[i].Field.FieldNameEnd];
            } else {
              FieldEnd = undefined;
            }

            if (
              wfStepFieldInput.findIndex(
                (f) => f.InternalName == ArrObjCondition[i].Field.FieldCompare
              ) != -1
            ) {
              FieldCompare = detailInput[ArrObjCondition[i].Field.FieldCompare];
            } else if (
              detailItem[ArrObjCondition[i].Field.FieldCompare] != undefined
            ) {
              FieldCompare = detailItem[ArrObjCondition[i].Field.FieldCompare];
            } else {
              FieldCompare = undefined;
            }

            if (ArrObjCondition[i].Field.FieldType == "DateTime") {
              conNextStep = false;
              if (isNotNull(FieldStart) && isNotNull(FieldEnd)) {
                let calCon = CalculateDate(FieldStart, FieldEnd) + 1;
                if (
                  ArrObjCondition[i].ConditionType == "FieldCompare" &&
                  isNotNull(calCon) &&
                  isNotNull(FieldCompare)
                ) {
                  conNextStep = CompareDate(
                    calCon,
                    FieldCompare,
                    ArrObjCondition[i].Condition
                  );
                } else if (
                  ArrObjCondition[i].ConditionType == "FieldValue" &&
                  isNotNull(calCon)
                ) {
                  conNextStep = CompareDate(
                    calCon,
                    ArrObjCondition[i].Value,
                    ArrObjCondition[i].Condition
                  );
                }
              }
              if (!conNextStep) {
                break;
              }
            } else if (ArrObjCondition[i].Field.FieldType == "Number") {
              conNextStep = false;
              if (isNotNull(FieldStart) && isNotNull(FieldEnd)) {
                let calCon = CalculateNumber(
                  FieldStart,
                  FieldEnd,
                  ArrObjCondition[i].Field.Calculate
                );
                if (
                  ArrObjCondition[i].ConditionType == "FieldCompare" &&
                  isNotNull(calCon) &&
                  isNotNull(FieldCompare)
                ) {
                  conNextStep = CompareNumber(
                    calCon,
                    FieldCompare,
                    ArrObjCondition[i].Condition
                  );
                } else if (
                  ArrObjCondition[i].ConditionType == "FieldValue" &&
                  isNotNull(calCon)
                ) {
                  conNextStep = CompareNumber(
                    calCon,
                    ArrObjCondition[i].Value,
                    ArrObjCondition[i].Condition
                  );
                }
              }
              if (!conNextStep) {
                break;
              }
            }
          }
        } else if (stepIndex.ObjStepCondition.TypeCondition == "Compare") {
          for (let i = 0; i < ArrObjCondition.length; i++) {
            let FieldStart = "",
              FieldCompare = "";
            if (
              wfStepFieldInput.findIndex(
                (f) => f.InternalName == ArrObjCondition[i].Field
              ) != -1
            ) {
              FieldStart = detailInput[ArrObjCondition[i].Field];
            } else if (detailItem[ArrObjCondition[i].Field] != undefined) {
              FieldStart = detailItem[ArrObjCondition[i].Field];
            }

            if (
              wfStepFieldInput.findIndex(
                (f) => f.InternalName == ArrObjCondition[i].FieldCompare
              ) != -1
            ) {
              FieldCompare = detailInput[ArrObjCondition[i].FieldCompare];
            } else if (detailItem[ArrObjCondition[i].Field] != undefined) {
              FieldCompare = detailItem[ArrObjCondition[i].FieldCompare];
            }

            if (ArrObjCondition[i].FieldType == "DateTime") {
              conNextStep = false;
              if (
                ArrObjCondition[i].ConditionType == "FieldCompare" &&
                isNotNull(FieldStart) &&
                isNotNull(FieldCompare)
              ) {
                conNextStep = CompareDate(
                  FieldStart,
                  FieldCompare,
                  ArrObjCondition[i].Condition
                );
              } else if (
                ArrObjCondition[i].ConditionType == "FieldValue" &&
                isNotNull(FieldStart)
              ) {
                conNextStep = CompareDate(
                  FieldStart,
                  ArrObjCondition[i].Value,
                  ArrObjCondition[i].Condition
                );
              }
              if (!conNextStep) {
                break;
              }
            } else if (ArrObjCondition[i].FieldType == "Number") {
              conNextStep = false;
              if (
                ArrObjCondition[i].ConditionType == "FieldCompare" &&
                isNotNull(FieldStart) &&
                isNotNull(FieldCompare)
              ) {
                conNextStep = CompareNumber(
                  FieldStart,
                  FieldCompare,
                  ArrObjCondition[i].Condition
                );
              } else if (
                ArrObjCondition[i].ConditionType == "FieldValue" &&
                isNotNull(FieldStart)
              ) {
                conNextStep = CompareNumber(
                  FieldStart,
                  ArrObjCondition[i].Value,
                  ArrObjCondition[i].Condition
                );
              }
              if (!conNextStep) {
                break;
              }
            } else if (
              ArrObjCondition[i].FieldType == "Text" ||
              ArrObjCondition[i].FieldType == "TextArea" ||
              ArrObjCondition[i].FieldType == "Dropdown"
            ) {
              conNextStep = false;
              if (
                ArrObjCondition[i].ConditionType == "FieldCompare" &&
                isNotNull(FieldStart) &&
                isNotNull(FieldCompare)
              ) {
                conNextStep = CompareText(
                  FieldStart,
                  FieldCompare,
                  ArrObjCondition[i].Condition
                );
              } else if (ArrObjCondition[i].ConditionType == "FieldValue") {
                conNextStep = CompareText(
                  FieldStart,
                  ArrObjCondition[i].Value,
                  ArrObjCondition[i].Condition
                );
              }
              if (!conNextStep) {
                break;
              }
            }
          }
        }
      }
      if (conNextStep) {
        StepNext =
          stepIndex.ObjStepCondition.StepNextCondition.StepNextConditionId;
      }
      return StepNext;
    } catch (error) {
      console.log(error);
      return 1;
    }
  }

  // lấy người phê duyệt tại bước tiếp theo
  async checkGetMapUserSubForm(
    step,
    wfStepTable,
    wfStepFieldInput,
    detailItem,
    detailInput
  ) {
    let checkUser = {
      UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApprovalStep: [],
      isUserApprovalStep: false,
      isApproveNext: false,
      NameGroup: "",
      IsEditApprover: false,
      TypeUserApproval: "",
    };
    if (step == 1) {
      checkUser.isUserApprovalStep = true;
      return checkUser;
    }
    let checkStepNext = checkConditionNextStep(
      step,
      wfStepTable,
      wfStepFieldInput,
      detailInput,
      detailItem
    );
    checkUser = await this.GetMapUserApproverSubForm(
      checkStepNext,
      wfStepTable
    );

    console.log(checkUser);
    return checkUser;
  }

  async GetMapUserApproverSubForm(step, wfStepTable, detailItem) {
    let checkUser = {
      UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApprovalStep: [],
      isUserApprovalStep: false,
      isApproveNext: false,
      NameGroup: "",
      IsEditApprover: false,
      TypeUserApproval: "",
    };

    if (step == 1) {
      checkUser.UserApprovalStep = detailItem.UserRequest;
      checkUser.listSearch_UserApprovalStep = [detailItem.UserRequest];
      return checkUser;
    }

    const stepNext = wfStepTable.find((x) => x.indexStep == step);
    if (isNotNull(stepNext)) {
      checkUser.isUserApprovalStep = true;

      if (stepNext.TypeofApprover == "Người phê duyệt") {
        checkUser.isApproveNext = true;
        checkUser.IsEditApprover = stepNext.IsEditApprover;
        if (stepNext.GroupApprover.TypeUserApproval == "Một người phê duyệt") {
          checkUser.UserApprovalStep = stepNext.UserApprover;
          checkUser.listSearch_UserApprovalStep = [stepNext.UserApprover];
        } else if (
          stepNext.GroupApprover.TypeUserApproval == "Nhóm người phê duyệt"
        ) {
          checkUser.TypeUserApproval = stepNext.GroupApprover.TypeUserApproval;
          checkUser.NameGroup = stepNext.GroupApprover.Group.Title;
          const listUser = await sp.web.siteGroups
            .getById(stepNext.GroupApprover.Group.ID)
            .users();
          const listUserApproval = [];
          listUser.map((item) => {
            listUserApproval.push({
              UserId: item.Id,
              UserTitle: item.Title,
              UserEmail: item.Email,
            });
          });

          if (listUserApproval.length == 1) {
            checkUser.UserApprovalStep = listUserApproval[0];
          } else if (listUserApproval.length > 1) {
            checkUser.listSearch_UserApprovalStep = listUserApproval;
          }
        }
      } else if (stepNext.TypeofApprover == "Mã và vai trò phê duyệt") {
        let filterDept = `User/Id eq ` + this.currentUser.Id;
        let listDepartment = [];
        listDepartment = await this.GetMapEmployee(filterDept);

        if (listDepartment.length > 0) {
          let filterUser =
            `( DeptCode eq '` +
            listDepartment[0].DeptCode +
            `' and substringof('` +
            stepNext.RoleCode +
            `', RoleCode) and substringof('` +
            stepNext.ApproveCode +
            `', ApproveCode) )`;
          for (let iDept = 1; iDept < listDepartment.length; iDept++) {
            filterUser +=
              ` or ( DeptCode eq '` +
              listDepartment[iDept].DeptCode +
              `' and substringof('` +
              stepNext.RoleCode +
              `', RoleCode) and substringof('` +
              stepNext.ApproveCode +
              `', ApproveCode) )`;
            checkUser.isApproveNext = true;
          }
          const listAllMapUser = await this.GetMapEmployee(filterUser);
          // console.log(listAllMapUser);
          let listMapUser = Array.from(listAllMapUser, ({ User }) => User);

          checkUser.listSearch_UserApprovalStep = listMapUser;
          if (listMapUser.length > 0) {
            checkUser.isApproveNext = true;
          }
          if (listMapUser.length == 1) {
            checkUser.UserApprovalStep = listMapUser[0];
          }
        }
      } else {
        let listDepartment = [];
        if (!isNotNull(stepNext.DepartmentCode)) {
          let filterDept = `User/Id eq ` + currentUserId;
          listDepartment = await this.GetMapEmployee(filterDept);
        } else {
          listDepartment = [stepNext.DepartmentCode];
        }

        let filterUser =
          `( DeptCode eq '` +
          listDepartment[0].DeptCode +
          `' and substringof('` +
          stepNext.RoleCode +
          `', RoleCode) )`;
        for (let iDept = 1; iDept < listDepartment.length; iDept++) {
          filterUser +=
            ` or ( DeptCode eq '` +
            listDepartment[iDept].DeptCode +
            `' and substringof('` +
            stepNext.RoleCode +
            `', RoleCode) )`;
        }
        const listAllMapUser = await this.GetMapEmployee(filterUser);
        // console.log(listAllMapUser);
        let listMapUser = Array.from(listAllMapUser, ({ User }) => User);

        checkUser.listSearch_UserApprovalStep = returnArray(listMapUser);
        if (listMapUser.length == 1) {
          checkUser.UserApprovalStep = listMapUser[0];
        }
      }
    }
    console.log(checkUser);
    return checkUser;
  }

  async reloadSPLink(subForm) {
    console.log("call reloadSPLink");
    const keyDetail = subForm.split("|");

    let isIndexState = { isApprove: false, isDetail: false };
    let objDetail;
    let arrDetailField = [];
    if (keyDetail.length == undefined) {
      return;
    }
    if (CheckNull(keyDetail[2]) == "detail") {
      isIndexState.isDetail = true;
      objDetail = returnObject(this.state.detailItem);
      arrDetailField = returnArray(objDetail[keyDetail[0]]);
    } else if (CheckNull(keyDetail[2]) == "approve") {
      isIndexState.isApprove = true;
      arrDetailField = returnArray(this.state[keyDetail[0]]);
    }

    let objDetailField = returnObject(arrDetailField[keyDetail[1]]);

    let objSPLink = {
      WFId: objDetailField.WFId,
      WFCode: objDetailField.WFCode,
      WFTitle: objDetailField.WFTitle,
      ItemId: objDetailField.ItemId,
      indexStep: objDetailField.indexStep,
      Title: objDetailField.Title,
      StatusSendEmail: { isFinish: false, Status: 0 },

      wfStepTable: objDetailField.wfStepTable,
      wfFieldTable: objDetailField.wfFieldTable,
    };

    const stepN = await this.GetIndexStepRequest(
      objDetailField.WFCode,
      objSPLink.ItemId,
      objDetailField.indexStep
    );
    if (CheckNullSetZero(stepN) > 0) {
      objSPLink.indexStep = stepN;
    }
    let arrFieldView = [],
      arrFieldInput = [],
      arrButtonApprove = [];
    const stepIndex1 = objDetailField.wfStepTable.find(
      (st) => st.indexStep == objSPLink.indexStep
    );
    let wfBackStepLink = [];
    let arrwfBackStep = [];
    if (isNotNull(stepIndex1.ObjBackStep)) {
      stepIndex1.ObjBackStep.map((x) => {
        if (
          isNotNull(objDetailField.wfStepTable.find((y) => y.indexStep == x))
        ) {
          wfBackStepLink.push(
            objDetailField.wfStepTable.find((y) => y.indexStep == x)
          );
        }
      });
      arrwfBackStep = stepIndex1.ObjBackStep;
    }
    let detailInput = {
      isFormApprove: false,
      ReasonStep: "",
      wfBackStep: wfBackStepLink,
      BackStep: "",
      isUserApprovalStep: false,
      IsEditApproverStep: false,
      TypeUserApproval: "",
      NameGroup: "",
      UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApprovalStep: [],
      listSelect_UserApprovalStep: [],
      IsEditApproverBackStep: false,
      UserApproveBackStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApproveBackStep: [],
      listSelect_UserApproveBackStep: [],
      UserReAssign: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserReAssign: [],
      wfArrayBackStep: arrwfBackStep,
    };
    let listField = objDetailField.wfFieldTable;
    if (isNotNull(stepIndex1)) {
      let FieldInput = stepIndex1.ObjFieldStep.FieldInput;
      arrButtonApprove = stepIndex1.btnAction;
      let FieldView = new Set(stepIndex1.ObjFieldStep.FieldView);

      arrFieldView = listField.filter((item) =>
        FieldView.has(item.InternalName)
      );
      for (let fi = 0; fi < FieldInput.length; fi++) {
        for (let fl = 0; fl < listField.length; fl++) {
          if (listField[fl].InternalName == FieldInput[fi]) {
            arrFieldInput.push(listField[fl]);
            if (listField[fl].FieldType == "User") {
              if (isNotNull(listField[fl].DefaultValue)) {
                let UserDefault = JSON.parse(listField[fl].DefaultValue);
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: {
                    UserId: UserDefault.UserId,
                    UserTitle: UserDefault.UserTitle,
                    UserEmail: UserDefault.UserEmail,
                  },
                  [`listSearch_` + listField[fl].InternalName]: [],
                });
              } else {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: {
                    UserId: "",
                    UserTitle: "",
                    UserEmail: "",
                  },
                  [`listSearch_` + listField[fl].InternalName]: [],
                });
              }
            } else if (listField[fl].FieldType == "UserMulti") {
              Object.assign(detailInput, {
                [`list_` + listField[fl].InternalName]: [],
                [`search_` + listField[fl].InternalName]: "",
                [`listSearch_` + listField[fl].InternalName]: [],
              });
            } else if (listField[fl].FieldType == "DateTime") {
              Object.assign(detailInput, {
                [listField[fl].InternalName]: null,
              });
            } else if (listField[fl].FieldType == "YesNo") {
              Object.assign(detailInput, {
                [listField[fl].InternalName]: false,
              });
            } else if (
              listField[fl].FieldType == "CheckBox" ||
              listField[fl].FieldType == "RadioButton"
            ) {
              let arrCheck = [];
              const arrChoice = listField[fl].ObjSPField.ObjField.ChoiceField;
              for (let inChoice = 0; inChoice < arrChoice.length; inChoice++) {
                arrCheck.push({ isChecked: false, Value: arrChoice[inChoice] });
              }
              Object.assign(detailInput, {
                [listField[fl].InternalName]: arrCheck,
              });
            } else {
              if (isNotNull(listField[fl].DefaultValue)) {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: listField[fl].DefaultValue,
                });
              } else {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: "",
                });
              }
            }
            break;
          }
        }
      }
      FieldInput = new Set(stepIndex1.ObjFieldStep.FieldInput);
      arrFieldInput = listField.filter((item) =>
        FieldInput.has(item.InternalName)
      );
    } else {
      const stepIndex2 = objDetailField.wfStepTable.find(
        (st) => st.indexStep == 1
      );

      if (isNotNull(stepIndex2)) {
        let FieldView = new Set(stepIndex2.ObjFieldStep.FieldView);
        arrFieldView = listField.filter((item) =>
          FieldView.has(item.InternalName)
        );
      }
    }
    Object.assign(objSPLink, {
      FieldView: arrFieldView,
      FieldInput: arrFieldInput,
      ButtonApprove: arrButtonApprove,
    });
    const detailItemRequest = await this.GetDetailItemRequest(
      arrFieldView,
      objDetailField.WFCode,
      objSPLink.ItemId
    );

    arrFieldInput.map((item) => {
      const data = detailItemRequest[item.InternalName];
      if (isNotNull(data)) {
        if (item.FieldType == "UserMulti") {
          detailInput[`list_` + item.InternalName] = data;
        } else {
          detailInput[item.InternalName] = data;
        }
      }
    });

    const checkMapUser = await this.checkGetMapUserSubForm(
      objSPLink.indexStep,
      objDetailField.wfStepTable,
      arrFieldInput,
      detailItemRequest,
      detailInput
    );
    detailInput.UserApprovalStep = checkMapUser.UserApprovalStep;
    detailInput.listSelect_UserApprovalStep =
      checkMapUser.listSearch_UserApprovalStep;
    detailInput.IsEditApproverStep = checkMapUser.IsEditApprover;
    detailInput.isUserApprovalStep = checkMapUser.isApproveNext;

    Object.assign(objSPLink, {
      detailRequest: detailItemRequest,
      detailInput: detailInput,
    });

    const detailHistoryRequest = await this.GetDetailHistory(
      objSPLink.WFId,
      objSPLink.ItemId,
      objSPLink.indexStep
    );
    Object.assign(objSPLink, { detailHistoryRequest: detailHistoryRequest });

    arrDetailField[keyDetail[1]] = objSPLink;

    if (isIndexState.isApprove) {
      if (this.state.detailItem[keyDetail[0]] != undefined) {
        let objDetailSP = returnObject(this.state.detailItem);
        let arrDetailSP = returnArray(objDetailSP[keyDetail[0]]);
        const inSP = arrDetailSP.findIndex(
          (ds) => ds.ItemId == objSPLink.ItemId
        );
        if (inSP != -1) {
          arrDetailSP[inSP] = objSPLink;
          objDetailSP[keyDetail[0]] = arrDetailSP;

          await this.setState({
            detailItem: objDetailSP,
            [keyDetail[0]]: arrDetailField,
          });
        } else {
          await this.setState({ [keyDetail[0]]: arrDetailField });
        }
      } else {
        await this.setState({ [keyDetail[0]]: arrDetailField });
      }
    } else if (isIndexState.isDetail) {
      objDetail[keyDetail[0]] = arrDetailField;
      if (this.state[keyDetail[0]] != undefined) {
        let arrDetailSP = returnArray(this.state[keyDetail[0]]);
        const inSP = arrDetailSP.findIndex(
          (ds) => ds.ItemId == objSPLink.ItemId
        );
        if (inSP != -1) {
          arrDetailSP[inSP] = objSPLink;
          await this.setState({
            detailItem: objDetail,
            [keyDetail[0]]: arrDetailSP,
          });
        } else {
          await this.setState({ detailItem: objDetail });
        }
      } else {
        await this.setState({ detailItem: objDetail });
      }
    }

    console.log("reloadSPLink success");
  }

  async updateParrent(ObjParentWF, dataSubInput, dataSubView, modifiedDate) {
    let itemUpdate = {};
    let inforParent = await this.GetDetailItemRequest(
      [],
      ObjParentWF.wfTable.WFCode,
      ObjParentWF.ItemIndex
    );
    let checkFinish = await shareService.checkFinishSubProcess(
      inforParent.ObjSubWF,
      true,
      this.ItemIndex,
      this.WFTable.WFCode
    );
    if (
      checkFinish.isParentFinish &&
      ObjParentWF.isWaitting &&
      ObjParentWF.HistoryStep.length > 0 &&
      !ObjParentWF.isFinish &&
      isNotNull(ObjParentWF.UserApproval.UserId)
    ) {
      inforParent.HistoryStep[inforParent.HistoryStep.length - 1].UserApproval =
        ObjParentWF.UserApproval;

      inforParent.HistoryStep[
        inforParent.HistoryStep.length - 1
      ].DateRequest = CheckNull(modifiedDate);

      Object.assign(itemUpdate, {
        UserApprovalId: ObjParentWF.UserApproval.UserId,
        HistoryStep: JSON.stringify(inforParent.HistoryStep),
      });
    }

    let alowData = false;
    let correspondingFields = [];
    if (ObjParentWF.CorrespondingFields) {
      alowData = true;
      correspondingFields = returnArray(ObjParentWF.CorrespondingFields);
    }

    let fieldParentUpdate = await shareService.GetFieldSumUpdate(
      this.WFTable,
      this.ItemIndex,
      ObjParentWF.wfTable.WFId,
      ObjParentWF.createStep,
      dataSubInput,
      dataSubView,
      inforParent.ObjSubWF,
      alowData,
      correspondingFields,
      ObjParentWF.isWaitting
    );
    fieldParentUpdate.map((fieldP) => {
      Object.assign(itemUpdate, {
        [fieldP.InternalName]: fieldP.dataInternalName,
      });
    });

    console.log(itemUpdate);

    if (Object.keys(itemUpdate).length > 0) {
      // console.log(itemUpdate);
      await sp.web.lists
        .getByTitle(ObjParentWF.wfTable.WFCode)
        .items.getById(ObjParentWF.ItemIndex)
        .update(itemUpdate);

      if (
        !ObjParentWF.isFinish &&
        checkFinish &&
        isNotNull(ObjParentWF.UserApproval.UserId)
      ) {
        let historyUpdate = {
          UserApprovalId: ObjParentWF.UserApproval.UserId,
        };
        // console.log(historyUpdate);

        await sp.web.lists
          .getByTitle("WFHistory")
          .items.getById(ObjParentWF.HistoryID)
          .update(historyUpdate);

        if (isNotNull(ObjParentWF.emailInfo)) {
          // console.log(ObjParentWF.emailInfo);
          await this.SendEmail(ObjParentWF.emailInfo);
        }
      }
    }
  }

  async startSubProcess() {
    this.setState({ infoSubProcess: true, isSynchronized: false });
  }

  async checkPermissionView(detailItems) {
    let checkView = false;
    let ArrayWFTable = await shareService.GetArrayWFTable();
    // console.log(ArrayWFTable);

    let listDept = await shareService.GetListDepartment();
    // console.log(listDept);

    let permissionUser = await shareService.checkPermissionUser(
      this.currentUser.Id,
      listDept
    );
    // console.log(permissionUser);
    let WFTableList = [];
    if (permissionUser.Permission == "Admin") {
      checkView = true;
      return checkView;
    }
    if (permissionUser.Permission == "Manager") {
      //Danh sách quy trình All Users
      let wfAllUsers = ArrayWFTable.filter((wf) => wf.WhoIsUsed == "All Users");
      wfAllUsers.map((child) => {
        if (WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          WFTableList.push(child);
        }
      });

      // Lấy danh sách phòng ban và nhân viên mà User có quyền quản lý
      let ArrayDeptNew = [];
      let ArrayDeptUsers = [];
      for (let i = 0; i < permissionUser.Dept.length; i++) {
        let objDept = returnObject(permissionUser.Dept[i]);
        ArrayDeptNew.push(objDept);
        ArrayDeptUsers = this.loadMemberUsersParentDept(
          objDept,
          ArrayDeptUsers
        );
        let deptChild = loadChildBranch(objDept);
        deptChild.map((dept2) => {
          ArrayDeptNew.push(dept2);
          ArrayDeptUsers = this.loadMemberUsersParentDept(
            dept2,
            ArrayDeptUsers
          );
        });
      }
      console.log(ArrayDeptNew);
      console.log(ArrayDeptUsers);

      // lấy danh sách quy trình theo các phòng ban
      let arrayWFByDept = loadWFByDept(ArrayDeptNew, ArrayWFTable);
      console.log(arrayWFByDept);
      arrayWFByDept.map((child) => {
        if (WFTableList.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          WFTableList.push(child);
        }
      });

      //Danh sách quy trình Default Users
      let wfDefaultUsers = ArrayWFTable.filter((wf) => wf.WhoIsUsed == "Users");
      console.log(wfDefaultUsers);
      wfDefaultUsers.map((childUS) => {
        let usDefault = new Set(childUS.UserDefault);
        let duplicatedWF = ArrayDeptUsers.filter((item) =>
          usDefault.has(item.UserId)
        );
        if (
          duplicatedWF.length > 0 &&
          WFTableList.findIndex((wf) => wf.WFId == childUS.WFId) == -1
        ) {
          WFTableList.push(childUS);
        }
      });
      console.log(WFTableList);

      if (
        WFTableList.findIndex((wf) => wf.WFId == this.WFTable.WFId) != -1 &&
        ArrayDeptUsers.findIndex(
          (usCheck) => usCheck.UserId == detailItems.UserRequest.UserId
        ) != -1
      ) {
        checkView = true;
        return checkView;
      }
    }

    return checkView;
  }

  loadMemberUsersParentDept(objDepartment, userMembers) {
    if (
      isNotNull(objDepartment.USerManager.UserId) &&
      userMembers.findIndex(
        (usMn) => usMn.UserId == objDepartment.USerManager.UserId
      ) == -1
    ) {
      userMembers.push(objDepartment.USerManager);
    }
    objDepartment.UserMembers.map((users) => {
      if (userMembers.findIndex((usMb) => usMb.UserId == users.UserId) == -1) {
        userMembers.push(users);
      }
    });
    return userMembers;
  }

  async AddNewSubProcessAsync(arrayAsynchronous) {
    this.showLoadingPage();
    let dataParentView = returnObject(this.state.detailItem);
    let arraySubProcess = returnArray(arrayAsynchronous);
    let detailView = returnObject(this.state.detailItem);
    let arrInforSubOld = returnArray(detailView.ObjSubWF);
    let arrInforSub = returnArray(detailView.ObjSubWF);

    for (let i = 0; i < arraySubProcess.length; i++) {
      let itemSubProcess = returnObject(arraySubProcess[i]);
      if (itemSubProcess.list_SubUserRequest.length > 0) {
        let stepTitleSub = this.wfStepTable.find(
          (x) => x.indexStep == itemSubProcess.indexStep
        );
        if (itemSubProcess.Waitting) {
          let subInfo = await shareService.addNewSubWF(
            this.ItemIndex,
            this.WFHistoryId,
            itemSubProcess.indexStep,
            {},
            dataParentView,
            {},
            stepTitleSub,
            false,
            dataParentView.HistoryStep,
            this.WFTable,
            this.currentUser,
            this.wfStepFieldAll,
            this.state,
            itemSubProcess,
            this.EmailSendToSubProcess,
            this.objStepParentConfig
          );
          subInfo.map((info) => {
            arrInforSub.push(info);
          });
        } else {
          let subInfo = await shareService.addNewSubWF(
            this.ItemIndex,
            this.WFHistoryId,
            itemSubProcess.indexStep,
            {},
            dataParentView,
            {},
            stepTitleSub,
            false,
            dataParentView.HistoryStep,
            this.WFTable,
            this.currentUser,
            this.wfStepFieldAll,
            this.state,
            itemSubProcess,
            this.EmailSendToSubProcess,
            ""
          );
          subInfo.map((info) => {
            arrInforSub.push(info);
          });
        }
      }
    }
    if (arrInforSub.length > arrInforSubOld.length) {
      let dataUpdate = {
        ObjSubWF: JSON.stringify(arrInforSub),
      };

      await shareService.UpdateItem(
        this.WFTable.WFCode,
        this.ItemIndex,
        dataUpdate
      );

      detailView.ObjSubWF = arrInforSub;
      this.ArraySubProcessView = await shareService.loadInfoSub(
        detailView.ObjSubWF
      );
      console.log(this.ArraySubProcessView);
      this.setState({ detailItem: detailView });
    }
    this.hideLoadingPage();
  }

  async resultSubProcess(arraySubProcess, isSynchronized) {
    // console.log(arraySubProcess);

    if (isSynchronized) {
      await this.setState({
        infoSubProcess: false,
        ArraySynchronized: arraySubProcess,
        isSynchronized: false,
      });

      this.updateItem(1);
    } else {
      await this.setState({
        infoSubProcess: false,
        // ArrayAsynchronous: arraySubProcess,
        isSynchronized: false,
        isInformSubProcess: false,
      });
      // console.log(arraySubProcess);
      this.AddNewSubProcessAsync(arraySubProcess);
    }
  }

  closeDialog() {
    this.setState({
      infoSubProcess: false,
      isSynchronized: false,
      isInformSubProcess: false,
    });
  }

  async loadConfigInformSub(
    HistoryStep,
    wfStepTable,
    indexStep,
    StatusStep,
    ObjSubWF
  ) {
    let arrayIndexStepOld = Array.from(HistoryStep, ({ indexStep }) =>
      CheckNullSetZero(indexStep)
    );
    // console.log(arrayIndexStepOld);

    let fieldSPLink = new Set(arrayIndexStepOld);

    let wfStepParentCheck = wfStepTable.filter((item) =>
      fieldSPLink.has(item.indexStep)
    );
    // console.log(wfStepParentCheck);

    let arrayNew = [];
    wfStepParentCheck.map((step) => {
      let ArraySub = step.ObjStepWFId;
      if (
        CheckNull(step.StepWFType) === "Quy trình" &&
        isNotNull(ArraySub) &&
        ArraySub.length > 0
      ) {
        ArraySub.map((subItem1) => {
          let subItemBDB = returnObject(subItem1);
          if (
            subItemBDB.Waitting == false &&
            arrayNew.findIndex(
              (sub) =>
                sub.WFTableId == subItemBDB.WFTableId &&
                sub.indexStep == step.indexStep
            ) == -1
          ) {
            Object.assign(subItemBDB, {
              indexStep: step.indexStep,
              StepTitle: step.Title,
            });
            arrayNew.push(subItemBDB);
          }
        });
      }
    });

    if (ObjSubWF && ObjSubWF.length > 0) {
      let checkFinishSub = await shareService.checkFinishSubProcess(
        ObjSubWF,
        false,
        this.ItemIndex,
        this.WFTable.WFCode
      );
      // console.log(checkFinishSub);

      if (!checkFinishSub.isParentFinish) {
        this.objStepParentConfig = checkFinishSub.ObjParentWF;
        if (StatusStep == 1) {
          let infoStep1 = wfStepTable.find(
            (step) => step.indexStep == indexStep
          );
          if (
            isNotNull(infoStep1) &&
            CheckNull(infoStep1.StepWFType) === "Quy trình"
          ) {
            let arrSub = returnArray(infoStep1.ObjStepWFId);
            arrSub.map((subItem2) => {
              let subItemBB1 = returnObject(subItem2);
              if (
                subItemBB1.Waitting == true &&
                arrayNew.findIndex(
                  (sub) =>
                    sub.Waitting == true &&
                    sub.WFTableId == subItemBB1.WFTableId &&
                    sub.indexStep == infoStep1.indexStep
                ) == -1
              ) {
                Object.assign(subItemBB1, {
                  indexStep: infoStep1.indexStep,
                  StepTitle: infoStep1.Title,
                });
                arrayNew.push(subItemBB1);
              }
            });
          }
        } else if (arrayIndexStepOld.length > 1) {
          let infoStep2 = wfStepTable.find(
            (step) =>
              step.indexStep == arrayIndexStepOld[arrayIndexStepOld.length - 2]
          );
          if (
            isNotNull(infoStep2) &&
            CheckNull(infoStep2.StepWFType) === "Quy trình"
          ) {
            let arrSub = returnArray(infoStep2.ObjStepWFId);
            arrSub.map((subItem3) => {
              let subItemBB2 = returnObject(subItem3);
              if (
                subItemBB2.Waitting == true &&
                arrayNew.findIndex(
                  (sub) =>
                    sub.Waitting == true &&
                    sub.WFTableId == subItemBB2.WFTableId &&
                    sub.indexStep == infoStep2.indexStep
                ) == -1
              ) {
                Object.assign(subItemBB2, {
                  indexStep: infoStep2.indexStep,
                  StepTitle: infoStep2.Title,
                });
                arrayNew.push(subItemBB2);
              }
            });
          }
        }
      }
    }
    console.log(arrayNew);

    let arraySubNew = await shareService.loadControlSub(arrayNew, 0, "");
    console.log(arraySubNew);

    let arrSubInform = [];
    // load danh sách quy trình con mà user được phép tạo
    if (arraySubNew.length > 0) {
      arraySubNew.map((itemSub) => {
        if (
          itemSub.typeSearch == "All Users" ||
          itemSub.listSearch_SubUserRequest.findIndex(
            (usCheck) => usCheck.UserId == this.currentUser.Id
          ) != -1
        ) {
          arrSubInform.push(itemSub);
        }
      });
    }

    return arrSubInform;
  }

  async dialogOpenClose() {
    this.setState({ isInformSubProcess: true });
  }

  async showLoadingPage() {
    await this.setState({ isShowLoadingPage: true });
  }

  async hideLoadingPage() {
    await this.setState({ isShowLoadingPage: false });
  }
}
