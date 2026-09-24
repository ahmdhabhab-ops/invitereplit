import express, { type Express } from "express";
import compression from "compression";
import fs from "fs";
import path from "path";

const SITE_URL = "https://einvite.me";

type PageMeta = { title: string; description: string; noindex?: boolean };

const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "einvite.me | #1 Digital Wedding & Event Invitations in Lebanon",
    description:
      "Premium digital wedding invitations in Lebanon with instant RSVP tracking. Professional, elegant designs for weddings, birthdays, and events. Save time and costs with digital invites.",
  },
  "/wedding-invitations-lebanon": {
    title: "Digital Wedding Invitations in Lebanon | einvite.me",
    description:
      "Elegant digital wedding invitations for Lebanese couples: RSVP tracking, Google Maps locations, music, and Arabic, English & French designs. Serving Beirut and all of Lebanon.",
  },
  "/birthday-event-invites": {
    title: "Birthday & Event Digital Invitations in Lebanon | einvite.me",
    description:
      "Digital invitations for birthdays, baptisms, engagements and corporate events in Lebanon. Beautiful designs, instant WhatsApp sharing and real-time RSVP tracking.",
  },
  "/event-planners": {
    title: "Partner Program for Event Planners in Lebanon | einvite.me",
    description:
      "Wedding and event planners in Lebanon: partner with einvite.me to offer your clients premium digital invitations with RSVP tracking, and earn with every event.",
  },
  "/about": {
    title: "About einvite.me | Digital Invitations Made in Lebanon",
    description:
      "Learn about einvite.me, the Lebanese team behind elegant, eco-friendly digital invitations for weddings and events across Lebanon.",
  },
  "/careers": {
    title: "Careers at einvite.me | Jobs in Lebanon",
    description:
      "Join the einvite.me team in Dekwaneh, Lebanon. See our open positions and apply online.",
  },
  "/referral": {
    title: "Make Money With einvite.me | Referral Program",
    description:
      "Refer couples and event hosts to einvite.me and earn a commission on every digital invitation order.",
  },
  "/terms": {
    title: "Terms & Conditions | einvite.me",
    description: "Terms and conditions for using einvite.me digital invitation services.",
  },
  "/privacy": {
    title: "Privacy Policy | einvite.me",
    description: "How einvite.me collects, uses and protects your personal information.",
  },
  "/admin": { title: "Admin | einvite.me", description: "", noindex: true },
  "/gallery-access": { title: "Gallery Access | einvite.me", description: "", noindex: true },
};

const NOINDEX_PREFIXES = ["/gallery/"];

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function renderPage(template: string, pagePath: string, meta: PageMeta) {
  const url = pagePath === "/" ? SITE_URL : `${SITE_URL}${pagePath}`;
  const title = escapeAttr(meta.title);
  const description = escapeAttr(meta.description);
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  if (meta.description) {
    html = html
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
  }
  if (meta.noindex) {
    html = html.replace("</head>", `  <meta name="robots" content="noindex" />\n  </head>`);
  }
  return html;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const template = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  app.use(compression());

  // Vite puts a content hash in every file name under /assets, so they never change in place.
  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), { immutable: true, maxAge: "1y", fallthrough: false }),
  );
  app.use(express.static(distPath, { index: false }));

  app.get("/{*path}", (req, res) => {
    const pagePath = req.path.length > 1 ? req.path.replace(/\/+$/, "") : req.path;
    const known = PAGE_META[pagePath];
    res.set("Cache-Control", "no-cache");
    res.type("html");
    if (known) {
      return res.send(renderPage(template, pagePath, known));
    }
    if (NOINDEX_PREFIXES.some((prefix) => pagePath.startsWith(prefix))) {
      return res.send(renderPage(template, pagePath, { title: "einvite.me", description: "", noindex: true }));
    }
    res.status(404).send(
      renderPage(template, pagePath, { title: "Page Not Found | einvite.me", description: "", noindex: true }),
    );
  });
}
