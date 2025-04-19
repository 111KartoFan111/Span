import sqlite3
import os
from datetime import datetime

DATABASE_PATH = 'quicket.db'

def get_db_connection():
    """Создает соединение с базой данных SQLite"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Инициализирует базу данных, создает таблицы если их нет"""
    if os.path.exists(DATABASE_PATH):
        print(f"База данных {DATABASE_PATH} уже существует")
    else:
        print(f"Создание новой базы данных {DATABASE_PATH}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Создание таблицы пользователей
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Создание таблицы спортивных объектов
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS venues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        description TEXT,
        capacity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Создание таблицы спортивных мероприятий/секций
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        venue_id INTEGER NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER DEFAULT 60,
        total_seats INTEGER NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues (id)
    )
    ''')
    
    # Создание таблицы бронирований
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        seats INTEGER NOT NULL DEFAULT 1,
        status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    ''')
    
    conn.commit()

    
    # Проверяем наличие тестовых данных, если нет - создаем
    cursor.execute("SELECT COUNT(*) FROM venues")
    if cursor.fetchone()[0] == 0:
        # Добавляем несколько спортивных объектов
        venues = [
            ('Astana Arena', 'ул. Туран, 48', 'Футбольное поле с трибунами', 30000),
            ('Спортивный комплекс "Алатау"', 'ул. Тауелсиздик, 1/1', 'Многофункциональный комплекс с бассейном', 300),
            ('Фитнес центр "Invictus"', 'просп. Абая, 45', 'Тренажерный зал, групповые занятия', 100)
        ]
        
        cursor.executemany('''
        INSERT INTO venues (name, address, description, capacity)
        VALUES (?, ?, ?, ?)
        ''', venues)
        
        # Получаем ID добавленных объектов
        cursor.execute("SELECT id FROM venues")
        venue_ids = [row[0] for row in cursor.fetchall()]
        
        # Бірнеше іс-шараларды қосу
        current_date = datetime.now().strftime('%Y-%m-%d')
        events = [
        ('Футбол матчы', 'Футбол', venue_ids[0], current_date, '18:00', 90, 30000, 1000, 'Командалар арасындағы достық кездесу'),
        ('Жаңадан бастаушыларға арналған жүзу', 'Жүзу', venue_ids[1], current_date, '10:00', 60, 30, 2000, 'Жүзудің негізгі әдістерін үйрету'),
        ('Йога', 'Йога', venue_ids[2], current_date, '19:00', 60, 20, 1500, 'Барлық деңгейлерге арналған релаксация йогасы'),
        ('Баскетбол секциясы', 'Баскетбол', venue_ids[0], current_date, '15:00', 120, 40, 1200, 'Жас команда үшін жаттығу')
        ]

        cursor.executemany('''
        INSERT INTO events (title, type, venue_id, date, time, duration, total_seats, price, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', events)
        
        conn.commit()
        print("Добавлены тестовые данные")
    
    conn.close()
    print("База данных успешно инициализирована")

if __name__ == "__main__":
    init_db()