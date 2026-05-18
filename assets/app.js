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

  // RFQ submit — assemble mailto URL with all field values
  const form = document.querySelector('form.rfq-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
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
        const msg = form.querySelector('.form-message');
        if (msg) msg.textContent = 'Please complete all required fields and tick all three acknowledgments before submitting.';
        return;
      }
      const data = new FormData(form);
      const lines = [];
      for (const [k, v] of data.entries()) {
        if (k.startsWith('ack_')) continue;
        if (k === 'photos') continue; // handled separately
        lines.push(k.replace(/_/g, ' ') + ': ' + v);
      }

      // List photo filenames so the recipient knows what to expect
      let photoNote = '';
      if (photoInput && photoInput.files && photoInput.files.length > 0) {
        const names = Array.from(photoInput.files).map(f => '- ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB)');
        photoNote = '\n\nReference photos to attach (' + photoInput.files.length + '):\n' + names.join('\n') +
                    '\n\nIMPORTANT: please drag the listed files into this email before sending. ' +
                    'Browser email links cannot pre-attach files automatically.';
      }

      const subject = encodeURIComponent('Sun Top — RFQ from ' + (data.get('name') || 'website'));
      const body = encodeURIComponent(
        'New RFQ submitted via suntoptrade.com\n\n' +
        lines.join('\n') +
        '\n\nAcknowledgments:\n' +
        '- Delivery responsibility: confirmed\n' +
        '- Sea freight timeline: confirmed\n' +
        '- T&Cs accepted: confirmed\n' +
        photoNote
      );
      window.location.href = 'mailto:sales@suntoptrade.com?subject=' + subject + '&body=' + body;
    });
  }
});
