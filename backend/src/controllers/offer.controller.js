import OfferService from '../services/offer.service.js';

class OfferController {
  async createOffer(req, res, next) {
    try {
      const data = await OfferService.createOffer(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Proposed contract contract generated.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateOffer(req, res, next) {
    try {
      const data = await OfferService.updateOffer(req.user, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Contract proposal state modified.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getOfferById(req, res, next) {
    try {
      const data = await OfferService.getOfferById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Offer proposal specifications.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listOffers(req, res, next) {
    try {
      const data = await OfferService.listOffers(req.user);
      return res.status(200).json({
        success: true,
        message: 'Pending contract proposals.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new OfferController();
