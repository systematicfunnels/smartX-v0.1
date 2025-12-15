export async function runMeaningWorker(task: any) {
  console.log("Processing meaning task", task.id);

  // TODO: Replace with LLM later
  return {
    goals: ["Example goal"],
    requirements: ["Example requirement"],
    confidence: 0.5,
  };
}
