import React, { useState } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, ChevronRight } from "lucide-react";

// Define form schema using zod
const formSchema = z.object({
  questionName: z.string().min(1, "Question name is required"),
  questionDescription: z.string().min(1, "Question description is required"),
  constraints: z.array(z.string().min(1, "Constraint cannot be empty")),
  sampleTestCases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    output: z.string().min(1, "Output is required"),
    explanation: z.string().optional()
  })),
  actualTestCases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    output: z.string().min(1, "Output is required"),
    explanation: z.string().optional()
  })),
  topics: z.array(z.string().min(1, "Topic cannot be empty")),
  questionDifficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  questionSource: z.enum(["LeetCode", "CodeForces", "HackerRank", "Other"]),
  questionSolutions: z.array(z.object({
    name: z.string().min(1, "Solution name is required"),
    explanation: z.string().min(1, "Explanation is required"),
    example: z.string().min(1, "Example is required"),
    code: z.string().min(1, "Code is required")
  }))
});

type FormValues = z.infer<typeof formSchema>;

const AdminQuestionForm = () => {
  const { isAuthenticated, user, role } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionName: "",
      questionDescription: "",
      constraints: [""],
      sampleTestCases: [{ input: "", output: "", explanation: "" }],
      actualTestCases: [{ input: "", output: "", explanation: "" }],
      topics: [""],
      questionDifficulty: "MEDIUM",
      questionSource: "LeetCode",
      questionSolutions: [{ name: "", explanation: "", example: "", code: "" }]
    }
  });

  // Field arrays for dynamic form fields
  const { fields: constraintFields, append: appendConstraint, remove: removeConstraint } = 
    useFieldArray({ control: form.control, name: "constraints" });
  
  const { fields: sampleTestCaseFields, append: appendSampleTestCase, remove: removeSampleTestCase } = 
    useFieldArray({ control: form.control, name: "sampleTestCases" });
  
  const { fields: actualTestCaseFields, append: appendActualTestCase, remove: removeActualTestCase } = 
    useFieldArray({ control: form.control, name: "actualTestCases" });
  
  const { fields: topicFields, append: appendTopic, remove: removeTopic } = 
    useFieldArray({ control: form.control, name: "topics" });
  
  const { fields: solutionFields, append: appendSolution, remove: removeSolution } = 
    useFieldArray({ control: form.control, name: "questionSolutions" });

  // Check if user is admin
  React.useEffect(() => {
    if (isAuthenticated && role !== "ROLE_ADMIN") {
      toast.error("Only administrators can access this page");
      navigate("/dashboard");
    }
  }, [isAuthenticated, role, navigate]);

  const onSubmit = async (data: FormValues) => {
    // Fix field names to match API requirements
    const formattedData = {
      questionName: data.questionName,
      "question### Description ": data.questionDescription,
      constraints: data.constraints,
      sampleTestCases: data.sampleTestCases,
      actualTestCases: data.actualTestCases,
      topics: data.topics,
      questionDifficulty: data.questionDifficulty,
      questionSource: data.questionSource,
      questionSolutions: data.questionSolutions
    };
    
    setIsSubmitting(true);
    try {
      await apiService.addNewQuestion(formattedData);
      toast.success("Question added successfully!");
      form.reset();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Coding Question</h1>
        <p className="text-gray-600">Create a new coding question for the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>Fill in the question details below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Name */}
                <FormField
                  control={form.control}
                  name="questionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter question name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question Difficulty */}
                <FormField
                  control={form.control}
                  name="questionDifficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EASY">Easy</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Question Source */}
              <FormField
                control={form.control}
                name="questionSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LeetCode">LeetCode</SelectItem>
                        <SelectItem value="CodeForces">CodeForces</SelectItem>
                        <SelectItem value="HackerRank">HackerRank</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Description */}
              <FormField
                control={form.control}
                name="questionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter question description" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Constraints */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Constraints</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendConstraint("")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Constraint
                  </Button>
                </div>
                {constraintFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 mb-3">
                    <FormField
                      control={form.control}
                      name={`constraints.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Enter constraint" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {constraintFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConstraint(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Topics */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Topics</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTopic("")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Topic
                  </Button>
                </div>
                {topicFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 mb-3">
                    <FormField
                      control={form.control}
                      name={`topics.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Enter topic" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {topicFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTopic(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Sample Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Sample Test Cases</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendSampleTestCase({ input: "", output: "", explanation: "" })}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
                {sampleTestCaseFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Test Case #{index + 1}</h4>
                      {sampleTestCaseFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSampleTestCase(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`sampleTestCases.${index}.input`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Input</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter test case input" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`sampleTestCases.${index}.output`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Output</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter expected output" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`sampleTestCases.${index}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Explanation (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter explanation" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actual Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Actual Test Cases</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendActualTestCase({ input: "", output: "", explanation: "" })}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
                {actualTestCaseFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Test Case #{index + 1}</h4>
                      {actualTestCaseFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActualTestCase(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`actualTestCases.${index}.input`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Input</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter test case input" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`actualTestCases.${index}.output`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Output</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter expected output" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`actualTestCases.${index}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Explanation (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter explanation" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Solutions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Solutions</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendSolution({ name: "", explanation: "", example: "", code: "" })}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Solution
                  </Button>
                </div>
                {solutionFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Solution #{index + 1}</h4>
                      {solutionFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSolution(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`questionSolutions.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Solution Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter solution name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questionSolutions.${index}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Explanation</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter explanation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questionSolutions.${index}.example`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Example</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter example" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questionSolutions.${index}.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Solution Code</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter solution code" 
                                className="min-h-[150px] font-mono" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Add Question"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default AdminQuestionForm;
