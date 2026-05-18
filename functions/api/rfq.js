// SunTop Trade — RFQ pipeline (Cloudflare Pages Function)
//
// POST /api/rfq with JSON body from the website RFQ form.
// Sends two transactional emails via Brevo:
//   1) Auto-reply to the buyer (sets 48h expectation)
//   2) Notification to suntoptrade8@gmail.com (with full RFQ details, replyTo = buyer)
//
// Brevo API key is stored as the BREVO_API_KEY environment variable in the
// Cloudflare Pages project settings. Set via:
//   wrangler pages secret put BREVO_API_KEY --project-name=suntoptrade
//
// CORS: same-origin, no extra headers needed when the form is on suntoptrade.com.
// Returns: { ok: true, messageIds: [...] } on success, { ok: false, error } on failure.

const SENDER = { name: 'SunTop Trade', email: 'sales@suntoptrade.com' };
const INTERNAL_RECIPIENT = { email: 'suntoptrade8@gmail.com', name: 'Frank' };
const NOTION_DB_URL = 'https://www.notion.so/30ef5bca66b746ec936c888cff7befd0';

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json', ...corsHeaders() },
    });

  if (!env.BREVO_API_KEY) {
    return json({ ok: false, error: 'BREVO_API_KEY env var not set on Pages project.' }, 500);
  }

  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  // Honeypot / sanity
  if (!data.email || !data.name) {
    return json({ ok: false, error: 'Name and email are required.' }, 400);
  }
  if (data.honeypot) {
    // Silently succeed if a bot filled the honeypot
    return json({ ok: true, messageIds: [], honeypot: true });
  }

  // Helper to send via Brevo
  async function sendBrevo(payload) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Brevo ${res.status}: ${text.slice(0, 400)}`);
    }
    return await res.json();
  }

  const name = data.name || '';
  const email = data.email || '';
  const phone = data.phone || '';
  const wechat = data.wechat || '';
  const buyerType = data.buyer_type || '';
  const company = data.company || '';
  const abn = data.abn || '';
  const product = data.product || '';
  const quantity = data.quantity || '';
  const orderValue = data.order_value || '';
  const orderValueNum = data.order_value_num != null ? Number(data.order_value_num) : '';
  const targetPrice = data.target_price || '';
  const timeline = data.timeline || '';
  const destination = data.destination || '';
  const gstPref = data.gst_pref || '';
  const notes = data.notes || '';
  const photos = data.photos || '';
  const sourcePage = data.source_page || '';
  const submittedAt = data.submitted_at || new Date().toISOString();

  // ===== 1. Auto-reply to buyer =====
  const autoReply = {
    sender: SENDER,
    to: [{ email, name }],
    replyTo: { email: 'sales@suntoptrade.com', name: 'SunTop Trade' },
    subject: 'Got your RFQ — SunTop Trade sourcing team',
    htmlContent: `
      <div style="font-family:Manrope,Arial,sans-serif;max-width:560px;line-height:1.6;color:#0F0F0E;">
        <h1 style="font-family:Fraunces,Georgia,serif;font-size:1.55rem;font-weight:500;letter-spacing:-0.01em;margin-bottom:1rem;color:#0F0F0E;">Got your RFQ. Quote on the way.</h1>
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for sending us your brief. This confirms your RFQ has been received and logged.</p>
        <p style="margin-bottom:0.4rem;"><strong>Quote turnaround:</strong></p>
        <ul>
          <li><strong>5–10 business days</strong> for active sourcing lanes (commercial furniture, LED lighting, sintered stone, shop fitouts, designer kitchens, cleaning equipment)</li>
          <li><strong>10–20 business days</strong> for cold-start sourcing (hi-fi, watches, art, vehicles, custom briefs)</li>
        </ul>
        <p>Your quote will include the full door-to-door AUD landed cost, indicative delivery timeline, and complete project terms.</p>
        <p style="margin-bottom:0.4rem;"><strong>What happens next:</strong></p>
        <ol>
          <li>Our sourcing team reviews your brief and category</li>
          <li>If active lane, we begin factory shortlist within 48 hours</li>
          <li>If cold-start, we verify candidates and notify you of timeline</li>
          <li>Sourcing engagement fee invoice arrives separately — 100% credited against your final invoice</li>
        </ol>
        <p>If you have additional photos, drawings, or spec sheets you couldn't attach in the form, please reply to this email with them.</p>
        <p style="margin-top:1.75rem;">— SunTop Trade Sourcing</p>
        <p style="color:#756E64;font-size:0.82rem;border-top:1px solid #E5E0D5;padding-top:0.9rem;margin-top:1.5rem;line-height:1.5;">
          Sun Top Trade Co., Limited · Hong Kong registered · BR 79445788<br>
          sales@suntoptrade.com · <a href="https://suntoptrade.com" style="color:#B8893B;">suntoptrade.com</a>
        </p>
      </div>
    `,
  };

  // ===== 2. Internal notification (rich summary) =====
  const internalNotif = {
    sender: { name: 'SunTop RFQ', email: 'sales@suntoptrade.com' },
    to: [INTERNAL_RECIPIENT],
    replyTo: { email, name }, // Reply goes back to the buyer directly
    subject: `🔔 New RFQ — ${name} — ${product.slice(0, 80)}`,
    htmlContent: `
      <div style="font-family:Manrope,Arial,sans-serif;max-width:620px;line-height:1.55;color:#0F0F0E;">
        <h2 style="font-family:Fraunces,Georgia,serif;font-weight:500;margin-bottom:0.5rem;">New RFQ — ${escapeHtml(name)}</h2>
        <p style="color:#756E64;font-size:0.88rem;margin-bottom:1.25rem;">Submitted ${escapeHtml(submittedAt)} via ${escapeHtml(sourcePage)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:0.93rem;">
          <tr><td style="padding:7px 0;color:#756E64;width:170px;">Buyer</td><td style="padding:7px 0;"><strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}" style="color:#B8893B;">${escapeHtml(email)}</a>&gt;</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">Phone / WeChat</td><td style="padding:7px 0;">${escapeHtml(phone)}${wechat ? ' · WeChat ' + escapeHtml(wechat) : ''}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">Buyer type</td><td style="padding:7px 0;">${escapeHtml(buyerType)}</td></tr>
          ${buyerType === 'Business' ? `<tr><td style="padding:7px 0;color:#756E64;">Company / ABN</td><td style="padding:7px 0;">${escapeHtml(company)}${abn ? ' · ABN ' + escapeHtml(abn) : ''}</td></tr>` : ''}
          <tr><td style="padding:7px 0;color:#756E64;vertical-align:top;">Product</td><td style="padding:7px 0;white-space:pre-wrap;">${escapeHtml(product)}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">Quantity</td><td style="padding:7px 0;">${escapeHtml(quantity)}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">Order value AUD</td><td style="padding:7px 0;"><strong>${escapeHtml(orderValue)}</strong>${orderValueNum ? ` <span style="color:#756E64;font-size:0.85rem;">(parsed: $${Number(orderValueNum).toLocaleString()})</span>` : ''}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">Target landed price</td><td style="padding:7px 0;">${escapeHtml(targetPrice) || '<span style="color:#B0A89C;">—</span>'}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">Timeline</td><td style="padding:7px 0;">${escapeHtml(timeline)}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">Destination</td><td style="padding:7px 0;">${escapeHtml(destination)}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;">GST preference</td><td style="padding:7px 0;">${escapeHtml(gstPref)}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;vertical-align:top;">Reference files</td><td style="padding:7px 0;">${escapeHtml(photos) || '<span style="color:#B0A89C;">none attached</span>'}</td></tr>
          <tr><td style="padding:7px 0;color:#756E64;vertical-align:top;">Other details</td><td style="padding:7px 0;white-space:pre-wrap;">${escapeHtml(notes) || '<span style="color:#B0A89C;">—</span>'}</td></tr>
        </table>
        <p style="margin-top:1.5rem;font-size:0.88rem;">
          <a href="${NOTION_DB_URL}" style="color:#B8893B;font-weight:600;">📋 Log this RFQ in Notion (Sun Top — Website RFQs)</a>
        </p>
        <p style="color:#756E64;font-size:0.78rem;border-top:1px solid #E5E0D5;padding-top:0.85rem;margin-top:1.25rem;">
          Pipeline: Website form → Cloudflare Pages Function → Brevo (auto-reply + this notification).<br>
          Reply directly to this email to respond to the buyer — replyTo is set to ${escapeHtml(email)}.
        </p>
      </div>
    `,
  };

  const messageIds = [];
  try {
    const r1 = await sendBrevo(autoReply);
    messageIds.push(r1.messageId || 'sent');
  } catch (e) {
    return json({ ok: false, error: 'auto-reply failed: ' + e.message }, 500);
  }
  try {
    const r2 = await sendBrevo(internalNotif);
    messageIds.push(r2.messageId || 'sent');
  } catch (e) {
    // Buyer auto-reply already sent — don't fail the whole request for the internal notif
    return json({ ok: true, messageIds, internalNotifError: e.message });
  }

  return json({ ok: true, messageIds });
}
