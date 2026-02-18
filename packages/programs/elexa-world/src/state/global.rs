use anchor_lang::prelude::*;

#[account]
pub struct GlobalWorld {
    pub authority: Pubkey,
    pub seed: u64,
    pub market_phase: MarketPhase, // Seed, Growth, Correction, Expansion
    pub weather: Weather,
    pub last_tick: i64,
    pub citizen_count: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum MarketPhase {
    Seed,       // < $5k
    Growth,     // $5k - $20k
    Correction, // Dip buying
    Expansion,  // > $50k (Current State)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum Weather {
    Sunny,
    Storm,
    NebulaMist,
    SolarFlare,
}
