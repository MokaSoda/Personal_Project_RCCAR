from flask import Blueprint, render_template, request, jsonify, redirect


bp = Blueprint('mainpage', __name__, url_prefix='/')

@bp.route('/')
def index():
    return redirect('/manual')