import React from "react";
import { Grid } from "@material-ui/core";
import Card from "components/Card";
import { config } from "./../../../pages/environment.js";
import HumanResource from "components/Containers/HumanResources";
import Admin from "components/Containers/Administration";
import FinanceAccounting from "components/Containers/FinanceAccountings";

import "./../style.scss";

const HomeDashboard = () => {
  return (
    <Grid container>
      <Card className="formInput">
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <HumanResource />
          </Grid>
          <Grid item lg={4} xs={12}>
            <Admin />
          </Grid>
          <Grid item lg={4} xs={12}>
            <FinanceAccounting />
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
};
export default HomeDashboard;
