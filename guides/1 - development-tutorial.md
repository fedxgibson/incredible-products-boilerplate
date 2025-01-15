# Guía Detallada: Implementación de User Story con Clean Architecture y TDD

## User Story de Ejemplo
```
Como usuario
Quiero crear una tarea en mi lista de TODOs
Para poder gestionar mis actividades pendientes

Criterios de Aceptación:
- La tarea debe tener un título obligatorio de al menos 3 caracteres
- La tarea debe tener una descripción opcional
- La tarea se crea con estado "pendiente" por defecto
- Se debe retornar error si el título no cumple con los requisitos
```

## Desarrollo Bottom-Up Detallado

### 1. Entities (Entidades)
**¿Qué son?**
- Son las clases que representan los objetos principales de tu negocio
- Contienen las reglas de negocio críticas
- No dependen de ninguna otra capa de la aplicación

**¿Por qué empezamos aquí?**
- Son el núcleo de la aplicación
- No tienen dependencias externas
- Definen las reglas fundamentales del negocio

**Implementación Paso a Paso:**

1. **Primero, escribimos el test**:
```javascript
// domain/entities/__tests__/Task.test.js
describe('Task Entity', () => {
  describe('Task Creation', () => {
    test('should create a valid task with all properties', () => {
      const taskProps = {
        title: 'Completar informe',
        description: 'Informe mensual de ventas'
      }
      
      const task = Task.create(taskProps)
      
      // Verificamos todas las propiedades
      expect(task.id).toBeDefined()
      expect(task.title).toBe(taskProps.title)
      expect(task.description).toBe(taskProps.description)
      expect(task.status).toBe('pending')
      expect(task.createdAt).toBeInstanceOf(Date)
    })

    test('should create a task with minimal properties', () => {
      const task = Task.create({ title: 'Solo título' })
      
      expect(task.title).toBe('Solo título')
      expect(task.description).toBe('')  // Valor por defecto
    })
  })

  describe('Task Validation', () => {
    test('should throw error if title is missing', () => {
      expect(() => {
        Task.create({})
      }).toThrow('Title is required')
    })

    test('should throw error if title is too short', () => {
      expect(() => {
        Task.create({ title: 'ab' })
      }).toThrow('Title must be at least 3 characters')
    })
  })
})
```

2. **Luego, implementamos la entidad**:
```javascript
// domain/entities/Task.js
class Task {
  constructor(props) {
    // Valores requeridos
    if (!props.title) {
      throw new Error('Title is required')
    }
    
    // Asignación de propiedades
    this.id = crypto.randomUUID()
    this.title = props.title
    this.description = props.description || ''  // Valor por defecto si no se proporciona
    this.status = 'pending'  // Estado inicial siempre es pending
    this.createdAt = new Date()
    
    // Validaciones de negocio
    this.validate()
  }

  static create(props) {
    return new Task(props)
  }

  validate() {
    // Reglas de negocio
    if (this.title.length < 3) {
      throw new Error('Title must be at least 3 characters')
    }
  }

  // Métodos de negocio
  complete() {
    this.status = 'completed'
  }

  reopen() {
    this.status = 'pending'
  }
}

module.exports = Task
```

**Puntos Clave de la Entidad:**
- Usa un método estático `create` como factory
- Implementa validaciones en el constructor y en método separado
- Define métodos que representan acciones del negocio
- No tiene dependencias externas
- Es fácil de testear

### 2. Use Cases (Casos de Uso)
**¿Qué son?**
- Implementan la lógica de negocio específica
- Coordinan el flujo entre entidades y repositorios
- Representan las acciones que el usuario puede realizar

**¿Por qué son importantes?**
- Encapsulan la lógica de negocio
- Hacen la aplicación más mantenible
- Facilitan el testing de flujos completos

**Implementación Paso a Paso:**

1. **Primero, el test del caso de uso:**
```javascript
// application/usecases/__tests__/CreateTask.test.js
describe('CreateTaskUseCase', () => {
  let mockTaskRepo
  let createTaskUseCase

  beforeEach(() => {
    // Preparar el mock del repositorio
    mockTaskRepo = {
      save: jest.fn().mockResolvedValue(undefined)
    }
    createTaskUseCase = new CreateTaskUseCase(mockTaskRepo)
  })

  describe('Success cases', () => {
    test('should create a task with all properties', async () => {
      // Arrange
      const taskData = {
        title: 'Nueva tarea',
        description: 'Descripción detallada'
      }

      // Act
      const result = await createTaskUseCase.execute(taskData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data.title).toBe(taskData.title)
      expect(result.data.description).toBe(taskData.description)
      expect(mockTaskRepo.save).toHaveBeenCalled()
    })

    test('should create a task with minimal properties', async () => {
      const result = await createTaskUseCase.execute({
        title: 'Solo título'
      })

      expect(result.success).toBe(true)
      expect(result.data.description).toBe('')
    })
  })

  describe('Error cases', () => {
    test('should return error for invalid title', async () => {
      const result = await createTaskUseCase.execute({
        title: 'ab'  // Título muy corto
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Title must be at least 3 characters')
      expect(mockTaskRepo.save).not.toHaveBeenCalled()
    })

    test('should handle repository errors', async () => {
      // Simular error en el repositorio
      mockTaskRepo.save.mockRejectedValue(new Error('DB Error'))

      const result = await createTaskUseCase.execute({
        title: 'Tarea válida'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Error creating task: DB Error')
    })
  })
})
```

