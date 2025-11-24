"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Plus, Clock, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getProjectMeetings,
  createMeeting,
  deleteMeeting,
} from "@/app/actions/meetings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface MeetingSchedulerProps {
  projectId: string;
}

export function MeetingScheduler({ projectId }: MeetingSchedulerProps) {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledTime: "",
    duration: "60",
    location: "",
    useZoom: false,
    useGoogleMeet: true,
  });

  useEffect(() => {
    loadMeetings();
  }, [projectId]);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      const data = await getProjectMeetings(projectId);
      setMeetings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las reuniones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMeeting(projectId, {
        title: formData.title,
        description: formData.description || undefined,
        scheduledTime: new Date(formData.scheduledTime),
        duration: parseInt(formData.duration),
        location: formData.location || undefined,
        useZoom: formData.useZoom,
        useGoogleMeet: formData.useGoogleMeet,
      });
      toast({
        title: "Reunión programada",
        description: "La reunión se ha programado exitosamente.",
      });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        scheduledTime: "",
        duration: "60",
        location: "",
        useZoom: false,
        useGoogleMeet: true,
      });
      await loadMeetings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo programar la reunión",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reunión?")) return;

    try {
      await deleteMeeting(meetingId);
      toast({
        title: "Reunión eliminada",
        description: "La reunión se ha eliminado exitosamente.",
      });
      await loadMeetings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la reunión",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Reuniones
            </CardTitle>
            <CardDescription>
              Programa y gestiona reuniones del proyecto
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reunión
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Programar Reunión</DialogTitle>
                <DialogDescription>
                  Crea una nueva reunión para el proyecto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledTime">Fecha y Hora *</Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      min="15"
                      step="15"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Ubicación (opcional)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Sala de juntas, dirección, etc."
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useGoogleMeet">Google Meet</Label>
                    <Switch
                      id="useGoogleMeet"
                      checked={formData.useGoogleMeet}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, useGoogleMeet: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useZoom">Zoom (próximamente)</Label>
                    <Switch
                      id="useZoom"
                      checked={formData.useZoom}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, useZoom: checked })
                      }
                      disabled
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Programar Reunión</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando reuniones...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay reuniones programadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{meeting.title}</h3>
                  {meeting.description && (
                    <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(meeting.scheduledTime), "PPp", { locale: es })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {meeting.duration} minutos
                    </div>
                  </div>
                  {meeting.googleMeetUrl && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={meeting.googleMeetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Unirse a Google Meet
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(meeting.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

