import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";

import type { GuildMember, Message } from "discord.js";
import { ChannelType, EmbedBuilder } from "discord.js";
import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";

const require = createRequire(import.meta.url);
const spotifyUrlInfo = require("spotify-url-info");
const { getData } = spotifyUrlInfo(fetch);

const MAX_PLAYLIST_SIZE = 50;
const COOKIES_PATH =
  process.env.YOUTUBE_COOKIES_PATH ?? "/home/ubuntu/bot-discord/cookies.txt";

let player: Player | null = null;
let extractorsReady = false;

const getYoutubeCookie = () => {
  if (!existsSync(COOKIES_PATH)) return undefined;
  return readFileSync(COOKIES_PATH, "utf8");
};

const getPlayer = async (message: Message) => {
  if (!player) {
    player = new Player(message.client as any);

    player.events.on("playerStart", async (queue, track) => {
      const metadata = queue.metadata as Message | undefined;
      if (!metadata?.channel.isSendable()) return;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🎵 Tocando agora")
        .setDescription(`**${track.title}**`)
        .addFields({
          name: "Pedido por",
          value: track.requestedBy?.username ?? "Desconhecido",
          inline: true,
        });

      await metadata.channel.send({ embeds: [embed] });
    });

    player.events.on("error", (_, error) => {
      console.error("Erro no player:", error);
    });

    player.events.on("playerError", (_, error) => {
      console.error("Erro ao tocar música:", error);
    });
  }

  if (!extractorsReady) {
    await player.extractors.register(YoutubeiExtractor, {
      cookie: getYoutubeCookie(),
      disablePlayer: true,
      ignoreSignInErrors: true,
      overrideBridgeMode: "ytmusic",
      streamOptions: {
        useClient: "ANDROID",
      },
    } as any);

    extractorsReady = true;
  }

  return player;
};

const isSpotifyUrl = (input: string) => input.includes("open.spotify.com");

const isString = (value: string | null): value is string =>
  typeof value === "string";

const getSpotifyArtistNames = (track: any): string => {
  if (Array.isArray(track.artists)) {
    return track.artists.map((artist: any) => artist.name).join(", ");
  }

  if (Array.isArray(track.album?.artists)) {
    return track.album.artists.map((artist: any) => artist.name).join(", ");
  }

  if (track.artist) return String(track.artist);
  if (track.subtitle) return String(track.subtitle);

  return "";
};

const spotifyTrackToQuery = (track: any): string | null => {
  const title = track.name || track.title;
  const artists = getSpotifyArtistNames(track);

  if (!title || !artists) return null;

  return `${artists} - ${title} official audio`;
};

const resolveSpotifyToQueries = async (input: string): Promise<string[]> => {
  const data: any = await getData(input);

  if (data.type === "track") {
    const query = spotifyTrackToQuery(data);
    return query ? [query] : [];
  }

  if (data.type === "playlist") {
    const items = data.trackList || data.tracks?.items || data.tracks || [];

    if (!Array.isArray(items) || !items.length) return [];

    return items
      .slice(0, MAX_PLAYLIST_SIZE)
      .map((item: any) => spotifyTrackToQuery(item.track || item))
      .filter(isString);
  }

  if (data.type === "album") {
    const items = data.trackList || data.tracks?.items || data.tracks || [];

    if (!Array.isArray(items) || !items.length) return [];

    const albumArtists = Array.isArray(data.artists)
      ? data.artists.map((artist: any) => artist.name).join(", ")
      : "";

    return items
      .slice(0, MAX_PLAYLIST_SIZE)
      .map((track: any) => {
        const title = track.name || track.title;
        const artists = getSpotifyArtistNames(track) || albumArtists;

        if (!title || !artists) return null;

        return `${artists} - ${title} official audio`;
      })
      .filter(isString);
  }

  return [];
};

const getGuildQueue = (message: Message) => {
  if (!player || !message.guildId) return null;
  return player.nodes.get(message.guildId);
};

