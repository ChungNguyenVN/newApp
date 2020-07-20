const objField = {
  Text: "Text",
  TextArea: "TextArea",
  Number: "Number",
  DateTime: "DateTime",
  Dropdown: "Dropdown",
  YesNo: "YesNo",
  User: "User",
  UserMulti: "UserMulti",
  CheckBox: "CheckBox",
  RadioButton: "RadioButton",
  SPLinkWF: "SPLinkWF",
  Hyperlink: "Hyperlink",
  PictureLink: "PictureLink",
  Label: "Label",
  Sum: "Sum",
  Average: "Average",
  Percent: "Percent",
};

const arrayObjField = [
  { Title: "Một dòng văn bản", Type: "Text" },
  { Title: "Nhiều dòng văn bản", Type: "TextArea" },
  { Title: "Số", Type: "Number" },
  { Title: "Ngày", Type: "DateTime" },
  { Title: "Có/Không", Type: "YesNo" },
  { Title: "Một người", Type: "User" },
  { Title: "Nhiều người", Type: "UserMulti" },
  { Title: "Lựa chọn thả xuống", Type: "Dropdown" },
  { Title: "Lựa chọn hộp", Type: "CheckBox" },
  { Title: "Lựa chọn nút", Type: "RadioButton" },
  { Title: "TSG-WF", Type: "SPLinkWF" },
  { Title: "Đường dẫn", Type: "Hyperlink" },
  { Title: "Đường dẫn hình ảnh", Type: "PictureLink" },
  { Title: "Nhãn", Type: "Label" },
  { Title: "Tổng", Type: "Sum" },
  { Title: "Trung bình cộng", Type: "Average" },
  { Title: "Phần trăm", Type: "Percent" },
];

const typeCalculation = {
  Addition: "+", // Phép cộng
  Subtraction: "-", // Phép trừ
  Multiplication: "*", // Phép nhân
  Division: "/", // Phép chia
};

const arrayTypeCalculation = [
  { Type: "+", Title: "Cộng" },
  { Type: "-", Title: "Trừ" },
  { Type: "*", Title: "Nhân" },
  { Type: "/", Title: "Chia" },
];

const typeCompare = {
  Eq: "=",
  Ne: "!=",
  Gt: ">",
  Lt: "<",
  Ge: ">=",
  Le: "<=",
};

const arrayTypeCompare = [
  { Type: "=", Title: "Bằng" },
  { Type: "!=", Title: "Khác" },
  { Type: ">", Title: "Lớn hơn" },
  { Type: "<", Title: "Nhỏ hơn" },
  { Type: ">=", Title: "Lớn hơn hoặc bằng" },
  { Type: "<=", Title: "Nhỏ hơn hoặc bằng" },
];

const objTypeRequest = {
  Save: 0,
  Approval: 1,
  Reject: 2,
  BackStep: 3,
  ReAssign: 4,
  Create: 5,
};

const objDataTransfer = {
  DataTransmitted: "DataTransmitted",
  DataReceived: "DataReceived",
  DataSynchronized: "DataSynchronized",
};

const arrayDataTransfer = [
  { Code: objDataTransfer.DataTransmitted, Title: "Cha truyền sang con" },
  { Code: objDataTransfer.DataReceived, Title: "Con truyền sang cha" },
  { Code: objDataTransfer.DataSynchronized, Title: "Đồng bộ dữ liệu" },
];

const arrayTimeInWorks = [
  { TimeStart: 8, TimeEnd: 12 },
  { TimeStart: 13, TimeEnd: 17 },
];

const objDayWeekend = {
  Sunday: 0,
  Saturday: 6,
};

const ObjTitleColumns = {
  VotesCreated: [
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
      FieldName: "WorkflowTitle",
      FieldTitle: "Quy trình",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "UserCreated",
      FieldTitle: "Người tạo",
      isSort: false,
      isLabelSort: true,
    },
    {
      FieldName: "IndexStepTitle",
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
    {
      FieldName: "WFTableSLA",
      FieldTitle: "SLA quy trình",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "RealisticSLA",
      FieldTitle: "SLA thực tế",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "ResultSLA",
      FieldTitle: "Kết quả SLA",
      isSort: false,
      isLabelSort: false,
    },
  ],
  VotesProcessed: [
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
      FieldName: "WorkflowTitle",
      FieldTitle: "Quy trình",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "UserProcessed",
      FieldTitle: "Người xử lý",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "IndexStepTitle",
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
    {
      FieldName: "WFTableSLA",
      FieldTitle: "SLA quy trình",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "RealisticSLA",
      FieldTitle: "SLA thực tế",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "ResultSLA",
      FieldTitle: "Kết quả SLA",
      isSort: false,
      isLabelSort: false,
    },
  ],
  VotesWaiting: [
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
      FieldName: "WorkflowTitle",
      FieldTitle: "Quy trình",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "UserApproval",
      FieldTitle: "Người xử lý",
      isSort: false,
      isLabelSort: true,
    },
    {
      FieldName: "IndexStepTitle",
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
    {
      FieldName: "WFTableSLA",
      FieldTitle: "SLA quy trình",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "RealisticSLA",
      FieldTitle: "SLA thực tế",
      isSort: false,
      isLabelSort: false,
    },
    {
      FieldName: "ResultSLA",
      FieldTitle: "Kết quả SLA",
      isSort: false,
      isLabelSort: false,
    },
  ],
};

export {
  objField,
  arrayObjField,
  typeCalculation,
  arrayTypeCalculation,
  typeCompare,
  arrayTypeCompare,
  objDataTransfer,
  arrayDataTransfer,
  arrayTimeInWorks,
  ObjTitleColumns,
  objDayWeekend,
};
