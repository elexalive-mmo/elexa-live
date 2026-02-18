/**
 * ⚔️ Elexamon Battle System Engine
 * Core logic for Turn-Based RPG Combat & Auto-Battler
 */

const ELEMENTS = {
    AETHER: 'Aether',
    EARTH: 'Earth',
    WATER: 'Water',
    FIRE: 'Fire',
    VOID: 'Void'
};

// Type Web: Aether > Earth > Water > Fire > Void > Aether
const TYPE_ADVANTAGE = {
    [ELEMENTS.AETHER]: ELEMENTS.EARTH,
    [ELEMENTS.EARTH]: ELEMENTS.WATER,
    [ELEMENTS.WATER]: ELEMENTS.FIRE,
    [ELEMENTS.FIRE]: ELEMENTS.VOID,
    [ELEMENTS.VOID]: ELEMENTS.AETHER
};

/**
 * Calculates Elemental Multiplier
 */
function getTypeMultiplier(attackerType, defenderType) {
    if (TYPE_ADVANTAGE[attackerType] === defenderType) return 1.5; // Super Effective
    if (TYPE_ADVANTAGE[defenderType] === attackerType) return 0.5; // Not Very Effective
    return 1.0; // Neutral
}

/**
 * Calculates Damage
 * Formula: (ATK * Power / DEF) * TypeMult * Random(0.85, 1.15)
 */
function calculateDamage(attacker, defender, movePower = 40) {
    const typeMult = getTypeMultiplier(attacker.element, defender.element);
    const random = 0.85 + Math.random() * 0.3;
    const damage = Math.floor(((attacker.stats.atk * movePower) / Math.max(1, defender.stats.def)) * typeMult * random);

    return { damage, typeMult, isCrit: random > 1.1 };
}

class BattleEngine {
    constructor() {
        this.battles = {};
    }

    /**
     * Starts a new battle simulation
     */
    startBattle(party, enemies) {
        const battleId = Date.now().toString(36);
        const state = {
            id: battleId,
            turn: 0,
            party: JSON.parse(JSON.stringify(party)), // Deep copy
            enemies: JSON.parse(JSON.stringify(enemies)),
            log: [],
            active: true,
            winner: null
        };

        // Initial Log
        state.log.push(`Battle Started! ${party.length} Heroes vs ${enemies.length} Enemies.`);

        return state;
    }

    /**
     * Simulates a full battle (Auto-Battle / Offline Mode)
     */
    simulateBattle(party, enemies) {
        let state = this.startBattle(party, enemies);

        while (state.active && state.turn < 50) { // Cap at 50 turns to prevent loops
            state = this.processTurn(state);
        }

        if (state.turn >= 50 && state.active) {
            state.active = false;
            state.winner = 'draw';
            state.log.push("Battle timed out! It's a draw.");
        }

        return state;
    }

    /**
     * Processes a Single Turn
     */
    processTurn(state) {
        state.turn++;
        state.log.push(`--- Turn ${state.turn} ---`);

        // 1. Collect all combatants
        const combatants = [
            ...state.party.map(c => ({ ...c, team: 'hero' })),
            ...state.enemies.map(c => ({ ...c, team: 'enemy' }))
        ].filter(c => c.hp > 0);

        // 2. Sort by Speed
        combatants.sort((a, b) => b.stats.spd - a.stats.spd);

        // 3. Execute Actions
        for (const actor of combatants) {
            if (actor.hp <= 0) continue; // Died mid-turn

            // Target Selection (Simple AI: Random Living Opponent)
            const targets = combatants.filter(c => c.team !== actor.team && c.hp > 0);
            if (targets.length === 0) {
                // Battle Over
                state.active = false;
                state.winner = actor.team;
                state.log.push(`${actor.team === 'hero' ? 'Heroes' : 'Enemies'} win!`);
                return state;
            }

            const target = targets[Math.floor(Math.random() * targets.length)];
            const { damage, typeMult, isCrit } = calculateDamage(actor, target);

            // Apply Damage
            target.hp = Math.max(0, target.hp - damage);

            // Update the real state reference
            const realTarget = (target.team === 'hero' ? state.party : state.enemies).find(c => c.id === target.id);
            if (realTarget) realTarget.hp = target.hp;

            // Log
            let msg = `${actor.name} attacks ${target.name} for ${damage} dmg!`;
            if (typeMult > 1) msg += ` (Super Effective!)`;
            if (typeMult < 1) msg += ` (Resisted...)`;
            if (isCrit) msg += ` (CRITICAL!)`;
            if (target.hp === 0) msg += ` ${target.name} fainted!`;

            state.log.push(msg);
        }

        // 4. Check Win Condition
        const heroesAlive = state.party.some(c => c.hp > 0);
        const enemiesAlive = state.enemies.some(c => c.hp > 0);

        if (!heroesAlive) {
            state.active = false;
            state.winner = 'enemy';
            state.log.push("Party wiped out...");
        } else if (!enemiesAlive) {
            state.active = false;
            state.winner = 'hero';
            state.log.push("Victory!");
        }

        return state;
    }
}

module.exports = { BattleEngine, ELEMENTS };
