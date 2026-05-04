from flask import (
    Flask, render_template, request, redirect,
    url_for, session, jsonify, flash
)
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from functools import wraps

from config   import Config
from database import (
    init_db, create_user, get_user_by_username, get_user_by_id,
    update_user_xp, get_user_badges, award_badge, update_streak,
    save_session, get_user_sessions, get_user_stats,
    get_progress, update_progress, get_leaderboard, calculate_level
)

# ─────────────────────────────────────────────────────────────
#  App setup
# ─────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY

# Initialise la DB au démarrage
with app.app_context():
    init_db()

# Charge les leçons depuis data/lessons.json
LESSONS_FILE = os.path.join(os.path.dirname(__file__), "data", "lessons.json")
with open(LESSONS_FILE, encoding="utf-8") as f:
    LESSONS = json.load(f)


# ─────────────────────────────────────────────────────────────
#  Decorator : login requis
# ─────────────────────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Veuillez vous connecter.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────────────────────
#  Helper : XP calculation
# ─────────────────────────────────────────────────────────────
def compute_xp(wpm, accuracy, duration):
    base   = Config.XP_PER_LESSON_BASE
    acc_b  = int(accuracy * Config.XP_ACCURACY_BONUS)
    spd_b  = Config.XP_SPEED_BONUS if wpm >= Config.WPM_BONUS_THRESHOLD else 0
    return base + acc_b + spd_b


# ─────────────────────────────────────────────────────────────
#  Routes publiques
# ─────────────────────────────────────────────────────────────
@app.route("/")
def index():
    user = None
    if "user_id" in session:
        user = get_user_by_id(session["user_id"])
    return render_template("index.html", user=user)


