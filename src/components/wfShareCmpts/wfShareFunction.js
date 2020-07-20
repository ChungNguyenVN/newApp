import * as moment from "moment";
import {
  objField,
  typeCalculation,
  typeCompare,
  arrayObjField,
  arrayTypeCalculation,
  arrayTypeCompare,
  arrayTimeInWorks,
  objDayWeekend,
} from "./wfShareModel";
import { config } from "./../../pages/environment.js";

function isNotNull(str) {
  return str !== null && str !== undefined && str !== "";
}

function CheckNull(str) {
  if (!isNotNull(str)) {
    return "";
  } else {
    return str;
  }
}

function CheckNullSetZero(str) {
  try {
    if (!isNotNull(str)) {
      return 0;
    } else if (isNaN(str)) {
      return 0;
    } else {
      return Number(str);
    }
  } catch (e) {
    return 0;
  }
}

function getQueryParams(qs) {
  qs = qs.split("+").join(" ");

  let params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while ((tokens = re.exec(qs))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}

function CalculateDate(dateStart, dateEnd) {
  try {
    let output = "";
    let startDate = moment(moment(dateStart).startOf("day").toDate()); // $('[name="date-start"]').val() === "13.04.2016"
    let endDate = moment(moment(dateEnd).startOf("day").toDate()); // $('[name="date-end"]').val() === "28.04.2016"

    output = endDate.diff(startDate, "days");

    return output;
  } catch (error) {
    console.log(error);
    return "";
  }
}

function CalculateNumber(numStart, numEnd, calculation) {
  try {
    let output = "";
    switch (calculation) {
      case typeCalculation.Addition:
        output = CheckNullSetZero(numEnd) + CheckNullSetZero(numStart);
        break;
      case typeCalculation.Subtraction:
        output = CheckNullSetZero(numEnd) - CheckNullSetZero(numStart);
        break;
      case typeCalculation.Multiplication:
        output = CheckNullSetZero(numEnd) * CheckNullSetZero(numStart);
        break;
      case typeCalculation.Division:
        output = CheckNullSetZero(numEnd) / CheckNullSetZero(numStart);
        break;
      default:
        output = "";
        break;
    }
    return output;
  } catch (error) {
    console.log(error);
    return "";
  }
}

function CompareDate(Field, FieldCompare, comparison) {
  if (
    !isNotNull(Field) &&
    isNotNull(FieldCompare) &&
    comparison == typeCompare.Ne
  ) {
    return true;
  }
  if (!isNotNull(Field) && isNotNull(FieldCompare)) {
    return false;
  }
  Field = moment(Field).startOf("day").toDate().getTime();
  FieldCompare = moment(FieldCompare).startOf("day").toDate().getTime();
  // FieldCompare = new Date(FieldCompare)
  try {
    let output = false;
    switch (comparison) {
      case typeCompare.Eq:
        if (Field == FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Gt:
        if (Field > FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Lt:
        if (Field < FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Ge:
        if (Field >= FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Le:
        if (Field <= FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Ne:
        if (Field != FieldCompare) {
          output = true;
        }
        break;
      default:
        output = false;
        break;
    }
    return output;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function CompareNumber(Field, FieldCompare, comparison) {
  try {
    let output = false;
    if (
      !isNotNull(Field) &&
      isNotNull(FieldCompare) &&
      comparison == typeCompare.Ne
    ) {
      return true;
    }
    if (!isNotNull(Field) && isNotNull(FieldCompare)) {
      return false;
    }
    // if (
    //   !isNotNull(Field) &&
    //   isNotNull(FieldCompare) &&
    //   comparison == typeCompare.Eq
    // ) {
    //   return false;
    // }
    switch (comparison) {
      case typeCompare.Eq:
        if (CheckNullSetZero(Field) == CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Ne:
        if (CheckNullSetZero(Field) != CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Gt:
        if (CheckNullSetZero(Field) > CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Lt:
        if (CheckNullSetZero(Field) < CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Ge:
        if (CheckNullSetZero(Field) >= CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Le:
        if (CheckNullSetZero(Field) <= CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      default:
        output = false;
        break;
    }
    return output;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function CompareText(Field, FieldCompare, comparison) {
  try {
    let output = false;
    if (
      comparison == typeCompare.Eq &&
      CheckNull(Field) == CheckNull(FieldCompare)
    ) {
      output = true;
    }
    if (
      comparison == typeCompare.Ne &&
      CheckNull(Field) != CheckNull(FieldCompare)
    ) {
      output = true;
    }
    return output;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function ISODateString(d) {
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  return (
    d.getUTCFullYear() +
    "-" +
    pad(d.getUTCMonth() + 1) +
    "-" +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    ":" +
    pad(d.getUTCMinutes()) +
    ":" +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function formatDate(params) {
  let date = "";
  if (isNotNull(params)) {
    date = CheckNull(moment(params).format("DD/MM/YYYY"));
  }
  return date;
}

function formatStatusText(status) {
  let active = "Đang xử lý";
  switch (status) {
    case 0:
      active = "Đang xử lý";
      break;
    case 1:
      active = "Hoàn thành";
      break;
    case 2:
      active = "Từ chối";
      break;
    case 3:
      active = "Yêu cầu chỉnh sửa";
      break;
    case -1:
      active = "Đã lưu";
      break;
    default:
      active = "Đang xử lý";
      break;
  }
  return active;
}

function formatStatusLabel(status) {
  let active = `labelAlert label_warning`;
  switch (status) {
    case 0:
      active = `labelAlert label_warning`;
      break;
    case 1:
      active = `labelAlert label_success`;
      break;
    case 2:
      active = `labelAlert label_danger`;
      break;
    case -1:
      active = `labelAlert label_save`;
      break;
    case 3:
      active = `labelAlert label_save`;
      break;
    default:
      active = `labelAlert label_warning`;
      break;
  }
  return active;
}

function formatStatusTextLine(status) {
  let active = "Chờ xử lý";
  switch (status) {
    case 0:
      active = "Chờ xử lý";
      break;
    case 1:
      active = "Hoàn thành";
      break;
    case 2:
      active = "Từ chối";
      break;
    case -1:
      active = "Đã lưu";
      break;
    case 3:
      active = "Đã chuyển bước";
      break;
    default:
      active = "Chờ xử lý";
      break;
  }
  return active;
}

function getFileBuffer(file) {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  return reader;
}

function formatTypeObjField(typeField) {
  let type = typeField;
  const objfield = arrayObjField.find((f) => f.Type == typeField);
  if (isNotNull(objfield)) {
    type = objfield.Title;
  }
  return type;
}

function formatTypeCompare(typeCompare) {
  let type = typeCompare;
  const objcompare = arrayTypeCompare.find((f) => f.Type == typeCompare);
  if (isNotNull(objcompare)) {
    type = objcompare.Title;
  }
  return type;
}

function formatTypeCalculation(typeCalculation) {
  let type = typeCalculation;
  const objcalculation = arrayTypeCalculation.find(
    (f) => f.Type == typeCalculation
  );
  if (isNotNull(objcalculation)) {
    type = objcalculation.Title;
  }
  return type;
}

function ReplaceFieldMail(objEmail, emailTemplate) {
  Object.keys(objEmail).forEach((element) => {
    emailTemplate = emailTemplate.replace(
      "{" + element + "}",
      objEmail[element]
    );
  });
  return emailTemplate;
}

function checkLicense(license) {
  if (!license.isLimited) {
    return true;
  }
  if (license.isLimited) {
    const expirationDate = moment(license.today).add(license.numberDay, "days");
    if (expirationDate.endOf("days").toDate() >= new Date()) {
      return true;
    }
  }
  return false;
}

function returnArray(arrayOld) {
  try {
    const arrayNew = [];
    arrayOld.map((item) => {
      arrayNew.push(item);
    });
    return arrayNew;
  } catch (error) {
    console.log(error);
    return [];
  }
}

function returnObject(objOld) {
  try {
    let objNew = Object.assign({}, objOld);
    return objNew;
  } catch (error) {
    console.log(error);
    return objOld;
  }
}

function FindTitleById(ArrDept, ArrFieldCompare, FieldCompare, FieldOut) {
  let value = FieldCompare;
  if (ArrDept.length > 0) {
    let Out = ArrDept.find((x) => x[ArrFieldCompare] == FieldCompare);
    // console.log(Out);
    if (isNotNull(Out)) {
      value = Out[FieldOut];
    }
  }
  // console.log(value);
  return value;
}

function isValidURL(string) {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

function checkFieldStepConditionOld(step, FieldCheck, wfStepTable) {
  let isCheckField = false;
  const detailStep = wfStepTable.find((x) => x.indexStep == step);
  if (detailStep && detailStep.ObjStepCondition.IsActive) {
    let arrayField = detailStep.ObjStepCondition.ObjCondition;

    if (detailStep.ObjStepCondition.TypeCondition == "Compare") {
      if (
        arrayField.findIndex(
          (fd) => fd.Field == FieldCheck || fd.FieldCompare == FieldCheck
        ) != -1
      ) {
        isCheckField = true;
        return isCheckField;
      }
    } else if (detailStep.ObjStepCondition.TypeCondition == "Calculate") {
      for (let index = 0; index < arrayField.length; index++) {
        const fieldCal = arrayField[index].Field;
        if (
          arrayField[index].Field.FieldNameEnd == FieldCheck ||
          arrayField[index].Field.FieldNameStart == FieldCheck ||
          arrayField[index].FieldCompare == FieldCheck
        ) {
          isCheckField = true;
          break;
        }
        return isCheckField;
      }
    }
  }
  return isCheckField;
}

function checkFieldStepCondition(step, FieldCheck, wfStepTable) {
  let isCheckField = false;
  const detailStep = wfStepTable.find((x) => x.indexStep == step);
  if (detailStep && detailStep.ObjStepCondition.IsActive) {
    let arrConditions = detailStep.ObjStepCondition.ArrayStepCondition;
    for (let indexCon = 0; indexCon < arrConditions.length; indexCon++) {
      let stepCondition = returnObject(arrConditions[indexCon]);
      let ArrObjCondition = returnArray(stepCondition.ObjCondition);
      if (stepCondition.TypeCondition == "Compare") {
        if (
          ArrObjCondition.findIndex(
            (fd) => fd.Field == FieldCheck || fd.FieldCompare == FieldCheck
          ) != -1
        ) {
          isCheckField = true;
          return isCheckField;
        }
      } else if (stepCondition.TypeCondition == "Calculate") {
        for (let index = 0; index < ArrObjCondition.length; index++) {
          if (
            ArrObjCondition[index].Field.FieldNameEnd == FieldCheck ||
            ArrObjCondition[index].Field.FieldNameStart == FieldCheck ||
            ArrObjCondition[index].FieldCompare == FieldCheck
          ) {
            isCheckField = true;
            return isCheckField;
          }
        }
      }
    }
  }
  return isCheckField;
}

function calculationField(nameState, valueState, wfStepField, detailInput) {
  let FieldName = { Name: "", Type: "", Value: "" };
  let FieldNameStart = "",
    FieldNameEnd = "",
    Calculation = "";
  for (let i = 0; i < wfStepField.length; i++) {
    let validation = wfStepField[i].ObjValidation;
    if (validation.CalculateCondition.isCalculate) {
      FieldName = {
        Name: wfStepField[i].InternalName,
        Type: wfStepField[i].FieldType,
        Value: "",
      };
      Calculation = validation.CalculateCondition.Calculation;
      FieldName.Type = validation.CalculateCondition.FieldType;
      if (nameState == validation.CalculateCondition.FieldNameEnd) {
        FieldNameStart =
          detailInput[validation.CalculateCondition.FieldNameStart];
        FieldNameEnd = valueState;
        break;
      } else if (nameState == validation.CalculateCondition.FieldNameStart) {
        FieldNameStart = valueState;
        FieldNameEnd = detailInput[validation.CalculateCondition.FieldNameEnd];
        break;
      }
    }
  }
  if (isNotNull(FieldNameStart) && isNotNull(FieldNameEnd)) {
    if (FieldName.Type == "DateTime") {
      FieldName.Value = CalculateDate(FieldNameStart, FieldNameEnd);
      if (FieldName.Value >= 0) {
        FieldName.Value += 1;
      }
    } else if (FieldName.Type == "Number") {
      FieldName.Value = CalculateNumber(
        FieldNameStart,
        FieldNameEnd,
        Calculation
      );
    }
  }
  let newField = returnObject(FieldName);
  Object.assign(newField, {
    FieldNameStart: FieldNameStart,
    FieldNameEnd: FieldNameEnd,
  });
  return newField;
}

function compareArray(arrayOld) {
  let arrayNew = returnArray(arrayOld);
  arrayNew.sort(function (a, b) {
    return a.Priority - b.Priority;
  });
  return arrayNew;
}

function checkConditionNextStep(
  indexStep,
  wfStepTable,
  wfStepFieldInput,
  detailInput,
  detailItem
) {
  // console.log("checkConditionNextStep");
  try {
    let stepIndex = wfStepTable.find((x) => x.indexStep == indexStep);
    let StepNext = stepIndex.StepNextDefault.StepNextDefaultId;
    let objStepCon = returnObject(stepIndex.ObjStepCondition);
    if (objStepCon.IsActive) {
      let arrConditions = compareArray(objStepCon.ArrayStepCondition);
      for (let index = 0; index < arrConditions.length; index++) {
        let stepCondition = returnObject(arrConditions[index]);
        let ArrObjCondition = returnArray(stepCondition.ObjCondition);

        let conNextStep = false;
        if (stepCondition.TypeCondition == "Calculate") {
          for (let i = 0; i < ArrObjCondition.length; i++) {
            conNextStep = false;
            let FieldStart = returnField(
              ArrObjCondition[i].Field.FieldNameStart,
              wfStepFieldInput,
              detailInput,
              detailItem
            );
            let FieldEnd = returnField(
              ArrObjCondition[i].Field.FieldNameEnd,
              wfStepFieldInput,
              detailInput,
              detailItem
            );
            let FieldCompare = returnField(
              ArrObjCondition[i].Field.FieldCompare,
              wfStepFieldInput,
              detailInput,
              detailItem
            );

            if (ArrObjCondition[i].Field.FieldType == "DateTime") {
              if (isNotNull(FieldStart) && isNotNull(FieldEnd)) {
                let calCon = CalculateDate(FieldStart, FieldEnd) + 1;
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
                } else if (ArrObjCondition[i].ConditionType == "FieldValue") {
                  conNextStep = CompareNumber(
                    calCon,
                    ArrObjCondition[i].Value,
                    ArrObjCondition[i].Condition
                  );
                }
              }
            } else if (ArrObjCondition[i].Field.FieldType == "Number") {
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
                } else if (ArrObjCondition[i].ConditionType == "FieldValue") {
                  conNextStep = CompareNumber(
                    calCon,
                    ArrObjCondition[i].Value,
                    ArrObjCondition[i].Condition
                  );
                }
              }
            }

            if (!isNotNull(stepCondition.ConditionsCombined) && conNextStep) {
              break;
            }
            if (
              CheckNull(stepCondition.ConditionsCombined) == "And" &&
              !conNextStep
            ) {
              break;
            }
            if (
              CheckNull(stepCondition.ConditionsCombined) == "And" &&
              conNextStep
            ) {
              break;
            }
          }
        } else if (stepCondition.TypeCondition == "Compare") {
          for (let i = 0; i < ArrObjCondition.length; i++) {
            conNextStep = false;
            let FieldStart = returnField(
              ArrObjCondition[i].Field,
              wfStepFieldInput,
              detailInput,
              detailItem
            );
            let FieldCompare = returnField(
              ArrObjCondition[i].FieldCompare,
              wfStepFieldInput,
              detailInput,
              detailItem
            );

            if (ArrObjCondition[i].FieldType == "DateTime") {
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
              } else if (ArrObjCondition[i].ConditionType == "FieldValue") {
                conNextStep = CompareDate(
                  FieldStart,
                  ArrObjCondition[i].Value,
                  ArrObjCondition[i].Condition
                );
              }
            } else if (ArrObjCondition[i].FieldType == "Number") {
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
              } else if (ArrObjCondition[i].ConditionType == "FieldValue") {
                conNextStep = CompareNumber(
                  FieldStart,
                  ArrObjCondition[i].Value,
                  ArrObjCondition[i].Condition
                );
              }
            } else if (
              ArrObjCondition[i].FieldType == "Text" ||
              ArrObjCondition[i].FieldType == "TextArea" ||
              ArrObjCondition[i].FieldType == "Dropdown"
            ) {
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
            }
            // console.log(conNextStep);
            if (!isNotNull(stepCondition.ConditionsCombined) && conNextStep) {
              break;
            }
            if (
              CheckNull(stepCondition.ConditionsCombined) == "And" &&
              !conNextStep
            ) {
              break;
            }
            if (
              CheckNull(stepCondition.ConditionsCombined) == "Or" &&
              conNextStep
            ) {
              break;
            }
          }
        }

        if (conNextStep) {
          StepNext = stepCondition.StepNextCondition.StepNextConditionId;
          break;
        }
      }
    }
    return StepNext;
  } catch (error) {
    console.log(error);
    return 1;
  }
}

function returnField(FieldCheck, wfStepFieldInput, detailInput, detailItem) {
  let ValueField = undefined;
  if (
    wfStepFieldInput.findIndex((f) => f.InternalName == FieldCheck) != -1 &&
    detailInput[FieldCheck] != undefined
  ) {
    ValueField = detailInput[FieldCheck];
    return ValueField;
  }
  if (detailItem[FieldCheck] != undefined) {
    ValueField = detailItem[FieldCheck];
    return ValueField;
  }
  return ValueField;
}

function FormatCurrency(number) {
  number = Number(number);
  return number.toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function CurrencyToNumber(num) {
  return num.replace(new RegExp(",", "g"), "");
}

function makeRandomColor() {
  let color = "#";
  for (let k = 0; k < 3; k++) {
    color += ("0" + ((Math.random() * 256) | 0).toString(16)).substr(-2);
  }
  return color;
}

function loadBranch(ListDepartment, Code, rootDept) {
  let branch = ListDepartment.filter((ld) => ld.ParentCode == Code);

  for (let index = 0; index < branch.length; index++) {
    let branchDept = returnObject(branch[index]);
    let deptchild = ListDepartment.filter(
      (de) => de.ParentCode == branchDept.Code
    );

    let childDept = [];

    deptchild.map((child) => {
      let childOld = returnArray(child.children);
      let childCheck = loadBranch(ListDepartment, child.Code, childOld);
      child.children = childCheck;
      child.childrenDept = childCheck;
      childDept.push(child);
    });

    branchDept.children = childDept;
    branchDept.childrenDept = childDept;
    rootDept.push(branchDept);
  }

  return rootDept;
}

function loadChildBranch(rootDept) {
  let childrenDept = returnArray(rootDept.childrenDept);
  let deptBranch = [];
  if (childrenDept.length > 0) {
    let branchDept = returnArray(childrenDept);

    childrenDept.map((child) => {
      deptBranch.push(child);
      let newDept = loadChildBranch(child, deptBranch, branchDept);
      if (newDept.length > 0) {
        newDept.map((childSub) => {
          deptBranch.push(childSub);
        });
      }
    });
  }
  return deptBranch;
}

function loadWFByDept(arrDept, arrWF) {
  let arrayWF = [];
  for (let i = 0; i < arrDept.length; i++) {
    let dept = arrWF.filter(
      (wf) =>
        wf.Status != 0 &&
        wf.WhoIsUsed == "Department" &&
        wf.Department == arrDept[i].Code
    );
    dept.map((child) => {
      arrayWF.push(child);
    });
  }
  return arrayWF;
}

function loadSLA(historyStep, wfStepTable) {
  let historyStepOld = returnObject(historyStep);
  if (isNotNull(historyStepOld.SLA)) {
    let step = wfStepTable.find(
      (wf) => wf.indexStep == historyStepOld.indexStep
    );
    if (isNotNull(step)) {
      historyStepOld.SLA = step.SLA;
    } else {
      historyStepOld.SLA = 0;
    }
  }
  let realisticSLA = 0;
  if (
    (historyStepOld.StatusStep == 1 || historyStepOld.StatusStep == 2) &&
    isNotNull(historyStepOld.DateFinish)
  ) {
    let startDate = moment(historyStepOld.DateRequest).toDate();
    // console.log(startDate);
    let endDate = moment(historyStepOld.DateFinish).toDate();
    // console.log(endDate);

    let startTime =
      startDate.getHours() +
      Number(parseFloat(startDate.getMinutes() / 60).toFixed(2));
    // console.log(startTime);

    let endTime =
      endDate.getHours() +
      Number(parseFloat(endDate.getMinutes() / 60).toFixed(2));
    // console.log(endTime);

    realisticSLA = parseFloat(endTime - startTime).toFixed(2);
  }
  Object.assign(historyStepOld, { RealisticSLA: realisticSLA });

  return historyStepOld;
}

function loadReportStepSLA(historyStep, wfStepTable, isReport) {
  let historyStepOld = returnObject(historyStep);
  if (!isNotNull(historyStepOld.SLA)) {
    let step = wfStepTable.find(
      (wf) => wf.indexStep == historyStepOld.indexStep
    );
    if (isNotNull(step)) {
      historyStepOld.SLA = step.SLA;
    } else {
      historyStepOld.SLA = 0;
    }
  }
  let realisticSLA = 0;
  if (
    ((historyStepOld.StatusStep == 1 ||
      historyStepOld.StatusStep == 2 ||
      historyStepOld.StatusStep == 3) &&
      isNotNull(historyStepOld.DateFinish)) ||
    isReport
  ) {
    let startDate = moment(historyStepOld.DateRequest).toDate();
    // console.log(startDate);
    let startTime =
      startDate.getHours() +
      Number(parseFloat(startDate.getMinutes() / 60).toFixed(2));
    // console.log(startTime);

    let endDate = moment(historyStepOld.DateFinish).toDate();
    // console.log(endDate);
    let endTime =
      endDate.getHours() +
      Number(parseFloat(endDate.getMinutes() / 60).toFixed(2));
    // console.log(endTime);

    let DateStart = startDate;
    let DateEnd = endDate;
    let timeStart = startTime;
    let timeEnd = endTime;
    if (
      startDate.getDay() == objDayWeekend.Sunday ||
      startDate.getDay() == objDayWeekend.Saturday
    ) {
      let TimeInWorksStart = returnObject(arrayTimeInWorks[0]);
      timeStart = TimeInWorksStart.TimeStart;
      let arrTime = TimeInWorksStart.TimeStart.toString().split(".");

      if (startDate.getDay() == objDayWeekend.Sunday) {
        if (arrTime.length > 1) {
          DateStart = moment(startDate)
            .add(1, "days")
            .hours(arrTime[0])
            .minutes(arrTime[1])
            .toDate();
        } else {
          DateStart = moment(startDate)
            .add(1, "days")
            .hours(TimeInWorksStart.TimeStart)
            .toDate();
        }
      }
      if (startDate.getDay() == objDayWeekend.Saturday) {
        if (arrTime.length > 1) {
          DateStart = moment(startDate)
            .add(2, "days")
            .hours(arrTime[0])
            .minutes(arrTime[1])
            .toDate();
        } else {
          DateStart = moment(startDate)
            .add(2, "days")
            .hours(TimeInWorksStart.TimeStart)
            .toDate();
        }
      }
    } else {
      for (let i = 0; i < arrayTimeInWorks.length; i++) {
        let TimeInWorks = returnObject(arrayTimeInWorks[i]);
        if (
          TimeInWorks.TimeStart <= startTime &&
          startTime <= TimeInWorks.TimeEnd
        ) {
          timeStart = startTime;
          DateStart = startDate;
          break;
        }
        if (startTime < TimeInWorks.TimeStart) {
          timeStart = TimeInWorks.TimeStart;
          let arrTime = TimeInWorks.TimeStart.toString().split(".");
          if (arrTime.length > 1) {
            DateStart = moment(startDate)
              .hours(arrTime[0])
              .minutes(arrTime[1])
              .toDate();
          } else {
            DateStart = moment(startDate).hours(TimeInWorks.TimeStart).toDate();
          }
          break;
        }
        if (
          startTime > TimeInWorks.TimeEnd &&
          i == arrayTimeInWorks.length - 1
        ) {
          timeStart = arrayTimeInWorks[0].TimeStart;
          let arrTime = arrayTimeInWorks[0].TimeStart.toString().split(".");
          if (arrTime.length > 1) {
            DateStart = moment(startDate)
              .add(1, "days")
              .hours(arrTime[0])
              .minutes(arrTime[1])
              .toDate();
          } else {
            DateStart = moment(startDate)
              .add(1, "days")
              .hours(TimeInWorks.TimeStart)
              .toDate();
          }
          break;
        }
      }
    }

    // console.log(DateStart);
    // console.log(timeStart);

    if (
      endDate.getDay() == objDayWeekend.Sunday ||
      endDate.getDay() == objDayWeekend.Saturday
    ) {
      let TimeInWorksEnd = returnObject(
        arrayTimeInWorks[arrayTimeInWorks.length - 1]
      );
      timeEnd = TimeInWorksEnd.TimeEnd;
      let arrTimeEnd = TimeInWorksEnd.TimeEnd.toString().split(".");

      if (endDate.getDay() == objDayWeekend.Sunday) {
        if (arrTimeEnd.length > 1) {
          DateEnd = moment(startDate)
            .subtract(2, "days")
            .hours(arrTimeEnd[0])
            .minutes(arrTimeEnd[1])
            .toDate();
        } else {
          DateEnd = moment(startDate)
            .subtract(2, "days")
            .hours(TimeInWorksEnd.TimeEnd)
            .toDate();
        }
      }
      if (endDate.getDay() == objDayWeekend.Saturday) {
        if (arrTimeEnd.length > 1) {
          DateEnd = moment(startDate)
            .subtract(1, "days")
            .hours(arrTimeEnd[0])
            .minutes(arrTimeEnd[1])
            .toDate();
        } else {
          DateEnd = moment(startDate)
            .subtract(1, "days")
            .hours(TimeInWorksEnd.TimeEnd)
            .toDate();
        }
      }
    } else {
    }
    for (let i = 0; i < arrayTimeInWorks.length; i++) {
      let TimeInWorks = returnObject(arrayTimeInWorks[i]);
      if (TimeInWorks.TimeStart <= endTime && endTime <= TimeInWorks.TimeEnd) {
        timeEnd = endTime;
        DateEnd = endDate;
        break;
      }
      if (endTime > TimeInWorks.TimeEnd && i == arrayTimeInWorks.length - 1) {
        timeEnd = TimeInWorks.TimeEnd;
        let arrTime = TimeInWorks.TimeEnd.toString().split(".");
        if (arrTime.length > 1) {
          DateEnd = moment(endDate)
            .hours(arrTime[0])
            .minutes(arrTime[1])
            .toDate();
        } else {
          DateEnd = moment(endDate).hours(TimeInWorks.TimeEnd).toDate();
        }
        break;
      }
      if (endTime < TimeInWorks.TimeStart && i == 0) {
        timeEnd = arrayTimeInWorks[arrayTimeInWorks.length - 1].TimeEnd;
        let arrTime = arrayTimeInWorks[
          arrayTimeInWorks.length - 1
        ].TimeEnd.toString().split(".");
        if (arrTime.length > 1) {
          DateEnd = moment(endDate)
            .hours(arrTime[0])
            .minutes(arrTime[1])
            .toDate();
        } else {
          DateEnd = moment(endDate).hours(TimeInWorks.TimeEnd).toDate();
        }
        break;
      }
    }

    // console.log(DateEnd);
    // console.log(timeEnd);

    let startDateCheck = moment(historyStepOld.DateRequest)
      .startOf("day")
      .toDate();
    // console.log(startDateCheck);
    let endDateCheck = moment(historyStepOld.DateFinish)
      .startOf("day")
      .toDate();
    // console.log(endDateCheck);

    let checkDateStart = moment(DateStart).startOf("day").toDate();
    // console.log(checkDateStart);
    let checkDateEnd = moment(DateEnd).startOf("day").toDate();
    // console.log(checkDateEnd);
    if (
      startDateCheck.getTime() <= endDateCheck.getTime() &&
      checkDateStart.getTime() > checkDateEnd.getTime()
    ) {
      realisticSLA = 0;
    } else {
      // lấy giờ dự kiến theo SLA
      let objDateTime = {
        date: 0,
        startTime: timeStart,
        endTime: 0,
      };
      let objSLATarget = loadDateTimeTargetSLA(
        objDateTime,
        0,
        historyStepOld.SLA
      );
      let dateTimeSLATarget = DateEnd;
      // thời gian ngày giờ theo SLA
      let timeFinish = objSLATarget.endTime.toString().split(".");
      if (timeFinish.length > 1) {
        let minutesNew = ((Number(timeFinish[1]) / 100) * 60).toFixed();
        dateTimeSLATarget = moment(DateStart)
          .add(objSLATarget.date, "days")
          .hours(timeFinish[0])
          .minutes(minutesNew)
          .toDate();
      } else {
        dateTimeSLATarget = moment(DateStart)
          .add(objSLATarget.date, "days")
          .hours(timeFinish[0])
          .toDate();
      }

      // console.log(objSLATarget);
      // console.log(dateTimeSLATarget);

      let timeDate = CalculateDate(DateStart, DateEnd);
      // console.log(timeDate);
      let objTimeResult = {
        startTime: timeStart,
        endTime: timeEnd,
        timeResult: 0,
        checkStartDate: DateStart,
      };
      //Thời gian thực tế
      let resultSLA = loadTimeResultSLA(objTimeResult, 0, timeDate);
      // console.log(resultSLA);
      // realisticSLA = parseFloat(endTime - startTime).toFixed(2);
      realisticSLA = resultSLA.timeResult;
    }
  }
  Object.assign(historyStepOld, { RealisticSLA: realisticSLA });

  return historyStepOld;
}

function loadDateTimeTargetSLA(objDate, timeCheck, timeMock) {
  if (objDate.date == 0) {
    let k = false;
    for (let indexTime = 0; indexTime < arrayTimeInWorks.length; indexTime++) {
      let TimeInWorks = returnObject(arrayTimeInWorks[indexTime]);
      if (
        TimeInWorks.TimeStart <= objDate.startTime &&
        objDate.startTime <= TimeInWorks.TimeEnd
      ) {
        k = true;
        if (objDate.startTime + timeMock <= TimeInWorks.TimeEnd) {
          objDate.endTime = objDate.startTime + timeMock;
          timeCheck = timeMock;
          return objDate;
        } else {
          timeCheck = TimeInWorks.TimeEnd - objDate.startTime;
        }
      } else if (k == true) {
        if (
          TimeInWorks.TimeEnd - TimeInWorks.TimeStart >=
          timeMock - timeCheck
        ) {
          objDate.endTime = TimeInWorks.TimeStart + (timeMock - timeCheck);
          timeCheck += timeMock - timeCheck;
          return objDate;
        } else {
          timeCheck += TimeInWorks.TimeEnd - TimeInWorks.TimeStart;
          if (indexTime == arrayTimeInWorks.length - 1) {
            objDate.date += 1;
            loadDateTimeTargetSLA(objDate, timeCheck, timeMock);
          }
        }
      }
    }
  } else {
    for (let i = 0; i < arrayTimeInWorks.length; i++) {
      let TimeInWorks = returnObject(arrayTimeInWorks[i]);
      if (TimeInWorks.TimeEnd - TimeInWorks.TimeStart >= timeMock - timeCheck) {
        objDate.endTime = TimeInWorks.TimeStart + (timeMock - timeCheck);
        timeCheck += timeMock - timeCheck;
        return objDate;
      } else {
        timeCheck += TimeInWorks.TimeEnd - TimeInWorks.TimeStart;
        if (i == arrayTimeInWorks.length - 1) {
          objDate.date += 1;
          loadDateTimeTargetSLA(objDate, timeCheck, timeMock);
        }
      }
    }
  }
  return objDate;
}

function loadTimeResultSLA(objDate, timeCheck, timeMock) {
  // console.log(objDate);
  let newDate = moment(objDate.checkStartDate).add(timeCheck, "days").toDate();
  if (
    newDate.getDay() == objDayWeekend.Sunday ||
    newDate.getDay() == objDayWeekend.Saturday
  ) {
    timeCheck += 1;
    loadTimeResultSLA(objDate, timeCheck, timeMock);
  } else {
    if (timeCheck === 0) {
      let k = false;
      for (
        let indexTime = 0;
        indexTime < arrayTimeInWorks.length;
        indexTime++
      ) {
        let TimeInWorks = returnObject(arrayTimeInWorks[indexTime]);
        if (
          TimeInWorks.TimeStart <= objDate.startTime &&
          objDate.startTime <= TimeInWorks.TimeEnd
        ) {
          k = true;
          if (timeCheck < timeMock) {
            objDate.timeResult = Number(
              (
                objDate.timeResult +
                Number((TimeInWorks.TimeEnd - objDate.startTime).toFixed(2))
              ).toFixed(2)
            );
            if (indexTime == arrayTimeInWorks.length - 1) {
              timeCheck += 1;
              loadTimeResultSLA(objDate, timeCheck, timeMock);
            }
          } else {
            if (objDate.endTime < TimeInWorks.TimeEnd) {
              objDate.timeResult = Number(
                (
                  objDate.timeResult +
                  Number((objDate.endTime - objDate.startTime).toFixed(2))
                ).toFixed(2)
              );
              timeCheck = timeMock;
              return objDate;
            } else {
              objDate.timeResult = Number(
                (
                  objDate.timeResult +
                  Number((TimeInWorks.TimeEnd - objDate.startTime).toFixed(2))
                ).toFixed(2)
              );
            }
          }
        } else if (k == true) {
          if (timeCheck < timeMock) {
            objDate.timeResult = Number(
              (
                objDate.timeResult +
                Number((TimeInWorks.TimeEnd - TimeInWorks.TimeStart).toFixed(2))
              ).toFixed(2)
            );
            if (indexTime == arrayTimeInWorks.length - 1) {
              timeCheck += 1;
              loadTimeResultSLA(objDate, timeCheck, timeMock);
            }
          } else {
            if (objDate.endTime < TimeInWorks.TimeEnd) {
              objDate.timeResult = Number(
                (
                  objDate.timeResult +
                  Number((objDate.endTime - TimeInWorks.TimeStart).toFixed(2))
                ).toFixed(2)
              );
              timeCheck = timeMock;
              return objDate;
            } else {
              objDate.timeResult = Number(
                (
                  objDate.timeResult +
                  Number(
                    (TimeInWorks.TimeEnd - TimeInWorks.TimeStart).toFixed(2)
                  )
                ).toFixed(2)
              );
            }
          }
        }
      }
    } else {
      for (let i = 0; i < arrayTimeInWorks.length; i++) {
        let TimeInWorks2 = returnObject(arrayTimeInWorks[i]);
        if (timeCheck < timeMock) {
          objDate.timeResult = Number(
            (
              objDate.timeResult +
              Number((TimeInWorks2.TimeEnd - TimeInWorks2.TimeStart).toFixed(2))
            ).toFixed(2)
          );
          if (i == arrayTimeInWorks.length - 1) {
            timeCheck += 1;
            loadTimeResultSLA(objDate, timeCheck, timeMock);
          }
        } else {
          if (objDate.endTime < TimeInWorks2.TimeEnd) {
            objDate.timeResult = Number(
              (
                objDate.timeResult +
                Number((objDate.endTime - TimeInWorks2.TimeStart).toFixed(2))
              ).toFixed(2)
            );
            timeCheck = timeMock;
            return objDate;
          } else {
            objDate.timeResult = Number(
              (
                objDate.timeResult +
                Number(
                  (TimeInWorks2.TimeEnd - TimeInWorks2.TimeStart).toFixed(2)
                )
              ).toFixed(2)
            );
          }
        }
      }
    }
  }

  return objDate;
}

function backToPages(typePage) {
  if (typePage == "MyRequest") {
    window.location.href = config.pages.wfMyRequest + "?RequestType=MyRequest";
  } else if (typePage == "AllRequest") {
    window.location.href = config.pages.wfMyRequest + "?RequestType=AllRequest";
  } else if (typePage == "wfExecution") {
    window.location.href = config.pages.wfExecution;
  } else if (typePage == "wfHistoryApprove") {
    window.location.href = config.pages.wfHistoryApprove;
  } else {
    window.location.href = config.pages.wfMyRequest + "?RequestType=MyRequest";
  }
}

function loadMemberUsersDept(objDepartment) {
  let userMembers = [];
  if (isNotNull(objDepartment.USerManager.UserId)) {
    userMembers.push(objDepartment.USerManager);
  }
  objDepartment.UserMembers.map((users) => {
    if (userMembers.findIndex((usM) => usM.UserId == users.UserId) == -1) {
      userMembers.push(users);
    }
  });
  return userMembers;
}

function loadWorkflowInDept(objDept, arrayUserMembers, listWorlkflowActive) {
  let arrayWFInDept = loadWFByDept([objDept], listWorlkflowActive);
  console.log(arrayWFInDept);
  let wfAllUsers = listWorlkflowActive.filter(
    (wf) => wf.WhoIsUsed == "All Users"
  );
  wfAllUsers.map((child) => {
    if (arrayWFInDept.findIndex((wf) => wf.WFId == child.WFId) == -1) {
      arrayWFInDept.push(child);
    }
  });
  console.log(wfAllUsers);

  let wfDefaultUsers = listWorlkflowActive.filter(
    (wf) => wf.WhoIsUsed == "Users"
  );
  wfDefaultUsers.map((childUS) => {
    let usDefault = new Set(childUS.UserDefault);
    let duplicatedWF = arrayUserMembers.filter((item) =>
      usDefault.has(item.UserId)
    );
    if (
      duplicatedWF.length > 0 &&
      arrayWFInDept.findIndex((wf) => wf.WFId == childUS.WFId) == -1
    ) {
      arrayWFInDept.push(childUS);
    }
  });
  console.log(wfDefaultUsers);
  return arrayWFInDept;
}

function loadModifiedDate(oldHistoryModified, DateModified, StatusStep) {
  let HistoryModified = returnArray(oldHistoryModified);
  if (StatusStep == 1 || StatusStep == 2) {
    if (HistoryModified.length == 1) {
      HistoryModified[0].DateRequest = DateModified;
      HistoryModified[0].DateFinish = DateModified;
    } else {
      HistoryModified[HistoryModified.length - 1].DateFinish = DateModified;
    }
  } else {
    if (HistoryModified.length == 1) {
      HistoryModified[0].DateRequest = DateModified;
      HistoryModified[0].DateFinish = DateModified;
    }
    if (HistoryModified.length == 2) {
      HistoryModified[0].DateFinish = DateModified;
      HistoryModified[0].DateRequest = DateModified;
      HistoryModified[1].DateRequest = DateModified;
    }
    if (HistoryModified.length > 2) {
      HistoryModified[HistoryModified.length - 2].DateFinish = DateModified;
      HistoryModified[HistoryModified.length - 1].DateRequest = DateModified;
    }
  }
  // if (HistoryModified.length == 1 && StatusStep == 1) {
  //   HistoryModified[0].DateRequest = DateModified;
  //   HistoryModified[0].DateFinish = DateModified;
  // } else if (HistoryModified.length > 1) {
  //   if (StatusStep == 1) {
  //     HistoryModified[HistoryModified.length - 1].DateFinish = DateModified;
  //   } else {
  //     if (HistoryModified.length == 2 && ) {
  //       HistoryModified[0].DateFinish = DateModified;
  //       HistoryModified[0].DateRequest = DateModified;
  //       HistoryModified[1].DateRequest = DateModified;
  //     } else {
  //       HistoryModified[HistoryModified.length - 2].DateFinish = DateModified;
  //       HistoryModified[
  //         HistoryModified.length - 1
  //       ].DateRequest = DateModified;
  //     }
  //   }
  // }
  return HistoryModified;
}

function checkUpdateData(
  InternalNameSub,
  InternalNameParent,
  FieldTypeSub,
  dataSubInput,
  dataSubView
) {
  let objDataAdd = {
    isAdd: false,
    InternalName: "",
    dataInternalName: "",
  };
  if (
    FieldTypeSub == objField.User &&
    dataSubInput[InternalNameSub + "Id"] != undefined &&
    isNotNull(dataSubInput[InternalNameSub + "Id"])
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent + "Id",
      dataInternalName: dataSubInput[InternalNameSub + "Id"],
    };
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.UserMulti &&
    dataSubInput[InternalNameSub + "Id"] != undefined &&
    isNotNull(dataSubInput[InternalNameSub + "Id"]) &&
    isNotNull(dataSubInput[InternalNameSub + "Id"].results) &&
    dataSubInput[InternalNameSub + "Id"].results.length > 0
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent + "Id",
      dataInternalName: dataSubInput[InternalNameSub + "Id"],
    };
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.CheckBox &&
    dataSubInput[InternalNameSub] != undefined &&
    isNotNull(dataSubInput[InternalNameSub]) &&
    isNotNull(dataSubInput[InternalNameSub].results) &&
    dataSubInput[InternalNameSub].results.length > 0
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent,
      dataInternalName: dataSubInput[InternalNameSub],
    };
    return objDataAdd;
  }
  if (
    (FieldTypeSub == objField.Hyperlink ||
      FieldTypeSub == objField.PictureLink) &&
    dataSubInput[InternalNameSub] != undefined &&
    isNotNull(dataSubInput[InternalNameSub]) &&
    isNotNull(dataSubInput[InternalNameSub].Url)
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent,
      dataInternalName: dataSubInput[InternalNameSub],
    };
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.YesNo &&
    dataSubInput[InternalNameSub] != undefined
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent,
      dataInternalName: dataSubInput[InternalNameSub],
    };
    return objDataAdd;
  }
  if (
    dataSubInput[InternalNameSub] != undefined &&
    isNotNull(dataSubInput[InternalNameSub]) &&
    FieldTypeSub != objField.User &&
    FieldTypeSub != objField.UserMulti &&
    FieldTypeSub != objField.CheckBox &&
    FieldTypeSub != objField.Hyperlink &&
    FieldTypeSub != objField.PictureLink
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent,
      dataInternalName: dataSubInput[InternalNameSub],
    };
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.User &&
    dataSubInput[InternalNameSub + "Id"] === undefined &&
    dataSubView[InternalNameSub] != undefined &&
    isNotNull(dataSubView[InternalNameSub].UserId)
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent + `Id`,
      dataInternalName: dataSubInput[InternalNameSub],
    };
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.UserMulti &&
    dataSubInput[InternalNameSub + "Id"] === undefined &&
    dataSubView[InternalNameSub] != undefined
  ) {
    let userDefault = [];
    const listPeople = dataSubView[InternalNameSub];
    for (let i = 0; i < listPeople.length; i++) {
      userDefault.push(listPeople[i].UserId);
    }
    if (userDefault.length > 0) {
      objDataAdd = {
        isAdd: true,
        InternalName: InternalNameParent + `Id`,
        dataInternalName: { results: userDefault },
      };
    }
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.CheckBox &&
    dataSubInput[InternalNameSub] === undefined &&
    dataSubView[InternalNameSub] != undefined
  ) {
    let arrInput = [];
    const arrCheck = dataSubView[InternalNameSub];
    for (let i = 0; i < arrCheck.length; i++) {
      if (arrCheck[i].isChecked) {
        arrInput.push(arrCheck[i].Value);
      }
    }
    if (arrInput.length > 0) {
      objDataAdd = {
        isAdd: true,
        InternalName: InternalNameParent,
        dataInternalName: { results: arrInput },
      };
    }
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.RadioButton &&
    dataSubInput[InternalNameSub] === undefined &&
    dataSubView[InternalNameSub] != undefined
  ) {
    let arrRadio = dataSubView[InternalNameSub];
    let textRadio = "";
    for (let inChoice = 0; inChoice < arrRadio.length; inChoice++) {
      if (arrRadio[inChoice].isChecked) {
        textRadio = arrRadio[inChoice].Value;
        break;
      }
    }
    if (isNotNull(textRadio)) {
      objDataAdd = {
        isAdd: true,
        InternalName: InternalNameParent,
        dataInternalName: textRadio,
      };
    }
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.YesNo &&
    dataSubInput[InternalNameSub] === undefined &&
    dataSubView[InternalNameSub] != undefined
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent,
      dataInternalName: dataSubView[InternalNameSub],
    };
    return objDataAdd;
  }
  if (
    (FieldTypeSub == objField.Hyperlink ||
      FieldTypeSub == objField.PictureLink) &&
    dataSubInput[InternalNameSub] === undefined &&
    dataSubView[InternalNameSub] != undefined &&
    isNotNull(dataSubView[InternalNameSub])
  ) {
    let dataLink = { Url: dataSubView[InternalNameSub] };
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent,
      dataInternalName: dataLink,
    };
    return objDataAdd;
  }
  if (
    FieldTypeSub == objField.SPLinkWF &&
    dataSubInput[InternalNameSub] === undefined &&
    dataSubView[InternalNameSub] != undefined &&
    isNotNull(dataSubView[InternalNameSub])
  ) {
    let arrSPLink = dataSubView[InternalNameSub];
    let arrInputSPLink = [];
    for (let inSP = 0; inSP < arrSPLink.length; inSP++) {
      arrInputSPLink.push({
        WFId: arrSPLink[inSP].WFId,
        ItemId: arrSPLink[inSP].ItemId,
        indexStep: arrSPLink[inSP].indexStep,
        Title: arrSPLink[inSP].Title,
      });
    }
    if (arrInputSPLink.length > 0) {
      objDataAdd = {
        isAdd: true,
        InternalName: InternalNameParent,
        dataInternalName: JSON.stringify(arrInputSPLink),
      };
    }
    return objDataAdd;
  }
  if (
    dataSubInput[InternalNameSub] === undefined &&
    dataSubView[InternalNameSub] != undefined &&
    isNotNull(dataSubView[InternalNameSub]) &&
    FieldTypeSub != objField.User &&
    FieldTypeSub != objField.UserMulti &&
    FieldTypeSub != objField.CheckBox &&
    FieldTypeSub != objField.Hyperlink &&
    FieldTypeSub != objField.PictureLink
  ) {
    objDataAdd = {
      isAdd: true,
      InternalName: InternalNameParent,
      dataInternalName: dataSubView[InternalNameSub],
    };
    return objDataAdd;
  }

  return objDataAdd;
}

export {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  CalculateDate,
  CalculateNumber,
  CompareNumber,
  CompareDate,
  CompareText,
  ISODateString,
  formatDate,
  formatStatusText,
  formatStatusLabel,
  formatStatusTextLine,
  getFileBuffer,
  formatTypeObjField,
  formatTypeCompare,
  formatTypeCalculation,
  ReplaceFieldMail,
  checkLicense,
  returnArray,
  returnObject,
  FindTitleById,
  isValidURL,
  checkFieldStepConditionOld,
  checkFieldStepCondition,
  calculationField,
  checkConditionNextStep,
  compareArray,
  returnField,
  FormatCurrency,
  CurrencyToNumber,
  makeRandomColor,
  loadBranch,
  loadChildBranch,
  loadWFByDept,
  loadSLA,
  loadReportStepSLA,
  loadDateTimeTargetSLA,
  backToPages,
  loadMemberUsersDept,
  loadWorkflowInDept,
  loadModifiedDate,
  checkUpdateData,
};
