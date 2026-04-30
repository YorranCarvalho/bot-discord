import type { Command } from "../types/commands.js";
import { stopMusic } from "../services/music-player.js";

export const stopCommand: Command = {
  name: "stop",
  description: "Para a música e limpa a fila",

  async execute(message) {
    await stopMusic(message);
  },
};