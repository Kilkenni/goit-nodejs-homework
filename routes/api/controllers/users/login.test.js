const login = require("./login");
const userOps = require('../../../../models/users');

describe("test routes/api/users/login controller", () => {

  const mockedUser = {
    email: "user@email.com",
    subscription: "subscriptionType",
    token: "someToken",
  }
  userOps.loginUser = jest.fn(() => Promise.resolve(mockedUser));

  const mockNext = jest.fn((error) => { throw error });
  const mockReq = {body: {
      email: "user@email.com",
      password: "userPassword",
    }
  }
  let mockRes = {
    status: jest.fn((code) => code).mockReturnThis(),
    json: jest.fn((data) => data),
  };
  
  test("successful login", async () => {
    const result = await login(mockReq, mockRes, mockNext);
    console.log(result);

    expect(mockRes.status).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(result.token).toBeDefined();
    expect(result).toHaveProperty(["user", "email"]);
    expect(result).toHaveProperty(["user", "subscription"]);
    expect(typeof result.user.email).toBe("string");
    expect(typeof result.user.subscription).toBe("string");
  });    
});