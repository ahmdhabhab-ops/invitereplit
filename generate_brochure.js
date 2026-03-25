const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ 
  size: 'A4', 
  margin: 0,
  info: {
    Title: 'Einvite - Professional Digital Invitations',
    Author: 'Einvite',
    Subject: 'Sales Brochure',
  }
});

const OUTPUT = '/home/runner/workspace/einvite-brochure.pdf';
doc.pipe(fs.createWriteStream(OUTPUT));

// Brand colors
const PURPLE = '#6A3FDA';
const PURPLE_DARK = '#4A2AB0';
const PURPLE_LIGHT = '#EDE8FF';
const PURPLE_MID = '#9B72FF';
const WHITE = '#FFFFFF';
const DARK = '#1A1A2E';
const GRAY = '#64748B';
const LIGHT_GRAY = '#F8F7FF';
const ACCENT = '#FFD700';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LOGO = path.join('/home/runner/workspace/attached_assets/Logo_1769975575984.png');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function drawRect(x, y, w, h, color, radius = 0) {
  doc.save().fillColor(color).roundedRect(x, y, w, h, radius).fill().restore();
}

function drawGradientBg() {
  // Purple gradient approximation with overlapping rects
  drawRect(0, 0, PAGE_W, PAGE_H, '#3D1CB0');
  drawRect(0, 0, PAGE_W * 0.6, PAGE_H * 0.7, '#5530D0', 0);
  // decorative circles
  doc.save().fillColor('#FFFFFF').opacity(0.04).circle(480, 100, 180).fill().restore();
  doc.save().fillColor('#FFFFFF').opacity(0.06).circle(100, 680, 220).fill().restore();
  doc.save().fillColor('#FFFFFF').opacity(0.03).circle(550, 500, 130).fill().restore();
}

function sectionTitle(text, x, y, color = PURPLE) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor(color).text(text.toUpperCase(), x, y, { characterSpacing: 2 });
  doc.moveTo(x, y + 14).lineTo(x + 35, y + 14).lineWidth(2).strokeColor(color).stroke();
}

