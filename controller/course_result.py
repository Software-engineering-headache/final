from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal
from sqlalchemy import func
from database.models import Course, Professor, College, Comment, CourseProfessor

router = APIRouter()

@router.get("/courses/results")
async def get_courses_with_professors(department: str, instructor: str, keyword: str): #
    """
    查詢 Course 表中的資訊，並顯示對應的 Professor 名稱
    """
    db = SessionLocal()
    try:
        # 計算每門課的評論數量，使用子查詢避免重複計算
        comment_count_subquery = (
            db.query(
                Comment.course_id,
                func.count(Comment.id).label("comment_count")
            )
            .group_by(Comment.course_id)
            .subquery()
        )
        # 執行查詢：關聯 Course 和 Professor
        results = (
            db.query(
                Course.id.label("course_id"),
                Course.name.label("course_name"),
                Professor.name.label("professor_name"),
                College.department_name.label("department_name"),
                comment_count_subquery.c.comment_count.label("count") # 從子查詢獲取評論數
            )
            .select_from(Course)
            .join(CourseProfessor, CourseProfessor.course_id == Course.id)  # 相聯 Course 和 CourseProfessor
            .join(Professor, Professor.id == CourseProfessor.professor_id)  # 相聯 Professor 和 CourseProfessor
            .join(College, College.department_id == Course.department_id)  # 相聯 College 和 Course
            .outerjoin(comment_count_subquery, comment_count_subquery.c.course_id == Course.id)  # 加入評論數
            #.join(CourseProfessor, CourseProfessor.course_id == Course.id)  # 相聯 Course 和 CourseProfessor
            #.join(Professor, Professor.id == CourseProfessor.professor_id)  # 相聯 Professor 和 CourseProfessor
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
            course_name = result.course_name
            department_name = result.department_name
            comment_count = result.count or 0  # 如果沒有評論，默認為 0

            if course_id not in courses_details:
                courses_details[course_id] = {
                    "department_name": department_name,
                    "course_id": course_id,
                    "course_name": course_name,
                    "professors": [],
                    "count": comment_count
                }
            if result.professor_name:
                courses_details[course_id]["professors"].append(result.professor_name)
        
        # 將字典轉換為列表以返回
        courses_list = list(courses_details.values())
        return courses_list

    except Exception as e:
        print(f"Error occurred in get_courses_with_professors: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()
