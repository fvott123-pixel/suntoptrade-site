// Sun Top — minimal client-side logic for nav + RFQ form + hero slideshow

// Mobile nav toggle (collapsible nav links)
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const right = document.querySelector('.nav-right');
  if (toggle && right) {
    toggle.addEventListener('click', () => {
      const open = right.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Legacy hero slideshow (v19)
  const slides = document.querySelectorAll('.hero-slideshow .slide');
  const dots   = document.querySelectorAll('.hero-slideshow .slide-progress-dot');
  const counter = document.querySelector('.hero-slideshow .slide-counter-num');
  if (slides.length > 1) {
    let i = 0;
    function show(n) {
      slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === n));
      if (counter) counter.textContent = String(n + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    }
    show(0);
    setInterval(() => { i = (i + 1) % slides.length; show(i); }, 3000);
    dots.forEach((d, idx) => d.addEventListener('click', () => { i = idx; show(i); }));
  }

  // v21 Cover carousel — product slideshow with per-slide card content
  const coverSlides = document.querySelectorAll('.cover-slide');
  const progBars   = document.querySelectorAll('.cover-progress .prog-bar');
  const progNum    = document.getElementById('prog-num');
  const productEl  = document.getElementById('cover-product');
  if (coverSlides.length > 1 && productEl) {
    const products = [
      { tag: 'Designer kitchens · Active', name: 'Sintered stone benchtops', desc: 'Calacatta, Carrara, and custom finishes. Large-format slabs straight from China’s stone cluster.', quote: '5–10 business days', lead: '12–14 weeks', href: 'request-a-quote.html?cat=designer-kitchens' },
      { tag: 'Sintered stone · Active', name: 'Large-format slab joinery', desc: 'Continuous-vein slabs for kitchens, vanities, feature walls, and bespoke joinery installs.', quote: '5–10 business days', lead: '10–12 weeks', href: 'request-a-quote.html?cat=designer-kitchens' },
      { tag: 'Luxury furniture · Active', name: 'Modular sofas & designer pieces', desc: 'Premium upholstery and case goods from factories that already supply European designer brands.', quote: '7–12 business days', lead: '12–16 weeks', href: 'request-a-quote.html?cat=luxury-furniture' },
      { tag: 'LED lighting · Active', name: 'Ring chandeliers & commercial fixtures', desc: 'Statement pendants, panels, downlights, and track systems — SAA-verified for AU commercial use.', quote: '5–10 business days', lead: '10–12 weeks', href: 'request-a-quote.html?cat=led-lighting' },
      { tag: 'Statement lighting · Active', name: 'Bubble chandeliers & decorative installs', desc: 'Hand-blown glass installations and large-scale decorative lighting for hospitality and luxury residential.', quote: '7–14 business days', lead: '12–18 weeks', href: 'request-a-quote.html?cat=led-lighting' },
      { tag: 'Shop fitouts · Active', name: 'Full retail & supermarket fitouts', desc: 'Turnkey packages — gondola shelving, checkouts, joinery, lighting, signage — one landed quote.', quote: '7–14 business days', lead: '12–16 weeks', href: 'request-a-quote.html?cat=shop-fitouts' }
    ];

    const tagEl  = productEl.querySelector('[data-product="tag"]');
    const nameEl = productEl.querySelector('[data-product="name"]');
    const descEl = productEl.querySelector('[data-product="desc"]');
    const quoteEl= productEl.querySelector('[data-product="quote"]');
    const leadEl = productEl.querySelector('[data-product="lead"]');

    let cur = 0;
    let timer = null;
    const INTERVAL = 5000;

    function paint(n) {
      cur = n;
      coverSlides.forEach((s, idx) => s.classList.toggle('active', idx === n));
      progBars.forEach((b, idx) => {
        b.classList.toggle('active', idx === n);
        if (idx === n) {
          const span = b.querySelector('span');
          if (span) {
            span.style.animation = 'none';
            void span.offsetWidth;
            span.style.animation = '';
          }
        }
      });
      const p = products[n];
      if (p) {
        if (tagEl) tagEl.textContent = p.tag;
        if (nameEl) nameEl.textContent = p.name;
        if (descEl) descEl.textContent = p.desc;
        if (quoteEl) quoteEl.textContent = p.quote;
        if (leadEl) leadEl.textContent = p.lead;
        productEl.setAttribute('href', p.href);
      }
      if (progNum) progNum.textContent = String(n + 1).padStart(2, '0');
    }
    function advance() { paint((cur + 1) % coverSlides.length); }
    function start() { stop(); timer = setInterval(advance, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    paint(0);
    start();

    const hero = document.querySelector('.cover-hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => {
        stop();
        progBars.forEach(b => b.classList.add('paused'));
      });
      hero.addEventListener('mouseleave', () => {
        progBars.forEach(b => b.classList.remove('paused'));
        start();
      });
    }

    progBars.forEach((b, idx) => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        paint(idx);
        start();
      });
    });
  }

  // RFQ form — buyer type radios show/hide business fields
  const buyerRadios = document.querySelectorAll('input[name="buyer_type"]');
  const businessBlock = document.querySelector('.business-only');
  if (buyerRadios.length && businessBlock) {
    function syncBusinessBlock() {
      const checked = document.querySelector('input[name="buyer_type"]:checked');
      if (checked && checked.value === 'Business') {
        businessBlock.classList.add('show');
      } else {
        businessBlock.classList.remove('show');
      }
    }
    buyerRadios.forEach(r => r.addEventListener('change', syncBusinessBlock));
    syncBusinessBlock();
  }

  // RFQ photo upload — show selected filenames inline
  const photoInput = document.querySelector('input[name="photos"]');
  const fileList = document.querySelector('.file-list');
  if (photoInput && fileList) {
    photoInput.addEventListener('change', () => {
      if (!photoInput.files || photoInput.files.length === 0) {
        fileList.textContent = '';
        return;
      }
      const names = Array.from(photoInput.files).map(f =>
        f.name + ' (' + Math.round(f.size / 1024) + ' KB)'
      );
      fileList.textContent = 'Selected: ' + names.join(', ');
    });
  }

  // Optional pre-fill from ?cat=... URL param
  (function prefillFromCat() {
    const cat = new URLSearchParams(location.search).get('cat');
    const productEl = document.getElementById('product');
    if (!cat || !productEl || productEl.value) return;
    const map = {
      'commercial-furniture': 'Commercial furniture — ',
      'luxury-furniture': 'Luxury furniture — ',
      'shop-fitouts': 'Shop / supermarket fitout — ',
      'led-lighting': 'LED commercial lighting — ',
      'designer-kitchens': 'Designer kitchen / sintered stone — ',
      'hifi-audio': 'Hi-fi / audio systems — ',
      'cleaning': 'Cleaning & facilities equipment — ',
      'retail-fixtures': 'Retail fixtures / industrial hardware — ',
      'custom': 'Custom sourcing — '
    };
    productEl.value = map[cat] || '';
    if (productEl.value) {
      try { productEl.focus(); productEl.setSelectionRange(productEl.value.length, productEl.value.length); } catch (e) {}
    }
  })();

  // Normalize form values to match Notion select options
  function normalizeTimeline(v) {
    return (v || '').replace(/–|—/g, '-'); // en/em dash -> hyphen
  }
  function normalizeGst(v) {
    const map = {
      'GST-registered-claiming': 'Claiming',
      'GST-registered-not-claiming': 'Not claiming',
      'Not-GST-registered': 'Private / non-registered'
    };
    return map[v] || v;
  }
  function parseMoney(v) {
    if (!v) return 0;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  // RFQ submit — POST to Cloudflare Pages Function (with mailto fallback if offline)
  const RFQ_WEBHOOK = '/api/rfq';
  const form = document.querySelector('form.rfq-form');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const msg = form.querySelector('.form-message');
      const submitBtn = form.querySelector('button[type="submit"]');

      const required = form.querySelectorAll('[required]');
      let ok = true;
      required.forEach(r => {
        if (!r.value || (r.type === 'checkbox' && !r.checked)) {
          r.style.borderColor = 'var(--accent)';
          ok = false;
        } else {
          r.style.borderColor = '';
        }
      });
      if (!ok) {
        if (msg) { msg.textContent = 'Please complete all required fields and tick all three acknowledgments before submitting.'; msg.style.color = 'var(--accent)'; }
        return;
      }

      // Build payload
      const data = new FormData(form);
      const photoNames = (photoInput && photoInput.files && photoInput.files.length)
        ? Array.from(photoInput.files).map(f => f.name + ' (' + Math.round(f.size / 1024) + ' KB)').join(', ')
        : '';

      const payload = {
        name: data.get('name') || '',
        email: data.get('email') || '',
        phone: data.get('phone') || '',
        wechat: data.get('wechat') || '',
        buyer_type: data.get('buyer_type') || '',
        company: data.get('company') || '',
        abn: data.get('abn') || '',
        product: data.get('product') || '',
        quantity: data.get('quantity') || '',
        order_value: data.get('order_value') || '',
        order_value_num: parseMoney(data.get('order_value')),
        target_price: data.get('target_price') || '',
        timeline: normalizeTimeline(data.get('timeline')),
        destination: data.get('destination') || '',
        gst_pref: normalizeGst(data.get('gst_pref')),
        notes: data.get('notes') || '',
        photos: photoNames,
        source_page: location.pathname,
        submitted_at: new Date().toISOString()
      };

      // Lock UI during send
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.6'; submitBtn.style.cursor = 'wait'; }
      if (msg) { msg.textContent = 'Sending your RFQ…'; msg.style.color = 'var(--muted)'; }

      let sent = false;
      try {
        const res = await fetch(RFQ_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        sent = res.ok;
      } catch (err) {
        sent = false;
      }

      if (sent) {
        // Replace form with confirmation
        const card = form.closest('.form') || form;
        card.innerHTML = '<div style="text-align:center;padding:1.5rem 0;">' +
          '<div style="width:64px;height:64px;border-radius:50%;background:var(--accent-soft);color:var(--accent);' +
          'display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;' +
          'font-family:Fraunces,serif;font-size:1.7rem;font-weight:500;border:1px solid var(--accent);">✓</div>' +
          '<h2 style="font-family:Fraunces,serif;font-weight:500;font-size:1.65rem;letter-spacing:-0.015em;margin-bottom:0.7rem;">Got your RFQ.</h2>' +
          '<p style="color:var(--muted);max-width:520px;margin:0 auto 1.25rem;line-height:1.6;">' +
          'A confirmation email has been sent to <strong style="color:var(--ink);">' + (payload.email || 'your inbox') + '</strong> ' +
          'with quote turnaround details. Our sourcing team will review your brief within 48 business hours and follow up.</p>' +
          (photoNames ?
            '<p style="font-size:0.88rem;color:var(--muted);max-width:520px;margin:0 auto 1.25rem;">' +
            '<strong style="color:var(--ink);">Reference files:</strong> if you weren\'t able to attach your photos / drawings, reply to the confirmation email with them attached.</p>' : '') +
          '<p class="fineprint" style="font-size:0.78rem;">Reference: ' + payload.submitted_at.split('T')[0] + ' · ' + (payload.name || 'website') + '</p>' +
          '</div>';
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback: open mailto draft so RFQ isn't lost
        if (msg) { msg.textContent = 'Network hiccup — opening your email instead. Your RFQ will land in our inbox either way.'; msg.style.color = 'var(--warn, #B8721A)'; }
        const lines = Object.entries(payload)
          .filter(([k]) => !['order_value_num','submitted_at','source_page'].includes(k))
          .map(([k, v]) => k.replace(/_/g, ' ') + ': ' + v);
        const subject = encodeURIComponent('SunTop Trade — RFQ from ' + (payload.name || 'website'));
        const body = encodeURIComponent(
          'New RFQ submitted via suntoptrade.com\n\n' +
          lines.join('\n') +
          '\n\nAcknowledgments: delivery responsibility / sea freight timeline / T&Cs all confirmed.\n' +
          (photoNames ? '\nReference files (please attach to this email):\n' + photoNames + '\n' : '')
        );
        setTimeout(() => { window.location.href = 'mailto:sales@suntoptrade.com?subject=' + subject + '&body=' + body; }, 1500);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; submitBtn.style.cursor = ''; }
      }
    });
  }
});
