import { spawn } from "node:child_process";
import type { ChildProcessByStdio } from "node:child_process";
import { createRequire } from "node:module";
import type { Readable } from "node:stream";

import {
  AudioPlayer,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";

import type { GuildMember, Message } from "discord.js";
import { ChannelType, EmbedBuilder } from "discord.js";

const require = createRequire(import.meta.url);
const spotifyUrlInfo = require("spotify-url-info");
const { getData } = spotifyUrlInfo(fetch);

interface QueueItem {
  query: string;
  requestedBy: string;
  textMessage: Message;
}

interface GuildMusicState {
  queue: QueueItem[];
  connection: VoiceConnection | null;
  player: AudioPlayer;
  currentProcess: ChildProcessByStdio<null, Readable, Readable> | null;
  current: QueueItem | null;
  isPlaying: boolean;
  loopMode: "off" | "song" | "queue";
  autoplay: boolean;
  isStarting?: boolean;
  playbackVersion: number;
  handlersRegistered: boolean;
  isSkipping: boolean;
}

const guildStates = new Map<string, GuildMusicState>();
const MAX_PLAYLIST_SIZE = 50;

const getState = (guildId: string): GuildMusicState => {
  const existing = guildStates.get(guildId);
  if (existing) return existing;

  const state: GuildMusicState = {
    queue: [],
    connection: null,
    player: createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    }),
    currentProcess: null,
    current: null,
    isPlaying: false,
    loopMode: "off",
    autoplay: false,
    isStarting: false,
    playbackVersion: 0,
    handlersRegistered: false,
    isSkipping: false,
  };

  guildStates.set(guildId, state);
  return state;
};

const sendToChannel = async (message: Message, content: string) => {
  if (!message.channel.isSendable()) return;
  await message.channel.send(content);
};

const sendEmbedToChannel = async (message: Message, embed: EmbedBuilder) => {
  if (!message.channel.isSendable()) return;
  await message.channel.send({ embeds: [embed] });
};

const isYoutubeUrl = (input: string) =>
  input.includes("youtube.com") || input.includes("youtu.be");

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

    if (!Array.isArray(items) || items.length === 0) return [];

    return items
      .slice(0, MAX_PLAYLIST_SIZE)
      .map((item: any) => spotifyTrackToQuery(item.track || item))
      .filter(isString);
  }

  if (data.type === "album") {
    const items = data.trackList || data.tracks?.items || data.tracks || [];

    if (!Array.isArray(items) || items.length === 0) return [];

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

const buildYtDlpInput = (input: string) => {
  if (isYoutubeUrl(input)) return input;

  const query = input.includes("official audio")
    ? input
    : `${input} official audio`;

  return `ytsearch1:${query}`;
};

const isExpectedYtDlpNoise = (text: string) => {
  return (
    text.includes("Broken pipe") ||
    text.includes("Invalid argument") ||
    text.includes("unable to write data")
  );
};

const startNext = async (guildId: string) => {
  const state = getState(guildId);

  if (state.isStarting) return;

  state.isStarting = true;
  const playbackVersion = state.playbackVersion;

  let shouldStartNextAfterFailure = false;

  try {
    let next: QueueItem | undefined;

    if (state.loopMode === "song" && state.current) {
      next = state.current;
    } else {
      next = state.queue.shift();

      if (state.loopMode === "queue" && state.current) {
        state.queue.push(state.current);
      }
    }

    if (!next && state.autoplay && state.current) {
      next = {
        ...state.current,
        query: `${state.current.query} similar songs`,
      };
    }

    if (!next) {
      state.current = null;
      state.isPlaying = false;

      if (state.connection) {
        state.connection.destroy();
        state.connection = null;
      }

      return;
    }

    state.current = next;
    state.isPlaying = true;

    const sourceInput = buildYtDlpInput(next.query);

    const ytDlpArgs = [
      "--quiet",
      "--no-warnings",
      "--encoding",
      "utf-8",
      "-f",
      "bestaudio[ext=webm]/bestaudio/best",
      "--no-playlist",
      "-o",
      "-",
      sourceInput,
    ];

    const ytDlp = spawn("yt-dlp", ytDlpArgs, {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
      },
    });

    state.currentProcess = ytDlp;

    ytDlp.stderr.on("data", (data) => {
      const text = data.toString();

      if (isExpectedYtDlpNoise(text)) return;

      console.error(`yt-dlp: ${text}`);
    });

    ytDlp.on("error", (error) => {
      console.error("Erro no yt-dlp:", error);
    });

    const probe = await demuxProbe(ytDlp.stdout);

    const resource = createAudioResource(probe.stream, {
      inputType: probe.type,
    });

    if (playbackVersion !== state.playbackVersion) {
      ytDlp.kill();
      return;
    }

    state.player.play(resource);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎵 Tocando agora")
      .setDescription(`**${next.query}**`)
      .addFields({
        name: "Pedido por",
        value: next.requestedBy,
        inline: true,
      });

    await sendEmbedToChannel(next.textMessage, embed);
  } catch (error) {
    console.error("Erro ao criar recurso de áudio:", error);

    if (state.currentProcess) {
      state.currentProcess.kill();
      state.currentProcess = null;
    }

    if (state.current) {
      await sendToChannel(
        state.current.textMessage,
        `❌ Não consegui tocar: **${state.current.query}**. Pulando para a próxima.`
      );
    }

    shouldStartNextAfterFailure = true;
  } finally {
    state.isStarting = false;
    state.isSkipping = false;
  }

  if (shouldStartNextAfterFailure) {
    await startNext(guildId);
  }
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

  const state = getState(guild.id);

  if (!state.connection) {
    state.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    await entersState(state.connection, VoiceConnectionStatus.Ready, 20_000);

    state.connection.subscribe(state.player);

    if (!state.handlersRegistered) {
      state.handlersRegistered = true;

      state.player.on(AudioPlayerStatus.Idle, async () => {
        if (state.currentProcess) {
          state.currentProcess.kill();
          state.currentProcess = null;
        }

        state.isPlaying = false;

        await startNext(guild.id);
      });

      state.player.on("error", async (error) => {
        console.error("Erro no player:", error);

        if (state.currentProcess) {
          state.currentProcess.kill();
          state.currentProcess = null;
        }

        await startNext(guild.id);
      });
    }
  }

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

  state.queue.push(
    ...queries.map((item) => ({
      query: item,
      requestedBy: message.author.username,
      textMessage: message,
    }))
  );

  if (state.isPlaying) {
    await message.reply(
      queries.length === 1
        ? `✅ Adicionado à fila: **${queries[0]}**`
        : `✅ Adicionei **${queries.length} músicas** à fila.`
    );
    return;
  }

  state.playbackVersion += 1;
  await startNext(guild.id);
};

