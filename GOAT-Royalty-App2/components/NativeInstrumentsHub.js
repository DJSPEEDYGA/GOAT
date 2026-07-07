import React, { useState } from 'react';
import { Music, Download, ExternalLink, Star, ShoppingCart, DollarSign, Package, Zap } from 'lucide-react';

export default function NativeInstrumentsHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  const products = [
    // Komplete Bundles
    {
      id: 'komplete-15-ce',
      name: 'KOMPLETE 15 Collector\'s Edition',
      vendor: 'Native Instruments',
      price: 1799.00,
      category: 'bundles',
      description: 'Ultimate collection of instruments and effects',
      features: ['165+ Products', '185,000+ Sounds', '850+ GB', 'All Expansions', 'Kontakt 8'],
      icon: '💎',
      url: 'https://www.native-instruments.com/en/products/komplete/bundles/komplete-15-collectors-edition/',
      rating: 4.9,
      reviews: 2345,
      color: 'from-purple-500 to-pink-600',
      badge: 'Ultimate'
    },
    {
      id: 'komplete-15-standard',
      name: 'KOMPLETE 15 Standard',
      vendor: 'Native Instruments',
      price: 599.00,
      category: 'bundles',
      description: 'Complete production suite',
      features: ['90+ Products', '50,000+ Sounds', '450+ GB', 'Kontakt 8', 'Massive X'],
      icon: '🎹',
      url: 'https://www.native-instruments.com/en/products/komplete/bundles/komplete-15/',
      rating: 4.8,
      reviews: 5678,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Popular'
    },
    {
      id: 'komplete-15-select',
      name: 'KOMPLETE 15 Select',
      vendor: 'Native Instruments',
      price: 99.00,
      category: 'bundles',
      description: 'Essential instruments and effects',
      features: ['15+ Products', '10,000+ Sounds', '50+ GB', 'Kontakt Player', 'Massive'],
      icon: '🎵',
      url: 'https://www.native-instruments.com/en/products/komplete/bundles/komplete-15-select/',
      rating: 4.7,
      reviews: 8901,
      color: 'from-green-500 to-emerald-600',
      badge: 'Starter'
    },

    // Hardware Controllers
    {
      id: 'maschine-mk3',
      name: 'MASCHINE MK3',
      vendor: 'Native Instruments',
      price: 579.00,
      category: 'hardware',
      description: 'Production and performance system',
      features: ['16 Pads', 'Dual Displays', 'Smart Strip', 'Maschine Software', 'Komplete Select'],
      icon: '🎛️',
      url: 'https://www.native-instruments.com/en/products/maschine/production-systems/maschine/',
      rating: 4.8,
      reviews: 3456,
      color: 'from-orange-500 to-red-600',
      badge: 'Best Seller'
    },
    {
      id: 'maschine-mikro-mk3',
      name: 'MASCHINE MIKRO MK3',
      vendor: 'Native Instruments',
      price: 269.00,
      category: 'hardware',
      description: 'Compact groove production',
      features: ['16 Pads', 'Smart Strip', 'Portable', 'Maschine Software', 'Komplete Select'],
      icon: '🎚️',
      url: 'https://www.native-instruments.com/en/products/maschine/production-systems/maschine-mikro/',
      rating: 4.7,
      reviews: 2345,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Compact'
    },
    {
      id: 'kontrol-s61-mk3',
      name: 'KOMPLETE KONTROL S61 MK3',
      vendor: 'Native Instruments',
      price: 849.00,
      category: 'hardware',
      description: 'Smart keyboard controller',
      features: ['61 Keys', 'Dual Displays', 'Light Guide', 'Polyphonic Aftertouch', 'Komplete Select'],
      icon: '🎹',
      url: 'https://www.native-instruments.com/en/products/komplete/keyboards/komplete-kontrol-s61-mk3/',
      rating: 4.9,
      reviews: 1234,
      color: 'from-purple-500 to-indigo-600',
      badge: 'Pro'
    },
    {
      id: 'kontrol-s49-mk3',
      name: 'KOMPLETE KONTROL S49 MK3',
      vendor: 'Native Instruments',
      price: 749.00,
      category: 'hardware',
      description: 'Smart keyboard controller',
      features: ['49 Keys', 'Dual Displays', 'Light Guide', 'Polyphonic Aftertouch', 'Komplete Select'],
      icon: '🎼',
      url: 'https://www.native-instruments.com/en/products/komplete/keyboards/komplete-kontrol-s49-mk3/',
      rating: 4.8,
      reviews: 987,
      color: 'from-blue-500 to-purple-600',
      badge: 'Popular'
    },
    {
      id: 'kontrol-a49',
      name: 'KOMPLETE KONTROL A49',
      vendor: 'Native Instruments',
      price: 219.00,
      category: 'hardware',
      description: 'Essential keyboard controller',
      features: ['49 Keys', 'Light Guide', 'Smart Play', 'Arpeggiator', 'Komplete Select'],
      icon: '🎵',
      url: 'https://www.native-instruments.com/en/products/komplete/keyboards/komplete-kontrol-a49/',
      rating: 4.7,
      reviews: 1567,
      color: 'from-green-500 to-teal-600',
      badge: 'Value'
    },
    {
      id: 'kontrol-m32',
      name: 'KOMPLETE KONTROL M32',
      vendor: 'Native Instruments',
      price: 139.00,
      category: 'hardware',
      description: 'Compact keyboard controller',
      features: ['32 Keys', 'Light Guide', 'Smart Play', 'Portable', 'Komplete Select'],
      icon: '🎹',
      url: 'https://www.native-instruments.com/en/products/komplete/keyboards/komplete-kontrol-m32/',
      rating: 4.7,
      reviews: 2890,
      color: 'from-pink-500 to-rose-600',
      badge: 'Portable'
    },

    // Software Instruments
    {
      id: 'kontakt-8',
      name: 'KONTAKT 8',
      vendor: 'Native Instruments',
      price: 299.00,
      category: 'software',
      description: 'Industry-standard sampler',
      features: ['Advanced Sampling', 'Script Processor', '70+ GB Library', 'Wavetable Module'],
      icon: '🎼',
      url: 'https://www.native-instruments.com/en/products/komplete/samplers/kontakt-8/',
      rating: 4.9,
      reviews: 8765,
      color: 'from-yellow-500 to-orange-600',
      badge: 'Industry Standard'
    },
    {
      id: 'massive-x',
      name: 'MASSIVE X',
      vendor: 'Native Instruments',
      price: 199.00,
      category: 'software',
      description: 'Flagship synthesizer',
      features: ['Wavetable Synthesis', '170+ Wavetables', 'Modulation System', 'Effects'],
      icon: '🎛️',
      url: 'https://www.native-instruments.com/en/products/komplete/synths/massive-x/',
      rating: 4.8,
      reviews: 4567,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Flagship'
    },
    {
      id: 'noire',
      name: 'NOIRE',
      vendor: 'Native Instruments',
      price: 149.00,
      category: 'software',
      description: 'Cinematic piano',
      features: ['Yamaha CFX', 'Particle Engine', 'Felt & Hammers', 'Cinematic Textures'],
      icon: '🎹',
      url: 'https://www.native-instruments.com/en/products/komplete/keys/noire/',
      rating: 4.9,
      reviews: 1234,
      color: 'from-gray-700 to-gray-900',
      badge: 'Cinematic'
    },
    {
      id: 'session-guitarist-mint',
      name: 'SESSION GUITARIST - Electric Mint',
      vendor: 'Native Instruments',
      price: 99.00,
      category: 'software',
      description: 'Electric guitar instrument',
      features: ['Fender Stratocaster', 'Pattern Mode', 'Chord Mode', 'Effects'],
      icon: '🎸',
      url: 'https://www.native-instruments.com/en/products/komplete/guitar/session-guitarist-electric-mint/',
      rating: 4.7,
      reviews: 890,
      color: 'from-green-500 to-emerald-600',
      badge: 'Guitar'
    },
    {
      id: 'claire',
      name: 'CLAIRE',
      vendor: 'Native Instruments',
      price: 149.00,
      category: 'software',
      description: 'Cinematic piano',
      features: ['Yamaha C7', 'Felt & Hammers', 'Cinematic Textures', 'Particle Engine'],
      icon: '🎹',
      url: 'https://www.native-instruments.com/en/products/komplete/keys/claire/',
      rating: 4.8,
      reviews: 567,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Piano'
    },

    // DJ Software & Hardware
    {
      id: 'traktor-z1-mk2',
      name: 'TRAKTOR Z1 MK2',
      vendor: 'Native Instruments',
      price: 259.00,
      category: 'dj',
      description: 'DJ mixer and controller',
      features: ['2 Channels', 'Audio Interface', 'Traktor Software', 'Portable'],
      icon: '🎧',
      url: 'https://www.native-instruments.com/en/products/traktor/dj-controllers/traktor-kontrol-z1/',
      rating: 4.6,
      reviews: 1234,
      color: 'from-red-500 to-orange-600',
      badge: 'DJ'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: '🌐', count: products.length },
    { id: 'bundles', name: 'Komplete Bundles', icon: '📦', count: products.filter(p => p.category === 'bundles').length },
    { id: 'hardware', name: 'Hardware Controllers', icon: '🎛️', count: products.filter(p => p.category === 'hardware').length },
    { id: 'software', name: 'Software Instruments', icon: '🎹', count: products.filter(p => p.category === 'software').length },
    { id: 'dj', name: 'DJ Equipment', icon: '🎧', count: products.filter(p => p.category === 'dj').length }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`Added ${product.name} to cart!`);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎹 Native Instruments Hub
            </h1>
            <p className="text-gray-300">
              Professional software and hardware for music production and DJing
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

        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎉 KOMPLETE 15 Now Available!</h2>
              <p className="text-lg">The ultimate collection of instruments and effects - 165+ products</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">$1,799</div>
              <div className="text-sm">Collector's Edition</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all group"
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
                  {product.features.map((feature, index) => (
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
                <span className="text-2xl font-bold text-white">
                  ${product.price.toFixed(2)}
                </span>
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

      {/* Info Banner */}
      <div className="mt-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Native Instruments - Industry Standard
            </h3>
            <p className="text-gray-300 mb-4">
              Leading manufacturer of software and hardware for computer-based audio production and DJing. 
              Trusted by professionals worldwide for over 25 years.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">📦</div>
                <div className="text-sm text-gray-300">Komplete Bundles</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🎛️</div>
                <div className="text-sm text-gray-300">Hardware Controllers</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🎹</div>
                <div className="text-sm text-gray-300">Software Instruments</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🎧</div>
                <div className="text-sm text-gray-300">DJ Equipment</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-sm text-gray-300">Premium Quality</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}