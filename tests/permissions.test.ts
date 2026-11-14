import { describe, it, expect, beforeAll } from "vitest";
import { freshDb, seedUser, seedDocument, seedShare } from "./db-setup";
import {
  getDocumentForUser,
  canWrite,
  canManageSharing,
} from "@/lib/auth/dal";

// This is the permission matrix for .kiro/skills/authz-boundary:
// getDocumentForUser is the single gate every document route goes
// through. A bug here is not a cosmetic issue -- it's either a user
// seeing (or editing, or deleting) a document they have no business
// touching, or a legitimate owner locked out of their own document.

describe("getDocumentForUser permission matrix", () => {
  let ownerId: string;
  let editorId: string;
  let viewerId: string;
  let outsiderId: string;
  let docId: string;

  beforeAll(async () => {
    const db = await freshDb();
    const owner = await seedUser(db, "owner@test.local", "Owner");
    const editor = await seedUser(db, "editor@test.local", "Editor");
    const viewer = await seedUser(db, "viewer@test.local", "Viewer");
    const outsider = await seedUser(db, "outsider@test.local", "Outsider");
    const doc = await seedDocument(db, owner.id);
    await seedShare(db, doc.id, editor.id, "editor");
    await seedShare(db, doc.id, viewer.id, "viewer");

    ownerId = owner.id;
    editorId = editor.id;
    viewerId = viewer.id;
    outsiderId = outsider.id;
    docId = doc.id;
  });

  it("gives the owner the owner role", async () => {
    const access = await getDocumentForUser(docId, ownerId);
    expect(access?.role).toBe("owner");
  });

  it("gives a user with an editor share the editor role", async () => {
    const access = await getDocumentForUser(docId, editorId);
    expect(access?.role).toBe("editor");
  });

  it("gives a user with a viewer share the viewer role", async () => {
    const access = await getDocumentForUser(docId, viewerId);
    expect(access?.role).toBe("viewer");
  });

  it("returns null for a user with no owner row and no share row", async () => {
    const access = await getDocumentForUser(docId, outsiderId);
    expect(access).toBeNull();
  });

  it("returns null for a document id that does not exist, same as no access", async () => {
    const access = await getDocumentForUser(
      "00000000-0000-0000-0000-000000000000",
      ownerId,
    );
    expect(access).toBeNull();
  });

  describe("canWrite", () => {
    it("is true for owner and editor", () => {
      expect(canWrite("owner")).toBe(true);
      expect(canWrite("editor")).toBe(true);
    });

    it("is false for viewer", () => {
      expect(canWrite("viewer")).toBe(false);
    });
  });

  describe("canManageSharing", () => {
    it("is true only for owner", () => {
      expect(canManageSharing("owner")).toBe(true);
      expect(canManageSharing("editor")).toBe(false);
      expect(canManageSharing("viewer")).toBe(false);
    });
  });

  it("a viewer can read but the role forbids both write and sharing", async () => {
    const access = await getDocumentForUser(docId, viewerId);
    expect(access).not.toBeNull();
    expect(canWrite(access!.role)).toBe(false);
    expect(canManageSharing(access!.role)).toBe(false);
  });

  it("an editor can write but the role forbids sharing", async () => {
    const access = await getDocumentForUser(docId, editorId);
    expect(access).not.toBeNull();
    expect(canWrite(access!.role)).toBe(true);
    expect(canManageSharing(access!.role)).toBe(false);
  });
});
