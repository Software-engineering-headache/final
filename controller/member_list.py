from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database.models import User

# 創建路由器
router = APIRouter()

# 創建數據庫會話
db = SessionLocal()

@router.get("/users")
async def get_all_users():
    """
    查詢 users 表格中所有使用者的資料
    """
    try:
        # 查詢所有使用者
        all_users = db.query(User).all()

        # 整理結果
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
async def delete_user(studentId: str):
    """
    根據學號刪除使用者
    """
    try:
        # 查詢目標使用者
        user = db.query(User).filter(User.studentId == studentId).first()

        # 如果找不到該使用者
        if not user:
            raise HTTPException(status_code=404, detail="使用者未找到")

        # 刪除使用者
        db.delete(user)
        db.commit()

        return {"message": f"使用者 {studentId} 已成功刪除"}
    except Exception as e:
        print(f"Error occurred in delete_user: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        # 確保關閉數據庫會話
        db.close()