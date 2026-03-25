"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth-guard";
import api from "@/lib/api";
import { authStore } from "@/store/authStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import MonacoEditor from "@/components/monaco-editor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  input: string;
  output: string;
}

interface Question {
  id: number;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  examples: Example[];
  testCases: TestCase[];
}

interface ExecutionResult {
  success: boolean;
  testResults?: TestResultItem[];
  output?: string;
  error?: string;
  statusCode: number;
  message?: string;
  executionTime?: number;
}

interface TestResultData {
  success: boolean;
  testResults?: TestResultItem[];
  output?: string;
  error?: string;
  statusCode: number;
  message?: string;
  executionTime?: number;
}

interface TestResultItem {
  passed: boolean;
  output: string;
  expected: string;
  error?: string;
}

const DUMMY_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you cannot use the same element twice.",
    language: "python",
    difficulty: "Easy",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation:
          "The sum of 2 and 7 is 9. Therefore, index 0 and index 1 are returned.",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation:
          "The sum of 2 and 4 is 6. Therefore, index 1 and index 2 are returned.",
      },
    ],
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" },
    ],
  },
  {
    id: 2,
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    language: "python",
    difficulty: "Easy",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    testCases: [
      { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      {
        input: '["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
  },
  {
    id: 3,
    title: "Palindrome Number",
    description:
      "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
    language: "java",
    difficulty: "Easy",
    examples: [
      {
        input: "x = 121",
        output: "true",
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "-121 reads as 121- from left to right",
      },
      {
        input: "x = 10",
        output: "false",
        explanation:
          "Reads as 01 from right to left, which is not a palindrome",
      },
    ],
    testCases: [
      { input: "121", output: "true" },
      { input: "-121", output: "false" },
      { input: "10", output: "false" },
    ],
  },
  {
    id: 4,
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets.",
    language: "python",
    difficulty: "Easy",
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    testCases: [
      { input: '"()"', output: "true" },
      { input: '"()[]{}"', output: "true" },
      { input: '"(]"', output: "false" },
    ],
  },
  {
    id: 5,
    title: "Merge Two Sorted Lists",
    description:
      "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the two lists.",
    language: "java",
    difficulty: "Easy",
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]",
      },
    ],
    testCases: [
      { input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "[]\n[0]", output: "[0]" },
    ],
  },
  {
    id: 6,
    title: "Binary Search",
    description:
      "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    language: "c",
    difficulty: "Easy",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists and its index is 4",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 13",
        output: "-1",
        explanation: "13 does not exist in the array",
      },
    ],
    testCases: [
      { input: "[-1,0,3,5,9,12]\n9", output: "4" },
      { input: "[-1,0,3,5,9,12]\n13", output: "-1" },
    ],
  },
  {
    id: 7,
    title: "Longest Substring Without Repeating",
    description:
      "Given a string s, find the length of the longest substring without repeating characters. A substring is a contiguous sequence of characters within a string.",
    language: "python",
    difficulty: "Medium",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: "The answer is 'abc' with the length of 3",
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: "The answer is 'b' with the length of 1",
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: "The answer is 'wke' with the length of 3",
      },
    ],
    testCases: [
      { input: '"abcabcbb"', output: "3" },
      { input: '"bbbbb"', output: "1" },
      { input: '"pwwkew"', output: "3" },
    ],
  },
  {
    id: 8,
    title: "Container With Most Water",
    description:
      "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    language: "cpp",
    difficulty: "Medium",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation:
          "The vertical lines are at indices 1 and 8. Container area = 7 * 8 = 49",
      },
      {
        input: "height = [1,1]",
        output: "1",
      },
    ],
    testCases: [
      { input: "[1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "[1,1]", output: "1" },
    ],
  },
  {
    id: 9,
    title: "3Sum",
    description:
      "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.",
    language: "java",
    difficulty: "Medium",
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
      },
      {
        input: "nums = [0]",
        output: "[]",
      },
    ],
    testCases: [
      { input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "[0]", output: "[]" },
    ],
  },
  {
    id: 10,
    title: "Remove Duplicates from Sorted Array",
    description:
      "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in nums.",
    language: "c",
    difficulty: "Easy",
    examples: [
      {
        input: "nums = [1,1,2]",
        output: "2, nums = [1,2,_]",
        explanation:
          "Your function should return k = 2 with the first two elements of nums being 1 and 2",
      },
      {
        input: "nums = [0,0,1,1,1,2,2,3,3,4]",
        output: "5, nums = [0,1,2,3,4,_,_,_,_,_]",
      },
    ],
    testCases: [
      { input: "[1,1,2]", output: "2" },
      { input: "[0,0,1,1,1,2,2,3,3,4]", output: "5" },
    ],
  },
  {
    id: 11,
    title: "Add Two Numbers",
    description:
      "Given two integers a and b, return their sum. This is a simple warm-up problem to get you started.",
    language: "python",
    difficulty: "Easy",
    examples: [
      {
        input: "a = 5, b = 3",
        output: "8",
        explanation: "The sum of 5 and 3 is 8",
      },
      {
        input: "a = -1, b = 1",
        output: "0",
        explanation: "The sum of -1 and 1 is 0",
      },
      {
        input: "a = 100, b = 200",
        output: "300",
        explanation: "The sum of 100 and 200 is 300",
      },
    ],
    testCases: [
      { input: "5\n3", output: "8" },
      { input: "-1\n1", output: "0" },
      { input: "100\n200", output: "300" },
    ],
  },
];

