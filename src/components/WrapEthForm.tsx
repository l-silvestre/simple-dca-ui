import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Container, Paper, Slider, TextField, Typography } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { useMetaMask } from "../hooks/useMetamask";

export const WrapEthForm = (props: { nextCallback: Function, skipCallback: Function, backCallback: Function }) => {
  const [ amount, setAmount ] = useState(0);
  const { balance = 0, hasOngoingTransaction, wrapEth } = useMetaMask();

  const handleAmountChange = async (event: Event, newValue: number | number[]) => {
    console.log(newValue);
    setAmount(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  

  const handleClick = async () => {
    const result = await wrapEth(amount);
    props.nextCallback(result);
  }

  const handleSkip = () => {
    props.skipCallback();
  }

  const handleBack = () => {
    props.backCallback();
  }

  function valuetext(value: number) {
    return `${value}°C`;
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Typography sx={{ mt: 2, mb: 1 }}>Select an amount of ETH to wrap into WETH</Typography>
        <Slider
          aria-label="Small steps"
          defaultValue={balance < 0.1 ? 0.001 : 0.1}
          /* getAriaValueText={valuetext} */
          onChange={handleAmountChange}
          step={0.001}
          marks
          min={0.001}
          max={balance > 0 ? balance : 1}
          disabled={balance <= 0}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
          display: 'flex',
          flexDirection: 'row',
          pt: 2,
        }}
        noValidate
        autoComplete="off"
      >
        <Button
          color="inherit"
          disabled={true}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }} disabled={hasOngoingTransaction}>
          Skip
        </Button>
        <LoadingButton
          size="small"
          onClick={handleClick}
          loading={hasOngoingTransaction}
          loadingIndicator="Loading…"
          variant="contained"
        >
          Wrap and Proceed
        </LoadingButton>
      </Box>
    </Container>
  )
}