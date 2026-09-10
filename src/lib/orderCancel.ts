import { Order } from './types';

/**
 * Whether the customer may still cancel this order.
 *
 * Mirrors `OrdersService.customerCancelEligibility` on the backend, which
 * stays the authority — this copy exists only so the button can be disabled
 * with an explanation instead of failing after a click. Keep the two in sync;
 * if they ever disagree, the server wins and the request 400s.
 *
 * The decisive fact is the shipping LABEL, not the status: an order sits in
 * PROCESSING both before and after one is bought, so a tracking number means
 * carrier money is already spent and it becomes a return, not a cancellation.
 */
export function orderCancelEligibility(
  order: Pick<Order, 'status' | 'trackingNumber'>,
): { canCancel: boolean; reason?: string } {
  switch (order.status) {
    case 'CANCELLED':
      return { canCancel: false, reason: 'This order is already cancelled.' };
    case 'DELIVERED':
      return {
        canCancel: false,
        reason: 'This order has already been delivered. Please contact us to arrange a return.',
      };
    case 'SHIPPED':
      return {
        canCancel: false,
        reason: 'This order has already shipped. Please contact us to arrange a return.',
      };
    case 'PENDING':
      return { canCancel: true };
    case 'PROCESSING':
      return order.trackingNumber
        ? {
            canCancel: false,
            reason:
              'A shipping label has already been purchased for this order. Please contact us to arrange a return.',
          }
        : { canCancel: true };
    default:
      return { canCancel: false, reason: 'This order can no longer be cancelled online. Please contact us.' };
  }
}
