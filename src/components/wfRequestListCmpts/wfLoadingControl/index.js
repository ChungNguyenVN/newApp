import React, { Component, Fragment } from "react";
import { objField } from "components/wfShareCmpts/wfShareModel";
import {
  isNotNull,
  formatDate,
  formatStatusLabel,
  formatStatusText,
  FindTitleById,
} from "components/wfShareCmpts/wfShareFunction.js";
import Card from "components/Card";
import { Grid } from "@material-ui/core";
import "components/Containers/FormAddNew/formStyle.scss";

import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const WFLoadingControl = ({
  FieldView,
  detailRequest,
  wfStepTable,
  indexStep,
  Title,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>{Title}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={3} style={{ margin: 0 }}>
            {!isNotNull(FieldView)
              ? ""
              : FieldView.map((field) => {
                  switch (field.FieldType) {
                    case objField.Text:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailRequest[field.InternalName]}</p>
                        </Grid>
                      );
                    case objField.TextArea:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {isNotNull(detailRequest[field.InternalName]) ? (
                            <textarea
                              variant="outlined"
                              className="textArea"
                              value={detailRequest[field.InternalName]}
                              rows="4"
                              readOnly
                            />
                          ) : (
                            ""
                          )}
                        </Grid>
                      );
                    case objField.Number:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailRequest[field.InternalName]}</p>
                        </Grid>
                      );
                    case objField.DateTime:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{formatDate(detailRequest[field.InternalName])}</p>
                        </Grid>
                      );
                    case objField.User:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailRequest[field.InternalName].UserTitle}</p>
                        </Grid>
                      );
                    case objField.UserMulti:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailRequest[field.InternalName].length > 0
                              ? detailRequest[field.InternalName].map(
                                  (itemUser) => itemUser.UserTitle + ", "
                                )
                              : ""}
                          </p>
                        </Grid>
                      );
                    case objField.YesNo:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailRequest[field.InternalName] ? "Có" : "Không"}
                          </p>
                        </Grid>
                      );
                    case objField.Dropdown:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailRequest[field.InternalName]}</p>
                        </Grid>
                      );
                    case objField.RadioButton:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailRequest[field.InternalName].length > 0
                              ? detailRequest[
                                  field.InternalName
                                ].map((itemCheck) =>
                                  itemCheck.isChecked
                                    ? itemCheck.Value + ", "
                                    : ""
                                )
                              : ""}
                          </p>
                        </Grid>
                      );
                    case objField.CheckBox:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>
                            {detailRequest[field.InternalName].length > 0
                              ? detailRequest[
                                  field.InternalName
                                ].map((itemCheck) =>
                                  itemCheck.isChecked
                                    ? itemCheck.Value + ", "
                                    : ""
                                )
                              : ""}
                          </p>
                        </Grid>
                      );
                    case objField.SPLinkWF:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>

                          <div>
                            {detailRequest[field.InternalName].length > 0 ? (
                              <div className="tagName">
                                {detailRequest[field.InternalName].map(
                                  (spLink, keySPLink) => (
                                    <p key={keySPLink} className="wrapName">
                                      {spLink.Title}{" "}
                                    </p>
                                  )
                                )}
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </Grid>
                      );

                    case objField.Hyperlink:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {isNotNull(detailRequest[field.InternalName]) ? (
                            <a
                              style={{ wordBreak: "break-all" }}
                              target="_blank"
                              href={detailRequest[field.InternalName]}
                            >
                              {detailRequest[field.InternalName]}
                            </a>
                          ) : (
                            ""
                          )}
                        </Grid>
                      );

                    case objField.PictureLink:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          {isNotNull(detailRequest[field.InternalName]) ? (
                            <a
                              target="_blank"
                              href={detailRequest[field.InternalName]}
                            >
                              <img
                                style={{ width: "100px", height: "100px" }}
                                src={detailRequest[field.InternalName]}
                              />
                            </a>
                          ) : (
                            ""
                          )}
                        </Grid>
                      );

                    default:
                      return (
                        <Grid item sm={6} xs={12} key={field.InternalName}>
                          <label className="form-label">
                            {field.Title}{" "}
                            {field.Required == 1 ? (
                              <span className="required-field">*</span>
                            ) : (
                              ""
                            )}
                          </label>
                          <p>{detailRequest[field.InternalName]}</p>
                        </Grid>
                      );
                  }
                })}

            {detailRequest ? (
              <Grid item sm={6} xs={12}>
                <label className="form-label">Trạng thái</label>
                <p>
                  <span
                    className={formatStatusLabel(detailRequest.StatusRequest)}
                  >
                    {formatStatusText(detailRequest.StatusRequest)}
                  </span>
                </p>
              </Grid>
            ) : (
              ""
            )}

            {detailRequest ? (
              <Grid item sm={6} xs={12}>
                <label className="form-label">Bước hiện tại</label>
                <p>
                  <span className="labelAlert label_warning">
                    {FindTitleById(
                      wfStepTable,
                      "indexStep",
                      indexStep,
                      "Title"
                    )}
                  </span>
                </p>
              </Grid>
            ) : (
              ""
            )}
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

export default WFLoadingControl;
