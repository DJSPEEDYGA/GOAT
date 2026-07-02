import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Globe, Music, DollarSign, TrendingUp, FileText } from 'lucide-react';

const MoneypennyAI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setSearchResults([
        {
          id: 1,
          title: 'Royalty Payment - Q4 2024',
          type: 'Payment',
          amount: '$12,450.00',
          date: '2024-10-15',
          status: 'Pending'
        },
        {
          id: 2,
          title: 'Track Performance Report',
          type: 'Report',
          tracks: 45,
          plays: '2.3M',
          date: '2024-10-20'
        },
        {
          id: 3,
          title: 'Contract Review - Universal Music',
          type: 'Contract',
          status: 'Active',
          expires: '2025-12-31'
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Search className="w-5 h-5" />
            Moneypenny AI Search Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search royalties, contracts, payments, tracks..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                Payments
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Music className="w-3 h-3 mr-1" />
                Tracks
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Contracts
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Search Results</h3>
          {searchResults.map((result) => (
            <Card key={result.id} className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        {result.type}
                      </span>
                      <h4 className="text-white font-medium">{result.title}</h4>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      {result.amount && <div>Amount: {result.amount}</div>}
                      {result.tracks && <div>Tracks: {result.tracks} | Plays: {result.plays}</div>}
                      {result.status && <div>Status: {result.status}</div>}
                      {result.date && <div>Date: {result.date}</div>}
                      {result.expires && <div>Expires: {result.expires}</div>}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="cursor-pointer hover:text-blue-400">Q4 2024 payments</div>
              <div className="cursor-pointer hover:text-blue-400">Top performing tracks</div>
              <div className="cursor-pointer hover:text-blue-400">Contract renewals</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Searches</span>
                <span className="text-white font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">This Month</span>
                <span className="text-white font-medium">89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="cursor-pointer hover:text-blue-400">Review pending payments</div>
              <div className="cursor-pointer hover:text-blue-400">Check contract expirations</div>
              <div className="cursor-pointer hover:text-blue-400">Analyze top tracks</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoneypennyAI;