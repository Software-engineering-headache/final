# ncu_comment_try_merge_repo
# 關於main.py
## app = FastAPI()
只有這裡用app = FastAPI
其他地方的我還沒改但應該是只有這裡用就好
其他地方都用router = APIRouter()，定義路由用@router去定義
## app.include_router(<router_name>, tags=[<module_name>])
模組用上面這行加進app裡面，具體流程可以看main.py裡面程式碼
引入時需要注意from <path> import router as <router_name>，具體範例直接參考main.py裡面程式碼
## 執行
直接執行主程式就可以了，如果想要看現在的api有哪些之類的文件直接輸入下面網址：
http://localhost:8000/docs
