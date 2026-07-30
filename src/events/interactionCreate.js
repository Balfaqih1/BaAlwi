import { Events } from "discord.js";
import { logger } from "../utils/logger.js";
import { getGuildConfig } from "../services/config/guildConfig.js";

import {
  getBotMessage,
  isBotOwner,
  isCommandCategoryEnabled,
  isMaintenanceMode,
} from "../config/bot.js";

import botConfig from "../config/bot.js";
import { handleApplicationModal } from "../commands/Community/apply.js";

import {
  handleInteractionError,
  createError,
  ErrorTypes,
  ErrorCodes,
} from "../utils/errorHandler.js";

import { InteractionHelper } from "../utils/interactionHelper.js";

import {
  createInteractionTraceContext,
  runWithTraceContext,
} from "../utils/logger.js";

import { validateChatInputPayloadOrThrow } from "../utils/commandInputValidation.js";

import {
  enforceAbuseProtection,
  formatCooldownDuration,
} from "../utils/abuseProtection.js";

import { isCommandEnabled } from "../services/commandAccessService.js";
import { resolveSlashAccessKey } from "../utils/messageAdapter.js";
import { isCollectorManagedComponent } from "../utils/collectorComponents.js";
import { ResponseCoordinator } from "../utils/responseCoordinator.js";
import { enforceDefaultCommandPermissions } from "../utils/permissionGuard.js";

const COMMAND_ERROR_SUBTYPES = {
  warn: "warn_failed",
  kick: "kick_failed",
  ban: "ban_failed",
  unban: "unban_failed",
  timeout: "timeout_failed",
  untimeout: "untimeout_failed",
  warnings: "warnings_view_failed",
  ticket: "ticket_failed",
  serverstats: "serverstats_failed",
  gcreate: "giveaway_failed",
  gend: "giveaway_failed",
  gdelete: "giveaway_failed",
  greroll: "giveaway_failed",
};

/**
 * Converts command category names into the same format used
 * by botConfig.features.
 *
 * Examples:
 * Music        -> music
 * MUSIC        -> music
 * Join To Create -> join_to_create
 */
