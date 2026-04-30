import type { Command } from "../types/commands.js";
import { EmbedBuilder } from "discord.js";

export const helpCommand: Command = {
  name: "help",
  description: "Mostra todos os comandos disponíveis",

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📜 Comandos do Bot")
      .setDescription(`
🎵 **Música**
\`.play <música ou link>\`
\`.skip\` \`.pause\` \`.resume\` \`.stop\`

📜 **Fila**
\`.queue\` \`.now\` \`.remove <n>\` \`.shuffle\` \`.clear\`

🔁 **Modos**
\`.loop off/song/queue\`
\`.autoplay on/off\`

🔥 **Zoeira**
\`.israel\` → manda localização aleatória
\`.usa\` → simula doação aleatória

📚 **História**
\`.war\` → evento histórico envolvendo os EUA

🧠 **Perguntas**
\`.pergunta <sua pergunta?>\`

🔥 **Imagens**
\`.woman\`
\`.woman soft\`
\`.woman anime\`
\`.woman goth\`
\`.woman asian\`
\`.woman russian\`
\`.woman latina\`
`);

    await message.reply({ embeds: [embed] });
  },
};