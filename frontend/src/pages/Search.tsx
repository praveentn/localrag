import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSearch } from "@/hooks/use-search";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [threshold, setThreshold] = useState(0.3);
  const searchMutation = useSearch();

  const handleSearch = () => {
    if (!query.trim()) return;
    searchMutation.mutate({ query, topK, threshold });
  };

  const results = searchMutation.data;

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Semantic Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search your knowledge base..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending || !query.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              {searchMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Results: {topK}
              </Label>
              <Slider
                value={[topK]}
                onValueChange={([v]) => setTopK(v)}
                min={1}
                max={20}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Threshold: {threshold.toFixed(2)}
              </Label>
              <Slider
                value={[threshold]}
                onValueChange={([v]) => setThreshold(v)}
                min={0}
                max={1}
                step={0.05}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {results.total} result{results.total !== 1 ? "s" : ""} for "
            {results.query}"
          </p>

          {results.results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs">
                  Try adjusting your query or lowering the threshold
                </p>
              </CardContent>
            </Card>
          ) : (
            results.results.map((item) => (
              <Card key={item.chunk_id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.filename}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-muted-foreground">
                        Chunk {item.chunk_index}
                      </span>
                    </div>
                    <Badge
                      variant={item.score > 0.7 ? "default" : item.score > 0.5 ? "secondary" : "outline"}
                    >
                      {(item.score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
