/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51LVIqUK10dA9VsHTisNiWI0lHnR5AKLwZHTiR1D7A16gT8gQLA5UaCJtVrYdAJlINU0MZptyNx2YPdJ5tLFfJIYG00ocnaBhXA'
);

export const buyProduct = async (productId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/payments/checkout-session/${productId}`
    );
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
