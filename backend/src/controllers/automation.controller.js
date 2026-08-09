import AutomationService from '../services/automation.service.js';

class AutomationController {
  async createRule(req, res, next) {
    try {
      const rule = await AutomationService.createRule(req.user, req.body);
      res.status(201).json({ success: true, data: rule });
    } catch (err) {
      next(err);
    }
  }

  async updateRule(req, res, next) {
    try {
      const rule = await AutomationService.updateRule(req.user, req.params.id, req.body);
      res.json({ success: true, data: rule });
    } catch (err) {
      next(err);
    }
  }

  async deleteRule(req, res, next) {
    try {
      await AutomationService.deleteRule(req.user, req.params.id);
      res.json({ success: true, message: 'Rule deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async listRules(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        trigger: req.query.trigger
      };
      const rules = await AutomationService.listRules(filters);
      res.json({ success: true, data: rules });
    } catch (err) {
      next(err);
    }
  }

  async runRule(req, res, next) {
    try {
      const result = await AutomationService.runRuleManually(req.user, req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async listHistory(req, res, next) {
    try {
      const filters = {
        ruleId: req.query.ruleId,
        status: req.query.status
      };
      const list = await AutomationService.listHistory(filters);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }
}

export default new AutomationController();
