import React, { Fragment } from "react";
import Card from "@material-ui/core/Card";
import { Grid } from "@material-ui/core";
import ScrollArea from "react-scrollbar";
import { config } from "./../../../pages/environment.js";

import "../../wfDashboardCmpts/style.scss";

const adminList = [
  {
    id: 1,
    icon: 1,
    title: "Yêu cầu đặt phòng",
    p_title: "Quy trình đặt phòng",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=14&WFTableCode=ListBookRoom&indexStep=1",
    classIcon: "smp",
  },

  {
    id: 2,
    icon: 2,
    title: "Yêu cầu đặt xe",
    p_title: "Quy trình đặt xe",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=15&WFTableCode=ListCarRequests&indexStep=1",
    classIcon: "pmp",
  },
  {
    id: 3,
    icon: 3,
    title: "Yêu cầu mua hàng",
    p_title: "Quy trình yêu cầu mua hàng của nhân viên",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=10&WFTableCode=PurchaseRequest&indexStep=1",
    classIcon: "cb",
  },
  {
    id: 4,
    icon: 4,
    title: "Quy trình mua hàng",
    p_title: "Quy trình mua hàng",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=7&WFTableCode=ListPurchase&indexStep=1",
    classIcon: "tmp",
  },
  {
    id: 5,
    icon: 5,
    title: "Yêu cầu báo hỏng, bảo hành",
    p_title: "Quy trình báo hỏng, bảo hành của nhân viên",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=6&WFTableCode=ListGuarantee&indexStep=1",
    classIcon: "stp",
  },
  {
    id: 6,
    icon: 6,
    title: "Quy trình thanh lý tài sản",
    p_title: "Quy trình thanh lý tài sản",
    linkHrefWF:
      "https://tsgvietnam-a94f81251ac09e.sharepoint.com/sites/tsgapp/TSG_BPM_HR/TSG_BPM_APPS_V1_1_0/Pages/wfRequestAddNews/wfRequestAddNew.aspx?WFTableId=8&WFTableCode=ListAssetLiquidation&indexStep=1",
    classIcon: "sts",
  },
];

const Admin = () => {
  return (
    <Card title="Aministration" className="p-0">
      <Grid className="monitoringCard">
        <Grid className="mcContent2">
          <div className="fricon4">
            <img src={config.productImges.iconAdminitration} alt="icon" />
          </div>
          <div className="mc-text">
            <h3>Hành Chính</h3>
            <p>Quản lý hành chính</p>
          </div>
        </Grid>
      </Grid>
      <Grid className="UeventList">
        <ScrollArea>
          {adminList.map((item, i) => {
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
export default Admin;
