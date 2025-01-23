# GitHub Workflow con Pull Requests

## Flujo de Trabajo

### 1. Nueva Funcionalidad

```bash
# Actualizar develop local
git checkout develop
git pull origin develop

# Crear feature branch
git checkout -b feature/login

# Desarrollar y commitear
git add .
git commit -m "feat: add login form"

# Subir cambios a GitHub
git push origin feature/login
```

### 2. Crear Pull Request (PR)

1. Ve a GitHub > repositorio > Pull requests
2. Click "New Pull Request"
3. Base: develop ← Compare: feature/login
4. Rellena el template:

```markdown
## Descripción
Implementación de formulario de login con:
- Validación de campos
- Integración con API
- Manejo de errores

## Pruebas
1. Ir a /login
2. Probar credenciales válidas/inválidas
3. Verificar mensajes de error

## Screenshots
[Imagen del formulario]

## Ticket
PROJ-123
```

### 3. Durante la Review

```bash
# Si hay comentarios para resolver:
git add .
git commit -m "fix: address PR comments"
git push origin feature/login

# Si develop avanzó, actualizar tu rama:
git checkout develop
git pull origin develop
git checkout feature/login
git merge develop
git push origin feature/login
```

### 4. Merge del PR

Una vez aprobado:
1. En GitHub, click "Merge pull request"
2. Seleccionar tipo de merge:
   - Merge commit: mantiene historial
   - Squash: combina commits en uno
   - Rebase: historial lineal

```bash
# Actualizar local después del merge
git checkout develop
git pull origin develop
git branch -d feature/login
```

## Buenas Prácticas

### PRs Efectivos
- Mantener cambios pequeños y focalizados
- Incluir contexto y documentación
- Responder comentarios con prontitud
- Usar Draft PR para trabajo en progreso

### Commits
```bash
feat: add login functionality
fix: correct email validation
docs: update README with API endpoints
style: format login component
```

### Review
- Esperar al menos una aprobación
- Resolver todos los comentarios
- Verificar CI/tests pasen
- Mantener rama actualizada con develop

## Configuración de Repo
- Proteger rama develop
- Requerir reviews antes de merge
- Habilitar GitHub Actions
- Configurar templates:
  - PR template
  - Issue template
  - Bug report template

## Tips
- Usar labels en PRs
- Linkear issues/tickets
- Asignar reviewers relevantes
- Comentar líneas específicas
- Usar sugerencias de código en reviews