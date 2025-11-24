"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, ExternalLink, Globe, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

interface SearchResult {
  url: string;
  title: string;
  content: string;
  type: "web" | "content" | "image";
  timestamp: string;
}

export function IntelligentSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un término de búsqueda",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      // Add to history
      if (!searchHistory.includes(query)) {
        setSearchHistory([query, ...searchHistory.slice(0, 4)]);
      }

      // Call browser API to search
      const response = await fetch("/api/browser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "search",
          query: query,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la búsqueda");
      }

      const data = await response.json();
      
      // Format results from search
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const formattedResults: SearchResult[] = data.results.map((result: any) => ({
          url: result.url || data.url || query,
          title: result.title || `Resultado para: ${query}`,
          content: result.snippet || result.content || "Contenido no disponible",
          type: "web" as const,
          timestamp: new Date().toISOString(),
        }));
        setResults(formattedResults);
      } else {
        // Fallback to single result
        const formattedResults: SearchResult[] = [
          {
            url: data.url || `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            title: data.title || `Resultados para: ${query}`,
            content: data.content || "Haz clic para ver los resultados completos",
            type: "web",
            timestamp: new Date().toISOString(),
          },
        ];
        setResults(formattedResults);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo realizar la búsqueda",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div {...fadeInUp} className="relative">
        <Card className="border-2 border-dorado/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative flex items-center gap-2">
              <div className="absolute left-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-dorado animate-pulse" />
              </div>
              <Input
                type="text"
                placeholder="Busca en la web, extrae información, navega inteligentemente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 pr-32 h-14 text-lg border-2 focus:border-dorado"
                disabled={isSearching}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                size="lg"
                className="absolute right-2 h-10 px-6"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && !isSearching && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Búsquedas recientes:</span>
                {searchHistory.map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-dorado/10"
                    onClick={() => {
                      setQuery(term);
                      handleSearch();
                    }}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Resultados</h2>
              <Badge variant="secondary">{results.length} resultado(s)</Badge>
            </div>

            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {result.type === "web" && <Globe className="h-5 w-5 text-blue-500" />}
                          {result.type === "content" && <FileText className="h-5 w-5 text-green-500" />}
                          {result.type === "image" && <ImageIcon className="h-5 w-5 text-purple-500" />}
                          {result.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-dorado hover:underline flex items-center gap-1"
                          >
                            {result.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {result.content}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {new Date(result.timestamp).toLocaleString()}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver completo
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {results.length === 0 && !isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-dorado/20 to-azul/20 mb-4">
            <Search className="h-10 w-10 text-dorado" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Búsqueda Inteligente</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ingresa una consulta arriba para buscar en la web, extraer información
            y navegar de forma inteligente usando nuestro navegador automatizado.
          </p>
        </motion.div>
      )}
    </div>
  );
}

