
import React, { Component } from 'react';
import Card from 'components/Card';
import { Grid} from '@material-ui/core';
import './../Containers/FormAddNew/formStyle.scss';

export default class LicenseBPM extends Component {
  render() {
    return (
      <Grid container>
        <Card className="formInput">
          <Grid container alignItems="flex-end" className="mb-30">
            <Grid item sm={8} xs={12} md={6} xl={8}>
              <h3>Từ chối truy cập</h3>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item sm={6} xs={12}>
            <label className="form-label">Chi tiết:</label>
            <p>Rất tiếc phần mềm của bạn đã hết hạn dùng thử. <br/> Vui lòng liên hệ với nhà cung cấp dịch vụ đề biết thêm chi tiết.</p>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    );
  }
}