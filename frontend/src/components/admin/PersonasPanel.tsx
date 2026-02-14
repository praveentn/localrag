import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePersonas,
  useCreatePersona,
  useUpdatePersona,
  useDeletePersona,
} from "@/hooks/use-admin";
import type { Persona } from "@/types";

type PersonaForm = {
  name: string;
  description: string;
  system_prompt: string;
  is_default: boolean;
};

const emptyForm: PersonaForm = {
  name: "",
  description: "",
  system_prompt: "",
  is_default: false,
};

export function PersonasPanel() {
  const { data: personas, isLoading } = usePersonas();
  const createPersona = useCreatePersona();
  const updatePersona = useUpdatePersona();
  const deletePersona = useDeletePersona();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PersonaForm>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (persona: Persona) => {
    setEditingId(persona.id);
    setForm({
      name: persona.name,
      description: persona.description || "",
      system_prompt: persona.system_prompt,
      is_default: persona.is_default,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await updatePersona.mutateAsync({ id: editingId, data: form });
    } else {
      await createPersona.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading personas...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage AI personas and their system prompts
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Persona
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {!personas || personas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm font-medium">No personas yet</p>
              <p className="text-xs mt-1">
                Create a persona to customize AI behavior
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personas.map((persona) => (
                  <TableRow key={persona.id}>
                    <TableCell className="font-medium">
                      {persona.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                      {persona.description || "-"}
                    </TableCell>
                    <TableCell>
                      {persona.is_default && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(persona)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deletePersona.mutate(persona.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Persona" : "Create Persona"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Technical Expert"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of this persona"
              />
            </div>
            <div className="space-y-1">
              <Label>System Prompt</Label>
              <Textarea
                value={form.system_prompt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    system_prompt: e.target.value,
                  }))
                }
                placeholder="You are a helpful assistant..."
                className="min-h-[150px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_default}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_default: checked }))
                }
              />
              <Label>Set as default persona</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name || !form.system_prompt}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
