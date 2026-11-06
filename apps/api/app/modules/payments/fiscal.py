"""Fiscalization hook placeholder (online cash register / OFD). Real implementation comes later."""

import structlog

log = structlog.get_logger()


class FiscalReceiptHook:
    def on_payment_succeeded(self, order_number: str, amount_minor: int) -> None:
        log.info("fiscal_receipt_skipped", order=order_number, amount_minor=amount_minor)
