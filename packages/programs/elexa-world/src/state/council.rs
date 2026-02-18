use anchor_lang::prelude::*;

#[account]
pub struct Council {
    pub authority: Pubkey,
    pub members: [CouncilMember; 5],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct CouncilMember {
    pub wallet: Pubkey,
    pub role: CouncilRole,
    pub morale: u8,
    pub strategy: Strategy,
    pub volume_generated: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum CouncilRole {
    Arbiter,
    Sentinel,
    Oracle,
    Keeper,
    Void,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum Strategy {
    Passive,
    Aggressive,
    Sniper,
    Hype,
}
