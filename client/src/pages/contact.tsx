import { Layout } from "@/components/layout";
import { Phone, MapPin, Globe, Mail, Github, Linkedin } from "lucide-react";

const contactItems = [
  {
    icon: Phone,
    label: "Phone",
    value: "+234 810 097 8587",
    href: "tel:+2348100978587",
  },
  {
    icon: Mail,
    label: "Email",
    value: "eziekechukwuemerie@gmail.com",
    href: "mailto:eziekechukwuemerie@gmail.com",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "13, Stadium Road, Ekwulobia, Anambra State, Nigeria",
    href: "https://maps.google.com/?q=13+Stadium+Road+Ekwulobia+Anambra+Nigeria",
  },
  {
    icon: Globe,
    label: "Website",
    value: "harmonydigitalconsults.com.ng",
    href: "https://harmonydigitalconsults.com.ng",
  },
];

const socialLinks = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/harmonydigitalconsults",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/Chukwuemerie-ezieke",
  },
];

export default function ContactPage() {
  return (
    <Layout>
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Contact Us
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Let's transform your institution
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Ready to bring secure, offline-ready digital tools to your school or organization? Reach out
            through any of the channels below — we typically respond within one business day.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {contactItems.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 hover:bg-card/80 transition-colors group"
                data-testid={`contact-${c.label.toLowerCase()}`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {c.label}
                    </div>
                    <div className="font-medium text-foreground break-words">{c.value}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Follow Us
            </div>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm">
            <div className="font-semibold text-foreground mb-1">Registered Business</div>
            <div className="text-muted-foreground">
              Harmony Digital Consults Ltd · RC 8949899 · Incorporated October 25, 2025
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
