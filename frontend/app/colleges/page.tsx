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
import { LogOut, Plus, Edit } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { toast } from "sonner";

interface College {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

function CollegesContent() {
  const router = useRouter();
  const { email, claims, isLoading } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    authStore.getState().logout();
    router.push("/login");
  };

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/colleges");
      setColleges(response.data.colleges || []);
    } catch (error: any) {
      toast.error("Failed to fetch colleges");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchColleges();
    }
  }, [isLoading]);

  const handleCreateCollege = async () => {
    if (!formData.name.trim()) {
      toast.error("College name is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/colleges", {
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active,
      });

      toast.success("College created successfully");
      setFormData({ name: "", description: "", is_active: true });
      setIsCreateDialogOpen(false);
      fetchColleges();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create college";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCollege = (college: College) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      description: college.description,
      is_active: college.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCollege = async () => {
    if (!editingCollege || !formData.name.trim()) {
      toast.error("College name is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/api/colleges/${editingCollege.id}`, {
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active,
      });

      toast.success("College updated successfully");
      setFormData({ name: "", description: "", is_active: true });
      setEditingCollege(null);
      setIsEditDialogOpen(false);
      fetchColleges();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update college";
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
      <AppSidebar activeItem="Colleges" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Colleges</BreadcrumbPage>
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
              <h2 className="text-3xl font-bold">Colleges</h2>
              <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Add College
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New College</AlertDialogTitle>
                    <AlertDialogDescription>
                      Fill in the college details below
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">College Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter college name"
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
                        placeholder="Enter college description (optional)"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCreateCollege}
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : "Create"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              {colleges.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No colleges yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colleges.map((college) => (
                      <TableRow key={college.id}>
                        <TableCell className="font-medium">{college.name}</TableCell>
                        <TableCell>{college.description || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              college.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {college.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(college.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCollege(college)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
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
                  <AlertDialogTitle>Edit College</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the college details below
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">College Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="Enter college name"
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
                      placeholder="Enter college description (optional)"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
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
                    onClick={handleUpdateCollege}
                    disabled={submitting}
                  >
                    {submitting ? "Updating..." : "Update"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function CollegesPage() {
  return (
    <AuthGuard>
      <CollegesContent />
    </AuthGuard>
  );
}
