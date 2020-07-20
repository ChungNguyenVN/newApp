import React, { Component } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardHeader, CardBody, CardTitle, CardSubtitle } from "reactstrap";

//Import Breadcrumb
// import Breadcrumbs from '../../components/Common/Breadcrumb';
import "./datatables.scss";

class DatatableTables extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

    const data = {
        columns: [
            {
                label: "#",
                field: "index",
                sort: "asc",
                width: 50
            },
            {
                label: "Tiêu đề",
                field: "title",
                sort: "asc",
                width: 150
            },
            {
                label: "Quy trình",
                field: "wf",
                width: 120
            },
            {
                label: "Người tạo",
                field: "creator",
                sort: "asc",
                width: 170
            },
            {
                label: "Bước hiện tại",
                field: "step",
                width: 120
            },
            {
                label: "Trạng thái",
                field: "status",
                sort: "asc",
                width: 120
                },
            {
                label: "Ngày yêu cầu",
                field: "date",
                sort: "asc",
                width: 150
            },
            {
                label: "SLA quy trình",
                field: "SLAWf",
                width: 100
            },
            {
                label: "SLA Thực tế",
                field: "SLA",
                width: 100
            },
            {
                label: "Kết quả SLA",
                field: "SLAResult",
                width: 100
            }
        ],
        rows: [
            {
                index: "255",
                title: "Quy trình tổng-Sum002",
                creator: "Demo Account",
                step: "Step003",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "2",
                SLA: "0.05",
                SLAResult: "Đạt"
            },
            {
                index: "155",
                title: "Quy trình-Sum002",
                creator: "Demo",
                step: "Step004",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "1",
                SLA: "0.02",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "125",
                title: "Sum002",
                creator: "Hai Nguyen",
                step: "Step1",
                status: "Đang xử lý",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Hết hạn"
            },
            {
                index: "1425",
                title: "Sum002",
                creator: "Cuong Nguyen",
                step: "Step3",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Đạt"
            },
            {
                index: "1425",
                title: "Sum9",
                creator: "Tuyen Nguyen",
                step: "Step3",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "9",
                SLA: "0.078",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "255",
                title: "Quy trình tổng-Sum002",
                creator: "Demo Account",
                step: "Step003",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "2",
                SLA: "0.05",
                SLAResult: "Đạt"
            },
            {
                index: "155",
                title: "Quy trình-Sum002",
                creator: "Demo",
                step: "Step004",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "1",
                SLA: "0.02",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "125",
                title: "Sum002",
                creator: "Hai Nguyen",
                step: "Step1",
                status: "Đang xử lý",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Hết hạn"
            },
            {
                index: "1425",
                title: "Sum002",
                creator: "Cuong Nguyen",
                step: "Step3",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Đạt"
            },
            {
                index: "1425",
                title: "Sum9",
                creator: "Tuyen Nguyen",
                step: "Step3",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "9",
                SLA: "0.078",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "255",
                title: "Quy trình tổng-Sum002",
                creator: "Demo Account",
                step: "Step003",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "2",
                SLA: "0.05",
                SLAResult: "Đạt"
            },
            {
                index: "155",
                title: "Quy trình-Sum002",
                creator: "Demo",
                step: "Step004",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "1",
                SLA: "0.02",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "125",
                title: "Sum002",
                creator: "Hai Nguyen",
                step: "Step1",
                status: "Đang xử lý",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Hết hạn"
            },
            {
                index: "1425",
                title: "Sum002",
                creator: "Cuong Nguyen",
                step: "Step3",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Đạt"
            },
            {
                index: "1425",
                title: "Sum9",
                creator: "Tuyen Nguyen",
                step: "Step3",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "9",
                SLA: "0.078",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "255",
                title: "Quy trình tổng-Sum002",
                creator: "Demo Account",
                step: "Step003",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "2",
                SLA: "0.05",
                SLAResult: "Đạt"
            },
            {
                index: "155",
                title: "Quy trình-Sum002",
                creator: "Demo",
                step: "Step004",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "1",
                SLA: "0.02",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "125",
                title: "Sum002",
                creator: "Hai Nguyen",
                step: "Step1",
                status: "Đang xử lý",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Hết hạn"
            },
            {
                index: "1425",
                title: "Sum002",
                creator: "Cuong Nguyen",
                step: "Step3",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Đạt"
            },
            {
                index: "1425",
                title: "Sum9",
                creator: "Tuyen Nguyen",
                step: "Step3",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "9",
                SLA: "0.078",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "255",
                title: "Quy trình tổng-Sum002",
                creator: "Demo Account",
                step: "Step003",
                status: "Hoàn thành",
                date: "2011/04/25",
                SLAWf: "2",
                SLA: "0.05",
                SLAResult: "Đạt"
            },
            {
                index: "155",
                title: "Quy trình-Sum002",
                creator: "Demo",
                step: "Step004",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "1",
                SLA: "0.02",
                SLAResult: "Chưa tính SLA"
            },
            {
                index: "125",
                title: "Sum002",
                creator: "Hai Nguyen",
                step: "Step1",
                status: "Đang xử lý",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Hết hạn"
            },
            {
                index: "1425",
                title: "Sum002",
                creator: "Cuong Nguyen",
                step: "Step3",
                status: "Đã lưu",
                date: "2011/04/25",
                SLAWf: "3",
                SLA: "0.01",
                SLAResult: "Đạt"
            },
            {
                index: "1425",
                title: "Sum9",
                creator: "Tuyen Nguyen",
                step: "Step3",
                status: "Hoàn thành",
                icon : "fa fa-check-square-o font-size-24 pr-0",
                date: "2011/04/25",
                SLAWf: "9",
                SLA: "0.078",
                SLAResult: "Chưa tính SLA"
            },
        ]
    };
    return (
        <React.Fragment>
            <Card>
                <CardHeader className="bg-transparent">
                    <h5 className="my-2">Danh sách báo cáo </h5>
                </CardHeader>
                <CardBody>
                    <MDBDataTable responsive bordered data={data} />
                </CardBody>
            </Card>
        </React.Fragment>
    );
  }
}

export default DatatableTables;
