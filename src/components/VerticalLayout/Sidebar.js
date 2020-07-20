import React, { Component } from "react";

import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
//import { } from "../../store/actions";

//Simple bar
import SimpleBar from "simplebar-react";

//i18n
import { withNamespaces } from 'react-i18next';
import SidebarContent from "./SidebarContent";


class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    
   

    render() {
        console.log(this.props.showMenu);
        return (
            <React.Fragment>
                {/* {this.props.showMenu && */}
                    <div className={this.props.showMenu ? 'sidebar-enable' : 'vertical-collpsed'}>
                        <div className="vertical-menu">
                    
                            <div data-simplebar className="h-100">
                                <SimpleBar style={{ maxHeight: "100%" }}>
                                    <SidebarContent />
                                </SimpleBar>
                            </div>

                        </div>
                    </div>
                    
                {/* } */}
            </React.Fragment>
        );
    }
}


export default Sidebar;
