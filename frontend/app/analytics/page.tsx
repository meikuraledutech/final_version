"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { ArrowLeft, Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface Batch {
  id: number;
  name: string;
  year: string;
  students: number;
  courses: number;
}

interface Student {
  id: number;
  name: string;
  solvedProblems: number;
  totalProblems: number;
  timeTaken: string;
}

interface Question {
  id: number;
  title: string;
  description: string;
  language: string;
}

interface StudentCode {
  studentId: number;
  questionId: number;
  code: string;
  testCasesPassed: number;
  totalTestCases: number;
}

const DUMMY_BATCHES: Batch[] = [
  {
    id: 1,
    name: "Batch 2024-A",
    year: "2024",
    students: 45,
    courses: 5,
  },
  {
    id: 2,
    name: "Batch 2024-B",
    year: "2024",
    students: 52,
    courses: 5,
  },
];

const DUMMY_STUDENTS: Record<number, Student[]> = {
  1: [
    {
      id: 1,
      name: "John Doe",
      solvedProblems: 3,
      totalProblems: 10,
      timeTaken: "45",
    },
    {
      id: 2,
      name: "Jane Smith",
      solvedProblems: 10,
      totalProblems: 10,
      timeTaken: "38",
    },
    {
      id: 3,
      name: "Mike Johnson",
      solvedProblems: 6,
      totalProblems: 10,
      timeTaken: "52",
    },
  ],
  2: [
    {
      id: 4,
      name: "Sarah Wilson",
      solvedProblems: 5,
      totalProblems: 10,
      timeTaken: "42",
    },
    {
      id: 5,
      name: "Tom Brown",
      solvedProblems: 4,
      totalProblems: 10,
      timeTaken: "48",
    },
    {
      id: 6,
      name: "Emma Davis",
      solvedProblems: 8,
      totalProblems: 10,
      timeTaken: "35",
    },
  ],
};

const DUMMY_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you cannot use the same element twice.",
    language: "python",
  },
  {
    id: 2,
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    language: "python",
  },
  {
    id: 3,
    title: "Palindrome Number",
    description:
      "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
    language: "java",
  },
  {
    id: 4,
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets.",
    language: "python",
  },
  {
    id: 5,
    title: "Merge Two Sorted Lists",
    description:
      "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the two lists.",
    language: "java",
  },
];

const DUMMY_STUDENT_CODE: StudentCode[] = [
  // Student 1 - All questions
  {
    studentId: 1,
    questionId: 1,
    code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    testCasesPassed: 5,
    totalTestCases: 5,
  },
  {
    studentId: 1,
    questionId: 2,
    code: `def reverseString(s):
    left = 0
    right = len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return s`,
    testCasesPassed: 4,
    totalTestCases: 5,
  },
  {
    studentId: 1,
    questionId: 3,
    code: `public class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        int original = x;
        int reversed = 0;
        while (x > 0) {
            reversed = reversed * 10 + x % 10;
            x /= 10;
        }
        return original == reversed;
    }
}`,
    testCasesPassed: 5,
    totalTestCases: 5,
  },
  {
    studentId: 1,
    questionId: 4,
    code: `def isValid(s):
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    for char in s:
        if char in pairs:
            stack.append(char)
        else:
            if not stack or pairs[stack.pop()] != char:
                return False
    return len(stack) == 0`,
    testCasesPassed: 4,
    totalTestCases: 5,
  },
  {
    studentId: 1,
    questionId: 5,
    code: `public class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                current.next = list1;
                list1 = list1.next;
            } else {
                current.next = list2;
                list2 = list2.next;
            }
            current = current.next;
        }
        current.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }
}`,
    testCasesPassed: 2,
    totalTestCases: 5,
  },
  // Student 2 - All questions
  {
    studentId: 2,
    questionId: 1,
    code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i`,
    testCasesPassed: 3,
    totalTestCases: 5,
  },
  {
    studentId: 2,
    questionId: 2,
    code: `def reverseString(s):
    return s[::-1]`,
    testCasesPassed: 2,
    totalTestCases: 5,
  },
  {
    studentId: 2,
    questionId: 3,
    code: `public class Solution {
    public boolean isPalindrome(int x) {
        String s = Integer.toString(x);
        return s.equals(new StringBuilder(s).reverse().toString());
    }
}`,
    testCasesPassed: 4,
    totalTestCases: 5,
  },
  {
    studentId: 2,
    questionId: 4,
    code: `def isValid(s):
    stack = []
    for c in s:
        if c == '(' or c == '[' or c == '{':
            stack.append(c)
        else:
            # Incomplete implementation
            pass
    return False`,
    testCasesPassed: 2,
    totalTestCases: 5,
  },
  {
    studentId: 2,
    questionId: 5,
    code: `public class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Not implemented
        return null;
    }
}`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  // Student 3 - All questions
  {
    studentId: 3,
    questionId: 1,
    code: `# Write your solution here
