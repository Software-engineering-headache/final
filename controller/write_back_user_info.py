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

class UserBase(BaseModel):
    studentId: str
    nickname: str
    email: str


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
@router.post("/api/write_back_user_info")
async def write_back_user_info(user_info: UserBase, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.studentId == user_info.studentId).first()
    if user:
        user.nickname = user_info.nickname
        user.email = user_info.email
        db.commit()
        db.refresh(user)
        return {"message": "User information updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")