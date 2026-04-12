# Privance

**Privacy-preserving peer-to-peer lending on Ethereum, powered by Zama FHEVM.**

Privance enables borrowers and lenders to transact without exposing credit scores, loan amounts, or matching criteria on-chain. All sensitive comparisons are computed in the encrypted domain using Fully Homomorphic Encryption (FHE) — the result of a match check is an encrypted boolean that only the intended parties can decrypt.

> **Zama Developer Program — Mainnet Season 2, Builder Track submission.**

---

## How It Works

### The Core Problem

On-chain lending is either:
- **Transparent** — everyone sees your credit score, loan amount, and counterparty criteria; or
- **Off-chain** — you trust a centralized intermediary.

Privance solves this with **on-chain FHE computation**: scores and thresholds stay encrypted in storage and are compared without ever being decrypted on-chain.

### Loan Lifecycle

```
Borrower                                    Lender
   │                                           │
   ├─ computeCreditScore()                     ├─ createLenderOffer(minScore, maxAmount)
   │   (FHE: Tier1 + Tier2 → euint64)         │   (deposits ETH, params encrypted)
   │                                           │
   ├─ createLoanRequest(amount, duration)      │
   │   (encrypted amount, plain amount)        │
   │                                           │
   ├──────── checkLoanMatch(loanId, offerId) ──┤
   │         (FHE: score >= min AND             │
   │          amount <= max → ebool)           │
   │                                           │
   │         [lender decrypts ebool off-chain] │
   │                                           │
   └─ fundLoan(loanId, offerId) ──────────────►│
       ETH sent to borrower                    │
       collateral locked                       │
       RepaymentAgreement created              │
   │                                           │
   ├─ makePayment(agreementId) ───────────────►│
   │   (ETH forwarded to lender)               │
   │   (collateral released on full repayment) │
   │                                           │
   └─ [or checkDefault() by anyone after due]  │
       collateral liquidated to lender
```

---

## Architecture

Three contracts form the Privance v2 protocol, all deployed and wired by the deploy scripts.

### `LendingMarketplace.sol`

The central coordinator. Owns the FHE credit scoring logic and orchestrates loan lifecycle.

| Function | Description |
|---|---|
| `computeCreditScore()` | Computes an encrypted FICO-analogous score (300–850) from on-chain data |
| `createLoanRequest(...)` | Borrower posts an encrypted loan request; requires a valid score |
| `cancelLoanRequest(loanId)` | Borrower withdraws an unfunded request |
| `createLenderOffer(...)` | Lender deposits ETH with encrypted criteria |
| `cancelLenderOffer(offerId)` | Lender withdraws offer and reclaims ETH |
| `checkLoanMatch(loanId, offerId)` | FHE comparison → encrypted `ebool` stored on-chain |
| `fundLoan(loanId, offerId)` | Lender funds; transfers exact `plainRequestedAmount` to borrower |
| `setAavePool(address)` | Owner sets Aave V3 Pool for Tier-2 scoring (optional) |
| `setScoreValidityPeriod(seconds)` | Owner sets how long a score stays valid; `0` = never expires |

### `CollateralManager.sol`

Manages ETH collateral. Both `LendingMarketplace` (for locking) and `RepaymentTracker` (for release/liquidation) are authorized callers.

| Function | Caller | Description |
|---|---|---|
| `depositCollateral()` | Anyone | Deposit ETH collateral |
| `withdrawCollateral(amount)` | Borrower | Withdraw unlocked collateral |
| `lockCollateral(borrower, amount, loanId)` | Marketplace only | Lock collateral at loan funding |
| `releaseCollateral(loanId)` | Marketplace or RepaymentTracker | Release after repayment |
| `liquidateCollateral(loanId, liquidator)` | Marketplace or RepaymentTracker | Seize to lender on default |
| `updateRepaymentTracker(address)` | Owner | Wire RepaymentTracker authorization |

### `RepaymentTracker.sol`

