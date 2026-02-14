import logging
from typing import AsyncIterator

from openai import AsyncAzureOpenAI

from app.config import settings
from app.services.llm.base import LLMProvider

logger = logging.getLogger(__name__)


class AzureOpenAIProvider(LLMProvider):
    def __init__(self):
        self.client = AsyncAzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
        )
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT

    async def generate(self, messages: list[dict], **kwargs) -> str:
        response = await self.client.chat.completions.create(
            model=self.deployment,
            messages=messages,
            stream=False,
        )
        return response.choices[0].message.content or ""

    async def generate_stream(self, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        response = await self.client.chat.completions.create(
            model=self.deployment,
            messages=messages,
            stream=True,
        )
        async for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def health_check(self) -> bool:
        try:
            response = await self.client.chat.completions.create(
                model=self.deployment,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1,
            )
            return True
        except Exception:
            return False
