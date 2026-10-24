import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
              e
            </span>
            <span className="font-display text-lg font-bold">Epaws Solutions</span>
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Nurturing future tech leaders across Africa through hands-on coding education,
            consultancy and technology that works.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/services/$slug" params={{ slug: "school-coding-curriculum" }}>
                School coding curriculum
              </Link>
            </li>
            <li>
              <Link to="/services/$slug" params={{ slug: "it-consultancy" }}>
                IT consultancy
              </Link>
            </li>
            <li>
              <Link to="/services/$slug" params={{ slug: "computer-networking" }}>
                Computer networking
              </Link>
            </li>
            <li>
              <Link to="/services/$slug" params={{ slug: "coding-content-licensing" }}>
                Content licensing
              </Link>
            </li>
            <li>
              <Link to="/services/$slug" params={{ slug: "digital-books" }}>
                Digital books
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/about">About us</Link>
            </li>
            <li>
              <Link to="/how-we-work">How we work</Link>
            </li>
            <li>
              <Link to="/case-studies">Case studies</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/admin">Team login</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href="tel:+25477181963">+25477181963</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href="mailto:contact@epawssolution.com">contact@epawssolution.com</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href="mailto:sales@epawssolution.com">sales@epawssolution.com</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href="mailto:support@epawssolution.com">support@epawssolution.com</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>Nairobi, Kenya</span>
            </li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="grid size-9 place-items-center rounded-md border border-ink-muted/30"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn"
              className="grid size-9 place-items-center rounded-md border border-ink-muted/30"
            >
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-muted/20">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Epaws Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
