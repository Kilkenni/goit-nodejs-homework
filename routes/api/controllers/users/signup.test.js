const signup = require("./signup");
const userOps = require('../../../../models/users');

describe("test users signup controller - Registration", () => {

  const mockedUser = {
    email: "user@email.com",
    subscription: "subscriptionType",
  }
  userOps.registerUser = jest.fn(() => Promise.resolve(mockedUser));

  const mockNext = jest.fn((error) => { throw error });
  const mockReq = {body: {
      email: "user@email.com",
      password: "userPassword",
      subscription: "subscriptionType",
    }
  }
  let mockRes = {
    status: jest.fn((code) => code).mockReturnThis(),
    json: jest.fn((data) => data),
  };
  
  test("Successful registration", async () => {
    const result = await signup(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(result.token).toBeUndefined();
    expect(result).toHaveProperty("user.email");
    expect(result).toHaveProperty("user.subscription");
    expect(result.user.password).toBeUndefined();
    expect(typeof result.user.email).toBe("string");
    expect(typeof result.user.subscription).toBe("string");
    expect(mockNext).toHaveBeenCalledTimes(0); //expect no errors
  });    
});