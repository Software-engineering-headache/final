from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.database import SessionLocal
from database.models import Course, Professor, College, Comment, CourseProfessor

router = APIRouter()

@router.get("/courses/results")
async def get_courses_with_professors(department: str, instructor: str, keyword: str):
    """
    查詢 Course 表中的資訊，並顯示對應的 Professor 名稱
    """
    db = SessionLocal()
    try:
        comment_count_subquery = (
            db.query(
                Comment.course_id,
                func.count(Comment.id).label("comment_count")
            )
            .group_by(Comment.course_id)
            .subquery()
        )
        results = (
            db.query(
                Course.id.label("course_id"),
                Course.name.label("course_name"),
                Professor.name.label("professor_name"),
                College.department_name.label("department_name"),
                comment_count_subquery.c.comment_count.label("count")
            )
            .select_from(Course)
            .join(CourseProfessor, CourseProfessor.course_id == Course.id)
            .join(Professor, Professor.id == CourseProfessor.professor_id)
            .join(College, College.department_id == Course.department_id)
            .outerjoin(comment_count_subquery, comment_count_subquery.c.course_id == Course.id)
            .filter(
                College.department_name == department,
                Professor.name.contains(instructor),
                Course.name.contains(keyword)
            )
            .all()
        )
        courses_details = {}
        for result in results:
            course_id = result.course_id
            if course_id not in courses_details:
                courses_details[course_id] = {
                    "department_name": result.department_name,
                    "course_id": course_id,
                    "course_name": result.course_name,
                    "professors": [],
                    "count": result.count or 0
                }
            if result.professor_name:
                courses_details[course_id]["professors"].append(result.professor_name)
        courses_list = list(courses_details.values())
        return courses_list
    except Exception as e:
        print(f"Error occurred in get_courses_with_professors: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()
