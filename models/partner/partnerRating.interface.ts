export interface IPartnerRating {
    userId: string;
    user: string;
    rating: number;
    review?: string;
    reply?: string;
    createdAt?: Date;
}