`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  {
    studentId: 3,
    questionId: 2,
    code: `# Write your solution here
`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  {
    studentId: 3,
    questionId: 3,
    code: `# Write your solution here
`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  {
    studentId: 3,
    questionId: 4,
    code: `# Write your solution here
`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  {
    studentId: 3,
    questionId: 5,
    code: `# Write your solution here
`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  // Student 4 - All questions
  {
    studentId: 4,
    questionId: 1,
    code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    # Missing return statement`,
    testCasesPassed: 3,
    totalTestCases: 5,
  },
  {
    studentId: 4,
    questionId: 2,
    code: `def reverseString(s):
    left = 0
    right = len(s) - 1
    while left < right:
        # TODO: Add swap logic here
        left += 1
        right -= 1
    return s`,
    testCasesPassed: 2,
    totalTestCases: 5,
  },
  {
    studentId: 4,
    questionId: 3,
    code: `public class Solution {
    public boolean isPalindrome(int x) {
        // Incomplete
        return false;
    }
}`,
    testCasesPassed: 1,
    totalTestCases: 5,
  },
  {
    studentId: 4,
    questionId: 4,
    code: `def isValid(s):
    stack = []
    for c in s:
        stack.append(c)
    return True`,
    testCasesPassed: 1,
    totalTestCases: 5,
  },
  {
    studentId: 4,
    questionId: 5,
    code: `public class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Not started
        return null;
    }
}`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  // Student 5 - All questions
  {
    studentId: 5,
    questionId: 1,
    code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    testCasesPassed: 2,
    totalTestCases: 5,
  },
  {
    studentId: 5,
    questionId: 2,
    code: `def reverseString(s):
    result = []
    for i in range(len(s)):
        result.append(s[i])
    return result`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  {
    studentId: 5,
    questionId: 3,
    code: `public class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        String s = String.valueOf(x);
        return s.equals(new StringBuilder(s).reverse().toString());
    }
}`,
    testCasesPassed: 1,
    totalTestCases: 5,
  },
  {
    studentId: 5,
    questionId: 4,
    code: `def isValid(s):
    pairs = {'(': ')', '[': ']'}
    for c in s:
        if c in pairs:
            pass
    return True`,
    testCasesPassed: 0,
    totalTestCases: 5,
  },
  {
    studentId: 5,
    questionId: 5,
    code: `public class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if (list1 == null) return list2;
        return list1;
    }
}`,
    testCasesPassed: 1,
    totalTestCases: 5,
  },
  // Student 6 - All questions
  {
    studentId: 6,
    questionId: 1,
    code: `def twoSum(nums, target):
    result = []
    for i in range(len(nums)):
        for j in range(len(nums)):
            if i != j and nums[i] + nums[j] == target:
                result.append([i, j])
    return result[0] if result else []`,
    testCasesPassed: 2,
    totalTestCases: 5,
  },
  {
    studentId: 6,
    questionId: 2,
    code: `def reverseString(s):
    s.reverse()
    return s`,
    testCasesPassed: 3,
    totalTestCases: 5,
  },
  {
    studentId: 6,
    questionId: 3,
    code: `public class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        int temp = x;
        int reversed = 0;
        while (temp > 0) {
            reversed = reversed * 10 + temp % 10;
            temp /= 10;
        }
        return x == reversed;
    }
}`,
    testCasesPassed: 1,
    totalTestCases: 5,
  },
  {
    studentId: 6,
    questionId: 4,
    code: `def isValid(s):
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    for char in s:
        if char in pairs:
            stack.append(char)
        elif char in pairs.values():
            if not stack or pairs[stack.pop()] != char:
                return False
    return len(stack) == 0`,
    testCasesPassed: 4,
    totalTestCases: 5,
  },
  {
    studentId: 6,
    questionId: 5,
    code: `public class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if (list1 == null) return list2;
        if (list2 == null) return list1;
        if (list1.val <= list2.val) {
            list1.next = mergeTwoLists(list1.next, list2);
            return list1;
        } else {
            list2.next = mergeTwoLists(list1, list2.next);
            return list2;
        }
    }
}`,
    testCasesPassed: 2,
    totalTestCases: 5,
  },
];

function AnalyticsContent() {
  const { isLoading } = useAuth();
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.includes("-student-")) {
        const parts = hash.split("-student-");
        const batchId = parseInt(parts[0].replace("batch-", ""));
        const studentId = parseInt(parts[1]);
        setSelectedBatchId(batchId);
        setSelectedStudentId(studentId);
      } else if (hash.startsWith("batch-")) {
        const batchId = parseInt(hash.split("-")[1]);
        setSelectedBatchId(batchId);
        setSelectedStudentId(null);
      } else {
        setSelectedBatchId(null);
        setSelectedStudentId(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleBatchClick = (batchId: number) => {
    window.location.hash = `batch-${batchId}`;
  };

  const handleViewStudent = (studentId: number) => {
    window.location.hash = `batch-${selectedBatchId}-student-${studentId}`;
  };

  const handleBack = () => {
    if (selectedStudentId) {
      window.location.hash = `batch-${selectedBatchId}`;
    } else {
      window.location.hash = "";
    }
  };

  const selectedBatch = DUMMY_BATCHES.find((b) => b.id === selectedBatchId);
  const students = selectedBatchId ? DUMMY_STUDENTS[selectedBatchId] : [];
  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const studentCodeData = DUMMY_STUDENT_CODE.find(
    (sc) => sc.studentId === selectedStudentId,
  );
  const question = studentCodeData
    ? DUMMY_QUESTIONS.find((q) => q.id === studentCodeData.questionId)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar activeItem="Analytics" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto w-full max-w-6xl">
            {selectedStudentId && selectedStudent && question ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <h2 className="text-3xl font-bold">{selectedStudent.name}</h2>
                </div>

                <div className="bg-card border rounded-lg">
                  <Accordion type="single" collapsible>
                    {DUMMY_QUESTIONS.map((q) => {
                      const code = DUMMY_STUDENT_CODE.find(
                        (sc) =>
                          sc.studentId === selectedStudentId &&
                          sc.questionId === q.id,
                      );
                      const isPassed =
                        code && code.testCasesPassed === code.totalTestCases;

                      return (
                        <AccordionItem key={q.id} value={`question-${q.id}`}>
                          <AccordionTrigger className="px-6">
                            <div className="flex-1 text-left">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {q.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded font-mono text-sm font-semibold ${
                                  code &&
                                  code.testCasesPassed === code.totalTestCases
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                                    : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100"
                                }`}
                              >
                                {code
                                  ? `${code.testCasesPassed}/${code.totalTestCases}`
                                  : "0/0"}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded font-semibold">
                                {q.language.toUpperCase()}
                              </span>
                              <span
                                className={`px-3 py-1 rounded font-semibold text-sm ${
                                  isPassed
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
                                }`}
                              >
                                {isPassed ? "Pass" : "Fail"}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <div className="space-y-6">
                              {/* Description */}
                              {q.description && (
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                                    Description
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {q.description}
                                  </p>
                                </div>
                              )}

                              {/* Student Code - Show if exists */}
                              {code && (
                                <div>
                                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                                    Code
                                  </h4>
                                  <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded font-mono text-sm text-gray-100 overflow-auto max-h-96">
                                    <pre>{code.code}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </>
            ) : !selectedBatchId ? (
              <>
                <h2 className="text-3xl font-bold mb-6">Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DUMMY_BATCHES.map((batch) => (
                    <div
                      key={batch.id}
                      onClick={() => handleBatchClick(batch.id)}
                      className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {batch.name}
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Year
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {batch.year}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Students
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {batch.students}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Courses
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {batch.courses}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <h2 className="text-3xl font-bold">
                    {selectedBatch?.name} - Students
                  </h2>
                </div>

                <div className="bg-card border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">
                          Solved Problems
                        </TableHead>
                        <TableHead className="text-center">
                          Percentage
                        </TableHead>
                        <TableHead className="text-center">
                          Time Taken (mins)
                        </TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const passPercentage =
                          (student.solvedProblems / student.totalProblems) *
                          100;
                        const isPassed = passPercentage >= 60;
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="text-gray-900 dark:text-white">
                              {student.name}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-mono font-medium text-gray-900 dark:text-white">
                                {student.solvedProblems}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-mono font-medium text-gray-900 dark:text-white">
                                {passPercentage.toFixed(0)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-mono font-medium text-gray-900 dark:text-white">
                                {student.timeTaken}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`font-semibold ${
                                  isPassed
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {isPassed ? "Pass" : "Fail"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 h-auto"
                                onClick={() => handleViewStudent(student.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}
