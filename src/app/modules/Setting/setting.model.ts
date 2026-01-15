import mongoose, { model } from "mongoose";
import { ISettingType } from "./setting.interface";



const settingSchema = new mongoose.Schema({
    globalSettingType: { type: String, enum: Object.values(ISettingType) },
    description: { type: String },
    websiteName: { type: String },
    image: { type: String },
    voteLimit: { type: Number, default: 1 },
    timezone: { type: String },
})


export const Setting = model("Setting", settingSchema)