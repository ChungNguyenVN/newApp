import React, { Fragment, Component } from "react";
import Card from "@material-ui/core/Card";
import { Grid } from "@material-ui/core";
import ScrollArea from "react-scrollbar";
import { config } from "./../../../pages/environment.js";

import "../../wfDashboardCmpts/style.scss";

const humanList = [
  {
    id: 1,
    icon: 1,
    title: "Kế hoạch tuyển dụng",
    p_title: "Quy trình lập kế hoạch tuyển dụng cho các phòng ban",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=2&WFTableCode=RecruitmentPlan&indexStep=1",
    classIcon: "smp",
  },

  {
    id: 2,
    icon: 2,
    title: "Quy trình tuyển dụng",
    p_title: "Quy trình tuyển dụng",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=9&WFTableCode=Recruitment&indexStep=1",
    classIcon: "pmp",
  },
  {
    id: 3,
    icon: 3,
    title: "Quy trình nhân viên mới",
    p_title:
      "Quy trình yêu cầu cấp thiết bị, cấp email, tài khoản CRM cho nhân viên mới",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=5&WFTableCode=ListEmployees&indexStep=1",
    classIcon: "cb",
  },
  {
    id: 4,
    icon: 4,
    title: "Đánh giá thử việc",
    p_title: "Quy trình đánh giá thử việc cho các nhân viên thử việc",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=1&WFTableCode=ListRatingIntern&indexStep=1",
    classIcon: "tmp",
  },
  {
    id: 5,
    icon: 5,
    title: "Xin Nghỉ Phép",
    p_title: "Quy trình xin nghỉ phép của nhân viên",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=4&WFTableCode=LeaveofAbsence&indexStep=1",
    classIcon: "stp",
  },

  {
    id: 6,
    icon: 6,
    title: "Yêu cầu làm thêm giờ",
    p_title: "Quy trình làm thêm giờ của nhân viên",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=3&WFTableCode=ListOverTime&indexStep=1",
    classIcon: "sts",
  },
  {
    id: 7,
    icon: 7,
    title: "Yêu Cầu Làm Việc Ngoài",
    p_title: "Quy trình làm việc ngoài của nhân viên",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=13&WFTableCode=ListOnsite&indexStep=1",
    classIcon: "smp",
  },
  {
    id: 8,
    icon: 8,
    title: "Yêu cầu cải tiến ý tưởng",
    p_title: "Quy trình cải tiến ý tưởng của nhân viên",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=18&WFTableCode=ListIdea&indexStep=1",
    classIcon: "pmp",
  },
  {
    id: 9,
    icon: 9,
    title: "Xin nghỉ việc",
    p_title: "Quy trình xin nghỉ việc của nhân viên",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=16&WFTableCode=ListOutboarding&indexStep=1",
    classIcon: "cb",
  },
];

const HumanResource = () => {
  return (
    <Card title="Nhân sự" className="p-0">
      <Grid className="monitoringCard">
        <Grid className="mcContent2">
          <div className="fricon3">
            <img src={config.productImges.iconHumanResource} alt="icon" />
          </div>
          <div className="mc-text">
            <h3>Nhân sự</h3>
            <p>Quản lý Nhân Sự</p>
          </div>
        </Grid>
      </Grid>
      <Grid className="UeventList">
        <ScrollArea>
          {humanList.map((item, i) => {
            return (
              <Grid className="UeventItem" key={i}>
                <Grid className="UeventLeft">
                  <div className={item.classIcon}>
                    <div className="Uevent-img">
                      <span>{item.icon}</span>
                    </div>
                  </div>
                  <div className="Uevent-content">
                    <h4>
                      <a
                        href={
                          item.linkHrefWF != ""
                            ? item.linkHrefWF
                            : config.pages.wfDashboard
                        }
                      >
                        {item.title}
                      </a>
                    </h4>
                    <p>{item.p_title}</p>
                  </div>
                </Grid>
              </Grid>
            );
          })}
        </ScrollArea>
      </Grid>
    </Card>
  );
};
export default HumanResource;
