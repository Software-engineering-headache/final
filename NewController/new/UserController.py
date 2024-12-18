from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import RedirectResponse, JSONResponse
from requests_oauthlib import OAuth2Session
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing_extensions import Annotated

from database.crud import create_user, get_db
from database import models
from database.database import SessionLocal, engine
from database.models import User

router = APIRouter()
models.Base.metadata.create_all(bind=engine)

CLIENT_ID = "202412061221336VwNe1cJtnCB"
CLIENT_SECRET = "kJVvHyM2Am3SYrdeBCBUSomnSbkBLb09jQEHr1odgBc8W8nv"
AUTHORIZATION_BASE_URL = "https://portal.ncu.edu.tw/oauth2/authorization"
TOKEN_URL = "https://portal.ncu.edu.tw/oauth2/token"
REDIRECT_URI = "http://localhost:8000/interface/ncu_comment-interface/callback"
token_storage = {}

class UserBase(BaseModel):
    id: Optional[int] = None
    accountType: str
    chineseName: str
    englishName: str
    gender: str
    birthday: str
    studentId: str
    email: str

def get_oauth_session(state: Optional[str] = None):
    return OAuth2Session(
        CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        scope=[
            "identifier",
            "chinese-name",
            "english-name",
            "gender",
            "birthday",
            "personal-id",
            "student-id",
            "academy-records",
            "faculty-records",
            "email",
            "mobile-phone",
            "alternated-id"
        ],
        state=state,
    )

@router.get("/interface/ncu_comment-interface/login")
async def login(request: Request):
    oauth = get_oauth_session()
    authorization_url, state = oauth.authorization_url(AUTHORIZATION_BASE_URL)
    request.session["oauth_state"] = state
    response = RedirectResponse(url=authorization_url)
    return response

@router.get("/interface/ncu_comment-interface/callback")
async def callback(request: Request):
    state = request.query_params.get("state")
    code = request.query_params.get("code")
    if not code:
        return {"error": "Authorization failed or user denied access."}
    oauth = get_oauth_session(state=state)
    try:
        token = oauth.fetch_token(
            TOKEN_URL,
            client_secret=CLIENT_SECRET,
            code=code,
        )
        token_storage["token"] = token["access_token"]
        return RedirectResponse(url="http://localhost:8000/interface/ncu_comment-interface/profile")
    except Exception as e:
        return {"error": str(e)}

@router.get("/interface/ncu_comment-interface/profile")
async def profile(request: Request):
    token = token_storage.get("token")
    oauth = OAuth2Session(CLIENT_ID, token={"access_token": token, "token_type": "Bearer"})
    response = oauth.get("https://portal.ncu.edu.tw/apis/oauth/v1/info")
    user_info = response.json()
    request.session["user"] = {
        "studentId": user_info["studentId"],
        "accountType": user_info["accountType"]
    }
    user = UserBase(
        accountType=user_info["accountType"],
        chineseName=user_info["chineseName"],
        englishName=user_info["englishName"],
        gender=user_info["gender"],
        birthday=user_info["birthday"],
        studentId=user_info["studentId"],
        email=user_info["email"],
    )
    db = SessionLocal()
    existing_user = await get_student_Id(db, user.studentId)
    if not existing_user:
        await create_user(user, db)
        redirect_response = RedirectResponse(url="http://localhost:5500/interface/ncu_comment-interface/register.html")
        return redirect_response
    else:
        redirect_response = RedirectResponse(url="http://localhost:5500/interface/ncu_comment-interface/index.html")
        redirect_response.set_cookie(
            key="studentId",
            value=user.studentId,
            httponly=True,
            max_age=3600,
            path="/",
            samesite="strict"
        )
        return redirect_response

@router.get("/interface/ncu_comment-interface/Islogin")
async def Islogin(request: Request):
    user = request.session.get("user")
    if not user or "studentId" not in user:
        return {
            "studentId": None,
            "accountType": None
        }
    return {
        "studentId": user["studentId"],
        "accountType": user["accountType"]
    }

@router.get("/interface/ncu_comment-interface/logout")
async def logout(request: Request):
    request.session.clear()
    response = JSONResponse({"message": "Logout successful"})
    response.delete_cookie("studentId")
    return response

async def get_student_Id(db, student_id):
    return db.query(models.User).filter(models.User.studentId == student_id).first()

class PostBase(BaseModel):
    title: str
    content: str
    user_id: int

class CommentBase(BaseModel):
    score: int
    content: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.get("/api/profile")
async def read_profile(request: Request, db: Session = Depends(get_db)):
    student_id = get_studentId(request)
    user = get_user(db, student_id)
    if user:
        profile = {
            "accountType": user.accountType,
            "nickname": user.nickname,
            "chineseName": user.chineseName,
            "englishName": user.englishName,
            "gender": user.gender,
            "birthday": user.birthday,
            "email": user.email,
            "studentId": user.studentId
        }
        print("User accountType:", profile["accountType"])
        return profile
    else:
        return {"error": "User not found"}

def get_studentId(request: Request):
    student_data = request.session.get("user")
    if not student_data or "studentId" not in student_data:
        raise HTTPException(status_code=401, detail="Student ID not found in session")
    return student_data["studentId"]

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.studentId == user_id).first()

@router.post("/interface/ncu_comment-interface/register")
async def register_user(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")

    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    student_data = request.session.get("user")
    if not student_data or "studentId" not in student_data:
        raise HTTPException(status_code=401, detail="Student ID not found in session")
    
    student_id = student_data["studentId"]

    user = db.query(User).filter(User.studentId == student_id).first()
    if user:
        user.nickname = username
    else:
        user = User(studentId=student_id, nickname=username)
        db.add(user)
    
    db.commit()

    response = JSONResponse({"message": "Registration successful"})
    return response

class UserinfoBase(BaseModel):
    studentId: str
    nickname: str
    email: str

@router.post("/api/write_back_user_info")
async def write_back_user_info(user_info: UserinfoBase, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.studentId == user_info.studentId).first()
    if user:
        user.nickname = user_info.nickname
        user.email = user_info.email
        db.commit()
        db.refresh(user)
        return {"message": "User information updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/users")
async def get_all_users(db :Session = Depends(get_db)):
    try:
        all_users = db.query(User).all()
        all_users_details = []
        for user in all_users:
            all_users_details.append({
                "studentId": user.studentId,
                "accountType": user.accountType,
                "chineseName": user.chineseName,
                "englishName": user.englishName,
                "gender": user.gender,
                "birthday": user.birthday,
                "email": user.email,
                "nickname": user.nickname,
            })
        return all_users_details
    except Exception as e:
        print(f"Error occurred in get_all_users: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()

@router.delete("/users/{studentId}")
async def delete_user(studentId: str, db :Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.studentId == studentId).first()
        if not user:
            raise HTTPException(status_code=404, detail="使用者未找到")
        db.delete(user)
        db.commit()
        return {"message": f"使用者 {studentId} 已成功刪除"}
    except Exception as e:
        print(f"Error occurred in delete_user: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()