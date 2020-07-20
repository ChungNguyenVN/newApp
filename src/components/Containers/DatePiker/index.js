import React, { Fragment, useState } from "react";
import { KeyboardDatePicker, MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import Card from 'components/Card';
import { Grid, } from '@material-ui/core'


const DatePickerForm = (props) => {
    const [selectedDate, handleDateChange] = useState(new Date());

    return (
        <Fragment>
            <Grid container spacing={3}>
            <Grid item xl={12} xs={12}>
                    <Card
                        className="datePickerWrapper"
                        title="date picker"
                    >
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <Grid container spacing={3}>
                                <Grid item md={6} xs={12}>
                                    <KeyboardDatePicker
                                        fullWidth
                                        value={selectedDate}
                                        placeholder="10/10/2018"
                                        inputVariant="outlined"
                                        onChange={date => handleDateChange(date)}
                                        minDate={new Date()}
                                        format="MM-DD-YYYY"
                                        InputAdornmentProps={{ position: "end" }}
                                        className="datePicker"
                                    />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    <KeyboardDatePicker
                                        fullWidth
                                        value={selectedDate}
                                        inputVariant="outlined"
                                        placeholder="10/10/2018"
                                        onChange={date => handleDateChange(date)}
                                        minDate={new Date()}
                                        format="MM-DD-YYYY"
                                        InputAdornmentProps={{ position: "end" }}
                                        className="datePicker"
                                        autoOk={true}
                                    />
                                </Grid>
                            </Grid>
                        </MuiPickersUtilsProvider>
                    </Card>
                </Grid>
            </Grid>
        </Fragment>
    );      

}
export default DatePickerForm;