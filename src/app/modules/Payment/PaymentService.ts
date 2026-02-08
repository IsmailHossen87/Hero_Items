
import Stripe from 'stripe';
import stripe from '../../config/stripe.config';
import { User } from '../user/user.model';
import { Tire } from '../tire/tire.model';
import config from '../../../config';

const createPaymentIntent = async (id: string, userId: string) => {
  // payment.service.ts
  const tire = await Tire.findById(id);
  const user = await User.findById(userId);

  if (!tire || !user) {
    throw new Error("Tire or user not found");
  }


  const stripeCustomer = await stripe.customers.create({
    name: user.name,
    email: user.email,
  });


  let metadata = {
    userId: user._id.toString(),
    tireId: tire._id.toString(),
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: stripeCustomer.id,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Tickets for ${tire.tireName}` },
          unit_amount: Math.round(tire.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: metadata,
    success_url: `${config.stripe.success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.stripe.cancel_url}?purchase_id=cancelled`,
  });

  return { url: session.url, sessionId: session.id };
}

export const createPaymentService = {
  createPaymentIntent,
};
