import { formatINR, formatQuantity, formatDate } from '@/lib/format';

describe('formatINR', () => {
  it('formats a value with the rupee symbol and 2 decimals', () => {
    expect(formatINR(1234.5)).toBe('₹1,234.50');
  });
  it('formats zero', () => {
    expect(formatINR(0)).toBe('₹0.00');
  });
  it('uses Indian digit grouping', () => {
    expect(formatINR(100000)).toBe('₹1,00,000.00');
  });
  it('falls back to ₹0.00 for non-finite input', () => {
    expect(formatINR(Number.NaN)).toBe('₹0.00');
  });
});

describe('formatQuantity', () => {
  it('shows fractional units without forcing decimals', () => {
    expect(formatQuantity(10.5)).toBe('10.5');
  });
  it('shows integer units plainly', () => {
    expect(formatQuantity(3)).toBe('3');
  });
});

describe('formatDate', () => {
  it('renders a readable date containing the year', () => {
    const epoch = Date.UTC(2026, 6, 4, 12, 0, 0); // noon UTC avoids tz day-flip
    expect(formatDate(epoch)).toContain('2026');
  });
  it('returns empty string for invalid input', () => {
    expect(formatDate(Number.NaN)).toBe('');
  });
});
