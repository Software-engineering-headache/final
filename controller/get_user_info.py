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
@router.get("/api/profile")
async def read_profile(request: Request, db: Session = Depends(get_db)):
        student_id = get_studentId(request)
        user = get_user(db, student_id)
        if user:
            profile = {
        "accountType": user.accountType,  # Keep as is if already uppercase
        "nickname":user.nickname,
        "chineseName": user.chineseName,
        "englishName": user.englishName,
        "gender": user.gender,
        "birthday": user.birthday,
        "email": user.email,
        "studentId": user.studentId
        }
            print("User accountType:", profile["accountType"])  # Log the accountType
            return profile
        else:
            return {"error": "User not found"}
        
def get_studentId(request: Request):
    # 嘗試從 session 中獲取 studentId
    student_data = request.session.get("user")
    if not student_data or "studentId" not in student_data:
        raise HTTPException(status_code=401, detail="Student ID not found in session")
    return student_data["studentId"]

def get_user(db: Session, user_id: str ):
    return db.query(models.User).filter(models.User.studentId == user_id).first()