import type { Command } from "../types/commands.js";
import { pauseMusic } from "../services/music-player.js";

export const pauseCommand: Command = {
  name: "pause",
  description: "Pausa a música atual",

  async execute(message) {
    await pauseMusic(message);
  },
};