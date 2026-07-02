/**
 * Creative Content Agent
 * Specialized in content creation, brand management, and marketing strategy
 * Perfect for managing social media, marketing campaigns, and brand development
 */

const BaseAgent = require('./baseAgent');

class CreativeContentAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.name || 'Creative Content Expert';
    this.capabilities = [
      'content_creation',
      'brand_strategy',
      'social_media_management',
      'campaign_planning',
      'copywriting',
      'visual_concepts',
      'audience_engagement',
      'trend_adaptation'
    ];
  }

  getSystemPrompt() {
    return `You are ${this.name}, an expert creative content agent specializing in:
    - Content creation and strategy
    - Brand development and management
    - Social media management and growth
    - Marketing campaign planning and execution
    - Copywriting and messaging
    - Visual concepts and creative direction
    - Audience engagement and community building
    - Trend adaptation and viral content creation

    You have deep knowledge of content marketing, social media platforms, brand strategy,
    and what makes content engaging and shareable. You provide creative, actionable
    guidance for building strong brand presence and audience connection.`;
  }

  async processTask(task, context, options) {
    const { type, data } = task;

    switch (type) {
      case 'create_content':
        return await this.createContent(data, context);
      case 'brand_strategy':
        return await this.developBrandStrategy(data, context);
      case 'social_media_plan':
        return await this.createSocialMediaPlan(data, context);
      case 'campaign_plan':
        return await this.planCampaign(data, context);
      case 'copywriting':
        return await this.writeCopy(data, context);
      case 'engagement_strategy':
        return await this.developEngagementStrategy(data, context);
      default:
        return await this.generateResponse(
          `As a creative content expert, help with this task: ${JSON.stringify(task)}`,
          options
        );
    }
  }

  async createContent(data, context) {
    const prompt = `Create engaging content for:
    - Platform: ${data.platform || 'general social media'}
    - Content type: ${data.contentType || 'post'}
    - Topic/Theme: ${data.topic || 'general business update'}
    - Target audience: ${data.audience || 'general audience'}
    - Brand voice: ${data.brandVoice || 'professional yet approachable'}
    - Goals: ${data.goals || 'engagement and brand awareness'}

    Provide:
    1. Multiple content options with variations
    2. Attention-grabbing hooks
    3. Engaging body copy
    4. Call-to-action suggestions
    5. Hashtag recommendations
    6. Visual content ideas
    7. Posting time recommendations
    8. Engagement prompts`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'content_creation',
      content: response,
      timestamp: Date.now()
    };
  }

  async developBrandStrategy(data, context) {
    const prompt = `Develop comprehensive brand strategy for:
    - Brand name: ${data.brandName || 'your brand'}
    - Industry: ${data.industry || 'entertainment/music'}
    - Current positioning: ${data.currentPosition || 'emerging'}
    - Target audience: ${data.targetAudience || 'fans and industry peers'}
    - Brand values: ${data.values || 'authenticity, excellence, innovation'}
    - Competitive landscape: ${data.competitors || 'established players'}

    Include:
    1. Brand positioning statement
    2. Brand personality and voice
    3. Visual identity guidelines
    4. Brand story and messaging
    5. Differentiation strategy
    6. Brand touchpoints
    7. Consistency guidelines
    8. Evolution and growth strategy`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'brand_strategy',
      strategy: response,
      timestamp: Date.now()
    };
  }

  async createSocialMediaPlan(data, context) {
    const prompt = `Create social media strategy for:
    - Platforms: ${data.platforms || 'Instagram, Twitter, TikTok'}
    - Current following: ${data.currentFollowing || 'growing'}
    - Content focus: ${data.contentFocus || 'behind-the-scenes, updates'}
    - Posting frequency: ${data.frequency || 'daily'}
    - Goals: ${data.goals || 'growth, engagement, brand building'}
    - Resources: ${data.resources || 'small team'}

    Provide:
    1. Platform-specific strategies
    2. Content calendar framework
    3. Content themes and series
    4. Engagement tactics
    5. Growth strategies
    6. Collaboration opportunities
    7. Analytics and KPIs
    8. Resource optimization tips`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'social_media_plan',
      strategy: response,
      timestamp: Date.now()
    };
  }

  async planCampaign(data, context) {
    const prompt = `Plan marketing campaign for:
    - Campaign objective: ${data.objective || 'brand awareness'}
    - Product/Service: ${data.product || 'general offering'}
    - Target audience: ${data.audience || 'fans and potential customers'}
    - Budget: ${data.budget || 'moderate'}
    - Timeline: ${data.timeline || '4-6 weeks'}
    - Channels: ${data.channels || 'social media, email, digital'}

    Include:
    1. Campaign concept and theme
    2. Key messages and hooks
    3. Channel-specific tactics
    4. Content creation plan
    5. Launch strategy
    6. Engagement and amplification
    7. Measurement and optimization
    8. Risk mitigation`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'campaign_plan',
      campaign: response,
      timestamp: Date.now()
    };
  }

  async writeCopy(data, context) {
    const prompt = `Write compelling copy for:
    - Copy type: ${data.copyType || 'marketing copy'}
    - Purpose: ${data.purpose || 'conversion and engagement'}
    - Product/Service: ${data.product || 'general offering'}
    - Target audience: ${data.audience || 'general audience'}
    - Tone: ${data.tone || 'persuasive and authentic'}
    - Key benefits: ${data.benefits || 'quality, value, authenticity'}
    - Call-to-action: ${data.cta || 'learn more/engage'}

    Provide:
    1. Headline options with variations
    2. Body copy with compelling storytelling
    3. Benefit-focused messaging
    4. Multiple CTA options
    5. A/B testing suggestions
    6. Platform adaptations if needed
    7. Length variations (short/long form)`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'copywriting',
      copy: response,
      timestamp: Date.now()
    };
  }

  async developEngagementStrategy(data, context) {
    const prompt = `Develop audience engagement strategy for:
    - Platform/Channel: ${data.platform || 'social media'}
    - Current engagement: ${data.currentEngagement || 'moderate'}
    - Audience size: ${data.audienceSize || 'growing'}
    - Audience demographics: ${data.demographics || 'diverse fan base'}
    - Engagement goals: ${data.goals || 'increase interaction and loyalty'}
    - Content themes: ${data.themes || 'music, lifestyle, behind-the-scenes'}

    Provide:
    1. Engagement tactics and approaches
    2. Content types that drive interaction
    3. Community building strategies
    4. Response and interaction guidelines
    5. User-generated content opportunities
    6. Loyalty and retention tactics
    7. Crisis communication approach
    8. Measurement and optimization`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'engagement_strategy',
      strategy: response,
      timestamp: Date.now()
    };
  }

  extractQueryFromTask(task) {
    const keywords = {
      'create_content': 'content creation social media copy',
      'brand_strategy': 'brand strategy positioning development',
      'social_media_plan': 'social media strategy growth plan',
      'campaign_plan': 'marketing campaign planning tactics',
      'copywriting': 'copywriting messaging content',
      'engagement_strategy': 'audience engagement community building'
    };
    return keywords[task.type] || 'creative content marketing';
  }
}

module.exports = CreativeContentAgent;