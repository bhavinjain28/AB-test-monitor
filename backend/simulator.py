"""Async synthetic event stream.

Generates random visitor/conversion events for the experiment and feeds them
into the engine in real time. The control arm converts at the experiment's
baseline rate (p0); the treatment arm at the alternative rate (p1).
"""

import asyncio
import random


async def stream_events(experiment, events_per_second: float = 3.0):
    """Yield (variant, converted) tuples while the experiment is running."""
    while experiment.status == "running":
        variant = random.choice(["control", "treatment"])
        # True underlying conversion rates pulled from the experiment config so
        # the simulated data matches the hypotheses the SPRT is testing.
        cvr = experiment.p0 if variant == "control" else experiment.p1
        converted = random.random() < cvr
        experiment.record(variant, converted)
        yield variant, converted
        await asyncio.sleep(1 / max(0.1, events_per_second))


if __name__ == "__main__":
    # Standalone smoke test of the simulator + engine end to end.
    from store import Experiment

    async def _demo():
        exp = Experiment.create()
        count = 0
        async for variant, converted in stream_events(exp, events_per_second=200):
            count += 1
            if exp.status != "running":
                print(f"Decided '{exp.status}' after {count} events")
                print(f"  control   cvr={exp.control.cvr}%  n={exp.control.visitors}")
                print(f"  treatment cvr={exp.treatment.cvr}%  n={exp.treatment.visitors}")
                print(f"  treatment llr={exp.treatment.engine.llr:.3f}")
                break

    asyncio.run(_demo())
