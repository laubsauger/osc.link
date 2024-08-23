import { Request as ExpressRequest, Response, NextFunction } from 'express';
import Admin from '../models/Admin';
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
  

const ensureAdminInDatabase = async (req: any, res: any, next: any) => {
    const customReq = req as unknown as CustomRequest;

    try {
    const { userId } = customReq.auth;
    if (!userId) {
      return res.status(400).json({ error: 'Admin data is incomplete.' });
    }

    const admin = await clerkClient.users.getUser(userId);
    const email = await clerkClient.emailAddresses.getEmailAddress(admin.primaryEmailAddressId || '');

    await Admin.findOrCreate({
      where: { id: userId },
      defaults: { email: email.emailAddress }
    });

    next();
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error ensuring user exists in the database.' + error });
  }
};

export default ensureAdminInDatabase;
