import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useAuth } from '../store/AuthContext';
import { subDays, parseISO } from 'date-fns';

export default function ActivityHeatmap() {
  const { user } = useAuth();
  
  if (!user) return null;

  const today = new Date();
  const startDate = subDays(today, 180); // Show last 6 months

  return (
    <div className="glass-panel p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Activity Heatmap
        </h3>
      </div>
      
      <div className="heatmap-container -ml-2">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={user.activity.map(a => ({ date: parseISO(a.date), count: a.count }))}
          classForValue={(value: any) => {
            if (!value || value.count === 0) {
              return 'color-empty';
            }
            if (value.count === 1) return 'color-scale-1';
            if (value.count === 2) return 'color-scale-2';
            if (value.count === 3) return 'color-scale-3';
            return 'color-scale-4';
          }}
          tooltipDataAttrs={((value: any) => {
            if (!value || !value.date) {
              return { 'data-tooltip': 'No activity' };
            }
            return {
              'data-tooltip': `${value.date.toISOString().split('T')[0]}: ${value.count} contributions`
            };
          }) as any}
          showWeekdayLabels={true}
        />
      </div>

      <style>{`
        .heatmap-container svg {
          width: 100%;
          height: auto;
        }
        .react-calendar-heatmap text {
          font-size: 8px;
          fill: #A0A0B0;
        }
        .react-calendar-heatmap .color-empty {
          fill: rgba(255, 255, 255, 0.05);
          rx: 2;
          ry: 2;
        }
        .react-calendar-heatmap .color-scale-1 { fill: #3f20b3; rx: 2; ry: 2; }
        .react-calendar-heatmap .color-scale-2 { fill: #5A32FA; rx: 2; ry: 2; }
        .react-calendar-heatmap .color-scale-3 { fill: #8a6cfc; rx: 2; ry: 2; }
        .react-calendar-heatmap .color-scale-4 { fill: #b8a6fd; rx: 2; ry: 2; }
        
        .react-calendar-heatmap rect:hover {
          stroke: #fff;
          stroke-width: 1px;
        }
      `}</style>
    </div>
  );
}
