"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, MoreVertical, Trash2, Copy, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ResumeListItem, resumeApi } from "../services/resumeApi";
import { toast } from "sonner";

interface ResumeCardProps {
  resume: ResumeListItem;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function ResumeCard({ resume, onDelete, onDuplicate }: ResumeCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/dashboard/resumes/${resume.resume_id}`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await resumeApi.delete(resume.resume_id);
      toast.success("Resume deleted successfully");
      onDelete();
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      await resumeApi.duplicate(resume.resume_id);
      toast.success("Resume duplicated successfully");
      onDuplicate();
    } catch (error) {
      toast.error("Failed to duplicate resume");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
        <CardContent className="p-0">
          {/* Preview area */}
          <div
            className="h-48 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center"
            onClick={handleEdit}
          >
            <FileText className="h-16 w-16 text-muted-foreground/50" />
          </div>

          {/* Info area */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0" onClick={handleEdit}>
                <h3 className="font-semibold truncate">{resume.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Updated {formatDate(resume.updated_at)}
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                    resume.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {resume.status === "completed" ? "Completed" : "Draft"}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{resume.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
