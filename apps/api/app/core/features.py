"""Feature flags. Read from settings at runtime; see ARCHITECTURE.md section 6."""

from collections.abc import Callable, Coroutine
from typing import Any, Literal

from pydantic import BaseModel

from app.core.config import get_settings
from app.core.errors import ApiError

FeatureName = Literal["accounts", "payments"]


class Features(BaseModel):
    accounts: bool
    payments: bool


def get_features() -> Features:
    s = get_settings()
    return Features(accounts=s.feature_accounts, payments=s.feature_payments)


def require_feature(name: FeatureName) -> Callable[[], Coroutine[Any, Any, None]]:
    """Dependency: respond 404 when the feature is switched off."""

    async def _dep() -> None:
        if not getattr(get_features(), name):
            raise ApiError(404, "feature_disabled", "Not found")

    return _dep
