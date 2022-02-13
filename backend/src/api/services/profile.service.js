import prisma from "../../prisma.js";

const getUserAndProfileByID = async (ID) =>
  await prisma.user.findFirst({
    where: {
      ID,
    },
    select: {
      ID: true,
      email: true,
      name: true,
      profile: {
        select: {
          languages: true,
          resume: true,
          place: true,
          country: true,
          job: true,
          searching: true,
          avatar: true,
          content: true,
          email: true,
          phone: true,
          fb: true,
          vk: true,
          mv: true,
        },
      },
      companies: {
        select: {
          ID: true,
          name: true,
          logo: true,
        },
      },
      watchlist: {
        select: {
          title: true,
          close_at: true,
          closed: true,
          ID: true,
          company: {
            select: {
              logo: true,
            },
          },
        },
      },
    },
  });

const getProfileByID = async (ID) =>
  await prisma.user.findFirst({
    where: {
      ID,
    },
    select: {
      ID: true,
      email: true,
      name: true,
      profile: {
        select: {
          languages: true,
          resume: true,
          place: true,
          country: true,
          job: true,
          searching: true,
          avatar: true,
          content: true,
          email: true,
          phone: true,
          fb: true,
          vk: true,
          mv: true,
        },
      },
    },
  });

const updateByID = async (ID, data) => {
  const user = await prisma.user.update({
    where: {
      ID,
    },
    data: {
      profile: {
        update: data,
      },
    },
  });
  return user;
};

const getPageByOffset = async (skip, take, where) =>
  await prisma.profile.findMany({ skip, take, where });

const getCount = async (where) => await prisma.profile.count({ where });

export {
  getProfileByID,
  updateByID,
  getPageByOffset,
  getCount,
  getUserAndProfileByID,
};
