module.exports = class UserController {
  constructor(createUserUseCase) {
    this.createUserUseCase = createUserUseCase;
  }

  async createUser(req, res) {
    try {
      const user = await this.createUserUseCase.execute({
        name: req.body.name,
        email: req.body.email,
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
