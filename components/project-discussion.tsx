"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addComment, getComments } from "@/app/actions/comments";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

interface ProjectDiscussionProps {
  projectId: string;
  isMember: boolean;
}

export function ProjectDiscussion({ projectId, isMember }: ProjectDiscussionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [projectId]);

  const loadComments = async () => {
    try {
      const data = await getComments(projectId);
      setComments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isMember) return;

    setSubmitting(true);
    try {
      await addComment(projectId, content);
      setContent("");
      await loadComments();
      router.refresh();
      toast({
        title: "Comentario agregado",
        description: "Tu comentario se ha publicado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar el comentario",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando comentarios...</div>;
  }

  return (
    <div className="space-y-6">
      {isMember && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Comentario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu comentario (soporta Markdown)..."
                rows={4}
              />
              <Button type="submit" disabled={submitting || !content.trim()}>
                {submitting ? "Publicando..." : "Publicar Comentario"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comentarios ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay comentarios aún. Sé el primero en comentar.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 border-b pb-4 last:border-0">
                <Avatar>
                  <AvatarImage src={comment.author.image || undefined} />
                  <AvatarFallback>
                    {comment.author.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{comment.author.name || comment.author.email}</p>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

