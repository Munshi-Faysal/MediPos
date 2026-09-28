/** Code 128 can encode this 16-digit decimal identifier compactly using digit pairs. */
export function prescriptionBarcodeCode(scanToken: string): string {
  if (!/^[0-9a-f]{32}$/i.test(scanToken)) return '';
  return BigInt(`0x${scanToken.slice(0, 13)}`).toString(10).padStart(16, '0');
}
