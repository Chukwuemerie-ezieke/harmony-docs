import { useMemo, useState } from "react";
import { Search, Star, Clock, X } from "lucide-react";
import { tools, categories, getToolById } from "@/lib/tools";
import { searchTools } from "@/lib/tool-search";
import { useToolPreferences } from "@/hooks/use-tool-preferences";
import { ToolCard } from "@/components/tool-card";
import { RecentWork } from "@/components/recent-work";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { favorites, recents, isFavorite, toggleFavorite, clearRecents } = useToolPreferences();

  const searching = query.trim().length > 0;

  const results = useMemo(
    () => searchTools(tools, { query, category: activeCategory }),
    [query, activeCategory],
  );

  const favoriteTools = useMemo(
    () => favorites.map((id) => getToolById(id)).filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [favorites],
  );
  const recentTools = useMemo(
    () => recents.map((id) => getToolById(id)).filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [recents],
  );

  // When searching or filtering, show a flat result grid; otherwise show the
  // category sections (with favourites/recents rows on top).
  const showCurated = !searching && !activeCategory;

  return (
    <div className="space-y-10">
      {/* Search + category filters */}
      <div className="space-y-4">
        <div className="relative mx-auto max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools — e.g. “combine”, “password”, “jpg to pdf”"
            className="pl-9"
            aria-label="Search tools"
            data-testid="tools-search"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            data-testid="category-all"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory((c) => (c === cat.id ? null : cat.id))}
              data-testid={`category-${cat.id}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Recent work (local workspace), favourites & recents — landing view only */}
      {showCurated && <RecentWork />}
      {showCurated && favoriteTools.length > 0 && (
        <ToolRow
          title="Favourites"
          icon={<Star className="h-5 w-5 text-amber-500" aria-hidden="true" />}
          tools={favoriteTools}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          testId="favorites-row"
        />
      )}
      {showCurated && recentTools.length > 0 && (
        <ToolRow
          title="Recently used"
          icon={<Clock className="h-5 w-5 text-primary" aria-hidden="true" />}
          tools={recentTools}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          testId="recents-row"
          action={
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={clearRecents} data-testid="clear-recents">
              Clear
            </Button>
          }
        />
      )}

      {/* Filtered / searched flat grid */}
      {!showCurated && (
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" data-testid="results-count" aria-live="polite">
              {results.length} {results.length === 1 ? "tool" : "tools"}
              {searching ? ` matching “${query.trim()}”` : ""}
            </p>
            {(searching || activeCategory) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => { setQuery(""); setActiveCategory(null); }}
                data-testid="clear-filters"
              >
                <X className="mr-1 h-3 w-3" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
          {results.length > 0 ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" data-testid="results-grid">
              {results.map((tool) => (
                <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/40 py-16 text-center" data-testid="no-results">
              <p className="font-medium text-foreground">No tools match “{query.trim()}”.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different word, or browse a category above.</p>
            </div>
          )}
        </div>
      )}

      {/* Category sections (landing view) */}
      {showCurated &&
        categories.map((cat) => {
          const catTools = tools.filter((t) => t.category === cat.id);
          if (catTools.length === 0) return null;
          return (
            <div key={cat.id} className="scroll-mt-24">
              <div className="mb-6 flex items-center gap-3">
                <h3 className="text-2xl font-bold text-foreground">{cat.name}</h3>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {catTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}

function ToolRow({
  title, icon, tools: rowTools, isFavorite, onToggleFavorite, testId, action,
}: {
  title: string;
  icon: React.ReactNode;
  tools: import("@shared/schema").ToolDefinition[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  testId: string;
  action?: React.ReactNode;
}) {
  return (
    <div data-testid={testId} className={cn("scroll-mt-24")}>
      <div className="mb-6 flex items-center gap-3">
        {icon}
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <div className="h-px flex-1 bg-border/60" />
        {action}
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {rowTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
    </div>
  );
}
