from flask import Flask, jsonify, request, g
from flask_cors import CORS
import sqlite3
import database
import hashlib
import secrets
import datetime

app = Flask(__name__)
CORS(app)

database.init_db()

SALT = "quicket_salt"

def get_db():
    """Получение соединения с базой данных"""
    if 'db' not in g:
        g.db = database.get_db_connection()
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    """Закрытие соединения с базой данных"""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def hash_password(password):
    """Хеширование пароля с солью"""
    return hashlib.sha256((password + SALT).encode()).hexdigest()

def generate_token():
    """Генерация простого токена для авторизации"""
    return secrets.token_hex(16)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    db = get_db()
    user = db.execute(
        'SELECT * FROM users WHERE username = ?', (username,)
    ).fetchone()

    if user and user['password'] == hash_password(password):
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'token': generate_token()  # В реальности это должен быть JWT
            }
        })

    return jsonify({'success': False, 'message': 'Неверное имя пользователя или пароль'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    db = get_db()
    try:
        db.execute(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            (username, hash_password(password), email)
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Пользователь успешно зарегистрирован'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Пользователь с таким именем или email уже существует'}), 400

@app.route('/api/events', methods=['GET'])
def get_events():
    db = get_db()
    events = db.execute('''
        SELECT e.*, v.name as venue_name,
               (SELECT COUNT(*) FROM bookings WHERE event_id = e.id AND status = 'confirmed') as booked_seats
        FROM events e
        JOIN venues v ON e.venue_id = v.id
        ORDER BY e.date, e.time
    ''').fetchall()

    result = []
    for event in events:
        available_seats = event['total_seats'] - event['booked_seats']
        result.append({
            'id': event['id'],
            'title': event['title'],
            'type': event['type'],
            'venue_id': event['venue_id'],
            'venue_name': event['venue_name'],
            'date': event['date'],
            'time': event['time'],
            'duration': event['duration'],
            'total_seats': event['total_seats'],
            'available_seats': available_seats,
            'price': event['price'],
            'description': event['description']
        })

    return jsonify(result)

@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    db = get_db()
    event = db.execute('''
        SELECT e.*, v.name as venue_name, v.address as venue_address,
               (SELECT COUNT(*) FROM bookings WHERE event_id = e.id AND status = 'confirmed') as booked_seats
        FROM events e
        JOIN venues v ON e.venue_id = v.id
        WHERE e.id = ?
    ''', (event_id,)).fetchone()

    if not event:
        return jsonify({'success': False, 'message': 'Мероприятие не найдено'}), 404

    available_seats = event['total_seats'] - event['booked_seats']

    return jsonify({
        'id': event['id'],
        'title': event['title'],
        'type': event['type'],
        'venue_id': event['venue_id'],
        'venue_name': event['venue_name'],
        'venue_address': event['venue_address'],
        'date': event['date'],
        'time': event['time'],
        'duration': event['duration'],
        'total_seats': event['total_seats'],
        'available_seats': available_seats,
        'price': event['price'],
        'description': event['description']
    })

@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.json

    required_fields = ['title', 'type', 'venue_id', 'date', 'time', 'total_seats', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Поле {field} обязательно'}), 400
    
    db = get_db()
    try:
        cursor = db.execute('''
            INSERT INTO events (title, type, venue_id, date, time, duration, total_seats, price, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['type'],
            data['venue_id'],
            data['date'],
            data['time'],
            data.get('duration', 60),
            data['total_seats'],
            data['price'],
            data.get('description', '')
        ))
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Мероприятие успешно создано',
            'event_id': cursor.lastrowid
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Ошибка при создании мероприятия: {str(e)}'}), 500

# API для бронирования места на мероприятии
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    seats = data.get('seats', 1)
    
    if not user_id or not event_id:
        return jsonify({'success': False, 'message': 'ID пользователя и мероприятия обязательны'}), 400
    
    db = get_db()
    
    # Проверяем наличие свободных мест
    event = db.execute('''
        SELECT total_seats,
               (SELECT COUNT(*) FROM bookings WHERE event_id = ? AND status = 'confirmed') as booked_seats
        FROM events
        WHERE id = ?
    ''', (event_id, event_id)).fetchone()
    
    if not event:
        return jsonify({'success': False, 'message': 'Мероприятие не найдено'}), 404
    
    available_seats = event['total_seats'] - event['booked_seats']
    
    if available_seats < seats:
        return jsonify({'success': False, 'message': f'Недостаточно мест. Доступно: {available_seats}'}), 400
    
    try:
        cursor = db.execute('''
            INSERT INTO bookings (user_id, event_id, seats)
            VALUES (?, ?, ?)
        ''', (user_id, event_id, seats))
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Бронирование успешно создано',
            'booking_id': cursor.lastrowid
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Ошибка при создании бронирования: {str(e)}'}), 500

# API для получения бронирований пользователя
@app.route('/api/users/<int:user_id>/bookings', methods=['GET'])
def get_user_bookings(user_id):
    db = get_db()
    bookings = db.execute('''
        SELECT b.*, e.title as event_title, e.date as event_date, 
               e.time as event_time, e.price as event_price,
               v.name as venue_name
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN venues v ON e.venue_id = v.id
        WHERE b.user_id = ?
        ORDER BY e.date, e.time
    ''', (user_id,)).fetchall()
    
    result = []
    for booking in bookings:
        result.append({
            'id': booking['id'],
            'event_id': booking['event_id'],
            'event_title': booking['event_title'],
            'event_date': booking['event_date'],
            'event_time': booking['event_time'],
            'venue_name': booking['venue_name'],
            'seats': booking['seats'],
            'status': booking['status'],
            'total_price': booking['seats'] * booking['event_price'],
            'created_at': booking['created_at']
        })
    
    return jsonify(result)

# API для отмены бронирования
@app.route('/api/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    user_id = request.json.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'ID пользователя обязателен'}), 400
    
    db = get_db()
    booking = db.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,)).fetchone()
    
    if not booking:
        return jsonify({'success': False, 'message': 'Бронирование не найдено'}), 404
    
    if booking['user_id'] != user_id:
        return jsonify({'success': False, 'message': 'У вас нет прав для отмены этого бронирования'}), 403
    
    try:
        db.execute('''
            UPDATE bookings
            SET status = 'cancelled'
            WHERE id = ?
        ''', (booking_id,))
        db.commit()
        
        return jsonify({
            'success': True,
            'message': 'Бронирование успешно отменено'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Ошибка при отмене бронирования: {str(e)}'}), 500

# API для получения всех спортивных объектов
@app.route('/api/venues', methods=['GET'])
def get_venues():
    db = get_db()
    venues = db.execute('SELECT * FROM venues ORDER BY name').fetchall()
    
    result = []
    for venue in venues:
        result.append({
            'id': venue['id'],
            'name': venue['name'],
            'address': venue['address'],
            'description': venue['description'],
            'capacity': venue['capacity']
        })
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)