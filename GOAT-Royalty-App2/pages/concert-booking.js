/**
 * 🎤 Concert Booking Page — GOAT Force Entertainment
 * Full booking platform with artist roster, college circuit, contracts
 */

import Head from 'next/head';
import ConcertBookingSystem from '../components/ConcertBookingSystem';

export default function ConcertBookingPage() {
  return (
    <>
      <Head>
        <title>Concert Booking System | GOAT Force Entertainment</title>
        <meta name="description" content="Book GOAT Force artists — Waka Flocka Flame, DJ Speedy, and more. College bookings, festivals, clubs, corporate events. NACA/APCA conference network." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ConcertBookingSystem />
    </>
  );
}