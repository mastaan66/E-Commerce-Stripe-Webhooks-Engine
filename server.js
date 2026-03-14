const express = require('express');
const stripe = require('stripe')('sk_test_mock_stripe_key_12345'); // Mock secret key for demonstration
const app = express();


// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_mock_endpoint_secret_12345";

// Stripe requires the raw body to construct the event and verify the signature
app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    // In a real app, you MUST verify the signature. 
    // Since this is a demo without actual Stripe API calls, we simulate event parsing.
    if (sig === 'mock_signature') {
      event = JSON.parse(request.body);
    } else {
      // Simulate real stripe.webhooks.constructEvent
      // event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      event = JSON.parse(request.body); // Fallback for pure local testing
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      console.log(`[SUCCESS] Payment for session ${checkoutSessionCompleted.id} was successful!`);
      console.log(`Fulfilling order for customer email: ${checkoutSessionCompleted.customer_details?.email}`);
      // Then define and call a function to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`[SUCCESS] PaymentIntent for ${paymentIntent.amount} was successful!`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

// Middleware for normal JSON endpoints
app.use(express.json());

// Create Checkout Session Endpoint
app.post('/create-checkout-session', async (req, res) => {
  // In a real app, this interacts with Stripe. We will mock the response perfectly.
  res.json({
    id: 'cs_test_a1b2c3d4e5f6',
    url: 'https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6'
  });
});

app.listen(4242, () => console.log('Running on port 4242'));
