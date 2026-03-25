"use client";

import { useRouter, usePathname } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { LogOut } from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const { email, claims, isLoading } = useAuth();

  const handleLogout = () => {
    authStore.getState().logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const userRole = claims?.role || "students";

  return (
    <SidebarProvider>
      <AppSidebar activeItem="Home" />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
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

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Welcome to Meikural</h2>
            </div>

            {/* Super Admin Dashboard */}
            {userRole === "superadmin" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">👨‍💼 User Management</h3>
                    <p className="text-muted-foreground mb-4">Manage all users in the system</p>
                    <button
                      onClick={() => router.push("/users")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Manage Users
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">🏫 Colleges</h3>
                    <p className="text-muted-foreground mb-4">Manage colleges</p>
                    <button
                      onClick={() => router.push("/colleges")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Manage Colleges
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">📚 Batch Management</h3>
                    <p className="text-muted-foreground mb-4">Manage batches</p>
                    <button
                      onClick={() => router.push("/batches")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Manage Batches
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">📖 Courses</h3>
                    <p className="text-muted-foreground mb-4">Manage courses</p>
                    <button
                      onClick={() => router.push("/courses")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Manage Courses
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">❓ Questions</h3>
                    <p className="text-muted-foreground mb-4">Manage questions</p>
                    <button
                      onClick={() => router.push("/questions")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Manage Questions
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">📝 Test</h3>
                    <p className="text-muted-foreground mb-4">Manage tests</p>
                    <button
                      onClick={() => router.push("/test")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Manage Tests
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
                    <p className="text-muted-foreground mb-4">System settings</p>
                    <button
                      onClick={() => router.push("/settings")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Settings
                    </button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* College Admin Dashboard */}
            {userRole === "college-admin" && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
                    <p className="text-muted-foreground mb-4">Manage college settings</p>
                    <button
                      onClick={() => router.push("/settings")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Settings
                    </button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Trainer Dashboard */}
            {userRole === "trainer" && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
                    <p className="text-muted-foreground mb-4">Manage your settings</p>
                    <button
                      onClick={() => router.push("/settings")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Settings
                    </button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Student Dashboard */}
            {userRole === "students" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">📖 Courses</h3>
                    <p className="text-muted-foreground mb-4">View your courses</p>
                    <button
                      onClick={() => router.push("/courses")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      My Courses
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">📝 Test</h3>
                    <p className="text-muted-foreground mb-4">Take tests</p>
                    <button
                      onClick={() => router.push("/test")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      View Tests
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">📊 Results</h3>
                    <p className="text-muted-foreground mb-4">View your results</p>
                    <button
                      onClick={() => router.push("/results")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      View Results
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">👥 Batch</h3>
                    <p className="text-muted-foreground mb-4">View your batch</p>
                    <button
                      onClick={() => router.push("/batch")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      View Batch
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
                    <p className="text-muted-foreground mb-4">Manage your settings</p>
                    <button
                      onClick={() => router.push("/settings")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Settings
                    </button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
