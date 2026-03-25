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
import { LogOut, Plus, Edit, Trash2, BookOpen, Eye } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { TestCasesModal } from "@/components/test-cases-modal";

interface TestCase {
  id: string;
  question_id: string;
  input: string;
  expected_output: string;
  created_at: string;
}

interface Question {
  id: string;
  title: string;
  description: string;
  lang: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  solution_code?: string;
  testCases?: TestCase[];
  testCaseCount?: number;
}

const LANGUAGES = ["python", "java", "c", "cpp"];
const LANGUAGE_LABELS: { [key: string]: string } = {
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
};

function QuestionsContent() {
  const router = useRouter();
  const { email, claims, isLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestCasesModalOpen, setIsTestCasesModalOpen] = useState(false);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestionForTestCases, setSelectedQuestionForTestCases] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    solution_code: "",
    lang: "python",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    authStore.getState().logout();
    router.push("/login");
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const url = selectedLanguageFilter
        ? `/api/questions?lang=${selectedLanguageFilter}`
        : "/api/questions";
      const response = await api.get(url);
      setQuestions(response.data.questions || []);
    } catch (error: any) {
      toast.error("Failed to fetch questions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchQuestions();
    }
  }, [isLoading, selectedLanguageFilter]);

  const handleCreateQuestion = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.solution_code.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/questions", {
        title: formData.title,
        description: formData.description,
        solution_code: formData.solution_code,
        lang: formData.lang,
        is_active: formData.is_active,
      });

      toast.success("Question created successfully");
      setFormData({
        title: "",
        description: "",
        solution_code: "",
        lang: "python",
        is_active: true,
      });
      setIsCreateDialogOpen(false);
      fetchQuestions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create question";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      solution_code: "",
      lang: question.lang,
      is_active: question.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/api/questions/${editingQuestion.id}`, {
        title: formData.title,
        description: formData.description,
        solution_code: formData.solution_code || undefined,
        lang: formData.lang,
        is_active: formData.is_active,
      });

      toast.success("Question updated successfully");
      setFormData({
        title: "",
        description: "",
        solution_code: "",
        lang: "python",
        is_active: true,
      });
      setEditingQuestion(null);
      setIsEditDialogOpen(false);
      fetchQuestions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update question";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await api.delete(`/api/questions/${questionId}`);
      toast.success("Question deleted successfully");
      fetchQuestions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to delete question";
      toast.error(errorMessage);
    }
  };

  const handleOpenTestCasesModal = (question: Question) => {
    setSelectedQuestionForTestCases(question);
    setIsTestCasesModalOpen(true);
  };

  const handleViewQuestion = async (question: Question) => {
    try {
      const response = await api.get(`/api/questions/${question.id}`);
      console.log("Full API Response:", response.data);
      console.log("Question Object:", response.data.question);
      console.log("Solution Code:", response.data.question.solution_code);
      console.log("Solution Code (repr):", JSON.stringify(response.data.question.solution_code));
      setViewingQuestion(response.data.question);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast.error("Failed to fetch question details");
      console.error(error);
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
      <AppSidebar activeItem="Questions" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Questions</BreadcrumbPage>
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
              <h2 className="text-3xl font-bold">Questions</h2>
              <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
                <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New Question</AlertDialogTitle>
                    <AlertDialogDescription>
                      Add a new programming question
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Question Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Fibonacci Sequence"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed problem description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="solution_code">Solution Code *</Label>
                      <Textarea
                        id="solution_code"
                        placeholder="Write the solution code"
                        value={formData.solution_code}
                        onChange={(e) =>
                          setFormData({ ...formData, solution_code: e.target.value })
                        }
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lang">Language *</Label>
                      <select
                        id="lang"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        value={formData.lang}
                        onChange={(e) =>
                          setFormData({ ...formData, lang: e.target.value })
                        }
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {LANGUAGE_LABELS[lang]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCreateQuestion}
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : "Create"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Language Filter */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <Button
                variant={selectedLanguageFilter === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguageFilter("")}
              >
                All Languages
              </Button>
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang}
                  variant={selectedLanguageFilter === lang ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguageFilter(lang)}
                >
                  {LANGUAGE_LABELS[lang]}
                </Button>
              ))}
            </div>

            <div className="bg-card border rounded-lg overflow-hidden">
              {questions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No questions found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.title}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {question.description}
                        </TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {LANGUAGE_LABELS[question.lang]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              question.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {question.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(question.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewQuestion(question)}
                              className="gap-2"
                              title="View question"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="gap-2 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenTestCasesModal(question)}
                              title="Manage test cases"
                              className="gap-2"
                            >
                              <BookOpen className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {selectedQuestionForTestCases && (
              <TestCasesModal
                questionId={selectedQuestionForTestCases.id}
                questionTitle={selectedQuestionForTestCases.title}
                isOpen={isTestCasesModalOpen}
                onClose={() => {
                  setIsTestCasesModalOpen(false);
                  setSelectedQuestionForTestCases(null);
                }}
              />
            )}

            {/* View Dialog */}
            <AlertDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>View Question</AlertDialogTitle>
                </AlertDialogHeader>
                {viewingQuestion && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Question Title</Label>
                      <p className="text-sm p-2 bg-muted rounded">{viewingQuestion.title}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <p className="text-sm p-2 bg-muted rounded whitespace-pre-wrap">{viewingQuestion.description}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <p className="text-sm p-2 bg-muted rounded">{LANGUAGE_LABELS[viewingQuestion.lang]}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Solution Code</Label>
                      <pre className="text-sm p-3 bg-muted rounded font-mono overflow-x-auto border">{viewingQuestion.solution_code}</pre>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <p className="text-sm p-2 bg-muted rounded">{viewingQuestion.is_active ? "Active" : "Inactive"}</p>
                    </div>
                    {viewingQuestion.testCases && viewingQuestion.testCases.length > 0 && (
                      <div className="space-y-2">
                        <Label>Test Cases ({viewingQuestion.testCases.length})</Label>
                        <div className="space-y-2">
                          {viewingQuestion.testCases.map((testCase, index) => (
                            <div key={testCase.id} className="border rounded p-3 bg-muted/50 text-sm">
                              <p className="font-medium mb-2">Test Case {index + 1}</p>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Input:</p>
                                <pre className="bg-background p-2 rounded text-xs overflow-x-auto">{testCase.input}</pre>
                              </div>
                              <div className="space-y-1 mt-2">
                                <p className="text-xs text-muted-foreground">Expected Output:</p>
                                <pre className="bg-background p-2 rounded text-xs overflow-x-auto">{testCase.expected_output}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Question</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the question details
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Question Title *</Label>
                    <Input
                      id="edit-title"
                      placeholder="e.g., Fibonacci Sequence"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description *</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Detailed problem description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-solution_code">Solution Code (leave empty to keep current)</Label>
                    <Textarea
                      id="edit-solution_code"
                      placeholder="Write the solution code"
                      value={formData.solution_code}
                      onChange={(e) =>
                        setFormData({ ...formData, solution_code: e.target.value })
                      }
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lang">Language *</Label>
                    <select
                      id="edit-lang"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      value={formData.lang}
                      onChange={(e) =>
                        setFormData({ ...formData, lang: e.target.value })
                      }
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {LANGUAGE_LABELS[lang]}
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
                    onClick={handleUpdateQuestion}
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

export default function QuestionsPage() {
  return (
    <AuthGuard>
      <QuestionsContent />
    </AuthGuard>
  );
}
