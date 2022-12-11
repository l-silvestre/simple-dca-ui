import React, { Component, useState } from 'react';
import { connectToMetamask, getChain } from '../web3';


class Metamask extends Component {
  constructor(props: any) {
    super(props);

    this.state = {}
  }

  render() {
    return(
      <div>
        <button onClick={async () => await getChain()}>Get CHain</button>
        <button onClick={async () => await connectToMetamask()}>connect</button>
      </div>
    )
  }
}

export default Metamask;