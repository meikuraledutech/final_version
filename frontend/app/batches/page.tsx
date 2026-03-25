"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authStore } from "@/store/authStore";
import { AuthGuard } from "@/components/auth-guard";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { LogOut, Plus, Edit, Users } from "lucide-react";
import { BatchMembersModal } from "@/components/batch-members-modal";
import api from "@/lib/api";
import { toast } from "sonner";

interface Batch {
  id: string;
  name: string;
  description: string;
  college_id: string;
  is_active: boolean;
  created_at: string;
}

interface College {
  id: string;
  name: string;
}

function BatchesContent() {
  const router = useRouter();
  const { email, claims, isLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [selectedBatchForMembers, setSelectedBatchForMembers] = useState<Batch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    college_id: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    authStore.getState().logout();
    router.push("/login");
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/batches");
      setBatches(response.data.batches || []);
    } catch (error: any) {
      toast.error("Failed to fetch batches");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await api.get("/api/colleges");
      setColleges(response.data.colleges || []);
    } catch (error: any) {
      console.error("Failed to fetch colleges");
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchBatches();
      fetchColleges();
    }
  }, [isLoading]);

  const handleCreateBatch = async () => {
    if (!formData.name.trim()) {
      toast.error("Batch name is required");
      return;
    }

    if (!formData.college_id) {
      toast.error("College is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/batches", {
        name: formData.name,
        description: formData.description,
        college_id: formData.college_id,
        is_active: formData.is_active,
      });

      toast.success("Batch created successfully");
      setFormData({
        name: "",
        description: "",
        college_id: "",
        is_active: true,
      });
      setIsCreateDialogOpen(false);
      fetchBatches();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create batch";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      description: batch.description,
      college_id: batch.college_id,
      is_active: batch.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenMembersModal = (batch: Batch) => {
    setSelectedBatchForMembers(batch);
    setIsModalOpen(true);
  };

  const handleUpdateBatch = async () => {
    if (!editingBatch || !formData.name.trim()) {
      toast.error("Batch name is required");
      return;
    }

    if (!formData.college_id) {
      toast.error("College is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/api/batches/${editingBatch.id}`, {
        name: formData.name,
        description: formData.description,
        college_id: formData.college_id,
        is_active: formData.is_active,
      });

      toast.success("Batch updated successfully");
      setFormData({
        name: "",
        description: "",
        college_id: "",
        is_active: true,
      });
      setEditingBatch(null);
      setIsEditDialogOpen(false);
      fetchBatches();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update batch";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const userRole = claims?.role || "students";

  return (
    <SidebarProvider>
      <AppSidebar activeItem="Batch Management" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Batch Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mr-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{email}</span>
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded capitalize">
                {userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Batch Management</h2>
              <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Batch
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New Batch</AlertDialogTitle>
                    <AlertDialogDescription>
                      Fill in the batch details below
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Batch Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter batch name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter batch description (optional)"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="college">College *</Label>
                      <select
                        id="college"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        value={formData.college_id}
                        onChange={(e) =>
                          setFormData({ ...formData, college_id: e.target.value })
                        }
                      >
                        <option value="">Select a college</option>
                        {colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCreateBatch}
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : "Create"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              {batches.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No batches yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Members</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.name}</TableCell>
                        <TableCell>{batch.description || "-"}</TableCell>
                        <TableCell>
                          {colleges.find((c) => c.id === batch.college_id)?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              batch.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {batch.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(batch.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBatch(batch)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenMembersModal(batch)}
                            className="gap-2"
                            title="Manage batch members"
                          >
                            <Users className="w-4 h-4" />
                            Members
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Batch</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the batch details below
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Batch Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="Enter batch name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Enter batch description (optional)"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-college">College *</Label>
                    <select
                      id="edit-college"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      value={formData.college_id}
                      onChange={(e) =>
                        setFormData({ ...formData, college_id: e.target.value })
                      }
                    >
                      <option value="">Select a college</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="edit-status">Active Status</Label>
                    <Switch
                      id="edit-status"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateBatch}
                    disabled={submitting}
                  >
                    {submitting ? "Updating..." : "Update"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {selectedBatchForMembers && (
              <BatchMembersModal
                batchId={selectedBatchForMembers.id}
                batchName={selectedBatchForMembers.name}
                collegeId={selectedBatchForMembers.college_id}
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedBatchForMembers(null);
                }}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function BatchesPage() {
  return (
    <AuthGuard>
      <BatchesContent />
    </AuthGuard>
  );
}
