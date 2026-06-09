import uuid
from pathlib import Path


def _extension_for(filename: str | None, content_type: str | None) -> str:
    if filename and "." in filename:
        return Path(filename).suffix
    by_content_type = {
        "audio/webm": ".webm",
        "audio/ogg": ".ogg",
        "audio/mp4": ".m4a",
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
    }
    if content_type:
        return by_content_type.get(content_type.split(";")[0].strip(), "")
    return ""


def save_voice_recording(
    data: bytes,
    base_dir: str,
    filename: str | None = None,
    content_type: str | None = None,
) -> str:
    """Write voice-recording bytes under base_dir with a collision-resistant name.

    Returns the relative filename stored as a reference in the order document.
    """
    storage_dir = Path(base_dir)
    storage_dir.mkdir(parents=True, exist_ok=True)

    extension = _extension_for(filename, content_type)
    relative_name = f"{uuid.uuid4().hex}{extension}"
    (storage_dir / relative_name).write_bytes(data)
    return relative_name
