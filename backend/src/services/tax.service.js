import TaxRepository from '../repositories/tax.repository.js';

class TaxService {
  async createRule(user, data) {
    return TaxRepository.createRule(data);
  }

  async listRules(user) {
    return TaxRepository.listRules();
  }

  async clearRules(user) {
    return TaxRepository.clearRules();
  }

  /**
   * Calculates progressive income tax based on registered TaxRules.
   * If no rules exist, falls back to a default flat 10% tax rate.
   */
  async calculateTax(grossSalary) {
    const rules = await TaxRepository.listRules();
    if (rules.length === 0) {
      // Fallback flat 10% tax rate
      return parseFloat((grossSalary * 0.10).toFixed(2));
    }

    let tax = 0;
    for (const rule of rules) {
      const min = rule.minIncome;
      const max = rule.maxIncome !== null ? rule.maxIncome : Infinity;

      if (grossSalary > min) {
        const taxableIncomeInBracket = Math.min(grossSalary, max) - min;
        tax += (taxableIncomeInBracket * rule.taxRate);
      }
    }

    return parseFloat(tax.toFixed(2));
  }
}

export default new TaxService();
