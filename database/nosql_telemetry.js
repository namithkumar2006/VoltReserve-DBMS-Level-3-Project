/**
 * ============================================================================
 * DBMS Experiential Learning - Level 3 Project
 * VoltReserve - NoSQL (MongoDB) Database Component: IoT Telemetry & Analytics
 * Authors: Namith Kumar Chandrakumar (PES1UG24AM171), Kushal G (PES1UG24AM145)
 * Institution: PES University
 * ============================================================================
 * 
 * JUSTIFICATION FOR NoSQL PARADIGM (MongoDB):
 * Relational databases excel at ACID transactions, strict schema consistency,
 * and foreign-key integrity for Reservations and Billing.
 * However, EV Chargers emit high-frequency telemetry data (voltage, amperage,
 * pack temperature, insulation resistance) every 5-10 seconds.
 * Storing high-velocity, polymorphic time-series telemetry in SQL causes table
 * bloat, rigid schema lock-in, and write bottlenecks.
 * 
 * MongoDB provides:
 * 1. Schema-flexible JSON documents ideal for varied hardware IoT sensor payloads.
 * 2. High write throughput for time-series sensor ingestion.
 * 3. Rich Aggregation Framework ($group, $match, $bucket, $project) for health analytics.
 * ============================================================================
 */

// Connection to MongoDB
// const { MongoClient } = require('mongodb');
// const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

// ----------------------------------------------------------------------------
// 1. COLLECTION SCHEMA DEFINITION: `charger_telemetry`
// ----------------------------------------------------------------------------
const sampleTelemetryDocument = {
  _id: "ObjectId('671fd8a9947d10e012345678')",
  charger_id: "chg_101",
  station_id: "stn_001",
  session_id: "sess_001",
  timestamp: new Date("2026-10-28T10:15:30.000Z"),
  measurements: {
    voltage_volts: 412.5,
    current_amps: 145.2,
    power_kw: 59.89,
    battery_temperature_celsius: 34.8,
    ambient_temperature_celsius: 27.2,
    state_of_charge_pct: 42
  },
  diagnostics: {
    insulation_resistance_kohm: 500,
    connector_locked: true,
    cooling_fan_rpm: 3200,
    fault_code: "NONE"
  },
  metadata: {
    firmware_version: "v4.2.1-OCPP1.6J",
    grid_phase_balance: 0.99
  }
};

// ----------------------------------------------------------------------------
// 2. INDEXING STRATEGY
// Compound index on charger_id and timestamp for rapid time-series range queries
// ----------------------------------------------------------------------------
// db.charger_telemetry.createIndex({ "charger_id": 1, "timestamp": -1 });
// db.charger_telemetry.createIndex({ "station_id": 1, "measurements.battery_temperature_celsius": 1 });

// ----------------------------------------------------------------------------
// 3. ADVANCED NoSQL AGGREGATION PIPELINE 1: Thermal & Grid Stress Detection
// Identifies chargers running dangerously hot (> 45 deg C) or experiencing voltage sags
// ----------------------------------------------------------------------------
const thermalStressAggregation = [
  {
    $match: {
      timestamp: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    }
  },
  {
    $group: {
      _id: {
        station_id: "$station_id",
        charger_id: "$charger_id"
      },
      avg_power_kw: { $avg: "$measurements.power_kw" },
      max_power_kw: { $max: "$measurements.power_kw" },
      avg_battery_temp: { $avg: "$measurements.battery_temperature_celsius" },
      max_battery_temp: { $max: "$measurements.battery_temperature_celsius" },
      total_telemetry_ticks: { $sum: 1 },
      overheating_events: {
        $sum: {
          $cond: [{ $gt: ["$measurements.battery_temperature_celsius", 42.0] }, 1, 0]
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      station_id: "$_id.station_id",
      charger_id: "$_id.charger_id",
      avg_power_kw: { $round: ["$avg_power_kw", 2] },
      max_power_kw: { $round: ["$max_power_kw", 2] },
      max_battery_temp: { $round: ["$max_battery_temp", 1] },
      overheating_events: 1,
      health_status: {
        $cond: {
          if: { $gt: ["$overheating_events", 0] },
          then: "THERMAL_WARNING",
          else: "HEALTHY"
        }
      }
    }
  },
  {
    $sort: { overheating_events: -1, max_power_kw: -1 }
  }
];

// ----------------------------------------------------------------------------
// 4. ADVANCED NoSQL AGGREGATION PIPELINE 2: User Sentiment & Tag Extraction
// Evaluates customer reviews with rating bucketing and word aggregation
// ----------------------------------------------------------------------------
const reviewSentimentAggregation = [
  {
    $bucket: {
      groupBy: "$rating",
      boundaries: [1, 3, 5, 6],
      default: "Other",
      output: {
        count: { $sum: 1 },
        stations_reviewed: { $addToSet: "$station_id" },
        sample_feedback: { $push: "$comment" }
      }
    }
  }
];

module.exports = {
  sampleTelemetryDocument,
  thermalStressAggregation,
  reviewSentimentAggregation
};
