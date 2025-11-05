/**
 * Package Listing Limits Configuration
 * Defines the listing limits for different purchased package variants
 */

export type PackageTier = "Launch Pad" | "Scale Up" | "Market Leader";

export interface PackageLimitConfig {
  ListingLimit: number;
  totalGraphics: number;
  totalReels: number;
  totalPodcast: number;
}

export const PACKAGE_LIMITS: Record<PackageTier, PackageLimitConfig> = {
  "Launch Pad": {
    ListingLimit: 10,
    totalGraphics: 48,
    totalReels: 12,
    totalPodcast: 0,
  },
  "Scale Up": {
    ListingLimit: 20,
    totalGraphics: 96,
    totalReels: 24,
    totalPodcast: 0,
  },
  "Market Leader": {
    ListingLimit: 30,
    totalGraphics: 144,
    totalReels: 48,
    totalPodcast: 1,
  },
};

/**
 * Get limits for a specific package tier
 * @param packageTier - The name of the package tier
 * @returns The limits configuration for that tier, or null if not found
 */
export const getPackageLimits = (packageTier: string): PackageLimitConfig | null => {
  if (packageTier in PACKAGE_LIMITS) {
    return PACKAGE_LIMITS[packageTier as PackageTier];
  }
  return null;
};

/**
 * Get all available package tiers
 */
export const PACKAGE_TIERS: PackageTier[] = ["Launch Pad", "Scale Up", "Market Leader"];