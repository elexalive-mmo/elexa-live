use anchor_lang::prelude::*;

#[account]
pub struct MarketListing {
    pub seller: Pubkey,
    pub item_account: Pubkey,
    pub price: u64,
    pub is_active: bool,
}

#[account]
pub struct Plot {
    pub x: i16,
    pub y: i16,
    pub owner: Pubkey,
    pub road_access: bool,
}

#[account]
pub struct Building {
    pub plot: Pubkey, // Link to Plot
    pub type_id: u8,
    pub level: u8,
}
