/**
 * GOAT Fashion Store - Merchandise & Apparel
 * E-commerce platform for GOAT Force branded merchandise
 */

import React, { useState } from 'react';
import { ShoppingBag, Shirt, Star, TrendingUp, DollarSign, Package, Truck, CreditCard } from 'lucide-react';

export default function FashionStore() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    {
      id: 1,
      name: 'GOAT Empire Hoodie',
      category: 'Hoodies',
      price: 85,
      image: '👕',
      colors: ['Black', 'White', 'Gold'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: 247,
      rating: 4.9,
      sales: 1847
    },
    {
      id: 2,
      name: 'Brick Squad Bomber Jacket',
      category: 'Jackets',
      price: 150,
      image: '🧥',
      colors: ['Black', 'Red', 'Camo'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      stock: 89,
      rating: 5.0,
      sales: 456
    },
    {
      id: 3,
      name: 'GOAT Crown Snapback',
      category: 'Hats',
      price: 45,
      image: '🧢',
      colors: ['Black/Gold', 'White/Gold', 'Red/Black'],
      sizes: ['One Size'],
      stock: 567,
      rating: 4.8,
      sales: 2341
    },
    {
      id: 4,
      name: 'Royalty T-Shirt',
      category: 'T-Shirts',
      price: 35,
      image: '👔',
      colors: ['Black', 'White', 'Gold', 'Purple'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: 892,
      rating: 4.7,
      sales: 3456
    },
    {
      id: 5,
      name: 'GOAT Force Joggers',
      category: 'Pants',
      price: 75,
      image: '👖',
      colors: ['Black', 'Grey', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 234,
      rating: 4.9,
      sales: 789
    },
    {
      id: 6,
      name: 'Empire Chain Necklace',
      category: 'Jewelry',
      price: 120,
      image: '📿',
      colors: ['Gold', 'Silver', 'Rose Gold'],
      sizes: ['One Size'],
      stock: 156,
      rating: 5.0,
      sales: 234
    },
    {
      id: 7,
      name: 'GOAT Slides',
      category: 'Footwear',
      price: 55,
      image: '👟',
      colors: ['Black', 'White', 'Gold'],
      sizes: ['7', '8', '9', '10', '11', '12'],
      stock: 445,
      rating: 4.6,
      sales: 1234
    },
    {
      id: 8,
      name: 'Brick Squad Backpack',
      category: 'Accessories',
      price: 95,
      image: '🎒',
      colors: ['Black', 'Camo', 'Red'],
      sizes: ['One Size'],
      stock: 178,
      rating: 4.8,
      sales: 567
    }
  ];

  const storeStats = {
    totalProducts: 247,
    totalSales: 12847,
    revenue: 1247890,
    avgRating: 4.8
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">GOAT Fashion Store</h1>
              <p className="text-gray-400">Official Merchandise & Apparel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingBag className="w-8 h-8 text-white cursor-pointer" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Store Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/50 backdrop-blur-md border border-indigo-500/30 rounded-xl p-4">
            <Package className="w-6 h-6 text-indigo-400 mb-2" />
            <p className="text-2xl font-bold text-white">{storeStats.totalProducts}</p>
            <p className="text-gray-400 text-sm">Products</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-green-500/30 rounded-xl p-4">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{storeStats.totalSales.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Sales</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-yellow-500/30 rounded-xl p-4">
            <DollarSign className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">${(storeStats.revenue / 1000000).toFixed(1)}M</p>
            <p className="text-gray-400 text-sm">Revenue</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
            <Star className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{storeStats.avgRating}</p>
            <p className="text-gray-400 text-sm">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            {/* Product Image */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 aspect-square flex items-center justify-center text-8xl">
              {product.image}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-indigo-400 font-semibold">{product.category}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm font-bold">{product.rating}</span>
                </div>
              </div>

              <h3 className="text-white font-bold mb-2">{product.name}</h3>

              <div className="flex items-center justify-between mb-3">
                <p className="text-2xl font-black text-white">${product.price}</p>
                <p className="text-gray-400 text-xs">{product.sales} sold</p>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-2 mb-3">
                {product.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-white/30"
                    style={{
                      background: color.toLowerCase().includes('gold') ? '#FFD700' :
                                 color.toLowerCase().includes('black') ? '#000' :
                                 color.toLowerCase().includes('white') ? '#FFF' :
                                 color.toLowerCase().includes('red') ? '#DC2626' :
                                 color.toLowerCase().includes('camo') ? '#4B5320' :
                                 '#6366F1'
                    }}
                  ></div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              {product.stock < 100 && (
                <p className="text-red-400 text-xs mt-2 text-center">Only {product.stock} left!</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-6 text-center">
          <Truck className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Free Shipping</h3>
          <p className="text-gray-400 text-sm">On orders over $100</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 text-center">
          <CreditCard className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Secure Payment</h3>
          <p className="text-gray-400 text-sm">100% secure checkout</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 text-center">
          <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Premium Quality</h3>
          <p className="text-gray-400 text-sm">Highest quality materials</p>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-gray-900 rounded-xl max-w-4xl w-full p-8 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 aspect-square flex items-center justify-center text-9xl rounded-xl">
                {selectedProduct.image}
              </div>

              <div>
                <h2 className="text-3xl font-black text-white mb-2">{selectedProduct.name}</h2>
                <p className="text-indigo-400 font-semibold mb-4">{selectedProduct.category}</p>

                <div className="flex items-center gap-4 mb-6">
                  <p className="text-4xl font-black text-white">${selectedProduct.price}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold">{selectedProduct.rating}</span>
                    <span className="text-gray-400 text-sm">({selectedProduct.sales} reviews)</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-white font-semibold mb-2">Colors:</p>
                  <div className="flex gap-3">
                    {selectedProduct.colors.map((color, index) => (
                      <button
                        key={index}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-semibold"
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-white font-semibold mb-2">Sizes:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.sizes.map((size, index) => (
                      <button
                        key={index}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-semibold"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart - ${selectedProduct.price}
                </button>

                <p className="text-green-400 text-sm mt-4 text-center">
                  ✓ In Stock ({selectedProduct.stock} available)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}