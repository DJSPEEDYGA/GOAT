/**
 * 🐐 GOAT BOOKING AGENCY
 * Ultimate Talent Booking System - Book Shows for Artists
 * 
 * Original GOAT Technology - Professional, Efficient, Beautiful
 */

const EventEmitter = require('events');

class GOATBookingAgency extends EventEmitter {
  constructor() {
    super();
    this.artists = new Map();
    this.venues = new Map();
    this.events = new Map();
    this.bookings = new Map();
    this.contracts = new Map();
    this.calendar = new Map();
    
    this.initializeCore();
  }

  initializeCore() {
    // Booking Engine
    this.engine = {
      currency: 'USD',
      taxRate: 0.15, // 15% booking fee
      commissionRate: 0.20, // 20% agency commission
      insurance: true,
      escrow: true,
      paymentTerms: ['net30', 'net15', 'upon signing']
    };

    // Event Types
    this.eventTypes = {
      CONCERT: 'concert',
      FESTIVAL: 'festival',
      CLUB_SHOW: 'club_show',
      PRIVATE_EVENT: 'private_event',
      CORPORATE_EVENT: 'corporate_event',
      WEDDING: 'wedding',
      BIRTHDAY: 'birthday',
      TOUR: 'tour',
      RESIDENCY: 'residency',
      POPUP: 'popup'
    };

    // Booking Status
    this.bookingStatus = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      NO_SHOW: 'no_show'
    };

