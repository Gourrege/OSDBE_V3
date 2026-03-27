import { createTrackSchema } from "../../src/models/tracks";

const validTrack = {
  fiaTrackName: "Silverstone Circuit",
  trackLayout: "https://example.com/layout.jpg",
  circuitName: "Silverstone",
  trackLocation: "Silverstone, UK",
  numDRSZones: "2",
  trackLength: "5.891 km",
  qualiFL: "1:25.123",
  raceFL: "1:27.456",
};

describe("FIA Track Name Validation", () => {
  it("should pass with a valid track name", () => {
    expect(() => createTrackSchema.parse(validTrack)).not.toThrow();
  });

  it("should fail when track name is empty", () => {
    expect(() =>
      createTrackSchema.parse({
        ...validTrack,
        fiaTrackName: "",
      })
    ).toThrow("Track Name is required");
  });

  it("should fail when track name is missing", () => {
    const { fiaTrackName, ...rest } = validTrack;

    expect(() =>
      createTrackSchema.parse(rest as any)
    ).toThrow();
  });
});
