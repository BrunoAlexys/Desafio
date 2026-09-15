// Mock global do TypeORM DataSource para evitar referências circulares e
// inicialização do banco de dados nos testes unitários
jest.mock("../../config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    }),
    initialize: jest.fn(),
    isInitialized: true,
  },
}));
