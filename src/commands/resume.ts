import type { Command } from "../types/commands.js";
import { resumeMusic } from "../services/music-player.js";

export const resumeCommand: Command = {
  name: "resume",
  description: "Continua a música pausada",

  async execute(message) {
    await resumeMusic(message);
  },
};