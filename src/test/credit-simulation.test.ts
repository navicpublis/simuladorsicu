import { describe, expect, it } from 'vitest';
import { DOCUMENTATION_FEE, INSTALLMENT_OPTIONS, VALIDATION_DURATION_MS, questions, installmentAmount } from '@/lib/credit-simulation';
describe('Credit study rules', () => {
  it('uses a three-second document validation', () => { expect(VALIDATION_DURATION_MS).toBe(3000); });
  it('asks five qualification questions', () => { expect(questions).toHaveLength(5); });
  it('offers the six plans from 6 to 60 installments', () => { expect(INSTALLMENT_OPTIONS).toEqual([6, 12, 24, 36, 48, 60]); });
  it('shows the illustrative documentation fee of R$ 48.70', () => { expect(DOCUMENTATION_FEE).toBe(48.70); });
  it('divides the illustrative amount without implying real interest terms', () => { expect(installmentAmount(60)).toBe(200); });
});