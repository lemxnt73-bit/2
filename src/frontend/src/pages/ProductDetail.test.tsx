import App from "@/App";
import {
  OTHER_PRINCIPAL,
  SELLER_PRINCIPAL,
  makeListing,
  makeSellerContact,
} from "@/test/fixtures";
import type { Principal } from "@icp-sdk/core/principal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
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
      identity: undefined as { getPrincipal: () => Principal } | undefined,
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

describe("ProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActor.listListings.mockResolvedValue([]);
    mockActor.getListing.mockResolvedValue(
      makeListing({
        id: 1n,
        title: "Tokyo Marui HK416D",
        price: 12800n,
        description: "สภาพดี ใช้งานน้อย",
        sellerName: "สมชาย",
      }),
    );
    mockActor.getSellerContact.mockResolvedValue(makeSellerContact());
  });

  it("renders the listing detail with image, price, description, category and seller", async () => {
    renderApp();
    navigateTo("/listings/1");

    expect(await screen.findByText("Tokyo Marui HK416D")).toBeInTheDocument();
    expect(screen.getByText("฿12,800")).toBeInTheDocument();
    expect(screen.getByText("สภาพดี ใช้งานน้อย")).toBeInTheDocument();
    expect(screen.getByText("สมชาย")).toBeInTheDocument();
    expect(screen.getByText("ผู้ขาย")).toBeInTheDocument();
    expect(screen.getByText("จำหน่าย บีบีกัน")).toBeInTheDocument();
  });

  it("shows the contact seller button and dialog for a non-owner", async () => {
    mockInternetIdentity.isAuthenticated = true;
    mockInternetIdentity.identity = { getPrincipal: () => OTHER_PRINCIPAL };

    renderApp();
    navigateTo("/listings/1");

    const contactButton = await screen.findByTestId("detail.contact_button");
    expect(contactButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(contactButton);

    const dialog = await screen.findByTestId("detail.contact_dialog");
    expect(dialog).toBeInTheDocument();
    // "ติดต่อผู้ขาย" appears both on the trigger button and the dialog title.
    expect(screen.getAllByText("ติดต่อผู้ขาย").length).toBeGreaterThanOrEqual(2);
    expect(within(dialog).getByText("สมชาย")).toBeInTheDocument();
    expect(
      within(dialog).getByText(SELLER_PRINCIPAL.toString()),
    ).toBeInTheDocument();
  });

  it("does not show edit/delete to a non-owner", async () => {
    mockInternetIdentity.isAuthenticated = true;
    mockInternetIdentity.identity = { getPrincipal: () => OTHER_PRINCIPAL };

    renderApp();
    navigateTo("/listings/1");

    await screen.findByText("Tokyo Marui HK416D");
    expect(screen.queryByText("แก้ไขประกาศ")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("detail.delete_button"),
    ).not.toBeInTheDocument();
  });

  it("shows edit and delete to the owner and deletes on click", async () => {
    mockInternetIdentity.isAuthenticated = true;
    mockInternetIdentity.identity = { getPrincipal: () => SELLER_PRINCIPAL };
    mockActor.deleteListing.mockResolvedValue({ __kind__: "ok", ok: null });

    renderApp();
    navigateTo("/listings/1");

    expect(await screen.findByText("แก้ไขประกาศ")).toBeInTheDocument();
    const deleteButton = screen.getByTestId("detail.delete_button");
    expect(deleteButton).toBeInTheDocument();
    expect(
      screen.queryByTestId("detail.contact_button"),
    ).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockActor.deleteListing).toHaveBeenCalledWith(1n);
    });
  });
});
