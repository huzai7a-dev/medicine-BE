import jwt from "jsonwebtoken";
import { signupSchema } from "../validations/auth";

const paginate = (totalCount: number, page: number, pageSize: number) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;

  return {
    currentPage: page,
    pageSize,
    totalRecords: totalCount,
    totalPages,
    hasMore,
  };
};

const getToken = (user: any) => {
  return jwt.sign({ ...user }, process.env.JWT_SECRET || "");
};

export { paginate, getToken };
