# 🌱 Raíz Viva OS

Proyecto académico - Universidad del Valle

---

## Ramas del proyecto

- produccion → Rama principal (deploy a Vercel producción)
- desarrollo → Integración de todas las células
- pruebas → Testing y QA
- local / feature/* → Trabajo individual

*Flujo recomendado:*  
feature/celula x → desarrollo → pruebas → produccion

---

## ⚠️ Importante sobre el deploy

Por ahora *NO usaremos GitHub Actions compartidos* (porque eso haría que todo se despliegue solo en la cuenta de Felipe).

Cada uno debe conectar el repositorio a su propia cuenta de Vercel (es muy fácil):

1. Crea tu cuenta en https://vercel.com  
2. *New Project* → *Import Git Repository* → raiz-viva-os  
3. *Frontend:* Root Directory = apps/frontend  
4. *Backend:* Root Directory = apps/backend  

Así cada uno tendrá su propio entorno y previews personales.

Más adelante, cuando el proyecto esté más avanzado, podemos configurar CI/CD compartido.
