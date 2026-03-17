## Backend (Django) - Patrón **Multicapa**

Usaremos el patrón **Multicapa** (también llamado Repository + Service):

- **Model** → Modelos de Django (tablas de la base de datos) 
- **Repository** → Clase que se encarga solo de consultar/guardar en la BD 
- **Service** → Lógica de negocio (reglas del proyecto) 
- **Controller** → Vistas de Django (las que responden al frontend)

**Cómo trabajar en backend:** 
1. Entra a la carpeta `apps/backend` 
2. Crea tus apps con: `python manage.py startapp nombre_app` 
3. Organiza cada app así:    - `models.py` → Model    - `repository.py` → Repository    - `services.py` → Service    - `views.py` → Controller

## Cómo empezar a trabajar

1. Clona el repositorio 
2. Cambia a la rama `desarrollo` y actualiza (git checkout desarrollo  -  git pull) 
3. Trabaja en tu rama personal (`git checkout -b feature/c1-actores` por ejemplo) 
4. Sube tu rama (git push) y se hace Pull Request hacia `desarrollo`

**Reglas importantes:** 
- Nunca hagas push directo a `produccion` 
- Siempre haz commit con mensajes claros (`feat:`, `fix:`, `refactor:`)

