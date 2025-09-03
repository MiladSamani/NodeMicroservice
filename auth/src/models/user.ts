import mongoose from 'mongoose';
import { Password } from '../services/password';

// Properties required to create a new User (when calling User.build)
interface UserAttrs {
  email: string;
  password: string;
}

// Properties and methods that the User Model itself has
// (e.g., User.build, User.find, User.create, ...)
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Properties that a single User Document (a record in MongoDB) has
// (e.g., user.email, user.password, user.save)
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// Define schema = shape of the User collection in MongoDB
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// Add a custom static method to the schema (to safely create a new User with TypeScript checks)
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// Create the User Model (connects the schema with MongoDB collection "users")
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
