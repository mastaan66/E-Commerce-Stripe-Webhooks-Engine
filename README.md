# E-Commerce Stripe Webhooks Engine

A resilient event-driven Node.js backend that securely interfaces with the **Stripe API** to bridge online payments with local database state machines. This project proves an understanding of Stripe's webhook architecture for real-world e-commerce scale.

## Core Features
1. **Checkout Session Creation**: Mocks generating Stripe Checkout Session tokens securely from the backend.
2. **Webhook Verification**: Uses `express.raw()` payloads to parse secure asymmetric signature payloads directly from Stripe `stripe-signature` headers.
3. **Event-Driven Architecture**: Uses an event switch-case state machine to handle the lifecycle of `checkout.session.completed` and `payment_intent.succeeded`.
4. **Order Fulfillment**: Extracts `customer_details.email` strictly after payment confirmation to build secure digital delivery pipelines.

## Tech Stack
- **Environment:** Node.js (v20+)
- **Framework:** Express.js 
- **Packages:** `stripe`, `body-parser`

## How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   node server.js
   ```
   *The server runs on port 4242.*

## Testing with an Active Stripe CLI (Or cURL)

To simulate a successful end-to-end webhook event bypassing the Stripe CLI, run this payload simulation command against your local server:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
-H 'stripe-signature: mock_signature' \
-d '{"type":"checkout.session.completed","data":{"object":{"id":"cs_test_123","customer_details":{"email":"test@example.com"}}}}' \
http://localhost:4242/webhook
```

**Expected Console Output:**
```
[SUCCESS] Payment for session cs_test_123 was successful!
Fulfilling order for customer email: test@example.com
```

*This engine allows your infrastructure to completely de-couple payment acceptance from application logic, maximizing reliability.*
