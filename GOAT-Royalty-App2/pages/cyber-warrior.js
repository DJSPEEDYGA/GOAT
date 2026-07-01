/**
 * 🛡️ CyberWarrior Agent — GOAT Royalty Cyber Defense System
 * Advanced Cybersecurity AI with Offensive & Defensive Capabilities
 * + Security Sandbox Engine Integration
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useState } from 'react';

const CyberWarriorAgent = dynamic(() => import('../components/CyberWarriorAgent'), { ssr: false });
const SecuritySandboxPanel = dynamic(() => import('../components/SecuritySandboxPanel'), { ssr: false });

export default function CyberWarriorPage() {
  const [activeSection, setActiveSection] = useState('cyberwarrior');

  const sections = [
    {
      id: 'cyberwarrior',
      label: '⚔️ CyberWarrior Agent',
      description: 'AI-powered threat detection, defense grid & offensive ops',
    },
    {
      id: 'sandbox',
      label: '🛡️ Security Sandbox',
      description: 'Process scanner, file analysis, quarantine & sandbox environments',
    },
  ];

  return (
    <>
      <Head>
        <title>CyberWarrior Agent | GOAT Royalty Cyber Defense</title>
        <meta
          name="description"
          content="CyberWarrior Agent — Advanced cybersecurity AI with deadly force authorization. Protects GOAT Royalty with offensive and defensive cyber capabilities including sandbox threat isolation."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Section Switcher */}
      <div className="bg-black border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mr-2">
            Security Section:
          </span>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex flex-col px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeSection === section.id
                  ? 'bg-red-600/20 border-red-500/50 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{section.label}</span>
              <span className="text-xs font-normal text-gray-500 mt-0.5">{section.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Section */}
      {activeSection === 'cyberwarrior' && <CyberWarriorAgent />}

      {activeSection === 'sandbox' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <a href="/" className="hover:text-white transition-colors">🏠 GOAT Home</a>
              <span>›</span>
              <span className="text-gray-400">Security</span>
              <span>›</span>
              <span className="text-white">Security Sandbox Engine</span>
            </div>

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-black tracking-tight mb-1">
                <span className="text-cyan-400">SECURITY</span>
                <span className="text-white"> SANDBOX</span>
                <span className="text-purple-400 ml-2">ENGINE</span>
              </h1>
              <p className="text-gray-400 text-sm">
                Advanced threat isolation, process monitoring, file analysis & quarantine system
                powered by the GOAT Royalty Cyber Defense Platform.
              </p>
            </div>

            {/* Security Sandbox Panel */}
            <SecuritySandboxPanel />

            {/* Info Footer */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: '🔍',
                  title: 'Process Scanner',
                  desc: 'Scans all running processes against known malware patterns, crypto miners, keyloggers, backdoors and trojans.',
                },
                {
                  icon: '📁',
                  title: 'File Analysis',
                  desc: 'Analyzes files using hash calculation (MD5/SHA256), file type detection, and suspicious pattern matching.',
                },
                {
                  icon: '🔒',
                  title: 'Quarantine System',
                  desc: 'Safely isolates suspicious files and processes with detailed logging, preventing accidental execution.',
                },
              ].map((info, i) => (
                <div key={i} className="goat-gradient-card goat-gradient-card goat-card-hover/5 rounded-xl p-4 border border-white/10">
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <div className="font-bold text-sm mb-1">{info.title}</div>
                  <div className="text-xs text-gray-400">{info.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}