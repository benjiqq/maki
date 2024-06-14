use anchor_lang::prelude::*;

declare_id!("BcsodSJ8neSSPdomYg5qmgzdh5TnAnr4HLBLhwboQPYt");

#[program]
mod maki {
    use super::*;

    pub fn purchase(ctx: Context<Purchase>, amount: u64) -> Result<()> {
        let purchaser = &ctx.accounts.purchaser;
        let seller = &ctx.accounts.seller;
        let program_vault = &ctx.accounts.program_vault;

        // Transfer 0.1 SOL from purchaser to program vault
        let transfer_amount = 0.1 * 1_000_000_000.0; // 0.1 SOL in lamports

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &purchaser.key(),
            &program_vault.key(),
            transfer_amount as u64,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                purchaser.to_account_info(),
                program_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Log the purchase details
        msg!(
            "Purchase: {} from {} to {}",
            amount,
            purchaser.key,
            seller.key
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(mut)]
    pub purchaser: Signer<'info>,
    /// CHECK: This is not dangerous because we trust the frontend to provide a valid seller account.
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is a PDA controlled by the program.
    pub program_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
