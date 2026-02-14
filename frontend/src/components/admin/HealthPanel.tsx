import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHealthCheck } from "@/hooks/use-admin";

export function HealthPanel() {
  const { data: health, isLoading, refetch } = useHealthCheck();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          System health status
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {health &&
          Object.entries(health).map(([service, status]) => (
            <Card key={service}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {service.replace(/_/g, " ")}
                  </p>
                </div>
                <Badge
                  variant={status === "healthy" ? "default" : "destructive"}
                  className="gap-1"
                >
                  {status === "healthy" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {status}
                </Badge>
              </CardContent>
            </Card>
          ))}

        {isLoading && (
          <p className="text-sm text-muted-foreground col-span-3 text-center py-8">
            Checking health...
          </p>
        )}
      </div>
    </div>
  );
}
