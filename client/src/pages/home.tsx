import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { tools, categories } from "@/lib/tools";
import {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe,
  Droplets, Type,
  Lock, Unlock,
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
      {/* Hero */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4" data-testid="badge-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              By Harmony Digital Consults Ltd
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Every document tool you need, in one place
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-lg">
              Merge, split, compress, convert, and secure your PDFs.
              Built for educators, learners, and teams across Nigeria — free, fast, and privacy-first.
            </p>
          </div>
        </div>
      </section>

      {/* Tools by category */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          {categories.map((cat) => {
            const catTools = tools.filter((t) => t.category === cat.id);
            if (catTools.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-foreground">{cat.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {catTools.map((tool) => {
                    const Icon = iconMap[tool.icon];
                    return (
                      <Link
                        key={tool.id}
                        href={tool.route}
                        data-testid={`tool-card-${tool.id}`}
                      >
                        <div className="group flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md h-full">
                          <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md", tool.color)}>
                            {Icon && <Icon className="h-4.5 w-4.5" />}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
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
    </Layout>
  );
}