function normalizeCommandCategory(category) {
  return String(category || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/**
 * Maps old Titan command categories to their corresponding
 * feature keys in botConfig.features.
 */
const CATEGORY_FEATURE_ALIASES = {
  core: null,

  music: "music",
  voice: "voice",

  utility: "utility",
  utilities: "utility",

  search: "search",
  logging: "logging",

  adhkar: "adhkar",
  azkar: "adhkar",

  awrad: "awrad",
  wird: "awrad",

  qasaid: "qasaid",
  poems: "qasaid",

  mawalid: "mawalid",
  mawlid: "mawalid",

  hadrat: "hadrat",
  hadra: "hadrat",

  duas: "duas",
  dua: "duas",

  prayer: "prayerTimes",
  prayers: "prayerTimes",
  prayertimes: "prayerTimes",
  prayer_times: "prayerTimes",

  adhan: "adhan",
  reminders: "reminders",

  bookmark: "bookmarks",
  bookmarks: "bookmarks",

  birthday: "birthday",
  community: "community",
  economy: "economy",
  fun: "fun",

  giveaway: "giveaways",
  giveaways: "giveaways",

  jointocreate: "joinToCreate",
  join_to_create: "joinToCreate",

  leveling: "leveling",
  moderation: "moderation",

  reactionroles: "reactionRoles",
  reaction_roles: "reactionRoles",

  serverstats: "counter",
  counter: "counter",

  ticket: "tickets",
  tickets: "tickets",

  tools: "tools",
  verification: "verification",
  welcome: "welcome",
};

/**
 * Robust feature check.
 *
 * This prevents category case problems such as:
 * command.category = "Music"
 * botConfig.features.music = true
 */
function isCategoryFeatureAllowed(category) {
  const normalizedCategory = normalizeCommandCategory(category);

  if (!normalizedCategory || normalizedCategory === "core") {
    return true;
  }

  const mappedFeatureKey =
    CATEGORY_FEATURE_ALIASES[normalizedCategory] ||
    normalizedCategory;

  const mappedFeatureValue =
    botConfig.features?.[mappedFeatureKey];

  const helperResult =
    isCommandCategoryEnabled(category);

  /**
   * Special compatibility rule:
   *
   * Old Titan /join commands belong to Music.
   * They may require both the Music and Voice systems.
   */
  if (normalizedCategory === "music") {
    const musicEnabled =
      botConfig.features?.music !== false;

    const voiceEnabled =
      botConfig.features?.voice !== false;

    const enabled =
      musicEnabled && voiceEnabled;

    logger.info("Music feature check:", {
      category,
      normalizedCategory,
      mappedFeatureKey,
      musicEnabled,
      voiceEnabled,
      helperResult,
      enabled,
    });

    return enabled;
  }

  /**
   * If the feature exists explicitly in botConfig.features,
   * use its configured value.
   */
  if (mappedFeatureValue !== undefined) {
    const enabled =
      mappedFeatureValue !== false;

    logger.info("Command feature check:", {
      category,
      normalizedCategory,
      mappedFeatureKey,
      configuredValue: mappedFeatureValue,
      helperResult,
      enabled,
    });

    return enabled;
  }

  /**
   * For unknown categories, use the helper result.
   * Unknown new BaAlwi categories remain enabled by default
   * unless explicitly disabled elsewhere.
   */
  logger.info("Command feature fallback check:", {
    category,
    normalizedCategory,
    mappedFeatureKey,
    configuredValue: mappedFeatureValue,
    helperResult,
  });

  return helperResult !== false;
}

function withTraceContext(
  context = {},
  traceContext = {},
) {
  return {
    traceId: traceContext.traceId,
    guildId:
      context.guildId ||
      traceContext.guildId,

    userId:
      context.userId ||
      traceContext.userId,

    command:
      context.commandName ||
      traceContext.command,

    ...context,
  };
}

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    const interactionTraceContext =
      createInteractionTraceContext(interaction);

    interaction.traceContext =
      interactionTraceContext;

    interaction.traceId =
      interactionTraceContext.traceId;

    return runWithTraceContext(
      interactionTraceContext,
      async () => {
        try {
          InteractionHelper.patchInteractionResponses(
            interaction,
          );

          ResponseCoordinator.attach(interaction);

          // ==================================================
          // SLASH COMMANDS
          // ==================================================

          if (interaction.isChatInputCommand()) {
            try {
              logger.info(
                `Command executed: /${interaction.commandName} by ${interaction.user.tag}`,
                {
                  event:
                    "interaction.command.received",

                  traceId:
                    interactionTraceContext.traceId,

                  guildId:
                    interaction.guildId,

                  userId:
                    interaction.user?.id,

                  command:
                    interaction.commandName,
                },
              );

              validateChatInputPayloadOrThrow(
                interaction,

                withTraceContext(
                  {
                    type:
                      "command_input_validation",

                    commandName:
                      interaction.commandName,
                  },

                  interactionTraceContext,
                ),
              );

              const command =
                client.commands.get(
                  interaction.commandName,
                );

              if (!command) {
                throw createError(
                  `No command matching ${interaction.commandName} was found.`,

                  ErrorTypes.CONFIGURATION,

                  "Sorry, that command does not exist.",

                  withTraceContext(
                    {
                      commandName:
                        interaction.commandName,
                    },

                    interactionTraceContext,
                  ),
                );
              }

              // ==================================================
              // MAINTENANCE MODE
              // ==================================================

              if (
                isMaintenanceMode() &&
                !isBotOwner(interaction.user.id)
              ) {
                throw createError(
                  "Bot is in maintenance mode",

                  ErrorTypes.CONFIGURATION,

                  getBotMessage(
                    "maintenanceMode",
                  ),

                  withTraceContext(
                    {
                      commandName:
                        interaction.commandName,
                    },

                    interactionTraceContext,
                  ),
                );
              }

              // ==================================================
              // GLOBAL FEATURE CHECK
              // ==================================================

              const categoryAllowed =
                isCategoryFeatureAllowed(
                  command.category,
                );

              if (!categoryAllowed) {
                logger.warn(
                  "Command blocked because its feature is disabled:",
                  {
                    commandName:
                      interaction.commandName,

                    category:
                      command.category,

                    normalizedCategory:
                      normalizeCommandCategory(
                        command.category,
                      ),

                    features:
                      botConfig.features,
                  },
                );

                throw createError(
                  `Feature disabled for category ${command.category}`,

                  ErrorTypes.CONFIGURATION,

                  getBotMessage(
                    "commandDisabled",
                  ),

                  withTraceContext(
                    {
                      commandName:
                        interaction.commandName,

                      category:
                        command.category,
                    },

                    interactionTraceContext,
                  ),
                );
              }

              // ==================================================
              // DEFAULT COMMAND COOLDOWN
              // ==================================================

              const defaultCooldownSec =
                Number(
                  botConfig.commands
                    ?.defaultCooldown,
                ) || 0;

              if (
                defaultCooldownSec > 0 &&
                !isBotOwner(interaction.user.id)
              ) {
                const cooldownKey =
                  `${interaction.user.id}:${interaction.commandName}`;

                const expiresAt =
                  client.cooldowns.get(
                    cooldownKey,
                  );

                if (
                  expiresAt &&
                  Date.now() < expiresAt
                ) {
                  const remainingSec =
                    Math.ceil(
                      (expiresAt -
                        Date.now()) /
                        1000,
                    );

                  throw createError(
                    `Default command cooldown active for ${interaction.commandName}`,

                    ErrorTypes.RATE_LIMIT,

                    getBotMessage(
                      "cooldownActive",
                      {
                        time:
                          `${remainingSec}s`,
                      },
                    ),

                    withTraceContext(
                      {
                        commandName:
                          interaction.commandName,

                        remainingSec,
                      },

                      interactionTraceContext,
                    ),
                  );
                }

                client.cooldowns.set(
                  cooldownKey,

                  Date.now() +
                    defaultCooldownSec *
                      1000,
                );
              }

              // ==================================================
              // ABUSE PROTECTION
              // ==================================================

              const abuseProtection =
                await enforceAbuseProtection(
                  interaction,
                  command,
                  interaction.commandName,
                );

              if (!abuseProtection.allowed) {
                const formattedCooldown =
                  formatCooldownDuration(
                    abuseProtection.remainingMs,
                  );

                throw createError(
                  `Risky command cooldown active for ${interaction.commandName}`,

                  ErrorTypes.RATE_LIMIT,

                  `This command is on cooldown. Please wait ${formattedCooldown} before trying again.`,

                  withTraceContext(
                    {
                      commandName:
                        interaction.commandName,

                      subtype:
                        "command_cooldown",

                      expected: true,

                      cooldownMs:
                        abuseProtection.remainingMs,

                      cooldownWindowMs:
                        abuseProtection.policy
                          ?.windowMs,

                      cooldownMaxAttempts:
                        abuseProtection.policy
                          ?.maxAttempts,
                    },

                    interactionTraceContext,
                  ),
                );
              }

              // ==================================================
              // SERVER CONFIGURATION
              // ==================================================

              let guildConfig = null;

              if (interaction.guild) {
                guildConfig =
                  await getGuildConfig(
                    client,
                    interaction.guild.id,
                    interactionTraceContext,
                  );

                const accessKey =
                  resolveSlashAccessKey(
                    interaction,
                  );

                const commandEnabled =
                  await isCommandEnabled(
                    client,
                    interaction.guild.id,
                    accessKey,
                    command.category,
                  );

                if (!commandEnabled) {
                  throw createError(
                    `Command ${accessKey} is disabled in this guild`,

                    ErrorTypes.CONFIGURATION,

                    "This command has been disabled for this server.",

                    withTraceContext(
                      {
                        commandName:
                          accessKey,

                        guildId:
                          interaction.guild.id,
                      },

                      interactionTraceContext,
                    ),
                  );
                }
              }

              // ==================================================
              // PERMISSION CHECK
              // ==================================================

              const permissionAllowed =
                await enforceDefaultCommandPermissions(
                  interaction,
                  command,
                  {
                    source:
                      "interactionCreate",

                    guildConfig,
                  },
                );

              if (!permissionAllowed) {
                return;
              }

              // ==================================================
              // EXECUTE COMMAND
              // ==================================================

              await command.execute(
                interaction,
                guildConfig,
                client,
              );
            } catch (error) {
              await handleInteractionError(
                interaction,
                error,

                withTraceContext(
                  {
                    type: "command",

                    commandName:
                      interaction.commandName,

                    subtype:
                      COMMAND_ERROR_SUBTYPES[
                        interaction.commandName
                      ] ||
                      error?.context
                        ?.subtype,
                  },

                  interactionTraceContext,
                ),
              );
            }
          }

          // ==================================================
          // AUTOCOMPLETE
          // ==================================================

          else if (
            interaction.isAutocomplete()
          ) {
            const autocompleteCommand =
              client.commands.get(
                interaction.commandName,
              );

            if (
              autocompleteCommand?.autocomplete
            ) {
              try {
                await autocompleteCommand.autocomplete(
                  interaction,
                  client,
                );
              } catch (error) {
                logger.error(
                  "Error handling command autocomplete:",
                  {
                    error:
                      error.message,

                    guildId:
                      interaction.guildId,

                    commandName:
                      interaction.commandName,
                  },
                );

                await interaction
                  .respond([])
                  .catch(() => {});
              }

              return;
            }

            const focusedOption =
              interaction.options.getFocused(
                true,
              );

            // ==================================================
            // APPLICATION AUTOCOMPLETE
            // ==================================================

            if (
              interaction.commandName ===
                "apply" &&
              focusedOption.name ===
                "application"
            ) {
              try {
                const {
                  getApplicationRoles,
                } = await import(
                  "../utils/database.js"
                );

                const roles =
                  await getApplicationRoles(
                    client,
                    interaction.guildId,
                  );

                const roleName =
                  interaction.options.getString(
                    "application",
                    false,
                  );

                const filtered =
                  roles.filter(
                    (role) =>
                      role.enabled !==
                        false &&
                      role.name
                        .toLowerCase()
                        .startsWith(
                          roleName?.toLowerCase() ||
                            "",
                        ),
                  );

                await interaction.respond(
                  filtered
                    .slice(0, 25)
                    .map((role) => ({
                      name:
                        `${role.name}${
                          role.enabled ===
                          false
                            ? " (disabled)"
                            : ""
                        }`,

                      value:
                        role.name,
                    })),
                );
              } catch (error) {
                logger.error(
                  "Error handling autocomplete:",
                  {
                    error:
                      error.message,

                    guildId:
                      interaction.guildId,

                    commandName:
                      interaction.commandName,
                  },
                );

                await interaction.respond(
                  [],
                );
              }
            }

            // ==================================================
            // APP ADMIN AUTOCOMPLETE
            // ==================================================

            else if (
              interaction.commandName ===
                "app-admin" &&
              focusedOption.name ===
                "application"
            ) {
              try {
                const {
                  getApplicationRoles,
                } = await import(
                  "../utils/database.js"
                );

                const roles =
                  await getApplicationRoles(
                    client,
                    interaction.guildId,
                  );

                const appName =
                  interaction.options.getString(
                    "application",
                    false,
                  );

                const filtered =
                  roles.filter((role) =>
                    role.name
                      .toLowerCase()
                      .startsWith(
                        appName?.toLowerCase() ||
                          "",
                      ),
                  );

                await interaction.respond(
                  filtered
                    .slice(0, 25)
                    .map((role) => ({
                      name:
                        `${role.name}${
                          role.enabled ===
                          false
                            ? " (disabled)"
                            : ""
                        }`,

                      value:
                        role.name,
                    })),
                );
              } catch (error) {
                logger.error(
                  "Error handling app-admin autocomplete:",
                  {
                    error:
                      error.message,

                    guildId:
                      interaction.guildId,

                    commandName:
                      interaction.commandName,
                  },
                );

                await interaction.respond(
                  [],
                );
              }
            }

            // ==================================================
            // REACTION ROLES AUTOCOMPLETE
            // ==================================================

            else if (
              interaction.commandName ===
                "reactroles" &&
              focusedOption.name ===
                "panel"
            ) {
              try {
                const {
                  getAllReactionRoleMessages,
                  deleteReactionRoleMessage,
                } = await import(
                  "../services/reactionRoleService.js"
                );

                const guildId =
                  interaction.guildId;

                const guild =
                  interaction.guild;

                let panels =
                  await getAllReactionRoleMessages(
                    client,
                    guildId,
                  );

                if (
                  !panels ||
                  panels.length === 0
                ) {
                  await interaction.respond(
                    [],
                  );

                  return;
                }

                const validPanels = [];

                for (const panel of panels) {
                  if (
                    !panel.messageId ||
                    !panel.channelId
                  ) {
                    continue;
                  }

                  const channel =
                    guild.channels.cache.get(
                      panel.channelId,
                    );

                  if (!channel) {
                    await deleteReactionRoleMessage(
                      client,
                      guildId,
                      panel.messageId,
                    ).catch(() => {});

                    continue;
                  }

                  const msg =
                    await channel.messages
                      .fetch(
                        panel.messageId,
                      )
                      .catch(
                        () => null,
                      );

                  if (!msg) {
                    await deleteReactionRoleMessage(
                      client,
                      guildId,
                      panel.messageId,
                    ).catch(() => {});

                    continue;
                  }

                  validPanels.push(panel);
                }

                if (
                  validPanels.length === 0
                ) {
                  await interaction.respond(
                    [],
                  );

                  return;
                }

                const choices =
                  await Promise.all(
                    validPanels
                      .slice(0, 25)
                      .map(
                        async (
                          panel,
                        ) => {
                          try {
                            const channel =
                              guild.channels.cache.get(
                                panel.channelId,
                              );

                            if (!channel) {
                              return null;
                            }

                            const msg =
                              await channel.messages
                                .fetch(
                                  panel.messageId,
                                )
                                .catch(
                                  () =>
                                    null,
                                );

                            if (!msg) {
                              return null;
                            }

                            const title =
                              msg
                                ?.embeds?.[0]
                                ?.title ??
                              "Untitled Panel";

                            const channelName =
                              channel?.name ??
                              "unknown";

                            return {
                              name:
                                `${title} (${channelName})`.substring(
                                  0,
                                  100,
                                ),

                              value:
                                panel.messageId,
                            };
                          } catch {
                            return null;
                          }
                        },
                      ),
                  );

                const validChoices =
                  choices.filter(
                    (choice) =>
                      choice !== null,
                  );

                await interaction.respond(
                  validChoices,
                );
              } catch (error) {
                logger.error(
                  "Error handling reactroles autocomplete:",
                  {
                    error:
                      error.message,

                    guildId:
                      interaction.guildId,

                    commandName:
                      interaction.commandName,
                  },
                );

                await interaction.respond(
                  [],
                );
              }
            }
          }

          // ==================================================
          // BUTTONS
          // ==================================================

          else if (interaction.isButton()) {
            if (
              interaction.customId.startsWith(
                "shared_todo_",
              )
            ) {
              const parts =
                interaction.customId.split(
                  "_",
                );

              const buttonType =
                parts
                  .slice(0, 3)
                  .join("_");

              const listId =
                parts[3];

              const button =
                client.buttons.get(
                  buttonType,
                );

              if (button) {
                try {
                  await button.execute(
                    interaction,
                    client,
                    [listId],
                  );
                } catch (error) {
                  await handleInteractionError(
                    interaction,
                    error,

                    withTraceContext(
                      {
                        type: "button",

                        customId:
                          interaction.customId,

                        handler:
                          "todo",
                      },

                      interactionTraceContext,
                    ),
                  );
                }
              } else {
                throw createError(
                  `No button handler found for ${buttonType}`,

                  ErrorTypes.CONFIGURATION,

                  "This button is not available.",

                  withTraceContext(
                    {
                      buttonType,
                    },

                    interactionTraceContext,
                  ),
                );
              }

              return;
            }

            const [
              customId,
              ...args
            ] =
              interaction.customId.split(
                ":",
              );

            const button =
              client.buttons.get(
                customId,
              );

            if (!button) {
              if (
                !interaction.customId.includes(
                  ":",
                ) ||
                isCollectorManagedComponent(
                  customId,
                )
              ) {
                return;
              }

              throw createError(
                `No button handler found for ${customId}`,

                ErrorTypes.CONFIGURATION,

                "This button is not available.",

                withTraceContext(
                  {
                    customId,
                  },

                  interactionTraceContext,
                ),
              );
            }

            try {
              await button.execute(
                interaction,
                client,
                args,
              );
            } catch (error) {
              await handleInteractionError(
                interaction,
                error,

                withTraceContext(
                  {
                    type: "button",

                    customId:
                      interaction.customId,

                    handler:
                      "general",
                  },

                  interactionTraceContext,
                ),
              );
            }
          }

          // ==================================================
          // SELECT MENUS
          // ==================================================

          else if (
            interaction.isStringSelectMenu()
          ) {
            const [
              customId,
              ...args
            ] =
              interaction.customId.split(
                ":",
              );

            const selectMenu =
              client.selectMenus.get(
                customId,
              );

            if (!selectMenu) {
              if (
                !interaction.customId.includes(
                  ":",
                ) ||
                isCollectorManagedComponent(
                  customId,
                )
              ) {
                return;
              }

              throw createError(
                `No select menu handler found for ${customId}`,

                ErrorTypes.CONFIGURATION,

                "This select menu is not available.",

                withTraceContext(
                  {
                    customId,
                  },

                  interactionTraceContext,
                ),
              );
            }

            try {
              await selectMenu.execute(
                interaction,
                client,
                args,
              );
            } catch (error) {
              await handleInteractionError(
                interaction,
                error,

                withTraceContext(
                  {
                    type:
                      "select_menu",

                    customId:
                      interaction.customId,
                  },

                  interactionTraceContext,
                ),
              );
            }
          }

          // ==================================================
          // MODALS
          // ==================================================

          else if (
            interaction.isModalSubmit()
          ) {
            if (
              interaction.customId.startsWith(
                "app_modal_",
              )
            ) {
              try {
                await handleApplicationModal(
                  interaction,
                );
              } catch (error) {
                await handleInteractionError(
                  interaction,
                  error,

                  withTraceContext(
                    {
                      type: "modal",

                      customId:
                        interaction.customId,

                      handler:
                        "application",
                    },

                    interactionTraceContext,
                  ),
                );
              }

              return;
            }

            if (
              interaction.customId.startsWith(
                "app_review_",
              ) ||
              interaction.customId.startsWith(
                "jtc_",
              ) ||
              interaction.customId.startsWith(
                "config_wizard_modal:",
              ) ||
              interaction.customId.startsWith(
                "log_dash_channel_modal:",
              ) ||
              interaction.customId.startsWith(
                "log_dash_filter_modal:",
              )
            ) {
              logger.debug(
                `Skipping modal handler lookup for inline-awaited modal: ${interaction.customId}`,

                {
                  event:
                    "interaction.modal.inline_skipped",

                  traceId:
                    interactionTraceContext.traceId,
                },
              );

              return;
            }

            const [
              customId,
              ...args
            ] =
              interaction.customId.split(
                ":",
              );

            const modal =
              client.modals.get(
                customId,
              );

            if (!modal) {
              if (
                !interaction.customId.includes(
                  ":",
                )
              ) {
                return;
              }

              throw createError(
                `No modal handler found for ${customId}`,

                ErrorTypes.CONFIGURATION,

                "This form is not available.",

                withTraceContext(
                  {
                    customId,
                  },

                  interactionTraceContext,
                ),
              );
            }

            try {
              await modal.execute(
                interaction,
                client,
                args,
              );
            } catch (error) {
              await handleInteractionError(
                interaction,
                error,

                withTraceContext(
                  {
                    type: "modal",

                    customId:
                      interaction.customId,

                    handler:
                      "general",
                  },

                  interactionTraceContext,
                ),
              );
            }
          }
        } catch (error) {
          logger.error(
            "Unhandled error in interactionCreate:",
            {
              event:
                "interaction.unhandled_error",

              errorCode:
                ErrorCodes.INTERACTION_UNHANDLED,

              error,

              traceId:
                interactionTraceContext.traceId,

              interactionId:
                interaction.id,

              guildId:
                interaction.guildId,

              userId:
                interaction.user?.id,
            },
          );

          try {
            await handleInteractionError(
              interaction,
              error,

              withTraceContext(
                {
                  type:
                    "interaction",

                  commandName:
                    interaction.commandName,

                  customId:
                    interaction.customId,

                  source:
                    "interactionCreate.unhandled",
                },

                interactionTraceContext,
              ),
            );
          } catch (replyError) {
            logger.error(
              "Failed to send fallback error response:",
              {
                event:
                  "interaction.error_response_failed",

                errorCode:
                  ErrorCodes.INTERACTION_RESPONSE_FAILED,

                error:
                  replyError,

                traceId:
                  interactionTraceContext.traceId,
              },
            );
          }
        }
      },
    );
  },
};
