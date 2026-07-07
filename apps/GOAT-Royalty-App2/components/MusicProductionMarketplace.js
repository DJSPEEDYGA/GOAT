import React, { useState } from 'react';
import { Search, Filter, Star, TrendingUp, Zap, Download, ExternalLink, ShoppingCart, DollarSign } from 'lucide-react';

export default function MusicProductionMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [cart, setCart] = useState([]);

  const allProducts = [
    // DAW Software
    {
      id: 'logic-pro-mac',
      name: 'Logic Pro for Mac',
      vendor: 'Apple',
      price: 199.99,
      category: 'daw',
      type: 'software',
      description: 'Complete professional recording studio for Mac',
      features: ['Unlimited Tracks', 'Dolby Atmos', 'Live Loops', 'Drummer', 'Alchemy Synth'],
      url: 'https://www.apple.com/logic-pro/',
      rating: 4.9,
      reviews: 15234,
      icon: '🎹',
      color: 'from-purple-500 to-indigo-600',
      badge: 'Best DAW',
      trial: true
    },
    {
      id: 'logic-pro-ipad',
      name: 'Logic Pro for iPad',
      vendor: 'Apple',
      price: 49.99,
      category: 'daw',
      type: 'software',
      description: 'Professional music studio on iPad',
      features: ['Touch Interface', 'Portable', 'Cloud Sync', 'Full Logic Features'],
      url: 'https://www.apple.com/logic-pro-for-ipad/',
      rating: 4.8,
      reviews: 8567,
      icon: '📱',
      color: 'from-blue-500 to-cyan-600',
      badge: 'Mobile',
      trial: true
    },
    {
      id: 'pro-tools-ultimate',
      name: 'Pro Tools Ultimate',
      vendor: 'Avid',
      price: 599.00,
      category: 'daw',
      type: 'subscription',
      description: 'Industry standard recording software',
      features: ['Unlimited Tracks', 'Dolby Atmos', 'Cloud Collaboration', 'Advanced Editing'],
      url: 'https://www.avid.com/pro-tools',
      rating: 4.6,
      reviews: 25789,
      icon: '🎛️',
      color: 'from-orange-500 to-red-600',
      badge: 'Industry Standard',
      trial: true
    },
    {
      id: 'pro-tools-studio',
      name: 'Pro Tools Studio',
      vendor: 'Avid',
      price: 34.99,
      category: 'daw',
      type: 'subscription',
      description: 'Professional recording and mixing',
      features: ['256 Tracks', 'Cloud Collaboration', 'Advanced Editing', 'Plugin Support'],
      url: 'https://www.avid.com/pro-tools',
      rating: 4.5,
      reviews: 12456,
      icon: '🎚️',
      color: 'from-red-500 to-orange-600',
      badge: 'Monthly',
      trial: true
    },
    {
      id: 'sound-forge-pro',
      name: 'SOUND FORGE Pro Suite 18',
      vendor: 'MAGIX',
      price: 239.99,
      category: 'daw',
      type: 'software',
      description: 'Professional audio editing and mastering',
      features: ['64-bit Engine', 'VST Support', 'Spectral Editing', 'Batch Processing'],
      url: 'https://www.magix.com/us/music-editing/sound-forge/',
      rating: 4.4,
      reviews: 4234,
      icon: '🎼',
      color: 'from-green-500 to-emerald-600',
      badge: 'Pro',
      trial: true
    },
    {
      id: 'bitwig-studio',
      name: 'Bitwig Studio 6',
      vendor: 'Bitwig',
      price: 399.00,
      category: 'daw',
      type: 'software',
      description: 'Modern music production and performance',
      features: ['Modular System', 'Hybrid Tracks', 'The Grid', 'Operators'],
      url: 'https://www.bitwig.com/',
      rating: 4.7,
      reviews: 6789,
      icon: '🎵',
      color: 'from-cyan-500 to-blue-600',
      badge: 'Modern',
      trial: true
    },

    // Plugins & Effects
    {
      id: 'autotune-pro-11',
      name: 'AutoTune Pro 11',
      vendor: 'Antares',
      price: 250.00,
      originalPrice: 459.00,
      category: 'plugins',
      type: 'plugin',
      description: 'Professional pitch correction plugin',
      features: ['Real-time Tuning', 'Graph Mode', 'Auto Mode', 'Flex-Tune', 'Humanize'],
      url: 'https://www.antarestech.com/product/auto-tune-pro/',
      rating: 4.8,
      reviews: 12345,
      icon: '🎤',
      color: 'from-pink-500 to-rose-600',
      badge: 'Sale -45%',
      trial: true
    },
    {
      id: 'autotune-2026',
      name: 'AutoTune 2026',
      vendor: 'Antares',
      price: 150.00,
      category: 'plugins',
      type: 'plugin',
      description: 'Streamlined pitch correction',
      features: ['Real-time Processing', 'Low Latency', 'Modern UI', 'Preset Library'],
      url: 'https://www.antarestech.com/',
      rating: 4.7,
      reviews: 3456,
      icon: '✨',
      color: 'from-indigo-500 to-purple-600',
      badge: 'New 2026',
      trial: true
    },
    {
      id: 'rx-11-advanced',
      name: 'RX 11 Advanced',
      vendor: 'iZotope',
      price: 1349.00,
      category: 'plugins',
      type: 'plugin',
      description: 'Professional audio repair and restoration',
      features: ['Spectral Repair', 'De-noise', 'De-click', 'AI-powered', 'Music Rebalance'],
      url: 'https://www.izotope.com/en/products/rx.html',
      rating: 4.9,
      reviews: 5678,
      icon: '🔧',
      color: 'from-yellow-500 to-orange-600',
      badge: 'Advanced',
      trial: true
    },

    // Bundles & Suites
    {
      id: 'music-production-suite-8',
      name: 'Music Production Suite 8',
      vendor: 'iZotope',
      price: 799.00,
      category: 'bundles',
      type: 'bundle',
      description: 'Complete music editing and production',
      features: ['Ozone 11', 'Neutron 4', 'Nectar 4', 'Tonal Balance Control', 'Visual Mixer'],
      url: 'https://www.izotope.com/en/products/music-production-suite.html',
      rating: 4.7,
      reviews: 3234,
      icon: '🎚️',
      color: 'from-green-500 to-emerald-600',
      badge: 'Suite',
      trial: true
    },
    {
      id: 'izotope-everything',
      name: 'iZotope Everything Bundle',
      vendor: 'iZotope',
      price: 2999.00,
      category: 'bundles',
      type: 'bundle',
      description: 'Complete iZotope collection',
      features: ['All iZotope Products', 'Ozone', 'Neutron', 'RX', 'Nectar', 'VocalSynth', 'Iris'],
      url: 'https://www.izotope.com/',
      rating: 5.0,
      reviews: 1234,
      icon: '💎',
      color: 'from-purple-500 to-pink-600',
      badge: 'Ultimate',
      trial: false
    },
    {
      id: 'mix-master-bundle',
      name: 'Mix & Master Bundle Advanced',
      vendor: 'iZotope',
      price: 599.00,
      category: 'bundles',
      type: 'bundle',
      description: 'Professional mixing and mastering',
      features: ['Ozone 12', 'Neutron 4', 'Tonal Balance Control', 'Visual Mixer'],
      url: 'https://www.izotope.com/',
      rating: 4.8,
      reviews: 2345,
      icon: '🎛️',
      color: 'from-blue-500 to-indigo-600',
      badge: 'Bundle',
      trial: true
    },

    // Services & Subscriptions
    {
      id: 'landr-studio-pro',
      name: 'LANDR Studio Pro',
      vendor: 'LANDR',
      price: 149.94,
      originalPrice: 300.00,
      category: 'services',
      type: 'subscription',
      description: 'Complete music production platform',
      features: ['AI Mastering', 'Distribution', 'Collaboration', 'Sample Library', 'Plugins'],
      url: 'https://www.landr.com/',
      rating: 4.5,
      reviews: 8901,
      icon: '🚀',
      color: 'from-cyan-500 to-blue-600',
      badge: 'Sale -50%',
      trial: true
    },

    // Presets & Templates
    {
      id: 'chris-brown-preset',
      name: 'Chris Brown Vocal Preset',
      vendor: 'Rys Up Audio',
      price: 49.99,
      category: 'presets',
      type: 'preset',
      description: 'Professional vocal preset for Logic Pro X',
      features: ['Chris Brown Style', 'EQ Settings', 'Compression', 'Effects Chain'],
      url: '#',
      rating: 4.6,
      reviews: 567,
      icon: '🎤',
      color: 'from-pink-500 to-purple-600',
      badge: 'Preset',
      trial: false
    },
    {
      id: 'future-vocal-preset',
      name: 'Future Vocal Preset',
      vendor: 'Rys Up Audio',
      price: 49.99,
      category: 'presets',
      type: 'preset',
      description: 'Future-style vocal preset for Logic Pro X',
      features: ['Future Style', 'Auto-Tune Settings', 'Effects', 'Mixing Chain'],
      url: '#',
      rating: 4.7,
      reviews: 678,
      icon: '🎵',
      color: 'from-indigo-500 to-blue-600',
      badge: 'Preset',
      trial: false
    },
    {
      id: 'infinity-suite-logic',
      name: 'Infinity Suite: Logic Pro',
      vendor: 'Mayu Beatz',
      price: 297.00,
      category: 'presets',
      type: 'preset',
      description: 'Complete preset collection for Logic Pro',
      features: ['100+ Presets', 'All Genres', 'Professional Quality', 'Regular Updates'],
      url: '#',
      rating: 4.8,
      reviews: 890,
      icon: '♾️',
      color: 'from-purple-500 to-pink-600',
      badge: 'Suite',
      trial: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: '🌐', count: allProducts.length },
    { id: 'daw', name: 'DAW Software', icon: '🎹', count: allProducts.filter(p => p.category === 'daw').length },
    { id: 'plugins', name: 'Plugins & Effects', icon: '🎚️', count: allProducts.filter(p => p.category === 'plugins').length },
    { id: 'bundles', name: 'Bundles & Suites', icon: '📦', count: allProducts.filter(p => p.category === 'bundles').length },
    { id: 'services', name: 'Services', icon: '🚀', count: allProducts.filter(p => p.category === 'services').length },
    { id: 'presets', name: 'Presets & Templates', icon: '🎤', count: allProducts.filter(p => p.category === 'presets').length }
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedFilter === 'all' || product.category === selectedFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  const getTotalSavings = () => {
    return cart.reduce((total, item) => {
      if (item.originalPrice) {
        return total + (item.originalPrice - item.price);
      }
      return total;
    }, 0).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎹 Music Production Marketplace
            </h1>
            <p className="text-indigo-300">
              Professional DAWs, plugins, bundles, and production tools - All in one place
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.length})
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              ${getTotalPrice()}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Logic Pro, AutoTune, Pro Tools, plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedFilter(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedFilter === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              <span className="font-medium">{category.name}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Deals Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-4 text-white">
          <div className="text-sm font-bold mb-1">🔥 HOT DEAL</div>
          <div className="text-xl font-bold mb-1">AutoTune Pro 11</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">$250</span>
            <span className="text-sm line-through opacity-75">$459</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">-45%</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-sm font-bold mb-1">💎 BEST VALUE</div>
          <div className="text-xl font-bold mb-1">LANDR Studio Pro</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">$149</span>
            <span className="text-sm line-through opacity-75">$300</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">-50%</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
          <div className="text-sm font-bold mb-1">⭐ MOST POPULAR</div>
          <div className="text-xl font-bold mb-1">Logic Pro for Mac</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">$199</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Free Trial</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group"
          >
            {/* Product Header */}
            <div className={`bg-gradient-to-r ${product.color} p-4 text-white relative`}>
              {product.badge && (
                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                  {product.badge}
                </div>
              )}
              <div className="text-4xl mb-2">{product.icon}</div>
              <h3 className="text-xl font-bold mb-1">{product.name}</h3>
              <p className="text-sm opacity-90">{product.vendor}</p>
            </div>

            {/* Product Content */}
            <div className="p-4">
              <p className="text-gray-300 text-sm mb-3">{product.description}</p>

              {/* Features */}
              <div className="mb-3">
                <div className="space-y-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="text-xs text-gray-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {product.rating} ({product.reviews.toLocaleString()})
                </span>
              </div>

              {/* Price */}
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                {product.trial && (
                  <div className="text-xs text-blue-400 mt-1">✓ Free trial available</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(product)}
                  className={`flex-1 py-2 bg-gradient-to-r ${product.color} text-white rounded-lg hover:opacity-90 transition-all font-bold text-sm flex items-center justify-center gap-1`}
                >
                  <ShoppingCart className="w-3 h-3" />
                  Add to Cart
                </button>
                <button
                  onClick={() => window.open(product.url, '_blank')}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-gray-800 rounded-xl p-6 border-2 border-purple-500 shadow-2xl max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">Shopping Cart Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-300">
              <span>Items:</span>
              <span className="text-white font-bold">{cart.length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Subtotal:</span>
              <span className="text-white font-bold">${getTotalPrice()}</span>
            </div>
            {getTotalSavings() > 0 && (
              <div className="flex justify-between text-green-400">
                <span>You Save:</span>
                <span className="font-bold">${getTotalSavings()}</span>
              </div>
            )}
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-bold">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}