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
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  college_id: string | null;
  created_at: string;
}

interface College {
  id: string;
  name: string;
}

function UsersContent() {
  const router = useRouter();
  const { email, claims, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "students",
    college_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    authStore.getState().logout();
    router.push("/login");
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/users");
      setUsers(response.data.users || []);
    } catch (error: any) {
      toast.error("Failed to fetch users");
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
      fetchUsers();
      fetchColleges();
    }
  }, [isLoading]);

  const needsCollege = formData.role === "students" || formData.role === "college-admin";

  const handleCreateUser = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Name, email, and password are required");
      return;
    }

    if (needsCollege && !formData.college_id) {
      toast.error(`${formData.role === "students" ? "Student" : "College Admin"} must be assigned to a college`);
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (needsCollege) {
        payload.college_id = formData.college_id;
      }

      await api.post("/api/auth/register", payload);

      toast.success("User created successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "students",
        college_id: "",
      });
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create user";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      college_id: user.college_id || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      await api.put(`/api/users/${editingUser.id}`, payload);

      toast.success("User updated successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "students",
        college_id: "",
      });
      setEditingUser(null);
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update user";
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
      <AppSidebar activeItem="User Management" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>User Management</BreadcrumbPage>
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
              <h2 className="text-3xl font-bold">User Management</h2>
              <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Fill in the user details below
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <select
                        id="role"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value, college_id: "" })
                        }
                      >
                        <option value="students">Student</option>
                        <option value="trainer">Trainer</option>
                        <option value="college-admin">College Admin</option>
                      </select>
                    </div>
                    {needsCollege && (
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
                    )}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCreateUser}
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : "Create"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              {users.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No users yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded capitalize">
                            {user.role.replace("-", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.college_id
                            ? colleges.find((c) => c.id === user.college_id)?.name || "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.role !== "superadmin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the user details below
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role *</Label>
                    <select
                      id="edit-role"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="students">Student</option>
                      <option value="trainer">Trainer</option>
                      <option value="college-admin">College Admin</option>
                    </select>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateUser}
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

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersContent />
    </AuthGuard>
  );
}
