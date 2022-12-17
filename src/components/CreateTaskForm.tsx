import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Container, MenuItem, Paper, Select, SelectChangeEvent, Slider, TextField, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useMetaMask } from "../hooks/useMetamask";

export const CreateTaskForm = (props: { nextCallback: Function, skipCallback: Function, backCallback: Function }) => {
  const [ amount, setAmount ] = useState(0);
  const [ usdcBalance, setUsdcBalance ] = useState(0);
  const [ token, setToken ] = useState('');
  const [ duration, setDuration ] = useState(0);
  const [ isApproved, setApproved ] = useState(false);
  const { balance = 0, hasOngoingTransaction, wrapEth, balanceOf, createTask, approve } = useMetaMask();
  const getUSDCBalance = async() => {
    try {
      const usdcBalance = await balanceOf('USDC')
      setUsdcBalance(usdcBalance);
    } catch (err) {
      setUsdcBalance(0);
    }
    
  };
  const handleAmountChange = (event: Event, newValue: number | number[]) => {
    setAmount(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  
  const handleApproveClick = async () => {
    setApproved(await approve('USDC', 100));
  }

  const handleTaskClick = async () => {
    const result = await createTask(100, 6, 'WETH');
    props.nextCallback(result);
  }

  const handleSkip = () => {
    props.skipCallback();
  }

  const handleBack = () => {
    props.backCallback();
  }

  const handleTokenChange = (event: SelectChangeEvent) => {
    setToken(event.target.value);
  };

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDuration(parseInt(event.target.value))
  }

  useEffect(() => {
    getUSDCBalance();
    // getUSDCAllowance();
  });

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Typography sx={{ mt: 2, mb: 1 }}>Create Task</Typography>
        <Slider
          aria-label="Small steps"
          defaultValue={1}
          /* getAriaValueText={valuetext} */
          onChange={handleAmountChange}
          step={1}
          marks
          min={1}
          max={100}
          // disabled={usdcBalance <= 0}
          valueLabelDisplay="auto"
        />
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={token}
          onChange={handleTokenChange}
          label="Token"
          sx={{ m: 1, minWidth: 120 }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={'DAI'}>DAI</MenuItem>
          <MenuItem value={'WETH'}>WETH</MenuItem>
          <MenuItem value={'WBTC'}>WBTC</MenuItem>
        </Select>
        
        <TextField
          id="outlined-number"
          label="Number"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{ inputProps: { min: 2, max: 10 }}}
          onChange={handleDurationChange}
          value={duration}
          variant="standard"
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
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <LoadingButton
          size="small"
          onClick={handleTaskClick}
          loading={hasOngoingTransaction}
          loadingIndicator="Loading…"
          variant="contained"
        >
          Approve
        </LoadingButton>
        <LoadingButton
          size="small"
          onClick={handleApproveClick}
          loading={hasOngoingTransaction}
          loadingIndicator="Loading…"
          variant="contained"
          disabled={!isApproved}
        >
          Create Task
        </LoadingButton>
      </Box>
    </Container>
  )
}