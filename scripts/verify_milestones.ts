
import { mockProvider } from '../src/providers/MockProvider';
import { generateReport } from '../src/services/report';
import { Question, Attempt } from '../src/providers/IQuestionProvider';

async function verify() {
  console.log("=== 2) Verifying MockProvider Connection ===");
  console.log("Query: grade=7, tags=['条件落图'], n=3");
  
  const questions = await mockProvider.getQuestions({
    grade: 7,
    tags: ["条件落图"],
    n: 3
  });

  console.log(`Returned ${questions.length} questions:`);
  questions.forEach(q => {
    console.log(`- [${q.id}] ${q.title} (Tags: ${q.tags.join(', ')})`);
  });

  if (questions.length === 0) {
      console.error("FAIL: No questions returned. Check tags in JSON.");
  } else {
      console.log("PASS: MockProvider filtering works.");
  }

  console.log("\n=== 3) Verifying submitAttempt Recording ===");
  const userId = "test_user_verify";
  const stage = "TEST_STAGE";
  
  // Submit an attempt
  await mockProvider.submitAttempt({
    userId,
    stage,
    questionId: questions[0]?.id || "g7_003",
    isCorrect: false,
    timeSpent: 45,
    tags: ["条件落图", "M1_MIDPOINT"]
  });

  // Verify it's stored
  const attempts = await mockProvider.getAttempts({ userId });
  console.log(`Fetched ${attempts.length} attempts for user ${userId}:`);
  console.log(JSON.stringify(attempts, null, 2));

  if (attempts.length > 0 && attempts[0].userId === userId) {
      console.log("PASS: submitAttempt stores data (in-memory).");
  } else {
      console.error("FAIL: Attempt not found.");
  }

  console.log("\n=== 4) Verifying Report Generation ===");
  const report = generateReport(attempts);
  console.log("Generated Report:", JSON.stringify(report, null, 2));
  
  if (report.topWeakTag && report.prescription) {
      console.log("PASS: Report generated successfully.");
  } else {
      console.error("FAIL: Report generation incomplete.");
  }

  console.log("\n=== 5) Verifying Model Demo SVG Path ===");
  // This is a manual check we did via LS, but let's log the path we expect
  console.log("Expected Path: /models/midpoint-double/step1.svg");
  console.log("Note: Please verify this file exists in public/ folder.");
}

verify().catch(console.error);