function newPage() {
  doc.addPage({ size: 'A4', margin: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════

drawGradientBg();

// Top bar
drawRect(0, 0, PAGE_W, 6, PURPLE_MID);

// Logo area
try {
  // White rounded box behind logo
  drawRect(50, 48, 200, 72, 'rgba(255,255,255,0.12)', 12);
  doc.image(LOGO, 60, 55, { width: 180 });
} catch(e) {
  doc.font('Helvetica-Bold').fontSize(28).fillColor(WHITE).text('einvite.me', 55, 65);
}

// Website URL top right
doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.6)').text('www.einvite.me', PAGE_W - 160, 62, { width: 140, align: 'right' });

// Hero text
doc.font('Helvetica-Bold').fontSize(44).fillColor(WHITE)
   .text("Lebanon's #1", 50, 175, { width: 380, lineGap: 4 });

doc.font('Helvetica-Bold').fontSize(44).fillColor(ACCENT)
   .text('Digital Invitation', 50, 225, { width: 380, lineGap: 4 });

doc.font('Helvetica-Bold').fontSize(44).fillColor(WHITE)
   .text('Service', 50, 275, { width: 380 });

// Subtitle
doc.font('Helvetica').fontSize(14).fillColor('rgba(255,255,255,0.82)')
   .text('Beautiful. Interactive. Memorable.', 50, 338, { width: 380, lineGap: 6 });

doc.font('Helvetica').fontSize(11).fillColor('rgba(255,255,255,0.65)')
   .text('Premium digital invitations for weddings, events,\nbaptisms, and birthdays — crafted with elegance\nand shared with a single link.', 50, 365, { width: 360, lineGap: 5 });

// Stat boxes
const stats = [
  { val: '500+', label: 'Happy Couples' },
  { val: '1,000+', label: 'Events Created' },
  { val: '4.9★', label: 'Customer Rating' },
];
let sx = 50;
stats.forEach(s => {
  drawRect(sx, 470, 145, 72, 'rgba(255,255,255,0.12)', 10);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(ACCENT).text(s.val, sx + 12, 486, { width: 121, align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.75)').text(s.label, sx + 12, 514, { width: 121, align: 'center' });
  sx += 155;
});

// Vertical decorative bar
drawRect(PAGE_W - 8, 0, 8, PAGE_H, ACCENT);

// Bottom wave strip
drawRect(0, PAGE_H - 80, PAGE_W, 80, 'rgba(0,0,0,0.25)');
doc.font('Helvetica-Bold').fontSize(11).fillColor(ACCENT).text('PROFESSIONAL DIGITAL INVITATIONS  •  SINCE 2023  •  BEIRUT, LEBANON', 30, PAGE_H - 50, { width: PAGE_W - 60, align: 'center', characterSpacing: 1 });

// QR placeholder box (decorative)
drawRect(PAGE_W - 150, 160, 120, 260, 'rgba(255,255,255,0.08)', 14);
doc.font('Helvetica-Bold').fontSize(8).fillColor('rgba(255,255,255,0.5)').text('SCAN TO VISIT', PAGE_W - 145, 172, { width: 110, align: 'center', characterSpacing: 1 });
// Draw a simple decorative envelope icon in the box
doc.save().strokeColor('rgba(255,255,255,0.3)').lineWidth(1.5)
   .rect(PAGE_W - 136, 195, 92, 68).stroke()
   .moveTo(PAGE_W - 136, 195).lineTo(PAGE_W - 90, 232).lineTo(PAGE_W - 44, 195).stroke()
   .restore();
doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.5)').text('app.einvite.me', PAGE_W - 145, 278, { width: 110, align: 'center' });
doc.font('Helvetica-Bold').fontSize(7).fillColor('rgba(255,255,255,0.3)').text('Try a live demo →', PAGE_W - 145, 296, { width: 110, align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 2 — OUR SERVICES
// ═══════════════════════════════════════════════════════════════════════════

newPage();
drawRect(0, 0, PAGE_W, PAGE_H, LIGHT_GRAY);
drawRect(0, 0, PAGE_W, 110, PURPLE_DARK);
drawRect(PAGE_W - 8, 0, 8, PAGE_H, ACCENT);
doc.save().fillColor(PURPLE_MID).opacity(0.15).circle(PAGE_W, 0, 160).fill().restore();

// Header
doc.font('Helvetica-Bold').fontSize(28).fillColor(WHITE).text('Our Services', 48, 34);
doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.75)').text('Tailored digital invitations for every occasion', 48, 70);

// Service cards
const services = [
  {
    icon: '💍',
    title: 'Wedding Invitations',
    desc: 'Elegant, romantic designs for your special day. Multi-page interactive layouts with photo galleries, background music, and live RSVP tracking. Available in Arabic, English & French.',
    color: '#E8D5FF',
    accent: PURPLE,
  },
  {
    icon: '🎉',
    title: 'Event Invitations',
    desc: 'From corporate conferences to gala dinners, our event invitations make a lasting impression. Integrated maps, ticketing, and real-time guest management.',
    color: '#D5EEFF',
    accent: '#2563EB',
  },
  {
    icon: '🎂',
    title: 'Birthday Invitations',
    desc: 'Celebrate in style with vibrant, animated birthday invitations. Fun designs for all ages with countdown timers, RSVP buttons, and instant sharing.',
    color: '#FFE8D5',
    accent: '#EA7316',
  },
  {
    icon: '✝️',
    title: 'Baptism Invitations',
    desc: 'Grace and elegance for this sacred milestone. Soft, beautiful designs that honour the occasion with heartfelt messages and family photo galleries.',
    color: '#D5FFE8',
    accent: '#16A34A',
  },
];

let sy = 136;
services.forEach((s, i) => {
  const col = i % 2 === 0 ? 36 : PAGE_W / 2 + 10;
  if (i === 2) sy = 136 + 175;

  drawRect(col, sy, PAGE_W / 2 - 48, 158, WHITE, 12);
  // Accent top bar
  drawRect(col, sy, PAGE_W / 2 - 48, 5, s.accent, 0);

  // Icon bubble
  drawRect(col + 16, sy + 20, 44, 44, s.color, 22);
  doc.fontSize(22).text(s.icon, col + 22, sy + 26, { width: 32, align: 'center' });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK).text(s.title, col + 68, sy + 22, { width: PAGE_W / 2 - 130 });
  doc.font('Helvetica').fontSize(9.5).fillColor(GRAY).text(s.desc, col + 16, sy + 72, { width: PAGE_W / 2 - 64, lineGap: 3 });
});

// Key Features strip
sy = 136 + 175 + 165;
drawRect(36, sy, PAGE_W - 72, 145, WHITE, 12);
sectionTitle('KEY FEATURES', 52, sy + 14, PURPLE);

const features = [
  { icon: '📱', text: 'Mobile\nResponsive' },
  { icon: '📍', text: 'Google Maps\nIntegration' },
  { icon: '✉️', text: 'Real-Time\nRSVP' },
  { icon: '🌿', text: 'Eco-Friendly\n& Paperless' },
  { icon: '🎵', text: 'Background\nMusic' },
  { icon: '🌐', text: 'Multi-Language\nSupport' },
  { icon: '🔗', text: 'Instant\nLink Sharing' },
  { icon: '⚡', text: '24-48hr\nDelivery' },
];

let fx = 52;
features.forEach(f => {
  doc.fontSize(18).text(f.icon, fx, sy + 40, { width: 52, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).fillColor(GRAY).text(f.text, fx, sy + 66, { width: 52, align: 'center', lineGap: 1 });
  fx += 63;
});

// Bottom footer
drawRect(0, PAGE_H - 35, PAGE_W, 35, PURPLE_DARK);
doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.6)').text('info@einvite.me  •  +961 81 82 47 82  •  www.einvite.me  •  @einviteme', 30, PAGE_H - 22, { width: PAGE_W - 60, align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 3 — PRICING PACKAGES
// ═══════════════════════════════════════════════════════════════════════════

newPage();
drawRect(0, 0, PAGE_W, PAGE_H, LIGHT_GRAY);
drawRect(0, 0, PAGE_W, 110, PURPLE_DARK);
drawRect(PAGE_W - 8, 0, 8, PAGE_H, ACCENT);
doc.save().fillColor(PURPLE_MID).opacity(0.15).circle(0, PAGE_H, 200).fill().restore();

doc.font('Helvetica-Bold').fontSize(28).fillColor(WHITE).text('Pricing Packages', 48, 34);
doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.75)').text('One-time payment · No hidden fees · Ready in 24-48 hours', 48, 70);

const packages = [
  {
    name: 'ESSENTIAL',
    price: '$49',
    eur: '€45',
    desc: 'Perfect for simple, elegant invitations',
    bg: WHITE,
    highlight: false,
    features: [
      'Single-page invitation design',
      'Mobile responsive layout',
      'Custom date & location details',
      'Shareable WhatsApp/SMS link',
      '3 design revisions included',
      'Google Maps integration',
    ],
  },
  {
    name: 'PREMIUM',
    price: '$99',
    eur: '€91',
    desc: 'Most popular — for memorable events',
    bg: PURPLE,
    highlight: true,
    features: [
      'Multi-page interactive design',
      'Photo gallery integration',
      'Background music of your choice',
      'Live RSVP tracking dashboard',
      '5 design revisions included',
      'Custom animations & effects',
      'Priority design team support',
    ],
  },
  {
    name: 'ROYAL',
    price: '$199',
    eur: '€183',
    desc: 'Ultimate luxury experience',
    bg: DARK,
    highlight: false,
    features: [
      'Everything in Premium, plus:',
      'Video background integration',
      'Guest messaging system',
      'Live countdown timer',
      'Unlimited design revisions',
      'Priority 24/7 support',
      'Custom domain option',
    ],
  },
];

packages.forEach((pkg, i) => {
  const px = 36 + i * (PAGE_W - 72) / 3;
  const pw = (PAGE_W - 72) / 3 - 8;
  const ph = 470;
  const ptop = 128;

  drawRect(px, ptop, pw, ph, pkg.bg, 12);

  if (pkg.highlight) {
    // Popular badge
    drawRect(px + pw / 2 - 52, ptop - 14, 104, 22, ACCENT, 11);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK)
       .text('⭐  MOST POPULAR', px + pw / 2 - 52, ptop - 9, { width: 104, align: 'center', characterSpacing: 0.5 });
    // Glow border
    doc.save().rect(px, ptop, pw, ph).lineWidth(2).strokeColor(ACCENT).stroke().restore();
  }

  const textColor = pkg.highlight ? WHITE : (pkg.bg === DARK ? '#E0E0FF' : DARK);
  const subColor = pkg.highlight ? 'rgba(255,255,255,0.75)' : GRAY;

  doc.font('Helvetica-Bold').fontSize(11).fillColor(pkg.highlight ? ACCENT : (pkg.bg === DARK ? ACCENT : PURPLE))
     .text(pkg.name, px + 14, ptop + 20, { width: pw - 28, align: 'center', characterSpacing: 2 });

  doc.font('Helvetica-Bold').fontSize(34).fillColor(textColor)
     .text(pkg.price, px + 14, ptop + 42, { width: pw - 28, align: 'center' });
  
  doc.font('Helvetica').fontSize(8.5).fillColor(subColor)
     .text(pkg.eur + '  one-time payment', px + 14, ptop + 84, { width: pw - 28, align: 'center' });

  // divider
  doc.moveTo(px + 20, ptop + 108).lineTo(px + pw - 20, ptop + 108)
     .lineWidth(0.5).strokeColor(pkg.highlight ? 'rgba(255,255,255,0.2)' : '#E2E8F0').stroke();

  doc.font('Helvetica').fontSize(8.5).fillColor(subColor)
     .text(pkg.desc, px + 14, ptop + 116, { width: pw - 28, align: 'center', lineGap: 2 });

  let fy = ptop + 150;
  pkg.features.forEach(f => {
    doc.font('Helvetica').fontSize(8).fillColor(pkg.highlight ? 'rgba(255,255,255,0.9)' : textColor)
       .text('✓  ' + f, px + 16, fy, { width: pw - 32, lineGap: 1 });
    fy += 19;
  });

  // CTA button
  const btnY = ptop + ph - 52;
  drawRect(px + 14, btnY, pw - 28, 32, pkg.highlight ? ACCENT : PURPLE, 8);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(pkg.highlight ? DARK : WHITE)
     .text('Get Started', px + 14, btnY + 10, { width: pw - 28, align: 'center' });
});

