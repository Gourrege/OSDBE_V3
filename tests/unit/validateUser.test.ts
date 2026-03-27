import { createDriverSchema } from "../../src/models/drivers";

const validDriver = {
    "name": "Lando Norris",
    "email": "lando@example.com",
    "password": "secret123",
    "role": "viewer",
    "status": "active",
    "racingNumber": 4,
    "nationality": "British",
    "driverImage": "https://cdn-3.motorsport.com/images/mgl/Y99BbQG0/s8/lando-norris-mclaren-1.jpg",
    "driverTeam": "McLaren",
    "driverDES": "Quick and composed racer with excellent qualifying pace and strong racecraft.",
    "wins": "3",
    "podiums": "22",
    "driverWC": "0",
    "dob": "1999/11/13"
}

// -- Validation for the Driver Name Length must be a minimun of 3 characters --

describe("Name Validation", () => {
  it("should pass when name has minimum length", () => {
    expect(() =>
      createDriverSchema.parse({
        ...validDriver,
        name: "Max", // 3 characters; adjust if your min is different
      })
    ).not.toThrow();
  });

  it("should fail when name is too short", () => {
    expect(() =>
      createDriverSchema.parse({
        ...validDriver,
        name: "A", // shorter than min
      })
    ).toThrow();
  });

  it("should fail when name is empty", () => {
    expect(() =>
      createDriverSchema.parse({
        ...validDriver,
        name: "",
      })
    ).toThrow();
  });
});

// -- Validation for the Driver Number, That it must be a number

describe("Racing Number Validation (strict number)", () => {
  it("should pass when racingNumber is a number", () => {
    expect(() =>
      createDriverSchema.parse({
        ...validDriver,
        racingNumber: 4,
      })
    ).not.toThrow();
  });

  it("should fail when racingNumber is a string", () => {
    expect(() =>
      createDriverSchema.parse({
        ...validDriver,
        racingNumber: "4",
      })
    ).not.toThrow();
  });

  it("should fail when racingNumber is missing", () => {
    const { racingNumber, ...rest } = validDriver;
    expect(() =>
      createDriverSchema.parse(rest as any)
    ).toThrow();
  });
});
