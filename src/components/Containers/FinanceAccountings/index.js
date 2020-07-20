import React, { Fragment } from "react";
import Card from "@material-ui/core/Card";
import { Grid } from "@material-ui/core";
import ScrollArea from "react-scrollbar";
import { config } from "../../../pages/environment.js";

import "../../wfDashboardCmpts/style.scss";

const financeList = [
  {
    id: 1,
    icon: 1,
    title: "Lập kế hoạch ngân sách",
    p_title: "Quy trình lập kế hoạch ngân sách của các phòng ban",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=11&WFTableCode=ListBudgetPlan&indexStep=1",
    classIcon: "smp",
  },

  {
    id: 2,
    icon: 2,
    title: "Yêu cầu thanh toán",
    p_title: "Qui trình yêu cầu thanh toán",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=12&WFTableCode=ListPayment&indexStep=1",
    classIcon: "pmp",
  },
];

const FinanceAccounting = () => {
  return (
    <Card title="Tài chính kế toán" className="p-0">
      <Grid className="monitoringCard">
        <Grid className="mcContent2">
          <div className="fricon1">
            <img src={config.productImges.iconFinanceAccounting} alt="icon" />
          </div>
          <div className="mc-text">
            <h3>Tài chính kế toán</h3>
            <p>Quản lý tài chính</p>
          </div>
        </Grid>
      </Grid>
      <Grid className="UeventList">
        <ScrollArea>
          {financeList.map((item, i) => {
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
export default FinanceAccounting;