Manages repayment agreements, payment forwarding, and default enforcement.

| Function | Description |
|---|---|
| `createAgreement(...)` | Called by Marketplace at funding; creates a `RepaymentAgreement` |
| `makePayment(agreementId)` | Borrower sends ETH; forwarded directly to lender |
| `checkDefault(agreementId)` | Anyone calls after due date; liquidates collateral if overdue |
| `getAgreementStatus(id)` | Returns `"ACTIVE"` / `"REPAID"` / `"DEFAULTED"` / `"OVERDUE"` |

---

## FHE Credit Scoring

### Score Range

Scores are clamped to **300–850** (FICO-analogous). They are stored as `euint64` ciphertext; only the borrower can decrypt their own score via the Zama Relayer.

### Computation Formula

```
score = clamp(base + repaymentBonus - penalty + aaveBonus, 300, 850)
```

| Component | Details |
|---|---|
| **Base** | 500 |
| **Repayment bonus** (Tier 1) | +50 per completed Privance loan, capped at +300 |
| **Default penalty** (Tier 1) | −100 per defaulted loan, capped to prevent underflow |
| **Aave health factor bonus** (Tier 2) | 0–200 pts, mapped from Aave V3 health factor (optional) |

### Tier 1 — Privance Native History

Reads the borrower's own `RepaymentTracker` agreements. Fully trustless — all data lives in the same protocol.

### Tier 2 — Aave V3 Health Factor

Reads the borrower's **public** `healthFactor` from Aave V3 Pool via `IAaveV3Pool.getUserAccountData`. The health factor is a plain `uint256` read from a public view, so it can be safely converted to an encrypted value. This is zero-trust — no oracle, no off-chain feed.

| Health Factor | Aave Bonus |
|---|---|
| ≥ 3.0× | +200 |
| ≥ 2.0× | +150 |
| ≥ 1.5× | +100 |
| ≥ 1.0× | +50 |
| < 1.0× | 0 |

Tier 2 is **opt-in** — set `setAavePool(address(0))` to disable it. If the Aave call reverts for any reason, the bonus falls back to 0 gracefully.

### Score Validity

Scores can be configured to expire via `setScoreValidityPeriod(seconds)`. Setting `0` disables expiry. Expired scores block `createLoanRequest` — borrowers must recompute before posting a new request.

---

## Project Structure

```
Privance/
├── packages/
│   ├── hardhat/                    # Contracts, tests, deploy scripts
│   │   ├── contracts/
│   │   │   ├── LendingMarketplace.sol
│   │   │   ├── CollateralManager.sol
│   │   │   ├── RepaymentTracker.sol
│   │   │   └── IAaveV3Pool.sol     # Minimal Aave V3 Pool interface
│   │   ├── deploy/
│   │   │   ├── 01_deploy_collateral.ts
│   │   │   ├── 02_deploy_repayment.ts
│   │   │   └── 03_deploy_marketplace.ts
│   │   └── test/
│   │       └── LendingMarketplace.test.ts
│   ├── fhevm-sdk/                  # Zama FHEVM SDK wrapper
│   └── nextjs/                     # Frontend (React + Next.js)
└── README.md
```

---

## Prerequisites

- **Node.js** v18+
- **pnpm** v8+
- A funded wallet (deployer) with `MNEMONIC` set

---

## Developer Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Set Hardhat configuration variables as documented in the [Zama setup guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional):

```bash
cd packages/hardhat
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY   # for Sepolia
```

---

## Compile

```bash
cd packages/hardhat
npx hardhat compile
```

TypeChain types are regenerated automatically into `packages/hardhat/types/`.

---

## Testing

All 54 tests pass against the Hardhat local network with the FHEVM mock coprocessor.

```bash
cd packages/hardhat
npx hardhat test --network hardhat
```

### Test Coverage

