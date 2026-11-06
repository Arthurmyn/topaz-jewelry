"""Payment state machine. Webhooks can repeat or arrive out of order: illegal moves are ignored."""

from app.modules.payments.interface import PaymentStatus as S

ALLOWED: dict[S, set[S]] = {
    S.CREATED: {S.PENDING, S.SUCCEEDED, S.FAILED, S.CANCELLED},
    S.PENDING: {S.SUCCEEDED, S.FAILED, S.CANCELLED},
    S.SUCCEEDED: {S.REFUNDED, S.PARTIALLY_REFUNDED},
    S.PARTIALLY_REFUNDED: {S.REFUNDED, S.PARTIALLY_REFUNDED},
    S.FAILED: set(),
    S.CANCELLED: set(),
    S.REFUNDED: set(),
}


def can_transition(current: S, target: S) -> bool:
    return target in ALLOWED[current]
