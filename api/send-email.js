export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { to, type, data } = await req.json();
    const resendKey = process.env.RESEND_KEY;

    const svcNames = { standard:'Standard Clean', deep:'Deep Clean', moveinout:'Move In/Out', airbnb:'Airbnb Turnover' };

    const subjects = {
      confirmation: `✅ Booking Confirmed — ${data.bookingNum} | D'Fide Cleaning`,
      review: `⭐ How did we do? Leave a review | D'Fide Cleaning`,
      reminder: `⏰ Reminder: Your cleaning is tomorrow | D'Fide Cleaning`,
    };

    const htmlMap = {
      confirmation: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#1a2744;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#c9a84c;margin:0;font-size:22px">D'Fide Cleaning Services</h1>
        </div>
        <div style="background:#f8f7f4;padding:24px;border-radius:0 0 12px 12px">
          <h2 style="color:#1a2744">Booking Confirmed! 🎉</h2>
          <p>Hi ${data.name},</p>
          <p>Your booking is confirmed. Here's your summary:</p>
          <div style="background:white;border-radius:8px;padding:16px;margin:16px 0;font-size:14px">
            <p><strong>Booking #:</strong> ${data.bookingNum}</p>
            <p><strong>Service:</strong> ${svcNames[data.service] || data.service}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Deposit:</strong> $${data.deposit}</p>
            <p><strong>Balance Due Day-Of:</strong> $${data.total - data.deposit}</p>
          </div>
          <p>Questions? Text or call us at (551) 403-8397</p>
          <p style="color:#9a9590;font-size:12px">D'Fide Cleaning Services — Bergen & Essex County, NJ 🌿</p>
        </div>
      </div>`,
      review: `<div style="fon