| Suite | Tests |
|---|---|
| Deployment | 3 — contract wiring, addresses, ownership |
| `computeCreditScore` | 5 — base score, re-computation, expiry |
| `createLoanRequest` | 6 — lifecycle, cancellation, revert cases |
| `createLenderOffer` | 4 — lifecycle, cancellation, revert cases |
| `checkLoanMatch` | 6 — match storage, idempotency, revert cases |
| `fundLoan` | 10 — transfers, collateral locking, agreement creation, reverts |
| `makePayment` | 7 — partial/full repayment, score update, reverts |
| `checkDefault` | 5 — before/after due date, liquidation, score penalty |
| `CollateralManager` | 4 — deposit, withdraw, locked balance |
| Admin controls | 3 — `setAavePool`, `setScoreValidityPeriod` ACL |

---

## Deployment

Contracts are deployed in order using `hardhat-deploy`. Script `03_deploy_marketplace.ts` wires all cross-contract references automatically.

### Local Hardhat Node

```bash
# Terminal 1
cd packages/hardhat
npx hardhat node

# Terminal 2
npx hardhat deploy --network localhost
```

### Sepolia Testnet

```bash
cd packages/hardhat
npx hardhat deploy --network sepolia
```

### Post-Deploy: Optional Aave Integration

To enable Tier-2 scoring on Sepolia:

```bash
# Aave V3 Pool on Sepolia: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
npx hardhat run --network sepolia scripts/set-aave-pool.ts
```

Or call `setAavePool(poolAddress)` directly from the owner wallet.

### Deployment Order & Wiring

`03_deploy_marketplace.ts` performs these steps automatically:

1. Deploy `LendingMarketplace(collateralAddress, repaymentAddress)`
2. `CollateralManager.updateMarketplace(marketplaceAddress)`
3. `RepaymentTracker.updateMarketplace(marketplaceAddress)`
4. `CollateralManager.updateRepaymentTracker(repaymentAddress)` ← v2 fix

Step 4 is the critical v2 addition: it authorizes `RepaymentTracker` to call `releaseCollateral` and `liquidateCollateral` on `CollateralManager`, which was blocked in v1.

---

## Security Notes

- **No oracle dependency** — all scoring inputs are read from public on-chain state (Privance protocol state + Aave public view).
- **Underflow protection** — default penalty is capped to total gains before subtraction in the FHE domain.
- **Collateral check at funding** — `fundLoan` verifies available collateral before locking, preventing dust attacks.
- **Exact transfer** — `fundLoan` transfers exactly `plainRequestedAmount`, not the offer's full `availableFunds`.
- **Offer stays live** — a lender offer remains active until funds are exhausted; multiple loans can be funded from one offer.
- **Access control** — `lockCollateral` is restricted to `LendingMarketplace`; `releaseCollateral` / `liquidateCollateral` are restricted to `LendingMarketplace` or `RepaymentTracker`.

---

## FHE Operations Used

| Operation | Purpose |
|---|---|
| `FHE.asEuint64` | Wrap plaintext scores into ciphertext |
| `FHE.fromExternal` | Decrypt user-submitted encrypted inputs (with ZKP proof) |
| `FHE.add` / `FHE.sub` / `FHE.mul` | Score arithmetic |
| `FHE.gt` / `FHE.lt` / `FHE.ge` / `FHE.le` | Score comparisons |
| `FHE.and` | Combine score match AND amount match |
| `FHE.select` | Encrypted conditional (used for clamping and capping) |
| `FHE.allowThis` | Grant the contract access to its own ciphertext handles |
| `FHE.allow` | Grant a specific address (borrower/lender) decryption rights |

---

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm-solidity)
- [Relayer SDK](https://docs.zama.ai/protocol/relayer-sdk-guides/)
- [Aave V3 Developer Docs](https://docs.aave.com/developers/core-contracts/pool)
- [Zama Developer Program](https://www.zama.ai/developer-program)

---

## License

BSD-3-Clause-Clear. See [LICENSE](LICENSE).