export const addToQueue = async (message: Message, query: string) => {
  const guild = message.guild;
  const member = message.member as GuildMember | null;

  if (!guild || !member) {
    await message.reply("❌ Esse comando só funciona em servidor.");
    return;
  }

  const voiceChannel = member.voice.channel;

  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await message.reply("❌ Você precisa estar em um canal de voz.");
    return;
  }

  const musicPlayer = await getPlayer(message);

  let queries = [query];

  if (isSpotifyUrl(query)) {
    await message.reply("🔎 Lendo link do Spotify...");

    queries = await resolveSpotifyToQueries(query);

    if (!queries.length) {
      await message.reply("❌ Não consegui ler esse link do Spotify.");
      return;
    }

    if (queries.length > 1) {
      await message.reply(
        `📀 Playlist/álbum detectado! Adicionando **${queries.length} músicas** à fila.`
      );
    }
  }

  try {
    for (const item of queries) {
      await musicPlayer.play(voiceChannel.id, item, {
        requestedBy: message.author.id,
        nodeOptions: {
          metadata: message,
          leaveOnEnd: true,
          leaveOnEmpty: true,
          leaveOnStop: true,
          selfDeaf: false,
        },
      });
    }

    if (queries.length === 1) {
      await message.reply(`✅ Adicionado: **${queries[0]}**`);
    } else {
      await message.reply(`✅ Adicionei **${queries.length} músicas** à fila.`);
    }
  } catch (error) {
    console.error("Erro ao adicionar música:", error);
    await message.reply("❌ Não consegui tocar/adicionar essa música.");
  }
};

export const skipMusic = async (message: Message) => {
  const queue = getGuildQueue(message);

  if (!queue?.currentTrack) {
    await message.reply("❌ Não tem música tocando.");
    return;
  }

  queue.node.skip();
  await message.reply("⏭️ Pulando...");
};

export const pauseMusic = async (message: Message) => {
  const queue = getGuildQueue(message);

  if (!queue?.currentTrack) {
    await message.reply("❌ Não tem música tocando.");
    return;
  }

  queue.node.setPaused(true);
  await message.reply("⏸️ Pausado.");
};

export const resumeMusic = async (message: Message) => {
  const queue = getGuildQueue(message);

  if (!queue?.currentTrack) {
    await message.reply("❌ Não tem música tocando.");
    return;
  }

  queue.node.setPaused(false);
  await message.reply("▶️ Continuando.");
};

export const stopMusic = async (message: Message) => {
  const queue = getGuildQueue(message);

  if (!queue) {
    await message.reply("❌ Não tem música tocando.");
    return;
  }

  queue.delete();
  await message.reply("⏹️ Parado e fila limpa.");
};

export const getQueue = (message: Message) => {
  const queue = getGuildQueue(message);
  if (!queue) return [];

  return queue.tracks.toArray().map((track) => ({
    query: track.title,
    requestedBy: track.requestedBy?.username ?? "Desconhecido",
    textMessage: message,
  }));
};

export const getNowPlaying = (message: Message) => {
  const queue = getGuildQueue(message);

  if (!queue?.currentTrack) return null;

  return {
    query: queue.currentTrack.title,
    requestedBy: queue.currentTrack.requestedBy?.username ?? "Desconhecido",
    textMessage: message,
  };
};

export const removeFromQueue = async (message: Message, position: number) => {
  const queue = getGuildQueue(message);
  const index = position - 1;

  if (!queue || Number.isNaN(index) || index < 0 || index >= queue.tracks.size) {
    await message.reply("❌ Posição inválida.");
    return;
  }

  const track = queue.tracks.at(index);

  if (!track) {
    await message.reply("❌ Música não encontrada nessa posição.");
    return;
  }

  queue.removeTrack(track);

  await message.reply(`🗑️ Removido da fila: **${track.title}**`);
};

export const clearQueue = async (message: Message) => {
  const queue = getGuildQueue(message);

  if (!queue) {
    await message.reply("❌ Não tem fila ativa.");
    return;
  }

  queue.clear();
  await message.reply("🧹 Fila limpa. A música atual continua tocando.");
};

export const shuffleQueue = async (message: Message) => {
  const queue = getGuildQueue(message);

  if (!queue || queue.tracks.size < 2) {
    await message.reply("❌ Precisa ter pelo menos 2 músicas na fila.");
    return;
  }

  queue.tracks.shuffle();
  await message.reply("🔀 Fila embaralhada.");
};

export const setLoopMode = async (
  message: Message,
  mode: "off" | "song" | "queue"
) => {
  const queue = getGuildQueue(message);

  if (!queue) {
    await message.reply("❌ Não tem fila ativa.");
    return;
  }

  const modes = {
    off: 0,
    song: 1,
    queue: 2,
  } as const;

  queue.setRepeatMode(modes[mode]);

  const labels = {
    off: "desativado",
    song: "repetindo música atual",
    queue: "repetindo fila",
  };

  await message.reply(`🔁 Loop ${labels[mode]}.`);
};

export const setAutoplay = async (message: Message, enabled: boolean) => {
  const queue = getGuildQueue(message);

  if (!queue) {
    await message.reply("❌ Não tem fila ativa.");
    return;
  }

  queue.setRepeatMode(enabled ? 3 : 0);

  await message.reply(
    enabled ? "✨ Autoplay ativado." : "✨ Autoplay desativado."
  );
};