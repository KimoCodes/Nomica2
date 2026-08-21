"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { trackLoading } from "@/components/ui/loading-bar";
import {
  updateUserRoleAction,
  deleteUserAction,
} from "@/actions/admin.actions";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export function UserActions({ user }: { user: User }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  async function handleRoleUpdate() {
    if (newRole === user.role) {
      setEditOpen(false);
      return;
    }

    setLoading(true);
    const result = await trackLoading(() =>
      updateUserRoleAction(user.id, newRole as "ADMIN" | "COACH" | "CLIENT"),
    );
    setLoading(false);

    if (result.success) {
      setEditOpen(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    setLoading(true);
    const result = await trackLoading(() => deleteUserAction(user.id));
    setLoading(false);

    if (result.success) {
      setDeleteOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
        </Button>
        {user.role !== "ADMIN" && (
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Update the role for {user.name ?? user.email}
            </DialogDescription>
          </DialogHeader>
          <Select value={newRole} onValueChange={(v) => v && setNewRole(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="COACH">Coach</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.name ?? user.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
