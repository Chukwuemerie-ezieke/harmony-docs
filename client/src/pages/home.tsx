import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { ToolsDirectory } from "@/components/tools-directory";
import { ShieldCheck, Zap, Server } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-primary/5 to-background text-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background shadow-sm px-4 py-1.5 text-xs font-semibold text-primary mb-6 uppercase tracking-wider" data-testid="badge-brand">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Harmony Digital Consults Ltd
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Every PDF Tool You Need, <span className="text-primary block sm:inline">In One Place</span>
          </h1>

          <p className="mx-auto mt-4 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
            Merge, split, compress, convert, and secure your PDFs completely in your browser.
            Fast, secure, and built for educators and teams across Nigeria.
          </p>

          <div className="flex justify-center gap-4">
             <Button onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })} size="lg" className="rounded-full px-8 text-base shadow-lg hover:shadow-primary/25 transition-all">
                Explore Tools
             </Button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 sm:py-24 bg-background border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold text-foreground mb-4">Our Document Tools</h2>
             <p className="text-muted-foreground text-lg">Search, filter, or browse by category to start working on your documents instantly.</p>
          </div>

          <ToolsDirectory />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-card border-t border-border/50">
         <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-12 text-center">
               <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                     <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Secure by Design</h3>
                  <p className="text-muted-foreground leading-relaxed">
                     We prioritize your privacy. These document tools process your files entirely in your browser — they are not uploaded to any server.
                  </p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                     <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                  <p className="text-muted-foreground leading-relaxed">
                     Because everything runs locally on your device, processing is instantaneous. No waiting for uploads or downloads across slow networks.
                  </p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                     <Server className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Free to Use</h3>
                  <p className="text-muted-foreground leading-relaxed">
                     We believe essential tools should be accessible to everyone. Our document tools are free to use, right in your browser.
                  </p>
               </div>
            </div>
         </div>
      </section>
    </Layout>
  );
}
