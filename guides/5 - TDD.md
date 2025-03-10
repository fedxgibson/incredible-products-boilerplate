# Guía Completa de TDD con Jest para Desarrolladores Junior

## Índice
1. [Introducción al TDD](#introducción-al-tdd)
2. [El Ciclo Red-Green-Refactor](#el-ciclo-red-green-refactor)
3. [Configuración de Jest](#configuración-de-jest)
4. [Anatomía de una Prueba con Jest](#anatomía-de-una-prueba-con-jest)
5. [Matchers de Jest](#matchers-de-jest)
6. [Mocks y Spies](#mocks-y-spies)
7. [Ejercicios Prácticos](#ejercicios-prácticos)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Recursos Adicionales](#recursos-adicionales)

## Introducción al TDD

Test-Driven Development (TDD) es una metodología de desarrollo que invierte el proceso de programación tradicional. En lugar de escribir primero el código de la aplicación y después las pruebas, TDD propone comenzar por las pruebas y luego desarrollar el código que las satisfaga.

### Beneficios del TDD

- **Código más limpio y mantenible**: Al escribir pruebas primero, naturalmente diseñarás componentes más modulares.
- **Documentación viva**: Las pruebas sirven como documentación ejecutable que nunca queda desactualizada.
- **Menos bugs**: Los problemas se detectan temprano en el proceso de desarrollo.
- **Refactorización segura**: Las pruebas te permiten mejorar tu código con confianza.
- **Diseño dirigido por interfaces**: Te obliga a pensar en cómo usarás el código antes de escribirlo.

## El Ciclo Red-Green-Refactor

TDD se basa en un ciclo de tres pasos:

### 1. Red (Rojo)
- Escribe una prueba que defina una función o mejora que deseas implementar.
- Ejecuta la prueba, que debe fallar porque la funcionalidad aún no existe.

### 2. Green (Verde)
- Escribe el código mínimo necesario para que la prueba pase.
- No te preocupes por la elegancia o la eficiencia en este punto.
- El objetivo es hacer que la prueba pase de la forma más sencilla posible.

### 3. Refactor (Refactorizar)
- Mejora el código (elimina duplicaciones, mejora nombres, etc.).
- Asegúrate de que todas las pruebas siguen pasando.

![Ciclo TDD](https://upload.wikimedia.org/wikipedia/commons/0/0b/TDD_Global_Lifecycle.png)

## Configuración de Jest

Jest es un framework de pruebas para JavaScript que funciona muy bien con proyectos Node.js, React, Vue, Angular, y otros.

### Instalación Básica

```bash
# Crear un nuevo proyecto (si no tienes uno)
mkdir mi-proyecto-tdd
cd mi-proyecto-tdd
npm init -y

# Instalar Jest
npm install --save-dev jest
```

### Configuración en package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Estructura de Archivos Recomendada

```
mi-proyecto/
├── src/
│   ├── calculadora.js
│   └── usuario.js
└── tests/
    ├── calculadora.test.js
    └── usuario.test.js
```

También puedes colocar los archivos de prueba junto a los archivos que prueban:

```
mi-proyecto/
└── src/
    ├── calculadora.js
    ├── calculadora.test.js
    ├── usuario.js
    └── usuario.test.js
```

## Anatomía de una Prueba con Jest

### Estructura Básica

```javascript
// suma.test.js
const suma = require('../src/suma');

// Función de prueba individual con async/await
test('suma 1 + 2 igual a 3', async () => {
  expect(suma(1, 2)).toBe(3);
});

// Agrupación de pruebas relacionadas
describe('Funciones matemáticas', () => {
  
  // Configuración que se ejecuta antes de cada prueba
  beforeEach(async () => {
    // Preparar el entorno para cada prueba
  });
  
  test('suma números positivos correctamente', async () => {
    expect(suma(1, 2)).toBe(3);
  });
  
  test('suma números negativos correctamente', async () => {
    expect(suma(-1, -2)).toBe(-3);
  });
});
```

### Patrones para Organizar Pruebas

#### Patrón AAA (Arrange-Act-Assert)

```javascript
test('debe actualizar el nombre del usuario', async () => {
  // Arrange (Preparar)
  const usuario = new Usuario('Juan');
  
  // Act (Actuar)
  await usuario.actualizarNombre('Pedro');
  
  // Assert (Verificar)
  expect(usuario.nombre).toBe('Pedro');
});
```

## Matchers de Jest

Los matchers son funciones que permiten verificar valores de diferentes maneras:

### Igualdad

```javascript
expect(2 + 2).toBe(4);               // Igualdad exacta (===)
expect({nombre: 'Juan'}).toEqual({nombre: 'Juan'});  // Igualdad profunda
expect({a: 1, b: 2}).toMatchObject({a: 1});          // Coincidencia parcial
```

### Verdad/Falsedad

```javascript
expect(true).toBeTruthy();
expect(false).toBeFalsy();
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('algo').toBeDefined();
```

### Números

```javascript
expect(2).toBeGreaterThan(1);
expect(1).toBeLessThan(2);
expect(1.5).toBeCloseTo(1.5001, 3);  // Aproximación decimal
```

### Strings

```javascript
expect('Hola mundo').toMatch(/mundo/);
expect('Hola mundo').toContain('mundo');
```

### Arrays

```javascript
expect([1, 2, 3]).toContain(2);
expect([{a: 1}, {b: 2}]).toContainEqual({a: 1});
```

### Excepciones

```javascript
expect(() => {
  throw new Error('Error de prueba');
}).toThrow();

expect(() => {
  throw new Error('Error específico');
}).toThrow('Error específico');
```

## Mocks y Spies

Los mocks y spies son herramientas para simular dependencias y verificar interacciones.

### Funciones Mock

```javascript
test('debe llamar al callback', async () => {
  // Crear una función mock
  const mockCallback = jest.fn();
  
  // Usar la función
  await funcionQueUsaCallback(mockCallback);
  
  // Verificar que la función fue llamada
  expect(mockCallback).toHaveBeenCalled();
  
  // Verificar cuántas veces fue llamada
  expect(mockCallback).toHaveBeenCalledTimes(1);
  
  // Verificar con qué argumentos fue llamada
  expect(mockCallback).toHaveBeenCalledWith('argumento');
});
```

### Simulación de Módulos

```javascript
// Simular un módulo completo
jest.mock('./servicioApi');

// Importar el módulo simulado
const servicioApi = require('./servicioApi');

// Configurar el comportamiento del mock
servicioApi.obtenerDatos.mockResolvedValue({id: 1, nombre: 'Ana'});

test('debe obtener datos del usuario', async () => {
  const datos = await servicioApi.obtenerDatos();
  expect(datos).toEqual({id: 1, nombre: 'Ana'});
});
```

### Spies (Espías)

```javascript
test('debe registrar una acción', async () => {
  // Crear un espía sobre un método existente
  const espia = jest.spyOn(console, 'log');
  
  // Ejecutar código que usa el método
  await registrarAccion('login');
  
  // Verificar que el método fue llamado
  expect(espia).toHaveBeenCalledWith('Acción registrada: login');
  
  // Restaurar la implementación original
  espia.mockRestore();
});
```

## Ejercicios Prácticos

### Ejercicio 1: Validador de Contraseñas

Implementa un validador de contraseñas siguiendo TDD que verifique:
- Longitud mínima de 8 caracteres
- Al menos una letra mayúscula
- Al menos un número
- Al menos un carácter especial

```javascript
// passwordValidator.test.js
const validarPassword = require('./passwordValidator');

describe('Validador de contraseñas', () => {
  test('debe rechazar contraseñas menores a 8 caracteres', async () => {
    expect(await validarPassword('Abc1!')).toBe(false);
  });

  test('debe rechazar contraseñas sin letras mayúsculas', async () => {
    expect(await validarPassword('abcdefg1!')).toBe(false);
  });

  test('debe rechazar contraseñas sin números', async () => {
    expect(await validarPassword('Abcdefgh!')).toBe(false);
  });

  test('debe rechazar contraseñas sin caracteres especiales', async () => {
    expect(await validarPassword('Abcdefg1')).toBe(false);
  });

  test('debe aceptar contraseñas que cumplen todos los requisitos', async () => {
    expect(await validarPassword('Abcdef1!')).toBe(true);
  });
});
```

### Ejercicio 2: Carrito de Compras

Implementa las siguientes funcionalidades para un carrito de compras:
- Añadir productos
- Eliminar productos
- Actualizar cantidades
- Calcular total
- Aplicar descuentos

```javascript
// shoppingCart.test.js
const ShoppingCart = require('./shoppingCart');

describe('Carrito de Compras', () => {
  let cart;
  
  beforeEach(async () => {
    cart = new ShoppingCart();
  });
  
  test('debe iniciar vacío', async () => {
    expect(cart.items.length).toBe(0);
    expect(cart.total).toBe(0);
  });
  
  test('debe añadir productos correctamente', async () => {
    await cart.addItem({ id: 1, name: 'Producto 1', price: 100 }, 2);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(2);
  });
  
  test('debe calcular el total correctamente', async () => {
    await cart.addItem({ id: 1, name: 'Producto 1', price: 100 }, 2);
    await cart.addItem({ id: 2, name: 'Producto 2', price: 200 }, 1);
    expect(await cart.getTotal()).toBe(400);
  });
  
  // Continúa con más pruebas...
});
```

## Mejores Prácticas

### 1. Mantén las Pruebas Simples y Enfocadas

Cada prueba debe verificar una única funcionalidad o comportamiento. Si una prueba es demasiado compleja, divídela en varias pruebas más pequeñas.

### 2. Usa Nombres Descriptivos

```javascript
// Mal
test('login', () => { /* ... */ });

// Bien
test('debe rechazar el login con credenciales incorrectas', () => { /* ... */ });
```

### 3. Evita Lógica Condicional en las Pruebas

Las pruebas deben ser deterministas. Evita usar if, for, o while en tus pruebas.

### 4. Usa Factories o Fixtures para Datos de Prueba

```javascript
async function crearUsuarioDePrueba(overrides = {}) {
  return {
    id: 1,
    nombre: 'Usuario Test',
    email: 'test@ejemplo.com',
    ...overrides
  };
}

test('actualización de email', async () => {
  const usuario = await crearUsuarioDePrueba();
  await usuario.actualizarEmail('nuevo@ejemplo.com');
  expect(usuario.email).toBe('nuevo@ejemplo.com');
});
```

### 5. No Pruebes Funcionalidades Externas

Concéntrate en probar tu código, no las bibliotecas que utilizas. Usa mocks para aislar tu código de dependencias externas.

### 6. Prioriza las Pruebas Unitarias

Las pruebas unitarias deben ser la mayoría de tus pruebas, complementadas con pruebas de integración y end-to-end.

### 7. Ejecuta las Pruebas con Frecuencia

Usa el modo watch de Jest para ejecutar pruebas automáticamente cuando cambias el código.

## Recursos Adicionales

- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)
- [TDD BY Example](https://github.com/GunterMueller/Books-3/blob/master/TDD%20By%20Example.pdf)

---

## Ejemplo Completo: Sistema de Autenticación

A continuación se muestra un ejemplo completo de TDD para un sistema de autenticación basado en uno de los diagramas de secuencia proporcionados:

### 1. Definición de Pruebas

```javascript
// authService.test.js
const AuthService = require('../src/authService');
const UserRepository = require('../src/userRepository');

// Mock del repositorio de usuarios
jest.mock('../src/userRepository');

describe('Servicio de Autenticación', () => {
  let authService;
  
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Crear una instancia nueva del servicio de autenticación
    authService = new AuthService(UserRepository);
  });
  
  test('debe validar credenciales correctas', async () => {
    // Preparar
    const username = 'usuario_test';
    const password = 'Contraseña123!';
    
    // Configurar el mock para devolver un usuario
    UserRepository.findByUsername.mockResolvedValue({
      id: 1,
      username,
      // Hash de 'Contraseña123!'
      password: '$2a$10$XpC7/SGiANP1mwKUNV9z3.YIWlZDcYVmAz7n6jjX4vqcU7ZzPq5Fq',
    });
    
    // Ejecutar
    const result = await authService.validateCredentials(username, password);
    
    // Verificar
    expect(result).toBe(true);
    expect(UserRepository.findByUsername).toHaveBeenCalledWith(username);
  });
  
  test('debe rechazar credenciales incorrectas', async () => {
    // Preparar
    const username = 'usuario_test';
    const password = 'ContraseñaIncorrecta';
    
    // Configurar el mock para devolver un usuario
    UserRepository.findByUsername.mockResolvedValue({
      id: 1,
      username,
      // Hash de 'Contraseña123!'
      password: '$2a$10$XpC7/SGiANP1mwKUNV9z3.YIWlZDcYVmAz7n6jjX4vqcU7ZzPq5Fq',
    });
    
    // Ejecutar
    const result = await authService.validateCredentials(username, password);
    
    // Verificar
    expect(result).toBe(false);
  });
  
  test('debe rechazar usuarios inexistentes', async () => {
    // Preparar
    const username = 'usuario_inexistente';
    const password = 'Contraseña123!';
    
    // Configurar el mock para devolver null (usuario no encontrado)
    UserRepository.findByUsername.mockResolvedValue(null);
    
    // Ejecutar
    const result = await authService.validateCredentials(username, password);
    
    // Verificar
    expect(result).toBe(false);
  });
  
  test('debe generar un token válido tras la autenticación', async () => {
    // Preparar
    const userId = 1;
    const username = 'usuario_test';
    
    // Ejecutar
    const token = await authService.generateAuthToken(userId, username);
    
    // Verificar
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
    
    // Verificar que el token contiene la información esperada
    const decodedToken = await authService.verifyToken(token);
    expect(decodedToken).toMatchObject({
      userId,
      username
    });
  });
});
```

### 2. Implementación

```javascript
// authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_de_desarrollo';

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async validateCredentials(username, password) {
    // Buscar usuario por nombre de usuario
    const user = await this.userRepository.findByUsername(username);
    
    // Si no existe el usuario, las credenciales son inválidas
    if (!user) {
      return false;
    }
    
    // Comparar la contraseña proporcionada con el hash almacenado
    return await bcrypt.compare(password, user.password);
  }
  
  async generateAuthToken(userId, username) {
    // Generar un token JWT que expire en 24 horas
    return jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
  
  async verifyToken(token) {
    // Verificar y decodificar un token
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
  
  async login(username, password) {
    // Validar credenciales
    const isValid = await this.validateCredentials(username, password);
    
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }
    
    // Obtener información del usuario
    const user = await this.userRepository.findByUsername(username);
    
    // Generar token de autenticación
    const token = await this.generateAuthToken(user.id, user.username);
    
    return {
      user: {
        id: user.id,
        username: user.username
      },
      token
    };
  }
}

module.exports = AuthService;
```
