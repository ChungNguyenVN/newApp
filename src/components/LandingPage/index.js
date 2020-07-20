import React, { Component } from 'react';
import { Container } from "reactstrap";

// //Import Breadcrumb
// import Breadcrumbs from '../Breadcrumb/Breadcrumb';
import Layout from '../VerticalLayout/index'
// import NonAuthLayout from "./components/NonAuthLayout";
class LandingPage extends Component {
    render() {
        return (
            <React.Fragment>
                <Layout></Layout>
            </React.Fragment>
        );
    }
}

export default LandingPage;