import { Layout } from "@/components/layout";
import { Lightbulb, Target, ShieldCheck, Users } from "lucide-react";

const principles = [
  {
    icon: Lightbulb,
    title: "Innovation",
    body: "Continuously exploring new technologies and creative approaches to solve persistent challenges in Nigerian education. We don't just adopt trends — we build solutions that matter.",
  },
  {
    icon: Target,
    title: "Impact",
    body: "Measuring success not by lines of code, but by educational outcomes. Every product and service is evaluated against its real-world impact on students, teachers, and administrators.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    body: "Transparent, ethical business practices in every engagement. We protect data with care, communicate honestly, and build trust through consistent, principled action.",
  },
  {
    icon: Users,
    title: "Inclusion",
    body: "Making technology accessible for all schools — regardless of size, location, or budget. Our offline-first architecture ensures no institution is left behind by connectivity gaps.",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            About Us
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Building the future of education technology in Nigeria
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Harmony Digital Consults Ltd (RC 8949899) is a Nigerian-registered educational technology and
            IT consulting firm headquartered in Ekwulobia, Anambra State. We specialize in designing,
            developing, and deploying digital solutions that address the unique challenges of the Nigerian
            education sector.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            From school management platforms and e-learning tools to cybersecurity frameworks and digital
            transformation consulting, we deliver solutions that are secure, scalable, and designed to
            work in real-world conditions — including low-connectivity environments common across Nigeria.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Incorporated on October 25, 2025, we have rapidly grown our portfolio to over six purpose-built
            products, multiple published resources, and a track record of innovation that combines global
            best practices with deep local expertise.
          </p>
        </div>
      </section>

      <section className="py-12 border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To empower Nigerian educational institutions with innovative, accessible, and secure technology
            solutions that transform how schools operate, how students learn, and how administrators manage
            — bridging the digital divide one institution at a time.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
              What guides us
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Four principles that shape every product we build, every service we deliver, and every
              relationship we nurture.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
