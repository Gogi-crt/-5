from flask import Flask, render_template, redirect, url_for, request, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField
from wtforms.validators import DataRequired, Email, Length
from werkzeug.security import generate_password_hash, check_password_hash
import os
import qrcode
from datetime import datetime
from PIL import Image
import secrets
import email_validator

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///theatre.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['QR_CODE_FOLDER'] = 'static/qrcodes'

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Database Models with Relationships
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')
    bookings = db.relationship('Booking', backref='user', lazy=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    date = db.Column(db.DateTime)
    image = db.Column(db.String(100))
    bookings = db.relationship('Booking', backref='event', lazy=True)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    seats = db.Column(db.Integer)
    qr_code = db.Column(db.String(100))

class Partner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    logo = db.Column(db.String(100))

# Forms
class LoginForm(FlaskForm):
    email = StringField('Email', validators=[
        DataRequired("Пожалуйста, введите email"),
        Email("Введите корректный email адрес")
    ])
    password = PasswordField('Пароль', validators=[
        DataRequired("Пожалуйста, введите пароль")
    ])
    submit = SubmitField('Войти')

class RegistrationForm(FlaskForm):
    name = StringField('Имя', validators=[
        DataRequired("Пожалуйста, введите ваше имя")
    ])
    email = StringField('Email', validators=[
        DataRequired("Пожалуйста, введите email"),
        Email("Введите корректный email адрес")
    ])
    password = PasswordField('Пароль', validators=[
        DataRequired("Пожалуйста, введите пароль"),
        Length(min=6, message="Пароль должен быть не менее 6 символов")
    ])
    submit = SubmitField('Зарегистрироваться')

class BookingForm(FlaskForm):
    seats = SelectField('Количество мест', choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4')],
                        validators=[DataRequired("Выберите количество мест")])
    submit = SubmitField('Забронировать')

# Helper Functions
def create_qr_code(booking_id):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    data = f"BookingID:{booking_id}|User:{current_user.id}"
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    filename = f"qr_{booking_id}.png"
    img.save(os.path.join(app.config['QR_CODE_FOLDER'], filename))
    return filename

def init_db():
    with app.app_context():
        db.create_all()

        # Create admin user
        if not User.query.filter_by(email='admin@theatre.com').first():
            admin = User(
                email='admin@theatre.com',
                password=generate_password_hash('admin123'),
                name='Admin',
                role='admin'
            )
            db.session.add(admin)

        # Add sample events
        events = [
            {"title": "Гамлет", "date": datetime(2023, 12, 15), "image": "hamlet.jpg"},
            {"title": "Чайка", "date": datetime(2023, 12, 20), "image": "seagull.jpg"},
            {"title": "Ревизор", "date": datetime(2023, 12, 25), "image": "revizor.jpg"}
        ]

        for e in events:
            if not Event.query.filter_by(title=e["title"]).first():
                event = Event(
                    title=e["title"],
                    description="Классическая театральная постановка",
                    date=e["date"],
                    image=e["image"]
                )
                db.session.add(event)

        # Add partners
        partners = [
            {"name": "Театральное общество", "logo": "partner1.png"},
            {"name": "Арт-фонд", "logo": "partner2.png"}
        ]

        for p in partners:
            if not Partner.query.filter_by(name=p["name"]).first():
                partner = Partner(
                    name=p["name"],
                    description="Официальный партнер театра",
                    logo=p["logo"]
                )
                db.session.add(partner)

        db.session.commit()

# User Loader
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    events = Event.query.order_by(Event.date.asc()).limit(3).all()
    return render_template('index.html', events=events)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('profile'))
        flash('Неверный email или пароль', 'danger')
    return render_template('login.html', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data)
        user = User(
            name=form.name.data,
            email=form.email.data,
            password=hashed_password
        )
        db.session.add(user)
        db.session.commit()
        flash('Регистрация прошла успешно! Пожалуйста, войдите.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/profile')
@login_required
def profile():
    # Используем отношения для загрузки связанных данных
    bookings = Booking.query.filter_by(user_id=current_user.id).options(
        db.joinedload(Booking.event)
    ).all()
    return render_template('profile.html', bookings=bookings)

@app.route('/events')
def events():
    all_events = Event.query.order_by(Event.date.asc()).all()
    return render_template('events.html', events=all_events)

@app.route('/event/<int:event_id>', methods=['GET', 'POST'])
@login_required
def event_detail(event_id):
    event = Event.query.get_or_404(event_id)
    form = BookingForm()
    if form.validate_on_submit():
        booking = Booking(
            user_id=current_user.id,
            event_id=event_id,
            seats=form.seats.data
        )
        db.session.add(booking)
        db.session.commit()

        qr_filename = create_qr_code(booking.id)
        booking.qr_code = qr_filename
        db.session.commit()

        flash('Бронирование прошло успешно!', 'success')
        return redirect(url_for('profile'))
    return render_template('event_detail.html', event=event, form=form)

@app.route('/partners')
def partners():
    partners_list = Partner.query.all()
    return render_template('partners.html', partners=partners_list)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/qr_codes/<filename>')
def qr_code(filename):
    return send_from_directory(app.config['QR_CODE_FOLDER'], filename)

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        return redirect(url_for('index'))

    users = User.query.all()

    # Используем отношения для загрузки связанных данных
    bookings = Booking.query.options(
        db.joinedload(Booking.user),
        db.joinedload(Booking.event)
    ).all()

    return render_template('admin/dashboard.html', users=users, bookings=bookings)

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['QR_CODE_FOLDER'], exist_ok=True)
    init_db()
    app.run(debug=True)