import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import { RequestValidationError } from '../errors/request-validation-error';
import { BadRequestError } from '../errors/bad-request-error';

// Create a new Express router
const router = express.Router();

// Define POST route for user signup
router.post(
  '/api/users/signup',
  [
    // Validate email field
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),

    // Validate password field: trim spaces and enforce length
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],
  async (req: Request, res: Response) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If errors exist, throw a custom request validation error
      throw new RequestValidationError(errors.array());
    }

    // Extract email and password from request body
    const { email, password } = req.body;

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Throw custom error if email is already in use
      throw new BadRequestError('Email in use');
    }

    // Create a new User document (type-safe with TypeScript)
    const user = User.build({ email, password });

    // Save the new user to MongoDB
    await user.save();

    // Respond with 201 Created and the newly created user
    res.status(201).send(user);
  }
);

// Export the router to be used in the main app
export { router as signupRouter };