// Trust badges
const trust = ['🔒 Secure Payment', '⚡ Fast 24-48hr Delivery', '✅ Satisfaction Guaranteed', '📞 Dedicated Support'];
let tx = 36;
trust.forEach(t => {
  doc.font('Helvetica').fontSize(8.5).fillColor(GRAY).text(t, tx, 128 + 470 + 18, { width: (PAGE_W - 72) / 4, align: 'center' });
  tx += (PAGE_W - 72) / 4;
});

// Footer
drawRect(0, PAGE_H - 35, PAGE_W, 35, PURPLE_DARK);
doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.6)').text('info@einvite.me  •  +961 81 82 47 82  •  www.einvite.me  •  @einviteme', 30, PAGE_H - 22, { width: PAGE_W - 60, align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 4 — PARTNER PROGRAM
// ═══════════════════════════════════════════════════════════════════════════

newPage();
drawRect(0, 0, PAGE_W, PAGE_H, LIGHT_GRAY);
drawRect(0, 0, PAGE_W, 110, PURPLE_DARK);
drawRect(PAGE_W - 8, 0, 8, PAGE_H, ACCENT);

doc.font('Helvetica-Bold').fontSize(28).fillColor(WHITE).text('Partner Program', 48, 34);
doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.75)').text('For event professionals, wedding planners & agencies', 48, 70);

