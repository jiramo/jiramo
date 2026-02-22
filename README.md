<p align="center">
  </a>  <a href="https://jiramo.netlify.app/">
    <img src="./public/logo.svg" width="100px" alt="Jiramo logo" />
  </a>
</p>

<h2 align="center" >Jiramo · The #1 CRM built for developers</h2>

<p align="center"><a href="https://jiramo.netlify.app/">🌐 Website</a> · <a href="https://jiramo.netlify.app/docs">📚 Documentation</a></p>
<br />

## Quick Start

### Default (trust mode)
```bash
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173) and follow the setup wizard.

### With custom credentials
```bash
# Bash
./start.sh [db_name] [db_user] [db_password]

# Fish
./start.fish [db_name] [db_user] [db_password]
```

Examples:
```bash
./start.sh mydb admin MySecurePass123
./start.sh mydb admin
./start.sh
```

Parameters:
- DB_NAME (default: jiramo)
- DB_USER (default: postgres)
- DB_PASSWORD (optional → trust mode)
- DB_PORT (default: 5432)

---

## Setup Wizard
- Database configuration
- Admin user creation
Config is saved in `.dbconfig.json` (gitignored).

---

## Reset
```bash
docker compose down -v
rm .dbconfig.json
./start.sh
```

---

## Login
[http://localhost:5173/login](http://localhost:5173/login)
Only admin users can access the dashboard.