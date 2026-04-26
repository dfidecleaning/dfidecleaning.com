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
    const { paymentMethod, amount, bookingNum, clientEmail, service } = await req.json();
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Create payment intent with saved payment method
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(),
        currency: 'usd',
        payment_method: paymentMethod,
        confirm: 'true',
        off_session: 'true',
        'metadata[booking_number]': bookingNum || '',
        'metadata[type]': 'balance',
        description: "D'Fide Cleaning Balance " + (bookingNum || ''),
        receipt_email: clientEmail || '',
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: result.error?.message }), { status: 400, headers: cors });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
}