// Intro
drawRect(36, 128, PAGE_W - 80, 68, WHITE, 10);
doc.font('Helvetica').fontSize(10.5).fillColor(GRAY)
   .text('Join Einvite\'s exclusive partner network and offer your clients premium digital invitations at special rates. Whether you manage 5 or 500+ events per year, we have a tier designed to grow your business while keeping your clients delighted.', 52, 142, { width: PAGE_W - 112, lineGap: 4 });

// Partner tiers
const tiers = [
  {
    name: 'Silver Partner',
    events: '1–10 events/year',
    discount: '15%',
    color: '#C0C0C0',
    bg: '#F8F8F8',
    features: ['10% discount on all packages', 'Standard support', 'Partner badge & certificate'],
  },
  {
    name: 'Gold Partner',
    events: '11–50 events/year',
    discount: '25%',
    color: ACCENT,
    bg: '#FFFBEB',
    features: ['25% discount on all packages', 'Priority support line', 'White-label option', 'Custom branded templates'],
  },
  {
    name: 'Platinum Partner',
    events: '50+ events/year',
    discount: '40%',
    color: PURPLE_MID,
    bg: '#F3EEFF',
    features: ['40% discount on all packages', 'Dedicated account manager', 'Free rush delivery included', 'Co-marketing opportunities', 'API access for integration'],
  },
];

