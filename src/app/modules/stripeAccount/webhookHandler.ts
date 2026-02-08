import { Request, Response } from 'express';
import Stripe from 'stripe';
import config from '../../../config';
import stripe from '../../config/stripe.config';
import { TransactionService } from '../transaction/transaction.service';

const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = config.stripe.stripe_webhook_secret;

  if (!sig) {
    console.error('❌ Stripe signature missing');
    res.status(400).send('Stripe signature missing');
    return;
  }

  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        console.log(metadata)

        if (metadata.userId && metadata.tireId) {
          await TransactionService.buyTireTransaction(metadata.userId, metadata.tireId);
        } else {
          console.log('⚠️ Missing userId or tierId in metadata');
        }
        break;
      }

      case 'transfer.created': {
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('❌ Error handling webhook event:', err);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
};

export default webhookHandler;

// handleTransferCreated
const handleTransferCreated = async (transfer: Stripe.Transfer) => {
  try {
    // Add your transfer handling logic here
  } catch (error) {
    console.error('❌ Error in handleTransferCreated:', error);
  }
};