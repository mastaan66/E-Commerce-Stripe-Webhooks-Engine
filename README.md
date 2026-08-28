# E-Commerce Stripe Webhooks Engine

An event driven Node.js backend that connects Stripe payments to local order state. The service verifies webhook signatures with the raw body, handles lifecycle events, and fulfills orders only after payment confirmation.

The engine separates payment acceptance from order logic, so the store can rely on Stripe as the source of truth and keep the database consistent.

## Why this exists

Client side payment confirmation can be spoofed. A secure backend must verify the Stripe signature on the raw payload and drive state transitions from webhook events. This repo shows that pattern in a small, readable service.

## What it does

- Creates mock Checkout Sessions from the backend
- Verifies `stripe-signature` on the raw body for `POST /webhook`
- Handles `checkout.session.completed` and `payment_intent.succeeded` via an event switch
- Fulfills orders after extracting `customer_details.email` only on confirmed payment
- Uses `express.raw()` for the webhook route and `express.json()` for normal routes

## Project structure

```text
.
├── server.js          # Express app with webhook and checkout session routes
├── package.json
└── README.md
```

## Prerequisites

- Node 20 or later
- Stripe CLI for local webhook forwarding, or curl for simulation

## Installation

```bash
git clone https://github.com/mastaan66/E-Commerce-Stripe-Webhooks-Engine.git
cd E-Commerce-Stripe-Webhooks-Engine

npm install
```

Create an `.env` file

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=4242
```

The current `server.js:1` uses mock keys for demonstration. Replace them with `process.env.STRIPE_SECRET_KEY` and `process.env.STRIPE_WEBHOOK_SECRET` before using real Stripe accounts.

## Usage

Start the server

```bash
npm start
# or
node server.js
```

The server runs on port 4242.

Create a Checkout Session

```bash
curl -i -X POST http://localhost:4242/create-checkout-session \
  -H 'Content-Type: application/json'
```

Simulate a webhook without Stripe CLI

```bash
curl -i -X POST -H 'Content-Type: application/json' \
  -H 'stripe-signature: mock_signature' \
  -d '{"type":"checkout.session.completed","data":{"object":{"id":"cs_test_123","customer_details":{"email":"test@example.com"}}}}' \
  http://localhost:4242/webhook
```

Expected output

```text
[SUCCESS] Payment for session cs_test_123 was successful!
Fulfilling order for customer email: test@example.com
```

Forward real events with Stripe CLI

```bash
stripe listen --forward-to localhost:4242/webhook
stripe trigger checkout.session.completed
```

## Verification

In production, replace the mock branch in `server.js:1` with

```js
event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
```

The service must return 400 on signature failure and 200 on success so Stripe stops retrying.

## Limitations

- Checkout Session creation is mocked and does not call Stripe
- No database is included, order fulfillment is logged, not persisted
- Mock signature path is for local testing only, not for production

## Contributing

Issues and pull requests are welcome. Enforce signature verification and keep the webhook handler free of side effects that can be retried.

## License

MIT. See `LICENSE`.

