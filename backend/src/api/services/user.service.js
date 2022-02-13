import prisma from "../../prisma.js";

const createUser = async (user, profile) =>
  await prisma.user.create({
    data: {
      ...user,
      profile: {
        create: profile,
      },
    },
  });

const createTemplate = async ({
  name,
  email,
  password,
  country,
  place,
  languages,
}) => {
  const user = {
    name,
    password,
    email,
    companies: {
      create: [],
    },
  };
  const profile = {
    content: "Bonvenon al mia profilo",
    email,
    avatar: "/avatar/user-default.png",
    country,
    place,
    languages,
  };
  return await createUser(user, profile);
};

const getCompaniesOfID = async (ID) =>
  await prisma.user.findFirst({
    where: { ID },
    select: {
      companies: {
        select: {
          ID: true,
        },
      },
    },
  });

const getBanAndConfirmed = async (ID) =>
  await prisma.user.findFirst({
    where: {
      ID,
    },
    select: {
      ban: true,
      confirmed: true,
    },
  });

const getPasswordByID = async (ID) =>
  await prisma.user.findFirst({
    where: {
      ID,
    },
    select: {
      password: true,
    },
  });

const getPasswordByEmail = async (email) =>
  await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      password: true,
    },
  });

const updatePassword = async (ID, password) =>
  await prisma.user.update({
    where: {
      ID,
    },
    data: {
      password,
    },
  });

const getCredentialsByEmail = async (email) =>
  await prisma.user.findFirst({
    where: { email },
    select: {
      confirmed: true,
      password: true,
      ID: true,
    },
  });

const makeVerifiedByEmail = async (email) =>
  await prisma.user.update({
    where: {
      email,
    },
    data: {
      confirmed: true,
    },
  });

const createPasswordToken = async (token, email) =>
  await prisma.passwordToken.create({
    data: {
      token,
      user: {
        connect: { email },
      },
    },
    select: {
      user: {
        select: {
          ID: true,
        },
      },
    },
  });

const deletePasswordTokenByID = async (id) =>
  await prisma.passwordToken.delete({
    where: {
      user_ID: id,
    },
    select: {
      token: true,
    },
  });

const countFollowed = async (id) =>
  await prisma.user.findFirst({
    where: {
      ID: id,
    },
    select: {
      _count: {
        select: {
          watchlist: true,
        },
      },
    },
  });

export {
  createTemplate,
  getBanAndConfirmed,
  getPasswordByID,
  getPasswordByEmail,
  updatePassword,
  getCredentialsByEmail,
  makeVerifiedByEmail,
  createPasswordToken,
  deletePasswordTokenByID,
  getCompaniesOfID,
  countFollowed,
  // addToWatchlistByID,
  // removeFromWatchlistByID,
};
