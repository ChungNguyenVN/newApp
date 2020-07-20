import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card,CardHeader, CardTitle, CardBody } from "reactstrap";
class PieChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [44, 55, 41, 17, 15],
            options : {
                labels: ["Đang chờ duyệt", "Đã hoàn thành", "Đã trả về", "Chưa đệ trình", "Đã hủy"],
                colors: ["#34c38f", "#556ee6","#f46a6a", "#50a5f1", "#f1b44c"],
                legend: {
                    show: true,
                    position: 'bottom',
                    horizontalAlign: 'center',
                    verticalAlign: 'middle',
                    floating: false,
                    fontSize: '14px',
                    offsetX: 0,
                    offsetY: -10
                },
                responsive: [{
                    breakpoint: 600,
                    options: {
                        chart: {
                            height: 240
                        },
                        legend: {
                            show: false
                        },
                    }
                }]
              
              }
        }
    }
    render() {
        return (
            <React.Fragment>
                <Card>
                    <CardHeader className="bg-transparent">
                       
                       <h5 className="my-2">Thống kê yêu cầu đã tạo </h5>
                   </CardHeader>
                    <CardBody>
                        <CardTitle className="mb-4"></CardTitle>
                        <ReactApexChart options={this.state.options} series={this.state.series} type="pie" height="380" />
                    </CardBody>
                </Card>
                
            </React.Fragment>
        );
    }
}

export default PieChart;