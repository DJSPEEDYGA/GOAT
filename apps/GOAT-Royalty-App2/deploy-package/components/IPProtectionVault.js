import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, Lock, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const IPProtectionVault = () => {
  const [selectedTab, setSelectedTab] = useState('copyrights');

  const copyrights = [
    { id: 1, title: 'Summer Vibes', status: 'Registered', date: '2024-01-15', number: 'CR-2024-001234' },
    { id: 2, title: 'Midnight Dreams', status: 'Pending', date: '2024-09-20', number: 'CR-2024-005678' },
    { id: 3, title: 'Electric Soul', status: 'Registered', date: '2023-11-10', number: 'CR-2023-009876' },
    { id: 4, title: 'Urban Rhythm', status: 'Registered', date: '2024-03-05', number: 'CR-2024-002345' }
  ];

  const trademarks = [
    { id: 1, name: 'GOAT Records', status: 'Active', expires: '2027-12-31', class: 'Class 41' },
    { id: 2, name: 'DJ Speedy Logo', status: 'Active', expires: '2026-06-15', class: 'Class 9' }
  ];

  const contracts = [
    { id: 1, title: 'Universal Music Distribution', status: 'Active', expires: '2025-12-31', value: '$50,000' },
    { id: 2, title: 'Spotify Exclusive Deal', status: 'Active', expires: '2026-03-15', value: '$25,000' },
    { id: 3, title: 'Publishing Rights Agreement', status: 'Expiring Soon', expires: '2024-11-30', value: '$15,000' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <ShieldCheck className="w-5 h-5" />
            IP Protection Vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={selectedTab === 'copyrights' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('copyrights')}
              className={selectedTab === 'copyrights' ? 'bg-orange-600' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              Copyrights
            </Button>
            <Button
              variant={selectedTab === 'trademarks' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('trademarks')}
              className={selectedTab === 'trademarks' ? 'bg-orange-600' : ''}
            >
              <Lock className="w-4 h-4 mr-2" />
              Trademarks
            </Button>
            <Button
              variant={selectedTab === 'contracts' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('contracts')}
              className={selectedTab === 'contracts' ? 'bg-orange-600' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              Contracts
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Total Copyrights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{copyrights.length}</div>
            <div className="text-xs text-green-400 mt-1">3 registered, 1 pending</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Active Trademarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{trademarks.length}</div>
            <div className="text-xs text-blue-400 mt-1">All active</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{contracts.length}</div>
            <div className="text-xs text-yellow-400 mt-1">1 expiring soon</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Protection Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">95%</div>
            <div className="text-xs text-gray-400 mt-1">Excellent</div>
          </CardContent>
        </Card>
      </div>

      {selectedTab === 'copyrights' && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Copyright Registrations</span>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Register New Copyright
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {copyrights.map((copyright) => (
                <div key={copyright.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      copyright.status === 'Registered' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}>
                      {copyright.status === 'Registered' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{copyright.title}</div>
                      <div className="text-sm text-gray-400">
                        {copyright.number} • Registered: {copyright.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      copyright.status === 'Registered' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {copyright.status}
                    </span>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'trademarks' && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Trademark Registrations</span>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Register New Trademark
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trademarks.map((trademark) => (
                <div key={trademark.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{trademark.name}</div>
                      <div className="text-sm text-gray-400">
                        {trademark.class} • Expires: {trademark.expires}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      {trademark.status}
                    </span>
                    <Button size="sm" variant="outline">Renew</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'contracts' && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Active Contracts</span>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Upload New Contract
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      contract.status === 'Expiring Soon' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                    }`}>
                      {contract.status === 'Expiring Soon' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{contract.title}</div>
                      <div className="text-sm text-gray-400">
                        Value: {contract.value} • Expires: {contract.expires}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      contract.status === 'Expiring Soon'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {contract.status}
                    </span>
                    <Button size="sm" variant="outline">View Contract</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IPProtectionVault;