let tp = 216;
tiers.forEach(tier => {
  drawRect(36, tp, PAGE_W - 80, 128, tier.bg, 12);
  doc.save().rect(36, tp, 6, 128).fillColor(tier.color).fill().restore();

  // Discount badge
  drawRect(PAGE_W - 130, tp + 18, 78, 40, tier.color, 8);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(tier.color === ACCENT ? DARK : WHITE)
     .text(tier.discount, PAGE_W - 130, tp + 20, { width: 78, align: 'center' });
  doc.font('Helvetica').fontSize(7).fillColor(tier.color === ACCENT ? DARK : WHITE)
     .text('DISCOUNT', PAGE_W - 130, tp + 42, { width: 78, align: 'center', characterSpacing: 1 });

  doc.font('Helvetica-Bold').fontSize(14).fillColor(DARK).text(tier.name, 52, tp + 18);
  doc.font('Helvetica').fontSize(9).fillColor(GRAY).text(tier.events, 52, tp + 38);

  const cols = [52, 52 + (PAGE_W - 200) / 3, 52 + (PAGE_W - 200) * 2 / 3];
  tier.features.forEach((f, fi) => {
    const fx2 = cols[fi % 3] ?? cols[0];
    const fy2 = tp + 60 + Math.floor(fi / 3) * 20;
    doc.font('Helvetica').fontSize(8.5).fillColor(DARK).text('✓  ' + f, fx2, fy2, { width: (PAGE_W - 200) / 3 - 10 });
  });

  tp += 142;
});

// Benefits section
drawRect(36, tp + 8, PAGE_W - 80, 185, WHITE, 10);
sectionTitle('PARTNER BENEFITS', 52, tp + 22, PURPLE);

const benefits = [
  { icon: '💰', title: 'Exclusive Discounts', desc: 'Up to 40% off on all invitation packages' },
  { icon: '🎯', title: 'Dedicated Support', desc: 'Account manager & 24/7 priority service' },
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Guaranteed 24–48 hour rush delivery' },
  { icon: '🏷️', title: 'White Label', desc: 'Co-branded invitations with your logo' },
  { icon: '📊', title: 'Partner Directory', desc: 'Featured listing & referral program' },
  { icon: '🎨', title: 'Premium Templates', desc: 'Exclusive access to premium designs' },
];

let bx = 52, by = tp + 42;
benefits.forEach((b, bi) => {
  if (bi === 3) { bx = 52; by = tp + 110; }
  drawRect(bx, by, (PAGE_W - 116) / 3, 52, PURPLE_LIGHT, 8);
  doc.fontSize(16).text(b.icon, bx + 8, by + 8, { width: 28 });
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK).text(b.title, bx + 38, by + 8, { width: (PAGE_W - 116) / 3 - 48 });
  doc.font('Helvetica').fontSize(7.5).fillColor(GRAY).text(b.desc, bx + 38, by + 24, { width: (PAGE_W - 116) / 3 - 48, lineGap: 2 });
  bx += (PAGE_W - 116) / 3 + 8;
});

// Footer
drawRect(0, PAGE_H - 35, PAGE_W, 35, PURPLE_DARK);
doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.6)').text('info@einvite.me  •  +961 81 82 47 82  •  www.einvite.me  •  @einviteme', 30, PAGE_H - 22, { width: PAGE_W - 60, align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 5 — HOW IT WORKS + CONTACT
// ═══════════════════════════════════════════════════════════════════════════

newPage();
drawRect(0, 0, PAGE_W, PAGE_H, LIGHT_GRAY);
drawRect(0, 0, PAGE_W, 110, PURPLE_DARK);
drawRect(PAGE_W - 8, 0, 8, PAGE_H, ACCENT);
doc.save().fillColor(PURPLE_MID).opacity(0.1).circle(PAGE_W / 2, PAGE_H / 2 + 80, 280).fill().restore();

doc.font('Helvetica-Bold').fontSize(28).fillColor(WHITE).text('How It Works', 48, 34);
doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.75)').text('Four simple steps from order to launch', 48, 70);

// Steps
const steps = [
  { num: '01', title: 'Pick a Plan', desc: 'Choose Essential, Premium, or Royal based on your occasion and budget.' },
  { num: '02', title: 'Fill the Form', desc: 'Share event details, photos, song preferences, and location information.' },
  { num: '03', title: 'Design Review', desc: 'Our designers craft your unique invitation. Request revisions until perfect.' },
  { num: '04', title: 'Go Live', desc: 'Share your invitation instantly via WhatsApp, SMS, or any social platform.' },
];

