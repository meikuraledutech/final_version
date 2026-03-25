"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import api from "@/lib/api";
import { toast } from "sonner";

interface BatchMember {
  id: string;
  name: string;
  email: string;
  role: string;
  college_id: string | null;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  college_id: string | null;
}

interface BatchMembersModalProps {
  batchId: string;
  batchName: string;
  collegeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BatchMembersModal({
  batchId,
  batchName,
  collegeId,
  isOpen,
  onClose,
}: BatchMembersModalProps) {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState<BatchMember[]>([]);
  const [trainers, setTrainers] = useState<BatchMember[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [availableTrainers, setAvailableTrainers] = useState<User[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [showAddStudentDropdown, setShowAddStudentDropdown] = useState(false);
  const [showAddTrainerDropdown, setShowAddTrainerDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBatchMembers();
      // Listen for hash changes
      window.addEventListener("hashchange", handleHashChange);
      return () => {
        window.removeEventListener("hashchange", handleHashChange);
      };
    }
  }, [isOpen]);

  const handleHashChange = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "students" || hash === "trainers") {
      setActiveTab(hash);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const fetchBatchMembers = async () => {
    try {
      setLoadingStudents(true);
      const studentsRes = await api.get(
        `/api/batch-members/${batchId}/students`
      );
      setStudents(studentsRes.data.students || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoadingStudents(false);
    }

    try {
      setLoadingTrainers(true);
      const trainersRes = await api.get(
        `/api/batch-members/${batchId}/trainers`
      );
      setTrainers(trainersRes.data.trainers || []);
    } catch (error) {
      console.error("Failed to fetch trainers", error);
    } finally {
      setLoadingTrainers(false);
    }

    // Fetch available students (not in batch)
    try {
      const res = await api.get(
        `/api/users?role=students&college_id=${collegeId}`
      );
      const allStudents = res.data.users || [];
      const batchStudentIds = students.map((s) => s.id);
      setAvailableStudents(
        allStudents.filter((s: User) => !batchStudentIds.includes(s.id))
      );
    } catch (error) {
      console.error("Failed to fetch available students", error);
    }

    // Fetch available trainers (not in batch)
    try {
      const res = await api.get("/api/users/filter/trainers");
      const allTrainers = res.data.trainers || [];
      const batchTrainerIds = trainers.map((t) => t.id);
      setAvailableTrainers(
        allTrainers.filter((t: User) => !batchTrainerIds.includes(t.id))
      );
    } catch (error) {
      console.error("Failed to fetch available trainers", error);
    }
  };

  const handleAddStudent = async (studentId: string) => {
    try {
      await api.post("/api/batch-members/students", {
        batch_id: batchId,
        student_id: studentId,
      });
      toast.success("Student added to batch");
      setShowAddStudentDropdown(false);
      fetchBatchMembers();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Failed to add student";
      toast.error(errorMsg);
    }
  };

  const handleAddTrainer = async (trainerId: string) => {
    try {
      await api.post("/api/batch-members/trainers", {
        batch_id: batchId,
        trainer_id: trainerId,
      });
      toast.success("Trainer added to batch");
      setShowAddTrainerDropdown(false);
      fetchBatchMembers();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Failed to add trainer";
      toast.error(errorMsg);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await api.delete(`/api/batch-members/${batchId}/students/${studentId}`);
      toast.success("Student removed from batch");
      fetchBatchMembers();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Failed to remove student";
      toast.error(errorMsg);
    }
  };

  const handleRemoveTrainer = async (trainerId: string) => {
    try {
      await api.delete(`/api/batch-members/${batchId}/trainers/${trainerId}`);
      toast.success("Trainer removed from batch");
      fetchBatchMembers();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Failed to remove trainer";
      toast.error(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">Manage Batch Members</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-sm text-muted-foreground border-b">
          Batch: <span className="font-semibold text-foreground">{batchName}</span>
        </div>

        {/* Tabs and Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="students">
                Students ({students.length})
              </TabsTrigger>
              <TabsTrigger value="trainers">
                Trainers ({trainers.length})
              </TabsTrigger>
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Students in this Batch</h3>
                <div className="relative">
                  <Button
                    size="sm"
                    onClick={() =>
                      setShowAddStudentDropdown(!showAddStudentDropdown)
                    }
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Student
                  </Button>
                  {showAddStudentDropdown && (
                    <div className="absolute right-0 mt-2 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                      {availableStudents.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">
                          No available students
                        </div>
                      ) : (
                        availableStudents.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => handleAddStudent(student.id)}
                            className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                          >
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {student.email}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {loadingStudents ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : students.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No students added to this batch
                </p>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                        title="Remove student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Trainers Tab */}
            <TabsContent value="trainers" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Trainers in this Batch</h3>
                <div className="relative">
                  <Button
                    size="sm"
                    onClick={() =>
                      setShowAddTrainerDropdown(!showAddTrainerDropdown)
                    }
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Trainer
                  </Button>
                  {showAddTrainerDropdown && (
                    <div className="absolute right-0 mt-2 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                      {availableTrainers.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">
                          No available trainers
                        </div>
                      ) : (
                        availableTrainers.map((trainer) => (
                          <button
                            key={trainer.id}
                            onClick={() => handleAddTrainer(trainer.id)}
                            className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                          >
                            <div className="font-medium">{trainer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {trainer.email}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {loadingTrainers ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : trainers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No trainers added to this batch
                </p>
              ) : (
                <div className="space-y-2">
                  {trainers.map((trainer) => (
                    <div
                      key={trainer.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div>
                        <p className="font-medium">{trainer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {trainer.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveTrainer(trainer.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                        title="Remove trainer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
