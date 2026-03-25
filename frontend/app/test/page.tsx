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
import { LogOut, Plus, Edit, Trash2, Users } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { TestQuestionsModal } from "@/components/test-questions-modal";

interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  questionCount?: number;
}

function TestManagementContent() {
  const router = useRouter();
  const { email, claims, isLoading } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [selectedTestForQuestions, setSelectedTestForQuestions] = useState<Test | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    authStore.getState().logout();
    router.push("/login");
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/tests");
      setTests(response.data.tests || []);
    } catch (error: any) {
      toast.error("Failed to fetch tests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchTests();
    }
  }, [isLoading]);

  const handleCreateTest = async () => {
    if (!formData.title.trim()) {
      toast.error("Test title is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/tests", {
        title: formData.title,
        description: formData.description,
        duration_minutes: formData.duration_minutes,
        is_active: formData.is_active,
      });

      toast.success("Test created successfully");
      setFormData({
        title: "",
        description: "",
        duration_minutes: 60,
        is_active: true,
      });
      setIsCreateDialogOpen(false);
      fetchTests();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create test";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      duration_minutes: test.duration_minutes,
      is_active: test.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTest = async () => {
    if (!editingTest || !formData.title.trim()) {
      toast.error("Test title is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/api/tests/${editingTest.id}`, {
        title: formData.title,
        description: formData.description,
        duration_minutes: formData.duration_minutes,
        is_active: formData.is_active,
      });

      toast.success("Test updated successfully");
      setFormData({
        title: "",
        description: "",
        duration_minutes: 60,
        is_active: true,
      });
      setEditingTest(null);
      setIsEditDialogOpen(false);
      fetchTests();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update test";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    try {
      await api.delete(`/api/tests/${testId}`);
      toast.success("Test deleted successfully");
      fetchTests();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to delete test";
      toast.error(errorMessage);
    }
  };

  const handleOpenQuestionsModal = (test: Test) => {
    setSelectedTestForQuestions(test);
    setIsQuestionsModalOpen(true);
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const userRole = claims?.role || "students";

  // Only render for superadmin
  if (userRole !== "superadmin") {
    return (
      <SidebarProvider>
        <AppSidebar activeItem="Test" />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Test</BreadcrumbPage>
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
              <div className="p-6 text-center">
                <p className="text-muted-foreground">
                  Test management is only available for superadmins
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar activeItem="Test" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Test Management</BreadcrumbPage>
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
              <h2 className="text-3xl font-bold">Test Management</h2>
              <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Test
                </Button>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New Test</AlertDialogTitle>
                    <AlertDialogDescription>
                      Fill in the test details below
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Test Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter test title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter test description (optional)"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="60"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })
                        }
                        min="1"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="is_active">Active</Label>
                      <Switch
                        id="is_active"
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
                      onClick={handleCreateTest}
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : "Create"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              {tests.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No tests yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Duration (min)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.title}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {test.description || "-"}
                        </TableCell>
                        <TableCell>{test.questionCount || 0}</TableCell>
                        <TableCell>{test.duration_minutes}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              test.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {test.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(test.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTest(test)}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTest(test.id)}
                              className="gap-2 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenQuestionsModal(test)}
                              title="Manage questions"
                              className="gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Questions
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {selectedTestForQuestions && (
              <TestQuestionsModal
                testId={selectedTestForQuestions.id}
                testTitle={selectedTestForQuestions.title}
                isOpen={isQuestionsModalOpen}
                onClose={() => {
                  setIsQuestionsModalOpen(false);
                  setSelectedTestForQuestions(null);
                  fetchTests();
                }}
              />
            )}

            <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Test</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the test details below
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Test Title *</Label>
                    <Input
                      id="edit-title"
                      placeholder="Enter test title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Enter test description (optional)"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      placeholder="60"
                      value={formData.duration_minutes}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })
                      }
                      min="1"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="edit-is_active">Active</Label>
                    <Switch
                      id="edit-is_active"
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
                    onClick={handleUpdateTest}
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

export default function TestPage() {
  return (
    <AuthGuard>
      <TestManagementContent />
    </AuthGuard>
  );
}
