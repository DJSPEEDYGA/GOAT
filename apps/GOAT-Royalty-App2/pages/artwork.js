/**
 * GOAT Royalty App - Superhero Artwork Page
 */

import React from 'react';
import SuperheroArtwork from '../components/SuperheroArtwork';

const ArtworkPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-red-900">
      <SuperheroArtwork />
    </div>
  );
};

export default ArtworkPage;