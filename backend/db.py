import os

from sqlmodel import SQLModel, Session
import sqlmodel

from datetime import datetime

from backend.util import OptionalModel

from dotenv import load_dotenv
load_dotenv()

engine = sqlmodel.create_engine(os.environ.get("DATABASE_URL"))

class Article(SQLModel, table=True):
    __tablename__ = "posts"

    id: int | None = sqlmodel.Field(default=None, primary_key=True)
    title: str
    content: str
    category: str
    created_date: datetime
    updated_date: datetime
    status: str

class ArticlePartial(Article, OptionalModel):
    pass

def get_session():
    with Session(engine) as session:
        yield session
