import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, Divider, Hidden, Paper, Skeleton, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useMetaMask } from "../hooks/useMetamask";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Fragment, useState } from "react";
import { CustomStepper } from "../components/CustomStepper";

const steps = ['Get WETH', 'Get USDC', 'Create Investment'];

export const Invest = () => {
  const { account, balance, chain, connect, getContractVariables, wrapEth, addToken, swapForUsdc, approve, createTask, getInvestments, depositFunds } = useMetaMask();

  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return step === 0;
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
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Paper>
      <Box>
        <Card>
          <CardContent>
            <Button onClick={getContractVariables}>contract vars</Button>
            <Button onClick={() => (addToken('WETH'))}>add weth</Button>
            <Button onClick={() => (swapForUsdc(0.1))}>swap weth for usdc</Button>
            <Button onClick={() => (approve('USDC', 10000))}>approve usdc</Button>
            <Button onClick={() => (createTask(10000, 421000, 'WETH'))}>create investment task</Button>
            <Button onClick={() => (getInvestments())}>getInvestments</Button>
            <Button onClick={() => (depositFunds(0.2))}>deposit</Button>
            
            <Container>
              <Stack spacing={1}>
                <Box sx={{ width: '100%' }}>
                  <CustomStepper />
                </Box>
                <Box />
                <Box />
                <Divider variant='middle' textAlign="left">Active Investments</Divider>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Accordion 1</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <Typography>Accordion 2</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                      malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion disabled>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                  >
                    <Typography>Disabled Accordion</Typography>
                  </AccordionSummary>
                </Accordion>
                <Skeleton variant="rounded" height={60} animation={false} />
                <Skeleton variant="rounded" height={60} animation={false} />
                <Skeleton variant="rounded" height={60} animation={false} />
              </Stack>
            </Container>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
}