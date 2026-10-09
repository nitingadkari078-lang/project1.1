"""String utilities."""

from typing import Optional

def mask_string(value: str, show_chars: int = 4) -> str:
    """Mask middle part of string for display."""
    if len(value) <= show_chars:
        return value
    
    return f"{value[:2]}{'*' * (len(value) - 2 * show_chars)}{value[-show_chars:]}"
