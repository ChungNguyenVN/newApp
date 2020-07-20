import React, { Component } from "react";
import { config } from "./../../../pages/environment.js";
import * as moment from "moment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  makeRandomColor,
  loadReportStepSLA,
} from "components/wfShareCmpts/wfShareFunction.js";
import Card from "components/Card";
import { Grid } from "@material-ui/core";

import "components/Containers/FormAddNew/formStyle.scss";
import { Pie } from "react-chartjs-2";
import shareService from "components/wfShareCmpts/wfShareService.js";
import DropdownTreeSelect from "react-dropdown-tree-select";
import "components/Containers/FormAddNew/formStyle.scss";
export default class ReportDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ReportRequest: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      },
      ReportSLA: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      },
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.currentUser = undefined;
    this.wfTable = [];
    this.wfStepTable = [];
  }

  async componentDidMount() {
    this.setStateForm();
  }

  async setStateForm() {
    this.currentUser = await sp.web.currentUser();
    // console.log(this.currentUser);

    this.wfTable = await shareService.GetArrayWFTable();
    // console.log(this.wfTable);

    this.wfStepTable = await shareService.GetArrayWFStepTable();
    // console.log(this.wfTable);

    this.SearchRequest();
    this.SearchSLA();
  }

  async SearchRequest() {
    let listSearch = await this.SearchReportRequest();

    let arrCheckR = [];
    listSearch.map((itemsearch) => {
      if (arrCheckR.length > 0) {
        let rr = arrCheckR.findIndex(
          (rs) => rs.Title == itemsearch.wfTableTitle
        );
        if (rr != -1) {
          arrCheckR[rr].numR += 1;
        } else {
          arrCheckR.push({
            Title: itemsearch.wfTableTitle,
            numR: 1,
          });
        }
      } else {
        arrCheckR.push({
          Title: itemsearch.wfTableTitle,
          numR: 1,
        });
      }
    });
    console.log(arrCheckR);

    let data = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
        },
      ],
    };
    arrCheckR.map((checkD) => {
      data.labels.push(checkD.Title);
      data.datasets[0].data.push(checkD.numR);
      let color = makeRandomColor();
      data.datasets[0].backgroundColor.push(color);
    });
    console.log(data);
    this.setState({
      ReportRequest: data,
    });
  }

  async SearchSLA() {
    let listSearch = await this.SearchReportSLA();

    if (listSearch.length > 0) {
      let dataDat = 0;
      let dataNotDat = 0;
      listSearch.map((itemsearch) => {
        if (itemsearch.HistoryStep.length > 0) {
          let arrayWFSTep = this.wfStepTable.filter(
            (wfStep) => wfStep.WFTableId == itemsearch.WFTableId
          );
          let historyStep = itemsearch.HistoryStep.find(
            (hs) => hs.UserApproval.UserId == this.currentUser.Id
          );
          if (isNotNull(historyStep)) {
            let resutHistory = loadReportStepSLA(historyStep, arrayWFSTep);
            if (resutHistory.SLA >= resutHistory.RealisticSLA) {
              dataDat += 1;
            } else {
              dataNotDat += 1;
            }
          } else {
            dataNotDat += 1;
          }
        } else {
          dataDat += 1;
        }
      });

      let data = {
        labels: ["Đạt", "Không Đạt"],
        datasets: [
          {
            data: [dataDat, dataNotDat],
            backgroundColor: ["green", "red"],
          },
        ],
      };
      console.log(data);
      this.setState({ ReportSLA: data });
    }
  }

  async SearchReportRequest() {
    let items = [];
    let dataHistory = await sp.web.lists
      .getByTitle("WFHistory")
      .items.select("ID,Title,WFTableId,ItemIndex")
      .filter("UserCreated/ID eq " + this.currentUser.Id)
      .top(100)
      .getPaged();

    dataHistory["results"].forEach((element) => {
      let TypeRequest = this.wfTable.find((x) => x.WFId == element.WFTableId);
      items.push({
        ID: element.ID,
        ItemIndex: element.ItemIndex,
        Title: CheckNull(element.Title),
        wfTableTitle: isNotNull(TypeRequest) ? TypeRequest.WFTitle : "",
      });
    });

    if (dataHistory.hasNext) {
      let nextArray = await this.SearchNextReportRequest(dataHistory, []);
      items = items.concat(nextArray);
    }

    // console.log(items);
    return items;
  }

  async SearchNextReportRequest(dataHistory, array) {
    let dataHistoryNext = await dataHistory.getNext();
    dataHistoryNext["results"].forEach((element) => {
      let TypeRequest = this.wfTable.find((x) => x.WFId == element.WFTableId);

      array.push({
        ID: element.ID,
        ItemIndex: element.ItemIndex,
        Title: CheckNull(element.Title),
        wfTableTitle: isNotNull(TypeRequest) ? TypeRequest.WFTitle : "",
      });
    });

    if (dataHistoryNext.hasNext) {
      await this.SearchNextReportRequest(dataHistoryNext, array);
    }

    return array;
  }

  async SearchReportSLA() {
    let items = [];
    let dataHistory = await sp.web.lists
      .getByTitle("WFHistory")
      .items.select("ID,Title,WFTableId,ItemIndex,indexStep,HistoryStep")
      .filter(
        "StatusRequest eq 1 and HistoryApprover/ID eq " + this.currentUser.Id
      )
      .top(100)
      .getPaged();

    dataHistory["results"].forEach((element) => {
      let historyStep = [];
      if (isNotNull(element.HistoryStep)) {
        historyStep = JSON.parse(element.HistoryStep);
      }
      items.push({
        ID: element.ID,
        ItemIndex: element.ItemIndex,
        Title: CheckNull(element.Title),
        indexStep: CheckNullSetZero(element.indexStep),
        HistoryStep: historyStep,
        WFTableId: CheckNullSetZero(element.WFTableId),
      });
    });

    if (dataHistory.hasNext) {
      console.log(dataHistory);
      let nextArray = await this.SearchNextReportSLA(dataHistory, []);
      items = items.concat(nextArray);
    }

    // console.log(items);
    return items;
  }

  async SearchNextReportSLA(dataHistory, array) {
    console.log(dataHistory);
    let dataHistoryNext = await dataHistory.getNext();
    dataHistoryNext["results"].forEach((element) => {
      let historyStep = [];
      if (isNotNull(element.HistoryStep)) {
        historyStep = JSON.parse(element.HistoryStep);
      }
      array.push({
        ID: element.ID,
        ItemIndex: element.ItemIndex,
        Title: CheckNull(element.Title),
        indexStep: CheckNullSetZero(element.indexStep),
        HistoryStep: historyStep,
        WFTableId: CheckNullSetZero(element.WFTableId),
      });
    });

    if (dataHistoryNext.hasNext) {
      await this.SearchNextReportSLA(dataHistoryNext, array);
    }

    return array;
  }

  render() {
    const { ReportRequest, ReportSLA } = this.state;
    const options = {
      legend: {
        position: "right",
      },
    };
    return (
      <Grid container>
        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={8} xs={12}>
              <h3>Thống kê yêu cầu</h3>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item sm={9} xs={12}>
              {ReportRequest.labels.length > 0 ? (
                <Pie data={ReportRequest} options={options} />
              ) : (
                ""
              )}
            </Grid>
          </Grid>
        </Card>
        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={8} xs={12}>
              <h3>Báo cáo SLA</h3>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item sm={8} xs={12}>
              {ReportSLA.labels.length > 0 ? (
                <Pie data={ReportSLA} options={options} />
              ) : (
                ""
              )}
            </Grid>
          </Grid>
        </Card>
      </Grid>
    );
  }
}
