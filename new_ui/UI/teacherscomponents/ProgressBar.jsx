"use client";
import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import Check from "@mui/icons-material/Check";

/* ---------------------- Qonto Connector ---------------------- */
// (This part is unchanged)
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles("dark", {
      borderColor: theme.palette.grey[800],
    }),
  },
}));

/* ---------------------- Qonto Icon ---------------------- */
// (This part is unchanged)
const QontoStepIconRoot = styled("div")(({ theme }) => ({
  color: "#eaeaf0",
  display: "flex",
  height: 22,
  alignItems: "center",
  "& .QontoStepIcon-completedIcon": {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18,
  },
  "& .QontoStepIcon-circle": {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  ...theme.applyStyles("dark", {
    color: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        color: "#784af4",
      },
    },
  ],
}));

function QontoStepIcon(props) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
};

/* ---------------------- Progress Bar Component ---------------------- */

const ProgressBar = ({ status }) => {
  const steps = [
    "planned",
    "scripted",
    "recorded",
    "edited",
    "uploaded",
    "review",
    "approved",
    "published",
  ];

  // --- ✨ UPDATED LOGIC ---
  
  const statusIndex = steps.indexOf(status?.toLowerCase());
  let activeStep;

  if (statusIndex === 0) {
    // If status is "planned", show "planned" as the active step (dot)
    activeStep = 0;
  } else if (statusIndex > 0) {
    // If status is "scripted" (index 1) or higher,
    // set the active step to be the *next* one (index 2)
    // This will mark "scripted" as completed (✅)
    activeStep = statusIndex+1 ;
  } else {
    // Default for new topics (status is null, undefined, etc.)
    // Show "planned" as the active step (dot)
    activeStep = 0;
  }
  // --- END OF UPDATED LOGIC ---

  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep} // Use the new calculated activeStep
      connector={<QontoConnector />}
    >
      {steps.map((label, index) => (
        <Step key={index}>
          <StepLabel StepIconComponent={QontoStepIcon} />
        </Step>
      ))}
    </Stepper>
  );
};

export default ProgressBar;