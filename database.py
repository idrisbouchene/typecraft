import sqlite3
import json
from datetime import datetime, date
from config import Config


# ─────────────────────────────────────────────────────────────
#  Connexion
# ─────────────────────────────────────────────────────────────
def get_db():
    """Retourne une connexion SQLite avec row_factory."""
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# ─────────────────────────────────────────────────────────────
#  Initialisation
# ─────────────────────────────────────────────────────────────
def init_db():
    """Crée toutes les tables si elles n'existent pas."""
    conn = get_db()
    c = conn.cursor()

    # ── Utilisateurs ─────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT    UNIQUE NOT NULL,
            email       TEXT    UNIQUE NOT NULL,
            password    TEXT    NOT NULL,
            xp          INTEGER DEFAULT 0,
            level       INTEGER DEFAULT 1,
            streak      INTEGER DEFAULT 0,
            last_active TEXT,
            badges      TEXT    DEFAULT '[]',
            created_at  TEXT    DEFAULT (datetime('now'))
        )
    """)

    # ── Sessions de pratique ─────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            lesson_id   TEXT    NOT NULL,
            language    TEXT    NOT NULL,
            wpm         REAL    DEFAULT 0,
            accuracy    REAL    DEFAULT 0,
            errors      INTEGER DEFAULT 0,
            duration    INTEGER DEFAULT 0,   -- secondes
            xp_earned   INTEGER DEFAULT 0,
            completed   INTEGER DEFAULT 0,   -- 0/1
            created_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # ── Progression par leçon ────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            lesson_id   TEXT    NOT NULL,
            language    TEXT    NOT NULL,
            best_wpm    REAL    DEFAULT 0,
            best_acc    REAL    DEFAULT 0,
            attempts    INTEGER DEFAULT 0,
            unlocked    INTEGER DEFAULT 0,   -- 0/1
            UNIQUE(user_id, lesson_id, language),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()
    print("[DB] Tables initialisées ✓")


# ─────────────────────────────────────────────────────────────
#  Utilisateurs
# ─────────────────────────────────────────────────────────────
def create_user(username, email, password_hash):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, email, password) VALUES (?,?,?)",
            (username, email, password_hash)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def get_user_by_username(username):
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    conn.close()
    return user


def get_user_by_id(user_id):
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    conn.close()
    return user


def update_user_xp(user_id, xp_to_add):
    """Ajoute de l'XP et recalcule le niveau."""
    conn = get_db()
    user = conn.execute("SELECT xp FROM users WHERE id=?", (user_id,)).fetchone()
    new_xp = user["xp"] + xp_to_add
    new_level = calculate_level(new_xp)
    conn.execute(
        "UPDATE users SET xp=?, level=?, last_active=? WHERE id=?",
        (new_xp, new_level, datetime.now().isoformat(), user_id)
    )
    conn.commit()
    conn.close()
    return new_xp, new_level


def calculate_level(xp):
    thresholds = Config.LEVEL_THRESHOLDS
    level = 1
    for i, thresh in enumerate(thresholds):
        if xp >= thresh:
            level = i + 1
    return min(level, len(thresholds))