steps.forEach((step, i) => {
  const sx2 = i % 2 === 0 ? 36 : PAGE_W / 2 + 12;
  const sy2 = i < 2 ? 132 : 132 + 130;
  drawRect(sx2, sy2, PAGE_W / 2 - 52, 112, WHITE, 12);
  drawRect(sx2, sy2, PAGE_W / 2 - 52, 5, PURPLE, 0);

  // Number circle
  drawRect(sx2 + 16, sy2 + 18, 44, 44, PURPLE_LIGHT, 22);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(PURPLE).text(step.num, sx2 + 16, sy2 + 28, { width: 44, align: 'center' });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK).text(step.title, sx2 + 70, sy2 + 22, { width: PAGE_W / 2 - 130 });
  doc.font('Helvetica').fontSize(9.5).fillColor(GRAY).text(step.desc, sx2 + 70, sy2 + 44, { width: PAGE_W / 2 - 130, lineGap: 3 });
});

// Testimonial
const tsY = 132 + 130 + 120 + 16;
drawRect(36, tsY, PAGE_W - 80, 85, PURPLE, 12);
doc.font('Helvetica-Bold').fontSize(24).fillColor(ACCENT).text('"', 52, tsY + 8);
doc.font('Helvetica').fontSize(10).fillColor(WHITE)
   .text('Einvite made our wedding so memorable. Our guests were amazed by the interactive invitation — they could RSVP, get directions, and hear our song all in one place!', 72, tsY + 16, { width: PAGE_W - 160, lineGap: 3 });
doc.font('Helvetica-Bold').fontSize(8.5).fillColor(ACCENT).text('— Sarah & Michel, Beirut', 72, tsY + 62);

// Contact section
const ctY = tsY + 100;
drawRect(36, ctY, PAGE_W - 80, 185, WHITE, 12);
sectionTitle('GET IN TOUCH', 52, ctY + 16, PURPLE);

const contacts = [
  { icon: '📞', label: 'Phone / WhatsApp', value: '+961 81 82 47 82' },
  { icon: '✉️', label: 'Email', value: 'info@einvite.me' },
  { icon: '🌐', label: 'Website', value: 'www.einvite.me' },
  { icon: '📸', label: 'Instagram', value: '@einviteme' },
  { icon: '📘', label: 'Facebook', value: '/einviteme' },
  { icon: '🎵', label: 'TikTok', value: '@einviteme' },
];

let cx2 = 52, cy2 = ctY + 38;
contacts.forEach((c, ci) => {
  if (ci === 3) { cx2 = 52; cy2 = ctY + 110; }
  drawRect(cx2, cy2, (PAGE_W - 116) / 3, 52, PURPLE_LIGHT, 8);
  doc.fontSize(18).text(c.icon, cx2 + 10, cy2 + 10);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(PURPLE).text(c.label, cx2 + 36, cy2 + 10, { width: (PAGE_W - 116) / 3 - 46 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK).text(c.value, cx2 + 36, cy2 + 26, { width: (PAGE_W - 116) / 3 - 46 });
  cx2 += (PAGE_W - 116) / 3 + 8;
});

// CTA Banner
const ctaY = ctY + 195;
drawRect(36, ctaY, PAGE_W - 80, 65, PURPLE, 12);
doc.font('Helvetica-Bold').fontSize(15).fillColor(WHITE).text('Ready to create your perfect invitation?', 52, ctaY + 12, { width: PAGE_W - 200 });
doc.font('Helvetica').fontSize(10).fillColor('rgba(255,255,255,0.8)').text('Order today at app.einvite.me or WhatsApp us directly.', 52, ctaY + 34, { width: PAGE_W - 200 });
drawRect(PAGE_W - 150, ctaY + 14, 100, 36, ACCENT, 8);
doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK).text('Order Now →', PAGE_W - 150, ctaY + 26, { width: 100, align: 'center' });

// Footer
drawRect(0, PAGE_H - 35, PAGE_W, 35, PURPLE_DARK);
doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.6)').text('© 2025 Einvite. All rights reserved.  •  info@einvite.me  •  +961 81 82 47 82', 30, PAGE_H - 22, { width: PAGE_W - 60, align: 'center' });

// ─── DONE ────────────────────────────────────────────────────────────────────
doc.end();
console.log('PDF generated:', OUTPUT);
