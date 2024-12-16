# SQLAlchemy 支持多種數據庫，使開發人員可以輕鬆地遷移資料庫，而無需做太多的更動

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# URL_DATABASE = 'mysql+pymysql://root:@localhost:3306/ncu_comment'
URL_DATABASE = "mysql+pymysql://admin:12345678@ncu-comment-database.cl8kosu00ogx.ap-southeast-2.rds.amazonaws.com:3306/ncu_comment"

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base = declarative_base()
