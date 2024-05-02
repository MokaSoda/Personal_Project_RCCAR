from datetime import datetime

from flask import Blueprint, render_template, url_for, request, jsonify, send_file, redirect, g, session, flash
import requests
from RemoteCAR.model import Image, User
from RemoteCAR.views.auth_views import login_required
from RemoteCAR import db
import uuid
bp = Blueprint('manual', __name__, template_folder='templates', static_folder='static', url_prefix='/manual')
basedir = 'RemoteCAR/uploads'


@bp.route('/')
@login_required
def index():
    print(session.get('username'))
    return render_template('index.html')

@bp.route('/snapshot', methods=['POST'])
@login_required
def snapshot():
    postjson = request.get_json()
    url = postjson['url']
    result = 'failed'
    uuidstr = str(uuid.uuid4())


    tmpImage = Image()
    tmpImage.image_data = url
    tmpImage.timestamp = datetime.now()
    tmpImage.uuid = uuidstr
    tmpImage.captured_user = User.query.filter_by(id=session.get('user_id')).first().username
    # print(tmpImage)
    db.session.add(tmpImage)
    db.session.commit()

    return jsonify({
        'result' : result
    })

@bp.route('/viewimage', methods=['GET'])
@login_required
def imageList():
    result = request.args
    pagetoshow = 10
    imagecnt = Image.query.count() // 10
    if 'pages' in result:
        pages = int(result['pages'])
        # images = Image.query.order_by(Image.timestamp.desc()).limit(pages).all()
        imageall = Image.query.order_by(Image.timestamp.desc()).paginate(page=pages, per_page=pagetoshow)
    else:
        # images = Image.query.order_by(Image.timestamp.desc()).limit(pagetoshow).all()
        imageall = Image.query.order_by(Image.timestamp.desc()).paginate(page=1, per_page=pagetoshow)
    return render_template('viewimage.html', images=imageall)


@bp.route('/deleteimage', methods=['POST'])
@login_required
def removeimg():
    uuidstr = request.form['image_id']
    image = Image.query.filter_by(uuid=uuidstr).first()
    if image.captured_user == User.query.filter_by(id=session.get('user_id')).first().username:
        db.session.delete(image)
        db.session.commit()
    else:
        flash('이미지를 삭제할 권한이 없습니다. 소유자 계정으로 로그인하세요')
    return redirect(url_for('manual.imageList'))


@bp.route('/detailimg/<uuidstr>', methods=['GET'])
@login_required
def detailimg(uuidstr):
    imagequery = Image.query.filter_by(uuid=uuidstr).first()
    return render_template('detailimg.html', imagequery=imagequery)

