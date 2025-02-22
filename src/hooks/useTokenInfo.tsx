import { AlchemyCacheContext } from "@context/achemy-cache";
import { useContext, useEffect } from "react";

const useTokenInfo = (tokenAddress?: string) => {
  const { tokenInfo, errors, fetchTokenInfo } = useContext(AlchemyCacheContext);

  useEffect(() => {
    // fetch token info if it's not already in the cache, and there are no errors
    if (tokenAddress && !tokenInfo[tokenAddress] && !errors['tokenInfo']) {
      (async () => await fetchTokenInfo(tokenAddress))();
    }
  }, [ tokenAddress, errors, fetchTokenInfo, tokenInfo ]);

  return tokenAddress && tokenInfo[tokenAddress] ? tokenInfo[tokenAddress] : undefined;
};

export default useTokenInfo;