2. **Luego, la implementación del caso de uso:**
```javascript
// application/usecases/CreateTask.js
class CreateTaskUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository
  }

  /**
   * Ejecuta el caso de uso de crear tarea
   * @param {Object} request - Datos de la tarea
   * @param {string} request.title - Título de la tarea
   * @param {string} [request.description] - Descripción opcional
   * @returns {Promise<Object>} Resultado de la operación
   */
  async execute(request) {
    try {
      // 1. Crear la entidad (esto validará los datos)
      const task = Task.create({
        title: request.title,
        description: request.description
      })

      // 2. Persistir la tarea
      await this.taskRepository.save(task)

      // 3. Retornar resultado exitoso
      return {
        success: true,
        data: task
      }
    } catch (error) {
      // 4. Manejar errores
      return {
        success: false,
        error: error.message.includes('DB Error') 
          ? `Error creating task: ${error.message}`
          : error.message
      }
    }
  }
}

module.exports = CreateTaskUseCase
```

**Puntos Clave del Caso de Uso:**
- Recibe dependencias por constructor
- Maneja errores de forma consistente
- Retorna resultados estructurados
- Se centra en un único flujo de negocio

### 3. Controllers (Controladores)
**¿Qué son?**
- Adaptan las peticiones HTTP a los casos de uso
- Manejan la validación de entrada
- Transforman las respuestas del caso de uso al formato HTTP

**¿Por qué son necesarios?**
- Separan la lógica de HTTP de la lógica de negocio
- Manejan detalles específicos del protocolo
- Estandarizan las respuestas de la API

**Implementación:**

1. **Test del controlador:**
```javascript
// interfaces/controllers/__tests__/TaskController.test.js
describe('TaskController', () => {
  let mockCreateTaskUseCase
  let taskController
  let mockRequest
  let mockResponse

  beforeEach(() => {
    // Mock del caso de uso
    mockCreateTaskUseCase = {
      execute: jest.fn()
    }

    // Mock de request/response
    mockRequest = {
      body: {}
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    taskController = new TaskController(mockCreateTaskUseCase)
  })

  describe('createTask', () => {
    test('should return 201 when task is created', async () => {
      // Arrange
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      }
      mockRequest.body = taskData
      mockCreateTaskUseCase.execute.mockResolvedValue({
        success: true,
        data: { ...taskData, id: '123' }
      })

      // Act
      await taskController.createTask(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: expect.objectContaining(taskData)
      })
    })

    test('should return 400 when validation fails', async () => {
      // Arrange
      mockRequest.body = { title: 'ab' }
      mockCreateTaskUseCase.execute.mockResolvedValue({
        success: false,
        error: 'Title must be at least 3 characters'
      })

      // Act
      await taskController.createTask(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Title must be at least 3 characters'
      })
    })
  })
})
```

2. **Implementación del controlador:**
```javascript
// interfaces/controllers/TaskController.js
class TaskController {
  constructor(createTaskUseCase) {
    this.createTaskUseCase = createTaskUseCase
  }

  /**
   * Maneja la creación de una nueva tarea
   * @param {Express.Request} req - Request de Express
   * @param {Express.Response} res - Response de Express
   */
  async createTask(req, res) {
    try {
      // 1. Extraer datos del request
      const { title, description } = req.body

      // 2. Ejecutar caso de uso
      const result = await this.createTaskUseCase.execute({
        title,
        description
      })

      // 3. Manejar respuesta
      if (result.success) {
        res.status(201).json({
          data: result.data
        })
      } else {
        res.status(400).json({
          error: result.error
        })
      }
    } catch (error) {
      // 4. Manejar errores inesperados
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
}

module.exports = TaskController
```

**Puntos Clave del Controlador:**
- Maneja aspectos HTTP específicos
- Traduce entre HTTP y dominio
- Maneja errores de forma apropiada
- Mantiene respuestas consistentes

