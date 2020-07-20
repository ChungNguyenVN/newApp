import { sp } from "@pnp/sp";
import { config } from "./../../pages/environment.js";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import "@pnp/sp/site-groups";
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
  loadBranch,
  loadChildBranch,
  loadWFByDept,
  checkUpdateData,
} from "./wfShareFunction.js";
import {
  objField,
  objDataTransfer,
  arrayDataTransfer,
} from "./wfShareModel.js";

class UserStore {
  constructor() {
    if (!UserStore.instance) {
      sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });

      UserStore.instance = this;
    }

    return UserStore.instance;
  }

  async getCurrentUser() {
    const currentUser = await sp.web.currentUser();
    // console.log(currentUser);
    return currentUser;
  }

  async checkPermissionUser(UserId, ListDepartment) {
    let permissUser = { Permission: "User", Dept: [] };
    const siteGroups = await sp.web.currentUser.groups();
    // console.log(siteGroups);
    if (siteGroups.findIndex((gr) => gr.Title == "BPM Admins") != -1) {
      permissUser.Permission = "Admin";
      let root = loadBranch(ListDepartment, "", []);
      // console.log(root);
      permissUser.Dept = root;
    } else if (siteGroups.findIndex((gr) => gr.Title == "BPM Managers") != -1) {
      let dept = ListDepartment.filter(
        (dp) => dp.Manager == UserId || dp.Members.indexOf(UserId) != -1
      );
      if (dept.length > 0) {
        permissUser.Permission = "Manager";
        for (let index = 0; index < dept.length; index++) {
          let childbranch = loadBranch(ListDepartment, dept[index].Code, []);
          dept[index].children = childbranch;
          dept[index].childrenDept = childbranch;
        }
      }
      permissUser.Dept = dept;
    } else {
      let dept = ListDepartment.filter((dp) => dp.Manager == UserId);
      if (dept.length > 0) {
        permissUser.Permission = "Manager";
        for (let index = 0; index < dept.length; index++) {
          let childbranch = loadBranch(ListDepartment, dept[index].Code, []);
          dept[index].children = childbranch;
          dept[index].childrenDept = childbranch;
        }
        permissUser.Dept = dept;
      } else {
        let deptMember = ListDepartment.filter(
          (dp) => dp.Members.indexOf(UserId) != -1
        );
        permissUser.Dept = deptMember;
      }
    }
    // console.log(permissUser);
    return permissUser;
  }

  async GetListDepartment() {
    let items = [];
    await sp.web.lists
      .getByTitle("ListDepartment")
      .items.select(
        "ID,Title,DeptCode,ManagerId,Manager/Id,Manager/Title,Manager/Name,MembersId,Members/Id,Members/Title,Members/Name,ParentCode"
      )
      .expand("Manager,Members")
      .get()
      .then((itemList) => {
        // console.log(itemList);
        if (itemList.length > 0) {
          itemList.forEach((element) => {
            let usManager = {
              UserId: "",
              UserTitle: "",
              UserEmail: "",
            };
            if (isNotNull(element["Manager"])) {
              usManager = {
                UserId: element["Manager"].Id,
                UserTitle: element["Manager"].Title,
                UserEmail: CheckNull(element["Manager"].Name.split("|")[2]),
              };
            }
            let usMember = [];
            if (isNotNull(element["Members"])) {
              element["Members"].map((us) => {
                usMember.push({
                  UserId: us.Id,
                  UserTitle: us.Title,
                  UserEmail: CheckNull(us.Name.split("|")[2]),
                });
              });
            }

            items.push({
              ID: element.ID,
              Title: CheckNull(element.Title),
              Code: CheckNull(element.DeptCode),
              Manager: element.ManagerId,
              Members: element.MembersId,
              ParentCode: CheckNull(element.ParentCode),
              label: CheckNull(element.Title),
              children: [],
              childrenDept: [],
              UserMembers: usMember,
              USerManager: usManager,
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
  async GetListMenu() {
    let items = [];
    await sp.web.lists
      .getByTitle("ListMenu")
      .items.select(
        "ID,Title,Code,LinkMenu,OrderNumber,IconName,ParentCode,ClassName,TargetBlank,IsApplication"
      )
      .orderBy("OrderNumber", true)
      .get()
      .then((itemList) => {
        // console.log(itemList);
        if (itemList.length > 0) {
          itemList.forEach((element) => {
            let LinkMenu = "";
            if (isNotNull(element.LinkMenu)) {
              if (element.IsApplication) {
                LinkMenu = config.url.link + element.LinkMenu;
                let type = process.env.NODE_ENV;
                if (type == "development") {
                  if (element.LinkMenu.indexOf("/Default.aspx") != -1) {
                    LinkMenu = element.LinkMenu.replace(
                      "Default.aspx",
                      "index.html"
                    );
                  } else {
                    LinkMenu = element.LinkMenu.replace("aspx", "html");
                  }
                } else {
                  LinkMenu = element.LinkMenu;
                }
              } else {
                LinkMenu = element.LinkMenu;
              }
            }
            items.push({
              ID: element.ID,
              Title: CheckNull(element.Title),
              Code: CheckNull(element.Code),
              LinkMenu: LinkMenu,
              OrderNumber: CheckNullSetZero(element.OrderNumber),
              IconName: CheckNull(element.IconName),
              ParentCode: CheckNull(element.ParentCode),
              ClassName: CheckNull(element.ClassName),
              TargetBlank: element.TargetBlank,
              IsApplication: element.IsApplication,
              Open: false,
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

  async AddItem(listName, data) {
    let items = { success: "", errors: "", data: {} };
    await sp.web.lists
      .getByTitle(listName)
      .items.add(data)
      .then((itemss) => {
        // console.log(itemss);
        items.success = "success";
        items.data = itemss["data"];
      })
      .catch((error) => {
        console.log(error);
        items.errors = error;
      });
    return items;
  }

  async UpdateItem(listName, ItemId, data) {
    let items = { success: "", errors: "" };
    await sp.web.lists
      .getByTitle(listName)
      .items.getById(ItemId)
      .update(data)
      .then((itemss) => {
        // console.log(itemss);
        items.success = "success";
      })
      .catch((error) => {
        console.log(error);
        items.errors = error;
      });
    return items;
  }

  async GetItemDetailByID(listName, ItemId, arrSelect) {
    let detailById = {
      DateModified: "",
      HistoryModified: [],
      StatusStep: 0,
    };
    let strSelect = `ID,Title,StatusStep,HistoryStep,Modified`;
    if (isNotNull(arrSelect) && arrSelect.length > 0) {
      arrSelect.map((selectF) => {
        strSelect += "," + selectF;
        Object.assign(detailById, { [selectF]: "" });
      });
    }
    await sp.web.lists
      .getByTitle(listName)
      .items.getById(ItemId)
      .select(strSelect)
      .get()
      .then((itemID) => {
        if (isNotNull(itemID)) {
          if (isNotNull(itemID["HistoryStep"])) {
            detailById.HistoryModified = JSON.parse(itemID["HistoryStep"]);
          }
          detailById.DateModified = CheckNull(itemID["Modified"]);
          detailById.StatusStep = CheckNullSetZero(itemID["StatusStep"]);
          if (isNotNull(arrSelect) && arrSelect.length > 0) {
            for (let inF = 0; inF < arrSelect.length; inF++) {
              detailById[arrSelect[inF]] = CheckNull(itemID[arrSelect[inF]]);
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return detailById;
  }

  // Tìm kiếm danh sách người theo key
  async searchPeoplePicker(value) {
    let arrPeople = [];
    await sp.profiles
      .clientPeoplePickerSearchUser({
        MaximumEntitySuggestions: 5,
        PrincipalSource: 15,
        PrincipalType: 1,
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

  async getInforUser(Key, typeUser, InternalName) {
    let objUser = {
      UserId: "",
      UserTitle: "",
      UserEmail: "",
    };
    let user = await sp.web.ensureUser(Key);
    if (isNotNull(user)) {
      objUser = {
        UserId: CheckNullSetZero(user["data"].Id),
        UserTitle: CheckNull(user["data"].Title),
        UserEmail: CheckNull(user["data"].Email),
      };
    }
    return objUser;
  }

  async loadInfoEmail(
    inforEmailDefault,
    wfStepFieldAll,
    detailInput,
    detailItem,
    fieldReplace
  ) {
    let inforEmailApprover = "";
    inforEmailApprover = returnObject(inforEmailDefault);

    for (let fr = 0; fr < fieldReplace.length; fr++) {
      for (let fs = 0; fs < wfStepFieldAll.length; fs++) {
        if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          wfStepFieldAll[fs].FieldType == "DateTime"
        ) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: formatDate(
                detailInput[wfStepFieldAll[fs].InternalName]
              ),
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: formatDate(
                detailItem[wfStepFieldAll[fs].InternalName]
              ),
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          wfStepFieldAll[fs].FieldType == "User"
        ) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]:
                detailInput[wfStepFieldAll[fs].InternalName].UserTitle,
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]:
                detailItem[wfStepFieldAll[fs].InternalName].UserTitle,
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          wfStepFieldAll[fs].FieldType == "UserMulti"
        ) {
          if (
            isNotNull(detailInput[`list_` + wfStepFieldAll[fs].InternalName])
          ) {
            let users = "";
            detailInput[`list_` + wfStepFieldAll[fs].InternalName].forEach(
              (element) => {
                users += element.UserTitle + ", ";
              }
            );
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: users,
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            let users = "";
            detailItem[wfStepFieldAll[fs].InternalName].forEach((element) => {
              users += element.UserTitle + ", ";
            });
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: users,
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          wfStepFieldAll[fs].FieldType == "YesNo"
        ) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            const yesno = detailInput[wfStepFieldAll[fs].InternalName]
              ? "Có"
              : "Không";
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: yesno,
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            const yesno = detailItem[wfStepFieldAll[fs].InternalName]
              ? "Có"
              : "Không";
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: yesno,
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          wfStepFieldAll[fs].FieldType == "CheckBox"
        ) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            let checkbox = "";
            detailInput[wfStepFieldAll[fs].InternalName].forEach((element) => {
              if (element.isChecked) {
                checkbox += element.Value + ", ";
              }
            });
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: checkbox,
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            let checkbox = "";
            detailItem[wfStepFieldAll[fs].InternalName].forEach((element) => {
              if (element.isChecked) {
                checkbox += element.Value + ", ";
              }
            });
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: checkbox,
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          wfStepFieldAll[fs].FieldType == "RadioButton"
        ) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            let radiobutton = "";
            detailInput[wfStepFieldAll[fs].InternalName].forEach((element) => {
              if (element.isChecked) {
                radiobutton += element.Value + ", ";
              }
            });
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: radiobutton,
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            let radiobutton = "";
            detailItem[wfStepFieldAll[fs].InternalName].forEach((element) => {
              if (element.isChecked) {
                radiobutton += element.Value + ", ";
              }
            });
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: radiobutton,
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          wfStepFieldAll[fs].FieldType == objField.SPLinkWF
        ) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            let txtSPLink = "";
            let spLink = detailInput[wfStepFieldAll[fs].InternalName];
            spLink.map((elements) => {
              txtSPLink += CheckNull(elements.Title) + "; ";
            });
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: txtSPLink,
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            let txtSPLink = "";
            let spLink = detailItem[wfStepFieldAll[fs].InternalName];
            spLink.map((elements) => {
              txtSPLink += CheckNull(elements.Title) + "; ";
            });
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: txtSPLink,
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (
          wfStepFieldAll[fs].InternalName == fieldReplace[fr] &&
          (wfStepFieldAll[fs].FieldType == objField.Hyperlink ||
            wfStepFieldAll[fs].FieldType == objField.PictureLink)
        ) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            let spLink =
              `<a target="_blank" href="` +
              detailInput[wfStepFieldAll[fs].InternalName] +
              `">` +
              detailInput[wfStepFieldAll[fs].InternalName] +
              `</a>`;
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: spLink,
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            let spLink =
              `<a target="_blank" href="` +
              detailItem[wfStepFieldAll[fs].InternalName] +
              `">` +
              detailItem[wfStepFieldAll[fs].InternalName] +
              `</a>`;
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: spLink,
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else if (wfStepFieldAll[fs].InternalName == fieldReplace[fr]) {
          if (isNotNull(detailInput[wfStepFieldAll[fs].InternalName])) {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]:
                detailInput[wfStepFieldAll[fs].InternalName],
            });
            break;
          } else if (isNotNull(detailItem[wfStepFieldAll[fs].InternalName])) {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]:
                detailItem[wfStepFieldAll[fs].InternalName],
            });
            break;
          } else {
            Object.assign(inforEmailApprover, {
              [wfStepFieldAll[fs].InternalName]: "",
            });
            break;
          }
        } else {
          if (fs == wfStepFieldAll.length - 1) {
            Object.assign(inforEmailApprover, { [fieldReplace[fr]]: "" });
            break;
          }
        }
      }
    }
    // console.log(inforEmailApprover);
    return inforEmailApprover;
  }

  async GetTemplateEmail(emailTemplateID) {
    let info = {
      ID: "",
      Title: "",
      SubjectEmail: "",
      BodyEmail: "",
      FieldReplateText: "",
    };
    // console.log(info)
    await sp.web.lists
      .getByTitle("WFTemplateEmail")
      .items.getById(emailTemplateID)
      .select("ID,Title,SubjectEmail,BodyEmail,FieldReplateText")
      .get()
      .then((item) => {
        if (isNotNull(item)) {
          info = {
            ID: item.ID,
            Title: CheckNull(item.Title),
            SubjectEmail: item.SubjectEmail,
            BodyEmail: item.BodyEmail,
            FieldReplateText: item.FieldReplateText,
          };
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return info;
  }

  async GetWFTable(WFId) {
    let title = { WFId: "", WFCode: "", WFTitle: "", WFIndexStep: "" };
    await sp.web.lists
      .getByTitle("WFTable")
      .items.getById(WFId)
      .select(
        `ID,Title,Code,Created,Status,WhoIsUsed,WIUGroup,WIUId,WIU/Id,WIU/Title,WIU/Name,indexStep,SLA`
      )
      .expand(`WIU`)
      .get()
      .then((listWF) => {
        let userDefault = [];
        if (isNotNull(listWF["WIU"])) {
          listWF["WIU"].map((us) => {
            userDefault.push({
              UserId: us.Id,
              UserTitle: us.Title,
              UserEmail: CheckNull(us.Name.split("|")[2]),
            });
          });
        }
        title = {
          WFId: WFId,
          WFCode: CheckNull(listWF["Code"]),
          WFTitle: CheckNull(listWF["Title"]),
          WFIndexStep:
            CheckNullSetZero(listWF["indexStep"]) > 0
              ? CheckNullSetZero(listWF["indexStep"])
              : 1,
          Description: CheckNull(listWF["Description"]),
          WhoIsUsed: CheckNull(listWF["WhoIsUsed"]),
          Department: CheckNull(listWF["WIUGroup"]),
          UserDefault: userDefault,
          Status: CheckNull(listWF["Status"]),
          SLA: CheckNullSetZero(listWF["SLA"]),
        };
      })
      .catch((error) => {
        console.log(error);
      });
    return title;
  }

  async GetWFStepTable(WFId) {
    let arrStepWF = [];
    const strSelect = `ID,Title,Code,indexStep,ClassifyStep,StepWFType,TypeofApprover,ApproveCode,RoleCode,DepartmentCode,ObjStepWFId,ObjBackStep,StepNextDefault,ObjStepCondition,ObjEmailCfg,SLA,ObjFieldStep,btnAction,GroupApprover,IsEditApprover,UserApprover/Title,UserApprover/Id,UserApprover/Name`;
    await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(strSelect)
      .expand("UserApprover")
      .filter("WFTableId eq " + WFId)
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

            let objStepCon = returnObject(ObjStepCondition);
            if (!isNotNull(objStepCon.ArrayStepCondition)) {
              ObjStepCondition = {
                IsActive: objStepCon.IsActive,
                ArrayStepCondition: [
                  {
                    Priority: 1,
                    ConditionsCombined: "",
                    TypeCondition: objStepCon.TypeCondition,
                    ObjCondition: objStepCon.ObjCondition,
                    StepNextCondition: objStepCon.StepNextCondition,
                  },
                ],
              };
            }
          }
          let ObjFieldStep = {
            FieldInput: [],
            FieldView: [],
            isAttachments: false,
            isViewAttachments: false,
            isEditAttachments:false
          };
          if (isNotNull(itemDetail.ObjFieldStep)) {
            ObjFieldStep = JSON.parse(itemDetail.ObjFieldStep);
            if (ObjFieldStep.isViewAttachments == undefined) {
              Object.assign(ObjFieldStep, { isViewAttachments: false });
            }
            if (ObjFieldStep.isEditAttachments == undefined) {
              Object.assign(ObjFieldStep, { isEditAttachments: false });
            }
            if (
              ObjFieldStep.FieldInput.length > 0 &&
              ObjFieldStep.FieldInput[0].IsFirstColumn === undefined
            ) {
              let arrayFieldOld = returnArray(ObjFieldStep.FieldInput);
              let arrayFieldNew = [];
              arrayFieldOld.map((field, indexF) => {
                if (indexF % 2 == 0) {
                  arrayFieldNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: true,
                    OrderIndex: indexF,
                  });
                } else {
                  arrayFieldNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: false,
                    OrderIndex: indexF,
                  });
                }
              });
              ObjFieldStep.FieldInput = arrayFieldNew;
            }
            if (
              ObjFieldStep.FieldView.length > 0 &&
              ObjFieldStep.FieldView[0].IsFirstColumn === undefined
            ) {
              let arrayFieldViewOld = returnArray(ObjFieldStep.FieldView);
              let arrayFieldViewNew = [];
              arrayFieldViewOld.map((field, indexF) => {
                if (indexF % 2 == 0) {
                  arrayFieldViewNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: true,
                    OrderIndex: indexF,
                  });
                } else {
                  arrayFieldViewNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: false,
                    OrderIndex: indexF,
                  });
                }
              });
              ObjFieldStep.FieldView = arrayFieldViewNew;
            }
          }
          let GroupApprover = {
            TypeUserApproval: "",
            Group: { ID: "", Title: "" },
          };

          let ObjEmailCfg = "";
          if (isNotNull(itemDetail.ObjEmailCfg)) {
            ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);
          }
          let userApprover = {
            UserId: "",
            UserTitle: "",
            UserEmail: "",
          };
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
          }
          if (isNotNull(itemDetail.TypeofApprover)) {
            TypeofApprover = CheckNull(itemDetail.TypeofApprover);
          }
          if (isNotNull(itemDetail.ApproveCode)) {
            ApproveCode = CheckNull(itemDetail.ApproveCode);
          }
          if (isNotNull(itemDetail.RoleCode)) {
            RoleCode = CheckNull(itemDetail.RoleCode);
          }
          if (isNotNull(itemDetail.GroupApprover)) {
            GroupApprover = JSON.parse(itemDetail.GroupApprover);
          }
          let DepartmentCode = "";
          if (isNotNull(itemDetail.DepartmentCode)) {
            DepartmentCode = CheckNull(itemDetail.DepartmentCode);
          }
          let btnAction = "";
          if (isNotNull(itemDetail.btnAction)) {
            btnAction = JSON.parse(itemDetail.btnAction);
          }
          let ObjBackStep = "";
          if (isNotNull(itemDetail.ObjBackStep)) {
            ObjBackStep = JSON.parse(itemDetail.ObjBackStep);
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
            SLA: CheckNullSetZero(itemDetail.SLA),
            ObjFieldStep: ObjFieldStep,
            btnAction: btnAction,
            TypeofApprover: TypeofApprover,
            ApproveCode: ApproveCode,
            RoleCode: RoleCode,
            UserApprover: userApprover,
            GroupApprover: GroupApprover,
            IsEditApprover: itemDetail.IsEditApprover,
            ObjBackStep: ObjBackStep,
            DepartmentCode: DepartmentCode,
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return arrStepWF;
  }

  async GetWFFormField(WFId) {
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
            let objFields = returnObject(ObjSPField.ObjField);
            if (
              CheckNull(itemDetail.FieldType) == objField.SPLinkWF &&
              objFields.ObjSPLink == undefined &&
              isNotNull(ObjSPField.TextField)
            ) {
              let textField = ObjSPField.TextField.split("|");
              Object.assign(objFields, {
                ObjSPLink: {
                  wfTableId: textField[1],
                  wfTableCode: textField[0],
                  typeSPLink: "ViewDetail",
                },
              });
              ObjSPField.ObjField = objFields;
            }
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
    return arrStepField;
  }

  async startSubWF(
    title,
    parentInfo,
    wfSubId,
    userRequest,
    AlowDataTransfer,
    CorrespondingFields,
    dataParentInput,
    dataParentView,
    Waitting,
    currentUser,
    EmailSendToSubProcess,
    stepIndexs,
    titleSteps
  ) {
    let itemId = 0;
    let wfSubTable = await this.GetWFTable(wfSubId);
    // console.log(wfSubTable);
    let listUser = [];
    if (
      dataParentInput["ListUserId"] != undefined &&
      dataParentInput["ListUserId"].results != undefined
    ) {
      listUser = returnArray(dataParentInput["ListUserId"].results);
    }
    if (dataParentView["ListUser"] != undefined) {
      dataParentView["ListUser"].map((user) => {
        if (listUser.indexOf(user) == -1) {
          listUser.push(user);
        }
      });
    }
    if (isNotNull(currentUser.Id) && listUser.indexOf(currentUser.Id) == -1) {
      listUser.push(currentUser.Id);
    }

    let dataSub = {
      Title: title,
      UserRequestId: userRequest.UserId,
      indexStep: wfSubTable.WFIndexStep,
      StatusRequest: 0,
      StatusStep: 0,
      ListUserId: { results: listUser },
    };
    if (AlowDataTransfer) {
      for (let i = 0; i < CorrespondingFields.length; i++) {
        let InternalNameSub = CorrespondingFields[i].FieldSub.InternalName;
        let InternalNameParent =
          CorrespondingFields[i].FieldParent.InternalName;
        let FieldTypeParent = CorrespondingFields[i].FieldParent.FieldType;
        let dataTransfer = CorrespondingFields[i].DataTransfer;
        if (
          (FieldTypeParent == objField.User ||
            FieldTypeParent == objField.UserMulti) &&
          dataParentInput[InternalNameParent + "Id"] != undefined &&
          (dataTransfer == objDataTransfer.DataTransmitted ||
            dataTransfer == objDataTransfer.DataSynchronized)
        ) {
          Object.assign(dataSub, {
            [InternalNameSub + "Id"]: dataParentInput[
              InternalNameParent + "Id"
            ],
          });
        } else if (
          dataParentInput[InternalNameParent] != undefined &&
          (dataTransfer == objDataTransfer.DataTransmitted ||
            dataTransfer == objDataTransfer.DataSynchronized)
        ) {
          Object.assign(dataSub, {
            [InternalNameSub]: dataParentInput[InternalNameParent],
          });
        } else if (
          dataParentView[InternalNameParent] != undefined &&
          (dataTransfer == objDataTransfer.DataTransmitted ||
            dataTransfer == objDataTransfer.DataSynchronized)
        ) {
          if (FieldTypeParent == objField.User) {
            if (isNotNull(dataParentView[InternalNameParent].UserId)) {
              Object.assign(dataSub, {
                [InternalNameSub + `Id`]: dataParentView[InternalNameParent]
                  .UserId,
              });
            } else {
              Object.assign(dataSub, {
                [InternalNameSub + `Id`]: null,
              });
            }
          } else if (FieldTypeParent == objField.UserMulti) {
            let userDefault = [];
            const listPeople = dataParentView[InternalNameParent];
            for (let i = 0; i < listPeople.length; i++) {
              userDefault.push(listPeople[i].UserId);
            }
            Object.assign(dataSub, {
              [InternalNameSub + `Id`]: { results: userDefault },
            });
          } else if (FieldTypeParent == objField.CheckBox) {
            let arrCheck = dataParentView[InternalNameParent];
            let arrInput = [];
            for (let inChoice = 0; inChoice < arrCheck.length; inChoice++) {
              if (arrCheck[inChoice].isChecked) {
                arrInput.push(arrCheck[inChoice].Value);
              }
            }
            if (arrInput.length > 0) {
              Object.assign(dataSub, {
                [InternalNameSub]: { results: arrInput },
              });
            } else {
              Object.assign(dataSub, {
                [InternalNameSub]: { results: [] },
              });
            }
          } else if (FieldTypeParent == objField.RadioButton) {
            let arrRadio = dataParentView[InternalNameParent];
            let textRadio = "";
            for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
              if (arrRadio[inChoice].isChecked) {
                textRadio = arrRadio[inChoice].Value;
                break;
              }
            }
            Object.assign(dataSub, {
              [InternalNameSub]: textRadio,
            });
          } else if (FieldTypeParent == objField.YesNo) {
            Object.assign(dataSub, {
              [InternalNameSub]: dataParentView[InternalNameParent],
            });
          } else if (
            FieldTypeParent == objField.Hyperlink ||
            FieldTypeParent == objField.PictureLink
          ) {
            let dataLink = { Url: dataParentView[InternalNameParent] };
            Object.assign(dataSub, { [InternalNameSub]: dataLink });
          } else if (FieldTypeParent == objField.SPLinkWF) {
            let arrSPLink = dataParentView[InternalNameParent];
            let arrInputSPLink = [];
            for (let inSP = 0; inSP < arrSPLink.length; inSP++) {
              arrInputSPLink.push({
                WFId: arrSPLink[inSP].WFId,
                ItemId: arrSPLink[inSP].ItemId,
                indexStep: arrSPLink[inSP].indexStep,
                Title: arrSPLink[inSP].Title,
              });
            }
            Object.assign(dataSub, {
              [InternalNameSub]: JSON.stringify(arrInputSPLink),
            });
          } else {
            if (isNotNull(dataParentView[InternalNameParent])) {
              Object.assign(dataSub, {
                [InternalNameSub]: dataParentView[InternalNameParent],
              });
            } else {
              Object.assign(dataSub, { [InternalNameSub]: null });
            }
          }
        }
      }
      parentInfo.CorrespondingFields = CorrespondingFields;
    }

    Object.assign(dataSub, {
      ObjParentWF: JSON.stringify(parentInfo),
    });
    // console.log(dataSub);

    let itemSub = await sp.web.lists
      .getByTitle(wfSubTable.WFCode)
      .items.add(dataSub);
    itemId = itemSub["data"].ID;

    let dataHistorySub = {
      Title: title,
      UserRequestId: userRequest.UserId,
      UserCreatedId: userRequest.UserId,
      StatusRequest: 0,
      DateRequest: new Date(),
      WFTableId: wfSubTable.WFId,
      ItemIndex: itemId,
      indexStep: wfSubTable.WFIndexStep,
      StatusRequest: 0,
      StatusStep: 0,
    };
    // console.log(dataHistorySub);

    await sp.web.lists.getByTitle("WFHistory").items.add(dataHistorySub);

    if (
      isNotNull(EmailSendToSubProcess) &&
      isNotNull(EmailSendToSubProcess.BodyEmail)
    ) {
      let infoEmail = {
        WorkflowTitleRequest: wfSubTable.WFTitle,
        DearUsers: CheckNull(userRequest.UserTitle),
        Title: title,
        UserParent: CheckNull(currentUser.Title),
        ParentProcess: CheckNull(parentInfo.wfTable.WFTitle),
        ItemUrl:
          config.pages.wfRequestView +
          `?WFTableId=` +
          wfSubTable.WFId +
          `&ItemIndex=` +
          itemId +
          `&indexStep=` +
          wfSubTable.WFIndexStep,
        HomeUrl: config.pages.wfDashboard,
      };

      let dataSendEmail = {
        Title: wfSubTable.WFCode,
        IndexItem: itemId,
        Step: wfSubTable.WFIndexStep,
        KeyList: wfSubTable.WFCode + "_" + itemId,
        SubjectMail: ReplaceFieldMail(
          infoEmail,
          EmailSendToSubProcess.SubjectEmail
        ),
        BodyMail: ReplaceFieldMail(infoEmail, EmailSendToSubProcess.BodyEmail),
        SendMailTo: userRequest.UserEmail,
        TypeEmail: EmailSendToSubProcess.Title,
      };
      let addEmail = await this.AddItem("ListRequestSendMail", dataSendEmail);
    }

    const subInfo = {
      wfTable: wfSubTable,
      ItemIndex: itemId,
      isWaitting: Waitting,
      indexStep: stepIndexs,
      titleStep: titleSteps,
    };

    return subInfo;
  }

  async addNewSubWF(
    ItemIndex,
    HistoryId,
    indexStep,
    dataParentInput,
    dataParentView,
    objStepConfig,
    stepTitle,
    isFinishParent,
    HistoryStep,
    WFTable,
    currentUser,
    wfStepField,
    detailInput,
    itemSubProcess,
    EmailSendToSubProcess,
    objParentOld
  ) {
    let titleParent = isNotNull(dataParentInput.Title)
      ? dataParentInput.Title
      : CheckNull(dataParentView.Title);
    let title =
      WFTable.WFTitle + " - " + currentUser.Title + " - " + titleParent;

    let emailInfo = "";
    let userApprover = {
      UserId: null,
      UserTitle: "",
      UserEmail: "",
    };
    let step = indexStep;
    if (isNotNull(objParentOld)) {
      emailInfo = objParentOld.emailInfo;
      userApprover = objParentOld.UserApproval;
      step = objParentOld.indexStep;
    } else {
      if (
        !isFinishParent &&
        itemSubProcess.Waitting &&
        stepTitle.ObjEmailCfg &&
        stepTitle.ObjEmailCfg.EmailSendApprover.IsActive &&
        objStepConfig.UserApprover
      ) {
        let inforEmailDefault = {
          UserRequest: currentUser.Title,
          ItemIndex: ItemIndex,
          HomeUrl: config.pages.wfDashboard,
          WorkflowTitleRequest: WFTable.WFTitle,
          ItemUrl:
            config.pages.wfRequestView +
            `?WFTableId=` +
            WFTable.WFId +
            `&ItemIndex=` +
            ItemIndex +
            `&indexStep=` +
            objStepConfig.indexStep,
        };
        const configEmail = await this.GetTemplateEmail(
          stepTitle.ObjEmailCfg.EmailSendApprover.ObjEmailTemplate.TemplateId
        );
        if (
          isNotNull(configEmail.SubjectEmail) &&
          isNotNull(configEmail.BodyEmail) &&
          isNotNull(configEmail.FieldReplateText)
        ) {
          let objInfoMail = await this.loadInfoEmail(
            inforEmailDefault,
            wfStepField,
            detailInput,
            dataParentView,
            configEmail.FieldReplateText.split(",")
          );
          Object.assign(objInfoMail, {
            DearUsers: objStepConfig.UserApprover.UserTitle,
          });
          emailInfo = {
            Title: WFTable.WFCode,
            IndexItem: ItemIndex,
            Step: indexStep,
            KeyList: WFTable.WFCode + "_" + ItemIndex,
            SubjectMail: ReplaceFieldMail(
              objInfoMail,
              configEmail.SubjectEmail
            ),
            BodyMail: ReplaceFieldMail(objInfoMail, configEmail.BodyEmail),
            SendMailTo: objStepConfig.UserApprover.UserEmail,
            TypeEmail: configEmail.Title,
          };
        }
      }

      if (
        !isFinishParent &&
        itemSubProcess.Waitting &&
        objStepConfig.UserApprover
      ) {
        userApprover = objStepConfig.UserApprover;
        step = objStepConfig.indexStep;
      }
    }

    let parentInfo = {
      wfTable: WFTable,
      ItemIndex: ItemIndex,
      indexStep: step,
      StatusStep: isFinishParent ? 1 : 0,
      UserApproval: userApprover,
      UserRequest: {
        UserId: currentUser.Id,
        UserTitle: currentUser.Title,
        UserEmail: currentUser.Email,
      },
      isFinish: isFinishParent,
      emailInfo: emailInfo,
      HistoryStep: HistoryStep,
      HistoryID: HistoryId,
      CorrespondingFields: [],
      isWaitting: itemSubProcess.Waitting,
      createStep: indexStep,
    };
    // console.log(parentInfo);

    let arrInfoSub = [];
    for (
      let index = 0;
      index < itemSubProcess.list_SubUserRequest.length;
      index++
    ) {
      let infoSub = await this.startSubWF(
        title,
        parentInfo,
        itemSubProcess.WFTableId,
        itemSubProcess.list_SubUserRequest[index],
        itemSubProcess.AlowDataTransfer,
        itemSubProcess.CorrespondingFields,
        dataParentInput,
        dataParentView,
        itemSubProcess.Waitting,
        currentUser,
        EmailSendToSubProcess,
        indexStep,
        CheckNull(itemSubProcess.StepTitle)
      );
      arrInfoSub.push(infoSub);
    }

    return arrInfoSub;
  }

  async loadControlSub(arrSub, stepCreate, stepTitleCreate) {
    let ArraySub = [];
    let Synchronized = arrSub.filter((wf) => wf.Waitting == true);
    let Asynchronous = arrSub.filter((wf) => wf.Waitting == false);
    let wfDepartment = await this.GetListDepartment();

    if (Synchronized.length > 0) {
      for (let index = 0; index < Synchronized.length; index++) {
        let subItemSync = returnObject(Synchronized[index]);

        let wfSubTable = await this.GetWFTable(subItemSync.WFTableId);
        // console.log(wfSubTable);
        if (isNotNull(wfSubTable)) {
          let typeSearch = wfSubTable.WhoIsUsed,
            listSearchSubUser = [];
          if (
            wfSubTable.WhoIsUsed == "Department" &&
            isNotNull(wfSubTable.Department)
          ) {
            let dept = wfDepartment.find(
              (dp) => dp.Code == wfSubTable.Department
            );
            if (isNotNull(dept)) {
              listSearchSubUser = returnArray(dept.UserMembers);
              if (isNotNull(dept.USerManager.UserId)) {
                listSearchSubUser.push(dept.USerManager);
              }
            }
          } else if (wfSubTable.WhoIsUsed == "Users") {
            wfSubTable.UserDefault.map((user) => {
              listSearchSubUser.push(user);
            });
          }

          Object.assign(subItemSync, {
            SubUserRequest: {
              UserId: "",
              UserTitle: "",
              UserEmail: "",
            },
            list_SubUserRequest: [],
            listSearch_SubUserRequest: listSearchSubUser,
            typeSearch: typeSearch,
          });
          if (CheckNullSetZero(stepCreate) !== 0) {
            Object.assign(subItemSync, {
              indexStep: stepCreate,
              StepTitle: stepTitleCreate,
            });
          }
          ArraySub.push(subItemSync);
        }
      }
    }

    for (let i = 0; i < Asynchronous.length; i++) {
      let subItemAsync = returnObject(Asynchronous[i]);

      let wfSubTable = await this.GetWFTable(subItemAsync.WFTableId);
      // console.log(wfSubTable);
      if (isNotNull(wfSubTable)) {
        let typeSearch = wfSubTable.WhoIsUsed,
          listSearchSubUser = [];
        if (
          wfSubTable.WhoIsUsed == "Department" &&
          isNotNull(wfSubTable.Department)
        ) {
          let dept = wfDepartment.find(
            (dp) => dp.Code == wfSubTable.Department
          );
          if (isNotNull(dept)) {
            listSearchSubUser = returnArray(dept.UserMembers);
            if (isNotNull(dept.USerManager.UserId)) {
              listSearchSubUser.push(dept.USerManager);
            }
          }
        } else if (wfSubTable.WhoIsUsed == "Users") {
          wfSubTable.UserDefault.map((user) => {
            listSearchSubUser.push(user);
          });
        }

        Object.assign(subItemAsync, {
          SubUserRequest: {
            UserId: "",
            UserTitle: "",
            UserEmail: "",
          },
          list_SubUserRequest: [],
          listSearch_SubUserRequest: listSearchSubUser,
          typeSearch: typeSearch,
        });
        if (CheckNullSetZero(stepCreate) !== 0) {
          Object.assign(subItemAsync, {
            indexStep: stepCreate,
            StepTitle: stepTitleCreate,
          });
        }
        ArraySub.push(subItemAsync);
      }
    }

    // console.log(ArraySub);
    return ArraySub;
  }

  async GetArrayWFTable(status) {
    let strFilter = `ID ne 0`;
    if (isNotNull(status)) {
      strFilter = `Status eq 1`;
    }
    let arrayWF = [];
    let itemWF = await sp.web.lists
      .getByTitle("WFTable")
      .items.select(
        "ID,Title,Code,Created,Status,WhoIsUsed,WIUGroup,WIUId,indexStep,SLA"
      )
      .filter(strFilter)
      .orderBy("ID", true)
      .top(100)
      .getPaged();
    itemWF["results"].forEach((itemDetail) => {
      let userDefault = [];
      if (isNotNull(itemDetail["WIUId"])) {
        userDefault = itemDetail["WIUId"];
      }
      arrayWF.push({
        WFId: itemDetail.ID,
        WFCode: CheckNull(itemDetail["Code"]),
        WFTitle: CheckNull(itemDetail["Title"]),
        Description: CheckNull(itemDetail["Description"]),
        WhoIsUsed: CheckNull(itemDetail["WhoIsUsed"]),
        Department: CheckNull(itemDetail["WIUGroup"]),
        UserDefault: userDefault,
        Status: CheckNull(itemDetail["Status"]),
        WFIndexStep:
          CheckNullSetZero(itemDetail["indexStep"]) > 0
            ? CheckNullSetZero(itemDetail["indexStep"])
            : 1,
        SLA: CheckNullSetZero(itemDetail["SLA"]),
      });
    });

    if (itemWF.hasNext) {
      let nextArray = await this.getNextWFTable(itemWF, []);
      // console.log(nextArray);
      arrayWF = arrayWF.concat(nextArray);
    }

    return arrayWF;
  }

  async getNextWFTable(itemWF, array) {
    let itemWFNext = await itemWF.getNext();
    itemWFNext["results"].forEach((element) => {
      let userDefault = [];
      if (isNotNull(itemDetail["WIUId"])) {
        userDefault = itemDetail["WIUId"];
      }
      array.push({
        ID: itemDetail.ID,
        Code: CheckNull(itemDetail["Code"]),
        Title: CheckNull(itemDetail["Title"]),
        Description: CheckNull(itemDetail["Description"]),
        WhoIsUsed: CheckNull(itemDetail["WhoIsUsed"]),
        Department: CheckNull(itemDetail["WIUGroup"]),
        UserDefault: userDefault,
        Status: CheckNull(itemDetail["Status"]),
        indexStep:
          CheckNullSetZero(itemDetail["indexStep"]) > 0
            ? CheckNullSetZero(itemDetail["indexStep"])
            : 1,
      });
    });
    if (itemWFNext.hasNext) {
      await this.getNexStepStep(itemWFNext, array);
    }

    return array;
  }

  async GetArrayWFStepTable(filterStr) {
    let strFilter = `ID ne 0`;
    if (isNotNull(filterStr)) {
      strFilter = filterStr;
    }
    const strSelect = `ID,Title,Code,WFTableId,indexStep,ClassifyStep,StepWFType,TypeofApprover,ApproveCode,RoleCode,ObjStepWFId,ObjBackStep,StepNextDefault,ObjStepCondition,ObjEmailCfg,SLA,ObjFieldStep,btnAction,GroupApprover,IsEditApprover,DepartmentCode,UserApprover/Title,UserApprover/Id,UserApprover/Name`;
    let items = [];
    let itemStep = await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(strSelect)
      .filter(strFilter)
      .expand("UserApprover")
      .top(100)
      .getPaged();
    // console.log(itemStep);
    itemStep["results"].forEach((itemDetail) => {
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

        let objStepCon = returnObject(ObjStepCondition);
        if (!isNotNull(objStepCon.ArrayStepCondition)) {
          ObjStepCondition = {
            IsActive: objStepCon.IsActive,
            ArrayStepCondition: [
              {
                Priority: 1,
                ConditionsCombined: "",
                TypeCondition: objStepCon.TypeCondition,
                ObjCondition: objStepCon.ObjCondition,
                StepNextCondition: objStepCon.StepNextCondition,
              },
            ],
          };
        }
      }
      let ObjFieldStep = {
        FieldInput: [],
        FieldView: [],
        isAttachments: false,
        isViewAttachments: false,
        isEditAttachments:false
      };
      if (isNotNull(itemDetail.ObjFieldStep)) {
        ObjFieldStep = JSON.parse(itemDetail.ObjFieldStep);
        if (ObjFieldStep.isViewAttachments == undefined) {
          Object.assign(ObjFieldStep, { isViewAttachments: false });
        }
        if (ObjFieldStep.isEditAttachments == undefined) {
          Object.assign(ObjFieldStep, { isEditAttachments: false });
        }
        if (
          ObjFieldStep.FieldInput.length > 0 &&
          ObjFieldStep.FieldInput[0].IsFirstColumn === undefined
        ) {
          let arrayFieldOld = returnArray(ObjFieldStep.FieldInput);
          let arrayFieldNew = [];
          arrayFieldOld.map((field, indexF) => {
            if (indexF % 2 == 0) {
              arrayFieldNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: true,
                OrderIndex: indexF,
              });
            } else {
              arrayFieldNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
              });
            }
          });
          ObjFieldStep.FieldInput = arrayFieldNew;
        }
        if (
          ObjFieldStep.FieldView.length > 0 &&
          ObjFieldStep.FieldView[0].IsFirstColumn === undefined
        ) {
          let arrayFieldViewOld = returnArray(ObjFieldStep.FieldView);
          let arrayFieldViewNew = [];
          arrayFieldViewOld.map((field, indexF) => {
            if (indexF % 2 == 0) {
              arrayFieldViewNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: true,
                OrderIndex: indexF,
              });
            } else {
              arrayFieldViewNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
              });
            }
          });
          ObjFieldStep.FieldView = arrayFieldViewNew;
        }
      }
      let GroupApprover = {
        TypeUserApproval: "",
        Group: { ID: "", Title: "" },
      };

      let ObjEmailCfg = "";
      if (isNotNull(itemDetail.ObjEmailCfg)) {
        ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);
      }
      let userApprover = {
        UserId: "",
        UserTitle: "",
        UserEmail: "",
      };
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
      }
      if (isNotNull(itemDetail.TypeofApprover)) {
        TypeofApprover = CheckNull(itemDetail.TypeofApprover);
      }
      if (isNotNull(itemDetail.ApproveCode)) {
        ApproveCode = CheckNull(itemDetail.ApproveCode);
      }
      if (isNotNull(itemDetail.RoleCode)) {
        RoleCode = CheckNull(itemDetail.RoleCode);
      }
      let DepartmentCode = "";
      if (isNotNull(itemDetail.DepartmentCode)) {
        DepartmentCode = CheckNull(itemDetail.DepartmentCode);
      }
      if (isNotNull(itemDetail.GroupApprover)) {
        GroupApprover = JSON.parse(itemDetail.GroupApprover);
      }
      let btnAction = "";
      if (isNotNull(itemDetail.btnAction)) {
        btnAction = JSON.parse(itemDetail.btnAction);
      }
      let ObjBackStep = "";
      if (isNotNull(itemDetail.ObjBackStep)) {
        ObjBackStep = JSON.parse(itemDetail.ObjBackStep);
      }
      items.push({
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
        SLA: CheckNullSetZero(itemDetail.SLA),
        ObjFieldStep: ObjFieldStep,
        btnAction: btnAction,
        TypeofApprover: TypeofApprover,
        ApproveCode: ApproveCode,
        RoleCode: RoleCode,
        DepartmentCode: DepartmentCode,
        UserApprover: userApprover,
        GroupApprover: GroupApprover,
        IsEditApprover: itemDetail.IsEditApprover,
        ObjBackStep: ObjBackStep,
        WFTableId: CheckNullSetZero(itemDetail.WFTableId),
      });
    });
    if (itemStep.hasNext) {
      let nextArray = await this.getNexWFStepTable(itemStep, []);
      items = items.concat(nextArray);
    }
    return items;
  }

  async getNexWFStepTable(itemStep, array) {
    let itemStepNext = await itemStep.getNext();
    itemStepNext["results"].forEach((itemDetail) => {
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

        let objStepCon = returnObject(ObjStepCondition);
        if (!isNotNull(objStepCon.ArrayStepCondition)) {
          ObjStepCondition = {
            IsActive: objStepCon.IsActive,
            ArrayStepCondition: [
              {
                Priority: 1,
                ConditionsCombined: "",
                TypeCondition: objStepCon.TypeCondition,
                ObjCondition: objStepCon.ObjCondition,
                StepNextCondition: objStepCon.StepNextCondition,
              },
            ],
          };
        }
      }
      let ObjFieldStep = {
        FieldInput: [],
        FieldView: [],
        isAttachments: false,
        isViewAttachments: false,
        isEditAttachments:false
      };
      if (isNotNull(itemDetail.ObjFieldStep)) {
        ObjFieldStep = JSON.parse(itemDetail.ObjFieldStep);
        if (ObjFieldStep.isViewAttachments == undefined) {
          Object.assign(ObjFieldStep, { isViewAttachments: false });
        }
        if (ObjFieldStep.isEditAttachments == undefined) {
          Object.assign(ObjFieldStep, { isEditAttachments: false });
        }
        if (
          ObjFieldStep.FieldInput.length > 0 &&
          ObjFieldStep.FieldInput[0].IsFirstColumn === undefined
        ) {
          let arrayFieldOld = returnArray(ObjFieldStep.FieldInput);
          let arrayFieldNew = [];
          arrayFieldOld.map((field, indexF) => {
            if (indexF % 2 == 0) {
              arrayFieldNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: true,
              });
            } else {
              arrayFieldNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
              });
            }
          });
          ObjFieldStep.FieldInput = arrayFieldNew;
        }
        if (
          ObjFieldStep.FieldView.length > 0 &&
          ObjFieldStep.FieldView[0].IsFirstColumn === undefined
        ) {
          let arrayFieldViewOld = returnArray(ObjFieldStep.FieldView);
          let arrayFieldViewNew = [];
          arrayFieldViewOld.map((field, indexF) => {
            if (indexF % 2 == 0) {
              arrayFieldViewNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: true,
                OrderIndex: indexF,
              });
            } else {
              arrayFieldViewNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
              });
            }
          });
          ObjFieldStep.FieldView = arrayFieldViewNew;
        }
      }
      let GroupApprover = {
        TypeUserApproval: "",
        Group: { ID: "", Title: "" },
      };

      let ObjEmailCfg = "";
      if (isNotNull(itemDetail.ObjEmailCfg)) {
        ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);
      }
      let userApprover = {
        UserId: "",
        UserTitle: "",
        UserEmail: "",
      };
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
      }
      if (isNotNull(itemDetail.TypeofApprover)) {
        TypeofApprover = CheckNull(itemDetail.TypeofApprover);
      }
      if (isNotNull(itemDetail.ApproveCode)) {
        ApproveCode = CheckNull(itemDetail.ApproveCode);
      }
      if (isNotNull(itemDetail.RoleCode)) {
        RoleCode = CheckNull(itemDetail.RoleCode);
      }
      if (isNotNull(itemDetail.GroupApprover)) {
        GroupApprover = JSON.parse(itemDetail.GroupApprover);
      }
      let btnAction = "";
      if (isNotNull(itemDetail.btnAction)) {
        btnAction = JSON.parse(itemDetail.btnAction);
      }
      let ObjBackStep = "";
      if (isNotNull(itemDetail.ObjBackStep)) {
        ObjBackStep = JSON.parse(itemDetail.ObjBackStep);
      }
      array.push({
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
        SLA: CheckNullSetZero(itemDetail.SLA),
        ObjFieldStep: ObjFieldStep,
        btnAction: btnAction,
        TypeofApprover: TypeofApprover,
        ApproveCode: ApproveCode,
        RoleCode: RoleCode,
        UserApprover: userApprover,
        GroupApprover: GroupApprover,
        IsEditApprover: itemDetail.IsEditApprover,
        ObjBackStep: ObjBackStep,
        WFTableId: CheckNullSetZero(itemDetail.WFTableId),
      });
    });
    if (itemStepNext.hasNext) {
      await this.getNexWFStepTable(itemStepNext, array);
    }

    return array;
  }

  async GetWFTemplateEmail(type) {
    let infoEmail = "";
    const strSelect = `ID,Title,SubjectEmail,BodyEmail,FieldReplateText,TypeTemplate`;
    const strFilter = `TypeTemplate eq ` + type;
    // console.log(info)
    await sp.web.lists
      .getByTitle("WFTemplateEmail")
      .items.select(strSelect)
      .filter(strFilter)
      .orderBy("ID", false)
      .get()
      .then((item) => {
        if (item.length > 0) {
          infoEmail = {
            ID: item[0].ID,
            Title: CheckNull(item[0].Title),
            SubjectEmail: CheckNull(item[0].SubjectEmail),
            BodyEmail: CheckNull(item[0].BodyEmail),
            FieldReplateText: CheckNull(item[0].FieldReplateText),
            TypeTemplate: CheckNull(item[0].TypeTemplate),
          };
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return infoEmail;
  }

  async GetInfoMapEmployee(UserId, txtFilter) {
    let listEm = [];
    const strSelect = `ID,Title,User/Id,User/Title,User/Name,ApproveCode,RoleCode,DeptCode,LeaderId`;
    let strFilter = `User/Id eq ` + UserId + ` and RoleCode ne null`;
    if (isNotNull(txtFilter)) {
      strFilter = txtFilter;
    }
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

  async GetArrayPermissonByRole(strFilter) {
    let listPermisson = [];
    const strSelect = `ID,Title,RoleCode,PriorityPoint,Submit,View,Approve,ReAssigment,Reject,Save,MoveTo,InformTo`;
    await sp.web.lists
      .getByTitle("ListPermissonByRole")
      .items.select(strSelect)
      .filter(strFilter)
      .get()
      .then((permissions) => {
        permissions.forEach((element) => {
          listPermisson.push({
            ID: element.ID,
            Title: CheckNull(element.Title),
            RoleCode: CheckNull(element.RoleCode),
            PriorityPoint: CheckNullSetZero(element.PriorityPoint),
            Submit: element.Submit,
            Save: element.Save,
            Approve: element.Approve,
            ReAssigment: element.ReAssigment,
            View: element.View,
            Reject: element.Reject,
            MoveTo: element.MoveTo,
            InformTo: element.InformTo,
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return listPermisson;
  }

  async GetPermissonByRole(currentUser) {
    let permissionOfUser = {
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
    let arrayRoleOfUser = await this.GetInfoMapEmployee(currentUser.Id, "");
    let strFilterPermiss = "";
    arrayRoleOfUser.map((roles) => {
      let arrayRole = roles.RoleCode.split(",");
      arrayRole.map((role) => {
        if (isNotNull(strFilterPermiss)) {
          strFilterPermiss += ` or RoleCode eq '` + role + `'`;
        } else {
          strFilterPermiss = `RoleCode eq '` + role + `'`;
        }
      });
    });
    if (arrayRoleOfUser.length > 0 && isNotNull(strFilterPermiss)) {
      let arrayPermissonOfRole = await this.GetArrayPermissonByRole(
        strFilterPermiss
      );
      if (arrayPermissonOfRole.length > 0) {
        arrayPermissonOfRole.sort(function (a, b) {
          return parseInt(b.PriorityPoint) - parseInt(a.PriorityPoint);
        });
        permissionOfUser = arrayPermissonOfRole[0];
      }
    }
    return permissionOfUser;
  }

  // lấy người phê duyệt tại bước tiếp theo
  async checkGetMapUserNextStep(
    indexStep,
    wfStepTable,
    wfStepFieldInput,
    detailInput,
    detailItem,
    currentUserId,
    WFIndexStep
  ) {
    let checkUser = {
      UserApprovalNextStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listUserApprovalNextStep: [],
      isApproveNextStep: false,
      NameGroup: "",
      IsEditApproval: false,
      TypeUserApproval: "",
    };
    let nextStep = checkConditionNextStep(
      indexStep,
      wfStepTable,
      wfStepFieldInput,
      detailInput,
      detailItem
    );
    checkUser = await this.GetMapUserApproverNextStep(
      nextStep,
      wfStepTable,
      detailItem,
      currentUserId,
      WFIndexStep
    );

    // console.log(checkUser);
    return checkUser;
  }

  async GetMapUserApproverNextStep(
    nextStep,
    wfStepTable,
    detailItem,
    currentUserId,
    WFIndexStep
  ) {
    let checkUser = {
      UserApprovalNextStep: { UserId: "", UserTitle: "", UserEmail: "" },
      listUserApprovalNextStep: [],
      isApproveNextStep: false,
      NameGroup: "",
      IsEditApproval: false,
      TypeUserApproval: "",
    };

    if (nextStep == WFIndexStep && detailItem.UserRequest != undefined) {
      checkUser.UserApprovalNextStep = detailItem.UserRequest;
      checkUser.listUserApprovalNextStep = [detailItem.UserRequest];
      return checkUser;
    }

    const stepNext = wfStepTable.find((x) => x.indexStep == nextStep);
    if (isNotNull(stepNext)) {
      // console.log(stepNext.TypeofApprover);
      checkUser.isApproveNextStep = true;

      if (stepNext.TypeofApprover == "Người phê duyệt") {
        checkUser.IsEditApproval = stepNext.IsEditApprover;
        if (stepNext.GroupApprover.TypeUserApproval == "Một người phê duyệt") {
          checkUser.UserApprovalNextStep = stepNext.UserApprover;
          checkUser.listUserApprovalNextStep = [stepNext.UserApprover];
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

          checkUser.listUserApprovalNextStep = returnArray(listUserApproval);
          if (listUserApproval.length == 1) {
            checkUser.UserApprovalNextStep = listUserApproval[0];
          }
        }
      } else if (stepNext.TypeofApprover == "Mã và vai trò phê duyệt") {
        let filterDept = `User/Id eq ` + currentUserId;
        let listDeptApprovalAndRole = [];
        listDeptApprovalAndRole = await this.GetInfoMapEmployee("", filterDept);

        if (listDeptApprovalAndRole.length > 0) {
          let filterApprovalAndRole =
            `( DeptCode eq '` +
            listDeptApprovalAndRole[0].DeptCode +
            `' and substringof('` +
            stepNext.RoleCode +
            `', RoleCode) and substringof('` +
            stepNext.ApproveCode +
            `', ApproveCode) )`;
          for (let iDept = 1; iDept < listDeptApprovalAndRole.length; iDept++) {
            filterApprovalAndRole +=
              ` or ( DeptCode eq '` +
              listDeptApprovalAndRole[iDept].DeptCode +
              `' and substringof('` +
              stepNext.RoleCode +
              `', RoleCode) and substringof('` +
              stepNext.ApproveCode +
              `', ApproveCode) )`;
          }
          let listAllMapUser = await this.GetInfoMapEmployee(
            "",
            filterApprovalAndRole
          );
          // console.log(listAllMapUser);
          let listMapUser = Array.from(listAllMapUser, ({ User }) => User);

          checkUser.listUserApprovalNextStep = returnArray(listMapUser);
          if (listMapUser.length == 1) {
            checkUser.UserApprovalNextStep = listMapUser[0];
          }
        }
      } else if (stepNext.TypeofApprover == "Phòng ban và mã vai trò") {
        let listDeptAndRole = [];
        if (!isNotNull(stepNext.DepartmentCode)) {
          let filterDept = `User/Id eq ` + currentUserId;
          let listDept = await this.GetInfoMapEmployee("", filterDept);
          listDeptAndRole = Array.from(listDept, ({ DeptCode }) => DeptCode);
        } else {
          listDeptAndRole = [stepNext.DepartmentCode];
        }

        let filterDeptAndRole =
          `( DeptCode eq '` +
          listDeptAndRole[0] +
          `' and substringof('` +
          stepNext.RoleCode +
          `', RoleCode) )`;
        for (let iDept = 1; iDept < listDeptAndRole.length; iDept++) {
          filterDeptAndRole +=
            ` or ( DeptCode eq '` +
            listDeptAndRole[iDept] +
            `' and substringof('` +
            stepNext.RoleCode +
            `', RoleCode) )`;
        }

        let listAllMapUserRole = await this.GetInfoMapEmployee(
          "",
          filterDeptAndRole
        );
        // console.log(listAllMapUserRole);
        let listMapUserRole = Array.from(
          listAllMapUserRole,
          ({ User }) => User
        );

        checkUser.listUserApprovalNextStep = returnArray(listMapUserRole);
        if (listMapUserRole.length == 1) {
          checkUser.UserApprovalNextStep = listMapUserRole[0];
        }
      } else {
        let listDeptAndApproval = [];
        if (!isNotNull(stepNext.DepartmentCode)) {
          let filterDept = `User/Id eq ` + currentUserId;
          let listDept = await this.GetInfoMapEmployee("", filterDept);
          listDeptAndApproval = Array.from(
            listDept,
            ({ DeptCode }) => DeptCode
          );
        } else {
          listDeptAndApproval = [stepNext.DepartmentCode];
        }

        let filterDeptAndApproval =
          `( DeptCode eq '` +
          listDeptAndApproval[0] +
          `' and substringof('` +
          stepNext.ApproveCode +
          `', ApproveCode) )`;
        for (let iDept = 1; iDept < listDeptAndApproval.length; iDept++) {
          filterDeptAndApproval +=
            ` or ( DeptCode eq '` +
            listDeptAndApproval[iDept] +
            `' and substringof('` +
            stepNext.ApproveCode +
            `', ApproveCode) )`;
        }

        let listAllMapUserApproval = await this.GetInfoMapEmployee(
          "",
          filterDeptAndApproval
        );
        let listMapUserApproval = Array.from(
          listAllMapUserApproval,
          ({ User }) => User
        );

        checkUser.listUserApprovalNextStep = returnArray(listMapUserApproval);
        if (listMapUserApproval.length == 1) {
          checkUser.UserApprovalNextStep = listMapUserApproval[0];
        }
      }
    }
    // console.log(checkUser);
    return checkUser;
  }

  async GetArrayConfigStepLine(
    indexStep,
    wfStepTable,
    wfStepFieldInput,
    detailInput,
    detailItem,
    currentUser,
    WFIndexStep,
    HistoryStep
  ) {
    let ArrayStepLine = [];
    let userApprovalNext = "";
    if (HistoryStep.length > 0) {
      let indexStepOld = "";
      for (let i = 0; i < HistoryStep.length; i++) {
        const index = ArrayStepLine.findIndex(
          (st) => st.indexStep == HistoryStep[i].indexStep
        );

        let statusStep = formatStatusTextLine(HistoryStep[i].StatusStep);
        let labelStep = formatStatusLabel(HistoryStep[i].StatusStep);
        if (detailItem.StatusStep == 1 && i == HistoryStep.length - 1) {
          statusStep = formatStatusTextLine(1);
          labelStep = formatStatusLabel(1);
        }
        let slaStep = 0;
        if (i > 0) {
          if (isNotNull(HistoryStep[i].SLA)) {
            slaStep = CheckNullSetZero(HistoryStep[i].SLA);
          } else {
            let wfStep = wfStepTable.find(
              (wfS) => wfS.indexStep == HistoryStep[i].indexStep
            );
            if (isNotNull(wfStep)) {
              slaStep = CheckNullSetZero(wfStep.SLA);
            }
          }
        }

        if (index != -1) {
          if (indexStepOld == HistoryStep[i].indexStep) {
            ArrayStepLine[index] = {
              TitleStep: HistoryStep[i].TitleStep,
              UserStep: HistoryStep[i].UserApproval.UserTitle,
              indexStep: HistoryStep[i].indexStep,
              StatusStep: statusStep,
              LabelStep: labelStep,
              SLAStep: slaStep,
            };
          } else {
            ArrayStepLine.push({
              TitleStep: HistoryStep[i].TitleStep,
              UserStep: HistoryStep[i].UserApproval.UserTitle,
              indexStep: HistoryStep[i].indexStep,
              StatusStep: statusStep,
              LabelStep: labelStep,
              SLAStep: slaStep,
            });
          }
        } else {
          ArrayStepLine.push({
            TitleStep: HistoryStep[i].TitleStep,
            UserStep: HistoryStep[i].UserApproval.UserTitle,
            indexStep: HistoryStep[i].indexStep,
            StatusStep: statusStep,
            LabelStep: labelStep,
            SLAStep: slaStep,
          });
        }
        indexStepOld = HistoryStep[i].indexStep;
      }
      userApprovalNext =
        HistoryStep[HistoryStep.length - 1].UserApproval.UserId;
    } else {
      let stepIndex = wfStepTable.find((x) => x.indexStep == indexStep);
      if (isNotNull(stepIndex)) {
        ArrayStepLine.push({
          TitleStep: stepIndex.Title,
          UserStep: isNotNull(detailItem.UserRequest)
            ? CheckNull(detailItem.UserRequest.UserTitle)
            : currentUser.Title,
          indexStep: indexStep,
          StatusStep: formatStatusTextLine(0),
          LabelStep: formatStatusLabel(0),
          SLAStep: CheckNullSetZero(stepIndex.SLA),
        });
      }
    }

    if (detailItem.StatusStep != 1 && detailItem.StatusStep != 2) {
      const configStep = await this.GetConfigStepLine(
        indexStep,
        wfStepTable,
        wfStepFieldInput,
        detailInput,
        detailItem,
        currentUser.Id,
        userApprovalNext,
        WFIndexStep,
        []
      );
      for (let index = 0; index < configStep.length; index++) {
        ArrayStepLine.push(configStep[index]);
      }
    }

    return ArrayStepLine;
  }

  async GetConfigStepLine(
    indexStep,
    wfStepTable,
    wfStepFieldInput,
    detailInput,
    detailItem,
    currentUserId,
    UserApprovalId,
    WFIndexStep,
    arrNewStep
  ) {
    let UserApproalNext = "";
    let indexStepNext = checkConditionNextStep(
      indexStep,
      wfStepTable,
      wfStepFieldInput,
      detailInput,
      detailItem
    );
    let stepNext = wfStepTable.find((x) => x.indexStep == indexStepNext);

    if (isNotNull(stepNext)) {
      let usetCheck = isNotNull(UserApprovalId)
        ? UserApprovalId
        : currentUserId;
      let checkMapUser = await this.GetMapUserApproverNextStep(
        stepNext.indexStep,
        wfStepTable,
        detailItem,
        usetCheck,
        WFIndexStep
      );
      let userApp = "";
      if (checkMapUser.listUserApprovalNextStep.length > 0) {
        if (checkMapUser.TypeUserApproval == "Nhóm người phê duyệt") {
          userApp += checkMapUser.NameGroup;
        } else {
          checkMapUser.listUserApprovalNextStep.map((user) => {
            userApp += user.UserTitle + ", ";
          });
        }
        UserApproalNext = checkMapUser.listUserApprovalNextStep[0].UserId;
      }

      arrNewStep.push({
        TitleStep: stepNext.Title,
        UserStep: userApp,
        indexStep: stepNext.indexStep,
        StatusStep: "",
        LabelStep: `label_None`,
        SLAStep: CheckNullSetZero(stepNext.SLA),
      });
      await this.GetConfigStepLine(
        stepNext.indexStep,
        wfStepTable,
        wfStepFieldInput,
        detailInput,
        detailItem,
        currentUserId,
        UserApproalNext,
        WFIndexStep,
        arrNewStep
      );
    }
    return arrNewStep;
  }

  async loadInfoSub(arrSub) {
    let arrInfo = [];
    for (let i = 0; i < arrSub.length; i++) {
      let stepSub = await this.GetWFStepTable(arrSub[i].wfTable.WFId);

      await sp.web.lists
        .getByTitle(arrSub[i].wfTable.WFCode)
        .items.getById(arrSub[i].ItemIndex)
        .select(
          `ID,Title,indexStep,StatusStep,UserRequest/Id,UserRequest/Title,UserRequest/Name,ObjParentWF,HistoryStep`
        )
        .expand(`UserRequest`)
        .get()
        .then((listWF) => {
          if (isNotNull(listWF)) {
            let StatusRequest = 0;
            if (
              CheckNullSetZero(listWF["indexStep"]) ==
                arrSub[i].wfTable.WFIndexStep &&
              CheckNullSetZero(listWF["StatusStep"]) == 0
            ) {
              StatusRequest = -1;
            } else {
              StatusRequest = CheckNullSetZero(listWF["StatusStep"]);
            }
            let userRequest = {
              UserId: "",
              UserTitle: "",
              UserEmail: "",
            };
            if (isNotNull(listWF["UserRequest"])) {
              userRequest = {
                UserId: listWF["UserRequest"].Id,
                UserTitle: listWF["UserRequest"].Title,
                UserEmail: CheckNull(listWF["UserRequest"].Name.split("|")[2]),
              };
            }
            let objParentWF = "";
            if (isNotNull(listWF["ObjParentWF"])) {
              objParentWF = JSON.parse(listWF["ObjParentWF"]);
            }
            let historyStep = [];
            if (isNotNull(listWF["HistoryStep"])) {
              historyStep = JSON.parse(listWF["HistoryStep"]);
            }

            let inforSub = {
              WFId: arrSub[i].wfTable.WFId,
              WFCode: arrSub[i].wfTable.WFCode,
              WFTitle: arrSub[i].wfTable.WFTitle,
              ItemIndex: arrSub[i].ItemIndex,
              Title: CheckNull(listWF["Title"]),
              indexStep: CheckNullSetZero(listWF["indexStep"]),
              StatusStep: CheckNullSetZero(listWF["StatusStep"]),
              StatusRequest: StatusRequest,
              wfStepTable: stepSub,
              UserRequest: userRequest,
              isWaitting: arrSub[i].isWaitting,
              ObjParentWF: objParentWF,
              HistoryStep: historyStep,
            };
            arrInfo.push(inforSub);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // console.log(arrInfo);
    return arrInfo;
  }

  async checkFinishSubProcess(ObjSubWF, isSub, ItemIndex, WFCode) {
    let finishCheck = true;
    let objCheckFinish = {
      isParentFinish: true,
      ObjParentWF: "",
    };
    let otherSub = [];
    if (isSub) {
      otherSub = ObjSubWF.filter(
        (sub) =>
          sub.isWaitting == true &&
          (sub.ItemIndex != ItemIndex || sub.wfTable.WFCode != WFCode)
      );
    } else {
      otherSub = ObjSubWF.filter((sub) => sub.isWaitting == true);
    }
    // console.log(otherSub);
    if (otherSub.length > 0) {
      let arrayInfoOtherSub = await this.loadInfoSub(otherSub);
      for (let i = 0; i < arrayInfoOtherSub.length; i++) {
        if (
          arrayInfoOtherSub[i].StatusStep != 1 &&
          arrayInfoOtherSub[i].StatusStep != 2
        ) {
          // finishCheck = false;
          objCheckFinish = {
            isParentFinish: false,
            ObjParentWF: arrayInfoOtherSub[i].ObjParentWF,
          };
          break;
        }
      }
    }
    return objCheckFinish;
  }

  async GetFieldSumUpdate(
    WFTable,
    ItemIndex,
    wfTableParentId,
    createStep,
    dataSubInput,
    dataSubView,
    ObjSubWF,
    AlowDataTransfer,
    CorrespondingFields,
    isWaitting
  ) {
    let FormFieldParentUpdate = [];

    if (AlowDataTransfer) {
      for (let i = 0; i < CorrespondingFields.length; i++) {
        let InternalNameSub = CorrespondingFields[i].FieldSub.InternalName;
        let InternalNameParent =
          CorrespondingFields[i].FieldParent.InternalName;
        let FieldTypeSub = CorrespondingFields[i].FieldSub.FieldType;

        let dataTransfer = CorrespondingFields[i].DataTransfer;
        if (
          dataTransfer == objDataTransfer.DataReceived ||
          dataTransfer == objDataTransfer.DataSynchronized
        ) {
          let objFieldUpdate = checkUpdateData(
            InternalNameSub,
            InternalNameParent,
            FieldTypeSub,
            dataSubInput,
            dataSubView
          );
          if (objFieldUpdate.isAdd) {
            FormFieldParentUpdate.push({
              InternalName: objFieldUpdate.InternalName,
              dataInternalName: objFieldUpdate.dataInternalName,
            });
          }
        }
      }
    }

    if (!isWaitting) {
      let FieldCheckParentUpdate = [];
      let strSelectSub = [];
      let arrFormFieldParent = await this.GetWFFormField(wfTableParentId);
      arrFormFieldParent.map((fields) => {
        if (
          (fields.FieldType == objField.Sum ||
            fields.FieldType == objField.Average ||
            fields.FieldType == objField.Percent) &&
          isNotNull(fields.ObjSPField.ObjField.ChoiceField) &&
          fields.ObjSPField.ObjField.ChoiceField.length > 0 &&
          fields.ObjSPField.ObjField.ChoiceField[0].WFTableId == WFTable.WFId
          // && fields.ObjSPField.ObjField.ChoiceField[0].indexStep == createStep
        ) {
          FieldCheckParentUpdate.push(fields);
          let fieldfieldGetSub =
            fields.ObjSPField.ObjField.ChoiceField[0].InternalName;
          if (strSelectSub.indexOf(fieldfieldGetSub) == -1) {
            strSelectSub.push(fieldfieldGetSub);
          }
        }
      });
      if (FieldCheckParentUpdate.length > 0) {
        for (
          let inField = 0;
          inField < FieldCheckParentUpdate.length;
          inField++
        ) {
          let updateField = returnObject(FieldCheckParentUpdate[inField]);
          let fieldSubUpdateSum =
            updateField.ObjSPField.ObjField.ChoiceField[0].InternalName;
          let percentMock =
            updateField.ObjSPField.ObjField.ChoiceField[0].PercentValue;
          let indexStepSum =
            updateField.ObjSPField.ObjField.ChoiceField[0].indexStep;
          let otherItemSub = [];
          let checkITS = false;
          if (!isNotNull(indexStepSum)) {
            otherItemSub = ObjSubWF.filter(
              (oths) =>
                oths.isWaitting == false &&
                oths.wfTable.WFId == WFTable.WFId &&
                oths.ItemIndex != ItemIndex
            );
            checkITS = true;
          } else if (indexStepSum == createStep) {
            otherItemSub = ObjSubWF.filter(
              (oths) =>
                oths.isWaitting == false &&
                oths.wfTable.WFId == WFTable.WFId &&
                oths.ItemIndex != ItemIndex &&
                oths.indexStep == createStep
            );
            checkITS = true;
          }
          let lengthItemSub = otherItemSub.length;

          if (otherItemSub.length > 0 || checkITS) {
            let ArrayDetailSub = [];
            for (let inSub = 0; inSub < otherItemSub.length; inSub++) {
              let objSubItem = returnObject(otherItemSub[inSub]);
              let detailSub = await this.GetItemDetailByID(
                objSubItem.wfTable.WFCode,
                objSubItem.ItemIndex,
                strSelectSub
              );
              if (detailSub.StatusStep == 1) {
                ArrayDetailSub.push(detailSub);
              }
            }
            let totalFieldSubOld = 0;
            ArrayDetailSub.map((itemFieldSub) => {
              if (isNotNull(itemFieldSub[fieldSubUpdateSum])) {
                totalFieldSubOld =
                  totalFieldSubOld +
                  CheckNullSetZero(itemFieldSub[fieldSubUpdateSum]);
              }
            });
            let objFieldUpdateSum1 = checkUpdateData(
              fieldSubUpdateSum,
              updateField.InternalName,
              objField.Number,
              dataSubInput,
              dataSubView
            );
            if (objFieldUpdateSum1.isAdd) {
              let dataFieldSub =
                CheckNullSetZero(objFieldUpdateSum1.dataInternalName) +
                totalFieldSubOld;
              if (updateField.FieldType == objField.Average) {
                dataFieldSub = dataFieldSub / (lengthItemSub + 1);
              }
              if (
                updateField.FieldType == objField.Percent &&
                CheckNullSetZero(percentMock) > 0
              ) {
                dataFieldSub = (dataFieldSub / percentMock) * 100;
              }
              FormFieldParentUpdate.push({
                InternalName: objFieldUpdateSum1.InternalName,
                dataInternalName: dataFieldSub,
              });
            }
          }
        }
      }
    }

    return FormFieldParentUpdate;
  }
  async AddMenu(data){
    await sp.web.lists.getByTitle("ListMenu").items.add(data);
  }
}

const shareService = new UserStore();
Object.freeze(shareService);

export default shareService;
