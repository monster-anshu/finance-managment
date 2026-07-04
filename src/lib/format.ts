const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 4,
});

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0.00';
  return inrFormatter.format(amount);
}

export function formatQuantity(quantity: number): string {
  if (!Number.isFinite(quantity)) return '0';
  return quantityFormatter.format(quantity);
}

export function formatDate(epochMs: number): string {
  const date = new Date(epochMs);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
