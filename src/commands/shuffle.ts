import type { Command } from "../types/commands.js";
import { shuffleQueue } from "../services/music-player.js";

export const shuffleCommand: Command = {
  name: "shuffle",
  description: "Embaralha a fila",

  async execute(message) {
    await shuffleQueue(message);
  },
};