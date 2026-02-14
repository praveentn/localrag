from abc import ABC, abstractmethod
from typing import AsyncIterator


class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[dict], **kwargs) -> str:
        ...

    @abstractmethod
    async def generate_stream(self, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        ...
