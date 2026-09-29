import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { api } from '../lib/api';
import { StatusResponse } from '../types';
import { 
  FileText, 
  Download, 
  Building2, 
  MapPin, 
  SlidersHorizontal, 
  CheckCircle2, 
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [reportType, setReportType] = useState('Event Report');
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [region, setRegion] = useState('All India');
  const [classification, setClassification] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [format, setFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  useEffect(() => {
    api.getStatus().then(setStatus);
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
      setTimeout(() => setGeneratedSuccess(false), 4000);
    }, 1200);
  };

  const recentReports = [
    { title: 'India Events Summary', date: 'Sep 28, 2026 10:30', format: 'PDF', size: '2.4 MB' },
    { title: 'Gujarat State Report', date: 'Sep 27, 2026 14:20', format: 'PDF', size: '1.8 MB' },
    { title: 'High Risk Events Export', date: 'Sep 26, 2026 14:10', format: 'Excel', size: '850 KB' },
    { title: 'Monthly Analytics Report', date: 'Aug 2026', format: 'PDF', size: '4.2 MB' },
    { title: 'Facility-wise Analysis', date: 'Sep 25, 2026 17:05', format: 'PDF', size: '3.1 MB' },
  ];

  if (!status) return null;

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans">
      <AppHeader status={status} />

      <main className="p-3.5 max-w-[1920px] mx-auto w-full flex-1 flex flex-col space-y-3">
        <div className="glass-panel p-4 rounded-xl border border-white/10 mb-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Intelligence Reports & Data Exports</h2>
          <p className="text-xs text-slate-400">Generate executive fire event summaries, facility risk reports, and regulatory compliance exports.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
          {/* Left Column: Report Templates */}
          <div className="lg:col-span-3 glass-panel p-4 rounded-xl border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Report Types</h4>
            {[
              { id: 'Event Report', desc: 'All classified incidents & anomalies', icon: FileText },
              { id: 'Facility Report', desc: 'Facility-wise thermal risk analysis', icon: Building2 },
              { id: 'State Report', desc: 'State & regional governance summary', icon: MapPin },
              { id: 'Custom Report', desc: 'Custom filters, classes & thresholds', icon: SlidersHorizontal },
            ].map(item => (
              <div
                key={item.id}
                onClick={() => setReportType(item.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  reportType === item.id
                    ? 'bg-blue-600/15 border-blue-500 shadow-glow'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                }`}
              >
                <item.icon className={`w-5 h-5 mt-0.5 ${reportType === item.id ? 'text-blue-400' : 'text-slate-400'}`} />
                <div>
                  <h5 className="text-xs font-bold text-white">{item.id}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Column: Report Generation Form */}
          <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/5">
                Generate {reportType}
              </h4>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Time Range</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Last 24 Hours" className="bg-[#0B1320]">Last 24 Hours</option>
                    <option value="Last 7 Days" className="bg-[#0B1320]">Last 7 Days</option>
                    <option value="Last 30 Days" className="bg-[#0B1320]">Last 30 Days</option>
                    <option value="Custom Range" className="bg-[#0B1320]">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Region / State</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="All India" className="bg-[#0B1320]">All India</option>
                    <option value="Gujarat" className="bg-[#0B1320]">Gujarat</option>
                    <option value="Assam" className="bg-[#0B1320]">Assam</option>
                    <option value="Odisha" className="bg-[#0B1320]">Odisha</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Event Classification</label>
                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All" className="bg-[#0B1320]">All Classes</option>
                      <option value="industrial_fire" className="bg-[#0B1320]">Industrial Fire</option>
                      <option value="gas_flare_persistent" className="bg-[#0B1320]">Gas Flare</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Risk Level</label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All" className="bg-[#0B1320]">All Risks</option>
                      <option value="Critical" className="bg-[#0B1320]">Critical (≥ 80)</option>
                      <option value="High" className="bg-[#0B1320]">High (≥ 60)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1.5">Export Format</label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setFormat('PDF')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                        format === 'PDF'
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-red-400" />
                      <span>PDF Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('Excel')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                        format === 'Excel'
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Report...</span>
                  </>
                ) : generatedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Report Ready (Downloaded)</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Recent Reports */}
          <div className="lg:col-span-4 glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-2 border-b border-white/5">
                Recent Reports
              </h4>

              <div className="space-y-2.5">
                {recentReports.map((rpt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        {rpt.format === 'PDF' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-blue-300">
                          {rpt.title}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {rpt.date} · {rpt.size}
                        </p>
                      </div>
                    </div>

                    <button
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
