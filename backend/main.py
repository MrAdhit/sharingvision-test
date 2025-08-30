from enum import Enum
from typing import Annotated

from fastapi import Body, Depends, FastAPI, HTTPException, Path, Response
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field

from sqlmodel import Session, col, func, select

from backend.util import OptionalModel, PagedResponse
from backend import db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "*" ],
    allow_methods=[ "*" ],
    allow_headers=[ "*" ],
)

class ArticleStatus(str, Enum):
    Publish = "publish"
    Draft = "draft"
    Trash = "trash"

class Article(BaseModel):
    title: str = Field(..., min_length=20, max_length=200)
    content: str = Field(..., min_length=200)
    category: str = Field(..., min_length=3)
    status: ArticleStatus = Field(...)
    
class ArticlePartial(Article, OptionalModel):
    pass

@app.post("/article")
async def create_article(
    article: Annotated[Article, Body],
    session: Session = Depends(db.get_session),
):
    session.add(
        db.Article(
            title=article.title,
            content=article.content,
            category=article.category,
            status=article.status,
        )
    )
    session.commit()

    return { }

@app.get("/article/{limit}/{offset}")
async def list_article(
    limit: Annotated[int, Path(gt=0)],
    offset: Annotated[int, Path(ge=0)],
    published_only: bool = False,
    session: Session = Depends(db.get_session),
) -> PagedResponse[db.Article]:
    base_query = select(db.Article).where(db.Article.status != ArticleStatus.Trash)
    
    if published_only:
        base_query = base_query.where(db.Article.status == ArticleStatus.Publish)
    
    count_query = select(func.count(col(db.Article.id))).where(db.Article.status != ArticleStatus.Trash)
    if published_only:
        count_query = count_query.where(db.Article.status == ArticleStatus.Publish)
    
    articles_count = session.exec(count_query).one()

    articles = session.exec(
        base_query
            .order_by(db.Article.updated_date.desc())
            .limit(limit)
            .offset(offset)
    ).all()
    
    return PagedResponse(
        items=articles,
        limit=limit,
        offset=offset,
        total_count=articles_count,
    )

@app.get("/article/{id}")
async def get_article(
    id: int,
    session: Session = Depends(db.get_session),
) -> db.Article:
    db_article = session.exec(
        select(db.Article)
            .where(db.Article.id == id)
            .where(db.Article.status != ArticleStatus.Trash)
    ).one_or_none()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")

    return db_article

@app.patch("/article/{id}")
async def patch_article(
    id: int,
    article: Annotated[ArticlePartial, Body],
    session: Session = Depends(db.get_session),
):
    db_article = session.exec(
        select(db.Article)
            .where(db.Article.id == id)
            .where(db.Article.status != ArticleStatus.Trash)
    ).one_or_none()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")

    update_data = db.ArticlePartial(
        title=article.title,
        content=article.content,
        category=article.category,
        status=article.status,
    ).model_dump(exclude_none=True)
    db_article.sqlmodel_update(update_data)

    session.add(db_article)
    session.commit()
    
    return { }

@app.delete("/article/{id}", status_code=204, response_class=Response)
async def delete_article(
    id: int,
    session: Session = Depends(db.get_session),
):
    db_article = session.exec(
        select(db.Article)
            .where(db.Article.id == id)
            .where(db.Article.status != ArticleStatus.Trash)
    ).one_or_none()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")

    db_article.status = ArticleStatus.Trash

    session.add(db_article)
    session.commit()
