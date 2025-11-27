// Provider-specific data interfaces

export interface AmazonProductStats {
  productId?: string;
  asin?: string;
  views: number;
  sales: number;
  revenue: number;
  rating: string;
  reviews: number;
  salesRank?: number;
}

export interface TopSeller {
  productId?: string;
  asin?: string;
  name?: string;
  sales: number;
  revenue: number;
  [key: string]: string | number | undefined;
}

export interface AmazonCategoryStats {
  category?: string;
  totalProducts: number;
  totalSales: number;
  avgPrice: number;
  topSellers: TopSeller[];
}

export interface AmazonSellerMetrics {
  sellerId?: string;
  totalSales: number;
  orders: number;
  rating: string;
  returnRate: string;
  fulfillmentType: string;
}

export interface AmazonSalesRank {
  asin?: string;
  category?: string;
  rank: number;
  bestRank: number;
  rankChange: number;
}

export interface AmazonUploadResult {
  productId: string;
  asin: string;
  status: string;
  marketplace?: string;
}

export interface AmazonUpdateResult {
  updated: boolean;
  productId?: string;
  asin?: string;
  quantity?: number;
  fulfillmentType?: string;
}

export interface AmazonBulkUploadResult {
  uploadedCount: number;
  failedCount: number;
  marketplace?: string;
}

export interface EbayListingStats {
  listingId?: string;
  views: number;
  watchers: number;
  sales: number;
  revenue: number;
  avgPrice: number;
}

export interface EbaySellerFeedback {
  positiveFeedback: number;
  neutralFeedback: number;
  negativeFeedback: number;
  rating: string;
}

export interface EbayMarketMetrics {
  category?: string;
  totalListings: number;
  avgPrice: number;
  trend: string;
}

export interface EbayUploadResult {
  listingId: string;
  status: string;
}

export interface EbayUpdateResult {
  updated: boolean;
  listingId?: string;
}

export interface EbayBulkUploadResult {
  uploadedCount: number;
  failedCount: number;
}

export interface OzonProductStats {
  productId?: string;
  views: number;
  sales: number;
  revenue: number;
  rating: string;
  reviews: number;
}

export interface OzonCategoryStats {
  category?: string;
  totalProducts: number;
  totalSales: number;
  avgPrice: number;
}

export interface OzonSellerMetrics {
  totalSales: number;
  orders: number;
  rating: string;
  cancellationRate: string;
}

export interface OzonUploadResult {
  productId: string;
  status: string;
}

export interface OzonUpdateResult {
  updated: boolean;
  productId?: string;
}

export interface OzonBulkUploadResult {
  uploadedCount: number;
  failedCount: number;
}

export interface WildberriesProductStats {
  productId?: string;
  views: number;
  sales: number;
  revenue: number;
  rating: string;
  reviews: number;
}

export interface WildberriesCategoryStats {
  category?: string;
  totalProducts: number;
  totalSales: number;
  avgPrice: number;
}

export interface WildberriesSellerMetrics {
  totalSales: number;
  orders: number;
  rating: string;
  returnRate: string;
}

export interface WildberriesUploadResult {
  productId: string;
  status: string;
}

export interface WildberriesUpdateResult {
  updated: boolean;
  productId?: string;
}

export interface WildberriesBulkUploadResult {
  uploadedCount: number;
  failedCount: number;
}

export interface InstagramPostStats {
  postId?: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  impressions: number;
}

export interface InstagramProfileStats {
  followers: number;
  following: number;
  postCount: number;
  engagementRate: string;
}

export interface InstagramHashtagInsights {
  hashtag?: string;
  totalPosts: number;
  recentPosts: number;
  topCountries: string[];
}

export interface TikTokVideoStats {
  videoId?: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

export interface TikTokChannelStats {
  followers: number;
  videoCount: number;
  totalViews: number;
}

export interface TikTokAudienceInsights {
  topCountries: string[];
  ageGroups: Record<string, number>;
  gender: Record<string, number>;
}
