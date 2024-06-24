import { Address, getAddress } from 'viem';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { TransferType, TokenInfo, AssetTransfer } from '../../../../types';
import { formatCoin } from '../../../../utils/numberFormats';

export enum TokenEventType {
  DEPOSIT,
  WITHDRAW,
}
export interface TransferDisplayData {
  eventType: TokenEventType;
  transferType: TransferType;
  executionDate: string;
  image: string;
  assetDisplay: string;
  fullCoinTotal: string | undefined;
  transferAddress: Address;
  isLast: boolean;
  transactionHash: string;
  tokenId: Address;
  tokenInfo?: TokenInfo;
}

export function useFormatTransfers(
  transfers: AssetTransfer[],
  safeAddress: string,
): TransferDisplayData[] {
  let displayData: TransferDisplayData[] = new Array(transfers.length);
  const { chain, nativeTokenIcon } = useNetworkConfig();

  for (let i = 0; i < transfers.length; i++) {
    const transfer = transfers[i];
    const info = transfer.tokenInfo;

    let imageSrc;
    switch (transfer.type) {
      case TransferType.ERC20_TRANSFER:
      case TransferType.ERC721_TRANSFER:
        imageSrc = info ? info.logoUri : '';
        break;
      case TransferType.ETHER_TRANSFER:
        imageSrc = nativeTokenIcon;
        break;
      default:
        imageSrc = '/images/coin-icon-default.svg';
    }
    let symbol =
      transfer.type === TransferType.ETHER_TRANSFER
        ? chain.nativeCurrency.symbol
        : transfer?.tokenInfo?.symbol;
    const formatted: TransferDisplayData = {
      eventType: safeAddress === transfer.from ? TokenEventType.WITHDRAW : TokenEventType.DEPOSIT,
      transferType: transfer.type as TransferType,
      executionDate: transfer.executionDate,
      image: imageSrc,
      assetDisplay:
        transfer.type === TransferType.ERC721_TRANSFER
          ? info?.name + ' #' + transfer.tokenId
          : formatCoin(transfer.value, true, transfer?.tokenInfo?.decimals, symbol),
      fullCoinTotal:
        transfer.type === TransferType.ERC721_TRANSFER
          ? undefined
          : formatCoin(transfer.value, false, transfer?.tokenInfo?.decimals, symbol),
      transferAddress:
        safeAddress === transfer.from ? getAddress(transfer.to) : getAddress(transfer.from),
      isLast: transfers[transfers.length - 1] === transfer,
      transactionHash: transfer.transactionHash,
      tokenId: getAddress(transfer?.tokenId),
      tokenInfo: transfer.tokenInfo,
    };
    displayData[i] = formatted;
  }
  return displayData;
}
