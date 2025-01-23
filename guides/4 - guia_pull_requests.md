# Guía de Code Review para Desarrolladores Junior

## ¿Qué es un Code Review?
Un code review es una práctica donde otros desarrolladores revisan tu código antes de que se integre al proyecto principal. Es como tener a un profesor revisando tu tarea antes de entregarla.

## ¿Por qué es importante?
- Encuentra bugs temprano
- Mejora la calidad del código
- Comparte conocimiento en el equipo
- Asegura que el código sigue los estándares del proyecto
- Ayuda a aprender mejores prácticas

## El proceso en GitHub

### 1. Crear un Pull Request (PR)
- Terminas tu código en tu rama
- Vas a GitHub y clickeas "New Pull Request"
- Seleccionas tu rama y la rama destino (usualmente main o develop)
- Rellenas el título y descripción explicando tus cambios

### 2. Descripción del PR
Debe incluir:
- Qué cambios hiciste
- Por qué los hiciste
- Cómo probar los cambios
- Screenshots si son cambios visuales
- Links a tickets relacionados

Ejemplo:
```markdown
# Añadir página de login
- Implementé formulario de login con email y contraseña
- Agregué validaciones de campos
- Integré con la API de autenticación

## Cómo probar
1. Ir a /login
2. Intentar login con credenciales válidas
3. Verificar redirección a dashboard

## Screenshots
[imagen del formulario]

## Ticket
PROJ-123
```

### 3. Durante la revisión

#### Como autor:
- Responde a los comentarios con amabilidad
- Explica tus decisiones técnicas
- Haz los cambios solicitados
- Marca los comentarios como resueltos
- Pide ayuda si algo no está claro

#### Como revisor:
- Sé respetuoso en los comentarios
- Explica el por qué de tus sugerencias
- Diferencia entre sugerencias obligatorias y opcionales
- Revisa:
  - Funcionalidad
  - Seguridad
  - Performance
  - Tests
  - Legibilidad
  - Estándares del proyecto

### 4. Comentarios efectivos

#### Mal ejemplo:
```
Esto está mal. Cámbialo.
```

#### Buen ejemplo:
```
Sugiero usar map() en lugar de for aquí porque:
1. Es más legible
2. Evita mutación de variables
3. Es más funcional

Ejemplo:
const newArray = items.map(item => item.value);
```

## Tips para Juniors

### Como autor:
1. No tomes los comentarios personal - son sobre el código, no sobre ti
2. Aprovecha para aprender de las sugerencias
3. Pregunta si no entiendes algo
4. Haz PRs pequeños (más fáciles de revisar)
5. Testea bien antes de pedir review

### Como revisor:
1. Empieza con reviews pequeños
2. Pregunta si no entiendes algo
3. Usa la opción "Suggest" para proponer código
4. Aprende de cómo otros hacen reviews
5. Balanza críticas con aspectos positivos

## Señales de un buen PR
- Cambios focalizados y pequeños
- Buena descripción y documentación
- Tests que pasan
- Código limpio y legible
- Sigue las convenciones del proyecto
- Resuelve el problema planteado