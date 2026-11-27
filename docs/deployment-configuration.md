# Configuración de despliegue EC3 F3 A12
## Frontend
- Repositorio: URL_FRONTEND
- Rama: main
- Servicio: NOMBRE
- URL: https://FRONTEND.onrender.com
- Build: pnpm verify
- Publicación: dist
- VITE_API_URL: https://BACKEND.onrender.com/api
- Rewrite: /* hacia /index.html
## Backend relacionado
- Repositorio: URL_BACKEND
- URL: https://BACKEND.onrender.com
- CORS_ORIGIN: https://FRONTEND.onrender.com
- Salud: /health
- Salud de Atlas: /health/database
- Documentación: /api-docs

No copies MONGODB_URI JWT_SECRET tokens o contraseñas.