# Trueque U
Segundo Proyecto de IHC

**Integrantes Iniciales:**
* Justiniano Becerra Ruben Orestes 
* Mamani Sandoval Gabriel

**Integrantes Actuales:**
* Contreras Garzon Job Natanael 
* Flores Veizaga Eudenia Gandira

## Instrucciones para ejecutar el backend

1. Configurar las variables de entorno:
   Renombra o copia el archivo `example.env` a `.env` y define los valores de las variables requeridas (como `PORT` y `JWT_SECRET`).

   ```bash
   cp example.env .env
   ```

2. Ejecuta en la terminal dentro de la carpeta `backend` los siguientes comandos:

   ```bash
   npm install
   npm run seed
   npm run dev
   ```

3. Para ejecutar las pruebas unitarias:
   ```bash
   npm run test
   npm run test:coverage # Para ver el reporte de cobertura
   ```

El cliente REST para hacer las peticiones al backend está en `backend/api.http`

### Estructura del backend

```
backend/src/
  app.js         # Express, middlewares, rutas y arranque
  database/      # Configuración, conexión SQLite y seed
  models/        # Modelos y relaciones(index.js)
  controllers/   # Lógica de cada endpoint
  routes/        # Definición de rutas
  middleware/    # verifyToken y manejo central de errores
```



## Instrucciones para ejecutar el frontend
```bash
cd frontend
npm run dev
```
| Abre en el navegador `http://localhost:5173`.
