import { ethers } from 'ethers';
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
  Event,
  EventFilter,
} from "ethers";

export interface RouterError {
  statusText: string;
  message: string;
}

export interface TypedEvent<
  TArgsArray extends Array<any> = any,
  TArgsObject = any
> extends Event {
  args: TArgsArray & TArgsObject;
}

export interface TypedEventFilter<_TEvent extends TypedEvent>
  extends EventFilter {}

export interface TypedListener<TEvent extends TypedEvent> {
  (...listenerArg: [...__TypechainArgsArray<TEvent>, TEvent]): void;
}

type __TypechainArgsArray<T> = T extends TypedEvent<infer U> ? U : never;

export interface OnEvent<TRes> {
  <TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>,
    listener: TypedListener<TEvent>
  ): TRes;
  (eventName: string, listener: any): TRes;
}

export type MinEthersFactory<C, ARGS> = {
  deploy(...a: ARGS[]): Promise<C>;
};

export type GetContractTypeFromFactory<F> = F extends MinEthersFactory<
  infer C,
  any
>
  ? C
  : never;

export type GetARGsTypeFromFactory<F> = F extends MinEthersFactory<any, any>
  ? Parameters<F["deploy"]>
  : never;

export type PromiseOrValue<T> = T | Promise<T>;

export type InvestmentStartedEvent = TypedEvent<
  [string, any],
  InvestmentStartedEventObject
>;

export type InvestmentStartedEventFilter =
  TypedEventFilter<InvestmentStartedEvent>;

export type InvestmentStoppedEvent = TypedEvent<
  [string, any],
  InvestmentStoppedEventObject
>;

export type InvestmentStoppedEventFilter =
  TypedEventFilter<InvestmentStoppedEvent>;

export type TokenAddrStruct = {
  symbol: PromiseOrValue<string>;
  addr: PromiseOrValue<string>;
};

export type TokenAddrStructOutput = [string, string] & {
  symbol: string;
  addr: string;
};

export type InvestmentStruct = {
  symbol: PromiseOrValue<string>;
  avgBuyAmount: PromiseOrValue<BigNumberish>;
  expiryTimestamp: PromiseOrValue<BigNumberish>;
};

export type InvestmentStructOutput = [string, BigNumber, BigNumber] & {
  symbol: string;
  avgBuyAmount: BigNumber;
  expiryTimestamp: BigNumber;
};

export interface InvestmentStartedEventObject {
  owner: string;
  investment: InvestmentStructOutput;
}

export interface InvestmentStoppedEventObject {
  owner: string;
  investment: InvestmentStructOutput;
}

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface ReceivedEventObject {
  arg0: string;
  arg1: BigNumber;
}
export type ReceivedEvent = TypedEvent<
  [string, BigNumber],
  ReceivedEventObject
>;

export type ReceivedEventFilter = TypedEventFilter<ReceivedEvent>;

export interface TaskCanceledEventEventObject {
  taskId: string;
}
export type TaskCanceledEventEvent = TypedEvent<
  [string],
  TaskCanceledEventEventObject
>;

export type TaskCanceledEventEventFilter =
  TypedEventFilter<TaskCanceledEventEvent>;

export interface TaskCreatedEventEventObject {
  taskId: string;
}
export type TaskCreatedEventEvent = TypedEvent<
  [string],
  TaskCreatedEventEventObject
>;

export type TaskCreatedEventEventFilter =
  TypedEventFilter<TaskCreatedEventEvent>;

export interface TaskFinishedEventEventObject {
  taskId: string;
}
export type TaskFinishedEventEvent = TypedEvent<
  [string],
  TaskFinishedEventEventObject
>;

export type TaskFinishedEventEventFilter =
  TypedEventFilter<TaskFinishedEventEvent>;

