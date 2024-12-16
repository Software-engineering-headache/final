from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from database.crud import get_db
from database.models import User

router = APIRouter()

@router.post("/interface/ncu_comment-interface/register")
async def register_user(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")

    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    # 從 session 中抓取 studentId
    student_data = request.session.get("user")
    if not student_data or "studentId" not in student_data:
        raise HTTPException(status_code=401, detail="Student ID not found in session")
    
    student_id = student_data["studentId"]

    # 更新或創建用戶
    user = db.query(User).filter(User.studentId == student_id).first()
    if user:
        user.nickname = username
    else:
        user = User(studentId=student_id, nickname=username)
        db.add(user)
    
    db.commit()

    response = JSONResponse({"message": "Registration successful"})
    return response