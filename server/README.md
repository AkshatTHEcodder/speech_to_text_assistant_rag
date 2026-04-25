## Server (MERN Auth API)

### Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Fill:
- `MONGO_URI`
- `JWT_SECRET`
- SMTP vars (when you provide them)

3. Install + run:

```bash
npm install
npm run dev
```

### Endpoints

- `POST /api/auth/register` `{ name, email, password }`
- `POST /api/auth/login` `{ email, password }`
- `POST /api/auth/verify-email` `{ email, token }`
- `POST /api/auth/forgot-password` `{ email }`
- `POST /api/auth/reset-password` `{ email, token, newPassword }`

