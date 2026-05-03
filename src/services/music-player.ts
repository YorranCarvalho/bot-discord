import type { Message } from "discord.js";
import { ChannelType } from "discord.js";
import { lavalink } from "../index.js";

const getPlayer = (message: Message) => {
  if (!message.guild) return null;
  return lavalink.getPlayer(message.guild.id);
};

export const addToQueue = async (message: Message, query: string) => {
  const voiceChannel = message.member?.voice.channel;

  if (!message.guild || !voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await message.reply("❌ Você precisa estar em um canal de voz.");
    return;
  }

  const player =
    lavalink.getPlayer(message.guild.id) ||
    lavalink.createPlayer({
      guildId: message.guild.id,
      voiceChannelId: voiceChannel.id,
      textChannelId: message.channel.id,
      selfDeaf: false,
    });

  await player.connect();

  const result = await player.search(
    {
      query,
      source: "youtube",
    },
    message.author
  );

  const track = result.tracks[0];

  if (!track) {
    await message.reply("❌ Não encontrei nada.");
    return;
  }

  await player.queue.add(track);

  if (!player.playing && !player.paused) {
    await player.play();
    return;
  }

  await message.reply(`✅ Adicionado à fila: **${track.info.title}**`);
};

export const skipMusic = async (message: Message) => {
  const player = getPlayer(message);

  if (!player) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  await player.skip();
  await message.reply("⏭️ Pulando...");
};

export const pauseMusic = async (message: Message) => {
  const player = getPlayer(message);

  if (!player || !player.playing) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  await player.pause();
  await message.reply("⏸️ Pausado.");
};

export const resumeMusic = async (message: Message) => {
  const player = getPlayer(message);

  if (!player || !player.paused) {
    await message.reply("❌ Não tem música pausada.");
    return;
  }

  await player.resume();
  await message.reply("▶️ Continuando.");
};

export const stopMusic = async (message: Message) => {
  const player = getPlayer(message);

  if (!player) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  await player.destroy();
  await message.reply("⏹️ Parei tudo e limpei a fila.");
};

export const getQueue = (message: Message) => {
  const player = getPlayer(message);

  if (!player) return [];

  return player.queue.tracks;
};

export const getNowPlaying = (message: Message) => {
  const player = getPlayer(message);

  if (!player) return null;

  return player.queue.current ?? null;
};

export const removeFromQueue = async (message: Message, position: number) => {
  const player = getPlayer(message);

  if (!player) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  const index = position - 1;

  if (Number.isNaN(index) || index < 0 || index >= player.queue.tracks.length) {
    await message.reply("❌ Posição inválida.");
    return;
  }

  const removed = player.queue.tracks[index];

  player.queue.tracks.splice(index, 1);

  await message.reply(`🗑️ Removido da fila: **${removed.info.title}**`);
};

export const clearQueue = async (message: Message) => {
  const player = getPlayer(message);

  if (!player) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  player.queue.tracks.splice(0, player.queue.tracks.length);

  await message.reply("🧹 Fila limpa. A música atual continua tocando.");
};

export const shuffleQueue = async (message: Message) => {
  const player = getPlayer(message);

  if (!player) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  const queue = player.queue.tracks;

  if (queue.length < 2) {
    await message.reply("❌ Precisa ter pelo menos 2 músicas na fila.");
    return;
  }

  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const current = queue[i];
    const random = queue[j];

    queue[i] = random;
    queue[j] = current;
  }

  await message.reply("🔀 Fila embaralhada.");
};

export const setLoopMode = async (
  message: Message,
  mode: "off" | "song" | "queue"
) => {
  const player = getPlayer(message);

  if (!player) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  if (mode === "off") {
    player.setRepeatMode("off");
  }

  if (mode === "song") {
    player.setRepeatMode("track");
  }

  if (mode === "queue") {
    player.setRepeatMode("queue");
  }

  const labels = {
    off: "desativado",
    song: "repetindo música atual",
    queue: "repetindo fila",
  };

  await message.reply(`🔁 Loop ${labels[mode]}.`);
};

export const setAutoplay = async (message: Message, enabled: boolean) => {
  const player = getPlayer(message);

  if (!player) {
    await message.reply("❌ Nada tocando.");
    return;
  }

  player.setRepeatMode(enabled ? "queue" : "off");

  await message.reply(
    enabled
      ? "✨ Autoplay ainda não está implementado no Lavalink. Ativei loop da fila por enquanto."
      : "✨ Autoplay desativado."
  );
};