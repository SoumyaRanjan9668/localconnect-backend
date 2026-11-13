
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database.js";
import { createHash, randomBytes } from "crypto";

// Allowed public registration roles
type RegisterRole =
  | "CUSTOMER"
  | "SHOP_OWNER"
  | "DELIVERY_PARTNER";

// Registration input
interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: RegisterRole;
  address?: string;
  village?: string;
}

// Register new user
export const registerUser = async (input: RegisterInput) => {
  const {
    name,
    phone,
    email,
    password,
    role = "CUSTOMER",
    address,
    village,
  } = input;

  // Check existing phone number
  const existingPhone = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingPhone) {
    throw new Error("Phone number already registered");
  }

  // Check existing email
  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new Error("Email already registered");
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user in database
  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email: email || null,
      password: hashedPassword,
      role,
      address,
      village,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      address: true,
      village: true,
      createdAt: true,
    },
  });

  return user;
};


// Allowed login roles
type LoginRole =
  | "CUSTOMER"
  | "SHOP_OWNER"
  | "DELIVERY_PARTNER";

// Login input
interface LoginInput {
  identifier: string;
  password: string;
  role: LoginRole;
}


// Generate short-lived access token
const generateAccessToken = (
  userId: string,
  role: string,
) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId, role },
    jwtSecret,
    { expiresIn: "15m" },
  );
};

// Convert refresh token into SHA-256 hash
const hashRefreshToken = (token: string) => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

// Login user
export const loginUser = async (input: LoginInput) => {
  const { identifier, password, role } = input;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: identifier },
        { email: identifier },
      ],
    },
  });

  if (!user || user.role !== role) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Generate access token
  const accessToken = generateAccessToken(
    user.id,
    user.role,
  );

  // Generate secure random refresh token
  const refreshToken = randomBytes(64).toString("hex");

  // Store only its hash in database
  const refreshTokenHash = hashRefreshToken(refreshToken);

  // Refresh token validity: 7 days
  const refreshTokenExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshTokenHash,
      refreshTokenExpiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};



// Refresh Access Token using Refresh Token
export const refreshUserToken = async (refreshToken: string) => {
  // Check empty token
  if (!refreshToken) {
    throw new Error("Invalid refresh token");
  }

  // Hash received refresh token
  const oldTokenHash = hashRefreshToken(refreshToken);

  // Find user using stored token hash
  const user = await prisma.user.findFirst({
    where: {
      refreshTokenHash: oldTokenHash,
      refreshTokenExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Invalid refresh token");
  }

  // Generate new token pair
  const accessToken = generateAccessToken(
    user.id,
    user.role,
  );

  const newRefreshToken = randomBytes(64).toString("hex");
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const newRefreshTokenExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );

  // Atomically replace old refresh token
  const updated = await prisma.user.updateMany({
    where: {
      id: user.id,
      refreshTokenHash: oldTokenHash,
      refreshTokenExpiresAt: {
        gt: new Date(),
      },
    },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      refreshTokenExpiresAt: newRefreshTokenExpiresAt,
    },
  });

  // If another request already rotated the token, reject this request
  if (updated.count !== 1) {
    throw new Error("Invalid refresh token");
  }

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout user using Refresh Token
export const logoutUser = async (refreshToken: string) => {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await prisma.user.updateMany({
    where: {
      refreshTokenHash,
    },
    data: {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    },
  });
};



