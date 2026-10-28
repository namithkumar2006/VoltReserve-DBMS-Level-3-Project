import { NextResponse } from 'next/server';
import { getAnalytics, getDB, getNoSqlTelemetryAggregation } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { queryKey } = await request.json();
    const db = getDB();

    let title = '';
    let sqlText = '';
    let concept = '';
    let result: any = null;

    switch (queryKey) {
      case 'cte_peakhours':
        title = 'Query 1: Peak Hour Traffic via CTE (Common Table Expression)';
        concept = 'Unit 2 & 3: CTE with GROUP BY, Aggregate SUM/COUNT, and CASE classifications';
        sqlText = `WITH HourlyReservations AS (
    SELECT 
        EXTRACT(HOUR FROM start_time) AS reservation_hour,
        COUNT(*) AS booking_count,
        SUM(estimated_cost) AS total_projected_revenue
    FROM reservations
    WHERE status != 'CANCELLED'
    GROUP BY EXTRACT(HOUR FROM start_time)
)
SELECT 
    reservation_hour,
    booking_count,
    total_projected_revenue,
    CASE 
        WHEN booking_count >= 2 THEN 'HIGH_PEAK'
        WHEN booking_count = 1 THEN 'MODERATE'
        ELSE 'LOW_DEMAND'
    END AS traffic_classification
FROM HourlyReservations
ORDER BY booking_count DESC;`;
        result = getAnalytics().peakHoursCTE.filter(p => p.bookings > 0);
        break;

      case 'window_denserank':
        title = 'Query 2: Station Revenue Ranking via Window Function DENSE_RANK()';
        concept = 'Unit 2: Analytical Window Functions (OVER, PARTITION BY, DENSE_RANK)';
        sqlText = `SELECT 
    cs.name AS station_name,
    cs.city,
    COUNT(csess.session_id) AS sessions_handled,
    COALESCE(SUM(csess.total_amount), 0.0) AS total_revenue_inr,
    DENSE_RANK() OVER (
        PARTITION BY cs.city 
        ORDER BY COALESCE(SUM(csess.total_amount), 0.0) DESC
    ) AS city_revenue_rank
FROM charging_stations cs
JOIN chargers c ON cs.station_id = c.station_id
LEFT JOIN charging_sessions csess ON c.charger_id = csess.charger_id
GROUP BY cs.station_id, cs.name, cs.city;`;
        result = getAnalytics().stationRankings;
        break;

      case 'view_status':
        title = 'View: vw_station_live_status Real-time Availability';
        concept = 'Unit 1 & 2: Database Views with conditional aggregation and multi-table joins';
        sqlText = `SELECT * FROM vw_station_live_status;`;
        result = db.stations.map(st => {
          const chgs = db.chargers.filter(c => c.station_id === st.station_id);
          return {
            station_name: st.name,
            total_chargers: chgs.length,
            available: chgs.filter(c => c.current_status === 'AVAILABLE').length,
            reserved: chgs.filter(c => c.current_status === 'RESERVED').length,
            occupied: chgs.filter(c => c.current_status === 'OCCUPIED').length,
            maintenance: chgs.filter(c => c.current_status === 'UNDER_MAINTENANCE').length
          };
        });
        break;

      case 'nosql_pipeline':
        title = 'NoSQL (MongoDB) Aggregation: IoT Battery Thermal Stress Detection';
        concept = 'Unit 4: NoSQL Aggregation Framework ($match, $group, $cond, $project)';
        sqlText = `// MongoDB Aggregation Pipeline
db.charger_telemetry.aggregate([
  { $match: { timestamp: { $gte: ISODate("2026-10-27T00:00:00Z") } } },
  { $group: {
      _id: { station: "$station_id", charger: "$charger_id" },
      avg_power_kw: { $avg: "$measurements.power_kw" },
      max_battery_temp: { $max: "$measurements.battery_temperature_celsius" },
      overheating_events: { $sum: { $cond: [{ $gt: ["$measurements.battery_temperature_celsius", 42] }, 1, 0] } }
  }},
  { $project: { health_status: { $cond: [{ $gt: ["$overheating_events", 0] }, "THERMAL_WARNING", "HEALTHY"] } } }
]);`;
        result = getNoSqlTelemetryAggregation();
        break;

      default:
        return NextResponse.json({ error: 'Unknown query identifier' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      title,
      concept,
      sqlText,
      result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
