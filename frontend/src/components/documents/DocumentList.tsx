import { FileText, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useDocuments,
  useDeleteDocument,
  useReprocessDocument,
} from "@/hooks/use-documents";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
};

export function DocumentList() {
  const { data: documents, isLoading } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const reprocessMutation = useReprocessDocument();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading documents...
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">No documents yet</p>
        <p className="text-xs">Upload files above to get started</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Filename</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Chunks</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[200px]">{doc.filename}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{doc.file_type.toUpperCase()}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "-"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Badge variant={statusVariant[doc.status] || "outline"}>
                  {doc.status}
                </Badge>
                {doc.error_message && (
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="h-3 w-3 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>{doc.error_message}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TableCell>
            <TableCell>{doc.chunk_count}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {new Date(doc.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => reprocessMutation.mutate(doc.id)}
                      disabled={reprocessMutation.isPending}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reprocess</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
