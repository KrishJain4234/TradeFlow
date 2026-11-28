from collections import defaultdict, deque
from time import monotonic

from fastapi import HTTPException, Request

_hits: dict[tuple[str,str], deque[float]] = defaultdict(deque)


def enforce_rate_limit(request: Request, scope: str, maximum: int, window_seconds: int = 60) -> None:
    host = request.client.host if request.client else "unknown"
    key = (scope, host)
    now = monotonic()
    bucket = _hits[key]
    while bucket and now - bucket[0] >= window_seconds:
        bucket.popleft()
    if len(bucket) >= maximum:
        raise HTTPException(status_code=429, detail="Too many requests. Wait briefly and try again.")
    bucket.append(now)
