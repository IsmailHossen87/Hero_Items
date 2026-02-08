import { Types } from "mongoose";

export enum BattleStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED"
}

export interface IBattle {
    car1: Types.ObjectId;
    car2: Types.ObjectId;

    battleNumber: string;
    battleDate: Date;

    winner?: Types.ObjectId;

    votesCar1: number;
    votesCar2: number;

    votersIds: Types.ObjectId[];

    status: BattleStatus;

    createdAt: Date;
    updatedAt: Date;
}
