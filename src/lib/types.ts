export type AssetType = 'stock' | 'etf' | 'bond';
export type TxKind = 'lumpsum' | 'sip';

export const ASSET_TYPES: readonly AssetType[] = ['stock', 'etf', 'bond'];
export const TX_KINDS: readonly TxKind[] = ['lumpsum', 'sip'];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock: 'Stock',
  etf: 'ETF',
  bond: 'Bond',
};

export const TX_KIND_LABELS: Record<TxKind, string> = {
  lumpsum: 'Lumpsum',
  sip: 'SIP',
};
