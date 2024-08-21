import { Request as ExpressRequest, Response, NextFunction } from 'express';
import User from '../models/User';
import { CustomRequest } from '../routes/instances';
import { clerkClient } from '@clerk/clerk-sdk-node';

// interface Request extends ExpressRequest {
//     auth: { userId: string };
//     body: {
//       name: string;
//       description?: string;
//       settings?: object;
//     };
//   }
  

const ensureUserInDatabase = async (req: any, res: any, next: any) => {
    const customReq = req as unknown as CustomRequest;

    try {
    const { userId } = customReq.auth;
    if (!userId) {
      return res.status(400).json({ error: 'User data is incomplete.' });
    }

    const user = await clerkClient.users.getUser(userId);
    const email = await clerkClient.emailAddresses.getEmailAddress(user.primaryEmailAddressId || '');
    console.log(email);

    // Find or create the user in the local database
    await User.findOrCreate({
      where: { id: userId },
      defaults: { email: email.emailAddress }
    });

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error ensuring user exists in the database.' + error });
  }
};

export default ensureUserInDatabase;
