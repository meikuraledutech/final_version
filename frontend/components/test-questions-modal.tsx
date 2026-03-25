"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

interface TestQuestion {
  id: string;
  question_id: string;
  question_order: number;
  title: string;
  description: string;
  lang: string;
  is_active: boolean;
  created_at: string;
}

interface Question {
  id: string;
  title: string;
  description: string;
  lang: string;
  is_active: boolean;
  created_at: string;
}

interface TestQuestionsModalProps {
  testId: string;
  testTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGE_LABELS: { [key: string]: string } = {
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
};

export function TestQuestionsModal({
  testId,
  testTitle,
  isOpen,
  onClose,
}: TestQuestionsModalProps) {
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch test details with questions
      const testRes = await api.get(`/api/tests/${testId}`);
      setTestQuestions(testRes.data.test.questions || []);

      // Fetch all questions
      const questionsRes = await api.get("/api/questions");
      const allQs = questionsRes.data.questions || [];
      
      // Filter out questions already in test
      const testQuestionIds = (testRes.data.test.questions || []).map(
        (q: TestQuestion) => q.question_id
      );
      const availableQuestions = allQs.filter(
        (q: Question) => !testQuestionIds.includes(q.id)
      );
      
      setAllQuestions(availableQuestions);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to fetch test questions");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const handleAddQuestion = async (questionId: string) => {
    try {
      await api.post("/api/tests/questions/add", {
        test_id: testId,
        question_id: questionId,
      });
      toast.success("Question added to test");
      setShowAddDropdown(false);
      fetchData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to add question";
      toast.error(errorMsg);
    }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      await api.post("/api/tests/questions/remove", {
        test_id: testId,
        question_id: questionId,
      });
      toast.success("Question removed from test");
      fetchData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to remove question";
      toast.error(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">Manage Test Questions</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-sm text-muted-foreground border-b">
          Test: <span className="font-semibold text-foreground">{testTitle}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Add Question Dropdown */}
            <div className="relative">
              <Button
                size="sm"
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
              {showAddDropdown && (
                <div className="absolute top-10 left-0 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto z-10 w-96">
                  {allQuestions.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      No available questions
                    </div>
                  ) : (
                    allQuestions.map((question) => (
                      <button
                        key={question.id}
                        onClick={() => handleAddQuestion(question.id)}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium">{question.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {LANGUAGE_LABELS[question.lang]}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Questions List */}
            {loading ? (
              <p className="text-muted-foreground">Loading questions...</p>
            ) : testQuestions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No questions added to this test yet
              </p>
            ) : (
              <div className="space-y-2">
                {testQuestions.map((question) => (
                  <div
                    key={question.question_id}
                    className="flex items-center justify-between p-4 bg-muted rounded-md border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-sm font-semibold text-muted-foreground min-w-6">
                        {question.question_order}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{question.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {LANGUAGE_LABELS[question.lang]}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(question.question_id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
