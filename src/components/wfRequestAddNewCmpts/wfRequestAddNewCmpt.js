import React, { Component } from "react";
import { config } from "./../../pages/environment.js";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  getFileBuffer,
  formatDate,
  CalculateDate,
  CalculateNumber,
  CompareNumber,
  CompareDate,
  CompareText,
  formatTypeObjField,
  formatTypeCompare,
  ISODateString,
  ReplaceFieldMail,
  returnObject,
  returnArray,
  isValidURL,
  checkFieldStepCondition,
  calculationField,
  FormatCurrency,
  CurrencyToNumber,
  checkConditionNextStep,
  loadModifiedDate,
} from "./../wfShareCmpts/wfShareFunction.js";
import { objField, objDataTransfer } from "./../wfShareCmpts/wfShareModel";
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
  Checkbox,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  Dialog,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
import SimpleExpansionPanel from "components/wfRequestViewCmpts/subFormApprove";
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

export default class RequestAddNew extends Component {
  constructor(props) {
    super(props);

    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      isShowLoadingPage: true,
      isForm: false,
      textPermiss: "",
      outputFile: [],
      IsEditApproverStep: false,
      UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApprovalStep: [],
      listSelect_UserApprovalStep: [],
      nextStepApprove: false,
      wfBackStep: [],
      BackStep: "",
      IsEditApproverBackStep: false,
      UserApproveBackStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApproveBackStep: [],
      listSelect_UserApproveBackStep: [],
      infoSubProcess: false,
      ArraySubProcess: [],
      TypeParentProcess: "",
      ArraySyncParentProcess: [],
      ArrayAsyncParentProcess: [],
      ArrayItemParentProcess: [],
      ParentProcess: "",
      ItemParentProcess: "",
      ParentIndexStep: "",
      ParentSearch: "",
      ParentStepTitle: "",
      ParentProcessDateStart: new Date(
        moment(new Date())
          .subtract(30, "day")
          .hours(0)
          .minutes(0)
          .seconds(0)
          .toDate()
      ),
      ParentProcessDateEnd: new Date(
        moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
      ),
      ArrStatusStepLine: [],
    };

    this.changeFormInput = this.changeFormInput.bind(this);
    this.handleChangeForm = this.handleChangeForm.bind(this);
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

