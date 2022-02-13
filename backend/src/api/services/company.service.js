import prisma from "../../prisma.js";

const getSeveralByID = async (ID) =>
  await prisma.company.findMany({
    where: {
      administrators: {
        some: {
          ID: ID,
        },
      },
    },
    select: {
      ID: true,
      logo: true,
      name: true,
      administrators: {
        select: {
          name: true,
          ID: true,
        },
      },
      country: true,
      address: true,
      offers: {
        select: {
          closed: true,
        },
      },
    },
  });

const createByID = async (ID, data) =>
  await prisma.company.create({
    data: {
      ...data,
      logo: "/logo/company-default.png",
      description: `Ni estas firmao okupanta pri ${data.industry}`,
      offers: {
        create: [],
      },
      administrators: {
        connect: { ID },
      },
    },
    select: {
      ID: true,
      logo: true,
      name: true,
      administrators: {
        select: {
          name: true,
          ID: true,
        },
      },
      country: true,
      address: true,
      offers: {
        select: {
          closed: true,
          close_at: true,
        },
      },
    },
  });

const removeByID = async (id) => {
  await prisma.offer.deleteMany({
    where: {
      company_ID: id,
    },
  });
  await prisma.company.delete({
    where: {
      ID: id,
    },
  });
};

const getByID = async (id) =>
  await prisma.company.findFirst({
    where: {
      ID: id,
    },
    select: {
      logo: true,
      name: true,
      industry: true,
      description: true,
      address: true,
      phone: true,
      email: true,
      country: true,
      address: true,
      created_at: true,
      administrators: {
        select: {
          ID: true,
          profile: {
            select: {
              user_name: true,
              avatar: true,
              created_at: true,
            },
          },
        },
      },
      // offers: {
      //   select: {
      //     ID: true,
      //     title: true,
      //     place: true,
      //     closed: true,
      //     close_at: true,
      //   },
      // },
    },
  });
const updateByID = async (id, changes) =>
  await prisma.company.update({
    where: {
      ID: id,
    },
    data: changes,
  });

const getAdministratorsByID = async (companyID) =>
  await prisma.company.findFirst({
    where: {
      ID: companyID,
    },
    select: {
      administrators: {
        select: {
          ID: true,
        },
      },
    },
  });

const getPageByOffset = async (skip, take, where) =>
  await prisma.company.findMany({
    skip,
    take,
    where,
    select: {
      ID: true,
      logo: true,
      name: true,
      industry: true,
      country: true,
      created_at: true,
      offers: {
        select: {
          closed: true,
        },
      },
      administrators: {
        select: {
          ID: true,
          name: true,
        },
      },
    },
  });

const getCount = async (where) => await prisma.company.count({ where });

const removeAdministratorByID = async (companyID, userID) =>
  await prisma.company.update({
    where: { ID: companyID },
    data: { administrators: { disconnect: { ID: userID } } },
  });

const addAdministratorByID = async (companyID, userID) =>
  await prisma.company.update({
    where: { ID: companyID },
    data: { administrators: { connect: { ID: userID } } },
  });

export {
  getSeveralByID,
  createByID,
  removeByID,
  getByID,
  updateByID,
  getAdministratorsByID,
  getPageByOffset,
  getCount,
  removeAdministratorByID,
  addAdministratorByID,
};
