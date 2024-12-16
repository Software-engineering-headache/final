from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database.models import Favorite, User, Course

router = APIRouter()

class FavoriteCreate(BaseModel):
    user_id: str
    course_id: str

@router.get("/favorites/details")
async def get_favorites_with_details():
    db = SessionLocal()
    try:
        results = (
            db.query(Favorite, User, Course)
            .join(User, Favorite.user_id == User.studentId)
            .join(Course, Favorite.course_id == Course.id)
            .all()
        )

        favorites_details = []
        for favorite, user, course in results:
            favorites_details.append({
                "favorite_id": favorite.id,
                "user_id": user.studentId,
                "user_name": user.chineseName,
                "course_id": course.id,
                "course_name": course.name,
                "course_info": course.course_info,
            })

        return favorites_details
    except Exception as e:
        print(f"Error occurred in get_favorites_with_details: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()

@router.post("/favorites/add")
async def add_favorite(fav: FavoriteCreate):
    db = SessionLocal()
    try:
        new_fav = Favorite(user_id=fav.user_id, course_id=fav.course_id)
        db.add(new_fav)
        db.commit()
        db.refresh(new_fav)
        return {"message": "Course added to favorites successfully", "favorite_id": new_fav.id}
    except Exception as e:
        db.rollback()
        print(f"Error occurred in add_favorite: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# 新增刪除收藏 API
@router.post("/favorites/remove")
async def remove_favorite(fav: FavoriteCreate):
    db = SessionLocal()
    try:
        # 根據 user_id 與 course_id 尋找要刪除的收藏紀錄
        favorite_record = db.query(Favorite).filter(Favorite.user_id == fav.user_id, Favorite.course_id == fav.course_id).first()
        if not favorite_record:
            raise HTTPException(status_code=404, detail="Favorite record not found")

        db.delete(favorite_record)
        db.commit()

        return {"message": "Course removed from favorites successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error occurred in remove_favorite: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
