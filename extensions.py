"""
Flask Extensions
"""

import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
