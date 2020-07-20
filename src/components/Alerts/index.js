import React, { Fragment } from 'react';
// import { connect } from 'react-redux';
// import { Helmet } from 'react-helmet';
// import { FormattedMessage } from 'react-intl';
import Card from 'components/Card';
import { Alert, UncontrolledAlert } from 'reactstrap';
import { Grid } from '@material-ui/core';
// import { compose } from 'redux';
// import messages from './messages';

import './alerts.scss';

const messagesAlerts = [
    {
        titleAlert: 'Thêm tập tin thành công', 
        classBackground: "bg-info"
    },
    {
        titleAlert: 'Lưu thành công', 
        classBackground: "bg-success"
    },
    {
        titleAlert: 'Xóa thành công', 
        classBackground: "bg-success"
    },
    {
        titleAlert: 'Cảnh báo', 
        classBackground: "bg-warning"
    },
    {
        titleAlert: 'Không thành công', 
        classBackground: "bg-danger"
    }
]

const Alerts = () => {
    
    return (
        <Fragment>
            <Grid container spacing={3}>
                <Grid item lg={6} xs={12}>
                    <Card title="Alerts Default">
                        <Alert className="bg-default">
                            This is a default alert — check it out!
                        </Alert>
                        <Alert className="bg-primary">
                            This is a primary alert — check it out!
                        </Alert>
                        <Alert className="bg-secondary">
                            This is a secondary alert — check it out!
                        </Alert>
                        <Alert className="bg-success">
                            This is a success alert — check it out!
                        </Alert>
                        <Alert className="bg-danger">
                            This is a danger alert — check it out!
                        </Alert>
                        <Alert className="bg-warning">
                            This is a warning alert — check it out!
                        </Alert>
                        <Alert className="bg-info">
                            This is a info alert — check it out!
                        </Alert>
                        <Alert className="bg-light text-dark">
                            This is a light alert — check it out!
                        </Alert>
                        <Alert className="bg-dark">
                            This is a dark alert — check it out!
                        </Alert>
                    </Card>
                </Grid>
                <Grid item lg={6} xs={12}>
                    <Card title="Alerts">
                        {messagesAlerts.map((itemAlert, keyAlert) => (
                            <UncontrolledAlert key={keyAlert} color="primary" className={itemAlert.classBackground}>
                                {itemAlert.titleAlert}
                            </UncontrolledAlert>
                        ))}
                        {/* <UncontrolledAlert color="primary" className="bg-primary">
                            This is a primary alert — check it out!
                        </UncontrolledAlert>
                        <UncontrolledAlert color="secondary" className="bg-secondary">
                            This is a secondary alert — check it out!
                        </UncontrolledAlert>
                        <UncontrolledAlert color="success" className="bg-success">
                            This is a success alert — check it out!
                        </UncontrolledAlert>
                        <UncontrolledAlert color="danger" className="bg-danger">
                            This is a danger alert — check it out!
                        </UncontrolledAlert>
                        <UncontrolledAlert color="warning" className="bg-warning">
                            This is a warning alert — check it out!
                        </UncontrolledAlert>
                        <UncontrolledAlert color="info" className="bg-info">
                            This is a info alert — check it out!
                        </UncontrolledAlert>
                        <UncontrolledAlert color="light" className="bg-light text-dark">
                            This is a light alert — check it out!
                        </UncontrolledAlert>
                        <UncontrolledAlert color="dark" className="bg-dark">
                            This is a dark alert — check it out!
                        </UncontrolledAlert> */}
                    </Card>
                </Grid>
            </Grid>
        </Fragment>
    );
}
export default (Alerts);