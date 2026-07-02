/**
 * 💰 UpStaxx Tax Engine v3.0 — GOAT Royalty MEGA Integration
 * AI-Powered Tax Strategy Platform for Music Industry Professionals
 * 12 Tabs • 32 Strategies • 22 Credits • Wealth Projector • Mr. Green AI
 * SWOT Analysis • Infinite Banking Concept (R. Nelson Nash)
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calculator, PieChart,
  FileText, Receipt, Car, Home, Building2, Briefcase, CreditCard,
  BarChart3, Shield, Lock, Brain, Bot, Sparkles, Crown,
  ChevronRight, Check, X, AlertTriangle, ArrowUpRight,
  Search, Filter, RefreshCw, Download, Send, Copy, ExternalLink,
  Music, Globe, Calendar, Clock, Zap, Target, Eye,
  Wallet, Landmark, BadgeDollarSign, PiggyBank, BookOpen,
  MapPin, Route, ChevronDown, Plus, Minus,
  FileCheck, Upload, Bell, AlertCircle, Info,
  Layers, Activity, Award, Heart, Users, Package
} from 'lucide-react';

const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
  }[c] || c)).substring(0, 500);
};

const MUSIC_TAX_STRATEGIES = [
  { id:1, category:'Business Structure', name:'S-Corp Election for Publishing Income', savings:9200, risk:'low', description:'Elect S-Corp status to split income between salary and distributions, reducing SE tax by up to 15.3%.', status:'active', difficulty:'Medium', irs_ref:'IRC §1361-1379', priority:1, details:'Pay yourself ~$60K salary, take remaining as distributions avoiding 15.3% SE tax.', action_items:['File Form 2553 by March 15','Set reasonable salary ($50K-$70K)','Run payroll quarterly','File Form 1120-S annually'] },
  { id:2, category:'Home Office', name:'Home Studio Deduction', savings:4800, risk:'low', description:'Deduct home recording studio — equipment depreciation, utilities, rent/mortgage portion.', status:'active', difficulty:'Easy', irs_ref:'IRC §280A', priority:2, details:'300 sq ft studio in 2,000 sq ft home = 15% of housing costs deductible.', action_items:['Measure studio square footage','Calculate percentage of home','Track utility bills monthly','Take photos for documentation'] },
  { id:3, category:'Equipment', name:'Section 179 Equipment Deduction', savings:12500, risk:'low', description:'Immediately deduct full cost of music production equipment up to $1,220,000 (2025).', status:'active', difficulty:'Easy', irs_ref:'IRC §179', priority:1, details:'Includes mixing boards, microphones, monitors, DAW software, computers, cameras, lighting.', action_items:['Keep all equipment receipts','List equipment with purchase dates','Photograph all equipment','Track business use percentage'] },
  { id:4, category:'Royalty Income', name:'Qualified Business Income (QBI) Deduction', savings:7300, risk:'low', description:'Take 20% deduction on qualified business income from music royalties and publishing.', status:'active', difficulty:'Medium', irs_ref:'IRC §199A', priority:1, details:'On $150K of qualified income = $30K deduction, saving ~$7,300 at 24% bracket.', action_items:['Separate QBI from non-QBI income','File Form 8995 or 8995-A','Track all qualified business income'] },
  { id:5, category:'Retirement', name:'Solo 401(k) Contribution', savings:15600, risk:'low', description:'Contribute up to $69,000/year (2025) as both employer and employee.', status:'active', difficulty:'Medium', irs_ref:'IRC §401(k)', priority:1, details:'$23,500 employee + up to 25% of net SE income as employer. At 32% bracket, $50K saves ~$15,600.', action_items:['Open Solo 401(k) account','Calculate max contribution','Make contributions before Dec 31','File Form 5500-EZ if balance exceeds $250K'] },
  { id:6, category:'Travel', name:'Music Industry Travel Deduction', savings:6200, risk:'low', description:'Deduct travel for concerts, studio sessions, industry events, label meetings.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:2, details:'Flights, hotels, meals (50%), car rentals fully deductible for business travel.', action_items:['Log every business trip','Save all receipts','Note business purpose','Separate personal vs business'] },
  { id:7, category:'Vehicle', name:'Business Vehicle / Mileage Deduction', savings:5400, risk:'low', description:'Deduct business mileage at $0.70/mile (2025) for studio trips, venues, meetings.', status:'active', difficulty:'Easy', irs_ref:'IRC §162, §274', priority:2, details:'7,700 business miles × $0.70 = $5,390 deduction.', action_items:['Use Milestack to auto-track','Log start/end odometer','Note business purpose per trip','Choose standard vs actual method'] },
  { id:8, category:'Marketing', name:'Promotional & Marketing Expense Deduction', savings:3800, risk:'low', description:'Deduct social media ads, music videos, PR campaigns, website hosting, merch samples.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:2, details:'Spotify promotion, Instagram/TikTok ads, music video production, PR firms all deductible.', action_items:['Track all ad spend by platform','Keep invoices from PR firms','Document music video costs','Save social media ad receipts'] },
  { id:9, category:'Health', name:'Self-Employed Health Insurance Deduction', savings:4200, risk:'low', description:'Deduct 100% of health insurance premiums for yourself and family.', status:'active', difficulty:'Easy', irs_ref:'IRC §162(l)', priority:1, details:'Family plan at $1,400/month = $16,800 deduction, saving ~$4,200 at 25% effective rate.', action_items:['Gather all insurance premium statements','Include dental and vision','Deduct on Schedule 1, Line 17'] },
  { id:10, category:'Intellectual Property', name:'Copyright Amortization', savings:2800, risk:'medium', description:'Amortize cost of acquiring music copyrights and masters over 15 years.', status:'available', difficulty:'Advanced', irs_ref:'IRC §197', priority:3, details:'Purchased catalogs amortized over 15 years under Section 197.', action_items:['Document acquisition costs','Calculate 15-year schedule','File Form 4562'] },
  { id:11, category:'Education', name:'Music Education & Training Deduction', savings:1500, risk:'low', description:'Deduct production courses, industry conferences, workshops.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:3, details:'Continuing education for current profession is deductible.', action_items:['Save course receipts','Document business relation','Include travel to conferences'] },
  { id:12, category:'Hiring', name:'Hire Family Members Strategy', savings:8400, risk:'medium', description:'Employ family members to shift income to lower tax brackets.', status:'available', difficulty:'Medium', irs_ref:'IRC §162, §3121(b)(3)', priority:2, details:'Children under 18: pay up to $14,600/year (standard deduction) — they pay $0 taxes.', action_items:['Document job descriptions','Pay reasonable wages','Keep time sheets','Issue W-2 forms'] },
  { id:13, category:'Credits', name:'Earned Income Tax Credit (EITC)', savings:3200, risk:'low', description:'Claim EITC if AGI qualifies — often overlooked by self-employed.', status:'available', difficulty:'Easy', irs_ref:'IRC §32', priority:2, details:'Up to $7,830 (2025) for qualifying taxpayers.', action_items:['Check income eligibility','File Schedule EIC','Ensure accurate SE income reporting'] },
  { id:14, category:'Depreciation', name:'Bonus Depreciation (100% First Year)', savings:8900, risk:'low', description:'100% bonus depreciation on new and used equipment in first year.', status:'active', difficulty:'Medium', irs_ref:'IRC §168(k)', priority:1, details:'Stacks with Section 179 for maximum equipment write-offs.', action_items:['Identify qualifying assets','Document placed-in-service dates','File Form 4562','Consider timing of purchases'] },
  { id:15, category:'Retirement', name:'SEP-IRA Contribution', savings:11200, risk:'low', description:'Contribute up to 25% of net SE income (max $69,000) to SEP-IRA.', status:'available', difficulty:'Easy', irs_ref:'IRC §408(k)', priority:2, details:'Simpler than Solo 401(k), can be funded up to filing deadline.', action_items:['Open SEP-IRA account','Calculate 25% of net SE income','Fund before filing deadline'] },
  { id:16, category:'Business Structure', name:'LLC + S-Corp Combo', savings:6800, risk:'medium', description:'LLC for liability protection + S-Corp election for tax savings.', status:'available', difficulty:'Advanced', irs_ref:'IRC §301.7701-3', priority:2, details:'Ideal for music professionals earning $80K+ wanting both protections.', action_items:['Form LLC in Georgia','File Form 2553','Maintain corporate formalities','Keep separate business bank account'] },
  { id:17, category:'Royalty Income', name:'Mechanical Royalty Optimization', savings:3400, risk:'low', description:'Optimize how mechanical vs performance royalties are reported and taxed.', status:'active', difficulty:'Medium', irs_ref:'IRC §61, §162', priority:2, details:'Proper categorization ensures maximum deductions against each income stream.', action_items:['Separate mechanical vs performance royalty income','Track by distributor','Match expenses to income categories'] },
  { id:18, category:'Insurance', name:'Business Insurance Deduction', savings:1800, risk:'low', description:'Deduct general liability, equipment insurance, E&O, cyber liability premiums.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:3, details:'All business insurance premiums are deductible.', action_items:['Review all business insurance policies','Ensure adequate coverage','Deduct on Schedule C, Line 15'] },
  { id:19, category:'Technology', name:'Software & Subscription Deductions', savings:2400, risk:'low', description:'Deduct DAWs, plugins, streaming tools, accounting software, cloud storage, AI tools.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:3, details:'Pro Tools, Splice, Adobe CC, QuickBooks, cloud storage all deductible.', action_items:['List all software subscriptions','Calculate annual costs','Separate personal vs business use'] },
  { id:20, category:'Meals', name:'Business Meals Deduction (50%)', savings:1600, risk:'low', description:'Deduct 50% of business meals with clients, collaborators, industry contacts.', status:'active', difficulty:'Easy', irs_ref:'IRC §274(k)', priority:3, details:'Document who, what, where, and business purpose for each meal.', action_items:['Save all meal receipts','Note attendees and purpose','Use dedicated business card'] },
  { id:21, category:'Charitable', name:'Charitable Donation of Music Rights', savings:5200, risk:'medium', description:'Donate music rights to qualified charities for fair market value deduction.', status:'available', difficulty:'Advanced', irs_ref:'IRC §170', priority:3, details:'Requires qualified appraisal for donations over $5,000.', action_items:['Identify qualifying charities','Get qualified appraisal','File Form 8283'] },
  { id:22, category:'State Tax', name:'Georgia Film/Music Tax Credit', savings:4500, risk:'low', description:'20% base + 10% bonus for GA logo on qualified production expenditures.', status:'available', difficulty:'Medium', irs_ref:'GA Code §48-7-40.26', priority:2, details:'Music production, music videos, and related content may qualify.', action_items:['Register with Georgia Film Office','Track GA production expenses','Apply for certification','Include GA logo for extra 10%'] },
  { id:23, category:'State Tax', name:'Georgia Angel Investor Tax Credit', savings:3500, risk:'medium', description:'Up to 35% tax credit for investing in qualified Georgia businesses.', status:'available', difficulty:'Advanced', irs_ref:'GA Code §48-7-40.30', priority:3, details:'Invest in music tech startups or entertainment companies in GA.', action_items:['Identify qualifying GA businesses','Invest minimum $25,000','Apply through GA Dept of Revenue'] },
  { id:24, category:'Vehicle', name:'Heavy Vehicle (SUV/Truck) Deduction', savings:14200, risk:'low', description:'Vehicles over 6,000 lbs GVWR: deduct up to $28,900 in year one.', status:'available', difficulty:'Medium', irs_ref:'IRC §179, §168(k)', priority:2, details:'Escalade, Suburban, Expedition, Yukon all qualify.', action_items:['Verify vehicle GVWR exceeds 6,000 lbs','Document business use >50%','Keep mileage log','File Form 4562'] },
  { id:25, category:'Hiring', name:'Independent Contractor Payments', savings:4100, risk:'low', description:'Deduct payments to session musicians, engineers, producers, designers.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:2, details:'Issue 1099-NEC for payments over $600.', action_items:['Collect W-9 from all contractors','Issue 1099-NEC by January 31','Keep contracts and invoices'] },
  { id:26, category:'Real Estate', name:'Studio Space Lease Deduction', savings:7200, risk:'low', description:'Deduct rent for external studio space, rehearsal rooms, office space.', status:'available', difficulty:'Easy', irs_ref:'IRC §162', priority:2, details:'Full rent is deductible for business-use space.', action_items:['Keep lease agreements','Save all rent receipts','Document business use'] },
  { id:27, category:'Retirement', name:'Health Savings Account (HSA)', savings:2700, risk:'low', description:'Triple tax benefits: deductible contributions, tax-free growth, tax-free medical withdrawals.', status:'available', difficulty:'Easy', irs_ref:'IRC §223', priority:2, details:'$4,300 individual / $8,550 family contribution limit for 2025.', action_items:['Verify you have an HDHP','Open HSA account','Maximize annual contributions'] },
  { id:28, category:'Intellectual Property', name:'Music Catalog Valuation & Estate Planning', savings:15000, risk:'medium', description:'Properly value 3,650+ track catalog for estate planning.', status:'available', difficulty:'Advanced', irs_ref:'IRC §2031, §2512', priority:3, details:'Proper valuation and trusts can reduce estate taxes significantly.', action_items:['Get professional catalog appraisal','Establish revocable living trust','Consider gifting strategies'] },
  { id:29, category:'Technology', name:'AI & Automation Tool Deductions', savings:1900, risk:'low', description:'Deduct AI tools and automation software used for music business.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:3, details:'ChatGPT, Midjourney, LANDR, Amper, AIVA, Zapier all deductible.', action_items:['List all AI/automation subscriptions','Document business use','Track monthly costs'] },
  { id:30, category:'Legal', name:'Legal & Professional Fees Deduction', savings:3600, risk:'low', description:'Deduct attorney fees, CPA fees, and other professional services.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:2, details:'Entertainment attorney, CPA, trademark/copyright filing fees all deductible.', action_items:['Keep all invoices from professionals','Document business purpose','Include trademark fees'] },
  { id:31, category:'Networking', name:'Industry Membership & Dues Deduction', savings:800, risk:'low', description:'Deduct ASCAP, BMI, SESAC, RIAA, Grammy Recording Academy memberships.', status:'active', difficulty:'Easy', irs_ref:'IRC §162', priority:3, details:'Professional organization dues and union memberships are deductible.', action_items:['List all professional memberships','Save membership receipts','Include union dues'] },
  { id:32, category:'Estimated Taxes', name:'Quarterly Estimated Tax Optimization', savings:2100, risk:'low', description:'Optimize quarterly payments to avoid penalties while maximizing cash flow.', status:'active', difficulty:'Medium', irs_ref:'IRC §6654', priority:2, details:'Use annualized income installment method to match payments to actual income timing.', action_items:['Calculate quarterly estimates using Form 1040-ES','Use annualized method if income varies','Pay by deadlines','Avoid underpayment penalties'] }
];

const TAX_CREDITS = [
  { id:1, name:'Earned Income Tax Credit (EITC)', category:'Federal', amount:'Up to $7,830', status:'eligible', type:'refundable', irs_ref:'IRC §32', description:'For low-to-moderate income workers.' },
  { id:2, name:'Child Tax Credit', category:'Federal', amount:'Up to $2,000/child', status:'eligible', type:'partially refundable', irs_ref:'IRC §24', description:'Per qualifying child under 17.' },
  { id:3, name:'Child & Dependent Care Credit', category:'Federal', amount:'Up to $2,100', status:'check', type:'non-refundable', irs_ref:'IRC §21', description:'For childcare expenses while working.' },
  { id:4, name:'Saver\'s Credit (Retirement)', category:'Federal', amount:'Up to $1,000', status:'eligible', type:'non-refundable', irs_ref:'IRC §25B', description:'For retirement contributions. Only 6% of eligible claim this.' },
  { id:5, name:'American Opportunity Tax Credit', category:'Federal - Education', amount:'Up to $2,500', status:'check', type:'partially refundable', irs_ref:'IRC §25A', description:'First 4 years of higher education.' },
  { id:6, name:'Lifetime Learning Credit', category:'Federal - Education', amount:'Up to $2,000', status:'eligible', type:'non-refundable', irs_ref:'IRC §25A', description:'Any post-secondary education or job skill courses.' },
  { id:7, name:'Premium Tax Credit (ACA)', category:'Federal - Health', amount:'Varies', status:'check', type:'refundable', irs_ref:'IRC §36B', description:'Health insurance through Marketplace.' },
  { id:8, name:'Small Business Health Care Credit', category:'Federal - Business', amount:'Up to 50% premiums', status:'check', type:'non-refundable', irs_ref:'IRC §45R', description:'For small employers paying employee health insurance.' },
  { id:9, name:'Work Opportunity Tax Credit', category:'Federal - Hiring', amount:'Up to $9,600/employee', status:'available', type:'non-refundable', irs_ref:'IRC §51', description:'For hiring from targeted groups.' },
  { id:10, name:'Disabled Access Credit', category:'Federal - Business', amount:'Up to $5,000', status:'check', type:'non-refundable', irs_ref:'IRC §44', description:'For accessibility improvements.' },
  { id:11, name:'R&D Credit', category:'Federal - Innovation', amount:'Up to $500K', status:'available', type:'non-refundable', irs_ref:'IRC §41', description:'For developing new music technology or production methods.' },
  { id:12, name:'Energy Efficient Home Credit', category:'Federal - Energy', amount:'Up to $3,200', status:'eligible', type:'non-refundable', irs_ref:'IRC §25C', description:'For energy-efficient home/studio improvements.' },
  { id:13, name:'Residential Clean Energy Credit', category:'Federal - Energy', amount:'30% of cost', status:'eligible', type:'non-refundable', irs_ref:'IRC §25D', description:'Solar panels, wind turbines, battery storage.' },
  { id:14, name:'Electric Vehicle Credit', category:'Federal - Vehicle', amount:'Up to $7,500', status:'available', type:'non-refundable', irs_ref:'IRC §30D', description:'For new qualifying electric vehicles.' },
  { id:15, name:'Georgia Low-Income Tax Credit', category:'Georgia State', amount:'Varies', status:'check', type:'non-refundable', irs_ref:'GA §48-7-29.15', description:'Georgia state credit for low-income taxpayers.' },
  { id:16, name:'Georgia Film/Music Production Credit', category:'Georgia State', amount:'20-30% of expenses', status:'available', type:'transferable', irs_ref:'GA §48-7-40.26', description:'Famous GA entertainment credit. Transferable.' },
  { id:17, name:'Georgia Employer Veteran Credit', category:'Georgia State', amount:'Up to $2,500', status:'available', type:'non-refundable', irs_ref:'GA §48-7-40.24', description:'For hiring military veterans in Georgia.' },
  { id:18, name:'Georgia Conservation Tax Credit', category:'Georgia State', amount:'Up to $250K', status:'check', type:'transferable', irs_ref:'GA §48-7-29.12', description:'For donating conservation easements.' },
  { id:19, name:'Georgia Education Expense Credit', category:'Georgia State', amount:'Up to $2,500', status:'eligible', type:'non-refundable', irs_ref:'GA §48-7-29.16', description:'For contributions to student scholarship organizations.' },
  { id:20, name:'Adoption Credit', category:'Federal', amount:'Up to $16,810', status:'check', type:'non-refundable', irs_ref:'IRC §23', description:'For qualified adoption expenses.' },
  { id:21, name:'Foreign Tax Credit', category:'Federal - International', amount:'Varies', status:'eligible', type:'non-refundable', irs_ref:'IRC §901', description:'For taxes paid on international royalty income.' },
  { id:22, name:'General Business Credit', category:'Federal - Business', amount:'Varies', status:'check', type:'non-refundable', irs_ref:'IRC §38', description:'Umbrella credit combining multiple business credits.' }
];

const TAX_DEADLINES = [
  { date:'2025-01-15', title:'Q4 2024 Estimated Tax Due', type:'payment', status:'completed', form:'1040-ES' },
  { date:'2025-01-31', title:'1099-NEC Filing Deadline', type:'filing', status:'completed', form:'1099-NEC' },
  { date:'2025-03-15', title:'S-Corp Tax Return Due', type:'filing', status:'completed', form:'1120-S' },
  { date:'2025-04-15', title:'Individual Tax Return Due', type:'filing', status:'upcoming', form:'1040' },
  { date:'2025-04-15', title:'Q1 2025 Estimated Tax Due', type:'payment', status:'upcoming', form:'1040-ES' },
  { date:'2025-06-16', title:'Q2 2025 Estimated Tax Due', type:'payment', status:'upcoming', form:'1040-ES' },
  { date:'2025-09-15', title:'Q3 2025 Estimated Tax Due', type:'payment', status:'upcoming', form:'1040-ES' },
  { date:'2025-10-15', title:'Extended Individual Return Due', type:'filing', status:'upcoming', form:'1040' },
  { date:'2025-12-31', title:'Solo 401(k) Contribution Deadline', type:'contribution', status:'upcoming', form:'N/A' },
  { date:'2026-01-15', title:'Q4 2025 Estimated Tax Due', type:'payment', status:'upcoming', form:'1040-ES' }
];

const DOCUMENT_CHECKLIST = [
  { id:1, category:'Income', name:'1099-MISC/NEC from distributors', required:true, collected:true },
  { id:2, category:'Income', name:'Royalty statements (ASCAP/BMI/SESAC)', required:true, collected:true },
  { id:3, category:'Income', name:'Streaming platform reports', required:true, collected:false },
  { id:4, category:'Income', name:'Live performance income records', required:true, collected:true },
  { id:5, category:'Expenses', name:'Equipment purchase receipts', required:true, collected:true },
  { id:6, category:'Expenses', name:'Software subscription records', required:true, collected:false },
  { id:7, category:'Expenses', name:'Travel receipts', required:true, collected:false },
  { id:8, category:'Expenses', name:'Marketing receipts', required:true, collected:true },
  { id:9, category:'Expenses', name:'Contractor payment records', required:true, collected:false },
  { id:10, category:'Deductions', name:'Home office measurements & utility bills', required:true, collected:true },
  { id:11, category:'Deductions', name:'Mileage log', required:true, collected:false },
  { id:12, category:'Deductions', name:'Health insurance statements', required:true, collected:true },
  { id:13, category:'Deductions', name:'Retirement contribution statements', required:true, collected:false },
  { id:14, category:'Entity', name:'EIN confirmation letter', required:true, collected:true },
  { id:15, category:'Entity', name:'S-Corp election confirmation', required:true, collected:true },
  { id:16, category:'Entity', name:'Prior year tax return', required:true, collected:true },
  { id:17, category:'Entity', name:'Bank statements (all business accounts)', required:true, collected:false }
];

const EXPENSE_CATEGORIES = [
  { name:'Studio Equipment', icon:'🎛️', ytd:8450, budget:15000, color:'text-purple-400', transactions:12 },
  { name:'Software & Subscriptions', icon:'💻', ytd:2890, budget:4000, color:'text-blue-400', transactions:34 },
  { name:'Travel & Transportation', icon:'✈️', ytd:4200, budget:8000, color:'text-cyan-400', transactions:18 },
  { name:'Marketing & Promotion', icon:'📢', ytd:3100, budget:5000, color:'text-pink-400', transactions:22 },
  { name:'Contractor Payments', icon:'👥', ytd:6800, budget:12000, color:'text-orange-400', transactions:8 },
  { name:'Meals & Entertainment', icon:'🍽️', ytd:1450, budget:3000, color:'text-yellow-400', transactions:28 },
  { name:'Office & Supplies', icon:'📦', ytd:890, budget:2000, color:'text-green-400', transactions:15 },
  { name:'Insurance', icon:'🛡️', ytd:3600, budget:4800, color:'text-red-400', transactions:4 },
  { name:'Professional Fees', icon:'⚖️', ytd:2200, budget:5000, color:'text-indigo-400', transactions:6 },
  { name:'Vehicle / Mileage', icon:'🚗', ytd:3780, budget:6000, color:'text-emerald-400', transactions:45 }
];

// ═══════════════════════════════════════════════════════════════
// SWOT ANALYSIS — FASTASSMAN Publishing Tax Position
// Based on SWOT Framework: Strengths, Weaknesses, Opportunities, Threats
// ═══════════════════════════════════════════════════════════════
const SWOT_DATA = {
  strengths: [
    { title: 'Massive Catalog (3,650+ Tracks)', detail: 'Generates diversified royalty income across streaming, sync, mechanical, and performance royalties — reducing single-source risk.', impact: 'high', category: 'Asset' },
    { title: 'S-Corp Structure Active', detail: 'FASTASSMAN Publishing Inc already elected S-Corp status, saving $9,200+/yr in self-employment tax on distributions.', impact: 'high', category: 'Structure' },
    { title: 'Georgia-Based Operations', detail: 'Access to Georgia Film/Music Tax Credit (20-30%), one of the most generous entertainment credits in the nation.', impact: 'high', category: 'Location' },
    { title: 'Multiple Revenue Streams', detail: 'Income from streaming, publishing, sync licensing, live performance, production services, and merchandise — 6+ streams.', impact: 'high', category: 'Revenue' },
    { title: 'AI-Powered Tax Strategy (UpStaxx)', detail: '350+ strategies scanned automatically with Mr. Green AI advisor — finding deductions others miss.', impact: 'medium', category: 'Technology' },
    { title: 'Home Studio Deduction Active', detail: 'Dedicated home recording studio qualifies for IRC §280A deduction — 15% of housing costs.', impact: 'medium', category: 'Deduction' },
    { title: 'Section 179 Equipment Deductions', detail: 'Full immediate deduction on music production equipment up to $1.22M (2025).', impact: 'high', category: 'Deduction' },
    { title: 'Intellectual Property Ownership', detail: 'Full copyright ownership of catalog creates long-term appreciating asset with estate planning value.', impact: 'high', category: 'Asset' }
  ],
  weaknesses: [
    { title: 'Missing Documents (7 of 17)', detail: 'Streaming reports, software records, travel receipts, contractor records, mileage log, retirement statements, and bank statements not yet collected.', impact: 'high', category: 'Filing', action: 'Collect all 7 missing documents before April 15' },
    { title: 'No Retirement Plan Funded', detail: 'Solo 401(k) and SEP-IRA strategies identified but not yet activated — leaving $15,600-$26,800/yr in savings unclaimed.', impact: 'high', category: 'Retirement', action: 'Open and fund Solo 401(k) before Dec 31' },
    { title: '12 Strategies Still Unclaimed', detail: '$84,700/yr in available but not-yet-activated strategies including family hiring, HSA, studio lease, and estate planning.', impact: 'high', category: 'Strategy', action: 'Activate top 5 available strategies this quarter' },
    { title: 'No Mileage Tracking System', detail: 'Business mileage not being systematically tracked — estimated $5,400/yr deduction at risk.', impact: 'medium', category: 'Tracking', action: 'Activate Milestack for automatic mileage tracking' },
    { title: 'No Formal Bookkeeping System', detail: 'P&L and quarterly estimates not automated — risk of underpayment penalties and missed deductions.', impact: 'medium', category: 'Operations', action: 'Activate Bookstack for automated bookkeeping' },
    { title: 'Single-Entity Structure', detail: 'All income flowing through one S-Corp — no asset protection separation between publishing, production, and performance income.', impact: 'medium', category: 'Structure', action: 'Consider LLC + S-Corp combo for liability separation' }
  ],
  opportunities: [
    { title: 'Infinite Banking Concept', detail: 'Use dividend-paying whole life insurance as a personal banking system — recapture interest paid to others, build tax-free wealth, and create legacy asset.', impact: 'high', category: 'Wealth Building', source: 'R. Nelson Nash — Becoming Your Own Banker' },
    { title: 'Georgia Film/Music Credit (20-30%)', detail: 'Music videos, production content, and related expenditures may qualify for Georgia\'s famous entertainment tax credit — transferable.', impact: 'high', category: 'State Credit', source: 'GA §48-7-40.26' },
    { title: 'Catalog Valuation & Estate Planning', detail: '3,650+ track catalog is a significant appreciating asset — proper valuation and trust structure could save $15,000+/yr in estate taxes.', impact: 'high', category: 'Estate', source: 'IRC §2031, §2512' },
    { title: 'AI Music Monetization Growth', detail: 'AI-driven music discovery and sync licensing platforms are expanding revenue opportunities for catalog owners.', impact: 'medium', category: 'Revenue', source: 'Industry Trend 2025' },
    { title: 'International Royalty Optimization', detail: 'Foreign tax credits on international streaming royalties (Spotify, Apple Music global) — currently underutilized.', impact: 'medium', category: 'International', source: 'IRC §901' },
    { title: 'Hire Family Members ($8,400/yr)', detail: 'Children under 18 can earn up to $14,600 tax-free (2025 standard deduction) for legitimate business tasks.', impact: 'medium', category: 'Hiring', source: 'IRC §3121(b)(3)' },
    { title: 'Heavy Vehicle Deduction ($14,200)', detail: 'Vehicles over 6,000 lbs GVWR qualify for up to $28,900 first-year deduction — Escalade, Suburban, Yukon.', impact: 'high', category: 'Vehicle', source: 'IRC §179, §168(k)' },
    { title: 'R&D Credit for Music Technology', detail: 'Developing new production methods, AI tools, or music technology may qualify for up to $500K in R&D credits.', impact: 'medium', category: 'Innovation', source: 'IRC §41' }
  ],
  threats: [
    { title: 'IRS Audit Risk (Schedule C)', detail: 'Self-employed music professionals face higher audit rates — especially with home office and vehicle deductions.', impact: 'high', category: 'Compliance', mitigation: 'Maintain meticulous records, use UpStaxx document checklist' },
    { title: 'Streaming Revenue Volatility', detail: 'Per-stream rates declining across platforms — Spotify paid $0.003-$0.005/stream in 2024, down from prior years.', impact: 'medium', category: 'Revenue', mitigation: 'Diversify into sync licensing, live performance, and production' },
    { title: 'Tax Law Changes (2025-2026)', detail: 'TCJA provisions expiring — QBI deduction, bonus depreciation phase-down, potential rate increases.', impact: 'high', category: 'Legislative', mitigation: 'Maximize current deductions before expiration, monitor legislation' },
    { title: 'AI Copyright Challenges', detail: 'AI-generated music creating legal uncertainty around copyright protection and royalty claims.', impact: 'medium', category: 'Legal', mitigation: 'Register all works with Copyright Office, document human authorship' },
    { title: 'Underpayment Penalties', detail: 'Without proper quarterly estimated payments, IRS penalties of 8% (2025) apply on underpaid amounts.', impact: 'medium', category: 'Compliance', mitigation: 'Use quarterly estimate calculator, pay on time' },
    { title: 'State Tax Complexity', detail: 'Multi-state royalty income may trigger filing requirements in states where music is performed or streamed.', impact: 'low', category: 'Compliance', mitigation: 'Monitor state nexus rules, file where required' }
  ]
};

// ═══════════════════════════════════════════════════════════════
// INFINITE BANKING CONCEPT — R. Nelson Nash Principles
// From "Becoming Your Own Banker" — Applied to Music Industry
// ═══════════════════════════════════════════════════════════════
const INFINITE_BANKING = {
  principles: [
    { id: 1, name: 'You Finance Everything You Buy', detail: 'You either pay interest to someone else or give up interest you could have earned. The alternate use of money (opportunity cost) must always be reckoned with.', icon: '💡', source: 'Part II — Creating the Entity' },
    { id: 2, name: 'The Golden Rule of Banking', detail: 'Those who have the Gold make the rules. Capital is a responsibility and should be treated with great respect. When you have cash on hand, good opportunities appear.', icon: '👑', source: 'Part III — The Golden Rule' },
    { id: 3, name: 'Be Your Own Banker', detail: 'Create your own banking system through dividend-paying whole life insurance. Recapture the interest you pay to others and redirect it to an entity you own and control.', icon: '🏦', source: 'Part II — Creating Your Own Banking System' },
    { id: 4, name: 'The Grocery Store Concept', detail: 'Like a well-stocked grocery store, your banking system must be fully capitalized to serve you. Volume of business is the key — the more you run through your system, the more efficient it becomes.', icon: '🏪', source: 'Part I — The Grocery Store' },
    { id: 5, name: 'Capitalize for at Least 7 Years', detail: 'Build your system with patience. Pay premiums for at least 7 years before expecting to use it heavily. This creates the pool of cash values needed for policy loans.', icon: '⏳', source: 'Part V — Capitalizing Your System' },
    { id: 6, name: 'Use Paid-Up Additions (PUA)', detail: 'Add a Paid-Up Additions Rider to minimize death benefit emphasis and maximize cash value accumulation — the banking qualities of the policy.', icon: '📈', source: 'Part II — Dividend-Paying Life Insurance' },
    { id: 7, name: 'Policy Loans — Not Withdrawals', detail: 'Borrow against your cash value via policy loans. Your money continues to earn dividends and compound even while you use it. This is the magic of uninterrupted compounding.', icon: '🔄', source: 'Part II — Policy Loans' },
    { id: 8, name: 'Pay Yourself Back with Interest', detail: 'When you take a policy loan, repay it with interest — to yourself. This discipline builds your banking system stronger with each cycle.', icon: '💪', source: 'Part IV — Equipment Financing' },
    { id: 9, name: 'Tax-Free Wealth Accumulation', detail: 'Cash values grow tax-deferred. Policy loans are not taxable events. Death benefits pass income-tax-free. This triple tax advantage is unmatched.', icon: '🛡️', source: 'Part II — Tax Advantages' },
    { id: 10, name: 'It Must Become a Way of Life', detail: 'Like EVA (Economic Value Added), the Infinite Banking Concept must become a way of life. You must use it or lose it. It is not a product — it is a process.', icon: '🌟', source: 'Part V — Use It or Lose It' }
  ],
  musicApplications: [
    { scenario: 'Equipment Financing', description: 'Instead of financing studio equipment through banks, use policy loans. Buy your $50K mixing console with a policy loan, then pay yourself back with interest — recapturing $8,000+ in interest.', savings: 8000, traditional: 'Bank loan at 8-12% APR', ibc: 'Policy loan at 5-6%, interest goes back to YOU' },
    { scenario: 'Vehicle Purchase', description: 'Finance your business vehicle through your banking system. On a $60K vehicle, recapture $12,000+ in interest over 5 years that would have gone to a bank.', savings: 12000, traditional: 'Auto loan at 6-9% APR', ibc: 'Policy loan, uninterrupted compounding continues' },
    { scenario: 'Studio Build-Out', description: 'Fund studio construction or renovation through policy loans. $100K build-out saves $25,000+ in interest vs commercial loan.', savings: 25000, traditional: 'Commercial loan at 8-10%', ibc: 'Policy loan, cash value keeps growing' },
    { scenario: 'Music Video Production', description: 'Finance music video production ($20K-$50K) through your system instead of credit cards or production loans.', savings: 5000, traditional: 'Credit card at 18-24% APR', ibc: 'Policy loan at 5-6%, tax-free access' },
    { scenario: 'Catalog Acquisition', description: 'Acquire additional music catalogs using policy loans. The catalog generates royalties while your cash value continues compounding.', savings: 15000, traditional: 'Business loan at 8-12%', ibc: 'Policy loan, dual income streams' },
    { scenario: 'Tax Payment Funding', description: 'Use policy loans to fund quarterly estimated tax payments, then repay from royalty income — smoothing cash flow.', savings: 3000, traditional: 'IRS payment plan at 8% penalty', ibc: 'Policy loan, no penalties, interest to yourself' }
  ],
  projections: {
    annualPremium: 24000,
    years: [
      { year: 1, premium: 24000, cashValue: 18000, deathBenefit: 500000, loanAvailable: 0 },
      { year: 3, premium: 72000, cashValue: 62000, deathBenefit: 520000, loanAvailable: 45000 },
      { year: 5, premium: 120000, cashValue: 115000, deathBenefit: 550000, loanAvailable: 95000 },
      { year: 7, premium: 168000, cashValue: 178000, deathBenefit: 590000, loanAvailable: 155000 },
      { year: 10, premium: 240000, cashValue: 285000, deathBenefit: 650000, loanAvailable: 260000 },
      { year: 15, premium: 360000, cashValue: 520000, deathBenefit: 780000, loanAvailable: 480000 },
      { year: 20, premium: 480000, cashValue: 850000, deathBenefit: 1000000, loanAvailable: 800000 },
      { year: 30, premium: 720000, cashValue: 1800000, deathBenefit: 1500000, loanAvailable: 1700000 }
    ]
  }
};

const mrGreenResponses = (input, context = {}) => {
  const lower = input.toLowerCase();
  const { income = 150000 } = context;
  const activeStrats = MUSIC_TAX_STRATEGIES.filter(s => s.status === 'active');
  const totalSav = activeStrats.reduce((sum, s) => sum + s.savings, 0);
  const allSav = MUSIC_TAX_STRATEGIES.reduce((sum, s) => sum + s.savings, 0);

  if (lower.includes('royalt') || lower.includes('streaming') || lower.includes('publishing')) {
    return '💰 **Mr. Green — Royalty Income Strategy**\n\n1. **QBI Deduction (§199A):** 20% deduction on publishing royalties = ~$7,300 savings\n2. **S-Corp Election:** Split salary/distributions, save $9,200+/yr on SE tax\n3. **Mechanical vs Performance:** Proper categorization maximizes deductions\n4. **Copyright Amortization:** Amortize acquired catalogs over 15 years\n5. **Foreign Tax Credit:** Claim credits on international streaming royalties\n\n**Combined Savings: $16,500+/year** 🎯';
  }
  if (lower.includes('deduct') || lower.includes('expense') || lower.includes('write off')) {
    return '📋 **Mr. Green — Music Business Deductions**\n\n🎵 Studio Equipment — Section 179 up to $1.22M\n🏠 Home Studio — 15% of housing costs (~$4,800/yr)\n✈️ Travel — Flights, hotels, meals (~$6,200/yr)\n🚗 Mileage — $0.70/mile (~$5,400/yr)\n📱 Marketing — Ads, videos, PR (~$3,800/yr)\n💻 Software — DAWs, plugins, AI tools (~$2,400/yr)\n👥 Contractors — Musicians, engineers (~$4,100/yr)\n🏥 Health Insurance — 100% deductible (~$4,200/yr)\n⚖️ Legal/Professional — Attorney, CPA (~$3,600/yr)\n\n**Total Deductions: $40,000+** 🎯';
  }
  if (lower.includes('save') || lower.includes('how much') || lower.includes('total')) {
    return '🧮 **Mr. Green — Total Tax Savings**\n\n| Strategy | Savings |\n|----------|--------|\n| Solo 401(k) | $15,600 |\n| Heavy Vehicle | $14,200 |\n| Section 179 | $12,500 |\n| S-Corp Election | $9,200 |\n| Bonus Depreciation | $8,900 |\n| Hire Family | $8,400 |\n| Studio Lease | $7,200 |\n| QBI Deduction | $7,300 |\n| Travel | $6,200 |\n| + 23 more strategies... |\n| **TOTAL** | **$' + allSav.toLocaleString() + '** |\n\n📈 **20-Year Wealth Impact:** ~$' + Math.round(allSav * 45.76 / 1000).toLocaleString() + 'K+ at 8% return\n\n🔗 *Powered by UpStaxx — 350+ strategies*';
  }
  if (lower.includes('s-corp') || lower.includes('s corp') || lower.includes('business structure')) {
    return '🏢 **Mr. Green — S-Corp Strategy**\n\n**How it works:**\n1. FASTASSMAN Publishing elects S-Corp (Form 2553)\n2. Pay yourself ~$60K salary\n3. Take remaining as distributions\n4. Distributions skip 15.3% SE tax\n\n**The Math:**\n• Without: $150K × 15.3% = $22,950\n• With: $60K × 15.3% = $9,180\n• **Savings: $13,770/year**\n\n📅 Deadline: Form 2553 by March 15';
  }
  if (lower.includes('georgia') || lower.includes('state')) {
    return '🍑 **Mr. Green — Georgia Tax Strategies**\n\n1. **Film/Music Credit:** 20% + 10% GA logo bonus\n2. **Angel Investor Credit:** 35% for GA business investments\n3. **Education Credit:** Up to $2,500\n4. **State Rate:** 5.49% flat (2025)\n5. **No Estate Tax:** Catalog passes tax-free at state level\n\n**GA-Specific Savings: $10,500+/year** 🍑';
  }
  if (lower.includes('wealth') || lower.includes('invest') || lower.includes('compound') || lower.includes('retire')) {
    const fv20 = Math.round(allSav * ((Math.pow(1.08, 20) - 1) / 0.08));
    return '📈 **Mr. Green — Wealth Projection**\n\nInvesting $' + allSav.toLocaleString() + '/yr tax savings at 8%:\n\n| Period | Total Value |\n|--------|------------|\n| 5 Years | $' + Math.round(allSav * ((Math.pow(1.08, 5) - 1) / 0.08)).toLocaleString() + ' |\n| 10 Years | $' + Math.round(allSav * ((Math.pow(1.08, 10) - 1) / 0.08)).toLocaleString() + ' |\n| 20 Years | $' + fv20.toLocaleString() + ' |\n\n🏆 **$' + fv20.toLocaleString() + ' in 20 years** from tax savings alone!';
  }
  if (lower.includes('quarterly') || lower.includes('estimated')) {
    const qp = Math.round(income * 0.182 / 4);
    return '📅 **Mr. Green — Quarterly Estimates**\n\n| Quarter | Due Date | Payment |\n|---------|----------|--------|\n| Q1 | Apr 15 | $' + qp.toLocaleString() + ' |\n| Q2 | Jun 16 | $' + qp.toLocaleString() + ' |\n| Q3 | Sep 15 | $' + qp.toLocaleString() + ' |\n| Q4 | Jan 15 | $' + qp.toLocaleString() + ' |\n\n**Annual (optimized): $' + (qp * 4).toLocaleString() + '** (18.2% effective rate)\n**Without UpStaxx: $' + Math.round(income * 0.32).toLocaleString() + '** (32%)';
  }
  if (lower.includes('mileage') || lower.includes('vehicle') || lower.includes('car')) {
    return '🚗 **Mr. Green — Vehicle Strategy**\n\n**2025 Rate: $0.70/mile**\n\nDeductible drives: studio, venues, meetings, equipment pickups\n\n**Standard:** 7,700 miles × $0.70 = $5,390\n**Heavy Vehicle (6,000+ lbs):** Up to $28,900 year one\n\n💡 Use Milestack for automatic tracking';
  }
  if (lower.includes('infinite banking') || lower.includes('ibc') || lower.includes('own banker') || lower.includes('whole life') || lower.includes('nelson nash')) {
    return '🏦 **Mr. Green — Infinite Banking Concept**\n\nBased on R. Nelson Nash\'s principles:\n\n1. **You finance everything** — pay interest to others or recapture it yourself\n2. **Be Your Own Banker** — use dividend-paying whole life as your banking system\n3. **Policy Loans** — borrow against cash value, money keeps compounding\n4. **Pay Yourself Back** — interest goes to YOUR system, not a bank\n5. **Tax-Free Growth** — cash values grow tax-deferred, loans are tax-free\n\n**Music Industry Application:**\n• Finance equipment via policy loans → save $8K+\n• Vehicle purchase → recapture $12K+ in interest\n• Studio build-out → save $25K+ vs commercial loan\n\n💡 *"Those who have the Gold make the rules" — The Golden Rule of Banking*';
  }
  if (lower.includes('swot') || lower.includes('strength') || lower.includes('weakness') || lower.includes('threat') || lower.includes('opportunit')) {
    return '📊 **Mr. Green — SWOT Analysis**\n\n**STRENGTHS:** 3,650+ track catalog, S-Corp active, GA location, 6+ revenue streams, UpStaxx AI\n\n**WEAKNESSES:** 7 missing documents, no retirement funded, 12 unclaimed strategies ($84,700/yr), no mileage tracking\n\n**OPPORTUNITIES:** Infinite Banking, GA Film Credit (20-30%), catalog estate planning ($15K+), heavy vehicle deduction ($14,200)\n\n**THREATS:** IRS audit risk, streaming rate decline, TCJA expiration, AI copyright challenges\n\n🎯 **Priority:** Activate retirement plan + collect missing docs + start Infinite Banking system';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return '🤑 **Hey! I\'m Mr. Green — AI Tax Strategist**\n\nI scan 350+ strategies for music professionals.\n\n**Ask me about:**\n• 💰 Royalty income optimization\n• 📋 Business deductions (32 strategies)\n• 🏢 S-Corp analysis\n• 🚗 Vehicle deductions\n• 📈 Wealth projection\n• 🍑 Georgia credits\n• 📅 Quarterly estimates\n• 🏦 Infinite Banking Concept\n• 📊 SWOT Analysis\n\n**Try:** "How much can I save?" or "Tell me about Infinite Banking"';
  }
  return '🤑 **Mr. Green here!**\n\nTop recommendations:\n1. **S-Corp Election** — Save $9,200+/yr\n2. **Solo 401(k)** — Shelter up to $69K/yr\n3. **Section 179** — Deduct equipment immediately\n4. **GA Film Credit** — 20-30% on production\n\nAsk about any strategy or say "how much can I save?" 🔗 *upstaxx.com*';
};

const MiniBar = ({ value, max, color = 'bg-green-500' }) => (
  React.createElement('div', { className: 'w-full bg-white/10 rounded-full h-2' },
    React.createElement('div', { className: color + ' h-2 rounded-full transition-all duration-1000', style: { width: Math.min((value / max) * 100, 100) + '%' } })
  )
);

const UpStaxxTaxEngine = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', content: '🤑 Mr. Green activated! 32 strategies identified, 22 credits scanned, Georgia optimized. Ready to find your savings!' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [income, setIncome] = useState(150000);
  const [projYears, setProjYears] = useState(20);
  const [projRate, setProjRate] = useState(8);
  const [documents, setDocuments] = useState(DOCUMENT_CHECKLIST);
  const [mileageTrips] = useState([
    { id:1, date:'2025-03-01', from:'Home', to:'Studio A (Atlanta)', miles:24, purpose:'Recording session' },
    { id:2, date:'2025-03-03', from:'Home', to:'Music Store', miles:12, purpose:'Equipment pickup' },
    { id:3, date:'2025-03-05', from:'Home', to:'Label Meeting (Midtown)', miles:18, purpose:'Distribution meeting' },
    { id:4, date:'2025-03-07', from:'Home', to:'Venue (The Tabernacle)', miles:22, purpose:'Performance' },
    { id:5, date:'2025-03-10', from:'Home', to:'Video Shoot Location', miles:35, purpose:'Music video production' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || isThinking) return;
    const msg = inputMessage.trim();
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsThinking(true);
    setTimeout(() => {
      const response = mrGreenResponses(msg, { income });
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsThinking(false);
    }, 800 + Math.random() * 1200);
  }, [inputMessage, isThinking, income]);

  const toggleDoc = useCallback((id) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, collected: !d.collected } : d));
  }, []);

  const totalSavings = useMemo(() => MUSIC_TAX_STRATEGIES.filter(s => s.status === 'active').reduce((sum, s) => sum + s.savings, 0), []);
  const availableSavings = useMemo(() => MUSIC_TAX_STRATEGIES.filter(s => s.status === 'available').reduce((sum, s) => sum + s.savings, 0), []);
  const allSavings = totalSavings + availableSavings;
  const categories = useMemo(() => [...new Set(MUSIC_TAX_STRATEGIES.map(s => s.category))], []);
  const filteredStrategies = useMemo(() => MUSIC_TAX_STRATEGIES.filter(s => {
    if (filterCategory !== 'all' && s.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && s.difficulty !== filterDifficulty) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [filterCategory, filterDifficulty, searchQuery]);

  const totalMiles = useMemo(() => mileageTrips.reduce((sum, t) => sum + t.miles, 0), [mileageTrips]);
  const totalExpenses = useMemo(() => EXPENSE_CATEGORIES.reduce((sum, c) => sum + c.ytd, 0), []);
  const docProgress = useMemo(() => {
    const req = documents.filter(d => d.required);
    return Math.round((req.filter(d => d.collected).length / req.length) * 100);
  }, [documents]);

  const wealthProjection = useMemo(() => {
    const rate = projRate / 100;
    const years = [];
    let total = 0;
    for (let y = 1; y <= projYears; y++) {
      total = (total + allSavings) * (1 + rate);
      years.push({ year: y, invested: allSavings * y, total: Math.round(total), growth: Math.round(total - allSavings * y) });
    }
    return years;
  }, [allSavings, projYears, projRate]);

  const tabs = [
    { id:'dashboard', label:'Dashboard', icon: BarChart3 },
    { id:'strategies', label:'Strategies', icon: Target },
    { id:'credits', label:'Credits', icon: BadgeDollarSign },
    { id:'mrgreen', label:'Mr. Green AI', icon: Bot },
    { id:'wealth', label:'Wealth', icon: TrendingUp },
    { id:'expenses', label:'Expenses', icon: Receipt },
    { id:'mileage', label:'Mileage', icon: Car },
    { id:'bookkeeping', label:'Books', icon: BookOpen },
    { id:'calendar', label:'Calendar', icon: Calendar },
    { id:'filing', label:'Filing', icon: FileCheck },
    { id:'swot', label:'SWOT', icon: Layers },
    { id:'banking', label:'∞ Banking', icon: Landmark }
  ];

  const e = React.createElement;

  // ═══ RENDER HELPERS ═══
  const renderKPI = (label, value, sub, IconComp, color, bg) =>
    e('div', { className: bg + ' rounded-2xl p-4 border border-white/10', key: label },
      e(IconComp, { className: 'w-5 h-5 ' + color + ' mb-2' }),
      e('div', { className: 'text-xl font-black ' + color }, value),
      e('div', { className: 'text-xs text-gray-500' }, label),
      e('div', { className: 'text-xs text-gray-400 mt-0.5' }, sub)
    );

  // ═══ DASHBOARD TAB ═══
  const renderDashboard = () => e('div', { className: 'space-y-6' },
    // KPIs
    e('div', { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3' },
      renderKPI('Active Strategies', MUSIC_TAX_STRATEGIES.filter(s => s.status === 'active').length, 'of ' + MUSIC_TAX_STRATEGIES.length + ' identified', Target, 'text-green-400', 'bg-green-500/10'),
      renderKPI('Est. Tax Savings', '$' + totalSavings.toLocaleString(), 'per year', PiggyBank, 'text-emerald-400', 'bg-emerald-500/10'),
      renderKPI('Credits Available', TAX_CREDITS.filter(c => c.status === 'eligible').length, 'of ' + TAX_CREDITS.length + ' scanned', BadgeDollarSign, 'text-yellow-400', 'bg-yellow-500/10'),
      renderKPI('Effective Rate', '18.2%', 'down from 32%', TrendingDown, 'text-cyan-400', 'bg-cyan-500/10'),
      renderKPI('YTD Expenses', '$' + totalExpenses.toLocaleString(), 'tracked', Receipt, 'text-purple-400', 'bg-purple-500/10'),
      renderKPI('Doc Progress', docProgress + '%', 'filing ready', FileCheck, 'text-orange-400', 'bg-orange-500/10')
    ),
    // Top Strategies
    e('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      e('div', { className: 'bg-white/5 rounded-2xl p-5 border border-white/10' },
        e('h3', { className: 'font-bold mb-4 flex items-center gap-2' }, e(Sparkles, { className: 'w-5 h-5 text-green-400' }), 'Top Savings Opportunities'),
        e('div', { className: 'space-y-2' },
          ...MUSIC_TAX_STRATEGIES.sort((a, b) => b.savings - a.savings).slice(0, 7).map(s =>
            e('div', { key: s.id, className: 'flex items-center justify-between py-2 border-b border-white/5 px-2' },
              e('div', { className: 'flex items-center gap-2 min-w-0 flex-1' },
                e('div', { className: 'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + (s.status === 'active' ? 'bg-green-500' : 'bg-yellow-500') }),
                e('div', { className: 'min-w-0' },
                  e('div', { className: 'font-bold text-xs truncate' }, s.name),
                  e('div', { className: 'text-xs text-gray-400' }, s.category + ' • ' + s.irs_ref)
                )
              ),
              e('div', { className: 'text-right flex-shrink-0 ml-2' },
                e('div', { className: 'font-black text-green-400 text-sm' }, '$' + s.savings.toLocaleString())
              )
            )
          )
        )
      ),
      // Expense Breakdown
      e('div', { className: 'bg-white/5 rounded-2xl p-5 border border-white/10' },
        e('h3', { className: 'font-bold mb-4 flex items-center gap-2' }, e(Receipt, { className: 'w-5 h-5 text-purple-400' }), 'YTD Expense Tracking'),
        e('div', { className: 'space-y-3' },
          ...EXPENSE_CATEGORIES.slice(0, 7).map((cat, i) =>
            e('div', { key: i },
              e('div', { className: 'flex items-center justify-between mb-1' },
                e('span', { className: 'text-xs' }, cat.icon + ' ' + cat.name),
                e('span', { className: 'text-xs font-bold ' + cat.color }, '$' + cat.ytd.toLocaleString() + ' / $' + cat.budget.toLocaleString())
              ),
              e(MiniBar, { value: cat.ytd, max: cat.budget, color: cat.ytd > cat.budget * 0.8 ? 'bg-yellow-500' : 'bg-green-500' })
            )
          ),
          e('div', { className: 'pt-2 border-t border-white/10 flex justify-between' },
            e('span', { className: 'text-sm font-bold' }, 'Total YTD'),
            e('span', { className: 'text-sm font-black text-green-400' }, '$' + totalExpenses.toLocaleString())
          )
        )
      )
    ),
    // Tool Grid
    e('div', { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3' },
      ...[
        { name:'Mr. Green AI', desc:'350+ strategies', icon:'🤑', color:'bg-green-500/20 border-green-500/30', tab:'mrgreen' },
        { name:'Uptrack', desc:'Expense tracking', icon:'📊', color:'bg-blue-500/20 border-blue-500/30', tab:'expenses' },
        { name:'Milestack', desc:'$0.70/mi tracking', icon:'🚗', color:'bg-purple-500/20 border-purple-500/30', tab:'mileage' },
        { name:'Bookstack', desc:'Auto bookkeeping', icon:'📚', color:'bg-orange-500/20 border-orange-500/30', tab:'bookkeeping' },
        { name:'Tax Calendar', desc:'Deadlines', icon:'📅', color:'bg-cyan-500/20 border-cyan-500/30', tab:'calendar' },
        { name:'Filing Center', desc:'E-file & docs', icon:'📄', color:'bg-red-500/20 border-red-500/30', tab:'filing' }
      ].map((tool, i) =>
        e('button', { key: i, onClick: () => setActiveTab(tool.tab), className: 'rounded-2xl p-4 border ' + tool.color + ' text-left hover:scale-105 transition-all' },
          e('div', { className: 'text-2xl mb-1' }, tool.icon),
          e('div', { className: 'font-bold text-sm' }, tool.name),
          e('div', { className: 'text-xs text-gray-400 mt-0.5' }, tool.desc)
        )
      )
    ),
    // Upcoming Deadlines
    e('div', { className: 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl p-5 border border-amber-500/20' },
      e('h3', { className: 'font-bold mb-3 flex items-center gap-2' }, e(Bell, { className: 'w-5 h-5 text-amber-400' }), 'Upcoming Deadlines'),
      e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
        ...TAX_DEADLINES.filter(d => d.status === 'upcoming').slice(0, 3).map((dl, i) =>
          e('div', { key: i, className: 'bg-black/20 rounded-xl p-3 border border-white/5' },
            e('div', { className: 'text-xs text-amber-400 font-bold' }, new Date(dl.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })),
            e('div', { className: 'text-sm font-bold mt-1' }, dl.title),
            e('div', { className: 'text-xs text-gray-500' }, dl.form !== 'N/A' ? 'Form ' + dl.form : dl.type)
          )
        )
      )
    ),
    // Powered by
    e('div', { className: 'bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/20 flex items-center justify-between flex-wrap gap-4' },
      e('div', null,
        e('div', { className: 'text-lg font-bold text-green-400' }, 'Powered by UpStaxx'),
        e('div', { className: 'text-sm text-gray-400' }, '350+ strategies • 63+ credits • AI-powered • IRS-backed'),
        e('div', { className: 'text-xs text-gray-500 mt-1' }, 'Bank-grade encryption • Plaid-secured • Licensed professionals • Clerk auth')
      ),
      e('a', { href: 'https://upstaxx.com', target: '_blank', rel: 'noopener noreferrer', className: 'px-6 py-3 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition-all flex items-center gap-2' },
        'Start Free Trial ', e(ExternalLink, { className: 'w-4 h-4' })
      )
    )
  );

  // ═══ STRATEGIES TAB ═══
  const renderStrategies = () => e('div', { className: 'space-y-6' },
    e('div', { className: 'flex items-center justify-between flex-wrap gap-3' },
      e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(Target, { className: 'w-6 h-6 text-green-400' }), 'Tax Strategies — ' + filteredStrategies.length + ' of ' + MUSIC_TAX_STRATEGIES.length),
      e('div', { className: 'text-sm text-gray-400' }, 'Total: ', e('span', { className: 'text-green-400 font-black' }, '$' + allSavings.toLocaleString() + '/yr'))
    ),
    // Filters
    e('div', { className: 'bg-white/5 rounded-xl p-4 border border-white/10 space-y-3' },
      e('div', { className: 'relative' },
        e(Search, { className: 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' }),
        e('input', { type: 'text', value: searchQuery, onChange: (ev) => setSearchQuery(ev.target.value), placeholder: 'Search strategies...', className: 'w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-green-500/50' })
      ),
      e('div', { className: 'flex gap-2 flex-wrap' },
        e('span', { className: 'text-xs text-gray-500' }, 'Category:'),
        e('button', { onClick: () => setFilterCategory('all'), className: 'px-2 py-0.5 rounded-full text-xs font-bold ' + (filterCategory === 'all' ? 'bg-green-600/30 text-green-400' : 'bg-white/5 text-gray-400') }, 'All'),
        ...categories.map(cat =>
          e('button', { key: cat, onClick: () => setFilterCategory(cat), className: 'px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ' + (filterCategory === cat ? 'bg-green-600/30 text-green-400' : 'bg-white/5 text-gray-400') }, cat)
        )
      ),
      e('div', { className: 'flex gap-2 flex-wrap' },
        e('span', { className: 'text-xs text-gray-500' }, 'Difficulty:'),
        ...['all', 'Easy', 'Medium', 'Advanced'].map(d =>
          e('button', { key: d, onClick: () => setFilterDifficulty(d), className: 'px-2 py-0.5 rounded-full text-xs font-bold ' + (filterDifficulty === d ? 'bg-blue-600/30 text-blue-400' : 'bg-white/5 text-gray-400') }, d === 'all' ? 'All' : d)
        )
      )
    ),
    // Strategy Cards
    e('div', { className: 'space-y-3' },
      ...filteredStrategies.sort((a, b) => a.priority - b.priority || b.savings - a.savings).map(s =>
        e('div', { key: s.id, onClick: () => setSelectedStrategy(selectedStrategy?.id === s.id ? null : s), className: 'bg-white/5 rounded-xl p-5 border cursor-pointer transition-all hover:bg-white/10 ' + (selectedStrategy?.id === s.id ? 'border-green-500/50 bg-green-500/5' : 'border-white/10') },
          e('div', { className: 'flex items-center justify-between flex-wrap gap-3' },
            e('div', { className: 'flex items-center gap-3' },
              e('div', { className: 'px-2 py-1 rounded-lg text-xs font-bold ' + (s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400') }, s.status === 'active' ? '✅ Active' : '⚡ Available'),
              e('div', { className: 'px-2 py-1 rounded-lg text-xs font-bold ' + (s.risk === 'low' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400') }, s.risk === 'low' ? '🟢 low' : '🟡 medium'),
              e('div', null,
                e('div', { className: 'font-bold' }, s.name),
                e('div', { className: 'text-xs text-gray-500' }, s.category + ' • ' + s.difficulty + ' • ' + s.irs_ref)
              )
            ),
            e('div', { className: 'text-right' },
              e('div', { className: 'text-xl font-black text-green-400' }, '$' + s.savings.toLocaleString()),
              e('div', { className: 'text-xs text-gray-500' }, 'est. annual savings')
            )
          ),
          e('p', { className: 'text-sm text-gray-400 mt-2' }, s.description),
          selectedStrategy?.id === s.id && e('div', { className: 'mt-4 pt-4 border-t border-white/10 space-y-3' },
            e('p', { className: 'text-sm text-gray-300' }, s.details),
            s.action_items && e('div', null,
              e('div', { className: 'text-xs font-bold text-green-400 mb-2' }, '📋 Action Items:'),
              e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-1' },
                ...s.action_items.map((item, i) =>
                  e('div', { key: i, className: 'flex items-center gap-2 text-xs text-gray-400' }, '• ' + item)
                )
              )
            ),
            e('div', { className: 'flex gap-2 mt-2' },
              e('a', { href: 'https://upstaxx.com', target: '_blank', rel: 'noopener noreferrer', className: 'px-3 py-1 bg-green-600/30 rounded-lg text-xs text-green-400 hover:bg-green-600/50 flex items-center gap-1' }, e(ExternalLink, { className: 'w-3 h-3' }), ' Activate on UpStaxx'),
              e('button', { onClick: (ev) => { ev.stopPropagation(); setActiveTab('mrgreen'); setInputMessage(s.name); }, className: 'px-3 py-1 bg-purple-600/30 rounded-lg text-xs text-purple-400 hover:bg-purple-600/50' }, '🤑 Ask Mr. Green')
            )
          )
        )
      )
    )
  );

  // ═══ CREDITS TAB ═══
  const renderCredits = () => e('div', { className: 'space-y-6' },
    e('div', { className: 'flex items-center justify-between flex-wrap gap-3' },
      e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(BadgeDollarSign, { className: 'w-6 h-6 text-yellow-400' }), 'Tax Credits — ' + TAX_CREDITS.length + ' Scanned'),
      e('div', { className: 'flex gap-2' },
        e('span', { className: 'px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-400 font-bold' }, '✅ ' + TAX_CREDITS.filter(c => c.status === 'eligible').length + ' Eligible'),
        e('span', { className: 'px-3 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-400 font-bold' }, '⚡ ' + TAX_CREDITS.filter(c => c.status === 'available').length + ' Available'),
        e('span', { className: 'px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-400 font-bold' }, '🔍 ' + TAX_CREDITS.filter(c => c.status === 'check').length + ' Check')
      )
    ),
    e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
      ...TAX_CREDITS.map(cr =>
        e('div', { key: cr.id, className: 'bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all' },
          e('div', { className: 'flex items-center justify-between' },
            e('div', { className: 'flex-1 min-w-0' },
              e('div', { className: 'font-bold text-sm' }, cr.name),
              e('div', { className: 'text-xs text-gray-500 mt-1' }, cr.description),
              e('div', { className: 'text-xs text-gray-400 mt-1' }, cr.irs_ref + ' • ' + cr.type)
            ),
            e('div', { className: 'text-right ml-3 flex-shrink-0' },
              e('div', { className: 'font-bold text-green-400' }, cr.amount),
              e('div', { className: 'text-xs mt-1 ' + (cr.status === 'eligible' ? 'text-green-400' : cr.status === 'available' ? 'text-yellow-400' : 'text-blue-400') },
                cr.status === 'eligible' ? '✅ Eligible' : cr.status === 'available' ? '⚡ Available' : '🔍 Check')
            )
          )
        )
      )
    ),
    e('div', { className: 'bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-2xl p-5 border border-yellow-500/20 text-center' },
      e('div', { className: 'text-sm text-yellow-400' }, 'The average American misses $1,200+ in tax credits every year'),
      e('div', { className: 'text-xs text-gray-500 mt-1' }, 'Source: U.S. Treasury / Prosperity Now, 2025')
    )
  );

  // ═══ MR. GREEN AI TAB ═══
  const renderMrGreen = () => e('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
    e('div', { className: 'lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 flex flex-col', style: { height: '650px' } },
      e('div', { className: 'p-4 border-b border-white/10 flex items-center gap-3' },
        e('div', { className: 'w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-lg' }, '🤑'),
        e('div', null, e('span', { className: 'font-bold' }, 'Mr. Green'), e('span', { className: 'text-xs text-gray-500 ml-2' }, 'AI Tax Strategist • UpStaxx')),
        e('div', { className: 'ml-auto flex items-center gap-1 text-xs text-green-400' }, e('div', { className: 'w-2 h-2 rounded-full bg-green-500 animate-pulse' }), 'Online')
      ),
      e('div', { className: 'flex-1 overflow-y-auto p-4 space-y-4' },
        ...chatMessages.map((msg, i) =>
          e('div', { key: i, className: 'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start') },
            e('div', { className: 'max-w-[85%] rounded-2xl px-4 py-3 ' + (msg.role === 'user' ? 'bg-green-600/30 border border-green-500/30' : msg.role === 'system' ? 'bg-emerald-600/20 border border-emerald-500/30' : 'bg-white/10 border border-white/10') },
              e('div', { className: 'text-xs text-gray-500 mb-1' }, msg.role === 'user' ? '👑 You' : '🤑 Mr. Green'),
              e('div', { className: 'text-sm whitespace-pre-wrap' }, msg.content)
            )
          )
        ),
        isThinking && e('div', { className: 'flex justify-start' },
          e('div', { className: 'bg-white/10 rounded-2xl px-4 py-3 border border-white/10' },
            e('div', { className: 'flex items-center gap-2 text-sm text-gray-400' }, e(RefreshCw, { className: 'w-4 h-4 animate-spin' }), 'Analyzing strategies...')
          )
        ),
        e('div', { ref: chatEndRef })
      ),
      e('div', { className: 'p-4 border-t border-white/10' },
        e('div', { className: 'flex gap-1.5 mb-2 overflow-x-auto' },
          ...['How much can I save?', 'What can I deduct?', 'S-Corp strategy', 'Georgia credits', 'Wealth projection', 'Quarterly estimates'].map(q =>
            e('button', { key: q, onClick: () => setInputMessage(q), className: 'px-2 py-1 bg-green-500/10 rounded-lg text-xs text-green-400 hover:bg-green-500/20 whitespace-nowrap' }, q)
          )
        ),
        e('div', { className: 'flex gap-2' },
          e('input', { type: 'text', value: inputMessage, onChange: (ev) => setInputMessage(ev.target.value), onKeyDown: (ev) => ev.key === 'Enter' && sendMessage(), placeholder: 'Ask Mr. Green about tax strategies...', className: 'flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50' }),
          e('button', { onClick: sendMessage, disabled: isThinking, className: 'px-6 py-3 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-600 to-emerald-600 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50' },
            e(Send, { className: 'w-5 h-5' })
          )
        )
      )
    ),
    e('div', { className: 'space-y-4' },
      e('div', { className: 'bg-white/5 rounded-2xl p-5 border border-white/10' },
        e('h3', { className: 'font-bold mb-3' }, '🤑 Profile'),
        e('div', { className: 'space-y-2 text-sm' },
          ...[ ['Entity','FASTASSMAN PUB INC.'], ['Filing','S-Corp / Schedule C'], ['Industry','Music Publishing'], ['State','Georgia'], ['Tracks','3,650+'], ['Strategies', MUSIC_TAX_STRATEGIES.filter(s => s.status === 'active').length + ' active'], ['Savings','$' + allSavings.toLocaleString() + '/yr'] ].map(([l, v], i) =>
            e('div', { key: i, className: 'flex justify-between py-1 border-b border-white/5' },
              e('span', { className: 'text-gray-400' }, l),
              e('span', { className: 'font-bold text-green-400' }, v)
            )
          )
        )
      ),
      e('div', { className: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-5 border border-green-500/20 text-center' },
        e('div', { className: 'text-4xl mb-2' }, '🤑'),
        e('div', { className: 'font-bold text-green-400' }, 'Mr. Green'),
        e('div', { className: 'text-xs text-gray-400 mt-1' }, 'The smartest financial brain on the internet.'),
        e('a', { href: 'https://upstaxx.com', target: '_blank', rel: 'noopener noreferrer', className: 'mt-3 inline-block px-4 py-2 bg-green-600 rounded-xl text-sm font-bold hover:bg-green-500 transition-all' }, 'Full Platform →')
      )
    )
  );

  // ═══ WEALTH PROJECTOR TAB ═══
  const renderWealth = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(TrendingUp, { className: 'w-6 h-6 text-cyan-400' }), 'Wealth Projector — Compound Growth'),
    e('div', { className: 'bg-white/5 rounded-2xl p-6 border border-white/10' },
      e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
        e('div', null,
          e('label', { className: 'text-sm text-gray-400 mb-2 block' }, 'Annual Tax Savings'),
          e('div', { className: 'text-3xl font-black text-green-400' }, '$' + allSavings.toLocaleString()),
          e('div', { className: 'text-xs text-gray-500 mt-1' }, 'From ' + MUSIC_TAX_STRATEGIES.length + ' strategies')
        ),
        e('div', null,
          e('label', { className: 'text-sm text-gray-400 mb-2 block' }, 'Period: ' + projYears + ' years'),
          e('input', { type: 'range', min: 5, max: 30, value: projYears, onChange: (ev) => setProjYears(parseInt(ev.target.value)), className: 'w-full accent-cyan-500' })
        ),
        e('div', null,
          e('label', { className: 'text-sm text-gray-400 mb-2 block' }, 'Return: ' + projRate + '%'),
          e('input', { type: 'range', min: 4, max: 12, step: 0.5, value: projRate, onChange: (ev) => setProjRate(parseFloat(ev.target.value)), className: 'w-full accent-cyan-500' })
        )
      )
    ),
    e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
      ...[5, 10, 20].filter(y => y <= projYears).map(y => {
        const d = wealthProjection.find(p => p.year === y);
        if (!d) return null;
        return e('div', { key: y, className: 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-5 border border-cyan-500/20 text-center' },
          e('div', { className: 'text-sm text-cyan-400 mb-1' }, y + '-Year'),
          e('div', { className: 'text-3xl font-black text-white' }, '$' + d.total.toLocaleString()),
          e('div', { className: 'text-xs text-gray-400 mt-2' }, 'Invested: $' + d.invested.toLocaleString()),
          e('div', { className: 'text-xs text-green-400' }, 'Growth: +$' + d.growth.toLocaleString())
        );
      })
    ),
    e('div', { className: 'bg-white/5 rounded-2xl p-6 border border-white/10' },
      e('h3', { className: 'font-bold mb-4' }, 'Growth Timeline'),
      e('div', { className: 'space-y-2' },
        ...wealthProjection.filter((_, i) => i % Math.ceil(projYears / 10) === 0 || i === projYears - 1).map(p =>
          e('div', { key: p.year, className: 'flex items-center gap-3' },
            e('div', { className: 'w-16 text-xs text-gray-400 text-right' }, 'Year ' + p.year),
            e('div', { className: 'flex-1 relative h-6' },
              e('div', { className: 'absolute inset-0 bg-white/5 rounded-full' }),
              e('div', { className: 'absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-500 to-cyan-500 rounded-full flex items-center justify-end pr-2', style: { width: Math.min((p.total / wealthProjection[wealthProjection.length - 1].total) * 100, 100) + '%' } },
                e('span', { className: 'text-xs font-bold text-white' }, '$' + (p.total / 1000).toFixed(0) + 'K')
              )
            )
          )
        )
      )
    ),
    e('div', { className: 'bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-900/20 to-cyan-900/20 rounded-2xl p-5 border border-green-500/20 text-center' },
      e('div', { className: 'text-lg font-bold text-green-400' }, '💰 $' + (wealthProjection[wealthProjection.length - 1]?.total || 0).toLocaleString() + ' in ' + projYears + ' years'),
      e('div', { className: 'text-sm text-gray-400 mt-1' }, 'From investing tax savings at ' + projRate + '% annual return')
    )
  );

  // ═══ EXPENSES TAB ═══
  const renderExpenses = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(Receipt, { className: 'w-6 h-6 text-purple-400' }), 'Uptrack — Smart Expense Tracking'),
    e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
      ...EXPENSE_CATEGORIES.map((cat, i) =>
        e('div', { key: i, className: 'bg-white/5 rounded-xl p-4 border border-white/10' },
          e('div', { className: 'flex items-center justify-between mb-3' },
            e('div', { className: 'flex items-center gap-2' },
              e('span', { className: 'text-xl' }, cat.icon),
              e('div', null,
                e('div', { className: 'font-bold text-sm' }, cat.name),
                e('div', { className: 'text-xs text-gray-500' }, cat.transactions + ' transactions')
              )
            ),
            e('div', { className: 'text-right' },
              e('div', { className: 'font-black ' + cat.color }, '$' + cat.ytd.toLocaleString()),
              e('div', { className: 'text-xs text-gray-500' }, 'of $' + cat.budget.toLocaleString())
            )
          ),
          e(MiniBar, { value: cat.ytd, max: cat.budget, color: cat.ytd > cat.budget * 0.9 ? 'bg-red-500' : 'bg-green-500' })
        )
      )
    ),
    e('div', { className: 'bg-white/5 rounded-2xl p-5 border border-white/10 grid grid-cols-3 gap-4 text-center' },
      e('div', null, e('div', { className: 'text-xs text-gray-400' }, 'Total YTD'), e('div', { className: 'text-2xl font-black text-purple-400' }, '$' + totalExpenses.toLocaleString())),
      e('div', null, e('div', { className: 'text-xs text-gray-400' }, 'Total Budget'), e('div', { className: 'text-2xl font-black text-gray-400' }, '$' + EXPENSE_CATEGORIES.reduce((s, c) => s + c.budget, 0).toLocaleString())),
      e('div', null, e('div', { className: 'text-xs text-gray-400' }, 'Remaining'), e('div', { className: 'text-2xl font-black text-green-400' }, '$' + (EXPENSE_CATEGORIES.reduce((s, c) => s + c.budget, 0) - totalExpenses).toLocaleString()))
    )
  );

  // ═══ MILEAGE TAB ═══
  const renderMileage = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(Car, { className: 'w-6 h-6 text-emerald-400' }), 'Milestack — Mileage Tracker'),
    e('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
      ...[
        { label:'Total Miles', value: totalMiles, icon: Route, color:'text-emerald-400', bg:'bg-emerald-500/10' },
        { label:'Deduction', value: '$' + (totalMiles * 0.70).toFixed(2), icon: DollarSign, color:'text-green-400', bg:'bg-green-500/10' },
        { label:'Trips Logged', value: mileageTrips.length, icon: MapPin, color:'text-blue-400', bg:'bg-blue-500/10' },
        { label:'Annual Goal', value: '7,700', icon: Target, color:'text-cyan-400', bg:'bg-cyan-500/10' }
      ].map((k, i) =>
        e('div', { key: i, className: k.bg + ' rounded-2xl p-4 border border-white/10 text-center' },
          e(k.icon, { className: 'w-6 h-6 ' + k.color + ' mx-auto mb-2' }),
          e('div', { className: 'text-2xl font-black ' + k.color }, k.value),
          e('div', { className: 'text-xs text-gray-400' }, k.label)
        )
      )
    ),
    e('div', { className: 'bg-white/5 rounded-2xl p-5 border border-white/10' },
      e('h3', { className: 'font-bold mb-4' }, 'Recent Trips'),
      e('div', { className: 'space-y-2' },
        ...mileageTrips.map(trip =>
          e('div', { key: trip.id, className: 'flex items-center justify-between py-3 border-b border-white/5 px-3' },
            e('div', { className: 'flex items-center gap-3' },
              e('div', { className: 'w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center' }, e(Car, { className: 'w-4 h-4 text-emerald-400' })),
              e('div', null,
                e('div', { className: 'font-bold text-sm' }, trip.from + ' → ' + trip.to),
                e('div', { className: 'text-xs text-gray-500' }, trip.date + ' • ' + trip.purpose)
              )
            ),
            e('div', { className: 'text-right' },
              e('div', { className: 'font-bold text-emerald-400' }, trip.miles + ' mi'),
              e('div', { className: 'text-xs text-green-400' }, '$' + (trip.miles * 0.70).toFixed(2))
            )
          )
        )
      )
    )
  );

  // ═══ BOOKKEEPING TAB ═══
  const renderBookkeeping = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(BookOpen, { className: 'w-6 h-6 text-orange-400' }), 'Bookstack — P&L Statement YTD 2025'),
    e('div', { className: 'bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3' },
      e('div', { className: 'bg-green-500/10 rounded-xl p-4 border border-green-500/20' },
        e('div', { className: 'text-sm text-green-400 font-bold mb-2' }, 'REVENUE'),
        ...[['Streaming Royalties', 42800], ['Publishing Royalties', 28500], ['Sync Licensing', 12000], ['Live Performance', 18500], ['Production Services', 8200], ['Merchandise', 3400]].map(([n, a], i) =>
          e('div', { key: i, className: 'flex justify-between py-1 text-sm' }, e('span', { className: 'text-gray-300' }, n), e('span', { className: 'text-green-400 font-bold' }, '$' + a.toLocaleString()))
        ),
        e('div', { className: 'flex justify-between py-2 mt-2 border-t border-green-500/20 font-black' }, e('span', null, 'Total Revenue'), e('span', { className: 'text-green-400' }, '$113,400'))
      ),
      e('div', { className: 'bg-red-500/10 rounded-xl p-4 border border-red-500/20' },
        e('div', { className: 'text-sm text-red-400 font-bold mb-2' }, 'EXPENSES'),
        ...EXPENSE_CATEGORIES.map((cat, i) =>
          e('div', { key: i, className: 'flex justify-between py-1 text-sm' }, e('span', { className: 'text-gray-300' }, cat.icon + ' ' + cat.name), e('span', { className: 'text-red-400 font-bold' }, '$' + cat.ytd.toLocaleString()))
        ),
        e('div', { className: 'flex justify-between py-2 mt-2 border-t border-red-500/20 font-black' }, e('span', null, 'Total Expenses'), e('span', { className: 'text-red-400' }, '$' + totalExpenses.toLocaleString()))
      ),
      e('div', { className: 'bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20' },
        e('div', { className: 'flex justify-between font-black text-lg' }, e('span', null, 'NET PROFIT (YTD)'), e('span', { className: 'text-cyan-400' }, '$' + (113400 - totalExpenses).toLocaleString())),
        e('div', { className: 'text-xs text-gray-500 mt-1' }, 'Profit margin: ' + Math.round(((113400 - totalExpenses) / 113400) * 100) + '%')
      )
    ),
    e('div', { className: 'bg-white/5 rounded-2xl p-6 border border-white/10' },
      e('h3', { className: 'font-bold mb-4' }, 'Quarterly Estimated Tax Payments'),
      e('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3' },
        ...[{ q:'Q1', due:'Apr 15', st:'due' }, { q:'Q2', due:'Jun 16', st:'upcoming' }, { q:'Q3', due:'Sep 15', st:'upcoming' }, { q:'Q4', due:'Jan 15', st:'upcoming' }].map((q, i) =>
          e('div', { key: i, className: 'rounded-xl p-4 border text-center ' + (q.st === 'due' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10') },
            e('div', { className: 'text-lg font-black' }, q.q),
            e('div', { className: 'text-xs text-gray-400' }, q.due),
            e('div', { className: 'text-xl font-black text-green-400 mt-2' }, '$' + Math.round(income * 0.182 / 4).toLocaleString()),
            e('div', { className: 'text-xs mt-1 ' + (q.st === 'due' ? 'text-amber-400' : 'text-gray-500') }, q.st === 'due' ? '⚠️ Due Soon' : '📅 Upcoming')
          )
        )
      )
    )
  );

  // ═══ CALENDAR TAB ═══
  const renderCalendar = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(Calendar, { className: 'w-6 h-6 text-cyan-400' }), 'Tax Calendar — Key Deadlines'),
    e('div', { className: 'space-y-3' },
      ...TAX_DEADLINES.map((dl, i) =>
        e('div', { key: i, className: 'bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all' },
          e('div', { className: 'flex items-center gap-4' },
            e('div', { className: 'w-12 h-12 rounded-xl flex items-center justify-center text-center ' + (dl.status === 'completed' ? 'bg-green-500/20' : 'bg-amber-500/20') },
              e('div', null,
                e('div', { className: 'text-xs font-bold ' + (dl.status === 'completed' ? 'text-green-400' : 'text-amber-400') }, new Date(dl.date).toLocaleDateString('en-US', { month: 'short' })),
                e('div', { className: 'text-lg font-black ' + (dl.status === 'completed' ? 'text-green-400' : 'text-amber-400') }, new Date(dl.date).getDate())
              )
            ),
            e('div', null,
              e('div', { className: 'font-bold' }, dl.title),
              e('div', { className: 'text-xs text-gray-500' }, dl.form !== 'N/A' ? 'Form ' + dl.form : dl.type)
            )
          ),
          e('div', { className: 'px-3 py-1 rounded-full text-xs font-bold ' + (dl.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400') },
            dl.status === 'completed' ? '✅ Done' : '📅 Upcoming'
          )
        )
      )
    )
  );

  // ═══ FILING CENTER TAB ═══
  const renderFiling = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(FileCheck, { className: 'w-6 h-6 text-orange-400' }), 'Filing Center — Document Checklist'),
    e('div', { className: 'bg-white/5 rounded-2xl p-5 border border-white/10 mb-4' },
      e('div', { className: 'flex items-center justify-between mb-3' },
        e('div', null,
          e('div', { className: 'font-bold' }, 'Filing Readiness: ' + docProgress + '%'),
          e('div', { className: 'text-xs text-gray-500' }, documents.filter(d => d.collected).length + ' of ' + documents.length + ' documents collected')
        ),
        e('div', { className: 'text-2xl font-black ' + (docProgress >= 80 ? 'text-green-400' : docProgress >= 50 ? 'text-yellow-400' : 'text-red-400') }, docProgress + '%')
      ),
      e(MiniBar, { value: docProgress, max: 100, color: docProgress >= 80 ? 'bg-green-500' : docProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500' })
    ),
    ...['Income', 'Expenses', 'Deductions', 'Entity'].map(cat =>
      e('div', { key: cat },
        e('h3', { className: 'text-sm font-bold text-gray-400 mb-2' }, cat),
        e('div', { className: 'space-y-2' },
          ...documents.filter(d => d.category === cat).map(doc =>
            e('div', { key: doc.id, onClick: () => toggleDoc(doc.id), className: 'bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all' },
              e('div', { className: 'flex items-center gap-3' },
                e('div', { className: 'w-6 h-6 rounded border flex items-center justify-center ' + (doc.collected ? 'bg-green-500/20 border-green-500/50' : 'border-white/20') },
                  doc.collected && e(Check, { className: 'w-4 h-4 text-green-400' })
                ),
                e('span', { className: 'text-sm ' + (doc.collected ? 'text-gray-300' : 'text-gray-400') }, doc.name)
              ),
              e('div', { className: 'flex items-center gap-2' },
                doc.required && e('span', { className: 'text-xs text-red-400' }, 'Required'),
                e('span', { className: 'text-xs ' + (doc.collected ? 'text-green-400' : 'text-gray-500') }, doc.collected ? '✅' : '⬜')
              )
            )
          )
        )
      )
    ),
    e('div', { className: 'bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-900/20 to-emerald-900/20 rounded-2xl p-5 border border-green-500/20 flex items-center justify-between flex-wrap gap-4' },
      e('div', null,
        e('div', { className: 'font-bold text-green-400' }, 'FREE Tax Filing with UpStaxx'),
        e('div', { className: 'text-sm text-gray-400' }, 'IRS-authorized e-file included with annual membership'),
        e('div', { className: 'text-xs text-gray-500 mt-1' }, 'Professional review available from $199 (was $399)')
      ),
      e('a', { href: 'https://upstaxx.com', target: '_blank', rel: 'noopener noreferrer', className: 'px-4 py-2 bg-green-600 rounded-xl font-bold hover:bg-green-500 transition-all text-sm' }, 'Start Filing →')
    )
  );

  // ═══ SWOT ANALYSIS TAB ═══
  const renderSWOT = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(Layers, { className: 'w-6 h-6 text-indigo-400' }), 'SWOT Analysis — FASTASSMAN Publishing Tax Position'),
    e('div', { className: 'text-sm text-gray-400 mb-4' }, 'Strategic framework analyzing Strengths, Weaknesses, Opportunities, and Threats for your music business tax strategy.'),
    // SWOT Grid
    e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
      // STRENGTHS
      e('div', { className: 'bg-green-500/10 rounded-2xl p-5 border border-green-500/20' },
        e('h3', { className: 'font-black text-green-400 mb-4 flex items-center gap-2 text-lg' }, '💪 STRENGTHS', e('span', { className: 'text-xs font-normal bg-green-500/20 px-2 py-0.5 rounded-full' }, 'Internal')),
        e('div', { className: 'space-y-3' },
          ...SWOT_DATA.strengths.map((item, i) =>
            e('div', { key: i, className: 'bg-black/20 rounded-xl p-3 border border-green-500/10' },
              e('div', { className: 'flex items-center justify-between mb-1' },
                e('div', { className: 'font-bold text-sm text-green-300' }, item.title),
                e('span', { className: 'text-xs px-2 py-0.5 rounded-full ' + (item.impact === 'high' ? 'bg-green-500/30 text-green-400' : 'bg-green-500/20 text-green-300') }, item.impact)
              ),
              e('div', { className: 'text-xs text-gray-400' }, item.detail),
              e('div', { className: 'text-xs text-green-600 mt-1' }, item.category)
            )
          )
        )
      ),
      // WEAKNESSES
      e('div', { className: 'bg-red-500/10 rounded-2xl p-5 border border-red-500/20' },
        e('h3', { className: 'font-black text-red-400 mb-4 flex items-center gap-2 text-lg' }, '⚠️ WEAKNESSES', e('span', { className: 'text-xs font-normal bg-red-500/20 px-2 py-0.5 rounded-full' }, 'Internal')),
        e('div', { className: 'space-y-3' },
          ...SWOT_DATA.weaknesses.map((item, i) =>
            e('div', { key: i, className: 'bg-black/20 rounded-xl p-3 border border-red-500/10' },
              e('div', { className: 'flex items-center justify-between mb-1' },
                e('div', { className: 'font-bold text-sm text-red-300' }, item.title),
                e('span', { className: 'text-xs px-2 py-0.5 rounded-full ' + (item.impact === 'high' ? 'bg-red-500/30 text-red-400' : 'bg-red-500/20 text-red-300') }, item.impact)
              ),
              e('div', { className: 'text-xs text-gray-400' }, item.detail),
              item.action && e('div', { className: 'text-xs text-yellow-400 mt-1 flex items-center gap-1' }, '🎯 ', item.action)
            )
          )
        )
      ),
      // OPPORTUNITIES
      e('div', { className: 'bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20' },
        e('h3', { className: 'font-black text-blue-400 mb-4 flex items-center gap-2 text-lg' }, '🚀 OPPORTUNITIES', e('span', { className: 'text-xs font-normal bg-blue-500/20 px-2 py-0.5 rounded-full' }, 'External')),
        e('div', { className: 'space-y-3' },
          ...SWOT_DATA.opportunities.map((item, i) =>
            e('div', { key: i, className: 'bg-black/20 rounded-xl p-3 border border-blue-500/10' },
              e('div', { className: 'flex items-center justify-between mb-1' },
                e('div', { className: 'font-bold text-sm text-blue-300' }, item.title),
                e('span', { className: 'text-xs px-2 py-0.5 rounded-full ' + (item.impact === 'high' ? 'bg-blue-500/30 text-blue-400' : 'bg-blue-500/20 text-blue-300') }, item.impact)
              ),
              e('div', { className: 'text-xs text-gray-400' }, item.detail),
              e('div', { className: 'text-xs text-blue-600 mt-1' }, item.source)
            )
          )
        )
      ),
      // THREATS
      e('div', { className: 'bg-orange-500/10 rounded-2xl p-5 border border-orange-500/20' },
        e('h3', { className: 'font-black text-orange-400 mb-4 flex items-center gap-2 text-lg' }, '🔥 THREATS', e('span', { className: 'text-xs font-normal bg-orange-500/20 px-2 py-0.5 rounded-full' }, 'External')),
        e('div', { className: 'space-y-3' },
          ...SWOT_DATA.threats.map((item, i) =>
            e('div', { key: i, className: 'bg-black/20 rounded-xl p-3 border border-orange-500/10' },
              e('div', { className: 'flex items-center justify-between mb-1' },
                e('div', { className: 'font-bold text-sm text-orange-300' }, item.title),
                e('span', { className: 'text-xs px-2 py-0.5 rounded-full ' + (item.impact === 'high' ? 'bg-orange-500/30 text-orange-400' : 'bg-orange-500/20 text-orange-300') }, item.impact)
              ),
              e('div', { className: 'text-xs text-gray-400' }, item.detail),
              item.mitigation && e('div', { className: 'text-xs text-green-400 mt-1 flex items-center gap-1' }, '🛡️ ', item.mitigation)
            )
          )
        )
      )
    ),
    // Strategic Priorities
    e('div', { className: 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl p-6 border border-indigo-500/20' },
      e('h3', { className: 'font-bold text-indigo-400 mb-4 flex items-center gap-2' }, e(Target, { className: 'w-5 h-5' }), 'Strategic Priorities — Derived from SWOT'),
      e('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
        ...[
          { priority: '1. Activate Retirement', desc: 'Fund Solo 401(k) to capture $15,600/yr — uses STRENGTH (S-Corp) to address WEAKNESS (no retirement).', color: 'text-green-400', urgency: 'Immediate' },
          { priority: '2. Start Infinite Banking', desc: 'Establish whole life policy to capture OPPORTUNITY — builds tax-free wealth and recaptures interest.', color: 'text-blue-400', urgency: 'Q2 2025' },
          { priority: '3. Collect Missing Docs', desc: 'Gather 7 missing documents to address WEAKNESS — reduces THREAT of audit risk.', color: 'text-yellow-400', urgency: 'Before Apr 15' },
          { priority: '4. GA Film Credit', desc: 'Apply for Georgia Film/Music Credit — leverages STRENGTH (GA location) for OPPORTUNITY (20-30% credit).', color: 'text-cyan-400', urgency: 'Q2 2025' },
          { priority: '5. Estate Planning', desc: 'Value 3,650+ track catalog — uses STRENGTH (IP ownership) to capture OPPORTUNITY ($15K+ savings).', color: 'text-purple-400', urgency: 'Q3 2025' },
          { priority: '6. Maximize Before TCJA Expires', desc: 'Accelerate deductions before THREAT (tax law changes) — use STRENGTHS to front-load savings.', color: 'text-red-400', urgency: 'Before Dec 31' }
        ].map((p, i) =>
          e('div', { key: i, className: 'bg-black/20 rounded-xl p-4 border border-white/5' },
            e('div', { className: 'font-bold text-sm ' + p.color }, p.priority),
            e('div', { className: 'text-xs text-gray-400 mt-1' }, p.desc),
            e('div', { className: 'text-xs text-gray-500 mt-2' }, '⏰ ' + p.urgency)
          )
        )
      )
    ),
    e('div', { className: 'text-xs text-gray-400 text-center' }, 'SWOT Framework applied to FASTASSMAN Publishing Inc tax position • Based on SWOT Analysis methodology • © 2025')
  );

  // ═══ INFINITE BANKING TAB ═══
  const renderBanking = () => e('div', { className: 'space-y-6' },
    e('h2', { className: 'text-xl font-bold flex items-center gap-2' }, e(Landmark, { className: 'w-6 h-6 text-amber-400' }), 'Infinite Banking Concept — Be Your Own Banker'),
    e('div', { className: 'text-sm text-gray-400' }, 'Based on R. Nelson Nash\'s "Becoming Your Own Banker" — Applied to music industry wealth building.'),
    // Key Quote
    e('div', { className: 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-2xl p-5 border border-amber-500/20 text-center' },
      e('div', { className: 'text-lg italic text-amber-300' }, '"You finance everything you buy — you either pay interest to someone else or give up interest you could have earned."'),
      e('div', { className: 'text-xs text-gray-500 mt-2' }, '— R. Nelson Nash, Becoming Your Own Banker')
    ),
    // 10 Principles
    e('div', { className: 'bg-white/5 rounded-2xl p-6 border border-white/10' },
      e('h3', { className: 'font-bold mb-4 flex items-center gap-2' }, e(BookOpen, { className: 'w-5 h-5 text-amber-400' }), '10 Core Principles'),
      e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
        ...INFINITE_BANKING.principles.map(p =>
          e('div', { key: p.id, className: 'bg-black/20 rounded-xl p-4 border border-amber-500/10 hover:border-amber-500/30 transition-all' },
            e('div', { className: 'flex items-center gap-2 mb-2' },
              e('span', { className: 'text-2xl' }, p.icon),
              e('div', null,
                e('div', { className: 'font-bold text-sm text-amber-300' }, p.id + '. ' + p.name),
                e('div', { className: 'text-xs text-amber-600' }, p.source)
              )
            ),
            e('div', { className: 'text-xs text-gray-400' }, p.detail)
          )
        )
      )
    ),
    // Music Industry Applications
    e('div', { className: 'bg-white/5 rounded-2xl p-6 border border-white/10' },
      e('h3', { className: 'font-bold mb-4 flex items-center gap-2' }, e(Music, { className: 'w-5 h-5 text-purple-400' }), 'Music Industry Applications — IBC vs Traditional Financing'),
      e('div', { className: 'space-y-3' },
        ...INFINITE_BANKING.musicApplications.map((app, i) =>
          e('div', { key: i, className: 'bg-black/20 rounded-xl p-4 border border-white/5' },
            e('div', { className: 'flex items-center justify-between mb-2' },
              e('div', { className: 'font-bold text-amber-300' }, app.scenario),
              e('div', { className: 'text-green-400 font-black' }, 'Save $' + app.savings.toLocaleString())
            ),
            e('div', { className: 'text-xs text-gray-400 mb-3' }, app.description),
            e('div', { className: 'grid grid-cols-2 gap-2' },
              e('div', { className: 'bg-red-500/10 rounded-lg p-2 border border-red-500/10' },
                e('div', { className: 'text-xs text-red-400 font-bold' }, '❌ Traditional'),
                e('div', { className: 'text-xs text-gray-400' }, app.traditional)
              ),
              e('div', { className: 'bg-green-500/10 rounded-lg p-2 border border-green-500/10' },
                e('div', { className: 'text-xs text-green-400 font-bold' }, '✅ Infinite Banking'),
                e('div', { className: 'text-xs text-gray-400' }, app.ibc)
              )
            )
          )
        )
      ),
      e('div', { className: 'mt-4 pt-4 border-t border-white/10 text-center' },
        e('div', { className: 'text-lg font-black text-green-400' }, 'Total Interest Recaptured: $' + INFINITE_BANKING.musicApplications.reduce((s, a) => s + a.savings, 0).toLocaleString() + '/cycle'),
        e('div', { className: 'text-xs text-gray-500' }, 'Money that would have gone to banks now stays in YOUR system')
      )
    ),
    // Policy Growth Projection
    e('div', { className: 'bg-white/5 rounded-2xl p-6 border border-white/10' },
      e('h3', { className: 'font-bold mb-4 flex items-center gap-2' }, e(TrendingUp, { className: 'w-5 h-5 text-cyan-400' }), 'Policy Growth Projection — $' + INFINITE_BANKING.projections.annualPremium.toLocaleString() + '/yr Premium'),
      e('div', { className: 'overflow-x-auto' },
        e('table', { className: 'w-full text-sm' },
          e('thead', null,
            e('tr', { className: 'border-b border-white/10' },
              ...['Year', 'Total Premiums', 'Cash Value', 'Death Benefit', 'Loan Available'].map(h =>
                e('th', { key: h, className: 'text-left py-2 px-3 text-xs text-gray-500 font-bold' }, h)
              )
            )
          ),
          e('tbody', null,
            ...INFINITE_BANKING.projections.years.map((yr, i) =>
              e('tr', { key: i, className: 'border-b border-white/5 hover:bg-white/5' },
                e('td', { className: 'py-2 px-3 font-bold text-amber-400' }, 'Year ' + yr.year),
                e('td', { className: 'py-2 px-3 text-gray-400' }, '$' + yr.premium.toLocaleString()),
                e('td', { className: 'py-2 px-3 text-green-400 font-bold' }, '$' + yr.cashValue.toLocaleString()),
                e('td', { className: 'py-2 px-3 text-cyan-400' }, '$' + yr.deathBenefit.toLocaleString()),
                e('td', { className: 'py-2 px-3 text-yellow-400' }, yr.loanAvailable > 0 ? '$' + yr.loanAvailable.toLocaleString() : '—')
              )
            )
          )
        )
      ),
      e('div', { className: 'mt-4 grid grid-cols-3 gap-3 text-center' },
        e('div', { className: 'bg-green-500/10 rounded-xl p-3 border border-green-500/20' },
          e('div', { className: 'text-xs text-green-400' }, '30-Year Cash Value'),
          e('div', { className: 'text-xl font-black text-green-400' }, '$1.8M')
        ),
        e('div', { className: 'bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20' },
          e('div', { className: 'text-xs text-cyan-400' }, 'Death Benefit'),
          e('div', { className: 'text-xl font-black text-cyan-400' }, '$1.5M')
        ),
        e('div', { className: 'bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20' },
          e('div', { className: 'text-xs text-yellow-400' }, 'Loan Available'),
          e('div', { className: 'text-xl font-black text-yellow-400' }, '$1.7M')
        )
      )
    ),
    // How It Works Flow
    e('div', { className: 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl p-6 border border-amber-500/20' },
      e('h3', { className: 'font-bold mb-4 text-amber-400' }, '🔄 The Infinite Banking Cycle'),
      e('div', { className: 'grid grid-cols-1 md:grid-cols-5 gap-2' },
        ...['1. Pay Premium → Build Cash Value', '2. Cash Value Earns Dividends', '3. Take Policy Loan for Purchase', '4. Pay Yourself Back + Interest', '5. Repeat — System Grows Stronger'].map((step, i) =>
          e('div', { key: i, className: 'bg-black/20 rounded-xl p-3 border border-amber-500/10 text-center' },
            e('div', { className: 'text-xs text-amber-300 font-bold' }, step)
          )
        )
      ),
      e('div', { className: 'text-center mt-4' },
        e('div', { className: 'text-sm text-amber-300 font-bold' }, '"The Grocery Store Concept" — Keep your system fully stocked and the volume of business will make it thrive.'),
        e('div', { className: 'text-xs text-gray-500 mt-1' }, '— R. Nelson Nash, Becoming Your Own Banker')
      )
    ),
    // Disclaimer
    e('div', { className: 'text-xs text-gray-400 text-center' }, 'Based on "Becoming Your Own Banker" by R. Nelson Nash • Projections are illustrative • Consult a licensed insurance professional • Not financial advice')
  );

  // ═══ MAIN RENDER ═══
  return e('div', { className: 'min-h-screen bg-gradient-to-br from-gray-950 via-green-950/20 to-black text-white' },
    // Header
    e('div', { className: 'bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-900/30 to-emerald-900/30 border-b border-green-500/20' },
      e('div', { className: 'max-w-7xl mx-auto px-4 py-4' },
        e('div', { className: 'flex items-center justify-between flex-wrap gap-4' },
          e('div', { className: 'flex items-center gap-4' },
            e('div', { className: 'relative' },
              e(DollarSign, { className: 'w-12 h-12 text-green-400' }),
              e(Crown, { className: 'w-5 h-5 text-yellow-400 absolute -top-1 -right-1' })
            ),
            e('div', null,
              e('h1', { className: 'text-2xl font-black tracking-tight' },
                e('span', { className: 'text-green-400' }, 'Up'),
                e('span', { className: 'text-white' }, 'Staxx'),
                e('span', { className: 'text-yellow-400 ml-2' }, '× GOAT'),
                e('span', { className: 'text-xs ml-2 px-2 py-0.5 bg-green-500/20 rounded-full text-green-300 font-normal' }, 'v3.0')
              ),
              e('p', { className: 'text-xs text-gray-400' }, 'AI Tax Engine • 350+ Strategies • 63+ Credits • SWOT • Infinite Banking • Mr. Green')
            )
          ),
          e('div', { className: 'flex items-center gap-3 flex-wrap' },
            e('div', { className: 'px-3 py-2 rounded-xl bg-green-500/20 border border-green-500/50' },
              e('div', { className: 'text-xs text-green-300' }, 'Active'),
              e('div', { className: 'text-lg font-black text-green-400' }, '$' + totalSavings.toLocaleString())
            ),
            e('div', { className: 'px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/50' },
              e('div', { className: 'text-xs text-yellow-300' }, 'Available'),
              e('div', { className: 'text-lg font-black text-yellow-400' }, '+$' + availableSavings.toLocaleString())
            ),
            e('div', { className: 'px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50' },
              e('div', { className: 'text-xs text-cyan-300' }, 'Total'),
              e('div', { className: 'text-lg font-black text-cyan-400' }, '$' + allSavings.toLocaleString())
            ),
            e('a', { href: 'https://upstaxx.com', target: '_blank', rel: 'noopener noreferrer', className: 'px-3 py-2 bg-green-600/30 rounded-xl hover:bg-green-600/50 transition-all text-sm flex items-center gap-1 text-green-400' },
              e(ExternalLink, { className: 'w-4 h-4' }), ' upstaxx.com'
            ),
            e('a', { href: '/', className: 'px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-sm' }, '👑 GOAT Home')
          )
        )
      )
    ),
    // Tabs
    e('div', { className: 'max-w-7xl mx-auto px-4 mt-4' },
      e('div', { className: 'flex gap-1.5 overflow-x-auto pb-2' },
        ...tabs.map(tab =>
          e('button', { key: tab.id, onClick: () => setActiveTab(tab.id), className: 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ' + (activeTab === tab.id ? 'bg-green-600/30 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/10' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10') },
            e(tab.icon, { className: 'w-3.5 h-3.5' }), tab.label
          )
        )
      )
    ),
    // Content
    e('div', { className: 'max-w-7xl mx-auto px-4 py-6' },
      activeTab === 'dashboard' && renderDashboard(),
      activeTab === 'strategies' && renderStrategies(),
      activeTab === 'credits' && renderCredits(),
      activeTab === 'mrgreen' && renderMrGreen(),
      activeTab === 'wealth' && renderWealth(),
      activeTab === 'expenses' && renderExpenses(),
      activeTab === 'mileage' && renderMileage(),
      activeTab === 'bookkeeping' && renderBookkeeping(),
      activeTab === 'calendar' && renderCalendar(),
      activeTab === 'filing' && renderFiling(),
      activeTab === 'swot' && renderSWOT(),
      activeTab === 'banking' && renderBanking()
    ),
    // Footer
    e('div', { className: 'max-w-7xl mx-auto px-4 py-6 mt-8 border-t border-white/5' },
      e('div', { className: 'flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2' },
        e('div', null, '💰 UpStaxx × GOAT Royalty • AI Tax Strategy Engine v3.0'),
        e('div', null, 'Powered by ', e('a', { href: 'https://upstaxx.com', target: '_blank', rel: 'noopener noreferrer', className: 'text-green-400 hover:text-green-300' }, 'upstaxx.com'), ' • 350+ Strategies • SWOT • ∞ Banking • Mr. Green AI'),
        e('div', null, '© 2025 Harvey Miller / FASTASSMAN Publishing Inc')
      )
    )
  );
};

export default UpStaxxTaxEngine;