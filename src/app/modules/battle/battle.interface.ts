import { Types } from "mongoose";

export enum BattleStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED"
}

export interface IVoterIds {
    userId: Types.ObjectId;
    carId: Types.ObjectId;
    vote: number;
}

export interface IBattle {
    car1: Types.ObjectId;
    car2: Types.ObjectId;

    battleNumber: string;
    battleDate: Date;

    winner?: Types.ObjectId;

    votesCar1: number;
    votesCar2: number;
    categoryId: Types.ObjectId;

    votersIds: Types.ObjectId[];
    voteTrack: IVoterIds[];

    status: BattleStatus;

    createdAt: Date;
    updatedAt: Date;
}
