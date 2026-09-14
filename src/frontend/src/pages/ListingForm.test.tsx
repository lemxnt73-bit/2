import App from "@/App";
import { makeListing } from "@/test/fixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockActor, mockInternetIdentity } = vi.hoisted(() => {
  return {
    mockActor: {
      listListings: vi.fn(),
      getListing: vi.fn(),
      getSellerContact: vi.fn(),
      createListing: vi.fn(),
      updateListing: vi.fn(),
      deleteListing: vi.fn(),
    },
    mockInternetIdentity: {
      isAuthenticated: false,
      identity: undefined,
      login: vi.fn(),
      clear: vi.fn(),
      isInitializing: false,
      isLoggingIn: false,
      loginStatus: "idle",
      isLoginIdle: true,
      isLoginSuccess: false,
      isLoginError: false,
    },
  };
});

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
  useInternetIdentity: () => mockInternetIdentity,
}));

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

describe("ListingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActor.listListings.mockResolvedValue([]);
    mockActor.getListing.mockResolvedValue(null);
    mockActor.getSellerContact.mockResolvedValue(null);
  });

  it("requires sign-in before posting a listing", async () => {
    mockInternetIdentity.isAuthenticated = false;
    renderApp();
    navigateTo("/listings/new");

    expect(await screen.findByText("กรุณาเข้าสู่ระบบ")).toBeInTheDocument();
    expect(screen.getByText("กลับไปหน้าแรก")).toBeInTheDocument();
    expect(screen.queryByTestId("listing.title_input")).not.toBeInTheDocument();
  });

  it("shows the listing form to an authenticated user", async () => {
    mockInternetIdentity.isAuthenticated = true;
    renderApp();
    navigateTo("/listings/new");

    expect(await screen.findByText("ลงประกาศขาย")).toBeInTheDocument();
    expect(screen.getByTestId("listing.title_input")).toBeInTheDocument();
    expect(screen.getByTestId("listing.price_input")).toBeInTheDocument();
    expect(screen.getByTestId("listing.seller_name_input")).toBeInTheDocument();
    expect(screen.getByText("จำหน่าย บีบีกัน")).toBeInTheDocument();
    expect(screen.getByText("อุปกรณ์ (มือ2)")).toBeInTheDocument();
  });

  it("disables submit until the required fields are valid", async () => {
    mockInternetIdentity.isAuthenticated = true;
    renderApp();
    navigateTo("/listings/new");

    const submit = await screen.findByTestId("listing.submit_button");
    expect(submit).toBeDisabled();

    const user = userEvent.setup();
    await user.type(screen.getByTestId("listing.title_input"), "Tokyo Marui");
    await user.type(screen.getByTestId("listing.price_input"), "12800");
    await user.type(screen.getByTestId("listing.seller_name_input"), "สมชาย");

    expect(submit).toBeEnabled();
  });

  it("creates a listing with the entered data", async () => {
    mockInternetIdentity.isAuthenticated = true;
    mockActor.createListing.mockResolvedValue({
      __kind__: "ok",
      ok: makeListing({ id: 5n, title: "Tokyo Marui HK416D", price: 12800n }),
    });

    renderApp();
    navigateTo("/listings/new");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("listing.title_input"),
      "Tokyo Marui HK416D",
    );
    await user.type(screen.getByTestId("listing.price_input"), "12800");
    await user.type(screen.getByTestId("listing.seller_name_input"), "สมชาย");
    await user.type(
      screen.getByTestId("listing.description_input"),
      "สภาพดี ใช้งานน้อย",
    );

    await user.click(screen.getByTestId("listing.submit_button"));

    await waitFor(() => {
      expect(mockActor.createListing).toHaveBeenCalledWith(
        "Tokyo Marui HK416D",
        "bbGun",
        12800n,
        "สภาพดี ใช้งานน้อย",
        [],
        "สมชาย",
      );
    });
  });
});
