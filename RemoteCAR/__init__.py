from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config.from_pyfile('config.py')

    db.init_app(app)
    migrate.init_app(app, db)

    from .views import main, manual, auth_views
    app.register_blueprint(main.bp)
    app.register_blueprint(manual.bp)
    app.register_blueprint(auth_views.bp)


    return app