def get_user_badges(user_id):
    conn = get_db()
    row = conn.execute("SELECT badges FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    return json.loads(row["badges"]) if row else []


def award_badge(user_id, badge_key):
    badges = get_user_badges(user_id)
    if badge_key not in badges:
        badges.append(badge_key)
        conn = get_db()
        conn.execute(
            "UPDATE users SET badges=? WHERE id=?",
            (json.dumps(badges), user_id)
        )
        conn.commit()
        conn.close()
        return True   # nouvelle badge
    return False


def update_streak(user_id):
    """Met à jour le streak quotidien."""
    conn = get_db()
    user = conn.execute(
        "SELECT streak, last_active FROM users WHERE id=?", (user_id,)
    ).fetchone()
    today = date.today().isoformat()
    last  = user["last_active"][:10] if user["last_active"] else None
    streak = user["streak"]

    if last == today:
        pass  # déjà compté aujourd'hui
    elif last == (date.today().replace(day=date.today().day - 1)).isoformat():
        streak += 1
    else:
        streak = 1

    conn.execute(
        "UPDATE users SET streak=?, last_active=? WHERE id=?",
        (streak, datetime.now().isoformat(), user_id)
    )
    conn.commit()
    conn.close()
    return streak


# ─────────────────────────────────────────────────────────────
#  Sessions de pratique
# ─────────────────────────────────────────────────────────────
def save_session(user_id, lesson_id, language, wpm, accuracy, errors, duration, xp_earned, completed):
    conn = get_db()
    conn.execute("""
        INSERT INTO sessions
            (user_id, lesson_id, language, wpm, accuracy, errors, duration, xp_earned, completed)
        VALUES (?,?,?,?,?,?,?,?,?)
    """, (user_id, lesson_id, language, wpm, accuracy, errors, duration, xp_earned, completed))
    conn.commit()
    conn.close()


def get_user_sessions(user_id, limit=10):
    conn = get_db()
    rows = conn.execute("""
        SELECT * FROM sessions WHERE user_id=?
        ORDER BY created_at DESC LIMIT ?
    """, (user_id, limit)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user_stats(user_id):
    """Retourne les statistiques globales d'un utilisateur."""
    conn = get_db()
    row = conn.execute("""
        SELECT
            COUNT(*)            AS total_sessions,
            SUM(completed)      AS completed_lessons,
            AVG(wpm)            AS avg_wpm,
            MAX(wpm)            AS max_wpm,
            AVG(accuracy)       AS avg_accuracy,
            SUM(duration)       AS total_time
        FROM sessions WHERE user_id=?
    """, (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else {}


# ─────────────────────────────────────────────────────────────
#  Progression par leçon
# ─────────────────────────────────────────────────────────────
def get_progress(user_id, language):
    conn = get_db()
    rows = conn.execute("""
        SELECT * FROM progress WHERE user_id=? AND language=?
    """, (user_id, language)).fetchall()
    conn.close()
    return {r["lesson_id"]: dict(r) for r in rows}


def update_progress(user_id, lesson_id, language, wpm, accuracy):
    conn = get_db()
    existing = conn.execute("""
        SELECT * FROM progress WHERE user_id=? AND lesson_id=? AND language=?
    """, (user_id, lesson_id, language)).fetchone()

    if existing:
        best_wpm = max(existing["best_wpm"], wpm)
        best_acc = max(existing["best_acc"], accuracy)
        attempts = existing["attempts"] + 1
        unlocked = 1 if (best_acc >= Config.MIN_ACCURACY_TO_UNLOCK and best_wpm >= Config.MIN_WPM_TO_UNLOCK) else existing["unlocked"]
        conn.execute("""
            UPDATE progress SET best_wpm=?, best_acc=?, attempts=?, unlocked=?
            WHERE user_id=? AND lesson_id=? AND language=?
        """, (best_wpm, best_acc, attempts, unlocked, user_id, lesson_id, language))
    else:
        unlocked = 1 if (accuracy >= Config.MIN_ACCURACY_TO_UNLOCK and wpm >= Config.MIN_WPM_TO_UNLOCK) else 0
        conn.execute("""
            INSERT INTO progress (user_id, lesson_id, language, best_wpm, best_acc, attempts, unlocked)
            VALUES (?,?,?,?,?,1,?)
        """, (user_id, lesson_id, language, wpm, accuracy, unlocked))

    conn.commit()
    conn.close()


def get_leaderboard(limit=10):
    conn = get_db()
    rows = conn.execute("""
        SELECT username, xp, level,
               (SELECT MAX(wpm) FROM sessions s WHERE s.user_id = u.id) AS best_wpm
        FROM users u ORDER BY xp DESC LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]