    this.ItemId = undefined;
    this.TitleRequest = "";
    this.HistoryId = 0;
    this.WFTableId = undefined;
    this.WFTableCode = "";
    this.WFTableTitle = "";
    this.wfStepTable = [];
    this.wfStepField = [];
    this.currentUser = undefined;
    this.ArrButtonApprove = [];
    this.fieldSearch = { FieldName: "", FieldType: "", subForm: "" };
    this.isAttachments = false;
    this.AttachmentFiles = [];
    // this.createJsonText();
    this.typingTimeout = null;
    this.outputFileNew = [];
    this.outputFileOld = [];
    this.SpecialCharacters =
      '(Tên tệp không chứa các kí tự đực biệt sau: &#92; / : * ? " < > | # { } % ~ &)';
    this.listSearchWorkflow = [];
    this.listDepartment = [];
    this.listFieldSPLink = [];
    this.listBackStep = {};
    this.indexStep = 1;
    this.WFTable = { WFId: "", WFCode: "", WFTitle: "", WFIndexStep: "" };
    this.ObjSubWF = [];
    this.HistoryStep = [];
    this.isParentProcess = {
      IsActive: false,
      ObjSubWF: [],
      WFTableParent: "",
      detailStep: "",
    };
    this.listUsers = [];
    this.listUsersHistory = [];
    this.EmailSendToSubProcess = "";
    this.PermissonByRole = undefined;
    this.HistoryStepUpdate = [];
    this.newWFStepField = [];
  }

  componentDidMount() {
    let param = getQueryParams(window.location.search);
    console.log(param);
    this.WFTableId = param["WFTableId"];
    this.WFTableCode = param["WFTableCode"];
    this.ItemId = param["ItemId"];
    this.HistoryId = param["HistoryId"];
    this.indexStep = param["indexStep"];
    this.setStateForm();
  }

  async setStateForm() {
    if (!isNotNull(this.indexStep)) {
      this.indexStep = 1;
    }
    this.currentUser = await sp.web.currentUser();
    console.log(this.currentUser);

    const wfTable = await shareService.GetWFTable(this.WFTableId);
    // console.log(wfTable);
    this.WFTable = wfTable;
    this.WFTableTitle = wfTable.WFTitle;

    this.wfStepTable = await shareService.GetWFStepTable(this.WFTableId);
    console.log(this.wfStepTable);

    // this.wfStepField = await shareService.GetWFFormField();
    // console.log(this.wfStepField);
    const stepField = await shareService.GetWFFormField(this.WFTableId);
    console.log(stepField);

    this.EmailSendToSubProcess = await shareService.GetWFTemplateEmail(4);
    // console.log(this.EmailSendToSubProcess);

    const filterDept = `User/Id eq ` + this.currentUser.Id;
    this.listDepartment = await this.GetMapEmployee(filterDept);
    // console.log(this.listDepartment);

    this.PermissonByRole = await shareService.GetPermissonByRole(
      this.currentUser
    );

    const step = this.wfStepTable.find((x) => x.indexStep == this.indexStep);
    if (isNotNull(step)) {
      this.wfStepField = [];

      // let fieldCom = new Set(step.ObjFieldStep.FieldInput);
      // this.wfStepField = stepField.filter((item) =>
      //   fieldCom.has(item.InternalName)
      // );
      let fieldCom = step.ObjFieldStep.FieldInput;
      this.wfStepField = stepField.filter((item) =>
        fieldCom.find((x) => x.InternalName == item.InternalName)
      );
      this.wfStepField.map((itemField) => {
        let newField = fieldCom.find(
          (x) => x.InternalName == itemField.InternalName
        );
        Object.assign(itemField, { ConfigField: newField });
      });
      //  fieldCom.map(fils =>{
      //   let newField = returnObject(fils);
      //   let checkField = stepField.find(fs => fs.InternalName == newField.InternalName);
      //   if(isNotNull(checkField)){
      //     Object.assign(newField, {configField: checkField});
      //     this.wfStepField.push(newField);
      //   }
      // })
      this.newWFStepField = [];
      fieldCom.map((fields) => {
        let checkField = stepField.find(
          (fs) => fs.InternalName == fields.InternalName
        );
        if (isNotNull(checkField)) {
          let newField = returnObject(checkField);
          Object.assign(newField, { ConfigField: fields });
          if (fields.IsFirstColumn) {
            this.newWFStepField.push([newField]);
          } else {
            if (this.newWFStepField.length > 0) {
              let arrFieldIndex = returnArray(
                this.newWFStepField[this.newWFStepField.length - 1]
              );
              let totalColspan = 0;
              arrFieldIndex.map((col) => {
                totalColspan += CheckNullSetZero(col.ConfigField.Colspan);
              });
              if (totalColspan + CheckNullSetZero(fields.Colspan) > 12) {
                this.newWFStepField.push([newField]);
              } else {
                arrFieldIndex.push(newField);
                this.newWFStepField[
                  this.newWFStepField.length - 1
                ] = arrFieldIndex;
              }
            } else {
              this.newWFStepField.push([newField]);
            }
          }
        }
      });
      console.log(this.newWFStepField);

      this.ArrButtonApprove = step.btnAction;
      this.isAttachments = step.ObjFieldStep.isAttachments;
      // console.log(this.wfStepField);

      if (step.StepWFType == "Quy trình" && isNotNull(step.ObjStepWFId)) {
        let arrSub = returnArray(step.ObjStepWFId);
        let arraySub = await shareService.loadControlSub(
          arrSub,
          this.indexStep,
          step.Title
        );
        console.log(arraySub);
        this.setState({ ArraySubProcess: arraySub });
      }
    } else {
      this.wfStepField = stepField;
      this.ArrButtonApprove = ["Save", "Submit", "Reset"];
    }

    let strSelect = `ID,UserApproval/Id,UserApproval/Title,UserApproval/Name,"ListUser/Id,ListUser/Title,ListUser/Name,AttachmentFiles,HistoryStep,ObjParentWF,ObjSubWF`;
    let strExpand = `UserApproval,ListUser,AttachmentFiles`;
    for (let i = 0; i < this.wfStepField.length; i++) {
      if (this.wfStepField[i].FieldType == "User") {
        if (isNotNull(this.wfStepField[i].DefaultValue)) {
          let UserDefault = JSON.parse(this.wfStepField[i].DefaultValue);
          Object.assign(this.state, {
            [this.wfStepField[i].InternalName]: {
              UserId: UserDefault.UserId,
              UserTitle: UserDefault.UserTitle,
              UserEmail: UserDefault.UserEmail,
            },
            [`listSearch_` + this.wfStepField[i].InternalName]: [],
          });
        } else {
          Object.assign(this.state, {
            [this.wfStepField[i].InternalName]: {
              UserId: "",
              UserTitle: "",
              UserEmail: "",
            },
            [`listSearch_` + this.wfStepField[i].InternalName]: [],
          });
        }

        strSelect +=
          "," +
          this.wfStepField[i].InternalName +
          "/Id," +
          this.wfStepField[i].InternalName +
          "/Title," +
          this.wfStepField[i].InternalName +
          "/Name";
        strExpand += "," + this.wfStepField[i].InternalName;
      } else if (this.wfStepField[i].FieldType == "UserMulti") {
        Object.assign(this.state, {
          [`list_` + this.wfStepField[i].InternalName]: [],
          [`search_` + this.wfStepField[i].InternalName]: "",
          [`listSearch_` + this.wfStepField[i].InternalName]: [],
        });

        strSelect +=
          "," +
          this.wfStepField[i].InternalName +
          "/Id," +
          this.wfStepField[i].InternalName +
          "/Title," +
          this.wfStepField[i].InternalName +
          "/Name";
        strExpand += "," + this.wfStepField[i].InternalName;
      } else if (this.wfStepField[i].FieldType == "YesNo") {
        Object.assign(this.state, {
          [this.wfStepField[i].InternalName]: false,
        });
        strSelect += "," + this.wfStepField[i].InternalName;
      } else if (
        this.wfStepField[i].FieldType == "CheckBox" ||
        this.wfStepField[i].FieldType == "RadioButton"
      ) {
        let arrCheck = [];
        const arrChoice = this.wfStepField[i].ObjSPField.ObjField.ChoiceField;
        for (let inChoice = 0; inChoice < arrChoice.length; inChoice++) {
          arrCheck.push({ isChecked: false, Value: arrChoice[inChoice] });
        }
        Object.assign(this.state, {
          [this.wfStepField[i].InternalName]: arrCheck,
        });
        strSelect += "," + this.wfStepField[i].InternalName;
      } else if (this.wfStepField[i].FieldType == "DateTime") {
        Object.assign(this.state, { [this.wfStepField[i].InternalName]: null });
        strSelect += "," + this.wfStepField[i].InternalName;
      } else if (this.wfStepField[i].FieldType == "SPLinkWF") {
        this.listFieldSPLink.push(this.wfStepField[i]);

        Object.assign(this.state, {
          [this.wfStepField[i].InternalName]: [],
          [this.wfStepField[i].InternalName + "|SearchWorkflow"]: [],
          [this.wfStepField[i].InternalName + "|DateStart"]: new Date(
            moment(new Date())
              .subtract(30, "day")
              .hours(0)
              .minutes(0)
              .seconds(0)
              .toDate()
          ),
          [this.wfStepField[i].InternalName + "|DateEnd"]: new Date(
            moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
          ),
        });

        Object.assign(this.state, {
          [this.wfStepField[i].InternalName + "|WFCode"]: CheckNull(
            this.wfStepField[i].ObjSPField.ObjField.ObjSPLink.wfTableCode
          ),
          [this.wfStepField[i].InternalName + "|WFId"]: CheckNull(
            this.wfStepField[i].ObjSPField.ObjField.ObjSPLink.wfTableId
          ),
        });

        // if (
        //   this.wfStepField[i].ObjSPField &&
        //   isNotNull(this.wfStepField[i].ObjSPField.TextField)
        // ) {
        //   const textField = this.wfStepField[i].ObjSPField.TextField.split("|");
        //   Object.assign(this.state, {
        //     [this.wfStepField[i].InternalName + "|WFCode"]: CheckNull(
        //       textField[0]
        //     ),
        //     [this.wfStepField[i].InternalName + "|WFId"]: CheckNull(
        //       textField[1]
        //     ),
        //   });
        // } else {
        //   Object.assign(this.state, {
        //     [this.wfStepField[i].InternalName + "|WFCode"]: "",
        //     [this.wfStepField[i].InternalName + "|WFId"]: "",
        //   });
        // }

        strSelect += "," + this.wfStepField[i].InternalName;
      } else {
        if (isNotNull(this.wfStepField[i].DefaultValue)) {
          Object.assign(this.state, {
            [this.wfStepField[i].InternalName]: this.wfStepField[i]
              .DefaultValue,
          });
        } else {
          Object.assign(this.state, { [this.wfStepField[i].InternalName]: "" });
        }

        strSelect += "," + this.wfStepField[i].InternalName;
      }
    }

    // console.log(this.state);
    if (isNotNull(this.ItemId)) {
      const detailItem = await this.GetDetailItem(strSelect, strExpand);
      console.log(detailItem);
      // console.log(this.AttachmentFiles);
      const objKeyItem = Object.keys(detailItem);
      // console.log(objKeyItem);
      if (objKeyItem.length > 0) {
        for (let k = 0; k < objKeyItem.length; k++) {
          if (isNotNull(detailItem[objKeyItem[k]])) {
            if (detailItem[objKeyItem[k]].UserId != undefined) {
              if (isNotNull(detailItem[objKeyItem[k]].UserId)) {
                this.setState({ [objKeyItem[k]]: detailItem[objKeyItem[k]] });
              }
            } else {
              if (detailItem[objKeyItem[k]].Url != undefined) {
                if (isNotNull(detailItem[objKeyItem[k]].Url)) {
                  this.setState({
                    [objKeyItem[k]]: detailItem[objKeyItem[k]].Url,
                  });
                }
              } else {
                this.setState({ [objKeyItem[k]]: detailItem[objKeyItem[k]] });
              }
            }
          }
        }
        this.setState({ outputFile: this.AttachmentFiles });
        // console.log(this.state)
      } else {
        this.setState({
          isForm: false,
          textPermiss: "Bạn không thể chỉnh sửa yêu cầu này",
        });
      }

      for (let fspl2 = 0; fspl2 < this.listFieldSPLink.length; fspl2++) {
        let textField = this.listFieldSPLink[fspl2].ObjSPField.ObjField
          .ObjSPLink.wfTableCode;
        await this.selectItemRequest(
          textField,
          this.listFieldSPLink[fspl2].InternalName
        );
      }
      if (CheckNullSetZero(this.HistoryId) != 0) {
        this.listUsersHistory = await this.GetListUserHistory();
      }
    }
    this.listBackStep = this.wfStepTable.find(
      (x) => x.indexStep == this.indexStep
    );
    if (isNotNull(this.listBackStep.ObjBackStep)) {
      let wfBackStep = [];

      if (this.listBackStep.ObjBackStep.length == 1) {
        let valueBack = this.listBackStep.ObjBackStep[0];
        let backStep = this.wfStepTable.find((y) => y.indexStep == valueBack);
        if (isNotNull(backStep) && CheckNullSetZero(valueBack) > 0) {
          wfBackStep.push(backStep);
          let checkMapUserLoadBackState = await shareService.GetMapUserApproverNextStep(
            valueBack,
            this.wfStepTable,
            {},
            this.currentUser.Id,
            this.indexStep
          );
          await this.setState({
            BackStep: valueBack,
            UserApproveBackStep: checkMapUserLoadBackState.UserApprovalNextStep,
            listSelect_UserApproveBackStep:
              checkMapUserLoadBackState.listUserApprovalNextStep,
            IsEditApproverBackStep: checkMapUserLoadBackState.IsEditApproval,
          });
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

    // console.log(this.listSearchWorkflow);
    for (let spL = 0; spL < this.listSearchWorkflow.length; spL++) {
      await this.searchWFRequest(
        this.listSearchWorkflow[spL].WFCode,
        this.listSearchWorkflow[spL].WFId,
        this.listSearchWorkflow[spL].InternalName,
        this.listSearchWorkflow[spL].RequestId
      );
    }

    let checkMapUserLoadState = await shareService.checkGetMapUserNextStep(
      this.indexStep,
      this.wfStepTable,
      this.wfStepField,
      this.state,
      {},
      this.currentUser.Id,
      this.indexStep
    );
    // console.log(checkMapUserLoadState);
    let arrayStepLine = await shareService.GetArrayConfigStepLine(
      this.indexStep,
      this.wfStepTable,
      this.wfStepField,
      this.state,
      {},
      this.currentUser,
      this.indexStep,
      []
    );
    // console.log(arrayStepLine);
    await this.setState({
      UserApprovalStep: checkMapUserLoadState.UserApprovalNextStep,
      listSelect_UserApprovalStep:
        checkMapUserLoadState.listUserApprovalNextStep,
      nextStepApprove: checkMapUserLoadState.isApproveNextStep,
      IsEditApproverStep: checkMapUserLoadState.IsEditApproval,
      ArrStatusStepLine: arrayStepLine,
    });

    let objArrayParentProcess = await this.loadConfigParent();
    // console.log(objArrayParentProcess);
    this.setState({
      ArraySyncParentProcess: objArrayParentProcess.SyncParent,
      ArrayAsyncParentProcess: objArrayParentProcess.AsyncParent,
    });
    if (
      (!this.PermissonByRole.Submit ||
        this.ArrButtonApprove.findIndex((btn) => btn == "Submit") == -1) &&
      (!this.PermissonByRole.MoveTo ||
        this.ArrButtonApprove.findIndex((btn) => btn == "BackStep") == -1) &&
      (!this.PermissonByRole.Save ||
        this.ArrButtonApprove.findIndex((btn) => btn == "Save") == -1)
    ) {
      this.setState({
        isForm: false,
        isShowLoadingPage: false,
        textPermiss: "Bạn không có quyền tạo yêu cầu này",
      });
    } else {
      this.setState({ isForm: true, isShowLoadingPage: false });
    }
  }

  async selectItemRequest(WFCode, InternalName) {
    let arrSPLink = returnArray(this.state[InternalName]);

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
      let detailInput = {
        isFormApprove: false,
        ReasonStep: "",
        wfBackStep: listStep.filter(
          (st) => st.indexStep != objSPLink.indexStep
        ),
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
      };
      if (isNotNull(stepIndex1)) {
        let FieldView = stepIndex1.ObjFieldStep.FieldView;
        let FieldInput = stepIndex1.ObjFieldStep.FieldInput;
        arrButtonApprove = stepIndex1.btnAction;
        for (let fv = 0; fv < FieldView.length; fv++) {
          for (let fl = 0; fl < listField.length; fl++) {
            if (listField[fl].InternalName == FieldView[fv]) {
              arrFieldView.push(listField[fl]);
            }
          }
        }
        for (let fi = 0; fi < FieldInput.length; fi++) {
          for (let fl = 0; fl < listField.length; fl++) {
            if (listField[fl].InternalName == FieldInput[fi]) {
              arrFieldInput.push(listField[fl]);
              if (listField[fl].FieldType == "User") {
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: {
                    UserId: "",
                    UserTitle: "",
                    UserEmail: "",
                  },
                  [`listSearch_` + listField[fl].InternalName]: [],
                });
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
                Object.assign(detailInput, {
                  [listField[fl].InternalName]: "",
                });
              }
              break;
            }
          }
        }
      } else {
        const stepIndex2 = listStep.find((st) => st.indexStep == 1);
        if (isNotNull(stepIndex2)) {
          let FieldView = stepIndex2.ObjFieldStep.FieldView;
          for (let fv = 0; fv < FieldView.length; fv++) {
            for (let fl = 0; fl < listField.length; fl++) {
              if (listField[fl].InternalName == FieldView[fv]) {
                arrFieldView.push(listField[fl]);
              }
            }
          }
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

      const checkMapUserSelectItem = await this.checkGetMapUserSubForm(
        objSPLink.indexStep,
        listStep,
        arrFieldInput,
        detailItemRequest,
        detailInput
      );
      detailInput.UserApprovalStep = checkMapUserSelectItem.UserApprovalStep;
      detailInput.listSelect_UserApprovalStep =
        checkMapUserSelectItem.listSearch_UserApprovalStep;
      detailInput.IsEditApproverStep = checkMapUserSelectItem.IsEditApprover;
      detailInput.isUserApprovalStep = checkMapUserSelectItem.isApproveNext;

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

    await this.setState({ [InternalName]: arrSPLink });
  }

  closeBackPage() {
    window.location.href = config.pages.wfMyRequest;
  }

  render() {
    const {
      outputFile,
      wfBackStep,
      listSearch_UserApprovalStep,
      listSelect_UserApprovalStep,
      listSearch_UserApproveBackStep,
      listSelect_UserApproveBackStep,
      IsEditApproverStep,
      IsEditApproverBackStep,
      infoSubProcess,
      ArraySubProcess,
      ArrStatusStepLine,
      ArraySyncParentProcess,
      ArrayAsyncParentProcess,
    } = this.state;
    // console.log(this.state);
    return (
      <Grid container>
        <Card className="formInput btnForm">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={8} xs={12} md={6} xl={8}>
              <h3>
                {isNotNull(this.WFTableTitle)
                  ? this.WFTableTitle
                  : "Tạo mới Yêu cầu"}
              </h3>
            </Grid>
            {CheckNullSetZero(this.ItemId) > 0 ? (
              <Grid item sm={12} xs={12} md={6} xl={4}>
                <div className="btnList pull-right">
                  <Button
                    className="btn btn-text bg-secondary"
                    onClick={() => this.closeBackPage()}
                  >
                    <i className="fa fa-times" /> Đóng
                  </Button>
                </div>
              </Grid>
            ) : (
              ""
            )}
          </Grid>
          {this.state.isForm == true ? (
            <Grid container spacing={3}>
              {this.newWFStepField.map((rows, indexRow) => (
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
                              name={field.InternalName}
                              variant="outlined"
                              className="textField"
                              fullWidth
                              onChange={(event) => this.changeFormInput(event)}
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
                              name={field.InternalName}
                              variant="outlined"
                              className="textArea"
                              rows="4"
                              cols="12"
                              onChange={(event) => this.changeFormInput(event)}
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
                            {field.ObjValidation.CalculateCondition
                              .isCalculate ? (
                              <TextField
                                name={field.InternalName}
                                variant="outlined"
                                className="textField"
                                fullWidth
                                onChange={(event) =>
                                  this.changeFormInput(event)
                                }
                                value={this.state[field.InternalName]}
                                type="number"
                                disabled
                              />
                            ) : (
                              <TextField
                                name={field.InternalName}
                                variant="outlined"
                                className="textField"
                                fullWidth
                                onChange={(event) =>
                                  this.changeFormInput(event)
                                }
                                value={this.state[field.InternalName]}
                                type="number"
                              />
                            )}
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
                                value={
                                  this.state[field.InternalName] != ""
                                    ? this.state[field.InternalName]
                                    : null
                                }
                                inputVariant="outlined"
                                onChange={(date) =>
                                  this.handleChangeForm(
                                    field.InternalName,
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
                                value={this.state[field.InternalName]}
                                onChange={(event) =>
                                  this.changeFormInput(event)
                                }
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
                              name={field.InternalName}
                              variant="outlined"
                              className="textField"
                              fullWidth
                              onChange={this.changeSearchPeople.bind(
                                this,
                                objField.User
                              )}
                              value={this.state[field.InternalName].UserTitle}
                              placeholder="Tìm kiếm người dùng"
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
                                  <div
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
                              name={field.InternalName}
                              variant="outlined"
                              className="textField"
                              fullWidth
                              onChange={this.changeSearchPeople.bind(
                                this,
                                objField.UserMulti
                              )}
                              value={this.state[`search_` + field.InternalName]}
                              placeholder="Tìm kiếm người dùng"
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
                                  <div
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

                            {this.state[`list_` + field.InternalName].length >
                            0 ? (
                              <div className="tagName">
                                {this.state[`list_` + field.InternalName].map(
                                  (users) => (
                                    <p key={users.UserId} className="wrapName">
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
                                    value={this.state[field.InternalName]}
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
                                    this.handleChangeForm(
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
                                    this.handleChangeForm(
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
                                    this.state[field.InternalName + "|WFCode"],
                                    this.state[field.InternalName + "|WFId"],
                                    field.InternalName
                                  )
                                }
                              >
                                <span className="icon">
                                  {" "}
                                  <i className="fa fa-search"></i>
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
                            {this.state[field.InternalName].length > 0 &&
                            field.ObjSPField.ObjField.ObjSPLink.typeSPLink ==
                              "ViewDetail" ? (
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
                              ""
                            )}
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
                              name={field.InternalName}
                              variant="outlined"
                              className="textArea"
                              rows="4"
                              cols="12"
                              onChange={(event) => this.changeFormInput(event)}
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
                              name={field.InternalName}
                              variant="outlined"
                              className="textArea"
                              rows="4"
                              cols="12"
                              onChange={(event) => this.changeFormInput(event)}
                              value={this.state[field.InternalName]}
                            />
                            {CheckNull(this.state[field.InternalName]) != "" ? (
                              <img src={this.state[field.InternalName]}></img>
                            ) : (
                              ""
                            )}
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
                              name={field.InternalName}
                              variant="outlined"
                              className="textArea"
                              rows="4"
                              cols="12"
                              onChange={(event) => this.changeFormInput(event)}
                              value={this.state[field.InternalName]}
                              readOnly
                            />
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
                            <label className="form-label">
                              {field.Title}{" "}
                              {field.Required == 1 ? (
                                <span className="required-field">*</span>
                              ) : (
                                ""
                              )}
                            </label>
                            <TextField
                              name={field.InternalName}
                              variant="outlined"
                              className="textField"
                              fullWidth
                              onChange={(event) => this.changeFormInput(event)}
                              value={this.state[field.InternalName]}
                            />
                          </Grid>
                        );
                    }
                  })}
                </Grid>
              ))}
              {this.state.nextStepApprove && this.PermissonByRole.Submit ? (
                <Grid item sm={6} xs={12}>
                  <label className="form-label">
                    Người phê duyệt <span className="required-field">*</span>
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
              ) : (
                ""
              )}

              {this.ArrButtonApprove.findIndex((x) => x == "BackStep") != -1 &&
              isNotNull(this.listBackStep.ObjBackStep) &&
              this.PermissonByRole.MoveTo ? (
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

              {this.ArrButtonApprove.findIndex((x) => x == "BackStep") != -1 &&
              this.state.BackStep != 0 &&
              this.PermissonByRole.MoveTo ? (
                <Grid item sm={6} xs={12}>
                  <label className="form-label">
                    Người xử lý tại bước chuyển
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

              {this.state.ArraySyncParentProcess.length > 0 ||
              this.state.ArrayAsyncParentProcess.length > 0 ? (
                <Grid
                  container
                  alignItems="flex-end"
                  spacing={3}
                  style={{ margin: 0, border: "solid 1px red" }}
                >
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Loại quy trình</label>
                    <FormControl
                      fullWidth
                      className="selectForm"
                      variant="outlined"
                    >
                      <Select
                        name="TypeParentProcess"
                        value={this.state.TypeParentProcess}
                        onChange={(event) => this.changeParentProcess(event)}
                      >
                        <MenuItem value="">--Select--</MenuItem>
                        <MenuItem value="SyncProcess">
                          Quy trình nối tiếp
                        </MenuItem>
                        <MenuItem value="AsyncProcess">
                          Quy trình song song
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Quy trình cha</label>
                    <FormControl
                      fullWidth
                      className="selectForm"
                      variant="outlined"
                    >
                      <Select
                        name="ParentSearch"
                        value={this.state.ParentSearch}
                        onChange={(event) => this.changeParentProcess(event)}
                      >
                        <MenuItem value="">--Select--</MenuItem>
                        {this.state.TypeParentProcess == "SyncProcess"
                          ? ArraySyncParentProcess.map((itemS, keyS) => (
                              <MenuItem
                                value={
                                  itemS.WFTableId +
                                  "||" +
                                  itemS.indexStep +
                                  "||" +
                                  itemS.StepTitle
                                }
                                key={keyS}
                              >
                                {`${itemS.wfTable.WFTitle} (${itemS.StepTitle})`}
                              </MenuItem>
                            ))
                          : this.state.TypeParentProcess == "AsyncProcess"
                          ? ArrayAsyncParentProcess.map((itemS, keyS) => (
                              <MenuItem
                                value={
                                  itemS.WFTableId +
                                  "||" +
                                  itemS.indexStep +
                                  "||" +
                                  itemS.StepTitle
                                }
                                key={keyS}
                              >
                                {`${itemS.wfTable.WFTitle} (${itemS.StepTitle})`}
                              </MenuItem>
                            ))
                          : ""}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    container
                    alignItems="flex-end"
                    spacing={3}
                    style={{ margin: 0 }}
                  >
                    <Grid item sm={2} xs={12}>
                      <label className="form-label">Từ ngày</label>
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          name="ParentProcessDateStart"
                          value={
                            this.state["ParentProcessDateStart"] != ""
                              ? this.state["ParentProcessDateStart"]
                              : null
                          }
                          inputVariant="outlined"
                          onChange={(date) =>
                            this.handleChangeForm(
                              "ParentProcessDateStart",
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
                          name={"ParentProcessDateEnd"}
                          value={
                            this.state["ParentProcessDateEnd"] != ""
                              ? this.state["ParentProcessDateEnd"]
                              : null
                          }
                          inputVariant="outlined"
                          onChange={(date) =>
                            this.handleChangeForm("ParentProcessDateEnd", date)
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
                        onClick={() => this.searchItemParent()}
                      >
                        <span className="icon">
                          {" "}
                          <i className="fa fa-search"></i>
                        </span>{" "}
                        Tìm kiếm
                      </Button>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <label className="form-label">
                        Yêu cầu của quy trình cha
                      </label>
                      <FormControl
                        fullWidth
                        className="selectForm"
                        variant="outlined"
                      >
                        <Select
                          name="ItemParentProcess"
                          value={this.state.ItemParentProcess}
                          onChange={(event) => this.changeParentProcess(event)}
                        >
                          <MenuItem value="">--Select--</MenuItem>
                          {this.state["ArrayItemParentProcess"].map(
                            (itemS, keyS) => (
                              <MenuItem value={itemS.ID} key={keyS}>
                                {itemS.Title}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                ""
              )}

              {this.isAttachments ? (
                <Grid item sm={6} xs={12}>
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
                      onChange={this.changeFile.bind(this)}
                      type="file"
                      id="fileUpload"
                    />
                    {/* <input onChange={this.changeFile.bind(this)} id="fileUpload" type="file" className="upload" /> */}
                  </div>

                  {outputFile.length > 0 ? (
                    <div>
                      {outputFile.map((itemFile) => (
                        <div key={itemFile.name} className="wrapName">
                          <a onClick={() => this.removeFile(itemFile)}>
                            <i className="fa fa-close text-danger"></i>
                          </a>{" "}
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

              {ArrStatusStepLine.length > 0 ? (
                <Grid
                  item
                  sm={12}
                  xs={12}
                  style={{ border: "solid 1px blue", marginTop: "15px" }}
                >
                  <label className="form-label">Luồng Xử lý yêu cầu</label>
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
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </Grid>
              ) : (
                ""
              )}
              <Grid item sm={12} xs={12} className="text-center">
                <div className="btnList">
                  {this.ArrButtonApprove.length > 0
                    ? this.ArrButtonApprove.map((btn) => {
                        if (btn == "Save" && this.PermissonByRole.Save) {
                          return (
                            <Button
                              className="btn bg-primary"
                              onClick={() => this.checkNewSubProcess(0)}
                              key={btn}
                            >
                              {" "}
                              <span className="icon">
                                <i className="fa fa-search"></i>
                              </span>
                              Lưu
                            </Button>
                          );
                        } else if (
                          btn == "Submit" &&
                          this.PermissonByRole.Submit
                        ) {
                          return (
                            <Button
                              className="btn bg-success"
                              onClick={() => this.checkNewSubProcess(1)}
                              key={btn}
                            >
                              {" "}
                              <span className="icon">
                                <i className="fa fa-send"></i>
                              </span>
                              Gửi đi
                            </Button>
                          );
                        } else if (
                          btn == "BackStep" &&
                          this.PermissonByRole.MoveTo
                        ) {
                          return (
                            <Button
                              className="btn badge-default"
                              onClick={() => this.checkNewSubProcess(3)}
                              key={btn}
                            >
                              {" "}
                              <span className="icon">
                                <i className="fa fa-arrow-circle-right"></i>
                              </span>
                              Chuyển bước
                            </Button>
                          );
                        } else if (btn == "Reset") {
                          return (
                            <Button
                              className="btn bg-secondary"
                              onClick={() => this.resetItem()}
                              key={btn}
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
                </div>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item sm={12} xs={12}>
                <p>{this.state.textPermiss}</p>
              </Grid>
            </Grid>
          )}
        </Card>
        {!infoSubProcess ? (
          ""
        ) : (
          <Dialog open={infoSubProcess} fullWidth maxWidth="xl">
            <WFSubInfo
              ArraySubProcess={ArraySubProcess}
              resultSubProcess={this.resultSubProcess}
              isSynchronized={true}
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
    );
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
        let valueState = event.target.value;
        await this.setState({ [event.target.name]: valueState });
        if (isNotNull(valueState)) {
          let checkMapUserBackFormInput = await shareService.GetMapUserApproverNextStep(
            valueState,
            this.wfStepTable,
            {},
            this.currentUser.Id,
            this.indexStep
          );
          await this.setState({
            UserApproveBackStep: checkMapUserBackFormInput.UserApprovalNextStep,
            listSelect_UserApproveBackStep:
              checkMapUserBackFormInput.listUserApprovalNextStep,
            IsEditApproverBackStep: checkMapUserBackFormInput.IsEditApproval,
          });
        }
      } else {
        let nameState = event.target.name;
        let valueState = event.target.value;

        let fieldCalculate = calculationField(
          nameState,
          valueState,
          this.wfStepField,
          this.state
        );

        if (!isNotNull(fieldCalculate.Value)) {
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
        } else {
          await this.setState({
            [nameState]: valueState,
            [fieldCalculate.Name]: fieldCalculate.Value,
          });
        }

        if (
          checkFieldStepCondition(this.indexStep, nameState, this.wfStepTable)
        ) {
          let checkMapUserFormInput = await shareService.checkGetMapUserNextStep(
            this.indexStep,
            this.wfStepTable,
            this.wfStepField,
            this.state,
            {},
            this.currentUser.Id,
            this.indexStep
          );
          // console.log(checkMapUserFormInput);
          let arrayStepLine = await shareService.GetArrayConfigStepLine(
            this.indexStep,
            this.wfStepTable,
            this.wfStepField,
            this.state,
            {},
            this.currentUser,
            this.indexStep,
            []
          );
          // console.log(arrayStepLine);
          await this.setState({
            UserApprovalStep: checkMapUserFormInput.UserApprovalNextStep,
            listSelect_UserApprovalStep:
              checkMapUserFormInput.listUserApprovalNextStep,
            nextStepApprove: checkMapUserFormInput.isApproveNextStep,
            IsEditApproverStep: checkMapUserFormInput.IsEditApproval,
            ArrStatusStepLine: arrayStepLine,
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
            const checkMapUserBackFormInputSub = await this.GetMapUserApproverSubForm(
              valueBack,
              objDetailField.wfStepTable,
              objDetailField.detailRequest
            );
            objDetailInput.UserApproveBackStep =
              checkMapUserBackFormInputSub.UserApprovalStep;
            objDetailInput.listSelect_UserApproveBackStep =
              checkMapUserBackFormInputSub.listSearch_UserApprovalStep;
            objDetailInput.IsEditApproverBackStep =
              checkMapUserBackFormInputSub.IsEditApprover;
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
              const checkMapUserFormInputBackSub = await this.GetMapUserApproverSubForm(
                valueBack,
                objDetailField.wfStepTable,
                objDetailField.detailRequest
              );
              objDetailInput.UserApproveBackStep =
                checkMapUserFormInputBackSub.UserApprovalStep;
              objDetailInput.listSelect_UserApproveBackStep =
                checkMapUserFormInputBackSub.listSearch_UserApprovalStep;
              objDetailInput.IsEditApproverBackStep =
                checkMapUserFormInputBackSub.IsEditApprover;
            }
          }
        }
      } else {
        objDetailInput[event.target.name] = event.target.value;
        if (
          checkFieldStepCondition(
            objDetailField.indexStep,
            event.target.name,
            objDetailField.wfStepTable
          )
        ) {
          const checkMapUserFormInputSub = await this.checkGetMapUserSubForm(
            objDetailField.indexStep,
            objDetailField.wfStepTable,
            objDetailField.FieldInput,
            objDetailField.detailRequest,
            objDetailField.detailInput
          );
          objDetailInput.UserApprovalStep =
            checkMapUserFormInputSub.UserApprovalStep;
          objDetailInput.listSelect_UserApprovalStep =
            checkMapUserFormInputSub.listSearch_UserApprovalStep;
          objDetailInput.IsEditApproverStep =
            checkMapUserFormInputSub.IsEditApprover;
          objDetailInput.isUserApprovalStep =
            checkMapUserFormInputSub.isApproveNext;
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

  async handleChangeForm(nameState, event, subForm) {
    // console.log(subForm);
    if (CheckNull(subForm) == "") {
      let data = null;
      if (event != null) {
        data = event["_d"];
      }

      let fieldCalculate = calculationField(
        nameState,
        data,
        this.wfStepField,
        this.state
      );

      if (!isNotNull(fieldCalculate.Value)) {
        // await this.setState({ [nameState]: data });
        if (
          isNotNull(fieldCalculate.Name) &&
          this.state[fieldCalculate.Name] != undefined &&
          (isNotNull(fieldCalculate.FieldNameStart) ||
            isNotNull(fieldCalculate.FieldNameEnd))
        ) {
          await this.setState({ [nameState]: data, [fieldCalculate.Name]: "" });
        } else {
          await this.setState({ [nameState]: data });
        }
      } else {
        await this.setState({
          [nameState]: data,
          [fieldCalculate.Name]: fieldCalculate.Value,
        });
      }

      if (
        checkFieldStepCondition(this.indexStep, nameState, this.wfStepTable)
      ) {
        let checkMapUserChangeForm = await shareService.checkGetMapUserNextStep(
          this.indexStep,
          this.wfStepTable,
          this.wfStepField,
          this.state,
          {},
          this.currentUser.Id,
          this.indexStep
        );
        // console.log(checkMapUserChangeForm);
        let arrayStepLine = await shareService.GetArrayConfigStepLine(
          this.indexStep,
          this.wfStepTable,
          this.wfStepField,
          this.state,
          {},
          this.currentUser,
          this.indexStep,
          []
        );
        // console.log(arrayStepLine);
        await this.setState({
          UserApprovalStep: checkMapUserChangeForm.UserApprovalNextStep,
          listSelect_UserApprovalStep:
            checkMapUserChangeForm.listUserApprovalNextStep,
          nextStepApprove: checkMapUserChangeForm.isApproveNextStep,
          IsEditApproverStep: checkMapUserChangeForm.IsEditApproval,
          ArrStatusStepLine: arrayStepLine,
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
        const checkMapUserChangeFormSub = await this.checkGetMapUserSubForm(
          objDetailField.indexStep,
          objDetailField.wfStepTable,
          objDetailField.FieldInput,
          objDetailField.detailRequest,
          objDetailField.detailInput
        );
        objDetailInput.UserApprovalStep =
          checkMapUserChangeFormSub.UserApprovalStep;
        objDetailInput.listSelect_UserApprovalStep =
          checkMapUserChangeFormSub.listSearch_UserApprovalStep;
        objDetailInput.IsEditApproverStep =
          checkMapUserChangeFormSub.IsEditApprover;
        objDetailInput.isUserApprovalStep =
          checkMapUserChangeFormSub.isApproveNext;
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

    // console.log(this.state)
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
        let itemSearch = returnObject(arrSearch[event.target.value]);
        if (
          isNotNull(event.target.value) &&
          arrSPLinkIndex.findIndex((xf) => xf.ItemId == itemSearch.ItemId) == -1
        ) {
          // console.log(event.target.value);
          let objSPLNew = await this.selectWFRequest(
            itemSearch,
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
        let checkMapUserCheckBox = await shareService.checkGetMapUserNextStep(
          this.indexStep,
          this.wfStepTable,
          this.wfStepField,
          this.state,
          {},
          this.currentUser.Id,
          this.indexStep
        );
        // console.log(checkMapUserCheckBox);
        let arrayStepLine = await shareService.GetArrayConfigStepLine(
          this.indexStep,
          this.wfStepTable,
          this.wfStepField,
          this.state,
          {},
          this.currentUser,
          this.indexStep,
          []
        );
        // console.log(arrayStepLine);
        await this.setState({
          UserApprovalStep: checkMapUserCheckBox.UserApprovalNextStep,
          listSelect_UserApprovalStep:
            checkMapUserCheckBox.listUserApprovalNextStep,
          nextStepApprove: checkMapUserCheckBox.isApproveNextStep,
          IsEditApproverStep: checkMapUserCheckBox.IsEditApproval,
          ArrStatusStepLine: arrayStepLine,
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
        const checkMapUserCheckBoxSub = await this.checkGetMapUserSubForm(
          objDetailField.indexStep,
          objDetailField.wfStepTable,
          objDetailField.FieldInput,
          objDetailField.detailRequest,
          objDetailField.detailInput
        );
        objDetailInput.UserApprovalStep =
          checkMapUserCheckBoxSub.UserApprovalStep;
        objDetailInput.listSelect_UserApprovalStep =
          checkMapUserCheckBoxSub.listSearch_UserApprovalStep;
        objDetailInput.IsEditApproverStep =
          checkMapUserCheckBoxSub.IsEditApprover;
        objDetailInput.isUserApprovalStep =
          checkMapUserCheckBoxSub.isApproveNext;
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

  async GetDetailItem(strSelect, strExpand) {
    let detail = {};
    await sp.web.lists
      .getByTitle(this.WFTableCode)
      .items.select(strSelect)
      .expand(strExpand)
      .filter(
        `ID eq ` +
          this.ItemId +
          ` and (StatusRequest eq 0 or StatusStep eq 3 ) `
      )
      .get()
      .then((listWF) => {
        // title = {WFId: this.WFTable.WFId, WFCode: CheckNull(listWF["Code"]), WFTitle: CheckNull(listWF["Title"])}
        // console.log(listWF);
        if (listWF.length > 0) {
          for (let inItem = 0; inItem < this.wfStepField.length; inItem++) {
            if (this.wfStepField[inItem].FieldType == "User") {
              Object.assign(detail, {
                [this.wfStepField[inItem].InternalName]: {
                  UserId: "",
                  UserTitle: "",
                  UserEmail: "",
                },
              });
            } else if (this.wfStepField[inItem].FieldType == "UserMulti") {
              Object.assign(detail, {
                [`list_` + this.wfStepField[inItem].InternalName]: [],
              });
            } else if (
              this.wfStepField[inItem].FieldType == "CheckBox" ||
              this.wfStepField[inItem].FieldType == "RadioButton"
            ) {
              let arrCheck = [];
              if (
                isNotNull(this.state[this.wfStepField[inItem].InternalName])
              ) {
                arrCheck = this.state[this.wfStepField[inItem].InternalName];
              }
              Object.assign(detail, {
                [this.wfStepField[inItem].InternalName]: arrCheck,
              });
            } else if (this.wfStepField[inItem].FieldType == "YesNo") {
              Object.assign(detail, {
                [this.wfStepField[inItem].InternalName]: false,
              });
            } else if (this.wfStepField[inItem].FieldType == "SPLinkWF") {
              Object.assign(detail, {
                [this.wfStepField[inItem].InternalName]: "",
              });
            } else {
              Object.assign(detail, {
                [this.wfStepField[inItem].InternalName]: "",
              });
            }
          }
          Object.assign(detail, {
            UserApprovalStep: { UserId: "", UserTitle: "", UserEmail: "" },
          });

          if (isNotNull(listWF[0]["ListUser"])) {
            listWF[0]["ListUser"].forEach((item) => {
              this.listUsers.push(item["Id"]);
            });
          }

          this.TitleRequest = listWF[0].Title;
          for (let outItem = 0; outItem < this.wfStepField.length; outItem++) {
            if (this.wfStepField[outItem].FieldType == "User") {
              if (
                isNotNull(listWF[0][this.wfStepField[outItem].InternalName])
              ) {
                detail[this.wfStepField[outItem].InternalName] = {
                  UserId: listWF[0][this.wfStepField[outItem].InternalName].Id,
                  UserTitle:
                    listWF[0][this.wfStepField[outItem].InternalName].Title,
                  UserEmail: listWF[0][
                    this.wfStepField[outItem].InternalName
                  ].Name.split("|")[2],
                };
                // detail[`search_` + this.wfStepField[outItem].InternalName] = listWF[0][this.wfStepField[outItem].InternalName].Title;
              }
            } else if (this.wfStepField[outItem].FieldType == "UserMulti") {
              if (
                isNotNull(listWF[0][this.wfStepField[outItem].InternalName])
              ) {
                listWF[0][this.wfStepField[outItem].InternalName].forEach(
                  (item) => {
                    detail[
                      `list_` + this.wfStepField[outItem].InternalName
                    ].push({
                      UserId: item["Id"],
                      UserTitle: item["Title"],
                      UserEmail: item["Name"].split("|")[2],
                    });
                  }
                );
              }
            } else if (this.wfStepField[outItem].FieldType == "Number") {
              if (
                isNotNull(listWF[0][this.wfStepField[outItem].InternalName])
              ) {
                detail[
                  this.wfStepField[outItem].InternalName
                ] = CheckNullSetZero(
                  listWF[0][this.wfStepField[outItem].InternalName]
                );
              }
            } else if (this.wfStepField[outItem].FieldType == "DateTime") {
              if (
                isNotNull(listWF[0][this.wfStepField[outItem].InternalName])
              ) {
                detail[this.wfStepField[outItem].InternalName] = moment(
                  listWF[0][this.wfStepField[outItem].InternalName]
                ).format("YYYY-MM-DD");
              }
            } else if (this.wfStepField[outItem].FieldType == "RadioButton") {
              const txtRadio =
                listWF[0][this.wfStepField[outItem].InternalName];
              if (isNotNull(txtRadio)) {
                for (
                  let ischeck = 0;
                  ischeck <
                  detail[this.wfStepField[outItem].InternalName].length;
                  ischeck++
                ) {
                  if (
                    detail[this.wfStepField[outItem].InternalName][ischeck]
                      .Value == txtRadio
                  ) {
                    detail[this.wfStepField[outItem].InternalName][
                      ischeck
                    ].isChecked = true;
                    break;
                  }
                }
                // detail[this.wfStepField[outItem].InternalName] = CheckNull(listWF[0][this.wfStepField[outItem].InternalName]);
              }
            } else if (this.wfStepField[outItem].FieldType == "CheckBox") {
              const arrCheck =
                listWF[0][this.wfStepField[outItem].InternalName];
              if (isNotNull(arrCheck)) {
                for (let index = 0; index < arrCheck.length; index++) {
                  for (
                    let ischeck = 0;
                    ischeck <
                    detail[this.wfStepField[outItem].InternalName].length;
                    ischeck++
                  ) {
                    if (
                      detail[this.wfStepField[outItem].InternalName][ischeck]
                        .Value == arrCheck[index]
                    ) {
                      detail[this.wfStepField[outItem].InternalName][
                        ischeck
                      ].isChecked = true;
                    }
                  }
                }

                // detail[this.wfStepField[outItem].InternalName] = CheckNull(listWF[0][this.wfStepField[outItem].InternalName]);
              }
            } else if (this.wfStepField[outItem].FieldType == "YesNo") {
              detail[this.wfStepField[outItem].InternalName] = CheckNull(
                listWF[0][this.wfStepField[outItem].InternalName]
              );
            } else if (this.wfStepField[outItem].FieldType == "SPLinkWF") {
              const spLink = CheckNull(
                listWF[0][this.wfStepField[outItem].InternalName]
              );
              // detail[this.wfStepField[outItem].InternalName] = spLink;
              if (isNotNull(spLink)) {
                detail[this.wfStepField[outItem].InternalName] = JSON.parse(
                  spLink
                );
                // const arrSPLink = spLink.split(";;");
                // const indexSPLink = this.listSearchWorkflow.findIndex(x => x.InternalName == [this.wfStepField[outItem].InternalName]);
                // if (indexSPLink != -1) {
                //   this.listSearchWorkflow[indexSPLink].RequestId = CheckNullSetZero(arrSPLink[1])
                // }
              } else {
                detail[this.wfStepField[outItem].InternalName] = [];
              }
            } else if (
              this.wfStepField[outItem].FieldType == "PictureLink" ||
              this.wfStepField[outItem].FieldType == "Hyperlink"
            ) {
              if (
                isNotNull(listWF[0][this.wfStepField[outItem].InternalName])
              ) {
                {
                  detail[this.wfStepField[outItem].InternalName] = CheckNull(
                    listWF[0][this.wfStepField[outItem].InternalName].Url
                  );
                }
              }
            } else {
              detail[this.wfStepField[outItem].InternalName] = CheckNull(
                listWF[0][this.wfStepField[outItem].InternalName]
              );
            }
          }

          if (isNotNull(listWF[0]["UserApproval"])) {
            detail["UserApprovalStep"] = {
              UserId: listWF[0]["UserApproval"].Id,
              UserTitle: listWF[0]["UserApproval"].Title,
              UserEmail: listWF[0]["UserApproval"].Name.split("|")[2],
            };
          }

          if (isNotNull(listWF[0]["HistoryStep"])) {
            this.HistoryStep = JSON.parse(listWF[0]["HistoryStep"]);
          }

          if (listWF[0]["AttachmentFiles"].length > 0) {
            listWF[0]["AttachmentFiles"].forEach((element) => {
              this.AttachmentFiles.push({
                name: element.FileName,
                fileOutput: "",
                type: 1,
              });
            });
          }

          if (isNotNull(listWF[0]["ObjSubWF"])) {
            this.ObjSubWF = JSON.parse(listWF[0]["ObjSubWF"]);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return detail;
  }

  callChangeFile(type) {
    console.log(type);
    if (type == "AttachmentRequest") {
      document.getElementById("fileUpload").click();
    } else if (type == "AttachmentComment") {
      document.getElementById("fileUploadComment").click();
    }
  }

  changeFile(typeFile, event) {
    event.preventDefault();
    let file = event.target.files[0];
    let files = this.state[typeFile];
    if (files.length > 0) {
      if (files.findIndex((x) => x.name == file.name) === -1) {
        files.push(file);
      }
    } else {
      files.push(file);
    }
    this.setState({ [typeFile]: files });
    event.target.value = null;
  }

  createJsonText() {
    const TypeLeave = {
      Type: "Dropdown",
      ObjField: {
        ChoiceField: [
          "Nghỉ phép",
          "Nghỉ ốm",
          "Nghỉ việc riêng",
          "Nghỉ không lương",
        ],
      },
    };
    console.log(JSON.stringify(TypeLeave));

    const TimeLeave = {
      Type: "Dropdown",
      ObjField: {
        ChoiceField: [
          "Nghỉ cả ngày",
          "Nghỉ buổi sáng",
          "Nghỉ buổi chiều",
          "Đến muộn",
          "Về sớm",
        ],
      },
    };
    console.log(JSON.stringify(TimeLeave));

    const StartDate = {
      Type: "DateTime",
      ObjField: {
        DateTimeFormat: "DateOnly",
      },
    };
    console.log(JSON.stringify(StartDate));

    const EndDate = {
      Type: "DateTime",
      ObjField: {
        DateTimeFormat: "DateTime",
      },
    };
    console.log(JSON.stringify(EndDate));

    const btn = ["Save", "Submit", "Reset"];
    console.log(JSON.stringify(btn));

    let ObjStepCondition = {
      IsActive: true,
      CalculateCondition: {
        isCalculate: true,
        FieldNameEnd: "End_Date",
        FieldNameStart: "Start_Date",
        Calculation: "-",
        Condition: ">=",
        Value: "",
      },
      CompareCondition: [],
    };
    console.log(JSON.stringify(ObjStepCondition));

    let ObjStepValidation = {
      IsActive: true,
      CalculateCondition: {
        isCalculate: false,
        FieldNameEnd: "",
        FieldNameStart: "",
        Calculation: "",
      },
      CompareCondition: [
        {
          Condition: ">",
          Field: "Start Date",
          FieldCompare: "Start_Date",
          Value: "",
        },
      ],
    };
    console.log(JSON.stringify(ObjStepValidation));

    let ObjStepCondition3 = {
      IsActive: false,
      CalculateCondition: {
        isCalculate: false,
        FieldNameEnd: "",
        FieldNameStart: "",
        Calculation: "",
      },
      CompareCondition: [],
    };
    console.log(JSON.stringify(ObjStepCondition3));
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
      listSearch_UserApprovalStep: [],
      listSelect_UserApprovalStep: [],
      BackStep: "",
      UserApproveBackStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listSearch_UserApproveBackStep: [],
      listSelect_UserApproveBackStep: [],
      ArrayItemParentProcess: [],
      ParentProcess: "",
      ItemParentProcess: "",
    });
    this.outputFileNew = [];
    this.outputFileOld = [];
  }

  checkSaveForm(status) {
    let txtCheck = { txtRequired: "", txtCompare: "", txtCheckLink: "" };
    for (let i = 0; i < this.wfStepField.length; i++) {
      if (this.wfStepField[i].FieldType == "UserMulti") {
        if (
          this.state[`list_` + this.wfStepField[i].InternalName].length == 0 &&
          this.wfStepField[i].Required == 1
        ) {
          // alert("You have not entered "+ this.wfStepField[i].Title);
          txtCheck.txtRequired += this.wfStepField[i].Title + ", ";
          // return false;
        }
      } else if (this.wfStepField[i].FieldType == "User") {
        if (
          !isNotNull(this.state[this.wfStepField[i].InternalName].UserId) &&
          this.wfStepField[i].Required == 1
        ) {
          // alert("You have not entered "+ this.wfStepField[i].Title);
          txtCheck.txtRequired += this.wfStepField[i].Title + ", ";
          // return false;
        }
      } else if (this.wfStepField[i].FieldType == "YesNo") {
        if (
          !this.state[this.wfStepField[i].InternalName] &&
          this.wfStepField[i].Required == 1
        ) {
          txtCheck.txtRequired += this.wfStepField[i].Title + ", ";
        }
      } else if (this.wfStepField[i].FieldType == "CheckBox") {
        let arrCheck = this.state[this.wfStepField[i].InternalName];
        let ischeck = false;
        for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
          if (arrCheck[inChoice].isChecked) {
            ischeck = true;
          }
        }
        if (!ischeck && this.wfStepField[i].Required == 1) {
          txtCheck.txtRequired += this.wfStepField[i].Title + ", ";
        }
      } else if (this.wfStepField[i].FieldType == "RadioButton") {
        let arrRadio = this.state[this.wfStepField[i].InternalName];
        let ischeck = false;
        for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
          if (arrRadio[inChoice].isChecked) {
            ischeck = true;
          }
        }
        if (!ischeck && this.wfStepField[i].Required == 1) {
          txtCheck.txtRequired += this.wfStepField[i].Title + ", ";
        }
      } else if (
        this.wfStepField[i].FieldType == "Hyperlink" ||
        this.wfStepField[i].FieldType == "PictureLink"
      ) {
        if (isNotNull(this.state[this.wfStepField[i].InternalName])) {
          if (!isValidURL(this.state[this.wfStepField[i].InternalName])) {
            txtCheck.txtCheckLink += this.wfStepField[i].Title + ", ";
          }
        }
      } else {
        if (
          !isNotNull(this.state[this.wfStepField[i].InternalName]) &&
          this.wfStepField[i].Required == 1
        ) {
          // alert("You have not entered "+ this.wfStepField[i].Title);
          txtCheck.txtRequired += this.wfStepField[i].Title + ", ";
          // return false;
        }
      }
      // check condition field
      let validation = this.wfStepField[i].ObjValidation.CompareCondition;
      if (validation.length > 0) {
        for (let j = 0; j < validation.length; j++) {
          if (
            isNotNull(this.state[this.wfStepField[i].InternalName]) &&
            CheckNull(validation[j].ConditionType == "FieldCompare")
          ) {
            if (this.wfStepField[i].FieldType == "DateTime") {
              if (
                !CompareDate(
                  this.state[this.wfStepField[i].InternalName],
                  this.state[validation[j].FieldCompare],
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  this.wfStepField[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].Field +
                  " \n ";
              }
              // console.log(FieldName);
            } else if (this.wfStepField[i].FieldType == "Number") {
              if (
                !CompareNumber(
                  this.state[this.wfStepField[i].InternalName],
                  this.state[validation[j].FieldCompare],
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  this.wfStepField[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  validation[j].FieldCompare +
                  " \n ";
              }
            }
          } else if (
            isNotNull(this.state[this.wfStepField[i].InternalName]) &&
            CheckNull(validation[j].ConditionType == "FieldValue")
          ) {
            if (this.wfStepField[i].FieldType == "DateTime") {
              if (
                !CompareDate(
                  this.state[this.wfStepField[i].InternalName],
                  validation[j].Value,
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  this.wfStepField[i].Title +
                  " phải " +
                  formatTypeCompare(validation[j].Condition) +
                  " " +
                  moment(validation[j].Value).format("DD/MM/YYYY") +
                  " \n ";
              }
              // console.log(FieldName);
            } else if (this.wfStepField[i].FieldType == "Number") {
              if (
                !CompareNumber(
                  this.state[this.wfStepField[i].InternalName],
                  validation[j].Value,
                  validation[j].Condition
                )
              ) {
                txtCheck.txtCompare +=
                  this.wfStepField[i].Title +
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
      !isNotNull(this.state.UserApprovalStep.UserId) &&
      this.state.nextStepApprove
    ) {
      txtCheck.txtRequired += "Người phê duyệt, ";
    }
    if (status == 3) {
      if (
        !isNotNull(this.state.UserApproveBackStep.UserId) &&
        isNotNull(this.state.BackStep) &&
        this.state.BackStep != "0"
      ) {
        txtCheck.txtRequired += "Người xử lý tại bước chuyển, ";
      } else if (!isNotNull(this.state.BackStep)) {
        txtCheck.txtRequired += "Bước chuyển, ";
      }
    }

    return txtCheck;
  }

  checkConditionStep(info) {
    let stepTable = "";
    let data = "";
    if (isNotNull(info)) {
      stepTable = info.stepTable;
      data = info.FieldInput;
    } else {
      stepTable = this.wfStepTable;
      data = this.state;
    }
    try {
      let stepIndex = stepTable.find((x) => x.indexStep == this.indexStep);
      let StepNext = stepIndex.StepNextDefault.StepNextDefaultId;
      let conNextStep = false;
      if (stepIndex.ObjStepCondition.IsActive) {
        // conNextStep = true;
        //  stepIndex.ObjStepCondition.ArrayStepCondition
        let arrCondition = stepIndex.ObjStepCondition.ArrayStepCondition;
        if (arrCondition.length > 0) {
          let ArrObjCondition = arrCondition.sort(
            (prev, current) => prev.Priority - current.Priority
          );
          for (let item = 0; item < ArrObjCondition.length; item++) {
            //  ArrObjCondition.map(ArrObjCondition[item] => {
            // let ArrObjCondition[item] = ArrObjCondition.reduce((prev, current) => (prev.Priority < current.Priority) ? prev : current)
            if (ArrObjCondition[item].TypeCondition == "Calculate") {
              for (
                let i = 0;
                i < ArrObjCondition[item].ObjCondition.length;
                i++
              ) {
                if (
                  ArrObjCondition[item].ObjCondition[i].Field.FieldType ==
                  "DateTime"
                ) {
                  conNextStep = false;
                  if (
                    isNotNull(
                      data[
                        ArrObjCondition[item].ObjCondition[i].Field
                          .FieldNameStart
                      ]
                    ) &&
                    isNotNull(
                      data[
                        ArrObjCondition[item].ObjCondition[i].Field.FieldNameEnd
                      ]
                    )
                  ) {
                    let calCon =
                      CalculateDate(
                        data[
                          ArrObjCondition[item].ObjCondition[i].Field
                            .FieldNameStart
                        ],
                        data[
                          ArrObjCondition[item].ObjCondition[i].Field
                            .FieldNameEnd
                        ]
                      ) + 1;
                    // console.log(FieldName);
                    if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                      "FieldValue"
                    ) {
                      conNextStep = CompareNumber(
                        calCon,
                        ArrObjCondition[item].ObjCondition[i].Value,
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    } else if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                        "FieldCompare" &&
                      isNotNull(calCon) &&
                      isNotNull(
                        data[ArrObjCondition[item].ObjCondition[i].FieldCompare]
                      )
                    ) {
                      conNextStep = CompareNumber(
                        calCon,
                        data[
                          ArrObjCondition[item].ObjCondition[i].FieldCompare
                        ],
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    }
                  }

                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                } else if (
                  ArrObjCondition[item].ObjCondition[i].Field.FieldType ==
                  "Number"
                ) {
                  conNextStep = false;
                  if (
                    isNotNull(
                      data[
                        ArrObjCondition[item].ObjCondition[i].Field
                          .FieldNameStart
                      ]
                    ) &&
                    isNotNull(
                      data[
                        ArrObjCondition[item].ObjCondition[i].Field.FieldNameEnd
                      ]
                    )
                  ) {
                    let calCon = CalculateNumber(
                      data[
                        ArrObjCondition[item].ObjCondition[i].Field
                          .FieldNameStart
                      ],
                      data[
                        ArrObjCondition[item].ObjCondition[i].Field.FieldNameEnd
                      ],
                      ArrObjCondition[item].ObjCondition[i].Field.Calculate
                    );
                    // console.log(FieldName);
                    if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                      "FieldValue"
                    ) {
                      conNextStep = CompareNumber(
                        calCon,
                        ArrObjCondition[item].ObjCondition[i].Value,
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    } else if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                        "FieldCompare" &&
                      isNotNull(calCon) &&
                      isNotNull(
                        data[ArrObjCondition[item].ObjCondition[i].FieldCompare]
                      )
                    ) {
                      conNextStep = CompareNumber(
                        calCon,
                        data[
                          ArrObjCondition[item].ObjCondition[i].FieldCompare
                        ],
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    }
                  }

                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                }
              }
            } else if (ArrObjCondition[item].TypeCondition == "Compare") {
              for (
                let i1 = 0;
                i1 < ArrObjCondition[item].ObjCondition.length;
                i1++
              ) {
                if (
                  ArrObjCondition[item].ObjCondition[i1].FieldType == "DateTime"
                ) {
                  conNextStep = false;
                  if (
                    ArrObjCondition[item].ObjCondition[i1].ConditionType ==
                      "FieldValue" &&
                    isNotNull(
                      data[ArrObjCondition[item].ObjCondition[i1].Field]
                    )
                  ) {
                    conNextStep = CompareDate(
                      data[ArrObjCondition[item].ObjCondition[i1].Field],
                      ArrObjCondition[item].ObjCondition[i1].Value,
                      ArrObjCondition[item].ObjCondition[i1].Condition
                    );
                  } else if (
                    ArrObjCondition[item].ObjCondition[i1].ConditionType ==
                      "FieldCompare" &&
                    isNotNull(
                      data[ArrObjCondition[item].ObjCondition[i1].Field]
                    ) &&
                    isNotNull(
                      data[ArrObjCondition[item].ObjCondition[i1].FieldCompare]
                    )
                  ) {
                    conNextStep = CompareDate(
                      data[ArrObjCondition[item].ObjCondition[i1].Field],
                      data[ArrObjCondition[item].ObjCondition[i1].FieldCompare],
                      ArrObjCondition[item].ObjCondition[i1].Condition
                    );
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                } else if (
                  ArrObjCondition[item].ObjCondition[i1].FieldType == "Number"
                ) {
                  conNextStep = false;
                  if (
                    ArrObjCondition[item].ObjCondition[i1].ConditionType ==
                    "FieldValue"
                  ) {
                    conNextStep = CompareNumber(
                      data[ArrObjCondition[item].ObjCondition[i1].Field],
                      ArrObjCondition[item].ObjCondition[i1].Value,
                      ArrObjCondition[item].ObjCondition[i1].Condition
                    );
                  } else if (
                    ArrObjCondition[item].ObjCondition[i1].ConditionType ==
                      "FieldCompare" &&
                    isNotNull(
                      data[ArrObjCondition[item].ObjCondition[i1].Field]
                    ) &&
                    isNotNull(
                      data[ArrObjCondition[item].ObjCondition[i1].FieldCompare]
                    )
                  ) {
                    conNextStep = CompareNumber(
                      data[ArrObjCondition[item].ObjCondition[i1].Field],
                      data[ArrObjCondition[item].ObjCondition[i1].FieldCompare],
                      ArrObjCondition[item].ObjCondition[i1].Condition
                    );
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                } else if (
                  ArrObjCondition[item].ObjCondition[i1].FieldType == "Text" ||
                  ArrObjCondition[item].ObjCondition[i1].FieldType ==
                    "TextArea" ||
                  ArrObjCondition[item].ObjCondition[i1].FieldType == "Dropdown"
                ) {
                  conNextStep = false;
                  if (
                    ArrObjCondition[item].ObjCondition[i1].ConditionType ==
                    "FieldValue"
                  ) {
                    conNextStep = CompareText(
                      data[ArrObjCondition[item].ObjCondition[i1].Field],
                      ArrObjCondition[item].ObjCondition[i1].Value,
                      ArrObjCondition[item].ObjCondition[i1].Condition
                    );
                  } else if (
                    ArrObjCondition[item].ObjCondition[i1].ConditionType ==
                      "FieldCompare" &&
                    isNotNull(
                      data[ArrObjCondition[item].ObjCondition[i1].Field]
                    ) &&
                    isNotNull(
                      data[ArrObjCondition[item].ObjCondition[i1].FieldCompare]
                    )
                  ) {
                    conNextStep = CompareText(
                      data[ArrObjCondition[item].ObjCondition[i1].Field],
                      data[ArrObjCondition[item].ObjCondition[i1].FieldCompare],
                      ArrObjCondition[item].ObjCondition[i1].Condition
                    );
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                }
              }
            }
            if (conNextStep) {
              StepNext =
                ArrObjCondition[item].StepNextCondition.StepNextConditionId;
              break;
            }
          }
        }
      }
      return StepNext;
    } catch (error) {
      console.log(error);
      return 1;
    }
  }

  async saveItem(status) {
    this.showLoadingPage();
    let stepTable = this.wfStepTable;
    let wfStepField = this.wfStepField;
    let data = this.state;

    let stepTitle = stepTable.find((x) => x.indexStep == this.indexStep);
    let historyStep = returnArray(this.HistoryStep);
    if (historyStep.length > 0) {
      historyStep[historyStep.length - 1].StatusStep = status;
      historyStep[historyStep.length - 1].indexStep = this.indexStep;
      historyStep[historyStep.length - 1].DateFinish = new Date();
      historyStep[historyStep.length - 1].UserApproval = {
        UserId: this.currentUser.Id,
        UserTitle: this.currentUser.Title,
        UserEmail: this.currentUser.Email,
      };
    } else {
      historyStep.push({
        HistoryId: CheckNullSetZero(this.HistoryId),
        DateRequest: new Date(),
        DateFinish: new Date(),
        indexStep: this.indexStep,
        StatusStep: status,
        UserRequest: {
          UserId: this.currentUser.Id,
          UserTitle: this.currentUser.Title,
          UserEmail: this.currentUser.Email,
        },
        UserApproval: {
          UserId: this.currentUser.Id,
          UserTitle: this.currentUser.Title,
          UserEmail: this.currentUser.Email,
        },
        TitleStep: isNotNull(stepTitle) ? stepTitle.Title : "Người yêu cầu",
        SLA: 0,
        ReasonStep: "",
      });
    }
    let dataItemAdd = {
      UserRequestId: this.currentUser.Id,
      StatusRequest: status == 3 ? 1 : status,
    };

    let dataItemHistory = {
      UserRequestId: this.currentUser.Id,
      UserCreatedId: this.currentUser.Id,
      StatusRequest: status == 3 ? 1 : status,
      DateRequest: new Date(),
      WFTableId: this.WFTableId,
    };

    for (let i = 0; i < wfStepField.length; i++) {
      if (wfStepField[i].FieldType == "User") {
        if (isNotNull(data[wfStepField[i].InternalName].UserId)) {
          Object.assign(dataItemAdd, {
            [wfStepField[i].InternalName + `Id`]: data[
              wfStepField[i].InternalName
            ].UserId,
          });
        } else {
          Object.assign(dataItemAdd, {
            [wfStepField[i].InternalName + `Id`]: null,
          });
        }
      } else if (wfStepField[i].FieldType == "UserMulti") {
        let userDefault = [];
        const listPeople = data[`list_` + wfStepField[i].InternalName];
        for (let i = 0; i < listPeople.length; i++) {
          userDefault.push(listPeople[i].UserId);
        }
        //   if (userDefault.length > 0) {
        Object.assign(dataItemAdd, {
          [wfStepField[i].InternalName + `Id`]: { results: userDefault },
        });
        // }
      } else if (wfStepField[i].FieldType == "CheckBox") {
        let arrCheck = data[wfStepField[i].InternalName];
        let arrInput = [];
        for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
          if (arrCheck[inChoice].isChecked) {
            arrInput.push(arrCheck[inChoice].Value);
          }
        }
        if (arrInput.length > 0) {
          Object.assign(dataItemAdd, {
            [wfStepField[i].InternalName]: { results: arrInput },
          });
        } else {
          Object.assign(dataItemAdd, {
            [wfStepField[i].InternalName]: { results: [] },
          });
        }
      } else if (wfStepField[i].FieldType == "RadioButton") {
        let arrRadio = data[wfStepField[i].InternalName];
        let textRadio = "";
        for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
          if (arrRadio[inChoice].isChecked) {
            textRadio = arrRadio[inChoice].Value;
            break;
          }
        }
        //  if (isNotNull(textRadio)) {
        Object.assign(dataItemAdd, {
          [wfStepField[i].InternalName]: textRadio,
        });
        // }
      } else if (wfStepField[i].FieldType == "YesNo") {
        Object.assign(dataItemAdd, {
          [wfStepField[i].InternalName]: data[wfStepField[i].InternalName],
        });
      } else if (
        wfStepField[i].FieldType == "Hyperlink" ||
        wfStepField[i].FieldType == "PictureLink"
      ) {
        let dataLink = { Url: data[wfStepField[i].InternalName] };
        Object.assign(dataItemAdd, { [wfStepField[i].InternalName]: dataLink });
      } else if (wfStepField[i].FieldType == objField.SPLinkWF) {
        let arrSPLink = this.state[wfStepField[i].InternalName];
        let arrInputSPLink = [];
        for (let inSP = 0; inSP < arrSPLink.length; inSP++) {
          arrInputSPLink.push({
            WFId: arrSPLink[inSP].WFId,
            ItemId: arrSPLink[inSP].ItemId,
            indexStep: arrSPLink[inSP].indexStep,
            Title: arrSPLink[inSP].Title,
          });
        }
        Object.assign(dataItemAdd, {
          [wfStepField[i].InternalName]: JSON.stringify(arrInputSPLink),
        });
      } else {
        if (isNotNull(data[wfStepField[i].InternalName])) {
          Object.assign(dataItemAdd, {
            [wfStepField[i].InternalName]: data[wfStepField[i].InternalName],
          });
        } else {
          Object.assign(dataItemAdd, { [wfStepField[i].InternalName]: null });
        }
      }
    }

    if (stepTitle.ObjEmailCfg.EmailSendInform.IsActive) {
      const objUserDefault = returnArray(
        stepTitle.ObjEmailCfg.EmailSendInform.ObjUserDefault
      );
      for (let ud = 0; ud < objUserDefault.length; ud++) {
        if (this.listUsers.indexOf(objUserDefault[ud].UserId) == -1) {
          this.listUsers.push(objUserDefault[ud].UserId);
        }
      }
    }

    let objStepConfig = "";
    let objStepConfigSub = "";
    let isSubProcess = false;
    let isFinishParent = false;
    if (stepTable.length > 1) {
      if (status == 1) {
        // const stepNext = this.checkConditionStep();
        const stepNext = checkConditionNextStep(
          this.indexStep,
          this.wfStepTable,
          this.wfStepField,
          this.state,
          {}
        );
        let objStepConfigOld = this.wfStepTable.find(
          (x) => x.indexStep == stepNext
        );

        if (isNotNull(objStepConfigOld)) {
          objStepConfig = returnObject(objStepConfigOld);

          objStepConfigSub = returnObject(objStepConfigOld);
          objStepConfigSub.UserApprover = this.state.UserApprovalStep;

          if (this.state.ArraySubProcess.length > 0) {
            isSubProcess = true;

            if (
              this.state.ArraySubProcess.findIndex(
                (sp) => sp.Waitting == true
              ) != -1
            ) {
              objStepConfig.UserApprover = {
                UserId: null,
                UserTitle: "",
                UserEmail: "",
              };
            } else {
              objStepConfig.UserApprover = this.state.UserApprovalStep;
            }
          } else {
            objStepConfig.UserApprover = this.state.UserApprovalStep;
          }
          if (
            isNotNull(objStepConfigSub.UserApprover.UserId) &&
            this.listUsers.indexOf(objStepConfigSub.UserApprover.UserId) == -1
          ) {
            this.listUsers.push(objStepConfigSub.UserApprover.UserId);
          }

          Object.assign(dataItemAdd, {
            UserApprovalId: objStepConfig.UserApprover.UserId,
            ListUserId: { results: this.listUsers },
            indexStep: objStepConfig.indexStep,
            StatusStep: 0,
          });

          if (
            isNotNull(objStepConfigSub.UserApprover.UserId) &&
            this.listUsersHistory.indexOf(
              objStepConfigSub.UserApprover.UserId
            ) == -1
          ) {
            this.listUsersHistory.push(objStepConfigSub.UserApprover.UserId);
          }

          Object.assign(dataItemHistory, {
            UserApprovalId: objStepConfig.UserApprover.UserId,
            ListUserId: { results: this.listUsersHistory },
            indexStep: objStepConfig.indexStep,
            StatusStep: 0,
          });
          historyStep.push({
            HistoryId: CheckNullSetZero(this.HistoryId),
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
          Object.assign(dataItemAdd, { indexStep: 1, StatusStep: 1 });
          Object.assign(dataItemHistory, { indexStep: 1, StatusStep: 1 });
          if (this.state.ArraySubProcess.length > 0) {
            isSubProcess = true;
            isFinishParent = true;
          }
        }
      } else if (status == 3) {
        let objStepConfigOld = stepTable.find(
          (x) => x.indexStep == this.state.BackStep
        );
        if (isNotNull(objStepConfigOld)) {
          objStepConfig = returnObject(objStepConfigOld);
          objStepConfig.UserApprover = this.state.UserApproveBackStep;

          if (
            isNotNull(objStepConfig.UserApprover.UserId) &&
            this.listUsers.indexOf(objStepConfig.UserApprover.UserId) == -1
          ) {
            this.listUsers.push(objStepConfig.UserApprover.UserId);
          }

          Object.assign(dataItemAdd, {
            UserApprovalId: objStepConfig.UserApprover.UserId,
            ListUserId: { results: this.listUsers },
            indexStep: objStepConfig.indexStep,
            StatusStep: 0,
          });

          if (
            isNotNull(objStepConfig.UserApprover.UserId) &&
            this.listUsersHistory.indexOf(objStepConfig.UserApprover.UserId) ==
              -1
          ) {
            this.listUsersHistory.push(objStepConfig.UserApprover.UserId);
          }

          Object.assign(dataItemHistory, {
            UserApprovalId: objStepConfig.UserApprover.UserId,
            ListUserId: { results: this.listUsersHistory },
            indexStep: objStepConfig.indexStep,
            StatusStep: 0,
          });

          historyStep.push({
            HistoryId: CheckNullSetZero(this.HistoryId),
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
          // console.log("step next Finish")
          Object.assign(dataItemAdd, {
            indexStep: this.indexStep,
            StatusStep: 1,
          });
          Object.assign(dataItemHistory, {
            indexStep: this.indexStep,
            StatusStep: 1,
          });
        }
      } else {
        Object.assign(dataItemAdd, {
          indexStep: this.indexStep,
          StatusStep: 0,
        });
        Object.assign(dataItemHistory, {
          indexStep: this.indexStep,
          StatusStep: 0,
        });
        if (isNotNull(this.state.UserApprovalStep.UserId)) {
          Object.assign(dataItemAdd, {
            UserApprovalId: this.state.UserApprovalStep.UserId,
            ListUserId: { results: [this.state.UserApprovalStep.UserId] },
          });
          Object.assign(dataItemHistory, {
            UserApprovalId: this.state.UserApprovalStep.UserId,
            ListUserId: { results: [this.state.UserApprovalStep.UserId] },
          });
        }
      }
    } else {
      Object.assign(dataItemAdd, {
        indexStep: this.indexStep,
        StatusStep: status,
      });
      Object.assign(dataItemHistory, {
        indexStep: this.indexStep,
        StatusStep: status,
      });

      if (this.state.ArraySubProcess.length > 0) {
        isSubProcess = true;
        isFinishParent = true;
      }
    }
    this.HistoryStepUpdate = returnArray(historyStep);

    Object.assign(dataItemAdd, { HistoryStep: JSON.stringify(historyStep) });
    Object.assign(dataItemHistory, {
      HistoryStep: JSON.stringify(historyStep),
    });
    if (
      (status == 1 || status == 3) &&
      isNotNull(this.state.ParentProcess) &&
      isNotNull(this.state.ItemParentProcess) &&
      isNotNull(this.state.TypeParentProcess)
    ) {
      let wfInfo = "";

      if (this.state.TypeParentProcess == "SyncProcess") {
        wfInfo = this.state.ArraySyncParentProcess.find(
          (pc) => pc.WFTableId == this.state.ParentProcess
        );
      } else {
        wfInfo = this.state.ArrayAsyncParentProcess.find(
          (pc) => pc.WFTableId == this.state.ParentProcess
        );
      }
      let itemInfo = this.state.ArrayItemParentProcess.find(
        (ipc) => ipc.ID == this.state.ItemParentProcess
      );

      if (isNotNull(wfInfo) && isNotNull(itemInfo)) {
        let idHistory = 0;
        if (itemInfo.HistoryStep.length > 1) {
          idHistory = CheckNullSetZero(
            itemInfo.HistoryStep[itemInfo.HistoryStep.length - 1].HistoryId
          );
        }
        let emailParent = "";
        let approvalUser = {
          UserId: "",
          UserTitle: "",
          UserEmail: "",
        };
        if (
          this.state.TypeParentProcess == "SyncProcess" &&
          isNotNull(itemInfo.ObjParentWF)
        ) {
          emailParent = itemInfo.ObjParentWF.emailInfo;
          approvalUser = itemInfo.ObjParentWF.UserApproval;
        }
        let parentInfo = {
          wfTable: wfInfo.wfTable,
          ItemIndex: this.state.ItemParentProcess,
          indexStep: itemInfo.indexStep,
          StatusStep: itemInfo.StatusStep,
          UserApproval: approvalUser,
          UserRequest: {
            UserId: this.currentUser.Id,
            UserTitle: this.currentUser.Title,
            UserEmail: this.currentUser.Email,
          },
          isFinish: itemInfo.StatusStep == 1 ? true : false,
          emailInfo: emailParent,
          HistoryStep: itemInfo.HistoryStep,
          HistoryID: idHistory,
          CorrespondingFields: wfInfo.detailStep.CorrespondingFields,
          isWaitting:
            this.state.TypeParentProcess == "SyncProcess" ? true : false,
          createStep: this.state.ParentIndexStep,
        };
        Object.assign(dataItemAdd, { ObjParentWF: JSON.stringify(parentInfo) });
        this.isParentProcess = {
          IsActive: true,
          ObjSubWF: itemInfo.ObjSubWF,
          WFTableParent: wfInfo.wfTable,
          detailStep: wfInfo.detailStep,
        };
      } else {
        this.isParentProcess = {
          IsActive: false,
          ObjSubWF: [],
          WFTableParent: "",
          detailStep: "",
        };
      }
    } else {
      this.isParentProcess = {
        IsActive: false,
        ObjSubWF: [],
        WFTableParent: "",
        detailStep: "",
      };
    }

    console.log(dataItemAdd);
    console.log(dataItemHistory);
    console.log(objStepConfig);

    // this.SendEmailRequest(objStepConfig, 1, 2);

    if (isNotNull(this.ItemId)) {
      if (isSubProcess) {
        let arraySubProcess = returnArray(this.state.ArraySubProcess);

        let arrInforSub = returnArray(this.ObjSubWF);
        for (let i = 0; i < arraySubProcess.length; i++) {
          let itemSubProcess = returnObject(arraySubProcess[i]);
          let subInfo = await shareService.addNewSubWF(
            this.ItemId,
            this.HistoryId,
            this.indexStep,
            dataItemAdd,
            {},
            objStepConfigSub,
            stepTitle,
            isFinishParent,
            JSON.parse(dataItemAdd.HistoryStep),
            this.WFTable,
            this.currentUser,
            this.wfStepField,
            this.state,
            itemSubProcess,
            this.EmailSendToSubProcess,
            ""
          );
          subInfo.map((info) => {
            arrInforSub.push(info);
          });
        }

        Object.assign(dataItemAdd, {
          ObjSubWF: JSON.stringify(arrInforSub),
        });
      }
      this.updateItemRequest(dataItemAdd, dataItemHistory, objStepConfig);
    } else {
      if (isSubProcess) {
        let itemRequest = await shareService.AddItem(
          this.WFTableCode,
          dataItemAdd
        );
        if (isNotNull(itemRequest.success)) {
          this.ItemId = CheckNullSetZero(itemRequest.data["ID"]);
          let DateModified = itemRequest.data["Modified"];

          this.HistoryStepUpdate = loadModifiedDate(
            this.HistoryStepUpdate,
            DateModified,
            dataItemAdd.StatusStep
          );

          Object.assign(dataItemHistory, {
            ItemIndex: CheckNullSetZero(itemRequest.data["ID"]),
            Title: CheckNull(itemRequest.data["Title"]),
            HistoryStep: JSON.stringify(this.HistoryStepUpdate),
          });

          if (this.isParentProcess.IsActive) {
            await this.updateParentProcess(dataItemAdd);
          }

          let itemHistory = await shareService.AddItem(
            "WFHistory",
            dataItemHistory
          );
          if (isNotNull(itemHistory.success)) {
            this.HistoryId = itemHistory.data["ID"];

            let arraySubProcess = returnArray(this.state.ArraySubProcess);

            let arrInforSub = [];
            for (let i = 0; i < arraySubProcess.length; i++) {
              let itemSubProcess = returnObject(arraySubProcess[i]);
              let subInfo = await shareService.addNewSubWF(
                this.ItemId,
                this.HistoryId,
                this.indexStep,
                dataItemAdd,
                {},
                objStepConfigSub,
                stepTitle,
                isFinishParent,
                JSON.parse(dataItemAdd.HistoryStep),
                this.WFTable,
                this.currentUser,
                this.wfStepField,
                this.state,
                itemSubProcess,
                this.EmailSendToSubProcess,
                ""
              );
              subInfo.map((info) => {
                arrInforSub.push(info);
              });
            }

            let dataItemUpdate = {
              ObjSubWF: JSON.stringify(arrInforSub),
            };

            let updateHistory = returnArray(this.HistoryStepUpdate);
            for (let index = 0; index < updateHistory.length; index++) {
              updateHistory[index].HistoryId = this.HistoryId;
            }
            Object.assign(dataItemUpdate, {
              HistoryStep: JSON.stringify(updateHistory),
            });

            await shareService.UpdateItem(
              this.WFTableCode,
              this.ItemId,
              dataItemUpdate
            );

            if (this.state.outputFile.length > 0) {
              this.saveFileAttachments(dataItemHistory, objStepConfig, 0);
            } else {
              this.callbackSendEmail(objStepConfig, dataItemHistory);
            }
          } else {
            console.log(itemHistory.errors);
            this.hideLoadingPage();
            alert("Error: " + itemHistory.errors);
          }
        } else {
          console.log(itemRequest.errors);
          this.hideLoadingPage();
          alert("Error: " + itemRequest.errors);
        }
      } else {
        this.saveItemRequest(dataItemAdd, dataItemHistory, objStepConfig);
      }
    }
  }

  async saveItemRequest(dataItemAdd, dataItemHistory, objStepConfig) {
    let itemRequest = await shareService.AddItem(this.WFTableCode, dataItemAdd);
    if (isNotNull(itemRequest.success)) {
      this.ItemId = itemRequest.data["ID"];
      let DateModified = itemRequest.data["Modified"];
      let HistoryModified = [];
      if (isNotNull(itemRequest.data["HistoryStep"])) {
        HistoryModified = JSON.parse(itemRequest.data["HistoryStep"]);
      }
      let NewHistoryModified = returnArray(this.HistoryStepUpdate);
      if (HistoryModified.length > 0) {
        NewHistoryModified = loadModifiedDate(
          HistoryModified,
          DateModified,
          dataItemAdd.StatusStep
        );
        // let dataUpdate = { HistoryStep: JSON.stringify(NewHistoryModified) };
        // let updateItems = await shareService.UpdateItem(
        //   this.WFTableCode,
        //   this.ItemId,
        //   dataUpdate
        // );
        // console.log(updateItems);
      }

      Object.assign(dataItemHistory, {
        ItemIndex: itemRequest.data["ID"],
        Title: itemRequest.data["Title"],
        HistoryStep: JSON.stringify(NewHistoryModified),
      });

      if (this.isParentProcess.IsActive) {
        await this.updateParentProcess(dataItemAdd);
      }
      this.saveItemHistory(dataItemHistory, objStepConfig, NewHistoryModified);
    } else {
      console.log(itemRequest.errors);
      this.hideLoadingPage();
      alert("Error: " + itemRequest.errors);
    }
  }

  async saveItemHistory(dataItemHistory, objStepConfig, NewHistoryModified) {
    let itemHistory = await shareService.AddItem("WFHistory", dataItemHistory);
    if (isNotNull(itemHistory.success)) {
      this.HistoryId = itemHistory.data["ID"];

      let updateHistory = returnArray(NewHistoryModified);
      for (let index = 0; index < updateHistory.length; index++) {
        updateHistory[index].HistoryId = this.HistoryId;
      }
      let dataItemUpdate = {
        HistoryStep: JSON.stringify(updateHistory),
      };
      await shareService.UpdateItem(
        this.WFTableCode,
        this.ItemId,
        dataItemUpdate
      );

      if (this.state.outputFile.length > 0) {
        this.saveFileAttachments(dataItemHistory, objStepConfig, 0);
      } else {
        this.callbackSendEmail(objStepConfig, dataItemHistory);
      }
    } else {
      console.log(itemHistory.errors);
      this.hideLoadingPage();
      alert("Error: " + itemHistory.errors);
    }
  }

  async updateItemRequest(dataItemAdd, dataItemHistory, objStepConfig) {
    let itemUpdate = await shareService.UpdateItem(
      this.WFTableCode,
      this.ItemId,
      dataItemAdd
    );
    if (isNotNull(itemUpdate.success)) {
      if (isNotNull(this.state["Title"])) {
        this.TitleRequest = this.state["Title"];
      }
      let detailUpdate = await shareService.GetItemDetailByID(
        this.WFTableCode,
        this.ItemId,
        []
      );
      let NewHistoryModified = returnArray(this.HistoryStepUpdate);
      if (detailUpdate.HistoryModified.length > 0) {
        NewHistoryModified = loadModifiedDate(
          detailUpdate.HistoryModified,
          detailUpdate.DateModified,
          dataItemAdd.StatusStep
        );
        let dataUpdate = { HistoryStep: JSON.stringify(NewHistoryModified) };
        await shareService.UpdateItem(
          this.WFTableCode,
          this.ItemId,
          dataUpdate
        );
      }

      Object.assign(dataItemHistory, {
        ItemIndex: this.ItemId,
        Title: this.TitleRequest,
        HistoryStep: JSON.stringify(NewHistoryModified),
      });

      if (this.isParentProcess.IsActive) {
        await this.updateParentProcess(dataItemAdd);
      }

      this.updateItemHistory(dataItemHistory, objStepConfig);
    } else {
      console.log(itemUpdate.errors);
      this.hideLoadingPage();
      alert("Error: " + itemUpdate.errors);
    }
  }

  async updateParentProcess(dataSubInput) {
    let arraySub = returnArray(this.isParentProcess.ObjSubWF);
    arraySub.push({
      wfTable: this.WFTable,
      ItemIndex: this.ItemId,
      isWaitting: this.state.TypeParentProcess == "SyncProcess" ? true : false,
      indexStep: this.state.ParentIndexStep,
      titleStep: this.state.ParentStepTitle,
    });
    let dataParent = {
      ObjSubWF: JSON.stringify(arraySub),
    };
    if (dataSubInput.StatusStep == 1) {
      let alowData = false;
      let correspondingFields = [];
      let isWaitting =
        this.state.TypeParentProcess == "SyncProcess" ? true : false;
      if (
        isNotNull(this.isParentProcess.detailStep) &&
        this.isParentProcess.detailStep.AlowDataTransfer
      ) {
        alowData = this.isParentProcess.detailStep.AlowDataTransfer;
        correspondingFields = returnArray(
          this.isParentProcess.detailStep.CorrespondingFields
        );
      }
      let fieldParentUpdate = await shareService.GetFieldSumUpdate(
        this.WFTable,
        this.ItemId,
        this.state.ParentProcess,
        this.state.ParentIndexStep,
        dataSubInput,
        {},
        arraySub,
        alowData,
        correspondingFields,
        isWaitting
      );
      fieldParentUpdate.map((fieldP) => {
        Object.assign(dataParent, {
          [fieldP.InternalName]: fieldP.dataInternalName,
        });
      });
    }

    await shareService.UpdateItem(
      this.isParentProcess.WFTableParent.WFCode,
      this.state.ItemParentProcess,
      dataParent
    );
  }

  updateItemHistory(dataItemHistory, objStepConfig) {
    console.log(dataItemHistory);

    sp.web.lists
      .getByTitle("WFHistory")
      .items.getById(this.HistoryId)
      .update(dataItemHistory)
      .then((items) => {
        console.log("Update history Success");
        if (this.outputFileOld.length > 0) {
          this.deleteFileAttachments(dataItemHistory, objStepConfig);
        } else if (this.outputFileNew.length > 0) {
          this.saveFileAttachments(dataItemHistory, objStepConfig, 0);
        } else {
          this.callbackSendEmail(objStepConfig, dataItemHistory);
        }
      })
      .catch((error) => {
        console.log(error);
        this.hideLoadingPage();
      });
  }

  async callbackSendEmail(objStepConfig, dataItemHistory) {
    if (dataItemHistory.StatusRequest == 1) {
      await this.SendEmailRequest(objStepConfig, 1, dataItemHistory.indexStep);
      window.location.href =
        config.pages.wfRequestView +
        `?WFTableId=` +
        this.WFTableId +
        `&ItemIndex=` +
        dataItemHistory.ItemIndex +
        `&indexStep=` +
        dataItemHistory.indexStep;
    } else {
      window.location.href =
        config.pages.wfRequestView +
        `?WFTableId=` +
        this.WFTableId +
        `&ItemIndex=` +
        dataItemHistory.ItemIndex +
        `&indexStep=` +
        dataItemHistory.indexStep;
    }
  }

  async SendEmailRequest(objStepConfig, indexStep, nextStep) {
    let configStep = this.wfStepTable.find(
      (x) => x.indexStep == this.indexStep
    );
    if (isNotNull(configStep)) {
      let inforEmailDefault = {
        UserRequest: this.currentUser.Title,
        ItemIndex: this.ItemId,
        HomeUrl: config.pages.wfDashboard,
        Status: "",
        ItemUrl:
          config.pages.wfRequestView +
          `?WFTableId=` +
          this.WFTableId +
          `&ItemIndex=` +
          this.ItemId +
          `&indexStep=` +
          nextStep,
        StatusTitleRequest: '<font style="font-weight:bold">TẠO MỚI</font>',
        WorkflowTitleRequest: this.WFTableTitle,
      };
      let emailApprover = "";
      let dataSendEmail = { UserRequest: "", UserApprover: "", UserInform: "" };
      if (isNotNull(objStepConfig)) {
        if (
          isNotNull(objStepConfig.UserApprover.UserId) &&
          isNotNull(objStepConfig.UserApprover.UserTitle) &&
          isNotNull(objStepConfig.UserApprover.UserEmail)
        ) {
          emailApprover = objStepConfig.UserApprover.UserEmail;
          Object.assign(inforEmailDefault, {
            UserApproval: objStepConfig.UserApprover.UserTitle,
          });
        } else {
          Object.assign(inforEmailDefault, {
            UserApproval: "",
          });
        }
      }
      // Gửi email đến người phê duyệt
      if (
        configStep.ObjEmailCfg.EmailSendApprover.IsActive &&
        isNotNull(emailApprover)
      ) {
        const configEmail = await this.GetTemplateEmail(
          configStep.ObjEmailCfg.EmailSendApprover.ObjEmailTemplate.TemplateId
        );
        if (
          isNotNull(configEmail.SubjectEmail) &&
          isNotNull(configEmail.BodyEmail) &&
          isNotNull(configEmail.FieldReplateText)
        ) {
          let inforEmailApprover = await shareService.loadInfoEmail(
            inforEmailDefault,
            this.wfStepField,
            this.state,
            {},
            configEmail.FieldReplateText.split(",")
          );
          Object.assign(inforEmailApprover, {
            DearUsers: objStepConfig.UserApprover.UserTitle,
          });

          console.log(inforEmailApprover);
          dataSendEmail.UserApprover = {
            Title: this.WFTableCode,
            IndexItem: this.ItemId,
            Step: indexStep,
            KeyList: this.WFTableCode + "_" + this.ItemId,
            SubjectMail: ReplaceFieldMail(
              inforEmailApprover,
              configEmail.SubjectEmail
            ),
            BodyMail: ReplaceFieldMail(
              inforEmailApprover,
              configEmail.BodyEmail
            ),
            SendMailTo: emailApprover,
            TypeEmail:
              configStep.ObjEmailCfg.EmailSendApprover.ObjEmailTemplate
                .TemplateTitle,
          };
          console.log(dataSendEmail);
          await this.SendEmail(dataSendEmail.UserApprover);
        }
      }

      // Gửi email dến người yêu cầu
      if (configStep.ObjEmailCfg.EmailSendUserRequest.IsActive) {
        const configEmail = await this.GetTemplateEmail(
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
            this.wfStepField,
            this.state,
            {},
            configEmail.FieldReplateText.split(",")
          );

          Object.assign(inforEmailUserRequest, {
            DearUsers: this.currentUser.Title,
          });

          console.log(inforEmailUserRequest);
          dataSendEmail.UserRequest = {
            Title: this.WFTableCode,
            IndexItem: this.ItemId,
            Step: indexStep,
            KeyList: this.WFTableCode + "_" + this.ItemId,
            SubjectMail: ReplaceFieldMail(
              inforEmailUserRequest,
              configEmail.SubjectEmail
            ),
            BodyMail: ReplaceFieldMail(
              inforEmailUserRequest,
              configEmail.BodyEmail
            ),
            SendMailTo: this.currentUser.Email,
            TypeEmail:
              configStep.ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate
                .TemplateTitle,
          };
          console.log(dataSendEmail);
          await this.SendEmail(dataSendEmail.UserRequest);
        }
      }

      // Gửi email thông báo
      if (configStep.ObjEmailCfg.EmailSendInform.IsActive) {
        const configEmail = await this.GetTemplateEmail(
          configStep.ObjEmailCfg.EmailSendInform.ObjEmailTemplate.TemplateId
        );
        if (
          isNotNull(configEmail.SubjectEmail) &&
          isNotNull(configEmail.BodyEmail) &&
          isNotNull(configEmail.FieldReplateText)
        ) {
          let inforEmailInform = await shareService.loadInfoEmail(
            inforEmailDefault,
            this.wfStepField,
            this.state,
            {},
            configEmail.FieldReplateText.split(",")
          );

          console.log(inforEmailInform);
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
              for (let ufs = 0; ufs < this.wfStepField.length; ufs++) {
                if (
                  this.wfStepField[ufs].InternalName ==
                    objUserField[uf].InternalName &&
                  objUserField[uf].FieldType == "User" &&
                  isNotNull(this.state[objUserField[uf].InternalName].UserEmail)
                ) {
                  if (isNotNull(informUsers.UserEmail)) {
                    if (
                      informUsers.UserEmail.indexOf(
                        this.state[this.wfStepField[ufs].InternalName].UserEmail
                      ) == -1
                    ) {
                      informUsers.UserTitle +=
                        "," +
                        this.state[this.wfStepField[ufs].InternalName]
                          .UserTitle;
                      informUsers.UserEmail +=
                        ";" +
                        this.state[this.wfStepField[ufs].InternalName]
                          .UserEmail;
                    }
                  } else {
                    informUsers.UserTitle = this.state[
                      this.wfStepField[ufs].InternalName
                    ].UserTitle;
                    informUsers.UserEmail = this.state[
                      this.wfStepField[ufs].InternalName
                    ].UserEmail;
                  }
                  break;
                } else if (
                  this.wfStepField[ufs].InternalName ==
                    objUserField[uf].InternalName &&
                  objUserField[uf].FieldType == "UserMulti" &&
                  this.state[`list_` + objUserField[uf].InternalName].length > 0
                ) {
                  let users = "";
                  this.state[
                    `list_` + this.wfStepField[ufs].InternalName
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
                    // users += element.UserTitle + ', ';
                  });
                  break;
                }
              }
            }
          }
          if (isNotNull(informUsers.UserEmail)) {
            Object.assign(inforEmailInform, {
              DearUsers: informUsers.UserTitle,
            });
            dataSendEmail.UserInform = {
              Title: this.WFTableCode,
              IndexItem: this.ItemId,
              Step: indexStep,
              KeyList: this.WFTableCode + "_" + this.ItemId,
              SubjectMail: ReplaceFieldMail(
                inforEmailInform,
                configEmail.SubjectEmail
              ),
              BodyMail: ReplaceFieldMail(
                inforEmailInform,
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

  // async SendEmail(dataSendEmail, dataEmail, typeEmail){
  async SendEmail(dataEmail) {
    await sp.web.lists
      .getByTitle("ListRequestSendMail")
      .items.add(dataEmail)
      .then((itemEmail) => {
        console.log(itemEmail);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  saveFileAttachments(dataItemHistory, objStepConfig, index) {
    try {
      const file = this.outputFileNew;
      this.buffer = getFileBuffer(file[index]);
      console.log(this.buffer);
      this.buffer.onload = (e) => {
        console.log(e.target.result);
        const dataFile = e.target.result;
        sp.web.lists
          .getByTitle(this.WFTableCode)
          .items.getById(this.ItemId)
          .attachmentFiles.add(file[index].name, dataFile)
          .then((fileItem) => {
            console.log("add file success");
            console.log(fileItem);
            if (file.length - 1 > index) {
              // console.log(file[index]);
              this.saveFileAttachments(
                dataItemHistory,
                objStepConfig,
                index + 1
              );
            } else {
              this.callbackSendEmail(objStepConfig, dataItemHistory);
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

  deleteFileAttachments(dataItemHistory, objStepConfig) {
    console.log("call deleteFileAttachments");
    if (this.outputFileOld.length > 1) {
      this.deleteMultiFileAttachments(dataItemHistory, objStepConfig);
    } else {
      this.deleteOneFileAttachments(dataItemHistory, objStepConfig);
    }
  }

  deleteOneFileAttachments(dataItemHistory, objStepConfig) {
    console.log("call deleteOneFileAttachments");
    sp.web.lists
      .getByTitle(this.WFTableCode)
      .items.getById(this.ItemId)
      .attachmentFiles.getByName(this.outputFileOld[0])
      .delete()
      .then((fileItem) => {
        console.log("delete file success");
        if (this.outputFileNew.length > 0) {
          this.saveFileAttachments(dataItemHistory, objStepConfig, 0);
        } else {
          this.callbackSendEmail(objStepConfig, dataItemHistory);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  deleteMultiFileAttachments(dataItemHistory, objStepConfig) {
    console.log("call deleteMultiFileAttachments");
    sp.web.lists
      .getByTitle(this.WFTableCode)
      .items.getById(this.ItemId)
      .attachmentFiles.deleteMultiple(...this.outputFileOld)
      .then((fileItem) => {
        console.log("delete file success");
        if (this.outputFileNew.length > 0) {
          this.saveFileAttachments(dataItemHistory, objStepConfig, 0);
        } else {
          this.callbackSendEmail(objStepConfig, dataItemHistory);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async GetTemplateEmail(emailTemplateID) {
    let info = { SubjectEmail: "", BodyEmail: "", FieldReplateText: "" };
    // console.log(info)
    await sp.web.lists
      .getByTitle("WFTemplateEmail")
      .items.getById(emailTemplateID)
      .select("ID,Title,SubjectEmail,BodyEmail,FieldReplateText")
      .get()
      .then((item) => {
        console.log(item);
        if (isNotNull(item)) {
          info.SubjectEmail = item.SubjectEmail;
          info.BodyEmail = item.BodyEmail;
          info.FieldReplateText = item.FieldReplateText;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return info;
  }

  async changeFile(event) {
    event.preventDefault();
    let file = event.target.files[0];
    let files = this.state.outputFile;
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
          files.push({ name: file.name, fileOutput: file, type: 0 });
          this.outputFileNew.push(file);
        }
      } else {
        files.push({ name: file.name, fileOutput: file, type: 0 });
        this.outputFileNew.push(file);
      }
      this.setState({ outputFile: files });
    }
    event.target.value = null;
  }

  removeFile(item) {
    console.log(item);
    let arrFile = this.state.outputFile;
    arrFile.splice(arrFile.indexOf(item), 1);
    if (item.type == 1) {
      this.outputFileOld.push(item.name);
    } else {
      this.outputFileNew.splice(this.outputFileNew.indexOf(item), 1);
    }
    this.setState({ outputFile: arrFile });
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

  removeLink(IdItem, listLink) {
    let dsLink = this.state[listLink];
    let index = dsLink.findIndex((x) => x.ItemId == IdItem);
    dsLink.splice(index, 1);
    this.setState({ [listLink]: dsLink });
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
      // let FieldView = stepIndex1.ObjFieldStep.FieldView;
      let FieldInput = stepIndex1.ObjFieldStep.FieldInput;
      arrButtonApprove = stepIndex1.btnAction;
      // for (let fv = 0; fv < FieldView.length; fv++) {
      //   for (let fl = 0; fl < listField.length; fl++) {
      //     if (listField[fl].InternalName == FieldView[fv]) {
      //       arrFieldView.push(listField[fl]);
      //     }
      //   }
      // }
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
      if (isNotNull(stepIndex2)) {
        //let FieldView = stepIndex2.ObjFieldStep.FieldView;
        // for (let fv = 0; fv < FieldView.length; fv++) {
        //   for (let fl = 0; fl < listField.length; fl++) {
        //     if (listField[fl].InternalName == FieldView[fv]) {
        //       arrFieldView.push(listField[fl]);
        //     }
        //   }
        // }
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
      listField,
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

    // const checkMapUserSelectWF = await this.checkGetMapUserSubForm(
    //   objSPLink.indexStep,
    //   listStep,
    //   arrFieldInput,
    //   detailItemRequest,
    //   detailInput
    // );
    // detailInput.UserApprovalStep = checkMapUserSelectWF.UserApprovalStep;
    // detailInput.listSelect_UserApprovalStep =
    //   checkMapUserSelectWF.listSearch_UserApprovalStep;
    // detailInput.IsEditApproverStep = checkMapUserSelectWF.IsEditApprover;
    // detailInput.isUserApprovalStep = checkMapUserSelectWF.isApproveNext;

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

  async GetWFFormFieldLinkWF(WFId) {
    let arrStepField = [];
    await sp.web.lists
      .getByTitle("WFFormField")
      .items.select(
        "ID,Title,InternalName,FieldType,HelpText,Required,ObjValidation,ObjSPField,DefaultValue,OrderIndex"
      )
      .filter("WFTableId eq " + WFId)
      .orderBy("OrderIndex", true)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjValidation = "";
          if (isNotNull(itemDetail.ObjValidation)) {
            ObjValidation = JSON.parse(itemDetail.ObjValidation);
          }
          let ObjSPField = "";
          if (isNotNull(itemDetail.ObjSPField)) {
            ObjSPField = JSON.parse(itemDetail.ObjSPField);
          }

          arrStepField.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            InternalName: CheckNull(itemDetail.InternalName),
            FieldType: CheckNull(itemDetail.FieldType),
            HelpText: CheckNull(itemDetail.HelpText),
            Required: CheckNullSetZero(itemDetail.Required),
            ObjValidation: ObjValidation,
            ObjSPField: ObjSPField,
            DefaultValue: CheckNull(itemDetail.DefaultValue),
            OrderIndex: CheckNullSetZero(itemDetail.OrderIndex),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrStepField;
  }

  async getDetailLinkWF(itemId, wfStepField) {
    let strSelect = `ID,UserApproval/Id,UserApproval/Title,UserApproval/Name`;
    let strExpand = `UserApproval`;
    Object.assign(this.state, { [`Link_ID`]: itemId });
    wfStepField.map((item) => {
      if (item.FieldType == "User") {
        strSelect +=
          "," +
          item.InternalName +
          "/Id," +
          item.InternalName +
          "/Title," +
          item.InternalName +
          "/Name";
        strExpand += "," + item.InternalName;
      } else if (item.FieldType == "UserMulti") {
        strSelect +=
          "," +
          item.InternalName +
          "/Id," +
          item.InternalName +
          "/Title," +
          item.InternalName +
          "/Name";
        strExpand += "," + item.InternalName;
      } else if (item.FieldType == "YesNo") {
        strSelect += "," + item.InternalName;
      } else if (
        item.FieldType == "CheckBox" ||
        item.FieldType == "RadioButton"
      ) {
        strSelect += "," + item.InternalName;
      } else if (item.FieldType == "DateTime") {
        strSelect += "," + item.InternalName;
      } else if (item.FieldType == "SPLinkWF") {
        strSelect += "," + item.InternalName;
      } else {
        strSelect += "," + item.InternalName;
      }
    });

    let detail = {};
    await sp.web.lists
      .getByTitle(this.state["LinkWF|WFCode"])
      .items.getById(itemId)
      .select(strSelect)
      .expand(strExpand)
      .get()
      .then((itemWF) => {
        Object.assign(this.state, { [`Link_ID`]: itemId });
        Object.assign(detail, { [`Link_ID`]: itemId });
        for (let inItem = 0; inItem < wfStepField.length; inItem++) {
          if (wfStepField[inItem].FieldType == "User") {
            Object.assign(detail, {
              [`Link_` + wfStepField[inItem].InternalName]: {
                UserId: "",
                UserTitle: "",
                UserEmail: "",
              },
            });
          } else if (wfStepField[inItem].FieldType == "UserMulti") {
            Object.assign(detail, {
              [`Link_list_` + wfStepField[inItem].InternalName]: [],
            });
          } else if (
            wfStepField[inItem].FieldType == "CheckBox" ||
            wfStepField[inItem].FieldType == "RadioButton"
          ) {
            let arrCheck = [];
            if (isNotNull(this.state[wfStepField[inItem].InternalName])) {
              arrCheck = this.state[wfStepField[inItem].InternalName];
            }
            Object.assign(detail, {
              [`Link_` + wfStepField[inItem].InternalName]: arrCheck,
            });
          } else if (wfStepField[inItem].FieldType == "YesNo") {
            Object.assign(detail, {
              [`Link_` + wfStepField[inItem].InternalName]: false,
            });
          } else if (wfStepField[inItem].FieldType == "SPLinkWF") {
            Object.assign(detail, {
              [`Link_` + wfStepField[inItem].InternalName]: "",
            });
          } else {
            Object.assign(detail, {
              [`Link_` + wfStepField[inItem].InternalName]: "",
            });
          }
        }
        for (let outItem = 0; outItem < wfStepField.length; outItem++) {
          if (wfStepField[outItem].FieldType == "User") {
            if (isNotNull(itemWF[wfStepField[outItem].InternalName])) {
              detail[`Link_` + wfStepField[outItem].InternalName] = {
                UserId: itemWF[wfStepField[outItem].InternalName].Id,
                UserTitle: itemWF[wfStepField[outItem].InternalName].Title,
                UserEmail: itemWF[wfStepField[outItem].InternalName].Name.split(
                  "|"
                )[2],
              };
            }
          } else if (wfStepField[outItem].FieldType == "UserMulti") {
            if (isNotNull(itemWF[wfStepField[outItem].InternalName])) {
              itemWF[wfStepField[outItem].InternalName].forEach((item) => {
                detail[`list_` + wfStepField[outItem].InternalName].push({
                  UserId: item["Id"],
                  UserTitle: item["Title"],
                  UserEmail: item["Name"].split("|")[2],
                });
              });
            }
          } else if (wfStepField[outItem].FieldType == "Number") {
            if (isNotNull(itemWF[wfStepField[outItem].InternalName])) {
              detail[
                `Link_` + wfStepField[outItem].InternalName
              ] = CheckNullSetZero(itemWF[wfStepField[outItem].InternalName]);
            }
          } else if (wfStepField[outItem].FieldType == "DateTime") {
            if (isNotNull(itemWF[wfStepField[outItem].InternalName])) {
              detail[`Link_` + wfStepField[outItem].InternalName] = moment(
                itemWF[`Link_` + wfStepField[outItem].InternalName]
              ).format("YYYY-MM-DD");
            }
          } else if (wfStepField[outItem].FieldType == "RadioButton") {
            const txtRadio = itemWF[wfStepField[outItem].InternalName];
            if (isNotNull(txtRadio)) {
              for (
                let ischeck = 0;
                ischeck <
                detail[`Link_` + wfStepField[outItem].InternalName].length;
                ischeck++
              ) {
                if (
                  detail[`Link_` + wfStepField[outItem].InternalName][ischeck]
                    .Value == txtRadio
                ) {
                  detail[`Link_` + wfStepField[outItem].InternalName][
                    ischeck
                  ].isChecked = true;
                  break;
                }
              }
            }
          } else if (wfStepField[outItem].FieldType == "CheckBox") {
            const arrCheck = itemWF[wfStepField[outItem].InternalName];
            if (isNotNull(arrCheck)) {
              for (let index = 0; index < arrCheck.length; index++) {
                for (
                  let ischeck = 0;
                  ischeck <
                  detail[`Link_` + wfStepField[outItem].InternalName].length;
                  ischeck++
                ) {
                  if (
                    detail[`Link_` + wfStepField[outItem].InternalName][ischeck]
                      .Value == arrCheck[index]
                  ) {
                    detail[`Link_` + wfStepField[outItem].InternalName][
                      ischeck
                    ].isChecked = true;
                  }
                }
              }
            }
          } else if (wfStepField[outItem].FieldType == "YesNo") {
            detail[`Link_` + wfStepField[outItem].InternalName] = CheckNull(
              itemWF[wfStepField[outItem].InternalName]
            );
          } else if (wfStepField[outItem].FieldType == "SPLinkWF") {
            const spLink = CheckNull(itemWF[wfStepField[outItem].InternalName]);
            detail[`Link_` + wfStepField[outItem].InternalName] = spLink;
            if (isNotNull(spLink)) {
              const arrSPLink = spLink.split(";;");
              const indexSPLink = this.listSearchWorkflow.findIndex(
                (x) => x.InternalName == [wfStepField[outItem].InternalName]
              );
              if (indexSPLink != -1) {
                this.listSearchWorkflow[
                  indexSPLink
                ].RequestId = CheckNullSetZero(arrSPLink[1]);
              }
            }
          } else {
            let a = itemWF[wfStepField[outItem].InternalName];
            detail[`Link_` + wfStepField[outItem].InternalName] = CheckNull(
              itemWF[wfStepField[outItem].InternalName]
            );
          }
        }
        if (isNotNull(itemWF["UserApproval"])) {
          detail["Link_UserApprovalStep"] = {
            UserId: itemWF["UserApproval"].Id,
            UserTitle: itemWF["UserApproval"].Title,
            UserEmail: itemWF["UserApproval"].Name.split("|")[2],
          };
        }
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(detail);
    return detail;
  }

  async GetLinkWFStepTable(WFTableId) {
    let arrStepWF = [];
    await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(
        "ID,Title,Code,indexStep,ClassifyStep,TypeofApprover,ApproveCode,RoleCode,StepWFType,ObjStepWFId,StepNextDefault,ObjStepCondition,ObjEmailCfg,SLA,ObjFieldStep,btnAction,GroupApprover,IsEditApprover,UserApprover/Title,UserApprover/Id,UserApprover/Name"
      )
      .expand("UserApprover")
      .filter("WFTableId eq " + WFTableId)
      .orderBy("indexStep", true)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjStepWFId = "";
          if (
            CheckNull(itemDetail.StepWFType) === "Quy trình" &&
            isNotNull(itemDetail.ObjStepWFId)
          ) {
            ObjStepWFId = JSON.parse(itemDetail.ObjStepWFId);
          }
          let StepNextDefault = "";
          if (isNotNull(itemDetail.StepNextDefault)) {
            StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
          }
          let ObjStepCondition = "";
          if (isNotNull(itemDetail.ObjStepCondition)) {
            ObjStepCondition = JSON.parse(itemDetail.ObjStepCondition);
          }
          let ObjFieldStep = "";
          if (isNotNull(itemDetail.ObjFieldStep)) {
            ObjFieldStep = JSON.parse(itemDetail.ObjFieldStep);
          }
          let ObjEmailCfg = "";
          if (isNotNull(itemDetail.ObjEmailCfg)) {
            ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);
          }
          let userApprover = {
            UserId: "",
            UserTitle: "",
            UserEmail: "",
          };
          let GroupApprover = {
            TypeUserApproval: "",
            Group: { ID: "", Title: "" },
          };
          if (isNotNull(itemDetail.GroupApprover)) {
            GroupApprover = JSON.parse(itemDetail.GroupApprover);
          }
          let TypeofApprover = "",
            ApproveCode = "",
            RoleCode = "";
          if (isNotNull(itemDetail.UserApprover)) {
            userApprover = {
              UserId: itemDetail.UserApprover["Id"],
              UserTitle: itemDetail.UserApprover["Title"],
              UserEmail: itemDetail.UserApprover["Name"].split("|")[2],
            };
            TypeofApprover = "Người phê duyệt";
            GroupApprover.TypeUserApproval = "Một người phê duyệt";
          } else {
            TypeofApprover = CheckNull(itemDetail.TypeofApprover);
            ApproveCode = CheckNull(itemDetail.ApproveCode);
            RoleCode = CheckNull(itemDetail.RoleCode);
          }
          let btnAction = "";
          if (isNotNull(itemDetail.btnAction)) {
            btnAction = JSON.parse(itemDetail.btnAction);
          }
          arrStepWF.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            Code: CheckNull(itemDetail.Code),
            indexStep: CheckNull(itemDetail.indexStep),
            ClassifyStep: CheckNull(itemDetail.ClassifyStep),
            StepWFType: CheckNull(itemDetail.StepWFType),
            ObjStepWFId: ObjStepWFId,
            StepNextDefault: StepNextDefault,
            ObjStepCondition: ObjStepCondition,
            ObjEmailCfg: ObjEmailCfg,
            TypeofApprover: TypeofApprover,
            ApproveCode: ApproveCode,
            RoleCode: RoleCode,
            SLA: CheckNullSetZero(itemDetail.SLA),
            ObjFieldStep: ObjFieldStep,
            btnAction: btnAction,
            UserApprover: userApprover,
            GroupApprover: GroupApprover,
            IsEditApprover: itemDetail.IsEditApprover,
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrStepWF;
  }

  async GetHistoryID(WFId, ItemIndex, indexStep) {
    let HistoryId = "";
    const strFilter =
      `WFTableId eq ` +
      WFId +
      ` and ItemIndex eq ` +
      ItemIndex +
      ` and (StatusStep eq 0 or StatusStep eq 3)` +
      ` and indexStep eq ` +
      indexStep +
      ` and UserApproval/Id eq ` +
      this.currentUser.Id;
    await sp.web.lists
      .getByTitle("WFHistory")
      .items.select("ID")
      .filter(strFilter)
      .get()
      .then((listWFHistory) => {
        // title = {WFId: this.WFTable.WFId, WFCode: CheckNull(listWF["Code"]), WFTitle: CheckNull(listWF["Title"])}
        if (listWFHistory.length > 0) {
          HistoryId = listWFHistory[0].ID;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return HistoryId;
  }

  itemApproval(subForm) {
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

    const txtAlert = this.checkSaveSubForm(
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

  itemReject(subForm) {
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

  itemReAssign(subForm) {
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

    if (isNotNull(objDetailField.detailInput.UserReAssign.UserId)) {
      this.updateItemSubForm(0, objDetailField, subForm);
    } else {
      alert("Bạn chưa nhập người nhận xử lý yêu cầu này");
      return;
    }
  }

  itemBackStep(subForm) {
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

    if (
      isNotNull(objDetailField.detailInput.BackStep) &&
      !isNotNull(objDetailField.detailInput.UserApproveBackStep.UserId)
    ) {
      alert("Bạn chưa nhập Người xử lý tại bước chuyển");
      return;
    } else {
      this.updateItemSubForm(3, objDetailField, subForm);
    }
  }

  itemSave(subForm) {
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

    const txtAlert = this.checkSaveSubForm(
      -1,
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
    //  if (step == 1) {
    checkUser.isUserApprovalStep = true;
    //   return checkUser;
    // }
    let checkStepNext = checkConditionNextStep(
      step,
      wfStepTable,
      wfStepFieldInput,
      detailItem,
      detailInput
    );
    checkUser = await this.GetMapUserApproverSubForm(
      checkStepNext,
      wfStepTable
    );

    // console.log(checkUser);
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
        if (this.listDepartment.length > 0) {
          let filterUser =
            `( DeptCode eq '` +
            this.listDepartment[0].DeptCode +
            `' and substringof('` +
            stepNext.RoleCode +
            `', RoleCode) and substringof('` +
            stepNext.ApproveCode +
            `', ApproveCode) )`;
          for (let iDept = 1; iDept < this.listDepartment.length; iDept++) {
            filterUser +=
              ` or ( DeptCode eq '` +
              this.listDepartment[iDept].DeptCode +
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
    // console.log(checkUser);
    return checkUser;
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
    };
    let strSelect =
        "ID,UserRequest/Id,UserRequest/Title,UserRequest/Name,UserApproval/Id,UserApproval/Title,UserApproval/Name,ListUser/Id,ListUser/Title,ListUser/Name,indexStep,StatusStep,StatusRequest,HistoryStep,Reason",
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
          } else {
          }
          if (
            CheckNullSetZero(listWF["indexStep"]) == 1 &&
            CheckNullSetZero(listWF["StatusStep"]) == 0
          ) {
            detail.StatusRequest = -1;
          } else {
            detail.StatusRequest = CheckNullSetZero(listWF["StatusStep"]);
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
            } else if (
              FieldView[outItem].FieldType == "PictureLink" ||
              FieldView[outItem].FieldType == "Hyperlink"
            ) {
              if (isNotNull(listWF[FieldView[outItem].InternalName])) {
                detail[FieldView[outItem].InternalName] = CheckNull(
                  listWF[FieldView[outItem].InternalName].Url
                );
              }
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
        //  stepIndex.ObjStepCondition.ArrayStepCondition
        let arrCondition = stepIndex.ObjStepCondition.ArrayStepCondition;
        if (arrCondition.length > 0) {
          let ArrObjCondition = arrCondition.sort(
            (prev, current) => prev.Priority - current.Priority
          );
          for (
            let item = 0;
            item < ArrObjCondition[item].ObjCondition.length;
            item++
          ) {
            if (ArrObjCondition[item].TypeCondition == "Calculate") {
              console.log(wfStepFieldInput);
              for (let i = 0; i < ArrObjCondition.length; i++) {
                let FieldStart = "",
                  FieldEnd = "",
                  FieldCompare = "";
                if (
                  wfStepFieldInput.findIndex(
                    (f) =>
                      f.InternalName ==
                      ArrObjCondition[item].ObjCondition[i].Field.FieldNameStart
                  ) != -1
                ) {
                  FieldStart =
                    detailInput[
                      ArrObjCondition[item].ObjCondition[i].Field.FieldNameStart
                    ];
                } else if (
                  detailItem[
                    ArrObjCondition[item].ObjCondition[i].Field.FieldNameStart
                  ] != undefined
                ) {
                  FieldStart =
                    detailItem[
                      ArrObjCondition[item].ObjCondition[i].Field.FieldNameStart
                    ];
                } else {
                  FieldStart = undefined;
                }

                if (
                  wfStepFieldInput.findIndex(
                    (f) =>
                      f.InternalName ==
                      ArrObjCondition[item].ObjCondition[i].Field.FieldNameEnd
                  ) != -1
                ) {
                  FieldEnd =
                    detailInput[
                      ArrObjCondition[item].ObjCondition[i].Field.FieldNameEnd
                    ];
                } else if (
                  detailItem[
                    ArrObjCondition[item].ObjCondition[i].Field.FieldNameEnd
                  ] != undefined
                ) {
                  FieldEnd =
                    detailItem[
                      ArrObjCondition[item].ObjCondition[i].Field.FieldNameEnd
                    ];
                } else {
                  FieldEnd = undefined;
                }

                if (
                  wfStepFieldInput.findIndex(
                    (f) =>
                      f.InternalName ==
                      ArrObjCondition[item].ObjCondition[i].Field.FieldCompare
                  ) != -1
                ) {
                  FieldCompare =
                    detailInput[
                      ArrObjCondition[item].ObjCondition[i].Field.FieldCompare
                    ];
                } else if (
                  detailItem[
                    ArrObjCondition[item].ObjCondition[i].Field.FieldCompare
                  ] != undefined
                ) {
                  FieldCompare =
                    detailItem[
                      ArrObjCondition[item].ObjCondition[i].Field.FieldCompare
                    ];
                } else {
                  FieldCompare = undefined;
                }

                if (
                  ArrObjCondition[item].ObjCondition[i].Field.FieldType ==
                  "DateTime"
                ) {
                  conNextStep = false;
                  if (isNotNull(FieldStart) && isNotNull(FieldEnd)) {
                    let calCon = CalculateDate(FieldStart, FieldEnd) + 1;
                    if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                        "FieldCompare" &&
                      isNotNull(calCon) &&
                      isNotNull(FieldCompare)
                    ) {
                      conNextStep = CompareDate(
                        calCon,
                        FieldCompare,
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    } else if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                        "FieldValue" &&
                      isNotNull(calCon)
                    ) {
                      conNextStep = CompareDate(
                        calCon,
                        ArrObjCondition[item].ObjCondition[i].Value,
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    }
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                } else if (
                  ArrObjCondition[item].ObjCondition[i].Field.FieldType ==
                  "Number"
                ) {
                  conNextStep = false;
                  if (isNotNull(FieldStart) && isNotNull(FieldEnd)) {
                    let calCon = CalculateNumber(
                      FieldStart,
                      FieldEnd,
                      ArrObjCondition[item].ObjCondition[i].Field.Calculate
                    );
                    if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                        "FieldCompare" &&
                      isNotNull(calCon) &&
                      isNotNull(FieldCompare)
                    ) {
                      conNextStep = CompareNumber(
                        calCon,
                        FieldCompare,
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    } else if (
                      ArrObjCondition[item].ObjCondition[i].ConditionType ==
                        "FieldValue" &&
                      isNotNull(calCon)
                    ) {
                      conNextStep = CompareNumber(
                        calCon,
                        ArrObjCondition[item].ObjCondition[i].Value,
                        ArrObjCondition[item].ObjCondition[i].Condition
                      );
                    }
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                }
              }
            } else if (ArrObjCondition[item].TypeCondition == "Compare") {
              for (
                let i = 0;
                i < ArrObjCondition[item].ObjCondition.length;
                i++
              ) {
                let FieldStart = "",
                  FieldCompare = "";
                if (
                  wfStepFieldInput.findIndex(
                    (f) =>
                      f.InternalName ==
                      ArrObjCondition[item].ObjCondition[i].Field
                  ) != -1
                ) {
                  FieldStart =
                    detailInput[ArrObjCondition[item].ObjCondition[i].Field];
                } else if (
                  detailItem[ArrObjCondition[item].ObjCondition[i].Field] !=
                  undefined
                ) {
                  FieldStart =
                    detailItem[ArrObjCondition[item].ObjCondition[i].Field];
                }

                if (
                  wfStepFieldInput.findIndex(
                    (f) =>
                      f.InternalName ==
                      ArrObjCondition[item].ObjCondition[i].FieldCompare
                  ) != -1
                ) {
                  FieldCompare =
                    detailInput[
                      ArrObjCondition[item].ObjCondition[i].FieldCompare
                    ];
                } else if (
                  detailItem[ArrObjCondition[item].ObjCondition[i].Field] !=
                  undefined
                ) {
                  FieldCompare =
                    detailItem[
                      ArrObjCondition[item].ObjCondition[i].FieldCompare
                    ];
                }

                if (
                  ArrObjCondition[item].ObjCondition[i].FieldType == "DateTime"
                ) {
                  conNextStep = false;
                  if (
                    ArrObjCondition[item].ObjCondition[i].ConditionType ==
                      "FieldCompare" &&
                    isNotNull(FieldStart) &&
                    isNotNull(FieldCompare)
                  ) {
                    conNextStep = CompareDate(
                      FieldStart,
                      FieldCompare,
                      ArrObjCondition[item].ObjCondition[i].Condition
                    );
                  } else if (
                    ArrObjCondition[item].ObjCondition[i].ConditionType ==
                      "FieldValue" &&
                    isNotNull(FieldStart)
                  ) {
                    conNextStep = CompareDate(
                      FieldStart,
                      ArrObjCondition[item].ObjCondition[i].Value,
                      ArrObjCondition[item].ObjCondition[i].Condition
                    );
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                } else if (
                  ArrObjCondition[item].ObjCondition[i].FieldType == "Number"
                ) {
                  conNextStep = false;
                  if (
                    ArrObjCondition[item].ObjCondition[i].ConditionType ==
                      "FieldCompare" &&
                    isNotNull(FieldStart) &&
                    isNotNull(FieldCompare)
                  ) {
                    conNextStep = CompareNumber(
                      FieldStart,
                      FieldCompare,
                      ArrObjCondition[item].ObjCondition[i].Condition
                    );
                  } else if (
                    ArrObjCondition[item].ObjCondition[i].ConditionType ==
                      "FieldValue" &&
                    isNotNull(FieldStart)
                  ) {
                    conNextStep = CompareNumber(
                      FieldStart,
                      ArrObjCondition[item].ObjCondition[i].Value,
                      ArrObjCondition[item].ObjCondition[i].Condition
                    );
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                } else if (
                  ArrObjCondition[item].ObjCondition[i].FieldType == "Text" ||
                  ArrObjCondition[item].ObjCondition[i].FieldType ==
                    "TextArea" ||
                  ArrObjCondition[item].ObjCondition[i].FieldType == "Dropdown"
                ) {
                  conNextStep = false;
                  if (
                    ArrObjCondition[item].ObjCondition[i].ConditionType ==
                      "FieldCompare" &&
                    isNotNull(FieldStart) &&
                    isNotNull(FieldCompare)
                  ) {
                    conNextStep = CompareText(
                      FieldStart,
                      FieldCompare,
                      ArrObjCondition[item].ObjCondition[i].Condition
                    );
                  } else if (
                    ArrObjCondition[item].ObjCondition[i].ConditionType ==
                    "FieldValue"
                  ) {
                    conNextStep = CompareText(
                      FieldStart,
                      ArrObjCondition[item].ObjCondition[i].Value,
                      ArrObjCondition[item].ObjCondition[i].Condition
                    );
                  }
                  if (
                    conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "Or"
                  ) {
                    break;
                  }
                  if (
                    !conNextStep &&
                    ArrObjCondition[item].ConditionsCombined == "And"
                  ) {
                    break;
                  }
                }
              }
            }
            if (conNextStep) {
              StepNext =
                ArrObjCondition[item].StepNextCondition.StepNextConditionId;
              break;
            }
          }
        }
      }
      return StepNext;
    } catch (error) {
      console.log(error);
      return 1;
    }
  }

  async GetDetailHistory(WFId, ItemIndex, indexStep) {
    let detail;
    const strSelect = `ID,ListUser/Id,DateRequest,HistoryApprover/Id,UserRequest/Id,UserRequest/Title,UserRequest/Name`;
    const strExpand = `ListUser,HistoryApprover,UserRequest`;
    const strFilter =
      `WFTableId eq ` +
      WFId +
      ` and ItemIndex eq ` +
      ItemIndex +
      ` and (StatusStep eq 0 or StatusStep eq 3)` +
      ` and indexStep eq ` +
      indexStep +
      ` and UserApproval/Id eq ` +
      this.currentUser.Id;
    // + ` and StatusStep eq 0` + ` and UserApproval/Id eq 16`;
    // + ` and StatusStep eq 0` + ` and UserApproval/Id eq 142`;
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
        objDetailField.detailRequest,
        objDetailField.detailInput
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
        SLA: stepTitle.SLA,
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
      } else if (
        objDetailField.FieldInput[i].FieldType == "Hyperlink" ||
        objDetailField.FieldInput[i].FieldType == "PictureLink"
      ) {
        let dataLink = {
          Url:
            objDetailField.detailInput[
              objDetailField.FieldInput[i].InternalName
            ],
        };
        Object.assign(dataItemUpdate, {
          [objDetailField.FieldInput[i].InternalName]: dataLink,
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

    console.log(dataItemUpdate);
    console.log(dataHistoryUpdate);
    console.log(objStepConfig);
    console.log(objDetailField);
    console.log(subForm);

    this.SendEmailRequestSub(2, objStepConfig, 3, objDetailField, subForm);

    sp.web.lists
      .getByTitle(objDetailField.WFCode)
      .items.getById(objDetailField.ItemId)
      .update(dataItemUpdate)
      .then((items) => {
        console.log("Approve Request Success");
        this.updateItemHistorySub(
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

  updateItemHistorySub(
    dataHistoryUpdate,
    objStepConfig,
    objDetailField,
    subForm
  ) {
    console.log(dataHistoryUpdate);
    sp.web.lists
      .getByTitle("WFHistory")
      .items.getById(objDetailField.detailHistoryRequest.HistoryId)
      .update(dataHistoryUpdate)
      .then((items) => {
        console.log("update history Success");
        this.callbackSendEmailSub(
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

  async callbackSendEmailSub(
    dataHistoryUpdate,
    objStepConfig,
    objDetailField,
    subForm
  ) {
    if (objDetailField.StatusSendEmail.Status != -1) {
      await this.SendEmailRequestSub(
        objDetailField.indexStep,
        objStepConfig,
        dataHistoryUpdate.indexStep,
        objDetailField
      );
      this.reloadSPLink(subForm);
    }
  }

  async SendEmailRequestSub(
    indexStep,
    objStepConfig,
    nextStep,
    objDetailField
  ) {
    let wfStepTable,
      detailItem,
      detailInput,
      StatusSendEmail,
      wfStepFieldAll = [];
    let ItemIndex = "",
      WFId = "",
      WFTitle = "",
      WFCode = "";

    wfStepTable = objDetailField.wfStepTable;
    detailItem = returnObject(objDetailField.detailRequest);
    detailInput = returnObject(objDetailField.detailInput);
    StatusSendEmail = objDetailField.StatusSendEmail;
    wfStepFieldAll = objDetailField.wfFieldTable;
    ItemIndex = objDetailField.ItemId;
    WFId = objDetailField.WFId;
    WFTitle = objDetailField.WFTitle;
    WFCode = objDetailField.WFCode;

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
          statustitle =
            '<font color="#4CAF50" style="font-weight:bold">CHUYỂN BƯỚC</font>';
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
        const configEmail = await this.GetTemplateEmail(
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
        let configEmail = await this.GetTemplateEmail(
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
        const configEmail = await this.GetTemplateEmail(
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
          Object.assign(inforEmailUserInform, {
            DearUsers: this.currentUser.Title,
          });

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
        //  wfBackStepLink.push(objDetailField.wfStepTable.find(y => y.indexStep == x))

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
      // let FieldView = stepIndex1.ObjFieldStep.FieldView;
      let FieldInput = stepIndex1.ObjFieldStep.FieldInput;
      arrButtonApprove = stepIndex1.btnAction;
      // for (let fv = 0; fv < FieldView.length; fv++) {
      //   for (let fl = 0; fl < listField.length; fl++) {
      //     if (listField[fl].InternalName == FieldView[fv]) {
      //       arrFieldView.push(listField[fl]);
      //     }
      //   }
      // }
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
      listField,
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

    const checkMapUserLoadSPLink = await this.checkGetMapUserSubForm(
      objSPLink.indexStep,
      objDetailField.wfStepTable,
      arrFieldInput,
      detailItemRequest,
      detailInput
    );
    detailInput.UserApprovalStep = checkMapUserLoadSPLink.UserApprovalStep;
    detailInput.listSelect_UserApprovalStep =
      checkMapUserLoadSPLink.listSearch_UserApprovalStep;
    detailInput.IsEditApproverStep = checkMapUserLoadSPLink.IsEditApprover;
    detailInput.isUserApprovalStep = checkMapUserLoadSPLink.isApproveNext;

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

    arrDetailField[keyDetail[1]] = objSPLink;

    if (isIndexState.isApprove) {
      await this.setState({ [keyDetail[0]]: arrDetailField });
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

  checkNewSubProcess(status) {
    const txtAlert = this.checkSaveForm(status);
    if (
      txtAlert.txtRequired != "" ||
      txtAlert.txtCompare != "" ||
      txtAlert.txtCheckLink != ""
    ) {
      let txtShow = "";
      if (isNotNull(txtAlert.txtRequired)) {
        txtShow =
          "Bạn chưa nhập các trường dữ liệu bắt buộc : " +
          txtAlert.txtRequired +
          " \n ";
      }
      if (isNotNull(txtAlert.txtCompare)) {
        txtShow += txtAlert.txtCompare;
      }
      if (isNotNull(txtAlert.txtCheckLink)) {
        txtShow +=
          "Link ở các trường: " + txtAlert.txtCheckLink + "không tồn tại \n";
      }
      alert(txtShow);
      return;
    }

    if (status == 1 && this.state.ArraySubProcess.length > 0) {
      this.setState({ infoSubProcess: true });
    } else {
      this.saveItem(status);
    }
  }

  async resultSubProcess(arraySubProcess) {
    console.log(arraySubProcess);
    await this.setState({
      infoSubProcess: false,
      ArraySubProcess: arraySubProcess,
    });

    this.saveItem(1);
  }

  async loadConfigParent() {
    //Danh sách quy trình đang hoạt động
    let wfParent = await shareService.GetArrayWFTable(1);
    // console.log(wfParent);

    // Danh sách Step có type == 'Quy trình'
    const strFilter = `StepWFType eq 'Quy trình'`;
    let wfStepParent = await shareService.GetArrayWFStepTable(strFilter);
    // console.log(wfStepParent);

    let wfStepParentId = Array.from(wfParent, ({ WFId }) => WFId);
    // console.log(wfStepParentId);

    let fieldSPLink = new Set(wfStepParentId);
    // console.log(fieldSPLink);

    //Danh sách step đi theo quy trình
    let wfStepParentCheck = wfStepParent.filter((item) =>
      fieldSPLink.has(item.WFTableId)
    );
    // console.log(wfStepParentCheck);

    let arrayNew = [];
    let objArrayParent = {
      AsyncParent: [],
      SyncParent: [],
    };
    wfStepParentCheck.map((step) => {
      let stepInfo = returnObject(step);
      let ArraySub = stepInfo.ObjStepWFId;
      if (isNotNull(ArraySub) && ArraySub.length > 0) {
        for (let i = 0; i < ArraySub.length; i++) {
          let tableWF = wfParent.find((wf) => wf.WFId == stepInfo.WFTableId);
          if (
            !ArraySub[i].Waitting &&
            ArraySub[i].WFTableId == this.WFTable.WFId &&
            isNotNull(tableWF) &&
            objArrayParent.AsyncParent.findIndex(
              (an) =>
                an.WFTableId == stepInfo.WFTableId &&
                an.indexStep == stepInfo.indexStep
            ) == -1
          ) {
            objArrayParent.AsyncParent.push({
              wfTable: tableWF,
              WFTableId: stepInfo.WFTableId,
              detailStep: ArraySub[i],
              indexStep: stepInfo.indexStep,
              StepTitle: stepInfo.Title,
            });
          } else if (
            ArraySub[i].Waitting &&
            ArraySub[i].WFTableId == this.WFTable.WFId &&
            isNotNull(tableWF) &&
            objArrayParent.SyncParent.findIndex(
              (an) =>
                an.WFTableId == stepInfo.WFTableId &&
                an.indexStep == stepInfo.indexStep
            ) == -1
          ) {
            objArrayParent.SyncParent.push({
              wfTable: tableWF,
              WFTableId: stepInfo.WFTableId,
              detailStep: ArraySub[i],
              indexStep: stepInfo.indexStep,
              StepTitle: stepInfo.Title,
            });
          }
        }
      }
    });

    console.log(objArrayParent);
    return objArrayParent;
  }

  async changeParentProcess(event) {
    let nameStateParent = event.target.name;
    let valueStateParent = event.target.value;
    if (nameStateParent == "TypeParentProcess") {
      this.setState({
        TypeParentProcess: valueStateParent,
        ArrayItemParentProcess: [],
        ParentProcess: "",
        ItemParentProcess: "",
        ParentIndexStep: "",
        ParentSearch: "",
        ParentStepTitle: "",
      });
    } else if (nameStateParent == "ParentSearch") {
      if (isNotNull(valueStateParent)) {
        let detailParent = valueStateParent.split("||");
        this.setState({
          ParentSearch: valueStateParent,
          ParentProcess: CheckNull(detailParent[0]),
          ArrayItemParentProcess: [],
          ItemParentProcess: "",
          ParentIndexStep: CheckNull(detailParent[1]),
          ParentStepTitle: CheckNull(detailParent[2]),
        });
      } else {
        this.setState({
          ParentSearch: valueStateParent,
          ParentProcess: "",
          ArrayItemParentProcess: [],
          ItemParentProcess: "",
          ParentIndexStep: "",
          ParentStepTitle: "",
        });
      }
    } else {
      this.setState({ [nameStateParent]: valueStateParent });
    }
  }

  async searchItemParent() {
    if (!isNotNull(this.state.ParentProcess)) {
      alert("Bạn chưa chọn quy trình cha");
      return;
    }
    this.showLoadingPage();

    await this.setState({
      ArrayItemParentProcess: [],
      ItemParentProcess: "",
    });

    let strSelect = `ID,Title,indexStep,StatusStep,ListUserId,ObjSubWF,HistoryStep`;
    let strFilter = `ID ne 0`;

    if (isNotNull(this.state["ParentProcessDateStart"])) {
      let start = moment(this.state["ParentProcessDateStart"])
        .startOf("day")
        .toDate();
      let startDate = ISODateString(start);
      strFilter += ` and Created ge '` + startDate + `'`;
    }

    if (isNotNull(this.state["ParentProcessDateEnd"])) {
      let end = moment(this.state["ParentProcessDateEnd"])
        .endOf("day")
        .toDate();
      let endDate = ISODateString(end);
      strFilter += ` and Created le '` + endDate + `'`;
    }

    let wfCode = "";
    let wfInfoSub = "";
    if (this.state.TypeParentProcess == "SyncProcess") {
      // let wfInfoSync = this.state.ArraySyncParentProcess.find(
      //   (pc) => pc.WFTableId == this.state.ParentProcess
      // );
      // if (wfInfoSync) {
      //   wfCode = CheckNull(wfInfoSync.wfTable.WFCode);
      // }
      wfInfoSub = this.state.ArraySyncParentProcess.find(
        (pc) =>
          pc.WFTableId == this.state.ParentProcess &&
          pc.indexStep == this.state.ParentIndexStep
      );
    } else {
      // let wfInfoAsync = this.state.ArrayAsyncParentProcess.find(
      //   (pc) => pc.WFTableId == this.state.ParentProcess
      // );
      // if (wfInfoAsync) {
      //   wfCode = CheckNull(wfInfoAsync.wfTable.WFCode);
      // }
      wfInfoSub = this.state.ArrayAsyncParentProcess.find(
        (pc) =>
          pc.WFTableId == this.state.ParentProcess &&
          pc.indexStep == this.state.ParentIndexStep
      );
    }

    let arrList = [];
    await sp.web.lists
      .getByTitle(wfInfoSub.wfTable.WFCode)
      .items.select(strSelect)
      .filter(strFilter)
      .get()
      .then((listWF) => {
        listWF.forEach((element) => {
          let userList = [];
          if (isNotNull(element["ListUserId"])) {
            userList = element["ListUserId"];
          }
          let objSubWF = [];
          if (isNotNull(element["ObjSubWF"])) {
            objSubWF = JSON.parse(element["ObjSubWF"]);
          }
          let itemHistoryStep = [];
          if (isNotNull(element["HistoryStep"])) {
            itemHistoryStep = JSON.parse(element["HistoryStep"]);
          }
          if (
            itemHistoryStep.findIndex(
              (hst) => hst.indexStep == wfInfoSub.indexStep
            ) != -1
          ) {
            arrList.push({
              ID: element.ID,
              Title: CheckNull(element.Title),
              indexStep: CheckNullSetZero(element.indexStep),
              StatusStep: CheckNullSetZero(element.StatusStep),
              ListUser: userList,
              ObjSubWF: objSubWF,
              HistoryStep: itemHistoryStep,
            });
          }
        });
      })
      .catch((error) => {
        console.log(error);
        this.hideLoadingPage();
      });

    if (this.state.TypeParentProcess == "SyncProcess") {
      let listItemParent = [];
      for (let index = 0; index < arrList.length; index++) {
        let itemParent = returnObject(arrList[index]);
        if (itemParent.ObjSubWF.length > 0) {
          let checkFinish = await shareService.checkFinishSubProcess(
            itemParent.ObjSubWF,
            false,
            "",
            ""
          );
          if (
            !checkFinish.isParentFinish &&
            checkFinish.ObjParentWF.createStep == this.state.ParentIndexStep
          ) {
            Object.assign(itemParent, { ObjParentWF: checkFinish.ObjParentWF });
            listItemParent.push(itemParent);
          }
        }
      }

      console.log(listItemParent);
      await this.setState({ ArrayItemParentProcess: listItemParent });
    } else {
      console.log(arrList);
      await this.setState({ ArrayItemParentProcess: arrList });
    }
    this.hideLoadingPage();
  }

  async GetListUserHistory() {
    let strSelect = `ID,"ListUser/Id,ListUser/Title,ListUser/Name`;
    let strExpand = `ListUser`;
    let userLists = [];
    await sp.web.lists
      .getByTitle("WFHistory")
      .items.getById(this.HistoryId)
      .select(strSelect)
      .expand(strExpand)
      .get.then((historyS) => {
        if (isNotNull(historyS)) {
          if (isNotNull(historyS["ListUser"])) {
            historyS["ListUser"].forEach((item) => {
              userLists.push(item["Id"]);
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return userLists;
  }

  async showLoadingPage() {
    await this.setState({ isShowLoadingPage: true });
  }

  async hideLoadingPage() {
    await this.setState({ isShowLoadingPage: false });
  }
}