    this.emit('booking-agency-initialized');
  }

  // ============================================================
  // 🎤 ARTIST MANAGEMENT
  // ============================================================

  createArtist(config = {}) {
    const artist = {
      id: `artist-${Date.now()}`,
      name: config.name || 'Unknown Artist',
      genre: config.genre || [],
      subGenre: config.subGenre || [],
      location: config.location || {},
      
      // Contact
      email: config.email || '',
      phone: config.phone || '',
      manager: config.manager || '',
      agent: config.agent || '',
      
      // Pricing
      minPrice: config.minPrice || 0,
      maxPrice: config.maxPrice || 0,
      standardPrice: config.standardPrice || 0,
      price negotiable: config.priceNegotiable || false,
      
      // Availability
      availability: config.availability || [],
      blackoutDates: config.blackoutDates || [],
      
      // Performance
      duration: config.duration || 60, // minutes
      setupTime: config.setupTime || 30,
      requirements: config.requirements || [],
      rider: config.rider || {},
      
      // Stats
      rating: config.rating || 5.0,
      totalShows: config.totalShows || 0,
      totalRevenue: config.totalRevenue || 0,
      
      // Media
      bio: config.bio || '',
      photos: config.photos || [],
      videos: config.videos || [],
      socialMedia: config.socialMedia || {},
      
      // Status
      verified: config.verified || false,
      featured: config.featured || false,
      active: config.active || true,
      
      createdAt: new Date().toISOString()
    };

    this.artists.set(artist.id, artist);
    this.emit('artist-created', artist);
    return artist;
  }

  updateArtist(artistId, updates) {
    const artist = this.artists.get(artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }

    Object.assign(artist, updates);
    this.emit('artist-updated', artist);
    return artist;
  }

  // ============================================================
  // 🏢 VENUE MANAGEMENT
  // ============================================================

  createVenue(config = {}) {
    const venue = {
      id: `venue-${Date.now()}`,
      name: config.name || 'Unknown Venue',
      type: config.type || 'club', // club, arena, stadium, theater, outdoor
      
      // Location
      address: config.address || '',
      city: config.city || '',
      state: config.state || '',
      country: config.country || '',
      zipCode: config.zipCode || '',
      coordinates: config.coordinates || {},
      
      // Capacity
      capacity: config.capacity || 500,
      standing: config.standing || 0,
      seated: config.seated || 0,
      vip: config.vip || 0,
      
      // Technical
      paSystem: config.paSystem || {},
      lighting: config.lighting || {},
      stageSize: config.stageSize || {},
      backline: config.backline || {},
      dressingRooms: config.dressingRooms || 0,
      
      // Contact
      booker: config.booker || '',
      email: config.email || '',
      phone: config.phone || '',
      
      // Pricing
      rentalFee: config.rentalFee || 0,
      deposit: config.deposit || 0,
      
      // Stats
      rating: config.rating || 5.0,
      totalEvents: config.totalEvents || 0,
      
      // Media
      photos: config.photos || [],
      description: config.description || '',
      amenities: config.amenities || [],
      
      // Status
      verified: config.verified || false,
      featured: config.featured || false,
      active: config.active || true,
      
      createdAt: new Date().toISOString()
    };

    this.venues.set(venue.id, venue);
    this.emit('venue-created', venue);
    return venue;
  }

  // ============================================================
  // 📅 BOOKING MANAGEMENT
  // ============================================================

  createBooking(config = {}) {
    const artist = this.artists.get(config.artistId);
    const venue = this.venues.get(config.venueId);
    
    if (!artist || !venue) {
      throw new Error('Artist or Venue not found');
    }

    const booking = {
      id: `booking-${Date.now()}`,
      
      // Parties
      artistId: config.artistId,
      venueId: config.venueId,
      bookerId: config.bookerId || null,
      
      // Event Details
      eventType: config.eventType || this.eventTypes.CLUB_SHOW,
      eventName: config.eventName || `${artist.name} at ${venue.name}`,
      date: config.date || null,
      startTime: config.startTime || '20:00',
      endTime: config.endTime || '23:00',
      loadIn: config.loadIn || '16:00',
      soundCheck: config.soundCheck || '18:00',
      doors: config.doors || '19:00',
      
      // Financials
      artistFee: config.artistFee || artist.standardPrice,
      venueFee: config.venueFee || venue.rentalFee,
      totalAmount: 0,
      agencyFee: 0,
      tax: 0,
      netToArtist: 0,
      
      // Payment
      paymentTerms: config.paymentTerms || 'net30',
      depositRequired: config.depositRequired || true,
      depositAmount: 0,
      depositPaid: false,
      balancePaid: false,
      
      // Technical
      technicalRider: config.technicalRider || artist.requirements,
      hospitalityRider: config.hospitalityRider || artist.rider,
      
      // Status
      status: this.bookingStatus.PENDING,
      notes: config.notes || '',
      
      // Contract
      contractId: null,
      contractSigned: false,
      
      // Metadata
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    // Calculate financials
    booking.totalAmount = booking.artistFee;
    booking.agencyFee = booking.totalAmount * this.engine.commissionRate;
    booking.tax = booking.totalAmount * this.engine.taxRate;
    booking.netToArtist = booking.totalAmount - booking.agencyFee - booking.tax;
    booking.depositAmount = booking.netToArtist * 0.5; // 50% deposit

    this.bookings.set(booking.id, booking);
    this.emit('booking-created', booking);
    return booking;
  }

  confirmBooking(bookingId) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = this.bookingStatus.CONFIRMED;
    booking.modifiedAt = new Date().toISOString();
    
    this.emit('booking-confirmed', booking);
    return booking;
  }

  cancelBooking(bookingId, reason) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = this.bookingStatus.CANCELLED;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date().toISOString();
    booking.modifiedAt = new Date().toISOString();
    
    this.emit('booking-cancelled', booking);
    return booking;
  }

  // ============================================================
  // 📄 CONTRACT MANAGEMENT
  // ============================================================

  createContract(bookingId, config = {}) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const contract = {
      id: `contract-${Date.now()}`,
      bookingId,
      
      // Parties
      artistSignature: null,
      venueSignature: null,
      agencySignature: null,
      
      // Terms
      terms: config.terms || this.getDefaultTerms(),
      cancellationPolicy: config.cancellationPolicy || this.getDefaultCancellationPolicy(),
      forceMajeure: config.forceMajeure || true,
      
      // Timestamps
      artistSignedAt: null,
      venueSignedAt: null,
      agencySignedAt: null,
      
      // Status
      status: 'pending',
      
      createdAt: new Date().toISOString()
    };

    this.contracts.set(contract.id, contract);
    booking.contractId = contract.id;
    booking.modifiedAt = new Date().toISOString();
    
    this.emit('contract-created', contract);
    return contract;
  }

  getDefaultTerms() {
    return `
      1. ARTIST shall perform at VENUE on DATE
      2. ARTIST shall perform for DURATION
      3. VENUE shall provide technical requirements as specified in rider
      4. VENUE shall provide hospitality as specified in rider
      5. Payment shall be made in accordance with payment terms
      6. This agreement is binding upon signature
    `;
  }

  getDefaultCancellationPolicy() {
    return `
      - 30+ days notice: Full refund
      - 14-29 days notice: 50% refund
      - 7-13 days notice: 25% refund
      - Less than 7 days: No refund
    `;
  }

  // ============================================================
  // 📅 CALENDAR MANAGEMENT
  // ============================================================

  createCalendarEvent(bookingId) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const event = {
      id: `event-${Date.now()}`,
      bookingId,
      title: booking.eventName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      allDay: false,
      reminder: true,
      reminderTime: '24 hours',
      color: this.getEventColor(booking.status),
      
      createdAt: new Date().toISOString()
    };

    this.calendar.set(event.id, event);
    this.emit('calendar-event-created', event);
    return event;
  }

  getEventColor(status) {
    const colors = {
      pending: '#FFA500',
      confirmed: '#00FF00',
      cancelled: '#FF0000',
      completed: '#0000FF',
      no_show: '#800080'
    };
    return colors[status] || '#FFFFFF';
  }

  // ============================================================
  // 🔍 SEARCH & DISCOVERY
  // ============================================================

  searchArtists(query, filters = {}) {
    const results = Array.from(this.artists.values()).filter(artist => {
      // Text search
      const matchesQuery = !query || 
        artist.name.toLowerCase().includes(query.toLowerCase()) ||
        artist.genre.some(g => g.toLowerCase().includes(query.toLowerCase()));
      
      // Filter by genre
      const matchesGenre = !filters.genre || 
        filters.genre.some(g => artist.genre.includes(g));
      
      // Filter by price range
      const matchesPrice = (!filters.minPrice || artist.minPrice >= filters.minPrice) &&
                           (!filters.maxPrice || artist.maxPrice <= filters.maxPrice);
      
      // Filter by location
      const matchesLocation = !filters.location ||
        artist.location.city === filters.location ||
        artist.location.state === filters.location;
      
      // Filter by availability
      const matchesAvailability = !filters.date ||
        this.checkAvailability(artist.id, filters.date);
      
      // Filter by rating
      const matchesRating = !filters.minRating || artist.rating >= filters.minRating;
      
      return matchesQuery && matchesGenre && matchesPrice && 
             matchesLocation && matchesAvailability && matchesRating;
    });

    return results;
  }

  searchVenues(query, filters = {}) {
    const results = Array.from(this.venues.values()).filter(venue => {
      const matchesQuery = !query || 
        venue.name.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = !filters.type || venue.type === filters.type;
      const matchesCapacity = (!filters.minCapacity || venue.capacity >= filters.minCapacity) &&
                              (!filters.maxCapacity || venue.capacity <= filters.maxCapacity);
      const matchesLocation = !filters.location ||
        venue.city === filters.location ||
        venue.state === filters.location;
      const matchesRating = !filters.minRating || venue.rating >= filters.minRating;
      
      return matchesQuery && matchesType && matchesCapacity && 
             matchesLocation && matchesRating;
    });

    return results;
  }

  // ============================================================
  // ✅ AVAILABILITY CHECKING
  // ============================================================

  checkAvailability(artistId, date) {
    const artist = this.artists.get(artistId);
    if (!artist) {
      return false;
    }

    // Check blackout dates
    const isBlackout = artist.blackoutDates.some(blackout => {
      const blackoutStart = new Date(blackout.start);
      const blackoutEnd = new Date(blackout.end);
      const checkDate = new Date(date);
      return checkDate >= blackoutStart && checkDate <= blackoutEnd;
    });

    if (isBlackout) {
      return false;
    }

    // Check existing bookings
    const hasBooking = Array.from(this.bookings.values()).some(booking => {
      return booking.artistId === artistId && 
             booking.date === date && 
             booking.status !== this.bookingStatus.CANCELLED;
    });

    return !hasBooking;
  }

  // ============================================================
  // 💰 FINANCIAL MANAGEMENT
  // ============================================================

  generateInvoice(bookingId) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const invoice = {
      id: `invoice-${Date.now()}`,
      bookingId,
      
      // Amounts
      artistFee: booking.artistFee,
      agencyFee: booking.agencyFee,
      tax: booking.tax,
      total: booking.totalAmount,
      deposit: booking.depositAmount,
      balance: booking.netToArtist - booking.depositAmount,
      
      // Status
      status: 'unpaid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      
      createdAt: new Date().toISOString()
    };

    this.emit('invoice-generated', invoice);
    return invoice;
  }

  processPayment(bookingId, amount, method) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const payment = {
      id: `payment-${Date.now()}`,
      bookingId,
      amount,
      method, // credit_card, bank_transfer, paypal, crypto
      status: 'processing',
      
      createdAt: new Date().toISOString()
    };

    this.emit('payment-processed', payment);
    return payment;
  }

  // ============================================================
  // 📊 ANALYTICS & REPORTING
  // ============================================================

  getArtistStats(artistId) {
    const artist = this.artists.get(artistId);
    if (!artist) {
      return null;
    }

    const bookings = Array.from(this.bookings.values()).filter(
      booking => booking.artistId === artistId
    );

    const revenue = bookings.reduce((sum, booking) => sum + booking.netToArtist, 0);
    const completedShows = bookings.filter(b => b.status === this.bookingStatus.COMPLETED).length;
    const upcomingShows = bookings.filter(b => 
      b.status === this.bookingStatus.CONFIRMED && new Date(b.date) > new Date()
    ).length;

    return {
      artistId: artist.name,
      totalShows: artist.totalShows,
      completedShows,
      upcomingShows,
      totalRevenue: revenue,
      averageFee: completedShows > 0 ? revenue / completedShows : 0,
      rating: artist.rating,
      cancellationRate: bookings.filter(b => b.status === this.bookingStatus.CANCELLED).length / bookings.length
    };
  }

  getVenueStats(venueId) {
    const venue = this.venues.get(venueId);
    if (!venue) {
      return null;
    }

    const events = Array.from(this.bookings.values()).filter(
      booking => booking.venueId === venueId
    );

    return {
      venueName: venue.name,
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
      totalRevenue: events.reduce((sum, e) => sum + e.totalAmount, 0),
      rating: venue.rating
    };
  }

  getAgencyStats() {
    const bookings = Array.from(this.bookings.values());
    const revenue = bookings.reduce((sum, booking) => sum + booking.agencyFee, 0);

    return {
      totalArtists: this.artists.size,
      totalVenues: this.venues.size,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === this.bookingStatus.PENDING).length,
      confirmedBookings: bookings.filter(b => b.status === this.bookingStatus.CONFIRMED).length,
      completedBookings: bookings.filter(b => b.status === this.bookingStatus.COMPLETED).length,
      cancelledBookings: bookings.filter(b => b.status === this.bookingStatus.CANCELLED).length,
      totalRevenue: revenue,
      averageCommission: bookings.length > 0 ? revenue / bookings.length : 0
    };
  }

  // ============================================================
  // 📊 UTILITIES
  // ============================================================

  getBookingById(bookingId) {
    return this.bookings.get(bookingId);
  }

  getArtistById(artistId) {
    return this.artists.get(artistId);
  }

  getVenueById(venueId) {
    return this.venues.get(venueId);
  }
}

module.exports = GOATBookingAgency;