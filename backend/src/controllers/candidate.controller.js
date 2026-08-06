import CandidateService from '../services/candidate.service.js';

class CandidateController {
  async createCandidate(req, res, next) {
    try {
      const data = await CandidateService.createCandidate(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Applicant registered in pipeline.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCandidate(req, res, next) {
    try {
      const data = await CandidateService.updateCandidate(req.user, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Applicant profile details modified.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async changeStage(req, res, next) {
    try {
      const { stage } = req.body;
      if (!stage) {
        return res.status(400).json({ success: false, message: 'Target stage parameter is required.' });
      }
      const data = await CandidateService.changeStage(req.user, req.params.id, stage);
      return res.status(200).json({
        success: true,
        message: 'Applicant pipeline stage moved.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getCandidateById(req, res, next) {
    try {
      const data = await CandidateService.getCandidateById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Applicant detailed file.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listCandidates(req, res, next) {
    try {
      const { jobOpeningId } = req.query;
      const data = await CandidateService.listCandidates(req.user, jobOpeningId);
      return res.status(200).json({
        success: true,
        message: 'Applicant roster compiled.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteCandidate(req, res, next) {
    try {
      await CandidateService.deleteCandidate(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Applicant record deleted.'
      });
    } catch (err) {
      next(err);
    }
  }

  async hireCandidate(req, res, next) {
    try {
      const { employeeCode } = req.body;
      const data = await CandidateService.hireCandidate(req.user, req.params.id, employeeCode);
      return res.status(200).json({
        success: true,
        message: 'Candidate hired! Employee profile credentials setup successful.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async linkDocument(req, res, next) {
    try {
      const { documentId, type } = req.body;
      if (!documentId || !type) {
        return res.status(400).json({ success: false, message: 'documentId and type variables are required.' });
      }
      const data = await CandidateService.linkDocument(req.user, req.params.id, documentId, type);
      return res.status(200).json({
        success: true,
        message: 'Document attachment linked to applicant.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new CandidateController();
