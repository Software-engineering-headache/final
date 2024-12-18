from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database.database import SessionLocal
from database.models import User, Log

router = APIRouter()

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

class SettingInput(BaseModel):
    char_count: int
    action: Optional[str] = None
    admin_id: Optional[str] = None  # 新增此欄位以接收前端傳來的 admin_id

@router.post("/settings/save")
async def save_system_settings(setting: SettingInput):
    """
    儲存系統設定到 logs 表格
    char_count 為必填，action 可選填（如果未填寫則為 None）
    admin_id 從前端帶入，目前假設已經確認使用者登入並取得 studentId
    """
    db = SessionLocal()
    try:
        # 檢查 char_count 是否為空或不是數字
        if setting.char_count is None:
            raise HTTPException(status_code=400, detail="字數上限欄位不可為空白！")

        new_log = Log(
            char_count=setting.char_count,
            action=setting.action if setting.action else None,
            admin_id=setting.admin_id if setting.admin_id else None
            # timestamp 由資料庫自動填入
        )

        db.add(new_log)
        db.commit()

        return {"message": "設定已儲存成功！"}
    except HTTPException as he:
        raise he
    except Exception as e:
        print("Error in save_system_settings:", e)
        raise HTTPException(status_code=500, detail=f"無法儲存設定：{e}")
    finally:
        db.close()

@router.get("/settings/logs")
async def get_all_logs():
    db = SessionLocal()
    try:
        logs = db.query(Log).order_by(Log.id.desc()).all()
        result = []
        for log in logs:
            result.append({
                "id": log.id,
                "char_count": log.char_count,
                "action": log.action,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "admin_id": log.admin_id
            })
        return result
    except Exception as e:
        print("Error in get_all_logs:", e)
        raise HTTPException(status_code=500, detail=f"無法取得設定紀錄：{e}")
    finally:
        db.close()
