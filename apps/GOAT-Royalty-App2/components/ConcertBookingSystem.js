/**
 * 🎤 Concert Booking System — GOAT Force Entertainment
 * Full-Service Artist Booking, College Circuit, Venue Management, Contract Engine
 * CEO: DJ Speedy (Harvey Miller) | President: Waka Flocka Flame
 * © 2025 GOAT Force Entertainment / Life Imitates Art Inc
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, MapPin, DollarSign, Users, Star, Search, Filter,
  Music, Mic, Building2, GraduationCap, Globe, Phone, Mail,
  FileText, CheckCircle, Clock, AlertTriangle, TrendingUp,
  BarChart3, PieChart, ArrowRight, ArrowLeft, Plus, Edit,
  Trash2, Download, Upload, Send, Eye, Heart, Share2,
  Zap, Shield, Crown, Target, Activity, Briefcase, Award,
  Plane, Hotel, Truck, Camera, Radio, Tv, Headphones,
  ChevronDown, ChevronUp, ChevronRight, X, Menu, Bell,
  Bookmark, Tag, Hash, Link, ExternalLink, Copy, Printer,
  Settings, RefreshCw, MoreHorizontal, Info, HelpCircle,
  Layers, Grid, List, Map, Navigation, Compass
} from 'lucide-react';

// ═══ GOAT FORCE ROSTER ═══
const GOAT_ROSTER = [
  {
    id: 'waka-flocka',
    name: 'Waka Flocka Flame',
    role: 'President / Headliner',
    genre: 'Hip-Hop / Trap',
    image: '🔥',
    tier: 'A-List',
    bookingFee: { min: 25000, max: 75000 },
    collegeFee: { min: 15000, max: 45000 },
    festivalFee: { min: 35000, max: 100000 },
    rating: 4.9,
    totalShows: 2847,
    monthlyStreams: '45M+',
    topHits: ['No Hands', 'Hard in da Paint', 'Grove St. Party', 'Round of Applause'],
    riderRequirements: ['Premium Sound System (min 50K watts)', 'Green Room with specific catering', 'Security detail (min 4)', 'Transportation from airport', 'Hotel suite accommodation'],
    availability: 'available',
    markets: ['Clubs', 'Festivals', 'Colleges', 'Corporate', 'Private Events'],
    territory: 'Worldwide',
    agentCommission: 10,
    managerCommission: 15,
  },
  {
    id: 'dj-speedy',
    name: 'DJ Speedy',
    role: 'CEO / DJ / Producer',
    genre: 'Hip-Hop / EDM / Multi-Genre',
    image: '🎧',
    tier: 'A-List',
    bookingFee: { min: 10000, max: 35000 },
    collegeFee: { min: 8000, max: 25000 },
    festivalFee: { min: 15000, max: 50000 },
    rating: 4.8,
    totalShows: 3200,
    monthlyStreams: '12M+',
    topHits: ['FIVE DEUCES', 'GOAT Mode', 'BrickSquad Anthem', 'Speedy Gonzales'],
    riderRequirements: ['Pioneer CDJ-3000 x2 + DJM-A9', 'Monitor speakers', 'Green room', 'Transportation', 'Hotel accommodation'],
    availability: 'available',
    markets: ['Clubs', 'Festivals', 'Colleges', 'Corporate', 'Private Events', 'Radio'],
    territory: 'Worldwide',
    agentCommission: 10,
    managerCommission: 15,
  },
  {
    id: 'baby-goat',
    name: 'Baby GOAT',
    role: 'Artist / Performer',
    genre: 'Hip-Hop / R&B',
    image: '🐐',
    tier: 'Rising Star',
    bookingFee: { min: 5000, max: 15000 },
    collegeFee: { min: 3000, max: 10000 },
    festivalFee: { min: 8000, max: 25000 },
    rating: 4.7,
    totalShows: 450,
    monthlyStreams: '3.5M+',
    topHits: ['Young GOAT', 'Next Up', 'Legacy', 'No Cap'],
    riderRequirements: ['Quality sound system', 'Green room', 'Transportation', 'Hotel accommodation'],
    availability: 'available',
    markets: ['Clubs', 'Colleges', 'Festivals', 'Private Events'],
    territory: 'United States',
    agentCommission: 10,
    managerCommission: 15,
  },
  {
    id: 'the-goat',
    name: 'The GOAT',
    role: 'Legacy Artist',
    genre: 'Hip-Hop / Southern Rap',
    image: '👑',
    tier: 'Legend',
    bookingFee: { min: 15000, max: 50000 },
    collegeFee: { min: 10000, max: 30000 },
    festivalFee: { min: 25000, max: 75000 },
    rating: 4.9,
    totalShows: 1850,
    monthlyStreams: '8M+',
    topHits: ['Crown Me', 'Southern King', 'GOAT Status', 'Real Ones'],
    riderRequirements: ['Premium sound system', 'VIP green room', 'Security detail (min 2)', 'First class transportation', 'Suite accommodation'],
    availability: 'limited',
    markets: ['Festivals', 'Corporate', 'Private Events', 'Special Appearances'],
    territory: 'United States',
    agentCommission: 10,
    managerCommission: 20,
  },
];

// ═══ VENUE DATABASE ═══
const VENUE_DATABASE = [
  { id: 'v1', name: 'State Farm Arena', city: 'Atlanta, GA', capacity: 21000, type: 'Arena', rating: 4.8, venueType: 'arena', avgTicketPrice: 85 },
  { id: 'v2', name: 'The Tabernacle', city: 'Atlanta, GA', capacity: 2600, type: 'Concert Hall', rating: 4.9, venueType: 'hall', avgTicketPrice: 45 },
  { id: 'v3', name: 'Center Stage', city: 'Atlanta, GA', capacity: 1050, type: 'Theater', rating: 4.7, venueType: 'theater', avgTicketPrice: 35 },
  { id: 'v4', name: 'Madison Square Garden', city: 'New York, NY', capacity: 20789, type: 'Arena', rating: 5.0, venueType: 'arena', avgTicketPrice: 120 },
  { id: 'v5', name: 'The Roxy Theatre', city: 'Los Angeles, CA', capacity: 500, type: 'Club', rating: 4.6, venueType: 'club', avgTicketPrice: 30 },
  { id: 'v6', name: 'House of Blues', city: 'Chicago, IL', capacity: 1800, type: 'Concert Hall', rating: 4.7, venueType: 'hall', avgTicketPrice: 40 },
  { id: 'v7', name: 'Red Rocks Amphitheatre', city: 'Morrison, CO', capacity: 9525, type: 'Amphitheatre', rating: 5.0, venueType: 'amphitheatre', avgTicketPrice: 75 },
  { id: 'v8', name: 'The Fillmore', city: 'San Francisco, CA', capacity: 1315, type: 'Concert Hall', rating: 4.8, venueType: 'hall', avgTicketPrice: 50 },
  { id: 'v9', name: 'Terminal 5', city: 'New York, NY', capacity: 3000, type: 'Venue', rating: 4.5, venueType: 'venue', avgTicketPrice: 45 },
  { id: 'v10', name: 'Cellairis Amphitheatre', city: 'Atlanta, GA', capacity: 19000, type: 'Amphitheatre', rating: 4.6, venueType: 'amphitheatre', avgTicketPrice: 65 },
];

// ═══ COLLEGE CIRCUIT DATABASE ═══
const COLLEGE_DATABASE = [
  { id: 'c1', name: 'Georgia State University', city: 'Atlanta, GA', enrollment: 54000, budget: 85000, conference: 'NACA South', contactTitle: 'Student Activities Director', lastBooked: '2024-11', rating: 4.8 },
  { id: 'c2', name: 'University of Georgia', city: 'Athens, GA', enrollment: 40000, budget: 120000, conference: 'NACA South', contactTitle: 'Campus Events Coordinator', lastBooked: '2024-09', rating: 4.9 },
  { id: 'c3', name: 'Morehouse College', city: 'Atlanta, GA', enrollment: 2200, budget: 45000, conference: 'NACA South', contactTitle: 'Student Government VP', lastBooked: '2025-02', rating: 4.7 },
  { id: 'c4', name: 'Spelman College', city: 'Atlanta, GA', enrollment: 2100, budget: 40000, conference: 'NACA South', contactTitle: 'Activities Board Chair', lastBooked: '2024-10', rating: 4.8 },
  { id: 'c5', name: 'Clark Atlanta University', city: 'Atlanta, GA', enrollment: 4000, budget: 55000, conference: 'NACA South', contactTitle: 'Student Life Director', lastBooked: '2025-01', rating: 4.6 },
  { id: 'c6', name: 'Howard University', city: 'Washington, DC', enrollment: 12000, budget: 150000, conference: 'NACA Mid-Atlantic', contactTitle: 'Homecoming Committee', lastBooked: '2024-10', rating: 5.0 },
  { id: 'c7', name: 'Florida A&M University', city: 'Tallahassee, FL', enrollment: 10000, budget: 95000, conference: 'NACA South', contactTitle: 'Student Activities Board', lastBooked: '2024-11', rating: 4.7 },
  { id: 'c8', name: 'NYU', city: 'New York, NY', enrollment: 58000, budget: 200000, conference: 'NACA Northeast', contactTitle: 'Program Board Director', lastBooked: '2025-03', rating: 4.9 },
  { id: 'c9', name: 'UCLA', city: 'Los Angeles, CA', enrollment: 46000, budget: 175000, conference: 'NACA West', contactTitle: 'Cultural Affairs Commission', lastBooked: '2024-12', rating: 4.8 },
  { id: 'c10', name: 'University of Texas', city: 'Austin, TX', enrollment: 52000, budget: 160000, conference: 'NACA Central', contactTitle: 'Texas Union Events', lastBooked: '2025-01', rating: 4.7 },
  { id: 'c11', name: 'Ohio State University', city: 'Columbus, OH', enrollment: 61000, budget: 180000, conference: 'NACA Great Lakes', contactTitle: 'Student Activities Office', lastBooked: '2024-09', rating: 4.6 },
  { id: 'c12', name: 'University of Miami', city: 'Miami, FL', enrollment: 19000, budget: 110000, conference: 'NACA South', contactTitle: 'Hurricane Productions', lastBooked: '2025-02', rating: 4.8 },
];

// ═══ NACA/APCA CONFERENCE SCHEDULE ═══
const CONFERENCE_SCHEDULE = [
  { id: 'naca-south', name: 'NACA South', region: 'Southeast', date: 'October 2025', location: 'Nashville, TN', submissions: 650, slots: 32, deadline: 'July 15, 2025', fee: 1200, status: 'open' },
  { id: 'naca-northeast', name: 'NACA Northeast', region: 'Northeast', date: 'November 2025', location: 'Hartford, CT', submissions: 700, slots: 30, deadline: 'August 1, 2025', fee: 1200, status: 'open' },
  { id: 'naca-central', name: 'NACA Central', region: 'Central', date: 'October 2025', location: 'Minneapolis, MN', submissions: 500, slots: 28, deadline: 'July 20, 2025', fee: 1100, status: 'open' },
  { id: 'naca-west', name: 'NACA West', region: 'West', date: 'November 2025', location: 'Portland, OR', submissions: 450, slots: 25, deadline: 'August 10, 2025', fee: 1100, status: 'open' },
  { id: 'naca-mid-america', name: 'NACA Mid-America', region: 'Mid-America', date: 'October 2025', location: 'Kansas City, MO', submissions: 600, slots: 30, deadline: 'July 25, 2025', fee: 1200, status: 'open' },
  { id: 'naca-mid-atlantic', name: 'NACA Mid-Atlantic', region: 'Mid-Atlantic', date: 'November 2025', location: 'Virginia Beach, VA', submissions: 550, slots: 28, deadline: 'August 5, 2025', fee: 1150, status: 'open' },
  { id: 'naca-great-lakes', name: 'NACA Great Lakes', region: 'Great Lakes', date: 'October 2025', location: 'Columbus, OH', submissions: 480, slots: 26, deadline: 'July 30, 2025', fee: 1100, status: 'open' },
  { id: 'naca-national', name: 'NACA National', region: 'National', date: 'February 2026', location: 'Atlanta, GA', submissions: 900, slots: 40, deadline: 'October 15, 2025', fee: 1500, status: 'upcoming' },
  { id: 'apca-south', name: 'APCA Southeast', region: 'Southeast', date: 'March 2026', location: 'Myrtle Beach, SC', submissions: 350, slots: 35, deadline: 'December 1, 2025', fee: 950, status: 'upcoming' },
  { id: 'apca-national', name: 'APCA National', region: 'National', date: 'April 2026', location: 'Orlando, FL', submissions: 500, slots: 45, deadline: 'January 15, 2026', fee: 1300, status: 'upcoming' },
];

// ═══ BOOKING PIPELINE ═══
const BOOKING_PIPELINE = [
  { id: 'b1', artist: 'Waka Flocka Flame', venue: 'Howard University', type: 'College', date: '2025-10-18', fee: 35000, status: 'confirmed', deposit: 17500, depositPaid: true, contractSigned: true, riderApproved: true },
  { id: 'b2', artist: 'DJ Speedy', venue: 'Georgia State University', type: 'College', date: '2025-09-20', fee: 15000, status: 'confirmed', deposit: 7500, depositPaid: true, contractSigned: true, riderApproved: true },
  { id: 'b3', artist: 'Waka Flocka Flame', venue: 'The Tabernacle', type: 'Club', date: '2025-11-15', fee: 45000, status: 'negotiating', deposit: 22500, depositPaid: false, contractSigned: false, riderApproved: false },
  { id: 'b4', artist: 'Baby GOAT', venue: 'Morehouse College', type: 'College', date: '2025-10-25', fee: 8000, status: 'confirmed', deposit: 4000, depositPaid: true, contractSigned: true, riderApproved: false },
  { id: 'b5', artist: 'DJ Speedy', venue: 'House of Blues', type: 'Club', date: '2025-12-31', fee: 20000, status: 'pending', deposit: 10000, depositPaid: false, contractSigned: false, riderApproved: false },
  { id: 'b6', artist: 'The GOAT', venue: 'Red Rocks Amphitheatre', type: 'Festival', date: '2026-06-15', fee: 50000, status: 'inquiry', deposit: 25000, depositPaid: false, contractSigned: false, riderApproved: false },
  { id: 'b7', artist: 'Waka Flocka Flame', venue: 'UCLA', type: 'College', date: '2025-11-08', fee: 40000, status: 'negotiating', deposit: 20000, depositPaid: false, contractSigned: false, riderApproved: true },
  { id: 'b8', artist: 'DJ Speedy + Waka Flocka', venue: 'State Farm Arena', type: 'Arena', date: '2026-03-22', fee: 85000, status: 'inquiry', deposit: 42500, depositPaid: false, contractSigned: false, riderApproved: false },
  { id: 'b9', artist: 'Baby GOAT', venue: 'Clark Atlanta University', type: 'College', date: '2025-11-01', fee: 6000, status: 'confirmed', deposit: 3000, depositPaid: true, contractSigned: true, riderApproved: true },
  { id: 'b10', artist: 'DJ Speedy', venue: 'University of Miami', type: 'College', date: '2025-12-05', fee: 18000, status: 'pending', deposit: 9000, depositPaid: false, contractSigned: false, riderApproved: false },
];

// ═══ CONTRACT TEMPLATES ═══
const CONTRACT_TEMPLATES = [
  { id: 'standard', name: 'Standard Performance Agreement', desc: 'Full booking contract with rider, payment terms, cancellation policy', sections: 15, pages: 8 },
  { id: 'college', name: 'College/University Booking Contract', desc: 'NACA-compliant contract for campus events with institutional requirements', sections: 18, pages: 10 },
  { id: 'festival', name: 'Festival Performance Agreement', desc: 'Multi-artist festival contract with stage times, production specs', sections: 20, pages: 12 },
  { id: 'corporate', name: 'Corporate Event Agreement', desc: 'Private/corporate event contract with confidentiality and brand guidelines', sections: 16, pages: 9 },
  { id: 'rider', name: 'Technical & Hospitality Rider', desc: 'Detailed technical requirements and hospitality specifications', sections: 12, pages: 6 },
  { id: 'agent', name: 'Booking Agent Agreement', desc: 'Agent representation contract with commission structure and territory', sections: 15, pages: 8 },
];

// ═══ FINANCIAL SUMMARY ═══
const FINANCIAL_SUMMARY = {
  totalBookings: 47,
  confirmedRevenue: 385000,
  pendingRevenue: 218000,
  pipelineRevenue: 135000,
  totalRevenue: 738000,
  depositsCollected: 164500,
  depositsOutstanding: 129000,
  agentCommissions: 73800,
  netRevenue: 664200,
  avgBookingFee: 15702,
  collegeBookings: 28,
  clubBookings: 11,
  festivalBookings: 5,
  corporateBookings: 3,
  topMonth: 'October 2025',
  topMonthRevenue: 142000,
};

// ═══ TABS ═══
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'roster', label: 'Artist Roster', icon: Users },
  { id: 'bookings', label: 'Booking Pipeline', icon: Calendar },
  { id: 'colleges', label: 'College Circuit', icon: GraduationCap },
  { id: 'venues', label: 'Venues', icon: Building2 },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'conferences', label: 'NACA / APCA', icon: Globe },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'inquiry', label: 'Book Now', icon: Mic },
];

// ═══ HELPER FUNCTIONS ═══
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const getStatusColor = (status) => {
  const colors = {
    confirmed: '#00c853',
    negotiating: '#ff9800',
    pending: '#2196f3',
    inquiry: '#9c27b0',
    cancelled: '#f44336',
    completed: '#4caf50',
    available: '#00c853',
    limited: '#ff9800',
    unavailable: '#f44336',
    open: '#00c853',
    upcoming: '#2196f3',
    closed: '#f44336',
  };
  return colors[status] || '#666';
};

const getStatusLabel = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ConcertBookingSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '', email: '', phone: '', organization: '', eventType: 'college',
    artist: '', date: '', venue: '', budget: '', attendees: '', details: ''
  });
  const [bookings, setBookings] = useState(BOOKING_PIPELINE);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ═══ DASHBOARD TAB ═══
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Bookings', value: FINANCIAL_SUMMARY.totalBookings, icon: Calendar, color: '#6366f1', sub: 'This Season' },
          { label: 'Confirmed Revenue', value: formatCurrency(FINANCIAL_SUMMARY.confirmedRevenue), icon: DollarSign, color: '#00c853', sub: `${FINANCIAL_SUMMARY.confirmedRevenue > 0 ? '+' : ''}23% vs last year` },
          { label: 'Pipeline Value', value: formatCurrency(FINANCIAL_SUMMARY.totalRevenue), icon: TrendingUp, color: '#ff9800', sub: 'All stages combined' },
          { label: 'College Shows', value: FINANCIAL_SUMMARY.collegeBookings, icon: GraduationCap, color: '#2196f3', sub: 'NACA + APCA circuit' },
          { label: 'Deposits Collected', value: formatCurrency(FINANCIAL_SUMMARY.depositsCollected), icon: Shield, color: '#7c3aed', sub: `${formatCurrency(FINANCIAL_SUMMARY.depositsOutstanding)} outstanding` },
          { label: 'Net Revenue', value: formatCurrency(FINANCIAL_SUMMARY.netRevenue), icon: Crown, color: '#e91e63', sub: 'After commissions' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 10, background: `${kpi.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <kpi.icon size={20} color={kpi.color} />
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: kpi.color }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Booking Pipeline Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="#6366f1" /> Pipeline Status
          </h3>
          {['confirmed', 'negotiating', 'pending', 'inquiry'].map(status => {
            const count = bookings.filter(b => b.status === status).length;
            const total = bookings.reduce((sum, b) => b.status === status ? sum + b.fee : sum, 0);
            const pct = (count / bookings.length) * 100;
            return (
              <div key={status} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#ccc', fontSize: 13, textTransform: 'capitalize' }}>{status}</span>
                  <span style={{ color: getStatusColor(status), fontSize: 13, fontWeight: 600 }}>{count} shows • {formatCurrency(total)}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: getStatusColor(status), borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="#ff9800" /> Upcoming Shows
          </h3>
          {bookings.filter(b => b.status === 'confirmed').sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5).map((booking, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {booking.type === 'College' ? '🎓' : booking.type === 'Club' ? '🎵' : '🎤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{booking.artist}</div>
                <div style={{ color: '#999', fontSize: 11 }}>{booking.venue} • {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div style={{ color: '#00c853', fontSize: 13, fontWeight: 700 }}>{formatCurrency(booking.fee)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Market */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
        <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PieChart size={18} color="#e91e63" /> Revenue by Market Segment
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { market: 'College Circuit', bookings: 28, revenue: 385000, color: '#2196f3', icon: '🎓', pct: 52 },
            { market: 'Club / Venue', bookings: 11, revenue: 198000, color: '#ff9800', icon: '🎵', pct: 27 },
            { market: 'Festivals', bookings: 5, revenue: 125000, color: '#e91e63', icon: '🎪', pct: 17 },
            { market: 'Corporate / Private', bookings: 3, revenue: 30000, color: '#7c3aed', icon: '🏢', pct: 4 },
          ].map((seg, i) => (
            <div key={i} style={{ background: `${seg.color}11`, border: `1px solid ${seg.color}33`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{seg.icon}</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{seg.market}</div>
              <div style={{ color: seg.color, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{formatCurrency(seg.revenue)}</div>
              <div style={{ color: '#999', fontSize: 11 }}>{seg.bookings} bookings • {seg.pct}% of total</div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: '100%', width: `${seg.pct}%`, background: seg.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══ ARTIST ROSTER TAB ═══
  const renderRoster = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🎤 GOAT Force Artist Roster</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={14} color="#999" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none', width: 150 }}
            />
          </div>
        </div>
      </div>

      {GOAT_ROSTER.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map((artist) => (
        <div key={artist.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.3s ease' }}
          onClick={() => setSelectedArtist(selectedArtist?.id === artist.id ? null : artist)}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
              {artist.image}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h4 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>{artist.name}</h4>
                <span style={{ background: `${getStatusColor(artist.availability)}22`, color: getStatusColor(artist.availability), padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                  {artist.availability}
                </span>
                <span style={{ background: 'rgba(255,215,0,0.15)', color: '#ffd700', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {artist.tier}
                </span>
              </div>
              <div style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>{artist.role} • {artist.genre}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ color: '#ccc', fontSize: 12 }}>⭐ {artist.rating}</span>
                <span style={{ color: '#ccc', fontSize: 12 }}>🎤 {artist.totalShows.toLocaleString()} shows</span>
                <span style={{ color: '#ccc', fontSize: 12 }}>📊 {artist.monthlyStreams} streams/mo</span>
                <span style={{ color: '#ccc', fontSize: 12 }}>🌍 {artist.territory}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>Booking Fee Range</div>
              <div style={{ color: '#00c853', fontSize: 18, fontWeight: 800 }}>{formatCurrency(artist.bookingFee.min)} – {formatCurrency(artist.bookingFee.max)}</div>
              <div style={{ color: '#2196f3', fontSize: 12, marginTop: 4 }}>College: {formatCurrency(artist.collegeFee.min)} – {formatCurrency(artist.collegeFee.max)}</div>
            </div>
          </div>

          {selectedArtist?.id === artist.id && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {/* Fee Structure */}
                <div style={{ background: 'rgba(0,200,83,0.08)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#00c853', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DollarSign size={16} /> Fee Structure
                  </h5>
                  {[
                    { type: 'Club / Venue', range: `${formatCurrency(artist.bookingFee.min)} – ${formatCurrency(artist.bookingFee.max)}` },
                    { type: 'College / University', range: `${formatCurrency(artist.collegeFee.min)} – ${formatCurrency(artist.collegeFee.max)}` },
                    { type: 'Festival', range: `${formatCurrency(artist.festivalFee.min)} – ${formatCurrency(artist.festivalFee.max)}` },
                    { type: 'Agent Commission', range: `${artist.agentCommission}%` },
                    { type: 'Manager Commission', range: `${artist.managerCommission}%` },
                  ].map((fee, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <span style={{ color: '#ccc', fontSize: 12 }}>{fee.type}</span>
                      <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{fee.range}</span>
                    </div>
                  ))}
                </div>

                {/* Top Hits */}
                <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#6366f1', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Music size={16} /> Top Hits
                  </h5>
                  {artist.topHits.map((hit, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                      <span style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, width: 20 }}>{i + 1}.</span>
                      <span style={{ color: '#fff', fontSize: 13 }}>{hit}</span>
                    </div>
                  ))}
                </div>

                {/* Rider Requirements */}
                <div style={{ background: 'rgba(255,152,0,0.08)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#ff9800', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={16} /> Rider Requirements
                  </h5>
                  {artist.riderRequirements.map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0' }}>
                      <CheckCircle size={12} color="#ff9800" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: '#ccc', fontSize: 12 }}>{req}</span>
                    </div>
                  ))}
                </div>

                {/* Markets */}
                <div style={{ background: 'rgba(233,30,99,0.08)', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ color: '#e91e63', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Globe size={16} /> Available Markets
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {artist.markets.map((market, i) => (
                      <span key={i} style={{ background: 'rgba(233,30,99,0.15)', color: '#e91e63', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {market}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveTab('inquiry'); setInquiryForm(prev => ({ ...prev, artist: artist.name })); }}
                      style={{ width: '100%', padding: '10px 16px', background: 'linear-gradient(135deg, #e91e63, #c2185b)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <Send size={14} /> Book This Artist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ═══ BOOKING PIPELINE TAB ═══
  const renderBookings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>📋 Booking Pipeline</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'confirmed', 'negotiating', 'pending', 'inquiry'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)}
              style={{ padding: '6px 14px', borderRadius: 20, border: filterStatus === status ? 'none' : '1px solid rgba(255,255,255,0.15)', background: filterStatus === status ? getStatusColor(status === 'all' ? 'confirmed' : status) : 'transparent', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {['Artist', 'Venue', 'Type', 'Date', 'Fee', 'Status', 'Actions'].map(h => (
            <div key={h} style={{ color: '#999', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
          ))}
        </div>
        {bookings.filter(b => filterStatus === 'all' || b.status === filterStatus).map((booking, i) => (
          <div key={booking.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{booking.artist}</div>
            <div style={{ color: '#ccc', fontSize: 13 }}>{booking.venue}</div>
            <div>
              <span style={{ background: booking.type === 'College' ? 'rgba(33,150,243,0.15)' : booking.type === 'Club' ? 'rgba(255,152,0,0.15)' : booking.type === 'Festival' ? 'rgba(233,30,99,0.15)' : 'rgba(124,58,237,0.15)', color: booking.type === 'College' ? '#2196f3' : booking.type === 'Club' ? '#ff9800' : booking.type === 'Festival' ? '#e91e63' : '#7c3aed', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                {booking.type}
              </span>
            </div>
            <div style={{ color: '#ccc', fontSize: 12 }}>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div style={{ color: '#00c853', fontSize: 13, fontWeight: 700 }}>{formatCurrency(booking.fee)}</div>
            <div>
              <span style={{ background: `${getStatusColor(booking.status)}22`, color: getStatusColor(booking.status), padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                {booking.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(99,102,241,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={12} color="#6366f1" />
              </button>
              {booking.status !== 'confirmed' && (
                <button onClick={() => {
                  setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'confirmed' } : b));
                  showNotification(`${booking.artist} at ${booking.venue} confirmed!`);
                }} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,200,83,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={12} color="#00c853" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Detail Panel */}
      {selectedBooking && (
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>📋 Booking Details: {selectedBooking.artist}</h4>
            <button onClick={() => setSelectedBooking(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Venue', value: selectedBooking.venue, icon: Building2 },
              { label: 'Event Type', value: selectedBooking.type, icon: Tag },
              { label: 'Date', value: new Date(selectedBooking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }), icon: Calendar },
              { label: 'Performance Fee', value: formatCurrency(selectedBooking.fee), icon: DollarSign },
              { label: 'Deposit Required', value: formatCurrency(selectedBooking.deposit), icon: Shield },
              { label: 'Deposit Paid', value: selectedBooking.depositPaid ? '✅ Yes' : '❌ No', icon: CheckCircle },
              { label: 'Contract Signed', value: selectedBooking.contractSigned ? '✅ Yes' : '❌ Pending', icon: FileText },
              { label: 'Rider Approved', value: selectedBooking.riderApproved ? '✅ Yes' : '❌ Pending', icon: FileText },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
                <div style={{ color: '#999', fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <item.icon size={12} /> {item.label}
                </div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Generate Contract
            </button>
            <button style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={14} /> Send Invoice
            </button>
            <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ═══ COLLEGE CIRCUIT TAB ═══
  const renderColleges = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🎓 College Booking Circuit</h3>
        <div style={{ color: '#999', fontSize: 13 }}>NACA + APCA Network • {COLLEGE_DATABASE.length} Schools</div>
      </div>

      {/* College Market Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Active Schools', value: COLLEGE_DATABASE.length, color: '#2196f3', icon: '🏫' },
          { label: 'Total Budget Pool', value: formatCurrency(COLLEGE_DATABASE.reduce((s, c) => s + c.budget, 0)), color: '#00c853', icon: '💰' },
          { label: 'Avg School Budget', value: formatCurrency(Math.round(COLLEGE_DATABASE.reduce((s, c) => s + c.budget, 0) / COLLEGE_DATABASE.length)), color: '#ff9800', icon: '📊' },
          { label: 'Total Enrollment', value: `${(COLLEGE_DATABASE.reduce((s, c) => s + c.enrollment, 0) / 1000).toFixed(0)}K+`, color: '#e91e63', icon: '👥' },
          { label: 'NACA Regions', value: '7 + National', color: '#7c3aed', icon: '🗺️' },
          { label: 'Shows Booked', value: FINANCIAL_SUMMARY.collegeBookings, color: '#6366f1', icon: '🎤' },
        ].map((stat, i) => (
          <div key={i} style={{ background: `${stat.color}11`, border: `1px solid ${stat.color}33`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontSize: 18, fontWeight: 800 }}>{stat.value}</div>
            <div style={{ color: '#999', fontSize: 11 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* How College Booking Works */}
      <div style={{ background: 'linear-gradient(135deg, rgba(33,150,243,0.1), rgba(33,150,243,0.03))', border: '1px solid rgba(33,150,243,0.2)', borderRadius: 16, padding: 20 }}>
        <h4 style={{ color: '#2196f3', fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={16} /> How College Booking Works (NACA/APCA)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { step: '1', title: 'Conference Submission', desc: 'Submit showcase application with 3-min video, bio, pricing, and marketing materials to NACA/APCA regional conferences', icon: '📝' },
            { step: '2', title: 'Showcase Performance', desc: '15 minutes on stage (NACA) or 10 minutes (APCA) in front of college buyers with budgets and calendars ready', icon: '🎤' },
            { step: '3', title: 'Exhibit Hall Booth', desc: 'Meet college programmers at your booth — they fill out booking slips if interested in your showcase performance', icon: '🏪' },
            { step: '4', title: 'Block Booking Auction', desc: 'Morning sessions where schools raise paddles — 3+ schools triggers on-site tour routing and booking', icon: '🔨' },
            { step: '5', title: 'Contract & Deposit', desc: 'Execute performance agreements with 50% deposit, W-9, rider approval, and institutional purchase orders', icon: '📋' },
            { step: '6', title: 'Campus Performance', desc: 'Perform on campus following school guidelines — student-only events, specific rules, check payment after show', icon: '🎓' },
          ].map((step, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2196f3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{step.step}</div>
                <span style={{ fontSize: 20 }}>{step.icon}</span>
              </div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{step.title}</div>
              <div style={{ color: '#999', fontSize: 11, lineHeight: 1.5 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* School Database */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 1fr', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {['School', 'City', 'Enrollment', 'Budget', 'Conference', 'Rating'].map(h => (
            <div key={h} style={{ color: '#999', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
          ))}
        </div>
        {COLLEGE_DATABASE.map((school, i) => (
          <div key={school.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{school.name}</div>
              <div style={{ color: '#999', fontSize: 11 }}>{school.contactTitle}</div>
            </div>
            <div style={{ color: '#ccc', fontSize: 12 }}>{school.city}</div>
            <div style={{ color: '#ccc', fontSize: 12 }}>{school.enrollment.toLocaleString()}</div>
            <div style={{ color: '#00c853', fontSize: 13, fontWeight: 700 }}>{formatCurrency(school.budget)}</div>
            <div>
              <span style={{ background: 'rgba(33,150,243,0.15)', color: '#2196f3', padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600 }}>
                {school.conference}
              </span>
            </div>
            <div style={{ color: '#ffd700', fontSize: 12 }}>⭐ {school.rating}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ VENUES TAB ═══
  const renderVenues = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🏟️ Venue Database</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {VENUE_DATABASE.map((venue) => (
          <div key={venue.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>{venue.name}</h4>
                <div style={{ color: '#999', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <MapPin size={12} /> {venue.city}
                </div>
              </div>
              <span style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                {venue.type}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ color: '#999', fontSize: 10, marginBottom: 2 }}>Capacity</div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{venue.capacity.toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ color: '#999', fontSize: 10, marginBottom: 2 }}>Avg Ticket</div>
                <div style={{ color: '#00c853', fontSize: 16, fontWeight: 800 }}>${venue.avgTicketPrice}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ color: '#999', fontSize: 10, marginBottom: 2 }}>Rating</div>
                <div style={{ color: '#ffd700', fontSize: 16, fontWeight: 800 }}>⭐ {venue.rating}</div>
              </div>
            </div>
            <button
              onClick={() => { setActiveTab('inquiry'); setInquiryForm(prev => ({ ...prev, venue: venue.name })); }}
              style={{ width: '100%', marginTop: 12, padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Book This Venue
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ CONTRACTS TAB ═══
  const renderContracts = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>📄 Contract Templates & Management</h3>

      {/* Contract Key Terms */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.03))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 16, padding: 20 }}>
        <h4 style={{ color: '#7c3aed', fontSize: 15, marginBottom: 16 }}>📋 15 Essential Contract Clauses (Industry Standard)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            'Scope of Agreement', 'Duties of the Agent', 'Rights of the Agent',
            'Compensation & Commission', 'Expense Reimbursement', 'Duration & Term',
            'Authority & Representation', 'Definitions', 'Independent Activities',
            'Exclusivity Clause', 'Assignment Rights', 'Breach & Cure',
            'Legal Representation', 'Notices & Payments', 'Jurisdiction & Governing Law'
          ].map((clause, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <span style={{ color: '#ccc', fontSize: 12 }}>{clause}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Templates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {CONTRACT_TEMPLATES.map((template) => (
          <div key={template.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>
              {template.id === 'standard' ? '📝' : template.id === 'college' ? '🎓' : template.id === 'festival' ? '🎪' : template.id === 'corporate' ? '🏢' : template.id === 'rider' ? '🎤' : '🤝'}
            </div>
            <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{template.name}</h4>
            <p style={{ color: '#999', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{template.desc}</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <span style={{ color: '#6366f1', fontSize: 11 }}>{template.sections} sections</span>
              <span style={{ color: '#999', fontSize: 11 }}>•</span>
              <span style={{ color: '#6366f1', fontSize: 11 }}>{template.pages} pages</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px 12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <FileText size={12} /> Generate
              </button>
              <button style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Download size={12} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Commission Structure */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
        <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarSign size={16} color="#00c853" /> Industry Commission Structure
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { role: 'Booking Agent', rate: '5-10%', desc: 'Commission on live performance fees only. Not entitled to record sales, songwriting, or publishing royalties.', color: '#2196f3' },
            { role: 'Manager', rate: '15-20%', desc: 'Commission on all artist income including performances, endorsements, and appearances.', color: '#ff9800' },
            { role: 'Promoter', rate: 'Negotiated', desc: 'Typically handles venue costs, marketing, and takes percentage of ticket sales after expenses.', color: '#e91e63' },
            { role: 'GOAT Force Cut', rate: '10%', desc: 'Label/company commission on all bookings facilitated through GOAT Force Entertainment network.', color: '#7c3aed' },
          ].map((item, i) => (
            <div key={i} style={{ background: `${item.color}11`, border: `1px solid ${item.color}33`, borderRadius: 12, padding: 16 }}>
              <div style={{ color: item.color, fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{item.rate}</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{item.role}</div>
              <div style={{ color: '#999', fontSize: 11, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══ CONFERENCES TAB ═══
  const renderConferences = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🌐 NACA & APCA Conference Schedule</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: 'rgba(0,200,83,0.15)', color: '#00c853', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>● Open for Submission</span>
          <span style={{ background: 'rgba(33,150,243,0.15)', color: '#2196f3', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>● Upcoming</span>
        </div>
      </div>

      {/* NACA vs APCA Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(33,150,243,0.1), rgba(33,150,243,0.03))', border: '1px solid rgba(33,150,243,0.2)', borderRadius: 16, padding: 20 }}>
          <h4 style={{ color: '#2196f3', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>NACA</h4>
          <div style={{ color: '#999', fontSize: 12, marginBottom: 12 }}>National Association for Campus Activities</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Non-profit organization',
              '7 regional + 1 national conference',
              '600-700 submissions per large conference',
              '~30 showcase slots selected',
              'Student/advisor selection committee',
              '15-minute showcase performance',
              'Block booking auction system',
              'Diverse lineup requirement',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={12} color="#2196f3" />
                <span style={{ color: '#ccc', fontSize: 12 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,152,0,0.03))', border: '1px solid rgba(255,152,0,0.2)', borderRadius: 16, padding: 20 }}>
          <h4 style={{ color: '#ff9800', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>APCA</h4>
          <div style={{ color: '#999', fontSize: 12, marginBottom: 12 }}>Association for the Promotion of Campus Activities</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Privately owned organization',
              '4 regional + 1 national conference',
              '350-500 submissions per conference',
              '~35-45 showcase slots',
              'Staff-selected (owner decision)',
              '10-minute showcase performance',
              'Priority for returning members',
              'Higher fees, faster acceptance',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={12} color="#ff9800" />
                <span style={{ color: '#ccc', fontSize: 12 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conference Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {CONFERENCE_SCHEDULE.map((conf) => (
          <div key={conf.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${getStatusColor(conf.status)}33`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{conf.name}</h4>
                <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{conf.region} Region</div>
              </div>
              <span style={{ background: `${getStatusColor(conf.status)}22`, color: getStatusColor(conf.status), padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                {conf.status}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Date', value: conf.date },
                { label: 'Location', value: conf.location },
                { label: 'Submissions', value: `~${conf.submissions}` },
                { label: 'Slots', value: conf.slots },
                { label: 'Deadline', value: conf.deadline },
                { label: 'Booth Fee', value: formatCurrency(conf.fee) },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ color: '#ccc', fontSize: 12, fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', padding: '8px 16px', background: conf.status === 'open' ? 'linear-gradient(135deg, #00c853, #009624)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {conf.status === 'open' ? '📝 Submit Application' : '🔔 Set Reminder'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ FINANCIALS TAB ═══
  const renderFinancials = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>💰 Financial Overview</h3>

      {/* Revenue Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Gross Revenue', value: formatCurrency(FINANCIAL_SUMMARY.totalRevenue), color: '#6366f1', icon: TrendingUp },
          { label: 'Confirmed', value: formatCurrency(FINANCIAL_SUMMARY.confirmedRevenue), color: '#00c853', icon: CheckCircle },
          { label: 'Pending', value: formatCurrency(FINANCIAL_SUMMARY.pendingRevenue), color: '#ff9800', icon: Clock },
          { label: 'Pipeline', value: formatCurrency(FINANCIAL_SUMMARY.pipelineRevenue), color: '#2196f3', icon: Target },
          { label: 'Agent Commissions', value: formatCurrency(FINANCIAL_SUMMARY.agentCommissions), color: '#f44336', icon: Users },
          { label: 'Net Revenue', value: formatCurrency(FINANCIAL_SUMMARY.netRevenue), color: '#00c853', icon: Crown },
        ].map((item, i) => (
          <div key={i} style={{ background: `${item.color}11`, border: `1px solid ${item.color}33`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <item.icon size={18} color={item.color} />
              <span style={{ color: '#999', fontSize: 12 }}>{item.label}</span>
            </div>
            <div style={{ color: item.color, fontSize: 28, fontWeight: 900 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Artist Revenue Breakdown */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
        <h4 style={{ color: '#fff', fontSize: 15, marginBottom: 16 }}>Revenue by Artist</h4>
        {GOAT_ROSTER.map((artist) => {
          const artistBookings = bookings.filter(b => b.artist.includes(artist.name.split(' ')[0]));
          const artistRevenue = artistBookings.reduce((sum, b) => sum + b.fee, 0);
          const pct = FINANCIAL_SUMMARY.totalRevenue > 0 ? (artistRevenue / FINANCIAL_SUMMARY.totalRevenue) * 100 : 0;
          return (
            <div key={artist.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{artist.image}</span>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{artist.name}</span>
                  <span style={{ color: '#999', fontSize: 12 }}>{artistBookings.length} bookings</span>
                </div>
                <span style={{ color: '#00c853', fontSize: 16, fontWeight: 800 }}>{formatCurrency(artistRevenue)}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${Math.min(pct * 2, 100)}%`, background: 'linear-gradient(90deg, #6366f1, #00c853)', borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Terms */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.08), rgba(0,200,83,0.02))', border: '1px solid rgba(0,200,83,0.2)', borderRadius: 16, padding: 20 }}>
        <h4 style={{ color: '#00c853', fontSize: 15, marginBottom: 16 }}>💳 Standard Payment Terms</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {[
            { term: '50% Deposit', desc: 'Due upon contract execution to secure the date. Non-refundable within 30 days of event.', icon: '💰' },
            { term: 'Balance Due', desc: 'Remaining 50% due on day of performance, before artist takes the stage.', icon: '📅' },
            { term: 'Payment Method', desc: 'Wire transfer, certified check, or ACH. College/university purchase orders accepted.', icon: '🏦' },
            { term: 'Cancellation', desc: '60+ days: full refund minus 10%. 30-60 days: 50% refund. Under 30 days: no refund.', icon: '⚠️' },
            { term: 'Travel & Lodging', desc: 'Buyer responsible for round-trip airfare (first class for A-list), hotel suite, and ground transportation.', icon: '✈️' },
            { term: 'Technical Rider', desc: 'Buyer must provide sound, lighting, and staging per technical rider specifications at buyer expense.', icon: '🎤' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{item.term}</span>
              </div>
              <div style={{ color: '#999', fontSize: 11, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══ BOOK NOW / INQUIRY TAB ═══
  const renderInquiry = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🎤 Book GOAT Force Entertainment</h3>
      <div style={{ color: '#999', fontSize: 13, lineHeight: 1.6, maxWidth: 700 }}>
        Submit a booking inquiry for any GOAT Force artist. Our booking team will respond within 24 hours with availability, pricing, and contract details. For college bookings, we work directly with NACA/APCA conference networks.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Inquiry Form */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24 }}>
          <h4 style={{ color: '#fff', fontSize: 16, marginBottom: 20 }}>📝 Booking Inquiry Form</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'Your Name', type: 'text', placeholder: 'Full name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              { key: 'phone', label: 'Phone', type: 'tel', placeholder: '(555) 123-4567' },
              { key: 'organization', label: 'Organization / Venue', type: 'text', placeholder: 'Company, school, or venue name' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ color: '#999', fontSize: 12, marginBottom: 4, display: 'block' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={inquiryForm[field.key]}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div>
              <label style={{ color: '#999', fontSize: 12, marginBottom: 4, display: 'block' }}>Event Type</label>
              <select
                value={inquiryForm.eventType}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, eventType: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}
              >
                <option value="college" style={{ background: '#1a1a2e' }}>College / University</option>
                <option value="club" style={{ background: '#1a1a2e' }}>Club / Venue</option>
                <option value="festival" style={{ background: '#1a1a2e' }}>Festival</option>
                <option value="corporate" style={{ background: '#1a1a2e' }}>Corporate Event</option>
                <option value="private" style={{ background: '#1a1a2e' }}>Private Party</option>
                <option value="military" style={{ background: '#1a1a2e' }}>Military Base</option>
                <option value="radio" style={{ background: '#1a1a2e' }}>Radio / TV Appearance</option>
              </select>
            </div>

            <div>
              <label style={{ color: '#999', fontSize: 12, marginBottom: 4, display: 'block' }}>Artist Requested</label>
              <select
                value={inquiryForm.artist}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, artist: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}
              >
                <option value="" style={{ background: '#1a1a2e' }}>Select an artist...</option>
                {GOAT_ROSTER.map(a => (
                  <option key={a.id} value={a.name} style={{ background: '#1a1a2e' }}>{a.name} — {a.tier}</option>
                ))}
                <option value="multiple" style={{ background: '#1a1a2e' }}>Multiple Artists / Full Show</option>
              </select>
            </div>

            {[
              { key: 'date', label: 'Preferred Date', type: 'date', placeholder: '' },
              { key: 'venue', label: 'Venue / Location', type: 'text', placeholder: 'Venue name and city' },
              { key: 'budget', label: 'Budget Range', type: 'text', placeholder: 'e.g. $15,000 - $25,000' },
              { key: 'attendees', label: 'Expected Attendance', type: 'text', placeholder: 'e.g. 2,000' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ color: '#999', fontSize: 12, marginBottom: 4, display: 'block' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={inquiryForm[field.key]}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div>
              <label style={{ color: '#999', fontSize: 12, marginBottom: 4, display: 'block' }}>Additional Details</label>
              <textarea
                placeholder="Tell us about your event, special requirements, or questions..."
                value={inquiryForm.details}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, details: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={() => showNotification('Booking inquiry submitted! Our team will respond within 24 hours.')}
              style={{ width: '100%', padding: '14px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}
            >
              <Send size={18} /> Submit Booking Inquiry
            </button>
          </div>
        </div>

        {/* Booking Process Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.03))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: '#6366f1', fontSize: 15, marginBottom: 16 }}>🎯 The Booking Process</h4>
            {[
              { step: '1', title: 'Submit Inquiry', desc: 'Fill out the booking form with your event details and budget', time: 'Day 1' },
              { step: '2', title: 'Agent Review', desc: 'Your dedicated GOAT Force booking agent reviews and contacts you', time: 'Within 24hrs' },
              { step: '3', title: 'Artist Recommendations', desc: 'Receive a custom proposal with pricing, availability, and options', time: 'Day 2-3' },
              { step: '4', title: 'Negotiation', desc: 'Finalize terms, fee, rider requirements, and special requests', time: 'Day 3-7' },
              { step: '5', title: 'Contract & Deposit', desc: 'Sign performance agreement and submit 50% deposit to confirm', time: 'Day 7-10' },
              { step: '6', title: 'Pre-Event Logistics', desc: 'Coordinate travel, technical rider, hospitality, and security', time: '2 weeks before' },
              { step: '7', title: 'Show Day', desc: 'Artist arrives, soundcheck, performance, and final payment', time: 'Event day' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{step.step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{step.title}</span>
                    <span style={{ color: '#6366f1', fontSize: 10, fontWeight: 600 }}>{step.time}</span>
                  </div>
                  <div style={{ color: '#999', fontSize: 11, marginTop: 2 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: '#ffd700', fontSize: 15, marginBottom: 12 }}>👑 Why Book GOAT Force?</h4>
            {[
              'Direct access to Waka Flocka Flame & DJ Speedy',
              'Competitive pricing for college & university events',
              'Full production support & technical coordination',
              'NACA/APCA conference representation',
              'Flexible payment terms for institutions',
              'Professional contracts & rider management',
              'Dedicated booking agent for your event',
              'BrickSquad / GOAT Force brand power',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <Star size={12} color="#ffd700" />
                <span style={{ color: '#ccc', fontSize: 12 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ═══ RENDER TAB CONTENT ═══
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'roster': return renderRoster();
      case 'bookings': return renderBookings();
      case 'colleges': return renderColleges();
      case 'venues': return renderVenues();
      case 'contracts': return renderContracts();
      case 'conferences': return renderConferences();
      case 'financials': return renderFinancials();
      case 'inquiry': return renderInquiry();
      default: return renderDashboard();
    }
  };

  // ═══ MAIN RENDER ═══
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d0d1f 100%)', color: '#fff' }}>
      {/* Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '14px 24px', borderRadius: 12, background: notification.type === 'success' ? 'linear-gradient(135deg, #00c853, #009624)' : 'linear-gradient(135deg, #f44336, #c62828)', color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 8, animation: 'slideIn 0.3s ease' }}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎤 Concert Booking System
              </h1>
              <p style={{ color: '#999', fontSize: 13, margin: '4px 0 0' }}>
                GOAT Force Entertainment • CEO: DJ Speedy • President: Waka Flocka Flame • BrickSquad
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: 'rgba(0,200,83,0.15)', color: '#00c853', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00c853' }} />
                Booking System Active
              </div>
              <button
                onClick={() => { setActiveTab('inquiry'); }}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #e91e63, #c2185b)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Mic size={16} /> Book an Artist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 18px',
                background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                color: activeTab === tab.id ? '#fff' : '#999',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ color: '#666', fontSize: 11 }}>
          © 2025 GOAT Force Entertainment / Life Imitates Art Inc • Concert Booking System v1.0 • CEO: Harvey Miller (DJ Speedy) • President: Waka Flocka Flame
        </div>
      </div>
    </div>
  );
}