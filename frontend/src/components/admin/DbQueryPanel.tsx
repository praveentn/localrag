import { useState } from "react";
import { Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDbQuery } from "@/hooks/use-admin";

export function DbQueryPanel() {
  const [sql, setSql] = useState(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
  );
  const queryMutation = useDbQuery();

  const handleExecute = () => {
    if (!sql.trim()) return;
    queryMutation.mutate(sql);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Only SELECT queries are allowed. Write operations are blocked for
          safety.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SQL Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Enter your SQL query..."
            className="font-mono text-sm min-h-[120px]"
          />
          <Button
            onClick={handleExecute}
            disabled={queryMutation.isPending || !sql.trim()}
          >
            <Play className="h-4 w-4 mr-2" />
            {queryMutation.isPending ? "Executing..." : "Execute"}
          </Button>
        </CardContent>
      </Card>

      {queryMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Results ({queryMutation.data.row_count} rows)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queryMutation.data.row_count === 0 ? (
              <p className="text-sm text-muted-foreground">No rows returned</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {queryMutation.data.columns.map((col) => (
                        <TableHead key={col} className="font-mono text-xs">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryMutation.data.rows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell
                            key={j}
                            className="font-mono text-xs max-w-[300px] truncate"
                          >
                            {cell === null ? (
                              <span className="text-muted-foreground italic">
                                null
                              </span>
                            ) : (
                              String(cell)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
