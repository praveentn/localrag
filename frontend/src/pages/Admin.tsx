import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { DbQueryPanel } from "@/components/admin/DbQueryPanel";
import { PersonasPanel } from "@/components/admin/PersonasPanel";
import { HealthPanel } from "@/components/admin/HealthPanel";

export function AdminPage() {
  return (
    <div className="max-w-5xl">
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="db-query">DB Queries</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <SettingsPanel />
        </TabsContent>
        <TabsContent value="personas" className="mt-4">
          <PersonasPanel />
        </TabsContent>
        <TabsContent value="db-query" className="mt-4">
          <DbQueryPanel />
        </TabsContent>
        <TabsContent value="health" className="mt-4">
          <HealthPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
