"""In-memory experiment + variant state."""

from collections import deque
from dataclasses import dataclass, field

from sprt import SPRTEngine


@dataclass
class Variant:
    """A single arm of the experiment (control or treatment)."""

    name: str
    engine: SPRTEngine
    visitors: int = 0
    conversions: int = 0

    @property
    def cvr(self) -> float:
        """Conversion rate as a percentage, rounded to 2 dp."""
        return round(self.conversions / max(1, self.visitors) * 100, 2)


@dataclass
class Experiment:
    """Holds both variants and the overall decision status.

    Only the treatment variant runs a live SPRT against the baseline; the
    control variant carries an engine too so resets are symmetric, but the
    experiment status is driven by the treatment engine's decision.
    """

    name: str
    control: Variant
    treatment: Variant
    status: str = "running"

    # "demo" -> driven by the simulator; "live" -> driven by real POST /event.
    mode: str = "demo"

    # Config echoed back to the client for display / chart boundaries.
    p0: float = 0.10
    p1: float = 0.12
    alpha: float = 0.05
    beta: float = 0.20
    events_per_second: float = 3.0

    # Rolling buffer of the most recent observations, for the live event feed.
    recent: deque = field(default_factory=lambda: deque(maxlen=30))
    _event_id: int = 0

    @classmethod
    def create(cls, name: str = "checkout_cta_v2", p0: float = 0.10,
               p1: float = 0.12, alpha: float = 0.05, beta: float = 0.20,
               events_per_second: float = 3.0, mode: str = "demo") -> "Experiment":
        """Factory that wires up fresh engines for both variants."""
        return cls(
            name=name,
            control=Variant("control", SPRTEngine(p0, p1, alpha, beta)),
            treatment=Variant("treatment", SPRTEngine(p0, p1, alpha, beta)),
            p0=p0, p1=p1, alpha=alpha, beta=beta,
            events_per_second=events_per_second, mode=mode,
        )

    def record(self, variant: str, converted: bool) -> None:
        """Route an observation to a variant, update counts + engine + status."""
        target = self.treatment if variant == "treatment" else self.control
        target.visitors += 1
        if converted:
            target.conversions += 1
        decision = target.engine.update(converted)

        # The treatment engine drives the experiment's overall decision.
        if variant == "treatment" and decision != "continue":
            self.status = decision

        # Append to the live feed buffer.
        self.recent.append({
            "id": self._event_id,
            "variant": variant,
            "converted": converted,
            "llr": round(self.treatment.engine.llr, 4),
        })
        self._event_id += 1

    def reset(self) -> None:
        """Zero out both variants and restart the experiment."""
        for v in (self.control, self.treatment):
            v.visitors = 0
            v.conversions = 0
            v.engine.reset()
        self.status = "running"
        self.recent.clear()
        self._event_id = 0

    @property
    def lift(self) -> float:
        """Relative lift of treatment CVR over control CVR, as a percentage."""
        if self.control.cvr == 0:
            return 0.0
        return round((self.treatment.cvr - self.control.cvr) / self.control.cvr * 100, 1)

    def to_dict(self) -> dict:
        """Full serialisable state snapshot for the client."""
        eng = self.treatment.engine
        return {
            "name": self.name,
            "status": self.status,
            "mode": self.mode,
            "control": {
                "name": self.control.name,
                "visitors": self.control.visitors,
                "conversions": self.control.conversions,
                "cvr": self.control.cvr,
                "llr": round(self.control.engine.llr, 4),
            },
            "treatment": {
                "name": self.treatment.name,
                "visitors": self.treatment.visitors,
                "conversions": self.treatment.conversions,
                "cvr": self.treatment.cvr,
                "llr": round(self.treatment.engine.llr, 4),
            },
            "lift": self.lift,
            "total_visitors": self.control.visitors + self.treatment.visitors,
            "recent_events": list(self.recent),
            "bounds": {"A": round(eng.A, 4), "B": round(eng.B, 4)},
            "config": {
                "p0": self.p0,
                "p1": self.p1,
                "alpha": self.alpha,
                "beta": self.beta,
                "events_per_second": self.events_per_second,
            },
        }
