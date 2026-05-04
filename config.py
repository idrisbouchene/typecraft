import os

class Config:
    # ── Security ──────────────────────────────────────────────
    SECRET_KEY = os.environ.get("SECRET_KEY", "typecraft-secret-key-change-in-production")

    # ── Database ──────────────────────────────────────────────
    BASE_DIR   = os.path.abspath(os.path.dirname(__file__))
    DATABASE   = os.path.join(BASE_DIR, "typecraft.db")

    # ── Gamification ─────────────────────────────────────────
    XP_PER_LESSON_BASE = 50      # XP de base par leçon réussie
    XP_ACCURACY_BONUS  = 0.5     # multiplicateur bonus précision
    WPM_BONUS_THRESHOLD = 40     # WPM requis pour bonus vitesse
    XP_SPEED_BONUS     = 20

    LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700]
    # index = level, valeur = XP total requis pour ce niveau

    BADGES = {
        "first_lesson":  {"name": "Première Frappe",  "icon": "🎯", "desc": "Complétez votre première leçon"},
        "speed_demon":   {"name": "Speed Demon",       "icon": "⚡", "desc": "Atteignez 60 WPM"},
        "perfectionist": {"name": "Perfectionniste",   "icon": "💎", "desc": "100% de précision sur une leçon"},
        "streak_7":      {"name": "Semaine de Feu",    "icon": "🔥", "desc": "7 jours consécutifs de pratique"},
        "level_5":       {"name": "Maître Intermédiaire","icon": "🏅","desc": "Atteignez le niveau 5"},
        "polyglot":      {"name": "Polyglotte",        "icon": "🌍", "desc": "Pratiquez 3 langues"},
    }

    # ── Lesson unlock logic ───────────────────────────────────
    MIN_ACCURACY_TO_UNLOCK = 70   # % de précision minimum pour débloquer la suivante
    MIN_WPM_TO_UNLOCK      = 15
