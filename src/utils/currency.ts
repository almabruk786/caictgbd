/**
 * Currency Utility for Bangladeshi Taka (৳ / BDT)
 */

export function formatBDT(amount: number | undefined | null, includeSymbol: boolean = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? '৳ 0.00' : '0.00';
  }
  
  // Format with Bangladeshi comma grouping: 45,000.00 or 1,45,000.00
  const parts = Number(amount).toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }
  
  // Bangladesh / Indian subcontinent numbering system: last 3 digits, then groups of 2
  let result = '';
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const rest = integerPart.substring(0, integerPart.length - 3);
    result = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    result = integerPart;
  }
  
  const formatted = `${isNegative ? '-' : ''}${result}.${decimalPart}`;
  return includeSymbol ? `৳ ${formatted}` : formatted;
}

export function formatCompactBDT(amount: number): string {
  if (isNaN(amount)) return '৳ 0';
  if (Math.abs(amount) >= 10000000) {
    return `৳ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `৳ ${(amount / 100000).toFixed(2)} Lakh`;
  }
  if (Math.abs(amount) >= 1000) {
    return `৳ ${(amount / 1000).toFixed(1)}k`;
  }
  return `৳ ${amount.toFixed(0)}`;
}

export function numberToWordsBDT(amount: number): string {
  if (amount === 0) return 'Zero Taka Only';
  
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertGroup(num: number): string {
    let groupStr = '';
    if (num >= 100) {
      groupStr += single[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      groupStr += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      groupStr += single[num] + ' ';
    }
    return groupStr.trim();
  }
  
  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;
  const hundreds = Math.floor(amount);
  
  let res = '';
  if (crore > 0) res += convertGroup(crore) + ' Crore ';
  if (lakh > 0) res += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) res += convertGroup(thousand) + ' Thousand ';
  if (hundreds > 0) res += convertGroup(hundreds) + ' ';
  
  return (res.trim() + ' Taka Only');
}
