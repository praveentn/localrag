def chunk_text(text: str, chunk_size: int = 512, chunk_overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks using a recursive strategy.

    Splits by paragraph first, then sentence, then word boundaries.
    chunk_size and chunk_overlap are in approximate word counts.
    """
    if not text.strip():
        return []

    separators = ["\n\n", "\n", ". ", " "]
    return _recursive_split(text, separators, chunk_size, chunk_overlap)


def _recursive_split(text: str, separators: list[str], chunk_size: int, chunk_overlap: int) -> list[str]:
    chunks: list[str] = []
    separator = separators[0]
    remaining_separators = separators[1:]

    parts = text.split(separator)

    current_chunk: list[str] = []
    current_size = 0

    for part in parts:
        part_size = len(part.split())
        if not part.strip():
            continue

        if current_size + part_size > chunk_size and current_chunk:
            chunk_text_str = separator.join(current_chunk).strip()
            if chunk_text_str:
                if remaining_separators and len(chunk_text_str.split()) > chunk_size * 1.5:
                    sub_chunks = _recursive_split(chunk_text_str, remaining_separators, chunk_size, chunk_overlap)
                    chunks.extend(sub_chunks)
                else:
                    chunks.append(chunk_text_str)

            # Keep overlap
            overlap_parts: list[str] = []
            overlap_size = 0
            for p in reversed(current_chunk):
                p_size = len(p.split())
                if overlap_size + p_size > chunk_overlap:
                    break
                overlap_parts.insert(0, p)
                overlap_size += p_size

            current_chunk = overlap_parts + [part]
            current_size = overlap_size + part_size
        else:
            current_chunk.append(part)
            current_size += part_size

    if current_chunk:
        chunk_text_str = separator.join(current_chunk).strip()
        if chunk_text_str:
            if remaining_separators and len(chunk_text_str.split()) > chunk_size * 1.5:
                sub_chunks = _recursive_split(chunk_text_str, remaining_separators, chunk_size, chunk_overlap)
                chunks.extend(sub_chunks)
            else:
                chunks.append(chunk_text_str)

    return chunks
