import * as React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddTaskIcon from '@mui/icons-material/AddTask';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import { Avatar, Box, Button, StepContent, Typography } from '@mui/material';
import { getLogoUrl } from '../helpers';
import { getAddress } from 'ethers/lib/utils';
import { USDC_MAIN_ADDERSS, WETH_GOERLI_ADDRESS, WETH_MAIN_ADDRESS } from '../constants';
import { useState } from 'react';
import { WrapEthForm } from './WrapEthForm';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMetaMask } from '../hooks/useMetamask';
import { SwapForUSDCForm } from './SwapForUSDCForm';
import { CreateTaskForm } from './CreateTaskForm';

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
      color: '#784af4',
    }),
    '& .QontoStepIcon-completedIcon': {
      color: '#784af4',
      zIndex: 1,
      fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  }),
);

function QontoStepIcon(props: StepIconProps) {
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

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
  }),
}));

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <Avatar src={getLogoUrl(getAddress(WETH_MAIN_ADDRESS))} />,
    2: <Avatar src={getLogoUrl(getAddress(USDC_MAIN_ADDERSS))} />,
    3: <AddTaskIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

export const CustomStepper = () => {
  const [ activeStep, setActiveStep ] = useState(0);
  const [ skipped, setSkipped ] = useState(new Set<number>());
  const [ completed, setCompleted ] = useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return step === 0 || step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
    setCompleted(completed.add(activeStep));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
    setCompleted(completed.add(activeStep));
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted(new Set<number>());
  };

  const handleWrapEthAdvance = (value: boolean) => {
    if (value) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setCompleted(completed.add(activeStep));
    }
  }

  return (
    <Stack sx={{ width: '100%' }} spacing={4}>
      <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
        <Step key='wrapEth'>
          <StepLabel StepIconComponent={QontoStepIcon} StepIconProps={{ active: activeStep === 0, completed:  completed.has(0)}}/>
        </Step>
        <Step key='swapWETHtoUSDC'>
          <StepLabel StepIconComponent={QontoStepIcon} StepIconProps={{ active: activeStep === 1, completed:  completed.has(1)}}/>
        </Step>
        <Step key='createTask'>
          <StepLabel StepIconComponent={QontoStepIcon} StepIconProps={{ active: activeStep === 2, completed:  completed.has(2)}}/>
        </Step>
      </Stepper>
      <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
        <Step key='wrapEth'>
          <StepLabel StepIconComponent={ColorlibStepIcon} StepIconProps={{ active: activeStep === 0, completed:  completed.has(0)}}>Wrap ETH</StepLabel>
        </Step>
        <Step key='swapWETHtoUSDC'>
          <StepLabel StepIconComponent={ColorlibStepIcon} StepIconProps={{ active: activeStep === 1, completed:  completed.has(1)}}>Swap WETH for USDC</StepLabel>
        </Step>
        <Step key='createTask'>
          <StepLabel StepIconComponent={ColorlibStepIcon} StepIconProps={{ active: activeStep === 2, completed:  completed.has(2)}}>Create Task</StepLabel>
        </Step>
      </Stepper>
      {activeStep === 3 ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>          
          {
            activeStep === 0 ?
              <WrapEthForm nextCallback={handleWrapEthAdvance} skipCallback={handleSkip} backCallback={handleBack} />
              : activeStep === 1 ? <SwapForUSDCForm nextCallback={handleWrapEthAdvance} skipCallback={handleSkip} backCallback={handleBack} />
                : <CreateTaskForm nextCallback={handleWrapEthAdvance} skipCallback={handleSkip} backCallback={handleBack}/>
          }
        </React.Fragment>
      )}
    </Stack>
  );
}