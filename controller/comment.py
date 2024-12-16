from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal
from sqlalchemy import func
from database.models import User, College, Professor, Comment, Course, CourseProfessor, Log

router = APIRouter()

@router.get("/courses/info")
async def get_info_in_course(course_name: str):
    """
    查詢指定 Course 的 Info
    """
    db = SessionLocal()
    try:
        # 執行查詢：關聯 Course 和 Professor
        results = (
            db.query(
                Course.id.label("course_id"),
                Course.name.label("course_name"),
                Course.course_info.label('course_info'),
                Course.course_year.label('course_year'),
                Professor.name.label("professor_name"),
                College.department_name.label("department_name")
            )
            .select_from(Course)  # 選擇 Course 表
            #.join(Professor, Professor.id == Course.professor_id)  # 關聯 Professor 和 Course
            .join(CourseProfessor, CourseProfessor.course_id == Course.id)  # 相聯 Course 和 CourseProfessor
            .join(Professor, Professor.id == CourseProfessor.professor_id)  # 相聯 Professor 和 CourseProfessor
            .join(College, College.department_id == Course.department_id)  # 相聯 College 和 Course
            .filter(
                Course.name.contains(course_name),
            )
            .all()
        )

        # 整理查詢結果為結構化的列表
        courses_details = {}
        for result in results:
            course_id = result.course_id
            course_name = result.course_name
            department_name = result.department_name
            course_info = result.course_info
            course_year = result.course_year
            comment_count = result.count or 0  # 如果沒有評論，默認為 0

            if course_name not in courses_details:
                courses_details[course_name] = {
                    "course_id" : course_id,
                    "professor_name": [],
                    "department_name": department_name,
                    "course_info": course_info,
                    "course_year": course_year
                }
            if result.professor_name:
                courses_details[course_name]["professor_name"].append(result.professor_name)
        
        # 將字典轉換為列表以返回
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
        # 執行查詢：關聯 Course 和 Professor
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
            .select_from(Comment)  # 選擇 Course 表
            .join(Course, Course.id == Comment.course_id)  # 關聯 Course 和 Comment
            .join(User, User.studentId == Comment.user_id)  # 關聯 Comment 和 User
            .join(CourseProfessor, CourseProfessor.course_id == Course.id)  # 關聯 Course 和 CourseProfessor
            .join(Professor, Professor.id == CourseProfessor.professor_id)  # 關聯 Professor
            .filter(
                Course.name.contains(course_name),
            )
            .all()
        )

        # 整理查詢結果為結構化的列表
        comment_details = {}
        for result in results:
            comment_id = result.comment_id
            chinesename = result.chinesename
            nickname = result.nickname
            course_score = result.course_score or 0  # 如果沒有評論，默認為 0
            course_content = result.course_content
            time = result.time

            if comment_id not in comment_details:
                # 格式化時間，移除 T
                formatted_time = result.time.strftime("%Y-%m-%d %H:%M:%S") if result.time else None
                comment_details[comment_id] = {
                    "chinesename": chinesename,
                    "nickname": nickname,
                    "professor_name": [],
                    "course_score": course_score,
                    "course_content": course_content,
                    "time": formatted_time
                }
            if result.professor_name and result.professor_name not in comment_details[comment_id]["professor_name"]:
                comment_details[comment_id]["professor_name"].append(result.professor_name)
        
        # 將字典轉換為列表以返回
        courses_list = list(comment_details.values())
        return courses_list
        #return comment_details

    except Exception as e:
        print(f"Error occurred in get_courses_with_professors: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred: {e}")
    finally:
        db.close()