const TEST_DETAILS = {
  title: "Data Structures & Algorithms Challenge",
  description:
    "Test your knowledge on fundamental data structures and algorithms. Solve 10 problems covering arrays, strings, linked lists, and more.",
  duration: 120,
  totalQuestions: DUMMY_QUESTIONS.length,
  difficulty: "Mixed (Easy & Medium)",
};

function AssignmentsContent() {
  const { isLoading } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(
    DUMMY_QUESTIONS[0],
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Use ref for code storage to avoid re-renders and stale closures
  const codeStorageRef = useRef<Record<number, string>>({});
  // Use ref for test results storage per question
  const resultStorageRef = useRef<
    Record<
      number,
      {
        executionResult: ExecutionResult | null;
        testResult: TestResultData | null;
      }
    >
  >({});
  // Track completed questions
  const completedQuestionsRef = useRef<Set<number>>(new Set());
  const currentQuestionIdRef = useRef<number>(selectedQuestion.id);

  // Initialize storage only once
  useEffect(() => {
    if (Object.keys(codeStorageRef.current).length === 0) {
      DUMMY_QUESTIONS.forEach((q) => {
        codeStorageRef.current[q.id] = "// Write your solution here\n";
      });
    }
  }, []);

  const [code, setCode] = useState("// Write your solution here\n");
  const [selectedLanguage, setSelectedLanguage] = useState(
    DUMMY_QUESTIONS[0].language,
  );
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [testResult, setTestResult] = useState<TestResultData | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    TEST_DETAILS.duration * 60,
  ); // in seconds
  const [completedCount, setCompletedCount] = useState(0); // for re-renders

  useEffect(() => {
    const checkFullscreen = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    checkFullscreen();
    document.addEventListener("fullscreenchange", checkFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", checkFullscreen);
  }, []);

  // Disable copy/paste during test
  useEffect(() => {
    if (!testStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Prevent Ctrl+C / Cmd+C (copy)
      if (isCtrlOrCmd && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        toast.error("Copy/paste is disabled during the test");
        return;
      }

      // Prevent Ctrl+X / Cmd+X (cut)
      if (isCtrlOrCmd && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        toast.error("Copy/paste is disabled during the test");
        return;
      }

      // Prevent Ctrl+V / Cmd+V (paste)
      if (isCtrlOrCmd && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        toast.error("Copy/paste is disabled during the test");
        return;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copy/paste is disabled during the test");
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copy/paste is disabled during the test");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copy/paste is disabled during the test");
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      (e as any).returnValue = false;
      toast.error("Copy/paste is disabled during the test");

      // Hide any context menus that might appear
      setTimeout(() => {
        const menus = document.querySelectorAll('[role="menu"], .monaco-context-menu, .context-menu');
        menus.forEach(menu => {
          (menu as HTMLElement).style.display = 'none';
          (menu as HTMLElement).remove();
        });
      }, 0);
    };

    // Add listeners with capture phase to catch events before they propagate
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("paste", handlePaste, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [testStarted]);

  // Load code and test results for selected question
  useEffect(() => {
    currentQuestionIdRef.current = selectedQuestion.id;
    const storedCode = codeStorageRef.current[selectedQuestion.id];
    const storedResults = resultStorageRef.current[selectedQuestion.id];

    setCode(storedCode || "// Write your solution here\n");
    setExecutionResult(storedResults?.executionResult || null);
    setTestResult(storedResults?.testResult || null);
    setSelectedLanguage(selectedQuestion.language);
  }, [selectedQuestion.id, selectedQuestion.language]);

  // Timer countdown when test starts
  useEffect(() => {
    if (!testStarted) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testStarted]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Save code whenever it changes (use ref to avoid stale closure)
  const handleCodeChange = (newCode: string) => {
    const qId = currentQuestionIdRef.current;
    setCode(newCode);
    // Store in ref immediately without re-render using current question ID
    codeStorageRef.current[qId] = newCode;
  };

  const handleEnterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setExecutionResult({
        success: false,
        error: "Code cannot be empty",
        statusCode: 400,
      });
      return;
    }

    setIsExecuting(true);
    try {
      // Validate against test cases
      const testValidationResults = [];
      let allTestsPassed = true;

      for (const testCase of selectedQuestion.testCases) {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_EXECUTE_SYSTEM_API_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.getState().accessToken}`,
              },
              body: JSON.stringify({
                code,
                language: selectedLanguage,
                input: testCase.input,
                timeout: 3,
              }),
            }
          );
          const data = await response.json();

          const outputMatch =
            data.output.trim() === testCase.output.trim();
          testValidationResults.push({
            passed: outputMatch && data.success,
            output: data.output.trim(),
            expected: testCase.output.trim(),
            error: data.error,
          });

          if (!outputMatch || !response.data.success) {
            allTestsPassed = false;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Execution failed";
          testValidationResults.push({
            passed: false,
            output: "",
            expected: testCase.output.trim(),
            error: errorMessage,
          });
          allTestsPassed = false;
        }
      }

      const result = {
        success: allTestsPassed,
        testResults: testValidationResults,
        statusCode: 200,
        message: allTestsPassed
          ? "All test cases passed!"
          : "Some test cases failed",
      };
      setExecutionResult(result);
      // Store result for current question
      resultStorageRef.current[currentQuestionIdRef.current] = {
        executionResult: result,
        testResult: null,
      };
      // Mark as completed if all tests passed
      if (allTestsPassed) {
        completedQuestionsRef.current.add(currentQuestionIdRef.current);
        setCompletedCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Execution failed:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to execute code. Check your connection and try again.";
      const result: ExecutionResult = {
        success: false,
        error: errorMsg,
        statusCode: 500,
      };
      setExecutionResult(result);
      // Store result for current question
      resultStorageRef.current[currentQuestionIdRef.current] = {
        executionResult: result,
        testResult: null,
      };
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTestCode = async () => {
    if (!code.trim()) {
      setTestResult({
        success: false,
        error: "Code cannot be empty",
        statusCode: 400,
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_EXECUTE_SYSTEM_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.getState().accessToken}`,
          },
          body: JSON.stringify({
            code,
            language: selectedLanguage,
            testCases: selectedQuestion.testCases,
            timeout: 3,
          }),
        }
      );
      const data = await response.json();

      setTestResult(data);
      // Store result for current question
      resultStorageRef.current[currentQuestionIdRef.current] = {
        executionResult: null,
        testResult: data,
      };
      // Mark as completed if test passed
      if (data.success) {
        completedQuestionsRef.current.add(currentQuestionIdRef.current);
        setCompletedCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Test execution failed:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to test code. Check your connection and try again.";
      const result: TestResultData = {
        success: false,
        error: errorMsg,
        statusCode: 500,
      };
      setTestResult(result);
      // Store result for current question
      resultStorageRef.current[currentQuestionIdRef.current] = {
        executionResult: null,
        testResult: result,
      };
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Show fullscreen button if not fullscreen
  if (!isFullscreen) {
    return (
      <div className="w-screen h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            {TEST_DETAILS.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
            {TEST_DETAILS.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Rules Section */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Test Rules
              </h2>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    •
                  </span>
                  <span>This test must be taken in fullscreen mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    •
                  </span>
                  <span>
                    You have {TEST_DETAILS.duration} minutes to complete{" "}
                    {TEST_DETAILS.totalQuestions} questions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    •
                  </span>
                  <span>Do not exit fullscreen during the test</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    •
                  </span>
                  <span>
                    Navigating away will automatically submit your test
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    •
                  </span>
                  <span>Each question may have multiple test cases</span>
                </li>
              </ul>
            </div>

            {/* Warnings Section */}
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                ⚠️ Important Warnings
              </h2>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    !
                  </span>
                  <span>
                    Pressing ESC or exiting fullscreen may end your test
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    !
                  </span>
                  <span>Ensure stable internet connection before starting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    !
                  </span>
                  <span>
                    Close all unnecessary applications and browser tabs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    !
                  </span>
                  <span>This test requires a modern web browser</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    !
                  </span>
                  <span>
                    Switching tabs or minimizing the window is not allowed
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Test Information
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Duration
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {TEST_DETAILS.duration} min
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Questions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {TEST_DETAILS.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Difficulty Level
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {TEST_DETAILS.difficulty}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleEnterFullscreen}
            size="lg"
            className="w-full text-lg"
          >
            ✓ I Understand. Enter Fullscreen to Start
          </Button>
        </div>
      </div>
    );
  }

  // Show test details modal if fullscreen but test not started
  if (!testStarted) {
    return (
      <div className="w-screen h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {TEST_DETAILS.title}
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {TEST_DETAILS.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Duration
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {TEST_DETAILS.duration} min
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Questions
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {TEST_DETAILS.totalQuestions}
                </p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Difficulty
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {TEST_DETAILS.difficulty}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setTestStarted(true)}
            className="w-full"
            size="lg"
          >
            Start Test
          </Button>
        </div>
      </div>
    );
  }

  // Show test layout when fullscreen and test started
  return (
    <div className="w-screen h-screen">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        {/* Left Panel - Questions List */}
        <ResizablePanel defaultSize="20%">
          <div className="flex flex-col h-full border-r">
            {/* Timer */}
            <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
              <div className="text-center font-mono text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(timeRemaining)}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
                {DUMMY_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className={`w-full text-left p-3 rounded-md transition-colors text-sm ${
                      selectedQuestion.id === q.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium truncate">
                      <span className="flex-1 truncate">{q.title}</span>
                      {completedQuestionsRef.current.has(q.id) && (
                        <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Question Title & Description */}
        <ResizablePanel defaultSize="30%">
          <div className="flex flex-col h-full border-r">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedQuestion.title}
                  </h2>
                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded font-semibold">
                      {selectedQuestion.language.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold ${
                        selectedQuestion.difficulty === "Easy"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                          : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100"
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedQuestion.description}
                  </p>
                </div>

                {/* Examples Section */}
                {selectedQuestion.examples &&
                  selectedQuestion.examples.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Examples</h3>
                      <div className="space-y-3">
                        {selectedQuestion.examples.map((example, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Example {idx + 1}:
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs text-gray-700 dark:text-gray-300 mb-2">
                              Input: {example.input}
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs text-gray-700 dark:text-gray-300 mb-2">
                              Output: {example.output}
                            </div>
                            {example.explanation && (
                              <div className="text-gray-600 dark:text-gray-400 text-xs italic">
                                {example.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Test Cases Section */}
                {selectedQuestion.testCases &&
                  selectedQuestion.testCases.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Test Cases</h3>
                      <div className="space-y-2">
                        {selectedQuestion.testCases.map((testCase, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs text-gray-700 dark:text-gray-300 mb-2">
                              Input: {testCase.input}
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs text-gray-700 dark:text-gray-300">
                              Output: {testCase.output}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Code Editor & Results */}
        <ResizablePanel defaultSize="50%">
          <ResizablePanelGroup orientation="vertical" className="h-full">
            {/* Top - Code Editor */}
            <ResizablePanel defaultSize="60%">
              <div className="flex flex-col h-full border-b">
                {/* Code Editor Navbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language:
                    </label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleRunCode}
                      disabled={isExecuting}
                    >
                      {isExecuting ? "⏳ Running..." : "▶ Run"}
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleTestCode}
                      disabled={isTesting}
                    >
                      {isTesting ? "⏳ Testing..." : "✓ Submit"}
                    </Button>
                  </div>
                </div>

                <MonacoEditor
                  language={selectedLanguage}
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs"
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Bottom - Results */}
            <ResizablePanel defaultSize="40%">
              <div className="flex flex-col h-full border-t">
                <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>
                    {testResult?.testResults || executionResult?.testResults
                      ? "Test Results"
                      : "Execution Results"}
                  </span>
                  {(testResult?.testResults || executionResult?.testResults) && (
                    <span
                      className={`text-sm font-bold ${
                        (testResult?.success ?? executionResult?.success)
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {(testResult?.testResults || executionResult?.testResults)?.filter(
                        (t: TestResultItem) => t.passed
                      ).length || 0}
                      /
                      {(testResult?.testResults || executionResult?.testResults)?.length || 0}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {!executionResult && !testResult ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      Click &quot;Run&quot; to execute or &quot;Submit&quot; to
                      test your code
                    </div>
                  ) : testResult || executionResult?.testResults ? (
                    // Test Results Display
                    <div className="space-y-4">
                      {/* Overall Status */}
                      <div>
                        <div className="mb-2">
                          {(testResult?.success ?? executionResult?.success) ? (
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              All Tests Passed
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400 font-semibold">
                              Some Tests Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Test Cases Results */}
                      {(testResult?.testResults ||
                        executionResult?.testResults) &&
                        Array.isArray(
                          testResult?.testResults ||
                            executionResult?.testResults,
                        ) && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                              Test Cases
                            </h4>
                            <div className="space-y-2">
                              {(
                                testResult?.testResults ||
                                executionResult?.testResults
                              )?.map((result: TestResultItem, idx: number) => (
                                <div
                                  key={idx}
                                  className="border-l-4 border-gray-300 dark:border-gray-600 p-3 rounded"
                                >
                                  <div className="mb-3">
                                    <span
                                      className={`font-semibold text-sm ${result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                                    >
                                      Test Case {idx + 1}
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {/* Input */}
                                    <div className="text-xs">
                                      <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                        Input:{" "}
                                      </span>
                                      <span className="font-mono text-gray-900 dark:text-gray-100 block mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                                        {selectedQuestion.testCases[idx]?.input || "N/A"}
                                      </span>
                                    </div>

                                    {/* Expected Output */}
                                    {result.expected && (
                                      <div className="text-xs">
                                        <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                          Expected Output:{" "}
                                        </span>
                                        <span className="font-mono text-gray-900 dark:text-gray-100 block mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                                          {result.expected}
                                        </span>
                                      </div>
                                    )}

                                    {/* Your Output */}
                                    {result.output && (
                                      <div className="text-xs">
                                        <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                          Your Output:{" "}
                                        </span>
                                        <span className="font-mono text-gray-900 dark:text-gray-100 block mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                                          {result.output}
                                        </span>
                                      </div>
                                    )}

                                    {result.error && (
                                      <div className="text-xs text-red-600 dark:text-red-400">
                                        <span className="font-semibold">Error: </span>
                                        <span className="font-mono block mt-1 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                          {result.error}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Execution Error */}
                      {(testResult?.error || executionResult?.error) && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                            Error:
                          </h4>
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded font-mono text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap wrap-break-word max-h-32 overflow-y-auto">
                            {testResult?.error || executionResult?.error}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Execution Results Display
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {executionResult?.success ? (
                            <>
                              <span className="text-green-600 dark:text-green-400 font-bold">
                                ✓
                              </span>
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                Execution Successful
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-red-600 dark:text-red-400 font-bold">
                                ✗
                              </span>
                              <span className="text-red-600 dark:text-red-400 font-semibold">
                                Execution Failed
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Output */}
                      {executionResult?.output && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Output:
                          </h4>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap wrap-break-word max-h-32 overflow-y-auto">
                            {executionResult?.output}
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {executionResult?.error && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                            Error:
                          </h4>
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded font-mono text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap wrap-break-word max-h-32 overflow-y-auto">
                            {executionResult?.error}
                          </div>
                        </div>
                      )}

                      {/* Execution Time */}
                      {executionResult?.executionTime !== undefined && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            Execution Time:{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {executionResult?.executionTime?.toFixed(3)}s
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Status Code */}
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Status Code: {executionResult?.statusCode}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <AuthGuard>
      <AssignmentsContent />
    </AuthGuard>
  );
}
