import { useState } from 'react';
import { defaultExperiments, Experiment } from './index';
import { BarChart3, Users, TrendingUp, Settings, Play, Pause, Trash2, Plus, CheckCircle } from 'lucide-react';

interface ExperimentStats {
  experimentId: string;
  variants: {
    name: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }[];
  totalVisitors: number;
  startDate: string;
  status: 'running' | 'paused' | 'completed';
}

// Mock statistics for demo
const mockStats: ExperimentStats[] = [
  {
    experimentId: 'exchange_form_layout',
    variants: [
      { name: 'control', visitors: 12453, conversions: 1867, conversionRate: 15.0 },
      { name: 'compact', visitors: 12287, conversions: 2089, conversionRate: 17.0 },
      { name: 'expanded', visitors: 12390, conversions: 1858, conversionRate: 15.0 },
    ],
    totalVisitors: 37130,
    startDate: '2024-01-15',
    status: 'running',
  },
  {
    experimentId: 'cta_button_color',
    variants: [
      { name: 'emerald', visitors: 8234, conversions: 1482, conversionRate: 18.0 },
      { name: 'blue', visitors: 8156, conversions: 1386, conversionRate: 17.0 },
      { name: 'purple', visitors: 8198, conversions: 1311, conversionRate: 16.0 },
    ],
    totalVisitors: 24588,
    startDate: '2024-01-20',
    status: 'running',
  },
  {
    experimentId: 'reviews_display',
    variants: [
      { name: 'grid_3col', visitors: 5672, conversions: 567, conversionRate: 10.0 },
      { name: 'grid_2col', visitors: 5543, conversions: 610, conversionRate: 11.0 },
      { name: 'list', visitors: 5621, conversions: 505, conversionRate: 9.0 },
    ],
    totalVisitors: 16836,
    startDate: '2024-01-25',
    status: 'paused',
  },
];

export function ABTestingDashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>(defaultExperiments);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [showNewExperiment, setShowNewExperiment] = useState(false);

  // Calculate overall stats
  const overallStats = {
    totalExperiments: experiments.length,
    activeExperiments: experiments.filter(e => e.active).length,
    totalVisitors: mockStats.reduce((acc, s) => acc + s.totalVisitors, 0),
    avgConversionRate: 15.3,
  };

  const getExperimentStats = (experimentId: string) => {
    return mockStats.find(s => s.experimentId === experimentId);
  };

  const getExperimentById = (experimentId: string) => {
    return experiments.find(e => e.id === experimentId);
  };

  const toggleExperiment = (experimentId: string) => {
    setExperiments(prev =>
      prev.map(e =>
        e.id === experimentId ? { ...e, active: !e.active } : e
      )
    );
  };

  const getWinningVariant = (stats: ExperimentStats) => {
    const winner = [...stats.variants].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    return winner;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">A/B Testing Dashboard</h1>
            <p className="text-slate-400">Manage and analyze your experiments</p>
          </div>
          <button
            onClick={() => setShowNewExperiment(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            <span>New Experiment</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold">{overallStats.totalExperiments}</span>
            </div>
            <div className="text-slate-400">Total Experiments</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <Play className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold text-emerald-400">{overallStats.activeExperiments}</span>
            </div>
            <div className="text-slate-400">Active Experiments</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold">{overallStats.totalVisitors.toLocaleString()}</span>
            </div>
            <div className="text-slate-400">Total Visitors</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold">{overallStats.avgConversionRate}%</span>
            </div>
            <div className="text-slate-400">Avg Conversion Rate</div>
          </div>
        </div>

        {/* Experiments List */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold">Experiments</h2>
          </div>
          <div className="divide-y divide-slate-700/50">
            {experiments.map((experiment) => {
              const stats = getExperimentStats(experiment.id);
              const winner = stats ? getWinningVariant(stats) : null;

              return (
                <div
                  key={experiment.id}
                  className="p-6 hover:bg-slate-700/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedExperiment(selectedExperiment === experiment.id ? null : experiment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{experiment.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          experiment.active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {experiment.active ? 'Active' : 'Paused'}
                        </span>
                        {winner && (
                          <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>Leader: {winner.name} ({winner.conversionRate}%)</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>ID: {experiment.id}</span>
                        <span>Variants: {experiment.variants.join(', ')}</span>
                        {stats && <span>Visitors: {stats.totalVisitors.toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExperiment(experiment.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          experiment.active
                            ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={experiment.active ? 'Pause' : 'Resume'}
                      >
                        {experiment.active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-colors"
                        title="Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Stats */}
                  {selectedExperiment === experiment.id && stats && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <h4 className="font-medium mb-4">Variant Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.variants.map((variant) => {
                          const isWinner = winner?.name === variant.name;
                          return (
                            <div
                              key={variant.name}
                              className={`p-4 rounded-xl border ${
                                isWinner
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : 'bg-slate-700/30 border-slate-600/30'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-medium capitalize">{variant.name}</span>
                                {isWinner && (
                                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                    Winner
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Visitors</span>
                                  <span>{variant.visitors.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Conversions</span>
                                  <span>{variant.conversions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Conv. Rate</span>
                                  <span className={isWinner ? 'text-emerald-400 font-semibold' : ''}>
                                    {variant.conversionRate}%
                                  </span>
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="h-2 bg-slate-600/50 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isWinner ? 'bg-emerald-500' : 'bg-slate-500'
                                    }`}
                                    style={{ width: `${variant.conversionRate * 5}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-4 mt-6">
                        <button className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                          Export Data
                        </button>
                        <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors">
                          Apply Winner
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* New Experiment Modal */}
        {showNewExperiment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full border border-slate-700 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Create New Experiment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Experiment Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Homepage Hero Test"
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Experiment ID</label>
                  <input
                    type="text"
                    placeholder="e.g., homepage_hero_test"
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Variants (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., control, variant_a, variant_b"
                    className="w-full bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/50 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={() => setShowNewExperiment(false)}
                    className="flex-1 py-3 bg-slate-700 rounded-xl font-medium hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowNewExperiment(false)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    Create Experiment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ABTestingDashboard;
