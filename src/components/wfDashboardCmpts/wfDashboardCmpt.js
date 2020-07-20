import React, { Fragment } from "react";
import { Grid } from "@material-ui/core";

import { config } from "./../../pages/environment.js";
import HumanResource from "components/Containers/HumanResources";
import Admin from "components/Containers/Administration";
import FinanceAccounting from "components/Containers/FinanceAccountings";
import HomeDashboard from "./HomeDashboard";
import ReportDashboard from "./ReportDashboard";
import "./style.scss";

const DashboardFeatured = ({ TypePages }) => {
  console.log(TypePages);
  return (
    <Fragment>
      {TypePages == "isReportDashboard" ? (
        <ReportDashboard />
      ) : (
        <HomeDashboard />
      )}
    </Fragment>
  );
};
export default DashboardFeatured;
