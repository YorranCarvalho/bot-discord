import { EmbedBuilder } from "discord.js";
import type { Command } from "../types/commands.js";

interface DanbooruPost {
  file_url: string;
}

export const animeCommand: Command = {
  name: "anime",
  description: "Busca imagem de anime (safe)",

  async execute(message, args) {
    const query = args.join(" ");

    if (!query) {
      await message.reply("❌ Digita algo. Ex: `.anime rem re:zero`");
      return;
    }

    try {
      const tags = encodeURIComponent(`${query} rating:s`);

      const res = await fetch(
        `https://danbooru.donmai.us/posts.json?tags=${tags}&limit=20`
      );

      const data: DanbooruPost[] = await res.json();

      if (!data.length) {
        await message.reply("❌ Não achei nada.");
        return;
      }

      const random = data[Math.floor(Math.random() * data.length)];

      if (!random.file_url) {
        await message.reply("❌ Imagem inválida.");
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`✨ Resultado: ${query}`)
        .setImage(random.file_url)
        .setColor(0xff69b4);

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await message.reply("❌ Deu erro ao buscar imagem.");
    }
  },
};