# Code Collaborator

![Code Collaborator Screenshot](image.png)

A real-time collaborative code editor and drawing canvas built with Django Channels (WebSocket), React, and TypeScript. Multiple users can simultaneously edit code and draw on a shared canvas in real-time.

## Features

- 🚀 **Real-time Code Collaboration**: Multiple users can edit code simultaneously with live updates
- 🎨 **Interactive Drawing Canvas**: Collaborative whiteboard using tldraw
- 🔌 **WebSocket Communication**: Real-time updates using Django Channels
- 💾 **State Persistence**: Room state is maintained across user sessions
- 🌐 **Multi-language Support**: JavaScript, Python, and Java syntax highlighting
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Room-based Isolation**: Each room maintains its own state and user list

## Tech Stack

### Backend

- **Django 5.1.4** - Web framework
- **Django Channels** - WebSocket support
- **Daphne** - ASGI server
- **channels-redis** - Channel layer backend
- **django-cors-headers** - CORS support
- **whitenoise** - Static file serving

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CodeMirror 6** - Code editor
- **tldraw** - Drawing canvas
- **Tailwind CSS** - Styling

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ManiacAyu/codeCollaborator1.git
cd codeCollaborator1
```

### 2. Backend Setup (Django Server)

#### Step 1: Navigate to Server Directory

```bash
cd server
```

#### Step 2: Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Environment Configuration

Create a `.env` file in the `server` directory:

```bash
# server/.env
DEBUG=True
SECRET_KEY=django-insecure-9lofqr(d75^41v9anijlk6#3j4iu!^0gq@=cb12%5^_(f52^@1

# Development URLs
DEV_FRONTEND_URL=http://localhost:3000

# Production URLs
PROD_FRONTEND_URL=https://your-production-domain.com

# Allowed Hosts (comma separated)
ALLOWED_HOSTS=127.0.0.1,localhost,your-production-domain.com
```

#### Step 5: Database Setup

```bash
python manage.py migrate
```

#### Step 6: Start the Django Server

```bash
python manage.py runserver
```

The Django server will be running at `http://localhost:8000`

### 3. Frontend Setup (React Client)

#### Step 1: Navigate to Client Directory

```bash
cd ../client  # or cd client from root directory
```

#### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

#### Step 3: Environment Configuration

Create a `.env` file in the `client` directory:

```bash
# client/.env
# Development WebSocket URL
VITE_WS_BASE_URL=ws://localhost:8000

# For production, you would set:
# VITE_WS_BASE_URL=wss://your-production-domain.com
```

#### Step 4: Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The React client will be running at `http://localhost:3000`

## Usage

1. **Access the Application**: Open `http://localhost:3000` in your browser
2. **Enter Username**: Provide a username to identify yourself
3. **Create/Join Room**: Enter a room ID to create a new room or join an existing one
4. **Collaborate**:
   - Use the **Editor** tab for real-time code collaboration
   - Use the **Draw** tab for collaborative drawing
   - Switch between tabs without losing connection

## Project Structure

```
codeCollaborator1/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── lib/           # Utilities
│   ├── public/            # Static assets
│   ├── .env               # Environment variables
│   └── package.json       # Dependencies
├── server/                # Django backend
│   ├── main/              # Main Django app
│   │   ├── consumers.py   # WebSocket consumers
│   │   ├── routing.py     # WebSocket routing
│   │   └── models.py      # Database models
│   ├── server/            # Django project settings
│   ├── .env               # Environment variables
│   ├── requirements.txt   # Python dependencies
│   └── manage.py          # Django management script
└── README.md              # This file
```

## Development

### Running in Development Mode

1. Start the Django server:

   ```bash
   cd server
   python manage.py runserver
   ```

2. Start the React client:
   ```bash
   cd client
   npm run dev
   ```
