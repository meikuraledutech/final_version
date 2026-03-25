"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";

interface TestCase {
  id: string;
  question_id: string;
  input: string;
  expected_output: string;
  created_at: string;
}

interface TestCasesModalProps {
  questionId: string;
  questionTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TestCasesModal({
  questionId,
  questionTitle,
  isOpen,
  onClose,
}: TestCasesModalProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    input: "",
    expected_output: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTestCases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/questions/${questionId}/testcases`
      );
      setTestCases(response.data.testCases || []);
    } catch (error) {
      console.error("Failed to fetch test cases", error);
      toast.error("Failed to fetch test cases");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    if (isOpen) {
      fetchTestCases();
    }
  }, [isOpen, fetchTestCases]);

  const handleAddTestCase = async () => {
    if (!formData.input.trim() || !formData.expected_output.trim()) {
      toast.error("Input and expected output are required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/api/questions/${questionId}/testcases`, {
        question_id: questionId,
        input: formData.input,
        expected_output: formData.expected_output,
      });

      toast.success("Test case added successfully");
      setFormData({
        input: "",
        expected_output: "",
      });
      setShowAddForm(false);
      fetchTestCases();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to add test case";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!window.confirm("Are you sure you want to delete this test case?"))
      return;

    try {
      await api.delete(`/api/questions/testcases/${testCaseId}`);
      toast.success("Test case deleted successfully");
      fetchTestCases();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete test case";
      toast.error(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">Manage Test Cases</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-sm text-muted-foreground border-b">
          Question: <span className="font-semibold text-foreground">{questionTitle}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Add Form */}
            {showAddForm && (
              <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
                <h3 className="font-semibold">Add New Test Case</h3>
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <Textarea
                    id="input"
                    placeholder="Enter test input (use \\n for new lines)"
                    value={formData.input}
                    onChange={(e) =>
                      setFormData({ ...formData, input: e.target.value })
                    }
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_output">Expected Output</Label>
                  <Textarea
                    id="expected_output"
                    placeholder="Enter expected output"
                    value={formData.expected_output}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_output: e.target.value,
                      })
                    }
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ input: "", expected_output: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddTestCase}
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "Add Test Case"}
                  </Button>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Test Case
              </Button>
            )}

            {/* Test Cases List */}
            {loading ? (
              <p className="text-muted-foreground">Loading test cases...</p>
            ) : testCases.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No test cases yet
              </p>
            ) : (
              <div className="space-y-3">
                {testCases.map((testCase, index) => (
                  <div
                    key={testCase.id}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">Test Case {index + 1}</h4>
                      <button
                        onClick={() => handleDeleteTestCase(testCase.id)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                        title="Delete test case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Input
                        </p>
                        <pre className="bg-background p-2 rounded text-xs font-mono overflow-x-auto">
                          {testCase.input}
                        </pre>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Expected Output
                        </p>
                        <pre className="bg-background p-2 rounded text-xs font-mono overflow-x-auto">
                          {testCase.expected_output}
                        </pre>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Created:{" "}
                        {new Date(testCase.created_at).toLocaleDateString()} at{" "}
                        {new Date(testCase.created_at).toLocaleTimeString()}
                      </p>
                    </div>
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
