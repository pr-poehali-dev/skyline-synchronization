"""
Бэкенд для чата Chill Zone.
Поддерживает: получение сообщений, отправку, вход/регистрацию пользователя, статус онлайн, верификацию, админ.
Используется параметр ?action=messages|login|send|online|verify|admin|stats
"""
import json
import os
import psycopg2
from datetime import datetime

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Session-Id",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "messages")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # GET ?action=messages — получить историю сообщений
    if action == "messages":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, user_id, username, avatar_url, text, file_url, file_type, file_name, is_verified, created_at
            FROM messages ORDER BY created_at ASC LIMIT 200
        """)
        rows = cur.fetchall()
        conn.close()
        messages = []
        for r in rows:
            messages.append({
                "id": r[0], "user_id": r[1], "username": r[2], "avatar_url": r[3],
                "text": r[4], "file_url": r[5], "file_type": r[6], "file_name": r[7],
                "is_verified": r[8],
                "created_at": r[9].strftime("%H:%M") if r[9] else ""
            })
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"messages": messages})}

    # POST ?action=login — вход / регистрация
    if action == "login":
        username = body.get("username", "").strip()
        if not username or len(username) < 2:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Имя слишком короткое"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, username, avatar_url, is_verified, is_admin FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        if not user:
            cur.execute(
                "INSERT INTO users (username) VALUES (%s) RETURNING id, username, avatar_url, is_verified, is_admin",
                (username,)
            )
            user = cur.fetchone()
        else:
            cur.execute("UPDATE users SET last_seen_at = NOW() WHERE id = %s", (user[0],))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({
            "user": {"id": user[0], "username": user[1], "avatar_url": user[2], "is_verified": user[3], "is_admin": user[4]}
        })}

    # POST ?action=send — отправить сообщение
    if action == "send":
        user_id = body.get("user_id")
        username = body.get("username", "").strip()
        text = body.get("text", "").strip()
        avatar_url = body.get("avatar_url")
        if not username or not text:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Пустое сообщение"})}
        conn = get_conn()
        cur = conn.cursor()
        is_verified = False
        if user_id:
            cur.execute("SELECT is_verified, avatar_url FROM users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if row:
                is_verified = row[0]
                if not avatar_url:
                    avatar_url = row[1]
            cur.execute("UPDATE users SET last_seen_at = NOW() WHERE id = %s", (user_id,))
        cur.execute(
            """INSERT INTO messages (user_id, username, avatar_url, text, is_verified)
               VALUES (%s, %s, %s, %s, %s)
               RETURNING id, created_at""",
            (user_id, username, avatar_url, text, is_verified)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({
            "message": {
                "id": row[0], "user_id": user_id, "username": username,
                "avatar_url": avatar_url, "text": text, "is_verified": is_verified,
                "created_at": row[1].strftime("%H:%M") if row[1] else ""
            }
        })}

    # GET ?action=online — список пользователей с онлайн-статусом
    if action == "online":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, username, avatar_url, is_verified, last_seen_at
            FROM users ORDER BY last_seen_at DESC LIMIT 50
        """)
        rows = cur.fetchall()
        conn.close()
        now = datetime.utcnow()
        users = []
        for r in rows:
            diff = (now - r[4]).total_seconds() if r[4] else 9999
            online = diff < 300
            last_seen = "онлайн" if online else _format_ago(diff)
            users.append({"id": r[0], "username": r[1], "avatar_url": r[2], "is_verified": r[3], "online": online, "last_seen": last_seen})
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"users": users})}

    # POST ?action=verify — выдать верификацию (только admin)
    if action == "verify":
        admin_id = body.get("admin_id")
        target_username = body.get("username")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT is_admin FROM users WHERE id = %s", (admin_id,))
        row = cur.fetchone()
        if not row or not row[0]:
            conn.close()
            return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет прав"})}
        cur.execute("UPDATE users SET is_verified = TRUE WHERE username = %s", (target_username,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

    # POST ?action=admin — активировать режим администратора по коду 2356
    if action == "admin":
        user_id = body.get("user_id")
        code = body.get("code", "")
        if code != "2356":
            return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неверный код"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("UPDATE users SET is_admin = TRUE WHERE id = %s", (user_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

    # GET ?action=stats — статистика для панели администратора
    if action == "stats":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM users")
        users_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM messages")
        messages_count = cur.fetchone()[0]
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({
            "users_count": users_count, "messages_count": messages_count
        })}

    return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Unknown action"})}


def _format_ago(seconds):
    if seconds < 60:
        return "только что"
    elif seconds < 3600:
        m = int(seconds // 60)
        return f"{m} мин назад"
    elif seconds < 86400:
        h = int(seconds // 3600)
        return f"{h} ч назад"
    else:
        d = int(seconds // 86400)
        return f"{d} д назад"
