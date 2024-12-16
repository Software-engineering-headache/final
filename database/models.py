from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.sql import func  # 用於自動設置時間戳
from database.database import Base #它是 SQLAlchemy 中用於創建模型的基礎類

class User(Base):
    __tablename__ = 'users'

    # 主鍵
    studentId = Column(String(20),primary_key=True, index=True)  # 學號（必須唯一）

    # 基本資料欄位
    nickname = Column(String(50), nullable=True)  # 暱稱
    accountType = Column(String(20), nullable=True)  # 帳戶類型，例如 'STUDENT'
    chineseName = Column(String(50), nullable=True)  # 中文姓名
    englishName = Column(String(50), nullable=True)  # 英文姓名
    gender = Column(String(10), nullable=True)  # 性別
    birthday = Column(String(10), nullable=True)  # 出生日期
    email = Column(String(100), unique=False, nullable=True)  # 電子郵件（必須唯一）

    # JSON 格式的欄位（儲存學術資料）
    # academyRecords = Column(JSON, nullable=True)

class College(Base):
    __tablename__ = 'colleges'

    id = Column(Integer, primary_key=True, index=True)  # 主鍵
    name = Column(String(50))  # 學院名稱
    department_id = Column(Integer, unique=True, index=True)  # 科系 ID
    department_name = Column(String(50))  # 科系名稱

class Professor(Base):
    __tablename__ = 'professors'

    id = Column(Integer, primary_key=True, index=True)  # 主鍵
    name = Column(String(50))  # 教師名稱
    department_id = Column(Integer, ForeignKey('colleges.department_id'))  # 學院外鍵
    
class Course(Base):
    __tablename__ = 'courses'

    id = Column(String(8), primary_key=True, index=True) # 課程編號，比如IM4043-*
    name = Column(String(50))  # 課程名稱
    course_info = Column(String(100), nullable=True)  # 課程資訊
    course_year = Column(Integer)  # 開課年份
    department_id = Column(Integer, ForeignKey('colleges.department_id'))  # 學院外鍵

class CourseProfessor(Base):
    __tablename__ = 'course_professors'

    id = Column(Integer, primary_key=True, index=True)  # 主键
    course_id = Column(String(8), ForeignKey('courses.id'))  # 课程外键
    professor_id = Column(Integer, ForeignKey('professors.id'))  # 教授外键

class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True) #id是主鍵，index就是代表他可以成為索引
    score = Column(Integer) 
    content = Column(String(3000))
    course_id = Column(String(8), ForeignKey('courses.id'))
    user_id = Column(String(20), ForeignKey('users.studentId'))
    time = Column(DateTime(timezone=True), server_default=func.now())  # 創建時間

    __table_args__ = (
        CheckConstraint('score >= 1 AND score <= 5', name='check_score_range'),
        #希望評分是1~5分之間
    )

class Favorite(Base):
    __tablename__ = 'favorites'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(20), ForeignKey('users.studentId'))
    course_id = Column(String(8), ForeignKey('courses.id'))

class Log(Base):
    __tablename__ = 'logs'

    id = Column(Integer, primary_key=True, index=True)  # 主鍵
    char_count = Column(Integer)  # 字數限制（評論字數）
    action = Column(String(200))  # 操作類型（如增刪等動作）
    timestamp = Column(DateTime(timezone=True), server_default=func.now())  # 時間戳
    admin_id = Column(String(20), ForeignKey('users.studentId'))  # 管理員 ID，聯結 users 的 studentId
