/**
 * Session tests — all Prisma calls are mocked so no DB required.
 * Tests cover: lib/db/sessions, /api/session/open, /api/session/close, /api/session/status
 */

// ─── Prisma mock ─────────────────────────────────────────────────────────────
const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findFirst: (...a: any[]) => mockFindFirst(...a),
      findUnique: (...a: any[]) => mockFindUnique(...a),
      create: (...a: any[]) => mockCreate(...a),
      update: (...a: any[]) => mockUpdate(...a),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getActive, create, close, getSummary } from "@/lib/db/sessions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSession(overrides: Record<string, any> = {}) {
  return {
    id: "sess-1",
    openedByUserId: "user-1",
    openedAt: new Date("2024-01-01T08:00:00Z"),
    closedAt: null,
    closingSaleAmount: null,
    openedBy: { name: "Alice" },
    orders: [],
    ...overrides,
  };
}

function makeNextRequest(opts: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}): Request {
  return new Request("http://localhost:3000/api/session/open", {
    method: opts.method ?? "POST",
    headers: { "Content-Type": "application/json", ...opts.headers },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

// ─── lib/db/sessions ─────────────────────────────────────────────────────────

describe("lib/db/sessions", () => {
  beforeEach(() => jest.clearAllMocks());

  // getActive
  describe("getActive", () => {
    it("queries for a session with closedAt null for the given user", async () => {
      const sess = makeSession();
      mockFindFirst.mockResolvedValue(sess);

      const result = await getActive("user-1");

      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { openedByUserId: "user-1", closedAt: null },
        })
      );
      expect(result).toBe(sess);
    });

    it("returns null when no active session exists", async () => {
      mockFindFirst.mockResolvedValue(null);
      const result = await getActive("user-1");
      expect(result).toBeNull();
    });
  });

  // create
  describe("create", () => {
    it("creates a session when no active one exists", async () => {
      mockFindFirst.mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user-1" });
      const sess = makeSession();
      mockCreate.mockResolvedValue(sess);

      const result = await create("user-1");

      expect(mockCreate).toHaveBeenCalledWith({
        data: { openedByUserId: "user-1" },
      });
      expect(result).toBe(sess);
    });

    it("throws when user already has an active session", async () => {
      mockFindFirst.mockResolvedValue(makeSession());
      await expect(create("user-1")).rejects.toThrow(
        "User already has an active session"
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("throws when user does not exist", async () => {
      mockFindFirst.mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(create("user-1")).rejects.toThrow("User does not exist");
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  // close
  describe("close", () => {
    it("closes the session and sets closingSaleAmount from PAID orders", async () => {
      // Prisma applies the where: { status: "PAID" } filter, so the mock
      // must only return PAID orders — same as what Prisma would give back.
      const sess = makeSession({
        orders: [
          { status: "PAID", total: "100.00" },
          { status: "PAID", total: "50.50" },
        ],
      });
      mockFindUnique.mockResolvedValue(sess);
      const closed = makeSession({ closedAt: new Date(), closingSaleAmount: 150.5 });
      mockUpdate.mockResolvedValue(closed);

      const result = await close("sess-1");

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "sess-1" },
          data: expect.objectContaining({ closingSaleAmount: 150.5 }),
        })
      );
      expect(result).toBe(closed);
    });

    it("throws when session is not found", async () => {
      mockFindUnique.mockResolvedValue(null);
      await expect(close("sess-1")).rejects.toThrow("Session not found");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("throws when session is already closed", async () => {
      mockFindUnique.mockResolvedValue(
        makeSession({ closedAt: new Date("2024-01-01T16:00:00Z") })
      );
      await expect(close("sess-1")).rejects.toThrow("Session is already closed");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("sets closingSaleAmount to 0 when there are no PAID orders", async () => {
      mockFindUnique.mockResolvedValue(makeSession({ orders: [] }));
      mockUpdate.mockResolvedValue(makeSession());

      await close("sess-1");

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ closingSaleAmount: 0 }),
        })
      );
    });
  });

  // getSummary
  describe("getSummary", () => {
    it("counts all orders but sums only PAID totals", async () => {
      const openedAt = new Date("2024-01-01T08:00:00Z");
      const closedAt = new Date("2024-01-01T10:30:00Z"); // 2h 30m
      mockFindUnique.mockResolvedValue(
        makeSession({
          openedAt,
          closedAt,
          orders: [
            { status: "PAID", total: "200.00" },
            { status: "PAID", total: "50.00" },
            { status: "CANCELLED", total: "100.00" },
          ],
        })
      );

      const result = await getSummary("sess-1");

      expect(result.totalOrders).toBe(3);
      expect(result.totalRevenue).toBe(250);
      expect(result.shiftDuration).toBe("2h 30m");
      expect(result.openedAt).toEqual(openedAt);
      expect(result.closedAt).toEqual(closedAt);
    });

    it("returns shiftDuration in minutes only when under 1 hour", async () => {
      const openedAt = new Date("2024-01-01T08:00:00Z");
      const closedAt = new Date("2024-01-01T08:45:00Z");
      mockFindUnique.mockResolvedValue(makeSession({ openedAt, closedAt, orders: [] }));

      const result = await getSummary("sess-1");

      expect(result.shiftDuration).toBe("45m");
    });

    it("throws when session not found", async () => {
      mockFindUnique.mockResolvedValue(null);
      await expect(getSummary("sess-1")).rejects.toThrow("Session not found");
    });

    it("uses current time as closedAt when session is still open", async () => {
      mockFindUnique.mockResolvedValue(makeSession({ closedAt: null, orders: [] }));
      const before = Date.now();
      const result = await getSummary("sess-1");
      const after = Date.now();

      expect(result.closedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.closedAt.getTime()).toBeLessThanOrEqual(after);
    });
  });
});

// ─── Route handlers (thin integration-style, no HTTP server needed) ───────────

describe("POST /api/session/open route", () => {
  // Re-import after mocks are set up
  let POST: any;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/session/open/route"));
  });
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when x-user-role header is missing", async () => {
    const req = makeNextRequest({ headers: {} });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when x-user-id header is missing", async () => {
    const req = makeNextRequest({ headers: { "x-user-role": "EMPLOYEE" } });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 201 with session id and openedAt on success", async () => {
    mockFindFirst.mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user-1" });
    const now = new Date();
    mockCreate.mockResolvedValue({ id: "sess-new", openedAt: now });

    const req = makeNextRequest({
      headers: { "x-user-role": "EMPLOYEE", "x-user-id": "user-1" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.session.id).toBe("sess-new");
    expect(body.data.session.openedAt).toBeDefined();
  });

  it("returns 400 when user already has an active session", async () => {
    mockFindFirst.mockResolvedValue(makeSession());
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user-1" });

    const req = makeNextRequest({
      headers: { "x-user-role": "EMPLOYEE", "x-user-id": "user-1" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/active session/i);
  });
});

describe("POST /api/session/close route", () => {
  let POST: any;
  beforeAll(async () => {
    ({ POST } = await import("@/app/api/session/close/route"));
  });
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when x-user-role header is missing", async () => {
    const req = makeNextRequest({ headers: {} });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 when x-user-id header is missing", async () => {
    const req = makeNextRequest({ headers: { "x-user-role": "EMPLOYEE" } });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 400 when no active session exists", async () => {
    mockFindFirst.mockResolvedValue(null);
    const req = makeNextRequest({
      headers: { "x-user-role": "EMPLOYEE", "x-user-id": "user-1" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/no active session/i);
  });

  it("returns 200 with summary on success", async () => {
    const openedAt = new Date("2024-01-01T08:00:00Z");
    const closedAt = new Date("2024-01-01T10:00:00Z");
    const activeSess = makeSession({
      orders: [{ status: "PAID", total: "300.00" }],
    });

    // getActive → findFirst
    mockFindFirst.mockResolvedValue(activeSess);

    // close → findUnique (with PAID orders to compute amount), then update
    mockFindUnique
      .mockResolvedValueOnce(
        makeSession({ orders: [{ status: "PAID", total: "300.00" }] })
      )
      // getSummary → findUnique
      .mockResolvedValueOnce(
        makeSession({ openedAt, closedAt, orders: [{ status: "PAID", total: "300.00" }] })
      );

    mockUpdate.mockResolvedValue(makeSession({ closedAt, closingSaleAmount: 300 }));

    const req = makeNextRequest({
      headers: { "x-user-role": "EMPLOYEE", "x-user-id": "user-1" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.summary.totalRevenue).toBe(300);
    expect(body.data.summary.totalOrders).toBe(1);
    expect(body.data.summary.shiftDuration).toBeDefined();
  });
});

describe("GET /api/session/status route", () => {
  let GET: any;
  beforeAll(async () => {
    ({ GET } = await import("@/app/api/session/status/route"));
  });
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when x-user-role header is missing", async () => {
    const req = new Request("http://localhost:3000/api/session/status");
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 when x-user-id header is missing", async () => {
    const req = new Request("http://localhost:3000/api/session/status", {
      headers: { "x-user-role": "EMPLOYEE" },
    });
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it("returns activeSession and lastSession when both exist", async () => {
    const active = makeSession();
    const last = makeSession({
      id: "sess-0",
      closedAt: new Date("2024-01-01T06:00:00Z"),
      closingSaleAmount: "150.00",
    });

    mockFindFirst
      .mockResolvedValueOnce(active)   // active session query
      .mockResolvedValueOnce(last);    // last closed session query

    const req = new Request("http://localhost:3000/api/session/status", {
      headers: { "x-user-role": "EMPLOYEE", "x-user-id": "user-1" },
    });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.activeSession.id).toBe("sess-1");
    expect(body.data.lastSession.id).toBe("sess-0");
    expect(body.data.lastSession.closingSaleAmount).toBe(150);
  });

  it("returns null for both when no sessions exist", async () => {
    mockFindFirst.mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/session/status", {
      headers: { "x-user-role": "EMPLOYEE", "x-user-id": "user-1" },
    });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.activeSession).toBeNull();
    expect(body.data.lastSession).toBeNull();
  });
});