export interface ISimpleDCATask extends BaseContract {
  connect(signerOrProvider: Signer | ethers.providers.Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: any;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<any>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    MAX_INVESTMENTS(overrides?: CallOverrides): Promise<[BigNumber]>;

    MAX_INVESTMENT_TIME(overrides?: CallOverrides): Promise<[BigNumber]>;

    MIN_INVESTMENT_TIME(overrides?: CallOverrides): Promise<[BigNumber]>;

    POOL_FEE(overrides?: CallOverrides): Promise<[number]>;

    approveRouter(
      _amountIn: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cancelTaskInternal(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    checker(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean, string] & { canExec: boolean; execPayload: string }>;

    createTask(
      _amount: PromiseOrValue<BigNumberish>,
      _buyTokenSymbol: PromiseOrValue<string>,
      _duration: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    dedicatedMsgSender(overrides?: CallOverrides): Promise<[string]>;

    deposit(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    fundsOwner(overrides?: CallOverrides): Promise<[string]>;

    getAllowance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getOwnInvestments(
      overrides?: CallOverrides
    ): Promise<[InvestmentStructOutput[]]>;

    getUserTokenBalance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    interval(overrides?: CallOverrides): Promise<[BigNumber]>;

    invest(
      _account: PromiseOrValue<string>,
      _accountInvestmentIdx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    ops(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    swapRouter(overrides?: CallOverrides): Promise<[string]>;

    swapWETHtoUSDC(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    taskTreasury(overrides?: CallOverrides): Promise<[string]>;

    tokenAddresses(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawFunds(
      _amount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    wrapEth(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  MAX_INVESTMENTS(overrides?: CallOverrides): Promise<BigNumber>;

  MAX_INVESTMENT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

  MIN_INVESTMENT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

  POOL_FEE(overrides?: CallOverrides): Promise<number>;

  approveRouter(
    _amountIn: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cancelTaskInternal(
    _account: PromiseOrValue<string>,
    _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  checker(
    _account: PromiseOrValue<string>,
    _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[boolean, string] & { canExec: boolean; execPayload: string }>;

  createTask(
    _amount: PromiseOrValue<BigNumberish>,
    _buyTokenSymbol: PromiseOrValue<string>,
    _duration: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  dedicatedMsgSender(overrides?: CallOverrides): Promise<string>;

  deposit(
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  fundsOwner(overrides?: CallOverrides): Promise<string>;

  getAllowance(
    _tokenSymbol: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getOwnInvestments(
    overrides?: CallOverrides
  ): Promise<InvestmentStructOutput[]>;

  getUserTokenBalance(
    _tokenSymbol: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  interval(overrides?: CallOverrides): Promise<BigNumber>;

  invest(
    _account: PromiseOrValue<string>,
    _accountInvestmentIdx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  ops(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  swapRouter(overrides?: CallOverrides): Promise<string>;

  swapWETHtoUSDC(
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  taskTreasury(overrides?: CallOverrides): Promise<string>;

  tokenAddresses(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawFunds(
    _amount: PromiseOrValue<BigNumberish>,
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  wrapEth(
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    MAX_INVESTMENTS(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_INVESTMENT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    MIN_INVESTMENT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    POOL_FEE(overrides?: CallOverrides): Promise<number>;

    approveRouter(
      _amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    cancelTaskInternal(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    checker(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean, string] & { canExec: boolean; execPayload: string }>;

    createTask(
      _amount: PromiseOrValue<BigNumberish>,
      _buyTokenSymbol: PromiseOrValue<string>,
      _duration: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    dedicatedMsgSender(overrides?: CallOverrides): Promise<string>;

    deposit(overrides?: CallOverrides): Promise<void>;

    fundsOwner(overrides?: CallOverrides): Promise<string>;

    getAllowance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOwnInvestments(
      overrides?: CallOverrides
    ): Promise<InvestmentStructOutput[]>;

    getUserTokenBalance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    interval(overrides?: CallOverrides): Promise<BigNumber>;

    invest(
      _account: PromiseOrValue<string>,
      _accountInvestmentIdx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    ops(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    swapRouter(overrides?: CallOverrides): Promise<string>;

    swapWETHtoUSDC(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    taskTreasury(overrides?: CallOverrides): Promise<string>;

    tokenAddresses(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawFunds(
      _amount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    wrapEth(overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {
    "InvestmentStarted(address,tuple)"(
      owner?: null,
      investment?: null
    ): InvestmentStartedEventFilter;
    InvestmentStarted(
      owner?: null,
      investment?: null
    ): InvestmentStartedEventFilter;

    "InvestmentStopped(address,tuple)"(
      owner?: null,
      investment?: null
    ): InvestmentStoppedEventFilter;
    InvestmentStopped(
      owner?: null,
      investment?: null
    ): InvestmentStoppedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;

    "Received(address,uint256)"(arg0?: null, arg1?: null): ReceivedEventFilter;
    Received(arg0?: null, arg1?: null): ReceivedEventFilter;

    "TaskCanceledEvent(bytes32)"(taskId?: null): TaskCanceledEventEventFilter;
    TaskCanceledEvent(taskId?: null): TaskCanceledEventEventFilter;

    "TaskCreatedEvent(bytes32)"(taskId?: null): TaskCreatedEventEventFilter;
    TaskCreatedEvent(taskId?: null): TaskCreatedEventEventFilter;

    "TaskFinishedEvent(bytes32)"(taskId?: null): TaskFinishedEventEventFilter;
    TaskFinishedEvent(taskId?: null): TaskFinishedEventEventFilter;
  };

  estimateGas: {
    MAX_INVESTMENTS(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_INVESTMENT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    MIN_INVESTMENT_TIME(overrides?: CallOverrides): Promise<BigNumber>;

    POOL_FEE(overrides?: CallOverrides): Promise<BigNumber>;

    approveRouter(
      _amountIn: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cancelTaskInternal(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    checker(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createTask(
      _amount: PromiseOrValue<BigNumberish>,
      _buyTokenSymbol: PromiseOrValue<string>,
      _duration: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    dedicatedMsgSender(overrides?: CallOverrides): Promise<BigNumber>;

    deposit(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    fundsOwner(overrides?: CallOverrides): Promise<BigNumber>;

    getAllowance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOwnInvestments(overrides?: CallOverrides): Promise<BigNumber>;

    getUserTokenBalance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    interval(overrides?: CallOverrides): Promise<BigNumber>;

    invest(
      _account: PromiseOrValue<string>,
      _accountInvestmentIdx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    ops(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    swapRouter(overrides?: CallOverrides): Promise<BigNumber>;

    swapWETHtoUSDC(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    taskTreasury(overrides?: CallOverrides): Promise<BigNumber>;

    tokenAddresses(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawFunds(
      _amount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    wrapEth(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    MAX_INVESTMENTS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_INVESTMENT_TIME(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    MIN_INVESTMENT_TIME(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    POOL_FEE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    approveRouter(
      _amountIn: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cancelTaskInternal(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    checker(
      _account: PromiseOrValue<string>,
      _accountInvestmenIdx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createTask(
      _amount: PromiseOrValue<BigNumberish>,
      _buyTokenSymbol: PromiseOrValue<string>,
      _duration: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    dedicatedMsgSender(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    fundsOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getAllowance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOwnInvestments(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getUserTokenBalance(
      _tokenSymbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    interval(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    invest(
      _account: PromiseOrValue<string>,
      _accountInvestmentIdx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    ops(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    swapRouter(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    swapWETHtoUSDC(
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    taskTreasury(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenAddresses(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawFunds(
      _amount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    wrapEth(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}


export interface IERC20 extends BaseContract {
  connect(signerOrProvider: Signer | ethers.providers.Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: any;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<any>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  allowance(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  approve(
    spender: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  balanceOf(
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  transfer(
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferFrom(
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "Approval(address,address,uint256)"(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null
    ): any;
    Approval(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null
    ): any;

    "Transfer(address,address,uint256)"(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null
    ): any;
    Transfer(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null
    ): any;
  };

  estimateGas: {
    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
