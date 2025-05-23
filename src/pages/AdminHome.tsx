import React, { useEffect, useState } from "react";
import { apiService, API_BASE_URL } from "../services/apiService";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Search, X, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { FormField } from "@/components/ui/form";

interface TestCase {
  input: string;
  output: string;
  explanation: string;
}

interface Question {
  questionId?: number;
  questionName: string;
  questionDescription: string;
  constraints: string[];
  sampleTestCases: TestCase[];
  actualTestCases: TestCase[];
  topics: string[];
  questionDifficulty: string;
  questionSource: string;
  questionSolutions?: Solution[];
}

interface Solution {
  name: string;
  explanation: string;
  example: string;
  code: string;
}

const defaultFormData: Question = {
  questionName: "",
  questionDescription: "",
  constraints: [""],
  sampleTestCases: [{ input: "", output: "", explanation: "" }],
  actualTestCases: [{ input: "", output: "", explanation: "" }],
  topics: [""],
  questionDifficulty: "EASY",
  questionSource: "LeetCode"
};

// Move QuestionForm outside the main component
const QuestionForm = React.memo(({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: Question) => void; 
  title: string;
  initialData: Question;
}) => {
  const [formData, setFormData] = React.useState<Question>(initialData);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Use useForm and useFieldArray within the modal for better form management
  const form = useForm<Question>({
    defaultValues: initialData,
  });

  const { fields: constraintFields, append: appendConstraint, remove: removeConstraint } =
    useFieldArray({
      control: form.control,
      name: "constraints" as any
    });

  const { fields: sampleTestCaseFields, append: appendSampleTestCase, remove: removeSampleTestCase } =
    useFieldArray<Question, "sampleTestCases">({
      control: form.control,
      name: "sampleTestCases"
    });

  const { fields: actualTestCaseFields, append: appendActualTestCase, remove: removeActualTestCase } =
    useFieldArray<Question, "actualTestCases">({
      control: form.control,
      name: "actualTestCases"
    });

  const { fields: topicFields, append: appendTopic, remove: removeTopic } =
    useFieldArray({
      control: form.control,
      name: "topics" as any
    });

  const { fields: solutionFields, append: appendSolution, remove: removeSolution } = 
    useFieldArray<Question, "questionSolutions">({
      control: form.control,
      name: "questionSolutions"
    });


  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {title === "Add New Question" ? "Add a new coding question to the database" : "Edit the existing coding question"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Question Name</Label>
            <FormField
              control={form.control}
              name="questionName"
              render={({ field }) => (
                <Input id="name" {...field} required />
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <FormField
              control={form.control}
              name="questionDescription"
              render={({ field }) => (
                <Textarea id="description" {...field} required />
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Constraints</Label>
            {constraintFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`constraints.${index}` as const}
                  render={({ field }) => (
                    <Input {...field} required />
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeConstraint(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendConstraint("")}
            >
              Add Constraint
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Sample Test Cases</Label>
            {sampleTestCaseFields.map((field, index) => (
              <div key={field.id} className="grid gap-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Test Case {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeSampleTestCase(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <div>
                    <Label>Input</Label>
                    <FormField
                      control={form.control}
                      name={`sampleTestCases.${index}.input` as const}
                      render={({ field }) => (
                        <Input {...field} required />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Output</Label>
                    <FormField
                      control={form.control}
                      name={`sampleTestCases.${index}.output` as const}
                      render={({ field }) => (
                        <Input {...field} required />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Explanation</Label>
                    <FormField
                      control={form.control}
                      name={`sampleTestCases.${index}.explanation` as const}
                      render={({ field }) => (
                        <Textarea {...field} required />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendSampleTestCase({ input: "", output: "", explanation: "" })}
            >
              Add Sample Test Case
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Actual Test Cases</Label>
            {actualTestCaseFields.map((field, index) => (
              <div key={field.id} className="grid gap-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Test Case {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeActualTestCase(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <div>
                    <Label>Input</Label>
                    <FormField
                      control={form.control}
                      name={`actualTestCases.${index}.input` as const}
                      render={({ field }) => (
                        <Input {...field} required />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Output</Label>
                    <FormField
                      control={form.control}
                      name={`actualTestCases.${index}.output` as const}
                      render={({ field }) => (
                        <Input {...field} required />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Explanation</Label>
                    <FormField
                      control={form.control}
                      name={`actualTestCases.${index}.explanation` as const}
                      render={({ field }) => (
                        <Textarea {...field} required />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendActualTestCase({ input: "", output: "", explanation: "" })}
            >
              Add Actual Test Case
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Topics</Label>
            <div className="flex flex-wrap gap-2">
              {topicFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`topics.${index}` as const}
                    render={({ field }) => (
                      <Input {...field} required />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeTopic(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendTopic("")}
              >
                Add Topic
              </Button>
            </div>
          </div>

          {/* Solutions */}
          <div className="grid gap-2">
            <Label>Solutions</Label>
            {solutionFields.map((field, index) => (
              <div key={field.id} className="grid gap-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Solution #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeSolution(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <div>
                    <Label>Name</Label>
                    <FormField
                      control={form.control}
                      name={`questionSolutions.${index}.name` as const}
                      render={({ field }) => (
                        <Input placeholder="Enter solution name" {...field} required />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Explanation</Label>
                    <FormField
                      control={form.control}
                      name={`questionSolutions.${index}.explanation` as const}
                      render={({ field }) => (
                        <Textarea placeholder="Enter explanation" {...field} required />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Example</Label>
                    <FormField
                      control={form.control}
                      name={`questionSolutions.${index}.example` as const}
                      render={({ field }) => (
                        <Input placeholder="Enter example" {...field} required />
                      )}
                    />
                  </div>
                  <div>
                    <Label>Code</Label>
                    <FormField
                      control={form.control}
                      name={`questionSolutions.${index}.code` as const}
                      render={({ field }) => (
                        <Textarea placeholder="Enter solution code" className="font-mono" {...field} required />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendSolution({ name: "", explanation: "", example: "", code: "" })}
            >
              Add Solution
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Difficulty</Label>
            <FormField
              control={form.control}
              name="questionDifficulty"
              render={({ field }) => (
                <Select {...field} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Source</Label>
            <FormField
              control={form.control}
              name="questionSource"
              render={({ field }) => (
                <Input {...field} required />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {title === "Add New Question" ? "Add Question" : "Update Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

const AdminHome = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const questionsData = await apiService.getAllQuestionNames();
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async (formData: Question) => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/addNewQuestion`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      toast.success("Question added successfully");
      setShowAddDialog(false);
      await fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    }
  };

  const handleUpdateQuestion = async (formData: Question) => {
    if (!selectedQuestion?.questionId) return;

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/updateQuestion`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          questionId: selectedQuestion.questionId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      toast.success("Question updated successfully");
      setShowEditDialog(false);
      await fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/deleteQuestion/${questionId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete question");
        }

        toast.success("Question deleted successfully");
        await fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
      }
    }
  };

  const handleEditClick = async (question: Question) => {
    try {
      const completeQuestion = await apiService.getQuestionById(question.questionId!);
      setSelectedQuestion(completeQuestion);
      setShowEditDialog(true);
    } catch (error) {
      console.error("Error fetching question details:", error);
      toast.error("Failed to load question details");
    }
  };

  const handleAddClick = () => {
    setShowAddDialog(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case "EASY":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.questionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-black p-2 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hello Admin</h1>
                <p className="text-sm text-gray-500">Welcome to your dashboard</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Manage Coding Questions</h2>
          <Button onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Question
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Question Name</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.questionId}>
                    <TableCell>#{question.questionId}</TableCell>
                    <TableCell className="font-medium">{question.questionName}</TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(question.questionDifficulty)}>
                        {question.questionDifficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {question.topics.map((topic, index) => (
                          <Badge key={index} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteQuestion(question.questionId!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredQuestions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No questions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <QuestionForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddQuestion}
          title="Add New Question"
          initialData={defaultFormData}
        />

        <QuestionForm
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSubmit={handleUpdateQuestion}
          title="Edit Question"
          initialData={selectedQuestion || defaultFormData}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">© 2024 Code Coach. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminHome; 