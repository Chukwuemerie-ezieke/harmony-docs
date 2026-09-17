import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-primary">404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            We couldn’t find that page
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            The page you’re looking for may have moved or never existed. Let’s get you back to your
            document tools.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="#/tools">
              <Button className="w-full sm:w-auto" data-testid="notfound-tools">
                <Compass className="mr-2 h-4 w-4" />
                Browse all tools
              </Button>
            </Link>
            <Link href="#/">
              <Button variant="outline" className="w-full sm:w-auto" data-testid="notfound-home">
                <Home className="mr-2 h-4 w-4" />
                Go to homepage
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </section>
    </Layout>
  );
}
