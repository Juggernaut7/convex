import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

type UserModel = Model<UserDocument>;

const userSchema = new Schema<UserDocument, UserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    roles: {
      type: [String],
      default: ["user"]
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument, UserModel>("User", userSchema);
export type { HydratedDocument as UserHydratedDocument };

