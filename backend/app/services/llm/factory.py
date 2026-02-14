from app.services.llm.base import LLMProvider
from app.services.llm.ollama import OllamaProvider
from app.services.llm.azure_openai import AzureOpenAIProvider


def get_llm_provider(provider_name: str) -> LLMProvider:
    if provider_name == "ollama":
        return OllamaProvider()
    elif provider_name == "azure_openai":
        return AzureOpenAIProvider()
    else:
        raise ValueError(f"Unknown LLM provider: {provider_name}")
