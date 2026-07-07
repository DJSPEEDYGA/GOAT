/**
 * 🛡️ AI Red Team Suite Page — GOAT Force CyberWarrior Division
 * LLM Security Testing, AI Guardrails, Vulnerability Scanner
 */

import Head from 'next/head';
import AIRedTeamSuite from '../components/AIRedTeamSuite';

export default function AIRedTeamPage() {
  return (
    <>
      <Head>
        <title>AI Red Team Suite | GOAT Force CyberWarrior</title>
        <meta name="description" content="GOAT Force AI Red Team Suite — LLM security testing, jailbreak defense, OWASP Top 10 compliance, AI guardrails, vulnerability scanning, and penetration testing." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AIRedTeamSuite />
    </>
  );
}