@app.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email    = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        confirm  = request.form.get("confirm_password", "")

        if not username or not email or not password:
            flash("Tous les champs sont requis.", "error")
        elif password != confirm:
            flash("Les mots de passe ne correspondent pas.", "error")
        elif len(password) < 6:
            flash("Le mot de passe doit contenir au moins 6 caractères.", "error")
        else:
            hashed = generate_password_hash(password)
            if create_user(username, email, hashed):
                flash("Compte créé ! Connectez-vous.", "success")
                return redirect(url_for("login"))
            else:
                flash("Nom d'utilisateur ou email déjà utilisé.", "error")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        user = get_user_by_username(username)

        if user and check_password_hash(user["password"], password):
            session["user_id"]   = user["id"]
            session["username"]  = user["username"]
            flash(f"Bienvenue, {user['username']} !", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Identifiants incorrects.", "error")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("Déconnecté.", "info")
    return redirect(url_for("index"))


# ─────────────────────────────────────────────────────────────
#  Dashboard
# ─────────────────────────────────────────────────────────────
@app.route("/dashboard")
@login_required
def dashboard():
    user    = get_user_by_id(session["user_id"])
    stats   = get_user_stats(session["user_id"])
    recent  = get_user_sessions(session["user_id"], limit=5)
    badges  = get_user_badges(session["user_id"])
    board   = get_leaderboard(10)

    # Calcul XP pour la barre de progression
    thresholds = Config.LEVEL_THRESHOLDS
    current_lvl = user["level"]
    xp_current  = user["xp"]
    xp_for_next = thresholds[current_lvl] if current_lvl < len(thresholds) else thresholds[-1]
    xp_for_this = thresholds[current_lvl - 1]
    xp_progress = 0
    if xp_for_next > xp_for_this:
        xp_progress = int(((xp_current - xp_for_this) / (xp_for_next - xp_for_this)) * 100)

    all_badges   = Config.BADGES
    badge_list   = [{"key": k, **v, "earned": k in badges} for k, v in all_badges.items()]

    return render_template(
        "dashboard.html",
        user=user,
        stats=stats,
        recent=recent,
        badge_list=badge_list,
        board=board,
        xp_progress=xp_progress,
        xp_for_next=xp_for_next,
        lessons=LESSONS
    )


# ─────────────────────────────────────────────────────────────
#  Leçons
# ─────────────────────────────────────────────────────────────
@app.route("/lesson/<language>/<lesson_id>")
@login_required
def lesson(language, lesson_id):
    if language not in LESSONS:
        flash("Langue non supportée.", "error")
        return redirect(url_for("dashboard"))

    lesson_data = None
    for cat in LESSONS[language]:
        for les in LESSONS[language][cat]:
            if les["id"] == lesson_id:
                lesson_data = les
                lesson_data["category"] = cat
                break

    if not lesson_data:
        flash("Leçon introuvable.", "error")
        return redirect(url_for("dashboard"))

    progress = get_progress(session["user_id"], language)
    user     = get_user_by_id(session["user_id"])

    return render_template(
        "lesson.html",
        lesson=lesson_data,
        language=language,
        user=user,
        progress=progress
    )

# ─────────────────────────────────────────────
#  API — PROFILE (أضفه هنا مباشرة فوق save_session)
# ─────────────────────────────────────────────
@app.route("/api/profile")
@login_required
def api_profile():
    user_id = session["user_id"]
    user = get_user_by_id(user_id)
    stats = get_user_stats(user_id)

    return jsonify({
        "username": user["username"],
        "xp": user["xp"],
        "streak": user["streak"],
        "best_wpm": stats.get("best_wpm", 0),
        "avg_accuracy": stats.get("avg_accuracy", 0),
        "total_sessions": stats.get("total_sessions", 0),
        "progress": {
            "en": get_progress(user_id, "en"),
            "ar": get_progress(user_id, "ar"),
            "fr": get_progress(user_id, "fr")
        },
        "badges": get_user_badges(user_id),
        "chart_data": stats.get("chart_data", [])
    })
# ─────────────────────────────────────────────────────────────
#  API — Sauvegarde d'une session
# ─────────────────────────────────────────────────────────────
@app.route("/api/save_session", methods=["POST"])
@login_required
def api_save_session():
    data      = request.get_json()
    user_id   = session["user_id"]
    lesson_id = data.get("lesson_id")
    language  = data.get("language")
    wpm       = float(data.get("wpm", 0))
    accuracy  = float(data.get("accuracy", 0))
    errors    = int(data.get("errors", 0))
    duration  = int(data.get("duration", 0))
    completed = int(data.get("completed", 0))

    xp_earned = compute_xp(wpm, accuracy, duration) if completed else 0

    # Sauvegarde session
    save_session(user_id, lesson_id, language, wpm, accuracy, errors, duration, xp_earned, completed)

    # Mise à jour progression
    update_progress(user_id, lesson_id, language, wpm, accuracy)

    # XP + level
    new_xp, new_level = update_user_xp(user_id, xp_earned)

    # Streak
    streak = update_streak(user_id)

    # Badges auto
    new_badges = []
    all_sessions = get_user_sessions(user_id, 9999)

    # First lesson
    if len(all_sessions) == 1:
        if award_badge(user_id, "first_lesson"):
            new_badges.append("first_lesson")

    # Speed demon
    if wpm >= 60:
        if award_badge(user_id, "speed_demon"):
            new_badges.append("speed_demon")

    # Perfectionist
    if accuracy >= 100:
        if award_badge(user_id, "perfectionist"):
            new_badges.append("perfectionist")

    # Level 5
    if new_level >= 5:
        if award_badge(user_id, "level_5"):
            new_badges.append("level_5")

    # Polyglot
    langs_used = {s["language"] for s in all_sessions}
    if len(langs_used) >= 3:
        if award_badge(user_id, "polyglot"):
            new_badges.append("polyglot")

    badge_details = [{"key": k, **Config.BADGES[k]} for k in new_badges if k in Config.BADGES]

    return jsonify({
        "success":    True,
        "xp_earned":  xp_earned,
        "new_xp":     new_xp,
        "new_level":  new_level,
        "streak":     streak,
        "new_badges": badge_details
    })


# ─────────────────────────────────────────────────────────────
#  API — Progression d'un utilisateur
# ─────────────────────────────────────────────────────────────
@app.route("/api/progress/<language>")
@login_required
def api_progress(language):
    prog = get_progress(session["user_id"], language)
    return jsonify(prog)


# ─────────────────────────────────────────────────────────────
#  API — Classement
# ─────────────────────────────────────────────────────────────
@app.route("/api/leaderboard")
def api_leaderboard():
    return jsonify(get_leaderboard(10))


# ─────────────────────────────────────────────────────────────
#  Run
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
