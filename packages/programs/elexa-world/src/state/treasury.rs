use anchor_lang::prelude::*;

#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub sol_balance: u64,
    pub tax_rate: u16, // Basis Points (e.g., 200 = 2%)
}
