const steps = [
  {
    step: "Step 01",
    title: "Compute Your Encrypted Score",
    body: "Your repayment history and Aave health factor are processed under FHE. The result is stored on-chain as ciphertext — only you can decrypt it.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#1741D9" strokeWidth="1.6" />
        <path d="M7 10l2 2 4-4" stroke="#1741D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: "Step 02",
    title: "Post or Browse Loan Requests",
    body: "Borrowers post encrypted amounts. Lenders set encrypted criteria — minimum score and maximum loan size. Neither party sees the other's raw numbers.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="#1741D9" strokeWidth="1.6" />
        <path d="M6 9h8M6 13h5" stroke="#1741D9" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "Step 03",
    title: "Match, Fund, and Repay",
    body: "Compatibility is verified via encrypted FHE comparisons. Once matched, the lender funds the loan. Repayments are tracked and defaults auto-liquidate collateral.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10h12M11 5l5 5-5 5" stroke="#1741D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Encrypted Credit Scoring",
    body: "Tier 1: Privance repayment history. Tier 2: Aave V3 health factor. Both processed under FHE — your score is a ciphertext, never plaintext.",
  },
  {
    title: "No Intermediary",
    body: "Peer-to-peer. No banks, no oracles, no trusted third parties. Smart contracts enforce rules. FHEVM enforces privacy.",
  },
  {
    title: "Protected Collateral",
    body: "Borrowers lock collateral in a non-custodial vault. On default it auto-liquidates to the lender. No governance, no delay.",
  },
];

export const HowItWorks = () => {
  return (
    <>
      <section id="how-it-works" className="bg-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">How Privance Works</h2>
            <p className="mt-3 text-[#64748B] text-base max-w-md mx-auto">
              Three steps. Every number stays private.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map(step => (
              <div
                key={step.step}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-7 hover:border-[#1741D9]/20 transition-colors"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF0FF] grid place-items-center">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-[#1741D9] tracking-widest uppercase">{step.step}</span>
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2 leading-snug">{step.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#F8FAFC] border-y border-[#E2E8F0] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-[2fr_3fr] gap-12 items-start">
            <div className="md:sticky md:top-24">
              <p className="text-xs font-bold text-[#1741D9] tracking-widest uppercase mb-4">Why Privance</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight leading-tight">
                Privacy is the Product
              </h2>
              <p className="mt-4 text-[#64748B] text-base leading-relaxed">
                Not a marketing claim. An on-chain cryptographic guarantee backed by Zama&apos;s FHEVM.
              </p>
              <a
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1741D9] text-white text-sm font-semibold rounded-lg hover:bg-[#1236BA] active:scale-95 transition-all"
              >
                Get Started
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={f.title} className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#EBF0FF] grid place-items-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#1741D9]">0{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] mb-1">{f.title}</h3>
                      <p className="text-sm text-[#64748B] leading-relaxed">{f.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0F172A] py-20 text-center px-6">
        <p className="text-[#64748B] text-xs font-bold tracking-widest uppercase mb-5">Ready to start?</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 tracking-tight leading-tight">
          Your finances.<br />Your terms.
        </h2>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1741D9] text-white font-bold text-sm rounded-lg hover:bg-[#1236BA] active:scale-95 transition-all"
        >
          Open Dashboard
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>
    </>
  );
};
