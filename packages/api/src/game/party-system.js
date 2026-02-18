const { db, MMO_ROLES } = require('../db');

/**
 * party-system.js
 * Manages squad creation, membership, roles, and synergy bonuses.
 * 
 * DESIGN SPEC:
 * - Max 4 members
 * - Roles: Bulwark (Tank), Vanguard (DPS), Guardian (Healer), Scout (Support)
 * - Synergy: 1.5x XP/Rep/Loot if full squad with 4 unique roles.
 */

class PartySystem {
    constructor() {
        this.maxSize = 4;
    }

    async createParty(userId, name) {
        // Validation handled in db or here?
        // Let's do it here for specific logic
        const user = await db.getUser(userId);
        if (user.partyId && !user.partyId.startsWith('solo_')) {
            throw new Error(`You are already in a party (${user.partyId}). Leave it first.`);
        }

        const partyId = `party_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const finalName = name || `${user.username}'s Squad`;

        // DB Call to create
        await db.update(state => {
            state.parties[partyId] = {
                id: partyId,
                name: finalName,
                leader: userId.toLowerCase(),
                members: [userId.toLowerCase()],
                roles: {
                    [userId.toLowerCase()]: 'Vanguard' // Default role
                },
                createdAt: new Date().toISOString(),
                stats: { raidsWon: 0, totalXp: 0 }
            };

            // Update user
            if (state.users[userId.toLowerCase()]) {
                state.users[userId.toLowerCase()].partyId = partyId;
                state.users[userId.toLowerCase()].mmoRole = 'Vanguard';
            }
            return state;
        });

        return this.getParty(partyId);
    }

    async joinParty(userId, partyId) {
        const user = await db.getUser(userId);
        if (user.partyId && !user.partyId.startsWith('solo_')) {
            throw new Error("Already in a party.");
        }

        let joined = false;
        await db.update(state => {
            const party = state.parties[partyId];
            if (!party) throw new Error("Party not found.");
            if (party.members.length >= this.maxSize) throw new Error("Party is full.");

            party.members.push(userId.toLowerCase());
            // Auto-assign first available role or default
            const takenRoles = Object.values(party.roles);
            const availableRoles = ['Bulwark', 'Vanguard', 'Guardian', 'Scout'].filter(r => !takenRoles.includes(r));
            const newRole = availableRoles.length > 0 ? availableRoles[0] : 'Vanguard';

            party.roles[userId.toLowerCase()] = newRole;

            if (state.users[userId.toLowerCase()]) {
                state.users[userId.toLowerCase()].partyId = partyId;
                state.users[userId.toLowerCase()].mmoRole = newRole;
            }
            joined = true;
            return state;
        });

        return joined ? this.getParty(partyId) : null;
    }

    async leaveParty(userId) {
        let oldPartyId = null;
        await db.update(state => {
            const id = userId.toLowerCase();
            const user = state.users[id];
            if (!user || !user.partyId || user.partyId.startsWith('solo_')) return state;

            oldPartyId = user.partyId;
            const party = state.parties[oldPartyId];

            if (party) {
                party.members = party.members.filter(m => m !== id);
                delete party.roles[id];

                // Dissolve if empty
                if (party.members.length === 0) {
                    delete state.parties[oldPartyId];
                } else if (party.leader === id) {
                    // Transfer leadership
                    party.leader = party.members[0];
                }
            }

            user.partyId = `solo_${id}`;
            user.mmoRole = null; // Or keep last role? Resetting prompts choice.
            return state;
        });
        return oldPartyId;
    }

    async setRole(userId, role) {
        const validRoles = ['Bulwark', 'Vanguard', 'Guardian', 'Scout'];
        if (!validRoles.includes(role)) throw new Error("Invalid role.");

        await db.update(state => {
            const id = userId.toLowerCase();
            const user = state.users[id];
            if (!user || !user.partyId || user.partyId.startsWith('solo_')) throw new Error("Not in a party.");

            const party = state.parties[user.partyId];
            if (party) {
                // Check if role is taken by someone else? 
                // Spec says "if all unique", implies we can enforce or just reward uniqueness.
                // Let's allow switching, synergy calc handles the bonus.
                party.roles[id] = role;
                user.mmoRole = role;
            }
            return state;
        });

        return this.getPartyForUser(userId);
    }

    async getParty(partyId) {
        const state = await db.read();
        return state.parties[partyId] || null;
    }

    async getPartyForUser(userId) {
        const user = await db.getUser(userId);
        if (!user || !user.partyId || user.partyId.startsWith('solo_')) return null;
        return this.getParty(user.partyId);
    }

    /**
     * Calculates the synergy multiplier for a given party.
     * Returns:
     * 1.0 - Basic
     * 1.5 - Full Squad (4 members) + Unique Roles (Bulwark, Vanguard, Guardian, Scout)
     */
    async getSynergyBonus(partyId) {
        if (!partyId || partyId.startsWith('solo_')) return 1.0;

        const party = await this.getParty(partyId);
        if (!party) return 1.0;

        if (party.members.length < 4) return 1.0;

        const roles = Object.values(party.roles);
        const uniqueRoles = new Set(roles);
        const requiredRoles = ['Bulwark', 'Vanguard', 'Guardian', 'Scout'];

        const hasAll = requiredRoles.every(r => uniqueRoles.has(r));

        return hasAll ? 1.5 : 1.1; // 1.5x for perfect synergy, 1.1x for full squad mixed
    }
}

module.exports = { partySystem: new PartySystem() };
