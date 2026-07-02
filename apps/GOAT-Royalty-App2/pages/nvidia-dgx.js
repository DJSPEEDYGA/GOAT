/**
 * NVIDIA DGX Cloud Integration
 * GPU-accelerated AI computing and processing
 */

import React, { useState } from 'react';
import { Cpu, Zap, Activity, TrendingUp, Server, Cloud, Gauge, AlertCircle } from 'lucide-react';

export default function NvidiaDGX() {
  const [gpuLoad, setGpuLoad] = useState(67);

  const dgxStats = {
    gpuCount: 8,
    totalVRAM: '640 GB',
    computePower: '5 PetaFLOPS',
    activeJobs: 12,
    queuedJobs: 5,
    completedToday: 847
  };

  const activeJobs = [
    {
      id: 'JOB-001',
      name: 'AI Video Generation - Sora 2',
      gpu: 4,
      vram: '80 GB',
      progress: 78,
      eta: '2 min',
      status: 'running'
    },
    {
      id: 'JOB-002',
      name: 'Audio Enhancement - Gemini AI',
      gpu: 2,
      vram: '40 GB',
      progress: 45,
      eta: '5 min',
      status: 'running'
    },
    {
      id: 'JOB-003',
      name: 'Copyright Detection - Super Ninja',
      gpu: 1,
      vram: '20 GB',
      progress: 92,
      eta: '1 min',
      status: 'running'
    },
    {
      id: 'JOB-004',
      name: 'Royalty Analysis - Codex Engine',
      gpu: 1,
      vram: '20 GB',
      progress: 15,
      eta: '8 min',
      status: 'running'
    }
  ];

  const gpuMetrics = [
    { id: 1, name: 'GPU 0', load: 89, temp: 72, vram: 78, power: 350 },
    { id: 2, name: 'GPU 1', load: 92, temp: 75, vram: 85, power: 380 },
    { id: 3, name: 'GPU 2', load: 67, temp: 68, vram: 62, power: 320 },
    { id: 4, name: 'GPU 3', load: 71, temp: 70, vram: 68, power: 340 },
    { id: 5, name: 'GPU 4', load: 45, temp: 62, vram: 42, power: 280 },
    { id: 6, name: 'GPU 5', load: 38, temp: 60, vram: 35, power: 260 },
    { id: 7, name: 'GPU 6', load: 12, temp: 55, vram: 10, power: 180 },
    { id: 8, name: 'GPU 7', load: 8, temp: 52, vram: 5, power: 150 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">NVIDIA DGX Cloud</h1>
            <p className="text-gray-400">GPU-Accelerated AI Computing Platform</p>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-black/50 backdrop-blur-md border border-green-500/30 rounded-xl p-4">
            <Server className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{dgxStats.gpuCount}</p>
            <p className="text-gray-400 text-sm">GPUs</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-blue-500/30 rounded-xl p-4">
            <Zap className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{dgxStats.totalVRAM}</p>
            <p className="text-gray-400 text-sm">Total VRAM</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
            <Activity className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{dgxStats.computePower}</p>
            <p className="text-gray-400 text-sm">Compute</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-yellow-500/30 rounded-xl p-4">
            <TrendingUp className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{dgxStats.activeJobs}</p>
            <p className="text-gray-400 text-sm">Active Jobs</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-orange-500/30 rounded-xl p-4">
            <Cloud className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{dgxStats.queuedJobs}</p>
            <p className="text-gray-400 text-sm">Queued</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4">
            <Gauge className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-white">{dgxStats.completedToday}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPU Monitoring */}
        <div className="lg:col-span-2">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-400" />
              GPU Cluster Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gpuMetrics.map((gpu) => (
                <div
                  key={gpu.id}
                  className="bg-black/30 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-bold">{gpu.name}</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      gpu.load > 80 ? 'bg-red-500/20 text-red-400' :
                      gpu.load > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {gpu.load > 80 ? 'HIGH' : gpu.load > 50 ? 'MEDIUM' : 'LOW'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Load</span>
                        <span className="text-white font-semibold">{gpu.load}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            gpu.load > 80 ? 'bg-red-500' :
                            gpu.load > 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${gpu.load}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">VRAM</span>
                        <span className="text-white font-semibold">{gpu.vram}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${gpu.vram}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                      <span className="text-gray-400">Temp: {gpu.temp}°C</span>
                      <span className="text-gray-400">Power: {gpu.power}W</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Active Processing Jobs
            </h2>

            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-black/30 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-bold">{job.name}</p>
                      <p className="text-gray-400 text-xs">{job.id}</p>
                    </div>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                      RUNNING
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">GPUs</p>
                      <p className="text-white font-semibold">{job.gpu}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">VRAM</p>
                      <p className="text-white font-semibold">{job.vram}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">ETA</p>
                      <p className="text-white font-semibold">{job.eta}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-semibold">{job.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-600 to-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Submit New Job
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                View Queue
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Server className="w-5 h-5" />
                Cluster Settings
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">System Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Overall Load</span>
                  <span className="text-white font-bold">{gpuLoad}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500-500 to-emerald-500 h-3 rounded-full"
                    style={{ width: `${gpuLoad}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                  <span className="text-green-400 text-sm">Network</span>
                  <span className="text-green-400 font-bold">Optimal</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                  <span className="text-green-400 text-sm">Cooling</span>
                  <span className="text-green-400 font-bold">Normal</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                  <span className="text-green-400 text-sm">Power</span>
                  <span className="text-green-400 font-bold">Stable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Tracking */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Cost Tracking</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Today's Usage</p>
                <p className="text-3xl font-bold text-white">$247.50</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Monthly Total</p>
                <p className="text-2xl font-bold text-yellow-400">$6,842.00</p>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-gray-400 text-xs">Estimated Monthly</p>
                <p className="text-lg font-bold text-white">$8,500.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}