import OfferRepository from '../repositories/offer.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';

class OfferService {
  async createOffer(user, data) {
    const offer = await OfferRepository.create(data);

    // Audit log
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'OFFER',
      entityId: offer.id,
      description: `Generated offer letter contract proposal for Candidate Reference ID: ${data.candidateId}`
    });

    return offer;
  }

  async updateOffer(user, id, data) {
    const offer = await OfferRepository.update(id, data);

    // Notify employee on acceptance
    if (data.status === 'ACCEPTED') {
      // Send notifications to recruitment managers
      await NotificationService.createNotification({
        userId: user.id,
        type: 'TASK_COMPLETED',
        title: 'Offer Accepted',
        message: `Candidate offer proposal for ${offer.candidate?.firstName} ${offer.candidate?.lastName} was marked ACCEPTED.`,
        priority: 'HIGH',
        entityType: 'OFFER',
        entityId: id
      });
    }

    // Audit log
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'OFFER',
      entityId: id,
      description: `Updated candidate offer letter contract status to ${data.status || offer.status}`
    });

    return offer;
  }

  async getOfferById(user, id) {
    return OfferRepository.getById(id);
  }

  async listOffers(user) {
    return OfferRepository.list();
  }
}

export default new OfferService();
