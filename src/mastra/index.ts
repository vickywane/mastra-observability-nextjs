/**
 * Mastra Instance Configuration
 *
 * This file initializes the main Mastra instance with:
 * - Agent registration (weatherAgent)
 * - PostgreSQL storage for persistent memory
 * - Structured logging with Pino
 * - Observability integration for Mastra Cloud tracing
 */

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { PostgresStore } from "@mastra/pg";

import { weatherAgent } from "./agents/weather-agent";

export const mastra = new Mastra({
  // Register all agents that will be available in the application
  agents: { weatherAgent },

  // PostgreSQL storage for persisting agent memory and conversation context
  // Enables agents to maintain state across requests
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),

  // Structured logging using Pino for better debugging and monitoring
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),

  // Legacy telemetry config - deprecated in favor of observability
  telemetry: {
    enabled: false,
  },

  // Observability configuration for Mastra Cloud
  // Enables tracing, monitoring, and evaluation of agent performance
  observability: {
    default: { enabled: true },
  },
});
