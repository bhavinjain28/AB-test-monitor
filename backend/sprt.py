"""Sequential Probability Ratio Test (SPRT) engine.

Pure-Python implementation — no external dependencies.

SPRT lets you peek at results continuously. After every observation we update a
cumulative log-likelihood ratio (LLR) comparing two simple hypotheses about a
Bernoulli conversion rate:

    H0: p == p0   (null — treatment has no effect, baseline conversion rate)
    H1: p == p1   (alternative — treatment lifts conversion rate)

We stop as soon as the LLR crosses one of two decision boundaries derived from
the desired error rates (alpha, beta). Because the boundaries control the error
rates directly, repeated "peeking" does not inflate the false-positive rate the
way it does with a fixed-horizon z-test.
"""

import math


class SPRTEngine:
    """Tracks a running log-likelihood ratio for a single variant vs. baseline."""

    def __init__(self, p0: float = 0.10, p1: float = 0.12,
                 alpha: float = 0.05, beta: float = 0.20):
        # Guard against degenerate probabilities that would break the logs.
        self.p0 = min(max(p0, 1e-6), 1 - 1e-6)
        self.p1 = min(max(p1, 1e-6), 1 - 1e-6)
        self.alpha = alpha
        self.beta = beta

        # Wald's decision boundaries (in log space).
        #   A (lower) ~ -2.77 : accept H0 -> "no_effect"
        #   B (upper) ~ +2.77 : accept H1 -> "winner"
        self.A = math.log(beta / (1 - alpha))
        self.B = math.log((1 - beta) / alpha)

        # Per-observation log-likelihood increments.
        #   converted -> log(p1 / p0)
        #   not conv. -> log((1 - p1) / (1 - p0))
        self._inc_converted = math.log(self.p1 / self.p0)
        self._inc_not_converted = math.log((1 - self.p1) / (1 - self.p0))

        self.llr = 0.0

    def update(self, converted: bool) -> str:
        """Record one observation, update the LLR, and return the decision."""
        self.llr += self._inc_converted if converted else self._inc_not_converted
        return self.decision()

    def decision(self) -> str:
        """Return the current decision without mutating state."""
        if self.llr >= self.B:
            return "winner"
        if self.llr <= self.A:
            return "no_effect"
        return "continue"

    def reset(self) -> None:
        """Reset the accumulated LLR back to zero."""
        self.llr = 0.0


if __name__ == "__main__":
    # Quick sanity check: run the engine against a synthetic stream where the
    # treatment genuinely converts at p1. It should eventually call a winner.
    import random

    engine = SPRTEngine(p0=0.10, p1=0.12, alpha=0.05, beta=0.20)
    print(f"Boundaries  A={engine.A:.3f}  B={engine.B:.3f}")

    for i in range(1, 100_000):
        outcome = random.random() < 0.12
        decision = engine.update(outcome)
        if decision != "continue":
            print(f"Decision '{decision}' after {i} observations, llr={engine.llr:.3f}")
            break
    else:
        print(f"No decision reached, final llr={engine.llr:.3f}")
