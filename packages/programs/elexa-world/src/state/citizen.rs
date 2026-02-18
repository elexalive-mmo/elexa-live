use anchor_lang::prelude::*;

#[account]
pub struct Citizen {
    pub id: u64,
    pub owner: Pubkey, // Wallet for Players, System for NPCs
    pub citizen_type: CitizenType,
    pub lifespan: i64, // 0 for Immortal Players
    pub name: String,
    pub role: Role,
    pub vision: String, // "Decentralization", "Gains", etc.
    pub is_founder: bool,
    pub hp: u8, // 0-100
    pub morale: u8, // 0-100
    pub level: u8,
    pub exp: u64,
    pub birth_tick: i64,
    pub stats: Stats,
    pub inventory: Vec<Pubkey>, // Top 5 Items (cNFT Mints or PDA addresses)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum CitizenType {
    NPC,
    Player,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum Role {
    Vagabond,
    Miner,
    Trader,
    Artist,
    Architect,
    Warlord,
    Mystic,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub struct Stats {
    pub strength: u8,
    pub intellect: u8,
    pub charisma: u8,
    pub luck: u8,
}
