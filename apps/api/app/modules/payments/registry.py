from app.core.config import get_settings
from app.modules.payments.interface import PaymentProvider
from app.modules.payments.providers.mock import MockProvider


def get_provider(name: str | None = None) -> PaymentProvider:
    """Resolve a provider by name (defaults to PAYMENT_PROVIDER). Register real providers here."""
    name = name or get_settings().payment_provider
    providers: dict[str, type[PaymentProvider]] = {"mock": MockProvider}
    try:
        return providers[name]()
    except KeyError:
        raise ValueError(f"Unknown payment provider: {name}") from None
