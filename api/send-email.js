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
    const body = await req.json();
    const { to, type, data } = body;
    const resendKey = process.env.RESEND_KEY;

    const svcNames = {
      standard: 'Standard Clean',
      deep: 'Deep Clean',
      moveinout: 'Move In/Out',
      airbnb: 'Airbnb Turnover'
    };

    let subject = '';
    let html = '';

    if (type === 'confirmation') {
      subject = 'Booking Confirmed - ' + data.bookingNum + ' | D\'Fide Cleaning';
      html = '<div style="font-family:sans-serif;max-width:560px;margin:0 auto">'
        + '<div style="background:#1a2744;padding:24px;border-radius:12px 12px 0 0;text-align:center">'
        + '<h1 style="color:#c9a84c;margin:0;font-size:22px">D\'Fide Cleaning Services</h1>'
        + '</div>'
        + '<div style="background:#f8f7f4;padding:24px;border-radius:0 0 12px 12px">'
        + '<h2 style="color:#1a2744">Booking Confirmed!</h2>'
        + '<p>Hi ' + data.name + ',</p>'
        + '<p>Your booking is confirmed. Here is your summary:</p>'
        + '<div style="background:white;border-radius:8px;padding:16px;margin:16px 0;font-size:14px">'
        + '<p><strong>Booking #:</strong> ' + data.bookingNum + '</p>'
        + '<p><strong>Service:</strong> ' + (svcNames[data.service] || data.service) + '</p>'
        + '<p><strong>Date:</strong> ' + data.date + '</p>'
        + '<p><strong>Deposit:</strong> $' + data.deposit + '</p>'
        + '<p><strong>Balance Due Day-Of:</strong> $' + (data.total - data.deposit) + '</p>'
        + '</div>'
        + '<p>Questions? Text or call us at (551) 403-8397</p>'
        + '<p style="color:#9a9590;font-size:12px">D\'Fide Cleaning Services - Bergen and Essex County, NJ</p>'
        + '</div>'
        + '</div>';
    } else if (type === 'review') {
      subject = 'How did we do? Leave a review | D\'Fide Cleaning';
      html = '<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px;text-align:center">'
        + '<div style="background:#1a2744;padding:20px;border-radius:12px">'
        + '<h1 style="color:#c9a84c">D\'Fide Cleaning Services</h1>'
        + '</div>'
        + '<h2 style="color:#1a2744;margin-top:20px">How did we do, ' + data.name + '?</h2>'
        + '<p>We hope your home is sparkling!</p>'
        + '<a href="https://g.page/r/CcFplXLBHf5TEBI/review" style="display:inline-block;background:#c9a84c;color:#1a2744;padding:14px 28px;border-radius:8px;font-weight:bold;text-decoration:none;margin:16px 0">Leave a Google Review</a>'
        + '</div>';
    } else if (type === 'reminder') {
      subject = 'Reminder: Your cleaning is tomorrow | D\'Fide Cleaning';
      html = '<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px">'
        + '<div style="background:#1a2744;padding:20px;border-radius:12px;text-align:center">'
        + '<h1 style="color:#c9a84c">D\'Fide Cleaning Services</h1>'
        + '</div>'
        + '<p>Hi ' + data.name + ',</p>'
        + '<p>This is a reminder that your cleaning is scheduled for <strong>tomorrow, ' + data.date + '</strong>.</p>'
        + '<p>Questions? Text us at (551) 403-8397</p>'
        + '</div>';
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'D\'Fide Cleaning <info@dfidecleaning.com>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.status,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: cors
    });
  }
}
