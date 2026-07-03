import React, { useState } from 'react';
import { Music, Download, ExternalLink, Zap, Package, DollarSign, Star, ShoppingCart } from 'lucide-react';

export default function LogicProIntegration() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: 'Logic Pro for Mac',
      vendor: 'Apple',
      price: 199.99,
      originalPrice: null,
      category: 'daw',
      description: 'Complete professional music studio for Mac',
      features: ['Professional Recording', 'MIDI Sequencing', 'Mixing & Mastering', 'Dolby Atmos Support'],
      icon: '🎹',
      url: 'https://www.apple.com/logic-pro/',
      rating: 4.9,
      reviews: 15000,
      color: 'from-purple-500 to-indigo-500',
      badge: 'Best DAW'
    },
    {
      id: 2,
      name: 'Logic Pro for iPad',
      vendor: 'Apple',
      price: 49.99,
      originalPrice: null,
      category: 'daw',
      description: 'Professional music studio on iPad',
      features: ['Touch Interface', 'Portable Studio', 'Full Logic Features', 'Cloud Sync'],
      icon: '📱',
      url: 'https://www.apple.com/logic-pro-for-ipad/',
      rating: 4.8,
      reviews: 8500,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Mobile'
    },
    {
      id: 3,
      name: 'Music Production Suite 8',
      vendor: 'iZotope',
      price: 799.00,
      originalPrice: null,
      category: 'plugins',
      description: 'Complete music editing and production software',
      features: ['Ozone 11', 'Neutron 4', 'Nectar 4', 'Tonal Balance Control'],
      icon: '🎚️',
      url: 'https://www.izotope.com/',
      rating: 4.7,
      reviews: 3200,
      color: 'from-green-500 to-emerald-500',
      badge: 'Suite'
    },
    {
      id: 4,
      name: 'AutoTune Pro 11',
      vendor: 'AutoTune',
      price: 250.00,
      originalPrice: 459.00,
      category: 'plugins',
      description: 'Professional pitch correction plugin',
      features: ['Real-time Tuning', 'Graph Mode', 'Auto Mode', 'Flex-Tune'],
      icon: '🎤',
      url: 'https://www.antarestech.com/',
      rating: 4.8,
      reviews: 12000,
      color: 'from-pink-500 to-rose-500',
      badge: 'Sale'
    },
    {
      id: 5,
      name: 'Pro Tools Ultimate',
      vendor: 'Avid',
      price: 599.00,
      originalPrice: null,
      category: 'daw',
      description: 'Industry standard recording software',
      features: ['Unlimited Tracks', 'Dolby Atmos', 'Cloud Collaboration', 'Advanced Editing'],
      icon: '🎛️',
      url: 'https://www.avid.com/pro-tools',
      rating: 4.6,
      reviews: 25000,
      color: 'from-orange-500 to-red-500',
      badge: 'Pro'
    },
    {
      id: 6,
      name: 'RX 11 Advanced',
      vendor: 'iZotope',
      price: 1349.00,
      originalPrice: null,
      category: 'plugins',
      description: 'Professional audio repair and restoration',
      features: ['Spectral Repair', 'De-noise', 'De-click', 'AI-powered'],
      icon: '🔧',
      url: 'https://www.izotope.com/rx',
      rating: 4.9,
      reviews: 5600,
      color: 'from-yellow-500 to-orange-500',
      badge: 'Advanced'
    },
    {
      id: 7,
      name: 'LANDR Studio Pro',
      vendor: 'LANDR',
      price: 149.94,
      originalPrice: 300.00,
      category: 'services',
      description: 'Complete music production platform',
      features: ['AI Mastering', 'Distribution', 'Collaboration', 'Sample Library'],
      icon: '🚀',
      url: 'https://www.landr.com/',
      rating: 4.5,
      reviews: 8900,
      color: 'from-cyan-500 to-blue-500',
      badge: 'Sale'
    },
    {
      id: 8,
      name: 'AutoTune 2026',
      vendor: 'AutoTune',
      price: 150.00,
      originalPrice: null,
      category: 'plugins',
      description: 'Latest streamlined pitch correction',
      features: ['Real-time Processing', 'Low Latency', 'Modern UI', 'Preset Library'],
      icon: '✨',
      url: 'https://www.antarestech.com/',
      rating: 4.7,
      reviews: 3400,
      color: 'from-indigo-500 to-purple-500',
      badge: 'New'
    },
    {
      id: 9,
      name: 'iZotope Everything Bundle',
      vendor: 'iZotope',
      price: 2999.00,
      originalPrice: null,
      category: 'bundles',
      description: 'Complete iZotope collection',
      features: ['All iZotope Products', 'Ozone', 'Neutron', 'RX', 'Nectar', 'VocalSynth'],
      icon: '💎',
      url: 'https://www.izotope.com/',
      rating: 5.0,
      reviews: 1200,
      color: 'from-purple-500 to-pink-500',
      badge: 'Ultimate'
    },
    {
      id: 10,
      name: 'SOUND FORGE Pro Suite',
      vendor: 'MAGIX',
      price: 239.99,
      originalPrice: null,
      category: 'daw',
      description: 'Professional audio editing and mastering',
      features: ['64-bit Engine', 'VST Support', 'Spectral Editing', 'Batch Processing'],
      icon: '🎼',
      url: 'https://www.magix.com/',
      rating: 4.4,
      reviews: 4200,
      color: 'from-red-500 to-orange-500',
      badge: 'Pro'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: '🌐', count: products.length },
    { id: 'daw', name: 'DAW Software', icon: '🎹', count: products.filter(p => p.category === 'daw').length },
    { id: 'plugins', name: 'Plugins & Effects', icon: '🎚️', count: products.filter(p => p.category === 'plugins').length },
    { id: 'bundles', name: 'Bundles', icon: '📦', count: products.filter(p => p.category === 'bundles').length },
    { id: 'services', name: 'Services', icon: '🚀', count: products.filter(p => p.category === 'services').length }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎹 Logic Pro & Music Production Tools
            </h1>
            <p className="text-purple-300">
              Professional DAWs, plugins, and production software for your music studio
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎉 Special Offers Available!</h2>
              <p className="text-lg">Save up to 50% on AutoTune Pro 11 and LANDR Studio Pro</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">$250</div>
              <div className="text-sm line-through opacity-75">$459</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-3 rounded-lg transition-all text-left flex items-center justify-between ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-white font-bold mb-3">Shopping Cart</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Items:</span>
                  <span className="text-white font-bold">{cart.length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total:</span>
                  <span className="text-green-400 font-bold text-lg">${getTotalPrice()}</span>
                </div>
              </div>
              {cart.length > 0 && (
                <button className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-bold">
                  Checkout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group"
              >
                {/* Product Header */}
                <div className={`bg-gradient-to-r ${product.color} p-6 text-white relative`}>
                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                      {product.badge}
                    </div>
                  )}
                  <div className="text-5xl mb-3">{product.icon}</div>
                  <h3 className="text-2xl font-bold mb-1">{product.name}</h3>
                  <p className="text-sm opacity-90">{product.vendor}</p>
                </div>

                {/* Product Content */}
                <div className="p-6">
                  <p className="text-gray-300 mb-4">{product.description}</p>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-white font-bold mb-2 text-sm">Key Features:</h4>
                    <div className="space-y-1">
                      {product.features.map((feature, index) => (
                        <div key={index} className="text-sm text-gray-400 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      {product.rating} ({product.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-white">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.originalPrice && (
                      <div className="text-sm text-green-400 font-bold">
                        Save ${(product.originalPrice - product.price).toFixed(2)} ({Math.round((1 - product.price / product.originalPrice) * 100)}% off)
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className={`flex-1 py-3 bg-gradient-to-r ${product.color} text-white rounded-lg hover:opacity-90 transition-all font-bold flex items-center justify-center gap-2`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => window.open(product.url, '_blank')}
                      className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Professional Music Production Tools
            </h3>
            <p className="text-gray-300 mb-4">
              Access industry-standard DAWs, plugins, and production software. All products are from official vendors with full support and updates.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🎹</div>
                <div className="text-sm text-gray-300">DAW Software</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🎚️</div>
                <div className="text-sm text-gray-300">Plugins & Effects</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">📦</div>
                <div className="text-sm text-gray-300">Complete Bundles</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-sm text-gray-300">Cloud Services</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-sm text-gray-300">Premium Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}