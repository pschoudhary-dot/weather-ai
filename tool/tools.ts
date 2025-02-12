import { tool } from "ai";
import { z } from "zod";

export const getWeather = tool({
  description: "Get the current weather in a given location",
  parameters: z.object({
    location: z
      .string()
      .describe("City, state, or country to get the weather for"),
  }),
  execute: async ({ location }) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}`); 
    const data = await response.json();
    return {
      location,
      temperature: data.main.temp,
      weather: data.weather[0].description,
    };
  },
});

export const weatherTools = {
  getWeather,
};