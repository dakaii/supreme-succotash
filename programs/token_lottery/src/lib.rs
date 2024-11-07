#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::Metadata,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

declare_id!("GTjaVSgTmZnk6XsGuhTtYrviDagB2WD2D9CwJHbSPZXy");

#[program]
pub mod token_lottery {
    use super::*;

    pub fn initialize_config(
        ctx: Context<Initialize>,
        start: u64,
        end: u64,
        price: u64,
    ) -> Result<()> {
        ctx.accounts.token_lottery.bump = ctx.bumps.token_lottery;
        ctx.accounts.token_lottery.start_time = start;
        ctx.accounts.token_lottery.end_time = end;
        ctx.accounts.token_lottery.ticket_price = price;
        ctx.accounts.token_lottery.authority = *ctx.accounts.payer.key;
        ctx.accounts.token_lottery.randomness_account = Pubkey::default();
        ctx.accounts.token_lottery.lottery_pot_amount = 0;
        ctx.accounts.token_lottery.total_tickets = 0;
        ctx.accounts.token_lottery.winner_picked = false;

        Ok(())
    }
}

pub fn initialize_lottery(_ctx: Context<InitializeLottery>) -> Result<()> {
    // let lottery = &mut ctx.accounts.token_lottery;
    // lottery.lottery_pot_amount = 0;
    // lottery.total_tickets = 0;
    // lottery.winner_picked = false;
    // lottery.winner = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
      init,
      payer = payer,
      space = 8 + TokenLottery::INIT_SPACE,
      seeds = [b"token_lottery".as_ref()],
      bump
    )]
    pub token_lottery: Account<'info, TokenLottery>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
      init,
      payer = payer,
      mint::decimals = 0,
      mint::authority = collection_mint,
      mint::freeze_authority = collection_mint,
      seeds = [b"collection_mint".as_ref()],
      bump
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
      init,
      payer = payer,
      token::mint = collection_mint,
      token::authority = collection_token_account,
      seeds = [b"collection_associated_token".as_ref()],
      bump
    )]
    pub collection_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref()
            ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    /// CHECK: This is the metadata account for the collection
    pub metadata: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            b"edition".as_ref(),
            ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    /// CHECK: This is the metadata account for the collection
    pub master_edition: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub associate_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TokenLottery {
    pub bump: u8,
    pub winner: u64,
    pub winner_picked: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub lottery_pot_amount: u64,
    pub total_tickets: u64,
    pub ticket_price: u64,
    pub authority: Pubkey,
    pub randomness_account: Pubkey,
}
