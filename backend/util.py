from typing import Generic, TypeVar
from pydantic import BaseModel

class OptionalModel(BaseModel):
    @classmethod
    def __pydantic_init_subclass__(cls, **kwargs) -> None:
        super().__pydantic_init_subclass__(**kwargs)

        for field in cls.model_fields.values():
            field.default = None

        cls.model_rebuild(force=True)

_T = TypeVar("_T")

class PagedResponse(BaseModel, Generic[_T]):
    items: list[_T]
    offset: int
    limit: int
    total_count: int
