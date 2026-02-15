// battle.model.ts
import { Schema, model } from "mongoose";
import { IBattle, BattleStatus } from "./battle.interface";

const battleSchema = new Schema<IBattle>(
    {
        car1: { type: Schema.Types.ObjectId, ref: "Car", required: true },
        car2: { type: Schema.Types.ObjectId, ref: "Car", required: true },

        battleNumber: { type: String, required: true, unique: true },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },

        battleDate: { type: Date, required: true },

        winner: { type: Schema.Types.ObjectId, ref: "Car" },

        votesCar1: { type: Number, default: 0 },

        votesCar2: { type: Number, default: 0 },

        votersIds: [{ type: Schema.Types.ObjectId, ref: "User" }],

        voteTrack: [
            {
                userId: { type: Schema.Types.ObjectId, ref: "User" },
                carId: { type: Schema.Types.ObjectId, ref: "Car" },
                vote: { type: Number }
            }
        ],

        status: { type: String, enum: Object.values(BattleStatus), default: BattleStatus.PENDING }
    },
    {
        timestamps: true
    }
);

export const Battle = model<IBattle>("Battle", battleSchema);
