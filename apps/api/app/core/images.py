"""Image pipeline: re-encode an upload into fixed-width WebP (and AVIF when supported) variants."""

import io

from PIL import Image

WIDTHS = (320, 640, 960, 1440)


def build_variants(data: bytes) -> tuple[dict[str, bytes], tuple[int, int]]:
    """Return ({"320.webp": bytes, ...}, (orig_width, orig_height)). Re-encoding strips EXIF."""
    opened = Image.open(io.BytesIO(data))
    opened.load()
    img = opened.convert("RGB")
    orig = img.size
    out: dict[str, bytes] = {}
    for width in WIDTHS:
        if width > orig[0] and width != WIDTHS[0]:
            continue
        height = round(orig[1] * width / orig[0])
        resized = img.resize((width, height), Image.Resampling.LANCZOS)
        for fmt, ext, kwargs in (
            ("WEBP", "webp", {"quality": 82}),
            ("AVIF", "avif", {"quality": 60}),
        ):
            buf = io.BytesIO()
            try:
                resized.save(buf, format=fmt, **kwargs)
            except (KeyError, ValueError, OSError):
                continue  # format not supported by this Pillow build: skip (WebP is the baseline)
            out[f"{width}.{ext}"] = buf.getvalue()
    return out, orig
