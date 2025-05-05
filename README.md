
# Spotify Clone Project

This project is a clone of Spotify, separated into two parts: `backend_spotify` and `frontend`.

## 📁 Project Structure

- `backend_spotify/`: Contains the backend code (likely built with Django, Node.js, or similar).
- `frontend/`: Contains the frontend code (likely built with React.js).

---

## 🚀 Installation Guide

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Python 3.9+ (if backend is Django)
- pip
- MySQL or PostgreSQL (optional, depending on backend)

---

## ⚙️ Backend Setup

1. Go to the backend folder:

```bash
cd backend_spotify
```

2. Create virtual environment and activate it (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

Create a `.env` file in `backend_spotify/` and add necessary keys, for example:

```env
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=mysql://user:password@localhost:3306/spotifydb
```

5. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

6. Run the development server:

```bash
python manage.py runserver
```

---

## 🌐 Frontend Setup

1. Go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in `frontend/` and configure:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

4. Start the development server:

```bash
npm start
```

---

## 🧪 Testing

- Backend: Run tests with

```bash
python manage.py test
```

- Frontend: Use

```bash
npm test
```

---

## 📝 Notes

- Make sure both frontend and backend `.env` files are configured properly.
- Ensure ports do not conflict (backend default: 8000, frontend default: 3000).
- CORS should be configured correctly in the backend.

---

## 📬 Contact

For questions or contributions, feel free to open an issue or contact the maintainer.

---


