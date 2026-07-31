import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import {
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";

export default {
  category: "Voice",

  data: new SlashCommandBuilder()
    .setName("انضم")
    .setDescription("يجعل بوت باعلوي ينضم إلى قناتك الصوتية"),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "يمكن استخدام هذا الأمر داخل السيرفر فقط.",
        ephemeral: true,
      });

      return;
    }

    const member = await interaction.guild.members
      .fetch(interaction.user.id)
      .catch(() => interaction.member);

    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: "ادخل إلى قناة صوتية أولًا، ثم استخدم الأمر مرة أخرى.",
        ephemeral: true,
      });

      return;
    }

    if (
      voiceChannel.type !== ChannelType.GuildVoice &&
      voiceChannel.type !== ChannelType.GuildStageVoice
    ) {
      await interaction.reply({
        content: "القناة التي دخلتها ليست قناة صوتية صالحة.",
        ephemeral: true,
      });

      return;
    }

    const botMember = interaction.guild.members.me;

    if (!botMember) {
      await interaction.reply({
        content: "تعذر العثور على حساب البوت داخل السيرفر.",
        ephemeral: true,
      });

      return;
    }

    const permissions =
      voiceChannel.permissionsFor(botMember);

    if (
      !permissions?.has(PermissionFlagsBits.ViewChannel) ||
      !permissions?.has(PermissionFlagsBits.Connect)
    ) {
      await interaction.reply({
        content:
          "لا أمتلك صلاحية مشاهدة القناة الصوتية أو الانضمام إليها.",
        ephemeral: true,
      });

      return;
    }

    await interaction.deferReply({
      ephemeral: true,
    });

    try {
      const previousConnection =
        getVoiceConnection(interaction.guild.id);

      if (previousConnection) {
        previousConnection.destroy();
      }

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator:
          interaction.guild.voiceAdapterCreator,

        selfDeaf: true,
        selfMute: true,
      });

      await entersState(
        connection,
        VoiceConnectionStatus.Ready,
        20_000,
      );

      await interaction.editReply({
        content: `تم الانضمام إلى قناة **${voiceChannel.name}** بنجاح.`,
      });
    } catch (error) {
      console.error(
        "خطأ أثناء الانضمام إلى القناة الصوتية:",
        error,
      );

      const failedConnection =
        getVoiceConnection(interaction.guild.id);

      if (failedConnection) {
        failedConnection.destroy();
      }

      await interaction.editReply({
        content:
          "تعذر الانضمام إلى القناة الصوتية. تأكد من صلاحيات البوت ثم حاول مرة أخرى.",
      });
    }
  },
};
