import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { MonitorSmartphone, FileLock2, UserCheck, ShieldOff } from "lucide-react";
import { ClearWorkspaceButton } from "@/components/clear-workspace-button";

const sections = [
  {
    icon: MonitorSmartphone,
    title: "Documents and processing",
    points: [
      "Every tool shows whether it runs in your browser or sends a file to a server before you upload or process anything.",
      "PDF and image tools — including Protect and Unlock — run entirely in your browser. Your files and passwords are not uploaded to any HarmonyDocs server.",
      "Document contents, filenames, extracted text, passwords, and metadata are never used for advertising, profiling, marketing, or analytics.",
    ],
  },
  {
    icon: UserCheck,
    title: "No account required",
    points: [
      "Public tools do not require an email address or marketing consent to process or download a document.",
      "You can use the document tools without registering an account.",
    ],
  },
  {
    icon: FileLock2,
    title: "Voluntary consultation requests",
    points: [
      "If you contact us, we collect only the fields you submit: name, email, optional phone, organisation, country, service interest, project description, preferred contact method, and consent choices.",
      "Marketing permission is optional, separate from the consent needed to submit a request, and never preselected.",
    ],
  },
  {
    icon: ShieldOff,
    title: "What we never collect for leads or analytics",
    points: [
      "Uploaded files, filenames, document contents, or extracted text.",
      "Passwords, full IP addresses, authentication tokens, or persistent cross-site identifiers.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Layout>
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Privacy Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Your documents stay private
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            HarmonyDocs is a free public document-tool service from Harmony Digital Consults Ltd. This
            notice describes how the product handles your files and information. We only state that a
            control — such as in-browser processing — is in place where the deployed application actually
            provides it.
          </p>
        </div>
      </section>

      <section className="py-12 border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {sections.map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                    <ul className="space-y-2">
                      {s.points.map((point, index) => (
                        <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-border/60">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">Your data on this device</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To make tools easier to use, HarmonyDocs can remember a short history of your recent work
            (file names and sizes only — never the documents themselves) and your saved tool settings.
            This is stored only in your browser on this device and is never uploaded. You can remove it
            at any time.
          </p>
          <ClearWorkspaceButton />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">Questions?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about this notice or a consultation request can be directed to Harmony Digital
            Consults through our{" "}
            <Link href="#/contact" className="text-primary underline">
              contact channels
            </Link>
            .
          </p>
        </div>
      </section>
    </Layout>
  );
}
