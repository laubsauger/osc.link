import { Request as ExpressRequest, Response, NextFunction } from 'express';
import User from '../models/User';

interface Request extends ExpressRequest {
    auth: { userId: string };
    body: {
      name: string;
      description?: string;
      settings?: object;
    };
  }
  

const ensureUserInDatabase = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const { userId } = req.auth;
    const userEmail = req.auth.user?.primaryEmailAddress?.emailAddress;
    console.log(req.auth)
    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'User data is incomplete.' });
    }

    // Find or create the user in the local database
    await User.findOrCreate({
      where: { id: userId },
      defaults: { email: userEmail },
    });

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(500).json({ error: 'Error ensuring user exists in the database.' });
  }
};

export default ensureUserInDatabase;
