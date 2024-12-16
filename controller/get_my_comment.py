from fastapi import FastAPI, HTTPException, Depends, status, APIRouter, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing_extensions import Annotated
from database import models
from database.database import engine, SessionLocal
from sqlalchemy.orm import Session
from controller.get_user_info import get_studentId
from database.models import Comment

router = APIRouter()

# 創建所有與資料庫模型對應的表格
# models.Base.metadata.create_all(bind=engine) 會檢查定義的 SQLAlchemy 模型
# 如果表格不存在，會在資料庫中創建這些表
models.Base.metadata.create_all(bind=engine)

class CommentBase(BaseModel):
    id: int

# 這是用於獲取資料庫連接的依賴函數
def get_db():
    db = SessionLocal()  # 建立一個資料庫連接
    try:
        yield db # 使用 yield 將資料庫連接傳遞出去
    finally:
        db.close() # 請求結束後關閉資料庫連接，釋放資源

# 定義資料庫依賴項，這是一種簡化型別註解的方式
db_dependency = Annotated[Session, Depends(get_db)]

@router.get("/my_comments")
async def get_comments(request: Request, db: Session = Depends(get_db)):
    student_id = get_studentId(request)
    print(f"Retrieved student_id: {student_id}")  # 添加日志

    if not student_id:
        return {"error": "User not authenticated"}

    comments = db.query(models.Comment).filter(models.Comment.user_id == student_id).all()
    print(f"Retrieved comments: {comments}")  # 添加日志

    result = []
    for comment in comments:
        course = db.query(models.Course).filter(models.Course.id == comment.course_id).first()
        result.append({
            "content": comment.content,
            "course_id": comment.course_id,
            "course_name": course.name if course else None,
            "comment_id": comment.id
        })

    return result

@router.post("/comments/remove")
async def remove_comment(comment: CommentBase, request: Request, db: Session = Depends(get_db)):
    student_id = get_studentId(request)
    if not student_id:
        return {"error": "User not authenticated"}

    # Get the comment record by comment id
    comment_record = db.query(Comment).filter(Comment.id == comment.id).first()
    if not comment_record:
        raise HTTPException(status_code=404, detail="Comment record not found")

    # Check if the comment belongs to the student
    if comment_record.user_id != student_id:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this comment")

    # Delete the entire row
    db.delete(comment_record)
    db.commit()

    return {"message": "Comment removed successfully"}

