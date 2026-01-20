/**
 * Weather Tool
 *
 * A Mastra tool that fetches current weather data for any city using the
 * Open-Meteo API (free, no API key required).
 *
 * How it works:
 * 1. Geocodes the city name to coordinates using Open-Meteo Geocoding API
 * 2. Fetches current weather data using Open-Meteo Forecast API
 * 3. Returns formatted weather information with human-readable conditions
 *
 * Uses Zod schemas for input/output validation (Mastra template requirement)
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Type definitions for Open-Meteo API responses
interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}

interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

/**
 * Weather tool definition with Zod validation schemas
 * The agent uses this tool to fetch real-time weather data
 */
export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",

  // Input validation using Zod
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),

  // Output validation using Zod
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),

  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

/**
 * Fetches weather data for a given location
 * Uses Open-Meteo's free APIs for geocoding and weather data
 */
const getWeather = async (location: string) => {
  // Step 1: Geocode the city name to get coordinates
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  // Step 2: Fetch current weather using coordinates
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  // Step 3: Return formatted weather data
  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

/**
 * Maps WMO weather codes to human-readable condition strings
 * @see https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Unknown";
}
