import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Maki } from "../target/types/maki";
import { assert } from "chai";

describe("maki", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Maki as Program<Maki>;

  const provider = anchor.AnchorProvider.local();

  it("Executes a purchase and transfers 0.1 SOL!", async () => {
    const purchaser = provider.wallet.publicKey;
    const seller = anchor.web3.Keypair.generate();

    // Generate PDA for program_vault
    const [programVault, programVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault")],
      program.programId
    );

    // Airdrop SOL to the purchaser for testing
    const airdropSignature = await provider.connection.requestAirdrop(purchaser, 0.5 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(airdropSignature, "confirmed");

    // Verify the purchaser balance
    const purchaserBalance = await provider.connection.getBalance(purchaser);
    console.log('Purchaser balance:', purchaserBalance / anchor.web3.LAMPORTS_PER_SOL, 'SOL');
    assert(purchaserBalance >= 0.5 * anchor.web3.LAMPORTS_PER_SOL, "Purchaser balance is not 0.5 SOL");

    const initialVaultBalance = await provider.connection.getBalance(programVault);

    await program.methods
      .purchase(new anchor.BN(1000))
      .accounts({
        purchaser,
        seller: seller.publicKey,
        programVault: programVault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const finalVaultBalance = await provider.connection.getBalance(programVault);

    console.log('Program vault initial balance:', initialVaultBalance / anchor.web3.LAMPORTS_PER_SOL, 'SOL');
    console.log('Program vault final balance:', finalVaultBalance / anchor.web3.LAMPORTS_PER_SOL, 'SOL');
    console.log('Balance transferred to program vault:', (finalVaultBalance - initialVaultBalance) / anchor.web3.LAMPORTS_PER_SOL, 'SOL');

    // Verify the transfer amount to the program vault
    assert((finalVaultBalance - initialVaultBalance) === 0.1 * anchor.web3.LAMPORTS_PER_SOL, "Transfer amount to program vault is not 0.1 SOL");
  });
});