export const skipMusic = async (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);

  if (!state.current) {
    await message.reply("❌ Não tem música tocando.");
    return;
  }

  if (state.isSkipping) {
    await message.reply("⏳ Já estou pulando uma música.");
    return;
  }

  state.isSkipping = true;

  await message.reply("⏭️ Pulando...");

  if (state.currentProcess) {
    state.currentProcess.kill();
    state.currentProcess = null;
  }

  state.isPlaying = false;
  state.player.stop(true);

  setTimeout(() => {
    state.isSkipping = false;
  }, 1500);
};

export const pauseMusic = async (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);

  if (!state.current) {
    await message.reply("❌ Não tem música tocando.");
    return;
  }

  if (!state.player.pause()) {
    await message.reply("❌ Não consegui pausar.");
    return;
  }

  await message.reply("⏸️ Pausado.");
};

export const resumeMusic = async (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);

  if (!state.current) {
    await message.reply("❌ Não tem música tocando.");
    return;
  }

  if (!state.player.unpause()) {
    await message.reply("❌ Não consegui continuar.");
    return;
  }

  await message.reply("▶️ Continuando.");
};

export const stopMusic = async (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);

  state.queue = [];

  if (state.currentProcess) {
    state.currentProcess.kill();
    state.currentProcess = null;
  }

  state.current = null;
  state.isPlaying = false;

  state.player.stop();

  if (state.connection) {
    state.connection.destroy();
    state.connection = null;
  }

  await message.reply("⏹️ Parado e fila limpa.");
};

export const getQueue = (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return [];

  return getState(guildId).queue;
};

export const getNowPlaying = (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return null;

  return getState(guildId).current;
};

export const removeFromQueue = async (message: Message, position: number) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);
  const index = position - 1;

  if (Number.isNaN(index) || index < 0 || index >= state.queue.length) {
    await message.reply("❌ Posição inválida.");
    return;
  }

  const [removed] = state.queue.splice(index, 1);

  await message.reply(`🗑️ Removido da fila: **${removed.query}**`);
};

export const clearQueue = async (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  getState(guildId).queue = [];

  await message.reply("🧹 Fila limpa. A música atual continua tocando.");
};

export const shuffleQueue = async (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);

  if (state.queue.length < 2) {
    await message.reply("❌ Precisa ter pelo menos 2 músicas na fila.");
    return;
  }

  for (let i = state.queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const current = state.queue[i];
    const random = state.queue[j];

    state.queue[i] = random;
    state.queue[j] = current;
  }

  await message.reply("🔀 Fila embaralhada.");
};

export const setLoopMode = async (
  message: Message,
  mode: "off" | "song" | "queue"
) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);

  state.loopMode = mode;

  const labels = {
    off: "desativado",
    song: "repetindo música atual",
    queue: "repetindo fila",
  };

  await message.reply(`🔁 Loop ${labels[mode]}.`);
};

export const setAutoplay = async (message: Message, enabled: boolean) => {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const state = getState(guildId);

  state.autoplay = enabled;

  await message.reply(
    enabled ? "✨ Autoplay ativado." : "✨ Autoplay desativado."
  );
};