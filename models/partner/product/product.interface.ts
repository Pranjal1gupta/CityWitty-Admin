import { Document } from "mongoose";

export interface IVariant {
    variantId: string;
    name: string;
    price: number;
    stock: number;
}

export interface IProductRating {
    userId: string;
    userName: string;
    rating: number;
    review: string;
    merchantReply?: string;
    isLike?: boolean;
    certifiedBuyer?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFAQ {
    question: string;
    answer: string;
    certifiedBuyer: boolean;
    isLike?: boolean;
}

export interface IProduct extends Document {
    productId: string;
    productName: string;
    productImages: string[];
    productDescription: string;
    productCategory: string;
    brand?: string;
    productHighlights?: string[];
    productVariants: IVariant[];
    originalPrice: number;
    discountedPrice?: number;
    offerApplicable: string;
    deliveryFee?: number;
    orderHandlingFee?: number;
    discountOfferedOnProduct?: number;
    productHeight?: number;
    productWidth?: number;
    productWeight?: number;
    productPackageWeight?: number;
    productPackageHeight?: number;
    productPackageWidth?: number;
    whatsInsideTheBox: string[];
    isWarranty: boolean;
    warrantyDescription?: string;
    rating?: IProductRating[];
    deliverableLocations: string[];
    eta: string;
    faq?: IFAQ[];
    instore?: boolean;
    cityWittyAssured?: boolean;
    isWalletCompatible?: boolean;
    cashbackPoints?: number;
    isPriority?: boolean;
    sponsored?: boolean;
    bestsellerBadge?: boolean;
    additionalInfo?: string;
    isReplacement?: boolean;
    replacementDays?: number;
    isAvailableStock?: boolean;
    availableStocks?: number;
}
