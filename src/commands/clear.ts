import type { Command } from "../types/commands.js";
import { clearQueue } from "../services/music-player.js";

export const clearCommand: Command = {
  name: "clear",
  description: "Limpa a fila sem parar a música atual",

  async execute(message) {
    await clearQueue(message);
  },
};