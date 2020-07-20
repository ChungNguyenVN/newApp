import React, { Component } from 'react';
import {  Row, Col, Card, CardBody, CardHeader, CardTitle, CardText, Input, Media, Collapse } from "reactstrap";

//Import Product Images
import img4 from "../../assets/images/product/img-4.png";
import img6 from "../../assets/images/product/img-6.png";
import img7 from "../../assets/images/product/img-7.png";
import img8 from "../../assets/images/product/img-8.png";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";

class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: [
                { id: 1, img: avatar2, name: "Trần Tùng", 
                    description: "Pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch.", 
                    date: "4 giờ trước" },
                { id: 2, img: avatar4, name: "Hà Nguyễn", description: "Pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid.", 
                    date: "07,07, 2020" },
                { id: 3, img: "Null", name: "Neal", description: "Everyone realizes why a new common language would be desirable.", date: "20, 6, 2020" },
            ],
            isComment: true
        }
        this.showComment = this.showComment.bind(this);
    }

    showComment() {
        this.setState(
            {
                isComment: !this.state.isComment
            }
        );
    }

    render(){
        return (
            <React.Fragment>
                <Card>
                    
                    <CardHeader className="bg-transparent">
                        <h5 className="my-2"><i className="fa fa-comments-o  mr-2 align-middle" ></i>Bình luận</h5>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <div className="col-lg-12 mb-3">
                                <Card outline color="info" className="border">
                                    <CardBody>
                                        <CardTitle className="mb-3" onClick={ this.showComment}>
                                            Các bình luận <span className={ 'float-right ' + (this.state.isComment ? 'fa fa-chevron-up' : 'fa fa-chevron-down') } >
                                        </span>
                                        </CardTitle>

                                        <Collapse isOpen = { this.state.isComment }>
                                            { this.state.comments.map((comment, k) =>
                                                <Media className={comment.id === 1 ? "border-bottom" : "border-bottom mt-3"} key={"__media__" + k}>
                                                    {
                                                        comment.img !== "Null" ?
                                                            <img src={comment.img} className="avatar-xs mr-3 rounded-circle" alt="img" />
                                                            :   <div className="avatar-xs mr-3">
                                                                    <span className="avatar-title bg-soft-primary text-primary rounded-circle font-size-16">
                                                                        N
                                                                    </span>
                                                                </div>
                                                    }
                                                    <Media body className="pb-3">
                                                        <h5 className="mt-0 mb-1 font-size-15">{comment.name}</h5>
                                                        <p className="text-muted">{comment.description}</p>
                                                        <ul className="list-inline float-sm-right">
                                                            <li className="list-inline-item">
                                                                <a href="#"><i className="fa fa-thumbs-up mr-1"></i> Thích</a>
                                                            </li>
                                                            <li className="list-inline-item">
                                                                <a href="#"><i className="fa fa-commenting-o mr-1"></i> Bình luận</a>
                                                            </li>
                                                        </ul>
                                                        <div className="text-muted font-size-12"><i className="fa fa-calendar text-primary mr-1"></i>{comment.date}</div>
                                                        {/* {
                                                            comment.childComment ?
                                                                comment.childComment.map((child, key) =>
                                                                    <Media className="mt-4" key={"_media_" + key}>
                                                                        <img src={child.img} className="avatar-xs mr-3 rounded-circle" alt="img" />
                                                                        <Media body>
                                                                            <h5 className="mt-0 mb-1 font-size-15">{child.name}</h5>
                                                                            <p className="text-muted">{child.description}</p>
                                                                            <ul className="list-inline float-sm-right">
                                                                                <li className="list-inline-item">
                                                                                    <a href="#"><i className="fa fa-thumbs-up mr-1"></i> Like</a>
                                                                                </li>
                                                                                <li className="list-inline-item">
                                                                                    <a href="#"><i className="fa fa-commenting-o mr-1"></i> Comment</a>
                                                                                </li>
                                                                            </ul>
                                                                            <div className="text-muted font-size-12"><i className="fa fa-calendar text-primary mr-1"></i> {child.date}</div>
                                                                        </Media>
                                                                    </Media>
                                                                )

                                                                : null
                                                        } */}
                                                    </Media>
                                                </Media>
                                            )}
                                        </Collapse>
                                    </CardBody>
                                </Card>
                                
                                
                                    
                            </div>
                            {/* isComment */}
                            <Col md="12">
                                <CardTitle>Gửi bình luận</CardTitle>
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Thông báo cho</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="text" defaultValue="" placeholder="Tìm kiếm người dùng"/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Nội dung<span className="text-danger">*</span></label>
                                    <div className="col-md-8">
                                        <Input
                                            type="textarea"
                                            id="textarea"
                                            onChange={this.textareachange}
                                            maxLength="225"
                                            rows="3"
                                            placeholder="This textarea has a limit of 225 chars."
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Tài liệu đính kèm</label>
                                    <div className="col-md-8">
                                        <button className="waves-effect btn btn-info btn-sm waves-light">
                                            <i className="fa fa-paperclip mr-2 align-middle text-white font-size-16"></i> Thêm tập tin
                                        </button>
                                    </div>
                                </div>
                                <button className="waves-effect btn btn-primary btn-block btn-sm waves-light">
                                    <i className="fa fa-paper-plane mr-2 align-middle text-white font-size-16"></i> Gửi bình luận
                                </button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default Comment;