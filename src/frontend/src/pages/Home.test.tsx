import App from "@/App";
import { makeListing } from "@/test/fixtures";
import { BB_GUN, EQUIPMENT } from "@/types";
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

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActor.listListings.mockResolvedValue([]);
  });

  it("renders the header brand and category filters", async () => {
    renderApp();
    expect(await screen.findByText("แอร์ซอฟท์ ไทยแลนด์")).toBeInTheDocument();
    expect(screen.getByText("ทั้งหมด")).toBeInTheDocument();
    expect(screen.getByText("จำหน่าย บีบีกัน")).toBeInTheDocument();
    expect(screen.getByText("อุปกรณ์ (มือ2)")).toBeInTheDocument();
  });

  it("renders listings as cards with title, price, category and seller", async () => {
    mockActor.listListings.mockResolvedValue([
      makeListing({
        id: 1n,
        title: "Tokyo Marui HK416D",
        price: 12800n,
        sellerName: "สมชาย",
      }),
      makeListing({
        id: 2n,
        title: "ชุดเกียร์มือสอง",
        category: EQUIPMENT,
        price: 2500n,
        sellerName: "นิด",
      }),
    ]);
    renderApp();

    expect(await screen.findByText("Tokyo Marui HK416D")).toBeInTheDocument();
    expect(screen.getByText("ชุดเกียร์มือสอง")).toBeInTheDocument();
    expect(screen.getByText("฿12,800")).toBeInTheDocument();
    expect(screen.getByText("฿2,500")).toBeInTheDocument();
    // Category labels appear both in the filter bar and on the card badges.
    expect(screen.getAllByText("จำหน่าย บีบีกัน").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("อุปกรณ์ (มือ2)").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("สมชาย")).toBeInTheDocument();
    expect(screen.getByText("นิด")).toBeInTheDocument();
  });

  it("filters by category through the URL and calls listListings with it", async () => {
    mockActor.listListings.mockResolvedValue([
      makeListing({ id: 1n, title: "Tokyo Marui HK416D", category: BB_GUN }),
    ]);
    renderApp();
    await screen.findByText("Tokyo Marui HK416D");

    const user = userEvent.setup();
    await user.click(screen.getByText("อุปกรณ์ (มือ2)"));

    await waitFor(() => {
      expect(mockActor.listListings).toHaveBeenCalledWith("equipment", null);
    });
  });

  it("shows the empty state when there are no listings", async () => {
    mockActor.listListings.mockResolvedValue([]);
    renderApp();
    expect(await screen.findByText("ยังไม่มีประกาศในหมวดนี้")).toBeInTheDocument();
    expect(screen.getByText("ลงประกาศ +")).toBeInTheDocument();
  });

  it("shows the loading skeleton while fetching", async () => {
    mockActor.listListings.mockReturnValue(new Promise(() => {}));
    renderApp();
    expect(await screen.findByTestId("home.loading_state")).toBeInTheDocument();
  });

  it("shows the error state when the fetch fails", async () => {
    mockActor.listListings.mockRejectedValue(new Error("boom"));
    renderApp();
    expect(
      await screen.findByText("ไม่สามารถโหลดรายการประกาศได้"),
    ).toBeInTheDocument();
  });
});
