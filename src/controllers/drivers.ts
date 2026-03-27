import { Request, Response } from 'express';
import { drivercollections } from '../driverdatabase';
import { createDriverSchema, Drivers, updateDriverSchema } from '../models/drivers';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const sanitizeDriver = (driver: Drivers & { _id?: ObjectId }) => {
  const { hashedPassword, ...safeDriver } = driver;
  return {
    ...safeDriver,
    id: driver._id?.toString(),
  };
};

export const getDrivers = async (req: Request, res: Response) => {
    //to do: get all users from the database
  const rawFilter = req.query.filter;
    let filterObj: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (typeof rawFilter === 'string') {
      try {
        filterObj = {
          ...filterObj,
          ...JSON.parse(rawFilter)
        };
      } catch (err) {
        console.error("Invalid filter JSON:", err);
        return res.status(400).json({ error: "Invalid filter format" });
      }
    }

  try {
    const drivers = await drivercollections.driver?.find(filterObj).toArray();
    res.json((drivers || []).map((driver) => sanitizeDriver(driver as Drivers & { _id?: ObjectId })));
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Issue with GET ${error.message}`)
    }
    res.status(500).json({ 'error': 'get failed' });
  }
};

export const getDriversById = async (req: Request, res: Response) => {
  //get a single  user by ID from the database

  let id: string = req.params.id;
  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const query = { _id: new ObjectId(id) };
    const driver = (await drivercollections.driver?.findOne(query)) as unknown as Drivers;

    if (driver && !driver.isDeleted) {
      res.status(200).send(sanitizeDriver(driver as Drivers & { _id?: ObjectId }));
    }
    else
    {
      res.status(404).json({ message: `Unable to find matching document with id: ${req.params.id}` });
    }
  } catch (error) {
    res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
  }
};


export const createDriver = async (req: Request, res: Response) => {
  // create a new user in the database

  const validation = createDriverSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({                                 
      message: 'Validation failed',
      errors: validation.error.issues
    });
  }

   // check password exists
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const existingDriver = await drivercollections.driver?.findOne({
    email: req.body.email,
    isDeleted: { $ne: true }
  });

  if (existingDriver) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);


  const {
    name,
    racingNumber,
    nationality,
    driverImage,
    driverTeam,
    driverDES,
    wins,
    podiums,
    driverWC,
    dob,
    email,
    role,
    status
  } = req.body;

const newDriver: Drivers = {
    name: name,
    racingNumber: racingNumber,
    nationality: nationality,
    driverImage: driverImage,
    driverTeam: driverTeam,
    driverDES: driverDES,
    wins: wins,
    podiums: podiums,
    driverWC: driverWC,
    dob: new Date(dob),
    dateJoined: new Date(),
    lastUpdate: new Date(),
    email: email,
    hashedPassword: hashedPassword,
    role: role,
    status: status || 'active',
    isDeleted: false,
    updatedBy: (req as any).user?.driverId
  };


  try {
    const result = await drivercollections.driver?.insertOne(newDriver)

    if (result) {
      res.status(201).location(`${result.insertedId}`).json({
        message: `Created a new user with id ${result.insertedId}`,
        user: sanitizeDriver({
          ...newDriver,
          _id: result.insertedId
        })
      })
    }
    else {
      res.status(500).send("Failed to create a new user.");
    }
  }
  catch (error) {
    console.error(error);
    res.status(400).send(`Unable to create new user`);
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  
  try {
    const id = req.params.id;

    // validate id format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const validation = updateDriverSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.issues
      });
    }

    const updatePayload = {
      ...validation.data,
      lastUpdate: new Date(),
      updatedBy: (req as any).user?.driverId
    };

    // perform the update
    const result = await drivercollections.driver?.updateOne(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      { $set: updatePayload }
    );

    // handle possible outcomes
    if (!result) {
      return res.status(500).json({ message: 'Update operation failed to execute' });
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message: `No changes made for user ${id} (data may be identical).`,
        result,
      });
    }

    // success
    res.status(200).json({
      message: `User ${id} updated successfully.`,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {

  const id = req.params.id;
  
    try {
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid driver ID format' });
      }
  
      const result = await drivercollections.driver?.updateOne(
        { _id: new ObjectId(id), isDeleted: { $ne: true } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            lastUpdate: new Date(),
            updatedBy: (req as any).user?.driverId
          }
        }
      );
  
      if (result && result.matchedCount === 1) {
        res.status(200).json({ message: `Driver ${id} deleted successfully` });
      } else {
        res.status(404).json({ message: `Driver ${id} not found` });
      }
    } catch (error) {
      console.error('Error Deleting Driver:', error);
      res.status(500).json({ message: 'Failed to delete driver' });
    }

};


