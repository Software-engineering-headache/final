from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing_extensions import Annotated
from fastapi import Request
from database import models

from database.database import SessionLocal
from database.models import User, College, Professor, Comment, Course, CourseProfessor

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.get("/courses/info")
async def get_info_in_course(course_name: str):
    """
    查詢指定 Course 的 Info
    """
    db = SessionLocal()
    try:
        results = (
            db.query(
                Course.id.label("course_id"),
                Course.name.label("course_name"),
                Course.course_info.label('course_info'),
                Course.course_year.label('course_year'),
                Professor.name.label("professor_name"),
                College.department_name.label("department_name")
            )
            .select_from(Course)
            .join(CourseProfessor, CourseProfessor.course_id == Course.id)
            .join(Professor, Professor.id == CourseProfessor.professor_id)
            .join(College, College.department_id == Course.department_id)
            .filter(
                Course.name.contains(course_name),
            )
            .all()
        )
        courses_details = {}
        for result in results:
            course_name = result.course_name
            if course_name not in courses_details:
                courses_details[course_name] = {
                    "course_id": result.course_id,
                    "professor_name": [],
                    "department_name": result.department_name,
                    "course_info": result.course_info,
                    "course_year": result.course_year
                }
            if result.professor_name:
                courses_details[course_name]["professor_name"].append(result.professor_name)
        courses_list = list(courses_details.values())
        return courses_list
    except Exception as e:
        print(f"Error occurred in get_courses_with_professors: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()

@router.get("/courses/comments")
async def get_comment_in_course(course_name: str):
    """
    查詢指定課程的所有評論，每條評論獨立返回
    """
    db = SessionLocal()
    try:
        results = (
            db.query(
                Comment.id.label("comment_id"),
                Comment.score.label("course_score"),
                Comment.content.label("course_content"),
                Comment.time.label('time'),
                User.chineseName.label("chinesename"),
                User.nickname.label("nickname"),
                Professor.name.label("professor_name")
            )
            .select_from(Comment)
            .join(Course, Course.id == Comment.course_id)
            .join(User, User.studentId == Comment.user_id)
            .join(CourseProfessor, CourseProfessor.course_id == Course.id)
            .join(Professor, Professor.id == CourseProfessor.professor_id)
            .filter(
                Course.name.contains(course_name),
            )
            .all()
        )
        comment_details = {}
        for result in results:
            comment_id = result.comment_id
            if comment_id not in comment_details:
                formatted_time = result.time.strftime("%Y-%m-%d %H:%M:%S") if result.time else None
                comment_details[comment_id] = {
                    "chinesename": result.chinesename,
                    "nickname": result.nickname,
                    "professor_name": [],
                    "course_score": result.course_score or 0,
                    "course_content": result.course_content,
                    "time": formatted_time
                }
            if result.professor_name and result.professor_name not in comment_details[comment_id]["professor_name"]:
                comment_details[comment_id]["professor_name"].append(result.professor_name)
        courses_list = list(comment_details.values())
        return courses_list
    except Exception as e:
        print(f"Error occurred in get_courses_with_professors: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()

@router.get("/admin_comments/all")
async def get_all_comments(db: Session = Depends(get_db)):
    """
    獲取所有評論
    """
    try:
        comments = db.query(
            Comment,
            Course.name.label("course_name"),
            User.chineseName.label("user_name"),
            User.nickname.label("user_nickname"),
            User.email.label("user_email")
        ).join(
            Course, Comment.course_id == Course.id, isouter=True
        ).join(
            User, Comment.user_id == User.studentId, isouter=True
        ).order_by(Comment.id.desc()).all()
        result = []
        for comment, course_name, user_name, user_nickname, user_email in comments:
            result.append({
                "id": comment.id,
                "score": comment.score,
                "course_id": comment.course_id,
                "course_name": course_name,
                "comment_content": comment.content,
                "user_id": comment.user_id,
                "user_name": user_name,
                "user_nickname": user_nickname,
                "time": comment.time.isoformat() if comment.time else None,
                "email": user_email
            })
        return result
    except Exception as e:
        print(f"Error occurred in get_all_comments: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")

@router.get("/admin_comments/user/{student_id}")
async def get_user_comments(student_id: str, db: Session = Depends(get_db)):
    """
    獲取特定使用者的所有評論
    """
    try:
        comments = db.query(
            Comment.id.label("comment_id"),
            Comment.score,
            Comment.content.label("comment_content"),
            Comment.course_id,
            Course.name.label("course_name"),
            Comment.time
        ).join(
            Course, Comment.course_id == Course.id, isouter=True
        ).filter(Comment.user_id == student_id).order_by(Comment.id.desc()).all()
        result = []
        for comment in comments:
            result.append({
                "comment_id": comment.comment_id,
                "score": comment.score,
                "comment_content": comment.comment_content,
                "course_id": comment.course_id,
                "course_name": comment.course_name,
                "time": comment.time.isoformat() if comment.time else None
            })
        return result
    except Exception as e:
        print(f"Error occurred in get_user_comments: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")

@router.delete("/admin_comments/{comment_id}")
async def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    """
    刪除指定ID的評論
    """
    try:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail=f"Comment with id {comment_id} not found.")
        db.delete(comment)
        db.commit()
        return {"message": f"Comment with id {comment_id} has been deleted successfully."}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error occurred in delete_comment: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")


class CommentBase(BaseModel):
    id: int


def get_studentId(request: Request):
    student_data = request.session.get("user")
    if not student_data or "studentId" not in student_data:
        raise HTTPException(status_code=401, detail="Student ID not found in session")
    return student_data["studentId"]

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
