/**
 * GOAT Royalty App - Document Library Component
 * PDF and DOCX document viewer with download options
 */

import React, { useState } from 'react';
import { Download, FileText, Eye, ExternalLink, Search, Filter, ChevronDown, ChevronRight, Star, Clock, TrendingUp } from 'lucide-react';

const DocumentLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['all']));

  const documents = [
    {
      id: 1,
      title: "Moneypenny, Codex & The GOAT Royalty Force",
      description: "Complete superhero team documentation and character profiles",
      filename: "Moneypenny, Codex & The GOAT Royalty Force.pdf",
      type: "pdf",
      size: "8.4 MB",
      pages: "24",
      category: "team",
      featured: true,
      views: "15.2K",
      downloads: "3.8K",
      uploadDate: "2024-11-04",
      tags: ["superhero", "team", "codex", "moneypenny"]
    },
    {
      id: 2,
      title: "Moneypenny, Codex & The GOAT Royalty Force - Enhanced",
      description: "Enhanced version with extended character backgrounds",
      filename: "Moneypenny, Codex & The GOAT Royalty Force (1).pdf",
      type: "pdf",
      size: "12.7 MB",
      pages: "36",
      category: "team",
      featured: true,
      views: "12.8K",
      downloads: "2.9K",
      uploadDate: "2024-11-04",
      tags: ["enhanced", "team", "characters"]
    },
    {
      id: 3,
      title: "Moneypenny, Codex & The GOAT Royalty Force - Complete Edition",
      description: "Complete edition with bonus content and artwork",
      filename: "Moneypenny, Codex & The GOAT Royalty Force (2).pdf",
      type: "pdf",
      size: "15.3 MB",
      pages: "48",
      category: "team",
      featured: false,
      views: "9.4K",
      downloads: "2.1K",
      uploadDate: "2024-11-04",
      tags: ["complete", "bonus", "artwork"]
    },
    {
      id: 4,
      title: "Animation Brief - Talking GOAT (D-ID)",
      description: "Technical animation specifications for GOAT character",
      filename: "Animation Brief_ Talking GOAT (D-ID).docx",
      type: "docx",
      size: "2.1 MB",
      pages: "8",
      category: "animation",
      featured: false,
      views: "6.7K",
      downloads: "1.5K",
      uploadDate: "2024-11-04",
      tags: ["animation", "technical", "d-id"]
    },
    {
      id: 5,
      title: "Moneypenny, Codex & The GOAT Royalty Force - Word Version",
      description: "Editable Microsoft Word version for customization",
      filename: "Moneypenny, Codex & The GOAT Royalty Force.docx",
      type: "docx",
      size: "3.8 MB",
      pages: "24",
      category: "team",
      featured: false,
      views: "4.3K",
      downloads: "1.2K",
      uploadDate: "2024-11-04",
      tags: ["editable", "word", "customization"]
    },
    {
      id: 6,
      title: "Enhanced Documentation Package",
      description: "Complete documentation with extended team profiles",
      filename: "Moneypenny, Codex & The GOAT Royalty Force(1).docx",
      type: "docx",
      size: "4.2 MB",
      pages: "28",
      category: "team",
      featured: false,
      views: "3.9K",
      downloads: "987",
      uploadDate: "2024-11-04",
      tags: ["enhanced", "profiles", "extended"]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Documents', count: documents.length, icon: FileText },
    { id: 'team', name: 'Team Documentation', count: documents.filter(d => d.category === 'team').length, icon: Star },
    { id: 'animation', name: 'Animation Assets', count: documents.filter(d => d.category === 'animation').length, icon: TrendingUp }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
    setSelectedCategory(categoryId);
  };

  const getDocumentIcon = (type) => {
    return type === 'pdf' ? FileText : FileText;
  };

  const formatFileSize = (size) => {
    return size;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FileText className="w-8 h-8 text-blue-400" />
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Document Library
            </span>
          </h2>
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-white/70 text-lg">
          Official documentation, animation briefs, and team character profiles
        </p>
        <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
            {documents.length} Documents
          </span>
          <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
            Team Profiles
          </span>
          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
            Animation Assets
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search documents, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-white/60" />
            <span className="text-white/80">Filter:</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="md:col-span-1">
          <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Categories</span>
              </h3>
            </div>
            <div className="p-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isExpanded = expandedCategories.has(category.id);
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50' 
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="md:col-span-3">
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => {
              const IconComponent = getDocumentIcon(doc.type);
              
              return (
                <div
                  key={doc.id}
                  className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <IconComponent className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xl font-semibold text-white mb-1">
                            {doc.title}
                          </h4>
                          {doc.featured && (
                            <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Featured</span>
                            </div>
                          )}
                        </div>
                        <p className="text-white/70 text-sm mb-4">{doc.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {doc.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-white/60">
                            <span className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>{doc.type.toUpperCase()}</span>
                            </span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>{doc.pages} pages</span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{doc.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Download className="w-3 h-3" />
                              <span>{doc.downloads}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(`/docs/${encodeURIComponent(doc.filename)}`, '_blank')}
                              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                              title="View document"
                            >
                              <Eye className="w-4 h-4 text-white/80" />
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `/docs/${encodeURIComponent(doc.filename)}`;
                                link.download = doc.filename;
                                link.click();
                              }}
                              className="p-2 bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                              title="Download document"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-3 text-xs text-white/50">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Uploaded {doc.uploadDate}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No documents found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{documents.length}</div>
            <p className="text-white/60 text-sm">Total Documents</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{documents.filter(d => d.type === 'pdf').length}</div>
            <p className="text-white/60 text-sm">PDF Files</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{documents.filter(d => d.type === 'docx').length}</div>
            <p className="text-white/60 text-sm">Word Files</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {documents.reduce((sum, doc) => sum + parseInt(doc.downloads.replace('K', '000')), 0).toLocaleString()}
            </div>
            <p className="text-white/60 text-sm">Total Downloads</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLibrary;