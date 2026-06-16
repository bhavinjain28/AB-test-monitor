"""Simulate real product traffic against the LIVE event API.

This stands in for your actual product: for each fake user it asks the monitor
which variant to show (GET /assign) and then reports whether that user converted
(POST /event) -- the exact two calls a real app would make.

It also flips the experiment into "live" mode first, so you can just run it and
watch the dashboard react.

Usage (from cmd, PowerShell, or bash):

    python simulate_live.py
    python simulate_live.py --n 800 --control-rate 0.10 --treatment-rate 0.16
    python simulate_live.py --delay 0            # blast everything instantly
    python simulate_live.py --url http://localhost:8000

Only the Python standard library is used -- no pip install required.
"""

from __future__ import annotations

import argparse
import http.client
import json
import os
import random
import time
import urllib.parse


class Client:
    """A tiny keep-alive HTTP client.

    Reuses one connection for every request. This matters on Windows: opening a
    fresh socket per call quickly exhausts ephemeral ports (TIME_WAIT), which
    makes rapid sequential requests stall. Keep-alive avoids that entirely.
    """

    def __init__(self, base_url: str, api_key: str | None = None):
        parts = urllib.parse.urlparse(base_url)
        self.host = parts.hostname
        self.port = parts.port or 80
        self.api_key = api_key
        self.conn = http.client.HTTPConnection(self.host, self.port, timeout=10)

    def _request(self, method: str, path: str, payload: dict | None = None) -> dict:
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {"Content-Type": "application/json"} if payload is not None else {}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        # Retry once on a dropped keep-alive connection.
        for attempt in range(2):
            try:
                self.conn.request(method, path, body=body, headers=headers)
                resp = self.conn.getresponse()
                data = resp.read().decode("utf-8")
                if resp.status >= 400:
                    raise RuntimeError(f"HTTP {resp.status} on {method} {path}: {data}")
                return json.loads(data)
            except (http.client.CannotSendRequest, http.client.RemoteDisconnected,
                    ConnectionError):
                if attempt == 1:
                    raise
                self.conn = http.client.HTTPConnection(self.host, self.port, timeout=10)

    def get(self, path: str) -> dict:
        return self._request("GET", path)

    def post(self, path: str, payload: dict) -> dict:
        return self._request("POST", path, payload)


def main() -> None:
    parser = argparse.ArgumentParser(description="Send simulated live events to the A/B monitor.")
    parser.add_argument("--url", default="http://localhost:8000", help="Backend base URL")
    parser.add_argument("--n", type=int, default=400, help="Number of users to simulate")
    parser.add_argument("--control-rate", type=float, default=0.10,
                        help="True conversion rate for the control variant")
    parser.add_argument("--treatment-rate", type=float, default=0.16,
                        help="True conversion rate for the treatment variant")
    parser.add_argument("--delay", type=float, default=0.05,
                        help="Seconds to wait between users (0 = as fast as possible)")
    parser.add_argument("--api-key", default=os.environ.get("INGEST_API_KEY", ""),
                        help="X-API-Key for /event (defaults to INGEST_API_KEY env var)")
    args = parser.parse_args()

    client = Client(args.url, api_key=args.api_key or None)

    # 1. Make sure the experiment is in live mode so events are accepted.
    print("Switching experiment to LIVE mode...")
    client.post("/mode", {"mode": "live"})

    print(f"Sending {args.n} users "
          f"(control={args.control_rate:.0%}, treatment={args.treatment_rate:.0%})...\n")

    for i in range(1, args.n + 1):
        user_id = f"user_{i}_{random.randint(0, 1_000_000)}"

        # 2. Ask the monitor which variant this user should see (sticky).
        variant = client.get(f"/assign?user_id={user_id}")["variant"]

        # 3. Decide the outcome using that variant's true conversion rate.
        rate = args.treatment_rate if variant == "treatment" else args.control_rate
        converted = random.random() < rate

        # 4. Report the outcome -- this is the live data point arriving.
        result = client.post("/event", {"user_id": user_id, "converted": converted})

        if result.get("status") in ("winner", "no_effect"):
            print(f"\nDecision reached: {result['status'].upper()} after {i} users.")
            break

        if i % 25 == 0:
            print(f"  sent {i}/{args.n} users...")

        if args.delay:
            time.sleep(args.delay)

    print("\nDone. Check the dashboard for the result.")


if __name__ == "__main__":
    main()
