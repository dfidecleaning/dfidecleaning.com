export const config = { runtime: 'edge' };

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { amount, bookingNum, clientName, clientEmail, service } = await req.json();

    if (!amount || amount < 1) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400, headers: cors });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(),
        currency: 'usd',
        'metadata[booking_number]': bookingNum || '',
        'metadata[client_name]': clientName || '',
        'metadata[service]': service || '',
        description: "D'Fide Cleaning Deposit " + (bookingNum || ''),
        receipt_email: clientEmail || '',
      }),
    });

    const paymentIntent = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: paymentIntent.error?.message || 'Stripe error' }), { status: 400, headers: cors });
    }

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
}
