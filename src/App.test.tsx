import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const mockPredict = jest.fn<(endpoint: string, data: unknown) => Promise<{ data: unknown }>>();
const mockConnect = jest.fn<(url: string) => Promise<{ predict: typeof mockPredict }>>();

jest.mock("@gradio/client", () => ({
  Client: { connect: (url: string) => mockConnect(url) },
}));

const prediction = (label: string, confidence: number) => ({
  data: [
    {
      label,
      confidences: [
        { label, confidence },
        { label: label === "fugazzeta" ? "pizza" : "fugazzeta", confidence: 1 - confidence },
      ],
    },
  ],
});

const uploadPizza = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  await user.upload(input, new File(["pizza"], "pizza.png", { type: "image/png" }));
};

describe("App", () => {
  beforeEach(() => {
    mockConnect.mockResolvedValue({ predict: mockPredict });
  });

  it("switches between English and Spanish", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Fugazzeta Detector");
    await user.click(screen.getByRole("button", { name: "ES" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Detector de Fugazzeta");
    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Fugazzeta Detector");
  });

  it("only offers analysis once an image is chosen", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    expect(screen.queryByRole("button", { name: "Analyze Pizza" })).not.toBeInTheDocument();
    await uploadPizza(user, container);

    expect(await screen.findByAltText("Preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze Pizza" })).toBeInTheDocument();
  });

  it("sends the image to the model and shows a fugazzeta result", async () => {
    mockPredict.mockResolvedValue(prediction("fugazzeta", 0.923));
    const user = userEvent.setup();
    const { container } = render(<App />);

    await uploadPizza(user, container);
    await user.click(screen.getByRole("button", { name: "Analyze Pizza" }));

    expect(await screen.findByText("🎉 It's a Fugazzeta!")).toBeInTheDocument();
    expect(screen.getByText("92.3%")).toBeInTheDocument();
    expect(mockConnect).toHaveBeenCalledWith("https://pizza.jonathan-orlowski.dev");
    expect(mockPredict).toHaveBeenCalledWith("/classify_image", { img_path: expect.any(File) });
  });

  it("shows a non-fugazzeta result", async () => {
    mockPredict.mockResolvedValue(prediction("pizza", 0.81));
    const user = userEvent.setup();
    const { container } = render(<App />);

    await uploadPizza(user, container);
    await user.click(screen.getByRole("button", { name: "Analyze Pizza" }));

    expect(await screen.findByText("❌ Not a Fugazzeta")).toBeInTheDocument();
    expect(screen.getByText("81.0%")).toBeInTheDocument();
  });

  it("shows an error when the model cannot be reached", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockConnect.mockRejectedValue(new Error("offline"));
    const user = userEvent.setup();
    const { container } = render(<App />);

    await uploadPizza(user, container);
    await user.click(screen.getByRole("button", { name: "Analyze Pizza" }));

    expect(await screen.findByText("Failed to analyze pizza. Please try again.")).toBeInTheDocument();
  });

  it("clears the result when trying another pizza", async () => {
    mockPredict.mockResolvedValue(prediction("fugazzeta", 0.9));
    const user = userEvent.setup();
    const { container } = render(<App />);

    await uploadPizza(user, container);
    await user.click(screen.getByRole("button", { name: "Analyze Pizza" }));
    await user.click(await screen.findByRole("button", { name: "Try Another Pizza" }));

    expect(screen.queryByText("🎉 It's a Fugazzeta!")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
    expect(screen.getByText("Upload a pizza image")).toBeInTheDocument();
  });
});
