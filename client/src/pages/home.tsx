import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { tools, categories } from "@/lib/tools";
import {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe,
  Droplets, Type,
  Lock, Unlock,
  PenTool,
  ShieldCheck, Zap, Server
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe,
  Droplets, Type,
  Lock, Unlock,
};

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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold text-foreground mb-4">Our Document Tools</h2>
             <p className="text-muted-foreground text-lg">Select a tool below to start editing and manipulating your PDFs instantly.</p>
          </div>

          {categories.map((cat) => {
            const catTools = tools.filter((t) => t.category === cat.id);
            if (catTools.length === 0) return null;
            return (
              <div key={cat.id} className="scroll-mt-24">
                <div className="mb-6 flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-foreground">{cat.name}</h3>
                  <div className="h-px flex-1 bg-border/60"></div>
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {catTools.map((tool) => {
                    const Icon = iconMap[tool.icon];
                    return (
                      <Link
                        key={tool.id}
                        href={tool.route}
                        data-testid={`tool-card-${tool.id}`}
                      >
                        <div className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 transition-all duration-200 hover:border-primary hover:shadow-xl hover:-translate-y-1 h-full relative overflow-hidden">
                          {/* Accent highlight on hover */}
                          <div className="absolute inset-x-0 top-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>

                          <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-110", tool.color)}>
                            {Icon && <Icon className="h-6 w-6" />}
                          </div>

                          <div>
                            <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                              {tool.name}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Info Section (PDFHouse style) */}
      <section className="py-24 bg-card border-t border-border/50">
         <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-12 text-center">
               <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                     <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Secure by Design</h3>
                  <p className="text-muted-foreground leading-relaxed">
                     We prioritize your privacy. All file processing happens entirely in your browser. Your files are never uploaded to any server or stored on the cloud.
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
                  <h3 className="text-xl font-bold mb-3">100% Free</h3>
                  <p className="text-muted-foreground leading-relaxed">
                     We believe essential tools should be accessible to everyone. Our document manipulation suite is completely free with no hidden limits.
                  </p>
               </div>
            </div>
         </div>
      </section>
    </Layout>
  );
}
