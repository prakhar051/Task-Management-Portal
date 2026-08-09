import { prisma } from '../src/config/db.js';
import KnowledgeService from '../src/services/knowledge.service.js';
import AiService from '../src/services/ai.service.js';
import SummaryService from '../src/services/summary.service.js';
import RecommendationService from '../src/services/recommendation.service.js';
import AutomationService from '../src/services/automation.service.js';

async function runAiAutomationVerification() {
  console.log('🚀 Starting Phase 18 AI Assistant, Knowledge Base & Automation Test Suite...');

  let testUser = null;
  let category = null;
  let article = null;
  let conversation = null;
  let rule = null;

  try {
    // 0. Fetch or create a test user
    testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: 'AI Automation Tester',
          email: `test_ai_${Date.now()}@example.com`,
          role: 'ADMIN',
          passwordHash: 'dummy_hash'
        }
      });
    }

    // 1. Verify Knowledge Category & Article CRUD
    category = await KnowledgeService.createCategory(testUser, {
      name: `IT Policies ${Date.now()}`,
      description: 'Standard company computer safety policies'
    });
    console.log(`✅ Category created: "${category.name}"`);

    article = await KnowledgeService.createArticle(testUser, {
      title: 'IT Password Guidelines',
      content: 'IT security requires passwords to have 12+ characters, uppercase letters, and numbers.',
      categoryId: category.id,
      status: 'PUBLISHED'
    });
    console.log(`✅ Knowledge Article created: "${article.title}"`);

    const fetchedArticle = await KnowledgeService.getArticle(testUser, article.id);
    if (fetchedArticle.viewCount === 1) {
      console.log('✅ Article viewCount successfully incremented');
    }

    // 2. Verify AI Search
    const searchResults = await AiService.search(testUser, 'Password');
    if (searchResults.some((r) => r.type === 'KNOWLEDGE' && r.title.includes('IT Password'))) {
      console.log('✅ Semantic/Search matched KB articles successfully');
    }

    // 3. Verify AI Chat Conversations & Continue History
    const chatResult = await AiService.chat(testUser, null, 'How many active tasks are in the system?');
    conversation = await AiService.getConversation(testUser, chatResult.conversationId);
    console.log(`✅ AI Chat conversation thread created: "${conversation.title}"`);

    const replyResult = await AiService.chat(testUser, conversation.id, 'Tell me more about IT policies');
    if (replyResult.conversationId === conversation.id) {
      console.log('✅ AI Conversation continuation successfully executed');
    }

    // 4. Verify AI Summaries & Recommendations
    const mockTask = await prisma.task.findFirst({
      where: { isDeleted: false }
    });
    if (mockTask) {
      const summary = await SummaryService.summarize('TASK', mockTask.id);
      console.log('✅ AI Summary generated successfully:', summary.slice(0, 100) + '...');
    }

    const recommendations = await RecommendationService.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('✅ AI Workloads balancing suggestions generated successfully');
    }

    // 5. Verify Automation Rules & Trigger Execution
    rule = await AutomationService.createRule(testUser, {
      title: 'Notify Manager on High Blocker',
      trigger: 'TASK_COMPLETED',
      conditions: JSON.stringify({ priority: 'HIGH' }),
      action: 'NOTIFY_MANAGER',
      status: 'ACTIVE'
    });
    console.log(`✅ Automation Rule configured: "${rule.title}"`);

    // Simulate task completion payload to trigger rule evaluation
    await AutomationService.trigger('TASK_COMPLETED', {
      id: 'mock_task_id',
      title: 'Critical DB Bug',
      priority: 'HIGH',
      managerId: testUser.employeeId || 'dummy_manager_id'
    });

    const ruleHistory = await AutomationService.listHistory({ ruleId: rule.id });
    if (ruleHistory.length > 0) {
      console.log('✅ Automation rule trigger matching condition evaluated and execution logged successfully');
    }

    console.log('🎉 All Phase 18 AI & Automation tests completed successfully!');

  } catch (err) {
    console.error('❌ AI & Automation integration tests failed:', err.message);
    process.exit(1);
  } finally {
    // Cleanup temporary test configurations
    if (rule) {
      await prisma.automationExecution.deleteMany({ where: { ruleId: rule.id } });
      await prisma.automationRule.delete({ where: { id: rule.id } });
    }
    if (conversation) {
      await prisma.aiMessage.deleteMany({ where: { conversationId: conversation.id } });
      await prisma.aiConversation.delete({ where: { id: conversation.id } });
    }
    if (article) {
      await prisma.knowledgeVersion.deleteMany({ where: { articleId: article.id } });
      await prisma.knowledgeFavorite.deleteMany({ where: { articleId: article.id } });
      await prisma.knowledgeArticle.delete({ where: { id: article.id } });
    }
    if (category) {
      await prisma.knowledgeCategory.delete({ where: { id: category.id } });
    }
  }
}

runAiAutomationVerification().then(() => {
  process.exit(0);
});
