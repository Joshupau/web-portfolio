// Loan schedule math. Pure functions, no DOM.
// Every amount is an integer number of centavos, so sums never drift.

export type Method = "diminishing" | "flat";

export interface Row {
  /** month number, starting at 1 */
  n: number;
  payment: number;
  interest: number;
  principal: number;
  /** what is still owed after this payment */
  balance: number;
}

export interface LoanInput {
  /** loan amount in centavos */
  principal: number;
  /** yearly rate in percent, e.g. 12 for 12% */
  annualRatePct: number;
  months: number;
  method: Method;
}

export interface Schedule {
  rows: Row[];
  /** the regular monthly payment (the last one may differ by a few centavos) */
  payment: number;
  totalInterest: number;
  totalPaid: number;
}

export function schedule({ principal, annualRatePct, months, method }: LoanInput): Schedule {
  const loan = Math.max(0, Math.round(principal));
  const n = Math.max(1, Math.floor(months));
  const yearly = Math.max(0, annualRatePct) / 100;
  const rows: Row[] = [];
  let balance = loan;

  if (method === "flat") {
    // add-on interest: charged on the original amount for the whole term, then spread evenly
    const interestTotal = Math.round((loan * yearly * n) / 12);
    const principalEach = Math.floor(loan / n);
    const interestEach = Math.floor(interestTotal / n);
    let interestLeft = interestTotal;
    for (let k = 1; k <= n; k++) {
      const last = k === n;
      const p = last ? balance : principalEach;
      const i = last ? interestLeft : interestEach;
      balance -= p;
      interestLeft -= i;
      rows.push({ n: k, payment: p + i, interest: i, principal: p, balance });
    }
  } else {
    // annuity: equal payments, interest charged on what is still owed
    const r = yearly / 12;
    const regular = r === 0 ? Math.round(loan / n) : Math.round((loan * r) / (1 - Math.pow(1 + r, -n)));
    for (let k = 1; k <= n; k++) {
      const i = Math.round(balance * r);
      const p = k === n ? balance : Math.min(balance, Math.max(0, regular - i));
      balance -= p;
      rows.push({ n: k, payment: p + i, interest: i, principal: p, balance });
    }
  }

  let totalInterest = 0;
  let totalPaid = 0;
  for (const row of rows) {
    totalInterest += row.interest;
    totalPaid += row.payment;
  }
  return { rows, payment: rows[0].payment, totalInterest, totalPaid };
}
