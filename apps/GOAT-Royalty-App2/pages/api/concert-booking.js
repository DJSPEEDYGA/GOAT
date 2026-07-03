/**
 * 🎤 Concert Booking API — GOAT Force Entertainment
 * Handles booking inquiries, roster data, venue info, and pipeline management
 */

export default function handler(req, res) {
  const { action } = req.query;

  // ═══ ARTIST ROSTER ═══
  if (action === 'roster') {
    return res.status(200).json({
      success: true,
      roster: [
        {
          id: 'waka-flocka',
          name: 'Waka Flocka Flame',
          role: 'President / Headliner',
          genre: 'Hip-Hop / Trap',
          tier: 'A-List',
          bookingFee: { min: 25000, max: 75000 },
          collegeFee: { min: 15000, max: 45000 },
          festivalFee: { min: 35000, max: 100000 },
          availability: 'available',
          markets: ['Clubs', 'Festivals', 'Colleges', 'Corporate', 'Private Events'],
          territory: 'Worldwide',
          totalShows: 2847,
          monthlyStreams: '45M+',
          rating: 4.9,
        },
        {
          id: 'dj-speedy',
          name: 'DJ Speedy',
          role: 'CEO / DJ / Producer',
          genre: 'Hip-Hop / EDM / Multi-Genre',
          tier: 'A-List',
          bookingFee: { min: 10000, max: 35000 },
          collegeFee: { min: 8000, max: 25000 },
          festivalFee: { min: 15000, max: 50000 },
          availability: 'available',
          markets: ['Clubs', 'Festivals', 'Colleges', 'Corporate', 'Private Events', 'Radio'],
          territory: 'Worldwide',
          totalShows: 3200,
          monthlyStreams: '12M+',
          rating: 4.8,
        },
        {
          id: 'baby-goat',
          name: 'Baby GOAT',
          role: 'Artist / Performer',
          genre: 'Hip-Hop / R&B',
          tier: 'Rising Star',
          bookingFee: { min: 5000, max: 15000 },
          collegeFee: { min: 3000, max: 10000 },
          festivalFee: { min: 8000, max: 25000 },
          availability: 'available',
          markets: ['Clubs', 'Colleges', 'Festivals', 'Private Events'],
          territory: 'United States',
          totalShows: 450,
          monthlyStreams: '3.5M+',
          rating: 4.7,
        },
        {
          id: 'the-goat',
          name: 'The GOAT',
          role: 'Legacy Artist',
          genre: 'Hip-Hop / Southern Rap',
          tier: 'Legend',
          bookingFee: { min: 15000, max: 50000 },
          collegeFee: { min: 10000, max: 30000 },
          festivalFee: { min: 25000, max: 75000 },
          availability: 'limited',
          markets: ['Festivals', 'Corporate', 'Private Events', 'Special Appearances'],
          territory: 'United States',
          totalShows: 1850,
          monthlyStreams: '8M+',
          rating: 4.9,
        },
      ],
      company: {
        name: 'GOAT Force Entertainment',
        ceo: 'DJ Speedy (Harvey Miller)',
        president: 'Waka Flocka Flame',
        entity: 'Life Imitates Art Inc',
        bookingEmail: 'bookings@goatforce.com',
        bookingPhone: '(404) 555-GOAT',
      },
    });
  }

  // ═══ BOOKING PIPELINE ═══
  if (action === 'pipeline') {
    return res.status(200).json({
      success: true,
      pipeline: {
        totalBookings: 47,
        confirmed: 22,
        negotiating: 8,
        pending: 10,
        inquiry: 7,
        confirmedRevenue: 385000,
        pendingRevenue: 218000,
        pipelineRevenue: 135000,
        totalRevenue: 738000,
      },
      upcomingShows: [
        { artist: 'DJ Speedy', venue: 'Georgia State University', date: '2025-09-20', fee: 15000, status: 'confirmed' },
        { artist: 'Waka Flocka Flame', venue: 'Howard University', date: '2025-10-18', fee: 35000, status: 'confirmed' },
        { artist: 'Baby GOAT', venue: 'Morehouse College', date: '2025-10-25', fee: 8000, status: 'confirmed' },
        { artist: 'Baby GOAT', venue: 'Clark Atlanta University', date: '2025-11-01', fee: 6000, status: 'confirmed' },
        { artist: 'Waka Flocka Flame', venue: 'UCLA', date: '2025-11-08', fee: 40000, status: 'negotiating' },
      ],
    });
  }

  // ═══ COLLEGE CIRCUIT ═══
  if (action === 'colleges') {
    return res.status(200).json({
      success: true,
      collegeNetwork: {
        totalSchools: 12,
        nacaRegions: 7,
        totalBudgetPool: 1415000,
        avgBudget: 117917,
        totalEnrollment: 308300,
        collegeBookings: 28,
      },
      conferences: [
        { name: 'NACA South', date: 'October 2025', location: 'Nashville, TN', status: 'open' },
        { name: 'NACA Northeast', date: 'November 2025', location: 'Hartford, CT', status: 'open' },
        { name: 'NACA National', date: 'February 2026', location: 'Atlanta, GA', status: 'upcoming' },
        { name: 'APCA National', date: 'April 2026', location: 'Orlando, FL', status: 'upcoming' },
      ],
    });
  }

  // ═══ VENUES ═══
  if (action === 'venues') {
    return res.status(200).json({
      success: true,
      venues: [
        { name: 'State Farm Arena', city: 'Atlanta, GA', capacity: 21000, type: 'Arena' },
        { name: 'The Tabernacle', city: 'Atlanta, GA', capacity: 2600, type: 'Concert Hall' },
        { name: 'Madison Square Garden', city: 'New York, NY', capacity: 20789, type: 'Arena' },
        { name: 'Red Rocks Amphitheatre', city: 'Morrison, CO', capacity: 9525, type: 'Amphitheatre' },
        { name: 'House of Blues', city: 'Chicago, IL', capacity: 1800, type: 'Concert Hall' },
        { name: 'The Fillmore', city: 'San Francisco, CA', capacity: 1315, type: 'Concert Hall' },
      ],
    });
  }

  // ═══ SUBMIT INQUIRY ═══
  if (action === 'submit-inquiry' && req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    return res.status(200).json({
      success: true,
      message: 'Booking inquiry received! Our team will respond within 24 hours.',
      inquiryId: `GOAT-BK-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      data: body,
    });
  }

  // ═══ COMMISSION STRUCTURE ═══
  if (action === 'commissions') {
    return res.status(200).json({
      success: true,
      commissions: {
        bookingAgent: { rate: '5-10%', scope: 'Live performance fees only' },
        manager: { rate: '15-20%', scope: 'All artist income' },
        goatForceCut: { rate: '10%', scope: 'All bookings through GOAT Force network' },
        promoter: { rate: 'Negotiated', scope: 'Ticket sales after expenses' },
      },
      paymentTerms: {
        deposit: '50% upon contract execution',
        balance: '50% on day of performance',
        methods: ['Wire transfer', 'Certified check', 'ACH', 'Purchase order (colleges)'],
        cancellation: {
          '60+ days': 'Full refund minus 10%',
          '30-60 days': '50% refund',
          'Under 30 days': 'No refund',
        },
      },
    });
  }

  // ═══ DEFAULT ═══
  return res.status(200).json({
    success: true,
    service: 'GOAT Force Concert Booking System',
    version: '1.0.0',
    company: 'GOAT Force Entertainment / Life Imitates Art Inc',
    ceo: 'DJ Speedy (Harvey Miller)',
    president: 'Waka Flocka Flame',
    endpoints: [
      '/api/concert-booking?action=roster',
      '/api/concert-booking?action=pipeline',
      '/api/concert-booking?action=colleges',
      '/api/concert-booking?action=venues',
      '/api/concert-booking?action=commissions',
      '/api/concert-booking?action=submit-inquiry (POST)',
    ],
    features: [
      'Artist roster with fee structures',
      'Booking pipeline management',
      'College circuit (NACA/APCA)',
      'Venue database',
      'Contract templates',
      'Commission tracking',
      'Inquiry submission',
    ],
  });
}