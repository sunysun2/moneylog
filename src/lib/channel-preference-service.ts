import { connectDB } from "@/lib/db";
import {
  ownerFilter,
  toOwnerObjectId,
  type OwnerContext,
} from "@/lib/owner-query";
import {
  ChannelPreference,
  DEFAULT_CATEGORIES,
  DEFAULT_COUNTRIES,
} from "@/models/ChannelPreference";

export interface ChannelPreferencesData {
  categories: string[];
  countries: string[];
  templates: string[];
}

function normalizeTemplates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "name" in item) {
        return String((item as { name: string }).name);
      }
      return "";
    })
    .filter(Boolean);
}

async function getOrCreatePreferences(ctx: OwnerContext) {
  await connectDB();
  const filter = ownerFilter(ctx.ownerId, ctx.isAdmin);
  let doc = await ChannelPreference.findOne(filter);
  if (!doc) {
    doc = await ChannelPreference.create({
      categories: DEFAULT_CATEGORIES,
      countries: DEFAULT_COUNTRIES,
      ownerId: toOwnerObjectId(ctx.ownerId),
    });
  }
  return doc;
}

export async function getChannelPreferences(
  ctx: OwnerContext
): Promise<ChannelPreferencesData> {
  const doc = await getOrCreatePreferences(ctx);
  const templates = normalizeTemplates(doc.templates);
  if (
    templates.length !== (doc.templates?.length ?? 0) ||
    doc.templates?.some((t) => typeof t !== "string")
  ) {
    doc.templates = templates;
    await doc.save();
  }
  return {
    categories: doc.categories,
    countries: doc.countries,
    templates,
  };
}

export async function updateChannelPreferences(
  ctx: OwnerContext,
  data: Partial<ChannelPreferencesData>
): Promise<ChannelPreferencesData> {
  await connectDB();
  const doc = await getOrCreatePreferences(ctx);
  if (data.categories) doc.categories = data.categories;
  if (data.countries) doc.countries = data.countries;
  if (data.templates) doc.templates = data.templates;
  await doc.save();
  return {
    categories: doc.categories,
    countries: doc.countries,
    templates: doc.templates ?? [],
  };
}