### 4. Routes (Rutas)
**¿Qué son?**
- Definen los endpoints de la API
- Conectan URLs con controladores
- Configuran middleware específico de rutas

**Implementación:**
```javascript
// frameworks/web/routes/task.routes.js
const express = require('express')

function setupTaskRoutes(router, taskController) {
  // Middleware de validación básica
  const validateTaskBody = (req, res, next) => {
    if (!req.body || !req.body.title) {
      return res.status(400).json({
        error: 'Title is required'
      })
    }
    next()
  }

  // Rutas
  router.post(
    '/tasks', 
    validateTaskBody,
    (req, res) => taskController.createTask(req, res)
  )

  return router
}

module.exports = setup
```

### 5. Repository
**¿Qué es?**
- Definen cómo se accederá a los datos

**¿Por qué es importante?**
- Maneja la persistencia real de los datos

**Implementación Paso a Paso:**

1. **Primero, el test del repositorio:**
```javascript
// frameworks/mongodb/__tests__/MongoTaskRepository.test.js
describe('MongoTaskRepository', () => {
  let mongoClient
  let taskRepo
  let collection

  beforeAll(async () => {
    // Conectar a MongoDB de test
    mongoClient = await MongoClient.connect(process.env.MONGO_URL)
    const db = mongoClient.db('test')
    collection = db.collection('tasks')
    taskRepo = new MongoTaskRepository(db)
  })

  beforeEach(async () => {
    // Limpiar colección antes de cada test
    await collection.deleteMany({})
  })

  afterAll(async () => {
    await mongoClient.close()
  })

  describe('save', () => {
    test('should save task to database', async () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Test Description'
      })

      // Act
      await taskRepo.save(task)

      // Assert
      const savedTask = await collection.findOne({ id: task.id })
      expect(savedTask).toBeDefined()
      expect(savedTask.title).toBe(task.title)
    })

    test('should throw error if database fails', async () => {
      // Arrange
      const task = Task.create({ title: 'Test Task' })
      const invalidRepo = new MongoTaskRepository(null)

      // Act & Assert
      await expect(invalidRepo.save(task))
        .rejects
        .toThrow('Database error')
    })
  })

  describe('findById', () => {
    test('should return task if found', async () => {
      // Arrange
      const task = Task.create({ title: 'Test Task' })
      await collection.insertOne(task)

      // Act
      const foundTask = await taskRepo.findById(task.id)

      // Assert
      expect(foundTask).toBeDefined()
      expect(foundTask.id).toBe(task.id)
    })

    test('should return null if task not found', async () => {
      const result = await taskRepo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })
})
```

2. **Implementación del repositorio:**
```javascript
// frameworks/mongodb/MongoTaskRepository.js
class MongoTaskRepository extends TaskRepository {
  /**
   * @param {Db} database - Instancia de base de datos MongoDB
   */
  constructor(database) {
    super()
    this.database = database
    this.collection = database.collection('tasks')
  }

  /**
   * Guarda una tarea en MongoDB
   * @param {Task} task - Tarea a guardar
   */
  async save(task) {
    try {
      await this.collection.insertOne({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt
      })
    } catch (error) {
      throw new Error(`Database error: ${error.message}`)
    }
  }

  /**
   * Busca una tarea por ID
   * @param {string} id - ID de la tarea
   * @returns {Promise<Task|null>}
   */
  async findById(id) {
    try {
      const doc = await this.collection.findOne({ id })
      return doc ? Task.create(doc) : null
    } catch (error) {
      throw new Error(`Database error: ${error.message}`)
    }
  }

  /**
   * Obtiene todas las tareas
   * @returns {Promise<Task[]>}
   */
  async findAll() {
    try {
      const docs = await this.collection.find().toArray()
      return docs.map(doc => Task.create(doc))
    } catch (error) {
      throw new Error(`Database error: ${error.message}`)
    }
  }

  /**
   * Actualiza una tarea existente
   * @param {Task} task - Tarea a actualizar
   */
  async update(task) {
    try {
      await this.collection.updateOne(
        { id: task.id },
        { $set: {
          title: task.title,
          description: task.description,
          status: task.status
        }}
      )
    } catch (error) {
      throw new Error(`Database error: ${error.message}`)
    }
  }
}
```

**Puntos Clave del Repositorio MongoDB:**
- Extiende la interfaz TaskRepository
- Maneja errores específicos de la base de datos
- Convierte entre documentos MongoDB y entidades
- Implementa todas las operaciones CRUD necesarias

### 6. App Setup (Configuración de la Aplicación)
**¿Qué es?**
- Es el punto donde se conectan todas las capas
- Configura la aplicación y sus dependencias
- Inicializa servicios externos

