// E-commerce CRUD interfaces

/**
 * Upload Product DTO
 */
export interface UploadProductDto {
  provider: string;
  productId?: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  [key: string]: string | number | string[] | undefined;
}

/**
 * Update Product DTO
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  [key: string]: string | number | string[] | undefined;
}

/**
 * Bulk Upload Products DTO
 */
export interface BulkUploadProductsDto {
  provider: string;
  items: Array<{
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    images?: string[];
    [key: string]: string | number | string[] | undefined;
  }>;
}
