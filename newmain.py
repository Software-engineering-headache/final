from fastapi import FastAPI
from NewController.new.UserController import router as user_router
from NewController.new.SystemController import router as system_router
from NewController.new.FavoriteController import router as favorite_router
from NewController.new.CourseController import router as course_router
from NewController.new.CommentController import router as comment_router
# 如果有其他的控制器文件，也一并导入，例如：
# from NewController.new.AnotherController import router as another_router

from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()

# 添加中间件
app.add_middleware(
    SessionMiddleware,
    secret_key="your_secret_key",
    session_cookie="session",
    max_age=3600,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:5500/interface/ncu_comment-interface/profile.html",
        "http://localhost:5500/interface/ncu_comment-interface/register.html"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

# 注册路由
app.include_router(user_router, tags=["User"])
app.include_router(system_router, tags=["System"])
app.include_router(favorite_router, tags=["Favorite"])
app.include_router(course_router, tags=["Course"])
app.include_router(comment_router, tags=["Comment"])
# 如果有其他的路由，也在这里注册：
# app.include_router(another_router, tags=["Another"])

if __name__ == "__main__":
    import uvicorn
    import webbrowser
    url = "http://127.0.0.1:5500/interface/ncu_comment-interface/index.html"
    print(f"后端服务运行中，请访问 {url}")
    webbrowser.open(url)
    print("后端服务运行中，请访问 http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
