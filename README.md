<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1VgK2YLPdZtI_NjChqm3zmOzKZmfUoKEe

## Run Locally

**Prerequisites:**  Node.js and PostgreSQL

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd "server PG"
   npm install
   cd ..
   ```

2. **Configure environment variables:**
   
   **Frontend (.env):**
   - Copy `.env.example` to `.env` in the root directory
   - Update `VITE_API_BASE_URL` if your backend runs on a different port
   - Set `GEMINI_API_KEY` if needed (optional)
   
   **Backend (server PG/.env):**
   - Copy `server PG/.env.example` to `server PG/.env`
   - Update PostgreSQL connection details:
     - `DB_USER`: Your PostgreSQL username
     - `DB_HOST`: Database host (default: localhost)
     - `DB_NAME`: Database name
     - `DB_PASSWORD`: Your PostgreSQL password
     - `DB_PORT`: PostgreSQL port (default: 5432)
   - Update `PORT` if you want the backend to run on a different port

3. **Start the backend server:**
   ```bash
   cd "server PG"
   npm start
   ```

4. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000` (or the port specified in `VITE_PORT`).
