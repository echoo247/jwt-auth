import mongoose, {Schema} from "mongoose";
import {UserModel} from "./user-models.js";

const TokenSchema = new Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String, required: true},

})

export const TokenModel = mongoose.model('Token', TokenSchema)


