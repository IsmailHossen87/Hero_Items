// purchase.interface.ts
export interface IPurchase {
    userId: string;
    tireName: string;
    type: 'coin' | 'credit'
    price: number;
    value: number;
}
