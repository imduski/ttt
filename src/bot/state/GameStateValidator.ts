import MessagingTunnel from '@bot/messaging/MessagingTunnel';
import GameStateManager from '@bot/state/GameStateManager';
import Config from '@config/Config';
import { GuildMember, PermissionString } from 'discord.js';

/**
 * Validates state of a messaging tunnel
 * in order to create a game or a duel request.
 *
 * @author Utarwyn
 * @since 2.2.0
 */
export default class GameStateValidator {
    /**
     * List with all permissions that the bot needs to work properly.
     * @private
     */
    private static readonly PERM_LIST: PermissionString[] = [
        'ADD_REACTIONS',
        'MANAGE_MESSAGES',
        'READ_MESSAGE_HISTORY',
        'SEND_MESSAGES',
        'VIEW_CHANNEL'
    ];

    /**
     * Stores configuration of the module.
     * @private
     */
    private readonly manager: GameStateManager;

    /**
     * Creates the game state validator.
     *
     * @param manager game state manager
     */
    constructor(manager: GameStateManager) {
        this.manager = manager;
    }

    /**
     * Retrieves the module configuration.
     */
    public get config(): Config {
        return this.manager.bot.configuration;
    }

    /**
     * Retrieves collection of member cooldown end times.
     */
    public get cooldownEndTimes(): Map<string, number> {
        return this.manager.memberCooldownEndTimes;
    }

    /**
     * Checks if an interaction through a messaging tunnel is valid or not.
     *
     * @param tunnel messaging tunnel object
     * @returns true if the interaction is valid, false otherwise
     */
    public isInteractionValid(tunnel: MessagingTunnel): boolean {
        return (
            this.isMessagingAllowed(tunnel) &&
            this.isMemberAllowed(tunnel.author) &&
            this.manager.gameboards.length === 0
        );
    }

    /**
     * Checks if a messaging tunnel takes place in an allowed channel.
     *
     * @param tunnel module messaging tunnel
     * @returns true if channel allowed
     * @private
     */
    private isMessagingAllowed(tunnel: MessagingTunnel): boolean {
        return (
            this.hasPermissionsInChannel(tunnel) &&
            (!this.config.allowedChannelIds ||
                this.config.allowedChannelIds.length === 0 ||
                this.config.allowedChannelIds.includes(tunnel.channel.id))
        );
    }

    /**
     * Checks if bot has permissions to operate
     * in a specific channel based on the messaging tunnel.
     *
     * @param tunnel messaging tunnel
     * @return true if bot got all permissions, false otherwise
     * @private
     */
    private hasPermissionsInChannel(tunnel: MessagingTunnel): boolean {
        const allowed =
            tunnel.channel.guild.me
                ?.permissionsIn(tunnel.channel)
                ?.has(GameStateValidator.PERM_LIST) ?? false;

        if (!allowed) {
            console.error(
                `Cannot operate because of a lack of permissions in the channel #${tunnel.channel.name}`
            );
        }

        return allowed;
    }

    /**
     * Checks if the messaging tunnel can be
     * used for a specific member of the guild.
     *
     * @param member discord.js guild member object
     * @returns true if the member got permissions
     * @private
     */
    private isMemberAllowed(member: GuildMember): boolean {
        return this.isMemberAllowedByRole(member) && this.isMemberAllowedByCooldown(member);
    }

    /**
     * Verifies if a member can use
     * the messaging tunnel based on its roles.
     *
     * @param member discord.js member object
     * @returns true if the member is allowed based on its roles
     * @private
     */
    private isMemberAllowedByRole(member: GuildMember): boolean {
        return (
            !this.config.allowedRoleIds ||
            this.config.allowedRoleIds.length == 0 ||
            member.permissions.has('ADMINISTRATOR') ||
            member.roles.cache.some(role => this.config.allowedRoleIds!.includes(role.id))
        );
    }

    /**
     * Verifies if a member can use
     * the messaging tunnel based on its cooldown.
     *
     * @param member discord.js guild member instance
     * @returns true if the user do not have a valid cooldown in progress
     * @private
     */
    private isMemberAllowedByCooldown(member: GuildMember): boolean {
        return (
            !this.config.requestCooldownTime ||
            this.config.requestCooldownTime === 0 ||
            (this.cooldownEndTimes.get(member.id) ?? 0) > Date.now()
        );
    }
}