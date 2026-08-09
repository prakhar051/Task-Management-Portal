import { GoogleGenAI } from '@google/genai'; // import standard google-genai package structure
import AiRepository from '../repositories/ai.repository.js';
import { prisma } from '../config/db.js';

class AiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI. Falling back to local semantic parser.', err.message);
      }
    }
  }

  async getAiResponse(prompt, chatHistory = []) {
    // 1. If Gemini API is available, query the LLM model
    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        return response.text || 'I am processing your query...';
      } catch (err) {
        console.warn('Gemini LLM generation failed. Using local semantic parser fallback.', err.message);
      }
    }

    // 2. Local Semantic Parser Fallback (offline and test-suite execution)
    const normalized = prompt.toLowerCase();

    // Check if query is about tasks
    if (normalized.includes('task') || normalized.includes('job')) {
      const count = await prisma.task.count();
      const openTasks = await prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } });
      return `There are currently ${count} registered tasks in the system. ${openTasks} tasks are still active (TODO or IN_PROGRESS). You can drag and drop task cards on the Kanban board to update status, or lock card metadata before making revisions.`;
    }

    // Check if query is about projects
    if (normalized.includes('project') || normalized.includes('board')) {
      const count = await prisma.project.count();
      const active = await prisma.project.findFirst({ select: { name: true } });
      return `We are currently tracking ${count} active projects. The primary project board includes "${active?.name || 'Main Portal Workspace'}". You can assign manager roles and define timeline milestones inside the Project Details view.`;
    }

    // Check if query is about policies or general knowledge
    if (normalized.includes('policy') || normalized.includes('hr') || normalized.includes('leave')) {
      const articles = await prisma.knowledgeArticle.findMany({
        where: { status: 'PUBLISHED', isDeleted: false },
        select: { title: true, content: true },
        take: 2
      });
      if (articles.length > 0) {
        return `I found the following knowledge base records relating to policies:
${articles.map((a) => `- **${a.title}**: ${a.content.slice(0, 120)}...`).join('\n')}
For more information, consult the Knowledge Base module or setup an automation rule to notify managers on leave schedule additions.`;
      }
      return 'The company HR guidelines allow leave scheduling requests from the Calendar and Attendance widgets. Leave requests check overlaps against team meetings before approval is logged.';
    }

    // Check if query is about employees
    if (normalized.includes('employee') || normalized.includes('member') || normalized.includes('staff')) {
      const count = await prisma.employee.count({ where: { isDeleted: false } });
      return `Our employee directory lists ${count} active team members. You can review staff designations, payroll payslips records, and verify checking logs inside the Employee Directory.`;
    }

    // Generic fallback response
    return "I am the TaskPortal Assistant. I can help you search knowledge base articles, summarize active projects or task blocker chains, look up employee directories, or configure workflow automations. Ask me about tasks, projects, or company policy guidelines!";
  }

  async chat(user, conversationId, messageContent) {
    let convId = conversationId;
    
    // Create new conversation if not specified
    if (!convId) {
      const title = messageContent.slice(0, 40) || 'New Conversation';
      const conv = await AiRepository.createConversation(user.id, title);
      convId = conv.id;
    }

    // Fetch conversation and history
    const conversation = await AiRepository.getConversationById(convId);
    if (!conversation) throw new Error('Conversation thread not found.');

    const history = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    // Save user prompt
    await AiRepository.appendMessage(convId, 'USER', messageContent);

    // Generate response
    const assistantResponse = await this.getAiResponse(messageContent, history);

    // Save assistant response
    const responseMessage = await AiRepository.appendMessage(convId, 'ASSISTANT', assistantResponse);

    return {
      conversationId: convId,
      message: responseMessage
    };
  }

  async listConversations(user) {
    return AiRepository.listConversations(user.id);
  }

  async deleteConversation(user, id) {
    return AiRepository.deleteConversation(id);
  }

  async getConversation(user, id) {
    return AiRepository.getConversationById(id);
  }

  // AI Semantic Search across multiple entity models
  async search(user, query) {
    const term = query.toLowerCase();
    
    const [tasks, projects, articles, employees] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 3
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 3
      }),
      prisma.knowledgeArticle.findMany({
        where: {
          status: 'PUBLISHED',
          isDeleted: false,
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { content: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 3
      }),
      prisma.employee.findMany({
        where: {
          isDeleted: false,
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { designation: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 3
      })
    ]);

    const results = [];
    
    tasks.forEach((t) => results.push({ type: 'TASK', id: t.id, title: t.title, description: t.description || '' }));
    projects.forEach((p) => results.push({ type: 'PROJECT', id: p.id, title: p.name, description: p.description || '' }));
    articles.forEach((a) => results.push({ type: 'KNOWLEDGE', id: a.id, title: a.title, description: a.content.slice(0, 100) }));
    employees.forEach((e) => results.push({ type: 'EMPLOYEE', id: e.id, title: `${e.firstName} ${e.lastName}`, description: e.designation }));

    return results;
  }
}

export default new AiService();
