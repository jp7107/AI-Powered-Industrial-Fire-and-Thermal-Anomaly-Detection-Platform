import React from 'react';
import { 
  ExternalLink, 
  MapPin, 
  Eye, 
  ChevronRight,
  Flame,
  Activity
} from 'lucide-react';
import { EventDetail } from '../../types';
import { Link } from 'react-router-dom';

interface RecentEventsTableProps {
  events: EventDetail[];
  selectedEventId?: string;
  onSelectEvent: (event: EventDetail) => void;
}

export const RecentEventsTable: React.FC<RecentEventsTableProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  const getClassColor = (cls: string) => {
    switch (cls) {
      case 'industrial_fire':
        return '#FF3B47';
      case 'gas_flare_persistent':
        return '#FF8A1F';
      case 'wildfire_forest':
        return '#22C55E';
      case 'agricultural_burning':
        return '#F5B82E';
      case 'mining_activity':
        return '#A855F7';
      default:
        return '#B8C0CC';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500 font-bold';
    if (score >= 60) return 'text-orange-400 font-bold';
    if (score >= 40) return 'text-amber-400 font-semibold';
    return 'text-cyan-400';
  };

  return (
    <div className="w-full glass-panel p-4 rounded-xl border border-white/10 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Recent Events
          </h4>
        </div>
        <Link
          to="/events"
          className="flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View All Events</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-white/5 text-[11px]">
              <th className="py-2 px-3 font-medium">#</th>
              <th className="py-2 px-3 font-medium">Time (UTC)</th>
              <th className="py-2 px-3 font-medium">Location</th>
              <th className="py-2 px-3 font-medium">Classification</th>
              <th className="py-2 px-3 font-medium">Risk Score</th>
              <th className="py-2 px-3 font-medium">Confidence</th>
              <th className="py-2 px-3 font-medium">Source</th>
              <th className="py-2 px-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {events.slice(0, 6).map((evt) => {
              const isSelected = evt.id === selectedEventId || evt.numeric_id.toString() === selectedEventId;
              const dotColor = getClassColor(evt.event_class);

              return (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className={`hover:bg-white/[0.04] cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-600/10 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-300">
                    {evt.numeric_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap tabular-nums">
                    {new Date(evt.first_detected_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'UTC'
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate">
                    {evt.place_name}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                      <span className="text-slate-200 capitalize">
                        {evt.event_class.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className={`py-2.5 px-3 tabular-nums ${getRiskColor(evt.risk_score)}`}>
                    {evt.risk_score}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                    {evt.class_confidence}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {evt.sensor || 'VIIRS'}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2 text-slate-400">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className="hover:text-blue-400 transition-colors p-1"
                        title="Locate on Map"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={`/events/${evt.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-white transition-colors p-1"
                        title="Open Event Detail Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
