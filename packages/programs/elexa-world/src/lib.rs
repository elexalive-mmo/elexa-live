use anchor_lang::prelude::*;

pub mod state;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod elexa_world {
    use super::*;

    // 1. GLOBAL WORLD PDA (The Sky)
    pub fn initialize_world(ctx: Context<InitializeWorld>, seed: u64) -> Result<()> {
        let world = &mut ctx.accounts.world;
        world.authority = ctx.accounts.admin.key();
        world.seed = seed;
        world.market_phase = MarketPhase::Seed; // Start small
        world.weather = Weather::Sunny;
        world.last_tick = Clock::get()?.unix_timestamp;
        world.citizen_count = 0;
        msg!("🌍 GlobalWorld Initialized. Phase: Seed.");
        Ok(())
    }

    // 2. TREASURY PDA (The Heart)
    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.admin.key(); // Jefe Wallet
        treasury.sol_balance = 0;
        treasury.tax_rate = 200; // 2.0% (Basis Points)
        msg!("💎 Treasury Online. Flow established.");
        Ok(())
    }

    // 3. REGISTER PLAYER CITIZEN (The User)
    pub fn register_player(ctx: Context<RegisterPlayer>, name: String, vision: String) -> Result<()> {
        let citizen = &mut ctx.accounts.citizen;
        citizen.id = ctx.accounts.world.citizen_count;
        citizen.owner = ctx.accounts.user.key();
        citizen.citizen_type = CitizenType::Player;
        citizen.lifespan = 0; // Immortal
        citizen.name = name;
        citizen.vision = vision;
        citizen.role = Role::Vagabond; // Default role
        citizen.is_founder = false;
        citizen.hp = 100;
        citizen.morale = 100;
        citizen.level = 1;
        citizen.exp = 0;
        citizen.birth_tick = Clock::get()?.unix_timestamp;
        citizen.inventory = Vec::new(); // Starts empty

        // Default Stats
        citizen.stats = Stats {
            strength: 5,
            intellect: 5,
            charisma: 5,
            luck: 5,
        };
        
        // Update World Count
        let world = &mut ctx.accounts.world;
        world.citizen_count += 1;
        
        msg!("👤 Player Registered: {}", citizen.name);
        Ok(())
    }
    
    // 3.5 SPAWN NPC CITIZEN (The Simulation)
    pub fn spawn_npc(ctx: Context<SpawnNPC>, name: String, role: Role, vision: String, lifespan: i64) -> Result<()> {
        let npc = &mut ctx.accounts.citizen;
        npc.id = ctx.accounts.world.citizen_count;
        npc.owner = ctx.accounts.world.key(); // Owned by System (Treasury Root Logic)
        npc.citizen_type = CitizenType::NPC;
        npc.lifespan = lifespan;
        npc.name = name;
        npc.role = role;
        npc.vision = vision;
        npc.is_founder = false;
        npc.hp = 100;
        npc.morale = 100;
        npc.level = 1;
        npc.exp = 0;
        npc.birth_tick = Clock::get()?.unix_timestamp;
        npc.inventory = Vec::new();

         // Randomized Stats (Mocked or passed in)
        npc.stats = Stats {
            strength: 5,
            intellect: 5,
            charisma: 5,
            luck: 5,
        };
        
        let world = &mut ctx.accounts.world;
        world.citizen_count += 1;
        
        msg!("👶 NPC Born: {}. Role: {:?}. Lifespan: {}", npc.name, npc.role, lifespan);
        Ok(())
    }

    // 3.6 UPDATE CITIZEN (Mutability Check)
    pub fn update_citizen(ctx: Context<UpdateCitizen>, new_name: Option<String>, new_role: Option<Role>) -> Result<()> {
        let citizen = &mut ctx.accounts.citizen;
        // Verify Authority
        require!(
            citizen.owner == ctx.accounts.authority.key() || ctx.accounts.authority.key() == ctx.accounts.world_authority.key(),
            ElexaError::Unauthorized
        );

        if let Some(n) = new_name {
            citizen.name = n;
        }
        if let Some(r) = new_role {
            citizen.role = r;
        }
        msg!("🔄 Citizen Updated: {} [Role: {:?}]", citizen.name, citizen.role);
        Ok(())
    }

    // 3.7 GAIN EXPERIENCE (Growth & Trade)
    pub fn gain_exp(ctx: Context<GainExp>, amount: u64) -> Result<()> {
        let citizen = &mut ctx.accounts.citizen;
        // Authority check: Owner or World Authority
        require!(
            citizen.owner == ctx.accounts.authority.key() || ctx.accounts.authority.key() == ctx.accounts.world_authority.key(),
            ElexaError::Unauthorized
        );
        
        citizen.exp = citizen.exp.checked_add(amount).unwrap_or(u64::MAX);
        
        // Simple Level Up Threshold: Level * 1000
        let threshold = (citizen.level as u64) * 1000;
        if citizen.exp >= threshold {
            citizen.level = citizen.level.saturating_add(1);
            // We keep the exp accumulating (not resetting) for total exp tracking, 
            // or we could reset. Let's assume total EXP accumulation model for now.
            msg!("🆙 LEVEL UP! {} is now Level {}", citizen.name, citizen.level);
        }
        
        msg!("📈 EXP Gained: +{}", amount);
        Ok(())
    }

    // 5. COUNCIL PDA (The Sovereigns)
    pub fn convene_council(ctx: Context<ConveneCouncil>, member_wallets: [Pubkey; 5]) -> Result<()> {
        let council = &mut ctx.accounts.council;
        council.authority = ctx.accounts.admin.key();
        
        // Initialize the 5 Sovereigns
        let roles = [CouncilRole::Arbiter, CouncilRole::Sentinel, CouncilRole::Oracle, CouncilRole::Keeper, CouncilRole::Void];
        for (i, role) in roles.iter().enumerate() {
            council.members[i] = CouncilMember {
                wallet: member_wallets[i],
                role: *role,
                morale: 100,
                strategy: Strategy::Passive, // Default
                volume_generated: 0,
            };
        }
        
        msg!("🏛️ The Council has convened. 5 Market Makers Active.");
        Ok(())
    }
}

