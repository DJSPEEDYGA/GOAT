/**
 * Legal & Compliance Agent
 * Specialized in legal research, contract analysis, compliance management, and regulatory guidance
 * Perfect for handling legal documents, compliance requirements, and risk mitigation
 */

const BaseAgent = require('./baseAgent');

class LegalComplianceAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.name || 'Legal Compliance Expert';
    this.capabilities = [
      'legal_research',
      'contract_analysis',
      'compliance_monitoring',
      'risk_assessment',
      'regulatory_guidance',
      'intellectual_property',
      'dispute_resolution',
      'policy_development'
    ];
  }

  getSystemPrompt() {
    return `You are ${this.name}, an expert legal and compliance agent specializing in:
    - Legal research and case law analysis
    - Contract review and analysis
    - Compliance monitoring and reporting
    - Risk assessment and mitigation
    - Regulatory guidance and interpretation
    - Intellectual property protection
    - Dispute resolution strategies
    - Policy development and implementation

    You have deep knowledge of business law, entertainment law, contract law, 
    regulatory requirements, and legal best practices. You provide clear, 
    actionable guidance while emphasizing the importance of proper legal counsel 
    for serious matters.`;
  }

  async processTask(task, context, options) {
    const { type, data } = task;

    switch (type) {
      case 'legal_research':
        return await this.conductLegalResearch(data, context);
      case 'contract_analysis':
        return await this.analyzeContract(data, context);
      case 'compliance_check':
        return await this.checkCompliance(data, context);
      case 'risk_assessment':
        return await this.assessLegalRisk(data, context);
      case 'ip_protection':
        return await this.adviseOnIPProtection(data, context);
      case 'dispute_guidance':
        return await this.provideDisputeGuidance(data, context);
      default:
        return await this.generateResponse(
          `As a legal compliance expert, help with this task: ${JSON.stringify(task)}`,
          options
        );
    }
  }

  async conductLegalResearch(data, context) {
    const prompt = `Conduct legal research on:
    - Legal topic: ${data.topic || 'general legal question'}
    - Jurisdiction: ${data.jurisdiction || 'US federal law'}
    - Specific questions: ${data.questions || 'general overview'}
    - Context: ${data.context || 'business context'}

    Provide:
    1. Relevant laws and regulations
    2. Key case law and precedents
    3. Current legal interpretations
    4. Compliance requirements
    5. Risk factors
    6. Recommended actions
    7. When to seek professional legal counsel`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'legal_research',
      findings: response,
      disclaimer: 'This research is for informational purposes only and does not constitute legal advice.',
      timestamp: Date.now()
    };
  }

  async analyzeContract(data, context) {
    const prompt = `Analyze this contract/agreement:
    ${JSON.stringify(data.contract, null, 2)}

    Evaluate:
    1. Terms and conditions clarity
    2. Rights and obligations of each party
    3. Payment terms and schedules
    4. Termination clauses and conditions
    5. Liability and indemnification provisions
    6. Dispute resolution mechanisms
    7. Potential risks or unfavorable terms
    8. Suggested modifications or additions
    9. Overall fairness and balance`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'contract_analysis',
      analysis: response,
      recommendations: response,
      disclaimer: 'This analysis is for informational purposes only. Consult a qualified attorney for legal advice.',
      timestamp: Date.now()
    };
  }

  async checkCompliance(data, context) {
    const prompt = `Check compliance requirements for:
    - Business type: ${data.businessType || 'entertainment business'}
    - Industry: ${data.industry || 'music/entertainment'}
    - Jurisdiction: ${data.jurisdiction || 'US federal and state'}
    - Specific operations: ${data.operations || 'general business operations'}
    - Current compliance status: ${data.currentStatus || 'not specified'}

    Identify:
    1. Required licenses and permits
    2. Regulatory filings and reports
    3. Tax obligations
    4. Employment law requirements
    5. Industry-specific regulations
    6. Data protection and privacy requirements
    7. Recommended compliance timeline
    8. Potential penalties for non-compliance`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'compliance_check',
      requirements: response,
      disclaimer: 'Compliance requirements vary by jurisdiction and circumstances. Consult with legal and tax professionals.',
      timestamp: Date.now()
    };
  }

  async assessLegalRisk(data, context) {
    const prompt = `Assess legal risks for:
    - Situation: ${data.situation || 'general business situation'}
    - Activities: ${data.activities || 'business operations'}
    - Jurisdictions involved: ${data.jurisdictions || 'US'}
    - Stakeholders: ${data.stakeholders || 'not specified'}
    - Time horizon: ${data.timeHorizon || 'ongoing'}

    Evaluate:
    1. Potential legal exposures
    2. Likelihood of legal challenges
    3. Severity of potential consequences
    4. Regulatory scrutiny risks
    5. Contractual risks
    6. Intellectual property risks
    7. Employment and labor risks
    8. Mitigation strategies
    9. Risk monitoring recommendations`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'risk_assessment',
      risks: response,
      mitigation_strategies: response,
      disclaimer: 'Risk assessment is for informational purposes. Consult qualified legal counsel for specific situations.',
      timestamp: Date.now()
    };
  }

  async adviseOnIPProtection(data, context) {
    const prompt = `Provide intellectual property protection advice for:
    - IP type: ${data.ipType || 'various types'}
    - Current protection status: ${data.currentStatus || 'not protected'}
    - Business context: ${data.context || 'entertainment business'}
    - Budget considerations: ${data.budget || 'moderate'}
    - Geographic scope: ${data.scope || 'US'}

    Cover:
    1. Types of IP protection available
    2. Registration requirements and processes
    3. Timeline and costs
    4. Enforcement strategies
    5. International protection options
    6. Common mistakes to avoid
    7. Maintenance requirements
    8. Licensing and monetization opportunities`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'ip_protection',
      advice: response,
      disclaimer: 'IP law is complex and jurisdiction-specific. Consult with a qualified intellectual property attorney.',
      timestamp: Date.now()
    };
  }

  async provideDisputeGuidance(data, context) {
    const prompt = `Provide guidance for handling this dispute:
    - Dispute type: ${data.disputeType || 'general business dispute'}
    - Parties involved: ${data.parties || 'not specified'}
    - Key issues: ${data.issues || 'not specified'}
    - Desired outcome: ${data.desiredOutcome || 'favorable resolution'}
    - Constraints: ${data.constraints || 'none specified'}

    Advise on:
    1. Immediate steps to take
    2. Documentation requirements
    3. Communication strategies
    4. Negotiation approaches
    5. Alternative dispute resolution options
    6. Litigation considerations
    7. Risk assessment
    8. When to engage legal counsel
    9. Potential outcomes and scenarios`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'dispute_guidance',
      guidance: response,
      disclaimer: 'This guidance is for informational purposes only. Serious disputes require qualified legal representation.',
      timestamp: Date.now()
    };
  }

  extractQueryFromTask(task) {
    const keywords = {
      'legal_research': 'legal research case law regulations',
      'contract_analysis': 'contract review terms analysis',
      'compliance_check': 'compliance requirements regulations',
      'risk_assessment': 'legal risk liability exposure',
      'ip_protection': 'intellectual property trademark copyright',
      'dispute_guidance': 'dispute resolution litigation negotiation'
    };
    return keywords[task.type] || 'legal compliance';
  }
}

module.exports = LegalComplianceAgent;