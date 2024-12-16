from fastapi import FastAPI, HTTPException, Depends, status, APIRouter, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing_extensions import Annotated
from database import models
from database.database import engine, SessionLocal
from sqlalchemy.orm import Session
# from database.crud import get_studentId
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()
# 創建所有與資料庫模型對應的表格
# models.Base.metadata.create_all(bind=engine) 會檢查定義的 SQLAlchemy 模型
# 如果表格不存在，會在資料庫中創建這些表
models.Base.metadata.create_all(bind=engine)


# 定義資料模型，這些是用於處理 API 請求和響應的數據結構
class PostBase(BaseModel):
    title: str
    content: str
    user_id: int

# class AcademyRecords(BaseModel):
#     name: str
#     studySystemNo: str
#     degreeKindNo: str
#     didGroup: str
#     grad: str
#     studentStatus: str

class UserBase(BaseModel):
    # id: int
    # identifier: str
    accountType: str
    chineseName: str
    englishName: str
    gender: str
    birthday: str
    # personalId: str
    studentId: str
    email: str
    # academyRecords: AcademyRecords
class CommentBase(BaseModel):
    score: int
    content: str
    course_id: str
    user_id: str



# 這是用於獲取資料庫連接的依賴函數
def get_db():
    db = SessionLocal()  # 建立一個資料庫連接
    try:
        yield db # 使用 yield 將資料庫連接傳遞出去
    finally:
        db.close() # 請求結束後關閉資料庫連接，釋放資源

# 定義資料庫依賴項，這是一種簡化型別註解的方式
db_dependency = Annotated[Session, Depends(get_db)]

#從資料庫抓資料出來
@router.post("/api/write_back_comment")
async def write_back_comment(comment: CommentBase, db: Session = Depends(get_db)):
    new_comment = models.Comment(
        score=comment.score,
        content=comment.content,
        course_id=comment.course_id,
        user_id=comment.user_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return {"message": "Comment added successfully", "comment_id": new_comment.id}