// --- ACCOUNTS ---

#[derive(Accounts)]
pub struct InitializeWorld<'info> {
    #[account(init, payer = admin, space = 8 + 500, seeds = [b"global_world"], bump)]
    pub world: Account<'info, GlobalWorld>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(init, payer = admin, space = 8 + 200, seeds = [b"treasury"], bump)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterPlayer<'info> {
    #[account(init, payer = user, space = 8 + 1000, seeds = [b"citizen", world.citizen_count.to_le_bytes().as_ref()], bump)]
    pub citizen: Account<'info, Citizen>,
    #[account(mut)]
    pub world: Account<'info, GlobalWorld>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct SpawnNPC<'info> {
    #[account(init, payer = authority, space = 8 + 1000, seeds = [b"citizen", world.citizen_count.to_le_bytes().as_ref()], bump)]
    pub citizen: Account<'info, Citizen>,
    #[account(mut)]
    pub world: Account<'info, GlobalWorld>,
    #[account(mut)]
    pub authority: Signer<'info>, // Admin requesting spawn
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCitizen<'info> {
    #[account(mut)]
    pub citizen: Account<'info, Citizen>,
    /// CHECK: Authority check performed in instruction logic
    pub authority: Signer<'info>,
    pub world_authority: Signer<'info>, // Optional admin override
}

#[derive(Accounts)]
pub struct GainExp<'info> {
    #[account(mut)]
    pub citizen: Account<'info, Citizen>,
    /// CHECK: Authority check performed in instruction logic
    pub authority: Signer<'info>,
    pub world_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConveneCouncil<'info> {
    #[account(init, payer = admin, space = 8 + 1000, seeds = [b"council"], bump)]
    pub council: Account<'info, Council>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ElexaError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