**Implementación:**

1. **Configuración de Express:**
```javascript
// frameworks/express/app.js
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

function setupExpress() {
  const app = express()

  // Middleware básico
  app.use(cors())
  app.use(morgan('dev'))
  app.use(express.json())
  
  // Middleware de error global
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
      error: 'Something broke!'
    })
  })

  return app
}

module.exports = setupExpress
```

2. **Configuración de MongoDB:**
```javascript
// frameworks/mongodb/connection.js
const { MongoClient } = require('mongodb')

class MongoConnection {
  constructor(url) {
    this.url = url
    this.client = null
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(this.url)
      console.log('Connected to MongoDB')
      return this.client
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw error
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      console.log('Disconnected from MongoDB')
    }
  }
}

module.exports = MongoConnection
```

3. **Composición de la Aplicación:**
```javascript
// app/index.js
class Application {
  constructor(config) {
    this.config = config
    this.express = null
    this.mongo = null
  }

  async setup() {
    try {
      // 1. Configurar MongoDB
      this.mongo = new MongoConnection(this.config.mongoUrl)
      const client = await this.mongo.connect()
      const database = client.db(this.config.dbName)

      // 2. Crear instancias de las capas
      const taskRepo = new MongoTaskRepository(database)
      const createTaskUseCase = new CreateTaskUseCase(taskRepo)
      const taskController = new TaskController(createTaskUseCase)

      // 3. Configurar Express y rutas
      this.express = setupExpress()
      const router = express.Router()
      setupTaskRoutes(router, taskController)
      this.express.use('/api', router)

      return this.express
    } catch (error) {
      console.error('Application setup failed:', error)
      throw error
    }
  }

  async shutdown() {
    await this.mongo?.disconnect()
  }
}

module.exports = Application
```

**Puntos Clave de la Configuración:**
- Maneja la inyección de dependencias
- Configura servicios externos
- Maneja el ciclo de vida de la aplicación
- Proporciona métodos de inicio y apagado

### 7. Entry Point (Punto de Entrada)
**¿Qué es?**
- El archivo principal que inicia la aplicación
- Maneja la configuración del entorno
- Inicia el servidor HTTP

**Implementación:**
```javascript
// index.js
require('dotenv').config()
const Application = require('./app')

// Configuración de la aplicación
const config = {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'todoapp'
}

async function startServer() {
  const app = new Application(config)
  
  try {
    // Configurar manejo de señales de terminación
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received')
      await app.shutdown()
      process.exit(0)
    })

    // Iniciar la aplicación
    const express = await app.setup()

    // Iniciar el servidor HTTP
    const server = express.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`)
    })

    // Manejar errores del servidor
    server.on('error', (error) => {
      console.error('Server error:', error)
      process.exit(1)
    })

  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Iniciar la aplicación
startServer()
```

**Puntos Clave del Entry Point:**
- Carga variables de entorno
- Maneja señales del sistema operativo
- Configura logging y manejo de errores
- Proporciona una salida limpia

## Conclusiones y Mejores Prácticas

### Estructura de Directorios
```
src
├── app.js
├── entities
│   └── user.js
├── frameworks
│   ├── mongodb
│   │   └── connection.js
│   └── web
│       └── routes
│           └── user-routes.js
├── interfaces
│   ├── controllers
│   │   ├── auth-controller.js
│   │   └── user-controller.js
│   └── repositories
│       └── user-repository.js
└── use-cases
    ├── auth
    │   └── login-user.js
    └── user
        └── create-user.js



```

### Flujo de Desarrollo TDD
1. **Planificación**:
   - Entender los requisitos de la user story
   - Identificar las entidades y casos de uso
   - Diseñar las interfaces necesarias

2. **Desarrollo**:
   - Comenzar por las entidades y sus tests
   - Implementar casos de uso con TDD
   - Crear la infraestructura necesaria
   - Integrar todas las capas

3. **Testing**:
   - Tests unitarios para cada capa
   - Tests de integración para flujos completos
   - Tests end-to-end para APIs

### Consejos Finales
1. **Manejo de Errores**:
   - Crear tipos de error específicos del dominio
   - Manejar errores en cada capa apropiadamente
   - Mantener mensajes de error consistentes

2. **Logging**:
   - Implementar logging en cada capa
   - Usar diferentes niveles de log
   - Incluir información contextual relevante

3. **Documentación**:
   - Mantener README actualizado
   - Documentar APIs con JSDoc
   - Incluir ejemplos de uso

4. **Monitoreo**:
   - Implementar health checks
   - Monitorear performance
   - Registrar métricas importantes