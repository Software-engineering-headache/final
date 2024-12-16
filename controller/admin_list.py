from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database.models import User

# 創建路由器
router = APIRouter()

# 創建數據庫會話
db = SessionLocal()

@router.get("/users/admins")
async def get_admin_users():
    """
    查詢 users 表格中 accountType 為 ADMIN 的使用者資料
    """
    try:
        # 查詢 accountType 為 ADMIN 的使用者
        admin_users = db.query(User).filter(User.accountType == "ADMIN").all()

        # 整理結果
        admin_users_details = []
        for user in admin_users:
            admin_users_details.append({
                "studentId": user.studentId,
                "accountType": user.accountType,
                "chineseName": user.chineseName,
                "englishName": user.englishName,
                "gender": user.gender,
                "birthday": user.birthday,
                "email": user.email,
                "nickname": user.nickname,
            })

        return admin_users_details
    except Exception as e:
        print(f"Error occurred in get_admin_users: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()


@router.get("/users/check/{student_id}")
async def check_and_add_admin(student_id: str):
    """
    檢查學生學號，並根據情況更新 accountType 為 ADMIN
    """
    try:
        # 查詢該學號的使用者
        user = db.query(User).filter(User.studentId == student_id).first()

        if not user:
            return {"message": "NOT_FOUND"}

        if user.accountType == "ADMIN":
            return {"message": "ALREADY_ADMIN"}

        # 更新該使用者為管理員
        user.accountType = "ADMIN"
        db.commit()

        return {"message": "UPDATED"}
    except Exception as e:
        print(f"Error occurred in check_and_add_admin: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()

@router.patch("/users/remove-admin/{student_id}")
async def remove_admin_privileges(student_id: str):
    """
    將指定學號的使用者權限改為 STUDENT
    """
    try:
        # 查詢該學號的使用者
        user = db.query(User).filter(User.studentId == student_id).first()

        if not user:
            return {"message": "NOT_FOUND"}

        # 更新該使用者為 STUDENT
        user.accountType = "STUDENT"
        db.commit()

        return {"message": "REMOVED"}
    except Exception as e:
        print(f"Error occurred in remove_admin_privileges: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()
