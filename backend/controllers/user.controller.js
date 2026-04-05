import prisma from '../lib/prisma.js';

// --- GET LOGGED-IN USER PROFILE ---
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        contactNumber: true,
        profilePicture: true,
        isVerified: true,
        createdAt: true,
        // Fetch the items this user is selling/renting
        products: {
          select: { 
            id: true, 
            title: true, 
            price: true, 
            status: true, 
            listingType: true,
            images: true,
            description: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: 'Failed to fetch profile data.' });
  }
};

// --- UPDATE USER PROFILE ---
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, contactNumber, profilePicture } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        bio, 
        contactNumber, 
        profilePicture 
      },
      // Return only the safe updated fields
      select: { 
        id: true, 
        name: true, 
        bio: true, 
        contactNumber: true, 
        profilePicture: true 
      }
    });

    res.status(200).json({ 
      message: 'Profile updated successfully!', 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};
