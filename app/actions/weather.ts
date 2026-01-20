"use server";

import { mastra } from "../../src/mastra";

export async function getWeatherInfo(formData: FormData) {
  const city = formData.get("city")?.toString();

  if (!city) {
    throw new Error("City is required");
  }

  const agent = mastra.getAgent("weatherAgent");
  const result = await agent.generate(`What's the weather like in ${city}?`);

  return result.text;
}
