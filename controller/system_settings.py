from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database.models import User, Log
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

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
