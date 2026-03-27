import request from "supertest";

import {app} from "../../index";

describe("Basic server running and answering ping", () => {
  test("Testing the ping", async () => {
    const res = await request(app).get("/ping");
    expect(res.body).toEqual({ message: "Hello I am Henrick 2" });
  });
});
