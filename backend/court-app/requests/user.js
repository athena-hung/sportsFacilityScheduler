const express = require('express');
const router = express.Router();

const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { ExtractJwt } = require('passport-jwt');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'yourSecretKey'
};

// Registration endpoint: Create a new user
router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    birthdate,
    maxCourtsPerDay, // Only admins can override this field
    email,
    password,
    org_id,
    member_type_id // Only admins can override this field
  } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await knex('user').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Determine member_type_id: only admins can override this field
    let selectedMemberTypeId;
    let isAdmin = false;
    if (req.user) {
      // Retrieve the requester's member type and check if they are admin
      const currentMemberType = await knex('member_type').where({ id: req.user.member_type_id }).first();
      isAdmin = currentMemberType &&
                currentMemberType.type &&
                currentMemberType.type.toLowerCase() === 'admin';

      // Allow admin to set member_type_id if provided
      if (isAdmin && member_type_id) {
        selectedMemberTypeId = member_type_id;
      }
    }
    // If not set by an admin, get the first found default member type from the organization
    if (!selectedMemberTypeId) {
      if (!org_id) {
        return res.status(400).json({ message: 'Missing required field: org_id' });
      }
      const defaultMemberType = await knex('member_type')
        .where({ org_id, is_default: true })
        .first();
      if (!defaultMemberType) {
        return res.status(500).json({ message: 'Default member type not found for the organization.' });
      }
      selectedMemberTypeId = defaultMemberType.id;
    }

    // Determine maxCourtsPerDay: only admins can override this field
    let chosenMaxCourtsPerDay;
    if (isAdmin && maxCourtsPerDay) {
      // Admin provided a custom value
      chosenMaxCourtsPerDay = maxCourtsPerDay;
    } else {
      // For non-admins or if no custom value provided, default to the organization's default
      if (!org_id) {
        return res.status(400).json({ message: 'Missing required field: org_id' });
      }
      const organization = await knex('org').where({ id: org_id }).first();
      if (!organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      chosenMaxCourtsPerDay = organization.defaultCourtsPerDay;
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database and return the inserted row
    const insertedUsers = await knex('user')
      .insert({
        firstName,
        lastName,
        address,
        birthdate,
        maxCourtsPerDay: chosenMaxCourtsPerDay,
        email,
        password: hashedPassword, // Store hashed password
        org_id,
        member_type_id: selectedMemberTypeId
      })
      .returning('*');

    const newUser = insertedUsers[0];
    // Remove sensitive fields before sending the response
    if (newUser.password) {
      delete newUser.password;
    }

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Registration error: ', error);
    return res.status(500).json({ message: 'Error creating user.' });
  }
});

// Login endpoint: Validate credentials and issue a JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await knex('user').where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Prepare token payload (avoid including sensitive fields)
    const tokenPayload = { id: user.id, email: user.email };
    const token = jwt.sign(tokenPayload, jwtOptions.secretOrKey, { expiresIn: '1h' });
    return res.json({ token });
  } catch (error) {
    console.error('Login error: ', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Optional: A protected route to fetch the current user's profile
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ user: req.user });
});

// Endpoint to update user information
// Only admins can edit member_type_id and maxCourtsPerDay
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  
  try {
    // Check if the targeted user exists
    const userToUpdate = await knex('user').where({ id }).first();
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Retrieve the member type of the requesting user
    const currentMemberType = await knex('member_type').where({ id: requestingUser.member_type_id }).first();
    const isAdmin = currentMemberType &&
                    currentMemberType.type &&
                    currentMemberType.type.toLowerCase() === 'admin';
    
    // Non-admins can only update their own information
    if (!isAdmin && requestingUser.id !== userToUpdate.id) {
      return res.status(403).json({ message: 'You are not allowed to update this user info.' });
    }
    
    // Build the update object from fields allowed for all users
    const updateData = {};
    if (req.body.firstName !== undefined) {
      updateData.firstName = req.body.firstName;
    }
    if (req.body.lastName !== undefined) {
      updateData.lastName = req.body.lastName;
    }
    if (req.body.address !== undefined) {
      updateData.address = req.body.address;
    }
    if (req.body.birthdate !== undefined) {
      updateData.birthdate = req.body.birthdate;
    }
    if (req.body.email !== undefined) {
      updateData.email = req.body.email;
    }
    
    // Only admins are allowed to update member_type_id and maxCourtsPerDay.
    if (isAdmin) {
      if (req.body.member_type_id !== undefined) {
        updateData.member_type_id = req.body.member_type_id;
      }
      if (req.body.maxCourtsPerDay !== undefined) {
        updateData.maxCourtsPerDay = req.body.maxCourtsPerDay;
      }
    }
    
    const [updatedUser] = await knex('user')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    // Remove sensitive data from the response
    if (updatedUser.password) {
      delete updatedUser.password;
    }
    
    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Error updating user information.' });
  }
});

module.exports = router;
