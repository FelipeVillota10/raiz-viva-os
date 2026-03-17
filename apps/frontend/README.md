# Raíz Viva OS - Guía para el Equipo

## Frontend (Next.js) - Patrón **MVVM**

Usaremos el patrón **MVVM** (Model - View - ViewModel). Es muy sencillo y moderno:

- **Model** → Los datos (lo que viene del backend) 
- **View** → Lo que ve el usuario (las pantallas, componentes) 
- **ViewModel** → La lógica intermedia (conecta el Model con la View)

**Cómo trabajar en frontend:** 
1. Entra a la carpeta `apps/frontend` 
2. Crea o modifica componentes en la carpeta `app/` o `components/` 
3. Usa **ViewModels** (hooks o archivos separados) para manejar la lógica

**Ejemplo simple:** 
- `View` = Página de login 
- `ViewModel` = Lógica de validación y llamada al backend 
- `Model` = Datos del usuario

## Cómo empezar a trabajar

1. Clona el repositorio 
2. Cambia a la rama `desarrollo` y actualiza (git checkout desarrollo  -  git pull) 
3. Trabaja en tu rama personal (`git checkout -b feature/c1-actores` por ejemplo) 
4. Sube tu rama (git push) y se hace Pull Request hacia `desarrollo`

**Reglas importantes:** 
- Nunca hagas push directo a `produccion` 
- Siempre haz commit con mensajes claros (`feat:`, `fix:`, `refactor:`)

