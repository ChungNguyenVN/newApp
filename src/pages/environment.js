import ilogo from "../components/common/assets/images/bpmLogo.png";
import iDashboard from "../components/common/assets/images/icons/sidebar/dashboard/ana.svg";
import iCreate from "../components/common/assets/images/icons/sidebar/dashboard/crt.svg";
import iMyRequest from "../components/common/assets/images/icons/sidebar/form.svg";
import iExecution from "../components/common/assets/images/icons/sidebar/dashboard/map.svg";
import iHistory from "../components/common/assets/images/icons/sidebar/dashboard/ui.svg";
import iReport from "../components/common/assets/images/icons/sidebar/dashboard/ch.svg";
import iAvatar from "../components/common/assets/images/avatar.png";
import iEmail from "../components/common/assets/images/icons/mail.svg";
import iNotification from "../components/common/assets/images/icons/notification.svg";
import iFullScreen from "../components/common/assets/images/icons/full-screen.svg";

import iFinanceAccounting from "../components/common/assets/images/icons/dashboard/accounting.svg";
import iHumanResource from "../components/common/assets/images/icons/dashboard/employment.svg";
import iAdmin from "../components/common/assets/images/icons/dashboard/admin.svg";

// sites/tsgapp/TSG_BPM
// sites/dev/DevTeam_WF
// sites/dev/BMPRelease
// const baseSite = {
//   hostUrl : window["base-url"] + '/sites/dev/DevTeam_WF',
//   AppPage : "/TSG_BPM_APPS/Pages"
// }

const baseSite = {
  hostUrl: window["base-url"] + "/sites/dev/DevTeam_WF",
  AppPage: "/AppLibraries/BPM/BPM_APPs",
};

const prod = {
  url: {
    API_URL: baseSite.hostUrl,
  },
  pages: {
    link: baseSite.hostUrl + baseSite.AppPage,
    wfDashboard: baseSite.hostUrl + baseSite.AppPage + "/Default.aspx",
    wfRequestAddNew:
      baseSite.hostUrl +
      baseSite.AppPage +
      "/wfRequestAddNews/wfRequestAddNew.aspx",
    wfRequestView:
      baseSite.hostUrl +
      baseSite.AppPage +
      "/wfRequestViews/wfRequestView.aspx",
    wfRequestExecution:
      baseSite.hostUrl +
      baseSite.AppPage +
      "/wfRequestExecutions/wfRequestExecution.aspx",
    wfReport: baseSite.hostUrl + baseSite.AppPage + "/wfReports/wfReport.aspx",
    wfExecution:
      baseSite.hostUrl + baseSite.AppPage + "/wfExecutions/wfExecution.aspx",
    wfMyRequest:
      baseSite.hostUrl + baseSite.AppPage + "/wfMyRequests/wfMyRequest.aspx",
    wfHistoryApprove:
      baseSite.hostUrl +
      baseSite.AppPage +
      "/wfHistoryApproves/wfHistoryApprove.aspx",
  },
  productImges: {
    iconlogo: baseSite.hostUrl + baseSite.AppPage + ilogo,
    iconDashboard: baseSite.hostUrl + baseSite.AppPage + iDashboard,
    iconCreate: baseSite.hostUrl + baseSite.AppPage + iCreate,
    iconMyRequest: baseSite.hostUrl + baseSite.AppPage + iMyRequest,
    iconExecution: baseSite.hostUrl + baseSite.AppPage + iExecution,
    iconHistory: baseSite.hostUrl + baseSite.AppPage + iHistory,
    iconReport: baseSite.hostUrl + baseSite.AppPage + iReport,
    iconAvatar: baseSite.hostUrl + baseSite.AppPage + iAvatar,
    iconEmail: baseSite.hostUrl + baseSite.AppPage + iEmail,
    iconNotification: baseSite.hostUrl + baseSite.AppPage + iNotification,
    iconFullScreen: baseSite.hostUrl + baseSite.AppPage + iFullScreen,
    iconFinanceAccounting:
      baseSite.hostUrl + baseSite.AppPage + iFinanceAccounting,
    iconHumanResource: baseSite.hostUrl + baseSite.AppPage + iHumanResource,
    iconAdminitration: baseSite.hostUrl + baseSite.AppPage + iAdmin,
  },
  license: {
    today: "2020-04-13",
    numberDay: 30,
    isLimited: false,
  },
};

const dev = {
  url: {
    API_URL: `http://localhost:8080`,
  },
  pages: {
    link: "http://localhost:3200",
    wfDashboard: "http://localhost:3200/index.html",
    wfRequestAddNew:
      "http://localhost:3200/wfRequestAddNews/wfRequestAddNew.html",
    wfRequestView: "http://localhost:3200/wfRequestViews/wfRequestView.html",
    wfRequestExecution:
      "http://localhost:3200/wfRequestExecutions/wfRequestExecution.html",
    wfReport: "http://localhost:3200/wfReports/wfReport.html",
    wfExecution: "http://localhost:3200/wfExecutions/wfExecution.html",
    wfMyRequest: "http://localhost:3200/wfMyRequests/wfMyRequest.html",
    wfHistoryApprove:
      "http://localhost:3200/wfHistoryApproves/wfHistoryApprove.html",
  },
  productImges: {
    iconlogo: ilogo,
    iconDashboard: iDashboard,
    iconCreate: iCreate,
    iconMyRequest: iMyRequest,
    iconExecution: iExecution,
    iconHistory: iHistory,
    iconReport: iReport,
    iconAvatar: iAvatar,
    iconEmail: iEmail,
    iconNotification: iNotification,
    iconFullScreen: iFullScreen,
    iconFinanceAccounting: iFinanceAccounting,
    iconHumanResource: iHumanResource,
    iconAdminitration: iAdmin,
  },
  license: {
    today: "2020-04-13",
    numberDay: 30,
    isLimited: false,
  },
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
